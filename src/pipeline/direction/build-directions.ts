import type { CampaignBoard, NarrativeDirection, ProjectBrief, SequenceRoleAssignment, VariantId } from "@/domain/types";

const THESIS_BY_VARIANT: Record<VariantId, NarrativeDirection["thesis"]> = {
  clean: "clarity-first",
  midnight: "brand-signature-first",
  vivid: "campaign-first",
};

const PROMISE_BY_VARIANT: Record<VariantId, string> = {
  clean: "Make the product instantly legible.",
  midnight: "Make the product feel premium and deliberate.",
  vivid: "Make the product feel vivid, current, and memorable.",
};

const TENSION_BY_VARIANT: Record<VariantId, string> = {
  clean: "The app needs immediate clarity in the store.",
  midnight: "The product needs stronger perceived craft.",
  vivid: "The brand needs more memorability at a glance.",
};

const VISUAL_HYPOTHESIS_BY_VARIANT: Record<VariantId, string> = {
  clean: "editorial calm, clean framing, strong hierarchy",
  midnight: "cinematic depth, contrast, and premium glow",
  vivid: "brand-forward motion, tension, and energy",
};

function assignRoles(board: CampaignBoard): SequenceRoleAssignment[] {
  return board.framePlans.flatMap((frame) => {
    if (!frame.screenshotId) {
      return [];
    }

    return [{
      screenshotId: frame.screenshotId,
      role: frame.sequenceRole,
    }];
  });
}

export function buildNarrativeDirections(
  brief: ProjectBrief,
  board: CampaignBoard,
): Record<VariantId, NarrativeDirection> {
  const roleMap = assignRoles(board);

  return {
    clean: {
      id: `${brief.sessionId}-clean`,
      thesis: THESIS_BY_VARIANT.clean,
      promise: PROMISE_BY_VARIANT.clean,
      tension: TENSION_BY_VARIANT.clean,
      roleMap,
      visualHypothesis: `${VISUAL_HYPOTHESIS_BY_VARIANT.clean}; board: ${board.continuityStyle}`,
    },
    midnight: {
      id: `${brief.sessionId}-midnight`,
      thesis: THESIS_BY_VARIANT.midnight,
      promise: PROMISE_BY_VARIANT.midnight,
      tension: TENSION_BY_VARIANT.midnight,
      roleMap,
      visualHypothesis: `${VISUAL_HYPOTHESIS_BY_VARIANT.midnight}; board: ${board.continuityStyle}`,
    },
    vivid: {
      id: `${brief.sessionId}-vivid`,
      thesis: THESIS_BY_VARIANT.vivid,
      promise: PROMISE_BY_VARIANT.vivid,
      tension: TENSION_BY_VARIANT.vivid,
      roleMap,
      visualHypothesis: `${VISUAL_HYPOTHESIS_BY_VARIANT.vivid}; board: ${board.continuityStyle}`,
    },
  };
}
