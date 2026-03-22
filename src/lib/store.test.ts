import { describe, it, expect } from "vitest";
import { createProjectStore } from "./store";

describe("createProjectStore", () => {
  it("initialises with empty state", () => {
    const store = createProjectStore();
    expect(store.getState().project).toBeNull();
  });

  it("setProject stores a project", () => {
    const store = createProjectStore();
    store.getState().setProject({
      id: "abc123", brand: "Sensei", description: "Gamified founder learning",
      brandColor: "#6366F1", style: "dark", slides: [], uploadedFiles: [],
      createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
    });
    expect(store.getState().project?.brand).toBe("Sensei");
  });

  it("updateSlide replaces the slide at index", () => {
    const store = createProjectStore();
    store.getState().setProject({
      id: "abc123", brand: "Test", description: "Test", brandColor: "#fff",
      style: "dark", slides: [{ type: "feature-single", headline: ["Old"], screenshot: "a.png" }],
      uploadedFiles: ["a.png"], createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
    });
    store.getState().updateSlide(0, { type: "feature-single", headline: ["New"], screenshot: "a.png" });
    expect(store.getState().project?.slides[0]).toMatchObject({ headline: ["New"] });
  });

  it("setActiveSlide updates activeSlideIndex", () => {
    const store = createProjectStore();
    store.getState().setActiveSlide(2);
    expect(store.getState().activeSlideIndex).toBe(2);
  });
});
