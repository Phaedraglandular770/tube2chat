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

const STYLES_ID = "tube2chat-styles";

function injectStyles(): void {
  if (document.getElementById(STYLES_ID)) return;
  const style = document.createElement("style");
  style.id = STYLES_ID;
  style.textContent = `
    #tube2chat-btn {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      margin: 12px 0 4px;
      padding: 10px 22px;
      border: none;
      border-radius: 24px;
      background: linear-gradient(135deg, #4285f4 0%, #7c3aed 35%, #db2777 70%, #f59e0b 100%);
      background-size: 300% 300%;
      color: #fff;
      font-family: 'Google Sans', 'Segoe UI', system-ui, sans-serif;
      font-size: 14px;
      font-weight: 500;
      letter-spacing: 0.015em;
      cursor: pointer;
      box-shadow: 0 2px 10px rgba(124, 58, 237, 0.35);
      transition: transform 0.2s ease, box-shadow 0.2s ease, filter 0.2s ease;
      animation: tube2chat-shimmer 5s ease infinite;
      white-space: nowrap;
      outline: none;
      -webkit-font-smoothing: antialiased;
    }
    @keyframes tube2chat-shimmer {
      0%   { background-position: 0%   50%; }
      50%  { background-position: 100% 50%; }
      100% { background-position: 0%   50%; }
    }
    #tube2chat-btn:hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 20px rgba(124, 58, 237, 0.55);
      filter: brightness(1.08);
    }
    #tube2chat-btn:active {
      transform: translateY(0px);
      box-shadow: 0 2px 8px rgba(124, 58, 237, 0.3);
      filter: brightness(0.95);
    }
    #tube2chat-btn:focus-visible {
      outline: 2px solid rgba(255, 255, 255, 0.7);
      outline-offset: 2px;
    }
  `;
  (document.head ?? document.documentElement).appendChild(style);
}

function doInject(anchor: Element): void {
  if (document.getElementById(BUTTON_ID)) return; // guard against race
  injectStyles();

  const btn = document.createElement("button");
  btn.id = BUTTON_ID;

  // Gemini 4-pointed star icon
  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svg.setAttribute("width", "16");
  svg.setAttribute("height", "16");
  svg.setAttribute("viewBox", "0 0 28 28");
  svg.setAttribute("fill", "none");
  svg.setAttribute("aria-hidden", "true");
  const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
  path.setAttribute(
    "d",
    "M14 0C14 7.73 7.73 14 0 14C7.73 14 14 20.27 14 28C14 20.27 20.27 14 28 14C20.27 14 14 7.73 14 0Z",
  );
  path.setAttribute("fill", "white");
  svg.appendChild(path);

  btn.appendChild(svg);
  btn.appendChild(document.createTextNode("Summarize with Gemini"));

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
