import { isYouTubeWatchPage } from "../../utils/url";
import { buildGeminiUrl } from "../../utils/prompt";

const BUTTON_ID = "tube2chat-btn";
const ANCHOR_SELECTORS = [
  "ytd-watch-metadata #above-the-fold",
  "#above-the-fold",
  "#top-row.ytd-watch-metadata",
  "#primary.ytd-watch-flexy",
];

let pendingObserver: MutationObserver | null = null;

export function handleNavigation(url: string): void {
  if (isYouTubeWatchPage(url)) {
    injectButton();
  } else {
    removeButton();
  }
}

function removeButton(): void {
  // cancel any in-flight observer
  pendingObserver?.disconnect();
  pendingObserver = null;
  document.getElementById(BUTTON_ID)?.remove();
}

function findAnchor(): Element | null {
  for (const selector of ANCHOR_SELECTORS) {
    const el = document.querySelector(selector);
    if (el) return el;
  }
  return null;
}

function injectButton(): void {
  if (document.getElementById(BUTTON_ID)) return; // idempotent

  const anchor = findAnchor();
  if (!anchor) {
    // anchor not yet in DOM — wait for it
    pendingObserver = new MutationObserver(() => {
      const el = findAnchor();
      if (el) {
        pendingObserver?.disconnect();
        pendingObserver = null;
        doInject(el);
      }
    });
    const root = document.body ?? document.documentElement;
    pendingObserver.observe(root, { childList: true, subtree: true });
    return;
  }
  doInject(anchor);
}

function doInject(anchor: Element): void {
  if (document.getElementById(BUTTON_ID)) return; // guard against race
  const btn = document.createElement("button");
  btn.id = BUTTON_ID;
  btn.textContent = "Summarize with Gemini";
  btn.addEventListener("click", () => {
    window.open(buildGeminiUrl(window.location.href), "_blank");
  });
  anchor.insertAdjacentElement("afterend", btn);
}

export default defineContentScript({
  matches: ["*://*.youtube.com/*"],
  runAt: "document_start",
  main(ctx) {
    // Initial run on hard load
    if (isYouTubeWatchPage(location.href)) {
      injectButton();
    }

    // Primary: YouTube's own navigation event
    ctx.addEventListener(window, "yt-page-data-updated", () => {
      handleNavigation(location.href);
    });

    // Fallback: WXT's History API wrapper
    ctx.addEventListener(window, "wxt:locationchange", (event: Event) => {
      const e = event as CustomEvent<{ newUrl: string }>;
      handleNavigation(e.detail?.newUrl ?? location.href);
    });
  },
});
