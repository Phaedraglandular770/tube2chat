// To test manually: load the dist/ folder as an unpacked extension at chrome://extensions
export default defineContentScript({
  matches: ["*://*.youtube.com/*"],
  runAt: "document_idle",
  main() {
    // stub — business logic added in spec 002
  },
});
