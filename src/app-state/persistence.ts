import type { FinalistSet, ProjectState } from "@/domain/types";

export const SHOTFORGE_PERSISTENCE_KEY = "shotforge-v2";
export const SHOTFORGE_PERSISTENCE_VERSION = 2;
export const STORAGE_KEY = SHOTFORGE_PERSISTENCE_KEY;

export interface PreviewFirstPersistedState {
  readonly project: ProjectState | null;
  readonly activeSlideIndex: number;
  readonly isExporting: boolean;
  readonly isGenerating: boolean;
  readonly generationProgress: number;
  readonly previewMode: boolean;
}

export interface PersistedShotforgeEnvelope {
  readonly state: PreviewFirstPersistedState;
  readonly version: typeof SHOTFORGE_PERSISTENCE_VERSION;
}

export interface LegacyPersistedShotforgeEnvelope {
  readonly state: {
    readonly project: ProjectState | null;
  };
  readonly version: 1;
}

export function createDefaultPersistedState(): PreviewFirstPersistedState {
  return {
    project: null,
    activeSlideIndex: 0,
    isExporting: false,
    isGenerating: false,
    generationProgress: 0,
    previewMode: false,
  };
}

export function createShotforgeStorage(): Storage {
  if (typeof window !== "undefined" && window.localStorage) {
    return window.localStorage;
  }

  const fallback = new Map<string, string>();
  return {
    get length() {
      return fallback.size;
    },
    clear() {
      fallback.clear();
    },
    getItem(key: string) {
      return fallback.get(key) ?? null;
    },
    key(index: number) {
      return [...fallback.keys()][index] ?? null;
    },
    removeItem(key: string) {
      fallback.delete(key);
    },
    setItem(key: string, value: string) {
      fallback.set(key, value);
    },
  };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isValidFinalistSet(value: unknown): value is FinalistSet {
  if (!isRecord(value)) {
    return false;
  }

  if (!Array.isArray(value.top3) || !Array.isArray(value.additional)) {
    return false;
  }

  if (typeof value.scoringVersion !== "string" || typeof value.generatedAt !== "string") {
    return false;
  }

  return [...value.top3, ...value.additional].every((finalist) => {
    return (
      isRecord(finalist) &&
      typeof finalist.id === "string" &&
      typeof finalist.rank === "number" &&
      Array.isArray(finalist.slides)
    );
  });
}

function isValidProjectState(value: unknown): value is ProjectState {
  if (!isRecord(value)) {
    return false;
  }

  if (
    typeof value.sessionId !== "string" ||
    typeof value.brand !== "string" ||
    typeof value.description !== "string" ||
    typeof value.brandColor !== "string" ||
    !Array.isArray(value.uploadedFiles) ||
    !isRecord(value.variants) ||
    typeof value.createdAt !== "string" ||
    typeof value.updatedAt !== "string"
  ) {
    return false;
  }

  if (!["create", "generate", "preview"].includes(String(value.step))) {
    return false;
  }

  if (
    typeof value.selectedFinalistId !== "undefined" &&
    value.selectedFinalistId !== null &&
    typeof value.selectedFinalistId !== "string"
  ) {
    return false;
  }

  if (typeof value.finalists !== "undefined" && value.finalists !== null && !isValidFinalistSet(value.finalists)) {
    return false;
  }

  return true;
}

export function isPersistedShotforgeEnvelope(
  value: unknown,
): value is PersistedShotforgeEnvelope {
  if (
    !isRecord(value) ||
    value.version !== SHOTFORGE_PERSISTENCE_VERSION ||
    !isRecord(value.state)
  ) {
    return false;
  }

  const state = value.state;

  return (
    (state.project === null || isValidProjectState(state.project)) &&
    typeof state.activeSlideIndex === "number" &&
    typeof state.isExporting === "boolean" &&
    typeof state.isGenerating === "boolean" &&
    typeof state.generationProgress === "number" &&
    typeof state.previewMode === "boolean"
  );
}

export function isLegacyShotforgePersistedEnvelope(
  value: unknown,
): value is LegacyPersistedShotforgeEnvelope {
  if (!isRecord(value) || value.version !== 1 || !isRecord(value.state)) {
    return false;
  }

  return value.state.project === null || isValidProjectState(value.state.project);
}

export function normalizePersistedState(value: unknown): PreviewFirstPersistedState {
  if (isPersistedShotforgeEnvelope(value)) {
    return value.state;
  }

  if (isLegacyShotforgePersistedEnvelope(value)) {
    return normalizePersistedState(value.state);
  }

  if (isRecord(value) && "project" in value) {
    return {
      project: isValidProjectState(value.project) ? value.project : null,
      activeSlideIndex: 0,
      isExporting: false,
      isGenerating: false,
      generationProgress: 0,
      previewMode: false,
    };
  }

  if (isRecord(value) && "activeSlideIndex" in value) {
    return {
      project: value.project && isValidProjectState(value.project) ? value.project : null,
      activeSlideIndex:
        typeof value.activeSlideIndex === "number" && Number.isFinite(value.activeSlideIndex)
          ? Math.max(0, Math.trunc(value.activeSlideIndex))
          : 0,
      isExporting: typeof value.isExporting === "boolean" ? value.isExporting : false,
      isGenerating: typeof value.isGenerating === "boolean" ? value.isGenerating : false,
      generationProgress:
        typeof value.generationProgress === "number" && Number.isFinite(value.generationProgress)
          ? value.generationProgress
          : 0,
      previewMode: typeof value.previewMode === "boolean" ? value.previewMode : false,
    };
  }

  return {
    project: null,
    activeSlideIndex: 0,
    isExporting: false,
    isGenerating: false,
    generationProgress: 0,
    previewMode: false,
  };
}

export function parsePersistedState(raw: string | null): PreviewFirstPersistedState | null {
  if (!raw) {
    return null;
  }

  try {
    return normalizePersistedState(JSON.parse(raw));
  } catch {
    return null;
  }
}

export function serializePersistedState(state: PreviewFirstPersistedState): string {
  return JSON.stringify({
    state,
    version: SHOTFORGE_PERSISTENCE_VERSION,
  } satisfies PersistedShotforgeEnvelope);
}

export function normalizeProjectState(project: ProjectState): ProjectState {
  return {
    ...project,
    finalists: project.finalists ?? null,
    selectedFinalistId: project.selectedFinalistId ?? null,
    selectedVariantId: project.selectedVariantId ?? null,
  };
}

export function migratePersistedState(
  persistedState: unknown,
  version: number,
): PreviewFirstPersistedState {
  if (version === SHOTFORGE_PERSISTENCE_VERSION && isPersistedShotforgeEnvelope({
    state: persistedState,
    version,
  })) {
    return normalizePersistedState(persistedState);
  }

  if (version === 1) {
    return normalizePersistedState((persistedState ?? {}) as LegacyPersistedShotforgeEnvelope["state"]);
  }

  return createDefaultPersistedState();
}

export function nextPersistedTimestamp(previous?: string): string {
  const now = new Date();
  const previousTime = previous ? Date.parse(previous) : Number.NaN;

  if (Number.isFinite(previousTime) && now.getTime() <= previousTime) {
    return new Date(previousTime + 1).toISOString();
  }

  return now.toISOString();
}
