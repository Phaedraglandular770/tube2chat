import { describe, it, expect } from "vitest";

describe("gemini content script", () => {
  it("exports a defineContentScript targeting gemini.google.com", async () => {
    const mod = await import("../entrypoints/gemini.content/index");
    expect(mod.default).toBeDefined();
    expect(mod.default.matches).toContain("*://gemini.google.com/*");
  });

  it("has runAt document_idle", async () => {
    const mod = await import("../entrypoints/gemini.content/index");
    expect(mod.default.runAt).toBe("document_idle");
  });
});
