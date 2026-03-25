// @vitest-environment jsdom
import { describe, it, expect } from "vitest";

describe("youtube content script", () => {
  it("exports a defineContentScript with youtube.com matches", async () => {
    const mod = await import("../entrypoints/youtube.content/index");
    expect(mod.default).toBeDefined();
    // WXT's defineContentScript returns an object with a definition property
    // Check that it has the right matches for YouTube
    expect(mod.default.matches).toContain("*://*.youtube.com/*");
  });

  it("runAt should be document_start", async () => {
    const mod = await import("../entrypoints/youtube.content/index");
    expect(mod.default.runAt).toBe("document_start");
  });

  it("does not inject duplicate buttons on repeated navigation", async () => {
    const mod = await import("../entrypoints/youtube.content/index");
    // call handleNavigation twice with a watch URL
    mod.handleNavigation("https://www.youtube.com/watch?v=abc123");
    mod.handleNavigation("https://www.youtube.com/watch?v=abc123");
    // only one button should exist
    const buttons = document.querySelectorAll("#tube2chat-btn");
    expect(buttons.length).toBeLessThanOrEqual(1);
  });

  it("removes button when navigating to non-watch page", async () => {
    const mod = await import("../entrypoints/youtube.content/index");
    // plant a fake button
    const btn = document.createElement("button");
    btn.id = "tube2chat-btn";
    document.body.appendChild(btn);
    expect(document.getElementById("tube2chat-btn")).not.toBeNull();
    // navigate to non-watch page
    mod.handleNavigation("https://www.youtube.com/feed/subscriptions");
    // button must be gone
    expect(document.getElementById("tube2chat-btn")).toBeNull();
  });
});
