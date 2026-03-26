// @vitest-environment jsdom
import { describe, it, expect, beforeEach } from "vitest";

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

  describe("waitForSendButton", () => {
    beforeEach(() => {
      document.body.innerHTML = "";
    });

    it("resolves immediately when an enabled send button is already in the DOM", async () => {
      const btn = document.createElement("button");
      btn.setAttribute("aria-label", "Send message");
      document.body.appendChild(btn);

      const { waitForSendButton } =
        await import("../entrypoints/gemini.content/index");
      const result = await waitForSendButton();
      expect(result).toBe(btn);
    });

    it("resolves when a matching button is added to the DOM after the call", async () => {
      const { waitForSendButton } =
        await import("../entrypoints/gemini.content/index");
      const promise = waitForSendButton();

      const btn = document.createElement("button");
      btn.setAttribute("aria-label", "Send message");
      document.body.appendChild(btn);

      await expect(promise).resolves.toBe(btn);
    });

    it("rejects after the timeout when no button appears", async () => {
      const { waitForSendButton } =
        await import("../entrypoints/gemini.content/index");
      await expect(waitForSendButton(50)).rejects.toThrow(
        "Gemini send button not found",
      );
    }, 2000);

    it("does not resolve while the only matching button is disabled", async () => {
      const btn = document.createElement("button");
      btn.setAttribute("aria-label", "Send message");
      btn.disabled = true;
      document.body.appendChild(btn);

      const { waitForSendButton } =
        await import("../entrypoints/gemini.content/index");
      await expect(waitForSendButton(50)).rejects.toThrow();
    }, 2000);
  });
});
