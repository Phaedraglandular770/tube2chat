import { defineConfig } from "wxt";

// See https://wxt.dev/api/config.html
export default defineConfig({
  srcDir: "src",
  publicDir: "src/public",
  manifest: {
    name: "Tube2Chat",
    version: "0.0.1",
    description: "Summarize YouTube videos with Gemini",
  },
});
