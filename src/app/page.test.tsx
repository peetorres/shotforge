/**
 * Create Page — Tests
 *
 * Covers: progressive disclosure, state gating, data passing, CTA behavior.
 * Maps to: REGRESSION_GUARDS for Create surface.
 */

// @vitest-environment jsdom
import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";

// Mock next/navigation
const mockPush = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush, replace: vi.fn() }),
}));

// Mock NavBar
vi.mock("@/components/shared/nav-bar", () => ({
  NavBar: ({ currentStep }: { currentStep: string }) => <nav data-testid="nav" data-step={currentStep} />,
}));

// Mock nanoid
vi.mock("nanoid", () => ({ nanoid: () => "test-session-id" }));

import CreatePage from "./page";

beforeEach(() => {
  vi.clearAllMocks();
  global.fetch = vi.fn().mockResolvedValue({
    ok: true,
    json: () => Promise.resolve({ filenames: ["screen1.png"] }),
  });
});

describe("Create page — initial render", () => {
  it("renders headline", () => {
    render(<CreatePage />);
    expect(screen.getByText("App Store screenshots")).toBeDefined();
    expect(screen.getByText("in one click")).toBeDefined();
  });

  it("renders App Name input and it is interactive", () => {
    render(<CreatePage />);
    const input = screen.getByPlaceholderText("Sensei") as HTMLInputElement;
    expect(input).toBeDefined();
    fireEvent.change(input, { target: { value: "Test" } });
    expect(input.value).toBe("Test");
  });

  it("all sections are visible (ghost structure — not hidden)", () => {
    render(<CreatePage />);
    expect(screen.getByText("App Name")).toBeDefined();
    expect(screen.getByText(/Description/)).toBeDefined();
    expect(screen.getByText("Screenshots")).toBeDefined();
    expect(screen.getByText("Brand Color")).toBeDefined();
  });

  it("CTA is visible but disabled initially", () => {
    render(<CreatePage />);
    const cta = screen.getByRole("button", { name: /Generate screenshots/i });
    expect(cta).toBeDefined();
    expect(cta).toBeDisabled();
  });

  it("shows helper text when empty", () => {
    render(<CreatePage />);
    expect(screen.getByText("Type your app name to start")).toBeDefined();
  });
});

describe("Create page — progressive activation", () => {
  it("description activates after typing app name", () => {
    render(<CreatePage />);
    const nameInput = screen.getByPlaceholderText("Sensei");
    const descTextarea = screen.getByPlaceholderText(/Gamified learning/i);

    // Before: muted
    expect(descTextarea.tabIndex).toBe(-1);

    // Type
    fireEvent.change(nameInput, { target: { value: "MyApp" } });

    // After: active
    expect(descTextarea.tabIndex).toBe(0);
  });

  it("helper text changes to screenshot prompt after name typed", () => {
    render(<CreatePage />);
    fireEvent.change(screen.getByPlaceholderText("Sensei"), { target: { value: "MyApp" } });
    expect(screen.getByText("Add screenshots to continue")).toBeDefined();
  });

  it("CTA stays disabled without screenshots", () => {
    render(<CreatePage />);
    fireEvent.change(screen.getByPlaceholderText("Sensei"), { target: { value: "MyApp" } });
    expect(screen.getByRole("button", { name: /Generate screenshots/i })).toBeDisabled();
  });
});

describe("Create page — completion micro-feedback", () => {
  it("App Name label shows checkmark when filled", () => {
    render(<CreatePage />);
    fireEvent.change(screen.getByPlaceholderText("Sensei"), { target: { value: "MyApp" } });
    const labels = document.querySelectorAll("label");
    const nameLabel = Array.from(labels).find((l) => l.textContent?.includes("App Name"));
    expect(nameLabel?.textContent).toContain("✓");
  });
});

describe("Create page — CTA wording", () => {
  it("uses 'Generate screenshots →' as CTA text", () => {
    render(<CreatePage />);
    expect(screen.getByText("Generate screenshots →")).toBeDefined();
  });
});

describe("Create page — nav integration", () => {
  it("renders NavBar with create step", () => {
    render(<CreatePage />);
    const nav = screen.getByTestId("nav");
    expect(nav.dataset.step).toBe("create");
  });
});
