export default defineContentScript({
  matches: ["*://gemini.google.com/*"],
  runAt: "document_idle",
  main() {
    const params = new URLSearchParams(location.search);
    const prompt = params.get("prompt");
    if (!prompt) return;

    waitForInput()
      .then((el) => {
        fillInput(el, prompt);
        return waitForSendButton();
      })
      .then((btn) => {
        btn.click();
      })
      .catch(() => {});
  },
});

const INPUT_SELECTORS = [
  "rich-textarea div[contenteditable]",
  "div[contenteditable]",
  "textarea",
];

const SEND_BUTTON_SELECTORS = [
  'button[aria-label*="Send"]',
  'button[data-mat-icon-name="send"]',
  "button.send-button",
];

function findEnabledSendButton(): HTMLButtonElement | null {
  for (const sel of SEND_BUTTON_SELECTORS) {
    const el = document.querySelector<HTMLButtonElement>(sel);
    if (el && !el.disabled) return el;
  }
  return null;
}

export function waitForSendButton(timeout = 5000): Promise<HTMLButtonElement> {
  return new Promise((resolve, reject) => {
    const existing = findEnabledSendButton();
    if (existing) return resolve(existing);

    const mo = new MutationObserver(() => {
      const btn = findEnabledSendButton();
      if (btn) {
        mo.disconnect();
        clearTimeout(timer);
        resolve(btn);
      }
    });
    const timer = setTimeout(() => {
      mo.disconnect();
      reject(new Error("Gemini send button not found within timeout"));
    }, timeout);
    mo.observe(document.body ?? document.documentElement, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ["disabled"],
    });
  });
}

function waitForInput(): Promise<HTMLElement> {
  return new Promise((resolve, reject) => {
    for (const sel of INPUT_SELECTORS) {
      const el = document.querySelector<HTMLElement>(sel);
      if (el) return resolve(el);
    }
    const mo = new MutationObserver(() => {
      for (const sel of INPUT_SELECTORS) {
        const el = document.querySelector<HTMLElement>(sel);
        if (el) {
          mo.disconnect();
          clearTimeout(timeout);
          resolve(el);
          return;
        }
      }
    });
    const timeout = setTimeout(() => {
      mo.disconnect();
      reject(new Error("Gemini input not found within timeout"));
    }, 10_000);
    mo.observe(document.body ?? document.documentElement, {
      childList: true,
      subtree: true,
    });
  });
}

function fillInput(el: HTMLElement, text: string): void {
  if (el.isContentEditable) {
    el.focus();
    document.execCommand("insertText", false, text);
    return;
  }
  const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
    HTMLTextAreaElement.prototype,
    "value",
  )?.set;
  if (nativeInputValueSetter) {
    nativeInputValueSetter.call(el, text);
    el.dispatchEvent(new InputEvent("input", { bubbles: true, data: text }));
  }
}
