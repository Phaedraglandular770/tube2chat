import { defineConfig } from "wxt";

// See https://wxt.dev/api/config.html
export default defineConfig({
  srcDir: "src",
  publicDir: "src/public",
  outDir: "dist",
  manifest: {
    name: "Tube2Chat",
    version: "0.0.1",
    description: "Summarize YouTube videos with Gemini",
  },
});
