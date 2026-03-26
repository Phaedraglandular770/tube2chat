<p align="center">
  <img src="src/public/icon/128.png" width="80" alt="Tube2Chat icon" />
</p>

<h1 align="center">Tube2Chat</h1>

<p align="center">
  Chrome extension that adds a <strong>Summarize with Gemini</strong> button on YouTube video pages.<br/>
  One click → Gemini opens with a structured French summary prompt pre-filled and auto-submitted.
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Chrome-MV3-4285f4?logo=googlechrome&logoColor=white" alt="Chrome MV3"/>
  <img src="https://img.shields.io/badge/TypeScript-strict-3178c6?logo=typescript&logoColor=white" alt="TypeScript"/>
  <img src="https://img.shields.io/badge/WXT-0.20-7c3aed?logo=vite&logoColor=white" alt="WXT"/>
  <img src="https://img.shields.io/badge/tests-26%20passing-22c55e?logo=vitest&logoColor=white" alt="Tests"/>
</p>

---

## How it works

1. Navigate to any YouTube video (`/watch?v=...`)
2. A **✦ Summarize with Gemini** button appears in the action bar (next to Like / Share)
3. Click → a new tab opens on `gemini.google.com` with a structured prompt pre-filled and auto-submitted:
   - Introduction
   - Key points with timestamps
   - Conclusion
   - All in **French**
4. Gemini fetches the transcript natively from the YouTube URL — no DOM scraping

> No data leaves the browser. No server. No telemetry.

---

## Stack

| Tool | Role |
|------|------|
| [WXT](https://wxt.dev) | Chrome extension framework (MV3) |
| TypeScript 5.x (strict) | Language |
| Vitest 4 | Unit tests |
| `wxt/testing` | Extension environment mocking |

---

## Quickstart

```bash
npm install
```

### Development (hot reload)

```bash
npm run dev
```

In Chrome:
1. Go to `chrome://extensions`
2. Enable **Developer mode**
3. Click **Load unpacked** → select `dist/chrome-mv3-dev/`

### Build

```bash
npm run build
# Output: dist/chrome-mv3/
```

### Tests

```bash
npm test          # watch mode
npm run test:run  # single run
```

---

## Project structure

```
src/
├── entrypoints/
│   ├── youtube.content/   # Injects button on YouTube watch pages
│   └── gemini.content/    # Fills prompt input on gemini.google.com
├── utils/
│   ├── url.ts             # isYouTubeWatchPage()
│   └── prompt.ts          # buildGeminiUrl()
├── tests/                 # Vitest unit tests
└── public/icon/           # Extension icons (16/32/48/96/128px)
scripts/
└── generate-icons.mjs     # Regenerate PNG icons from SVG
```

---

## Regenerate icons

```bash
node scripts/generate-icons.mjs
```

Requires `sharp` (already in devDependencies).
