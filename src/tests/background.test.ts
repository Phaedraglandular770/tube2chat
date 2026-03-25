import { describe, it, expect } from "vitest";

describe("background service worker", () => {
  it("can be imported without error", async () => {
    const mod = await import("../entrypoints/background");
    expect(mod.default).toBeDefined();
  });
});
