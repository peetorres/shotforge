/**
 * POST /api/generate-copy — Tests
 *
 * Maps to: RULE-G04, RULE-G06, API_CONTRACTS.md
 * RG-010: AI must never block user
 */

import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock the AI SDK before importing the route
vi.mock("@ai-sdk/anthropic", () => ({
  createAnthropic: () => () => "mocked-model",
}));

vi.mock("ai", () => ({
  generateText: vi.fn(),
}));

import { POST } from "./route";
import { generateText } from "ai";

const mockedGenerateText = vi.mocked(generateText);

function makeRequest(body: Record<string, unknown>) {
  return new Request("http://localhost/api/generate-copy", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

const validBody = {
  brand: "Sensei",
  description: "Gamified learning for founders",
  slideType: "hero",
  style: "dark",
  variantName: "Midnight",
};

beforeEach(() => {
  vi.clearAllMocks();
});

describe("POST /api/generate-copy", () => {
  it("returns AI-generated copy when available", async () => {
    mockedGenerateText.mockResolvedValueOnce({
      text: JSON.stringify({
        tagline: ["Your app, **elevated**"],
        badgeText: "NEW",
        bullets: ["Fast", "Smart", "Beautiful", "Reliable"],
      }),
    } as never);

    const res = await POST(makeRequest(validBody) as never);
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.tagline).toBeDefined();
    expect(data.contentOrigin).toBe("generated_by_ai");
  });

  it("RULE-G06: returns template fallback when AI fails", async () => {
    mockedGenerateText.mockRejectedValueOnce(new Error("API rate limited"));

    const res = await POST(makeRequest(validBody) as never);
    const data = await res.json();

    expect(res.status).toBe(200); // NOT 503 — user is never blocked
    expect(data.tagline).toBeDefined();
    expect(data.contentOrigin).toBe("template_fallback");
  });

  it("RULE-G06: returns template when AI returns invalid JSON", async () => {
    mockedGenerateText.mockResolvedValueOnce({
      text: "not valid json at all",
    } as never);

    const res = await POST(makeRequest(validBody) as never);
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.contentOrigin).toBe("template_fallback");
  });

  it("returns headline for feature-single slide type", async () => {
    mockedGenerateText.mockResolvedValueOnce({
      text: JSON.stringify({ headline: ["**Smart** learning"] }),
    } as never);

    const res = await POST(makeRequest({ ...validBody, slideType: "feature-single" }) as never);
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.headline).toBeDefined();
    expect(data.contentOrigin).toBe("generated_by_ai");
  });

  it("rejects invalid JSON body", async () => {
    const req = new Request("http://localhost/api/generate-copy", {
      method: "POST",
      body: "not json",
    });
    const res = await POST(req as never);
    expect(res.status).toBe(400);
  });
});
