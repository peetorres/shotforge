import type { RepairAction, ScoredSequence } from "@/domain/types";

function pushTarget(
  targets: Set<RepairAction["targets"][number]>,
  target: RepairAction["targets"][number],
): void {
  targets.add(target);
}

function buildRepairAction(sequence: ScoredSequence): RepairAction {
  const targets = new Set<RepairAction["targets"][number]>();
  const instructionFragments: string[] = [];

  for (const reason of sequence.reasons) {
    if (reason.includes("crop") || reason.includes("zoom") || reason.includes("detail moment")) {
      pushTarget(targets, "crop");
      pushTarget(targets, "screenshot");
      instructionFragments.push("promote a stronger focal crop and reassign the strongest screenshot to the impact slide");
    }

    if (
      reason.includes("text-only") ||
      reason.includes("hero beat") ||
      reason.includes("closing beat") ||
      reason.includes("too short") ||
      reason.includes("repetitive")
    ) {
      pushTarget(targets, "layout");
      instructionFragments.push("rebalance slide pacing so the sequence has a stronger hero, pause, and close");
    }

    if (
      reason.includes("readability") ||
      reason.includes("text-led") ||
      reason.includes("visual system") ||
      reason.includes("surface treatment")
    ) {
      pushTarget(targets, "typography");
      instructionFragments.push("tighten headline hierarchy and simplify copy weight so the message reads instantly");
    }

    if (
      reason.includes("surface treatment") ||
      reason.includes("visual tension") ||
      reason.includes("misaligned")
    ) {
      pushTarget(targets, "background");
      pushTarget(targets, "overlay");
      instructionFragments.push("adjust background and overlay treatment so the direction feels intentional and premium");
    }

    if (reason.includes("proof")) {
      pushTarget(targets, "screenshot");
      pushTarget(targets, "layout");
      instructionFragments.push("introduce a stronger proof slide with clearer outcome framing");
    }
  }

  if (targets.size === 0) {
    pushTarget(targets, "layout");
    pushTarget(targets, "crop");
    pushTarget(targets, "typography");
    instructionFragments.push("tighten hierarchy, improve crop focus, and simplify the text-image balance");
  }

  const deficit = 0.72 - sequence.overallScore;
  const priority = deficit >= 0.12 ? "high" : deficit >= 0.05 ? "medium" : "low";

  return {
    sequenceId: sequence.candidate.id,
    targets: Array.from(targets),
    instructions: Array.from(new Set(instructionFragments)).join("; "),
    priority,
  };
}

export function createRepairActions(sequences: ScoredSequence[]): RepairAction[] {
  return sequences
    .filter((sequence) => !sequence.accepted)
    .map(buildRepairAction);
}
