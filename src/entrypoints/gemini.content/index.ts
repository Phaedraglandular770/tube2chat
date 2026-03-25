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
      })
      .catch(() => {});
  },
});

const INPUT_SELECTORS = [
  "rich-textarea div[contenteditable]",
  "div[contenteditable]",
  "textarea",
];

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
