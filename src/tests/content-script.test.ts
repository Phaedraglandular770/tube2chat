import { describe, it, expect } from "vitest";

describe("youtube content script", () => {
  it("exports a defineContentScript with youtube.com matches", async () => {
    const mod = await import("../entrypoints/youtube.content/index");
    expect(mod.default).toBeDefined();
    // WXT's defineContentScript returns an object with a definition property
    // Check that it has the right matches for YouTube
    expect(mod.default.matches).toContain("*://*.youtube.com/*");
  });
});
