# Quickstart: Gemini Button Injection

## Prerequisites

- Node.js ≥ 20
- Chrome (latest)

## Setup

```bash
npm install
```

## Development

```bash
npm run dev
```

Then in Chrome:
1. Go to `chrome://extensions`
2. Enable **Developer mode**
3. Click **Load unpacked** → select `.output/chrome-mv3/`

Open any YouTube video → you should see a **"Summarize with Gemini"** button below the player.

## Tests

```bash
npm test          # watch mode
npm run test:run  # single run
```

Tests cover:
- `buildGeminiUrl()` — prompt construction and URL encoding
- `isYouTubeWatchPage()` — URL validation logic

## Key Files

| File | Role |
|------|------|
| `src/entrypoints/youtube.content/index.ts` | Injects button on YouTube watch pages |
| `src/entrypoints/gemini.content/index.ts` | Fills prompt input on Gemini |
| `src/utils/prompt.ts` | Builds the Gemini URL with encoded prompt |
| `src/utils/url.ts` | Validates YouTube watch page URLs |
| `src/tests/prompt.test.ts` | Unit tests for prompt builder |
| `src/tests/url.test.ts` | Unit tests for URL validator |

## Manual Test Flow

1. `npm run dev` → extension loaded in Chrome
2. Navigate to `youtube.com/watch?v=<any-id>`
3. Button "Summarize with Gemini" appears below the video
4. Click → new tab opens on `gemini.google.com` with the French summary prompt pre-filled
5. Navigate to `youtube.com/feed` → button must NOT appear
6. Navigate back to a video → button must re-appear (SPA navigation)
