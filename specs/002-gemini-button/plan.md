# Implementation Plan: Gemini Button Injection

**Branch**: `002-gemini-button` | **Date**: 2026-03-25 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/002-gemini-button/spec.md`

## Summary

Inject a "Summarize with Gemini" button below the YouTube video player (only on `/watch?v=...` pages). On click, build a structured French summary prompt containing the video URL and open `gemini.google.com/app?prompt=<encoded>` in a new tab. A second content script on `gemini.google.com` reads the `?prompt=` param and fills the Gemini input field via native DOM input events (no native URL-based pre-fill exists).

## Technical Context

**Language/Version**: TypeScript 5.x (strict mode)
**Primary Dependencies**: WXT 0.20+, Vitest 4+, `wxt/testing` (built-in)
**Storage**: N/A — no persistent state
**Testing**: Vitest with `wxt/testing` (fake browser environment)
**Target Platform**: Chrome MV3 (content scripts + service worker)
**Project Type**: Chrome extension
**Performance Goals**: Button appears within 1s of page load / navigation event
**Constraints**: Content script must be vanilla JS only (no npm packages, no frameworks) — Constitution Principle V
**Scale/Scope**: Single-user, single-tab interaction; no concurrency concerns

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Notes |
|-----------|--------|-------|
| I. Chrome MV3 Compliance | ✅ PASS | Content scripts + service worker stub only. No background pages. No deprecated APIs. |
| II. Zero Data Leakage | ✅ PASS | Video URL is embedded in the Gemini tab URL only — this is explicitly the intended data flow. No external server calls. No analytics. |
| III. URL Delegation — No DOM Scraping | ✅ PASS | Only `window.location.href` is read from YouTube. No transcript extraction. No DOM parsing for metadata. |
| IV. Test-First (TDD) | ✅ PASS | All tasks follow RED → GREEN → REFACTOR. Unit tests for `buildGeminiUrl` and `isYouTubeWatchPage` are written first. |
| V. Minimal Content Script Footprint | ✅ PASS | Both content scripts use vanilla JS only. No npm imports in content script logic. Button injection is idempotent (guarded by `id` check). |

**Post-design re-check**: ✅ All gates pass. Architecture (two content scripts + two utility modules) is the minimum needed for this feature. No complexity violations to document.

## Project Structure

### Documentation (this feature)

```text
specs/002-gemini-button/
├── plan.md              ← this file
├── research.md          ← Phase 0 output
├── data-model.md        ← Phase 1 output
├── quickstart.md        ← Phase 1 output
├── contracts/
│   └── internal-api.md  ← Phase 1 output
└── tasks.md             ← Phase 2 output (/speckit.tasks)
```

### Source Code

```text
src/
├── entrypoints/
│   ├── youtube.content/
│   │   └── index.ts          ← button injection + SPA nav handling
│   ├── gemini.content/
│   │   └── index.ts          ← reads ?prompt= and fills Gemini input
│   └── background.ts         ← existing stub, no changes
└── utils/
    ├── prompt.ts              ← buildGeminiUrl(videoUrl): string
    └── url.ts                 ← isYouTubeWatchPage(url): boolean

src/tests/
├── prompt.test.ts             ← unit tests for buildGeminiUrl
├── url.test.ts                ← unit tests for isYouTubeWatchPage
├── content-script.test.ts     ← existing (update: assert youtube.content matches)
├── background.test.ts         ← existing, unchanged
└── scaffold.test.ts           ← existing, unchanged
```

**Structure Decision**: Single-project layout. Two new content script entrypoints + two utility modules. No new directories beyond `src/utils/` which is standard WXT project layout.

## Complexity Tracking

> No Constitution violations — table intentionally empty.
