import { describe, expect, it } from "vitest";

import { createVariants } from "@/domain/variant";

import { buildSeedFinalistSet } from "./seed-finalists";

describe("buildSeedFinalistSet", () => {
  it("builds a top3 finalist set from deterministic variants", () => {
    const variants = createVariants(
      ["screen1.png", "screen2.png", "screen3.png"],
      "Sensei",
      "#6366F1",
    );

    const finalists = buildSeedFinalistSet({
      sessionId: "sess_123",
      variants,
    });

    expect(finalists.top3).toHaveLength(3);
    expect(finalists.additional).toHaveLength(0);
    expect(finalists.top3.map((finalist) => finalist.thesis)).toEqual([
      "clarity-first",
      "brand-signature-first",
      "campaign-first",
    ]);
  });
});
