import { describe, expect, it } from "vitest";

import { createVariants } from "@/domain/variant";
import { buildSeedFinalistSet } from "@/pipeline/curation/seed-finalists";

describe("buildSeedFinalistSet", () => {
  it("curates the current variant system into three ranked finalists", () => {
    const variants = createVariants(
      ["screen-1.png", "screen-2.png", "screen-3.png"],
      "Sensei",
      "#6366F1",
    );

    const finalists = buildSeedFinalistSet({
      sessionId: "session_123",
      variants,
    });

    expect(finalists.top3).toHaveLength(3);
    expect(finalists.additional).toHaveLength(0);
    expect(finalists.top3.map((finalist) => finalist.id)).toEqual(
      expect.arrayContaining(["seed-clean", "seed-midnight", "seed-vivid"]),
    );
    expect(finalists.top3[0]?.score.overallScore).toBeGreaterThanOrEqual(0.85);
  });
});
