import type { SlideConfig } from "@appforge/screenshot-gen";

export const CONTRACT_NAMES = [
  "ProjectBrief",
  "ScreenshotAnalysis",
  "CampaignBoard",
  "NarrativeDirection",
  "SequenceCandidate",
  "ScoredSequence",
  "Finalist",
  "RepairAction",
  "FinalistSet",
] as const;

export type ContractName = (typeof CONTRACT_NAMES)[number];

export type NarrativeThesis =
  | "clarity-first"
  | "brand-signature-first"
  | "campaign-first";

export type CampaignFrameRole =
  | "hook"
  | "tension"
  | "mechanism"
  | "detail"
  | "proof"
  | "payoff";

export type CampaignFrameEnergy = "quiet" | "balanced" | "elevated" | "peak";
export type CampaignVisualWeight = "text-led" | "balanced" | "device-led" | "immersive";
export type CampaignContinuityCue = "open" | "pause" | "build" | "intensify" | "resolve";
export type CampaignSideBias = "left" | "right" | "center";

export type SequenceRole =
  | "hero"
  | "statement"
  | "feature"
  | "detail"
  | "proof"
  | "close";

export type AppStyle = "dark" | "light" | "bold";

export type LayoutFamily =
  | "editorial-single"
  | "split-canvas"
  | "stacked-story"
  | "gallery-led"
  | "device-led";

export type TypographyFamily =
  | "display-sans"
  | "editorial-serif"
  | "mono-accent"
  | "compact-sans";

export type BackgroundTreatment =
  | "derived-gradient"
  | "soft-glow"
  | "brand-fill"
  | "blurred-extraction"
  | "textured-layer";

export type FocalCropProfile =
  | "tight-hero"
  | "balanced-frame"
  | "contextual-wide"
  | "detail-closeup";

export type OverlayBehavior = "subtle-glass" | "strong-panel" | "edge-label" | "none";

export type RepairPriority = "low" | "medium" | "high";

export type RepairTarget =
  | "crop"
  | "screenshot"
  | "layout"
  | "typography"
  | "background"
  | "overlay";

export interface BoundingBox {
  readonly x: number;
  readonly y: number;
  readonly width: number;
  readonly height: number;
}

export interface ProjectScreenshot {
  readonly id: string;
  readonly filename: string;
  readonly width: number;
  readonly height: number;
  readonly mimeType?: string;
  readonly altText?: string;
}

export interface TechnicalQualityCheck {
  readonly code: string;
  readonly passed: boolean;
  readonly message?: string;
}

export interface ProjectBrief {
  readonly sessionId: string;
  readonly brand: string;
  readonly description: string;
  readonly screenshots: ProjectScreenshot[];
  readonly goals: string[];
  readonly audience: string;
  readonly brandColor?: string;
  readonly qualityChecks?: TechnicalQualityCheck[];
}

export interface ScreenshotAnalysis {
  readonly screenshotId: string;
  readonly focalElements: string[];
  readonly safeTextRegions: BoundingBox[];
  readonly unsafeTextRegions: BoundingBox[];
  readonly compositionDensity: number;
  readonly hierarchySignal: number;
  readonly colorSignals: string[];
  readonly proofSignals: string[];
  readonly emotionSignals: string[];
  readonly cropOpportunities: string[];
}

export interface CampaignFramePlan {
  readonly index: number;
  readonly role: CampaignFrameRole;
  readonly sequenceRole: SequenceRole;
  readonly screenshotId?: string;
  readonly energy: CampaignFrameEnergy;
  readonly visualWeight: CampaignVisualWeight;
  readonly continuityCue: CampaignContinuityCue;
  readonly preferredSide: CampaignSideBias;
  readonly objective: string;
}

export interface CampaignBoard {
  readonly id: string;
  readonly story: string;
  readonly continuityStyle: string;
  readonly framePlans: CampaignFramePlan[];
}

export interface SequenceRoleAssignment {
  readonly screenshotId: string;
  readonly role: SequenceRole;
}

export interface NarrativeDirection {
  readonly id: string;
  readonly thesis: NarrativeThesis;
  readonly promise: string;
  readonly tension: string;
  readonly roleMap: SequenceRoleAssignment[];
  readonly visualHypothesis: string;
}

export interface SequenceCandidate {
  readonly id: string;
  readonly briefId: string;
  readonly campaignBoardId: string;
  readonly directionId: string;
  readonly directionThesis: NarrativeThesis;
  readonly style: AppStyle;
  readonly orderedScreenshotIds: string[];
  readonly slides: SlideConfig[];
  readonly framePlans: CampaignFramePlan[];
  readonly layoutFamily: LayoutFamily;
  readonly typographyFamily: TypographyFamily;
  readonly backgroundTreatment: BackgroundTreatment;
  readonly focalCropProfile: FocalCropProfile;
  readonly overlayBehavior: OverlayBehavior;
  readonly slideRoles: SequenceRoleAssignment[];
}

export interface ScoreBreakdown {
  readonly premiumFeel: number;
  readonly hierarchyClarity: number;
  readonly screenshotFit: number;
  readonly distinctiveness: number;
  readonly narrativeCoherence: number;
  readonly textReadability: number;
  readonly brandFit: number;
  readonly conversionStrength: number;
}

export interface ScoredSequence {
  readonly candidate: SequenceCandidate;
  readonly scores: ScoreBreakdown;
  readonly overallScore: number;
  readonly accepted: boolean;
  readonly reasons: string[];
  readonly tier?: "aaa" | "premium-acceptable" | "rejected";
}

export interface FinalistScore {
  readonly premiumFeel: number;
  readonly hierarchyClarity: number;
  readonly screenshotFit: number;
  readonly distinctiveness: number;
  readonly narrativeCoherence: number;
  readonly textReadability: number;
  readonly brandFit: number;
  readonly conversionStrength: number;
  readonly overallScore: number;
  readonly tier: "aaa" | "premium-acceptable";
  readonly reasons: string[];
}

export interface Finalist {
  readonly id: string;
  readonly rank: number;
  readonly thesis: NarrativeThesis;
  readonly style: AppStyle;
  readonly backgroundTreatment: BackgroundTreatment;
  readonly typographySystem: TypographyFamily;
  readonly score: FinalistScore;
  readonly slides: SlideConfig[];
}

export interface RepairAction {
  readonly sequenceId: string;
  readonly targets: RepairTarget[];
  readonly instructions: string;
  readonly priority: RepairPriority;
}

export interface FinalistSet {
  readonly top3: Finalist[];
  readonly additional: Finalist[];
  readonly scoringVersion: string;
  readonly generatedAt: string;
}
