---
description: "Task list for Gemini button injection"
---

# Tasks: Gemini Button Injection

**Input**: Design documents from `/specs/002-gemini-button/`
**Prerequisites**: plan.md ✅ spec.md ✅ research.md ✅ data-model.md ✅ contracts/ ✅

**TDD**: Required by constitution (RED → GREEN → REFACTOR for every implementation task).

**Organization**: Tasks are grouped by user story to enable independent implementation
and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1, US2)

---

## Phase 1: Setup

**Purpose**: Confirm the scaffold baseline is clean before adding new files.

- [ ] T001 Run `npm test` and `npm run build` — both must exit cleanly (baseline check, no new code written here)

---

## Phase 2: Foundational — Utility Functions

**Purpose**: Implement the two pure utility functions used by both user stories. These MUST be tested and GREEN before any content script work begins.

**⚠️ CRITICAL**: No user story implementation can begin until this phase is complete.

### Tests for Foundational utilities ⚠️ Write FIRST — verify they FAIL before implementing

- [ ] T002 Write failing unit tests for `isYouTubeWatchPage` in `src/tests/url.test.ts`:
  - `isYouTubeWatchPage('https://www.youtube.com/watch?v=abc123')` → `true`
  - `isYouTubeWatchPage('https://www.youtube.com/feed/subscriptions')` → `false`
  - `isYouTubeWatchPage('https://www.youtube.com/channel/UCxyz')` → `false`
  - `isYouTubeWatchPage('https://www.youtube.com/watch')` → `false` (no `v=`)
  - `isYouTubeWatchPage('')` → `false`
- [ ] T003 [P] Write failing unit tests for `buildGeminiUrl` in `src/tests/prompt.test.ts`:
  - Result starts with `'https://gemini.google.com/app?prompt='`
  - Decoded prompt contains the input video URL
  - Decoded prompt contains `'introduction'`
  - Decoded prompt contains `'timestamps'` or `'horodatages'`
  - Decoded prompt contains `'conclusion'`
  - Decoded prompt contains `'français'`
  - Result has no raw spaces or newlines (is percent-encoded)
- [ ] T004 Run `npm test` — T002 and T003 tests MUST FAIL (confirm RED before implementing)

### Implementation for Foundational utilities

- [ ] T005 Implement `isYouTubeWatchPage(url: string): boolean` in `src/utils/url.ts` — use `URL` constructor + check `hostname.includes('youtube.com')` and `pathname === '/watch'` and `searchParams.has('v')`
- [ ] T006 [P] Implement `buildGeminiUrl(videoUrl: string): string` in `src/utils/prompt.ts` — hardcoded French prompt template with `{VIDEO_URL}` replaced by input, then `encodeURIComponent`
- [ ] T007 Run `npm test` — T002 and T003 tests MUST NOW PASS (GREEN)
- [ ] T008 REFACTOR `src/utils/url.ts` and `src/utils/prompt.ts` if needed — clarity, edge cases, no behaviour change

**Checkpoint**: Utility functions tested and GREEN — user story implementation can begin.

---

## Phase 3: User Story 1 — Button appears on YouTube video pages (Priority: P1) 🎯 MVP

**Goal**: A "Summarize with Gemini" button is injected below the YouTube player on `/watch?v=...` pages only. Injection is idempotent. Handles SPA navigation between videos.

**Independent Test**: Load extension in Chrome → navigate to a YouTube video → button appears below player. Navigate to youtube.com/feed → no button. Navigate back to a video → button re-appears.

### Tests for User Story 1 ⚠️ Write FIRST — verify they FAIL before implementing

- [ ] T009 Update `src/tests/content-script.test.ts`: add failing assertions that `defineContentScript` from `src/entrypoints/youtube.content/index.ts` has:
  - `matches` containing `'*://*.youtube.com/*'`
  - `runAt` equal to `'document_start'`

### Implementation for User Story 1

- [ ] T010 Add failing assertion to `src/tests/content-script.test.ts`: verify that navigating to a non-watch page removes `#tube2chat-btn` from DOM (i.e. calling the navigation handler with a non-watch URL removes the button if present) — confirm RED
- [ ] T011 Rewrite `src/entrypoints/youtube.content/index.ts` with full implementation:
  - `defineContentScript({ matches: ['*://*.youtube.com/*'], runAt: 'document_start', main(ctx) { ... } })`
  - `injectButton()`: guarded by `document.getElementById('tube2chat-btn')` check (idempotent)
  - `injectButton()` uses the fallback selector chain: `['ytd-watch-metadata #above-the-fold', '#above-the-fold', '#top-row.ytd-watch-metadata', '#primary.ytd-watch-flexy']`
  - `injectButton()` uses `MutationObserver` to wait for the anchor element if not yet in DOM
  - `ctx.addEventListener(window, 'yt-page-data-updated', ...)` — primary SPA navigation trigger
  - `ctx.addEventListener(window, 'wxt:locationchange', ...)` — fallback SPA navigation trigger
  - On each navigation event: check `isYouTubeWatchPage(location.href)` before injecting
  - Initial run on hard load if already on a watch page
  - Click handler: stub for now — `console.log('clicked')` (US2 will complete this)
- [ ] T012 Run `npm test` — T009 and T010 tests MUST NOW PASS (GREEN)
- [ ] T013 REFACTOR `src/entrypoints/youtube.content/index.ts` if needed
- [ ] T014 Manual validation: load extension → YouTube video page → button appears below player, no duplicate on repeated navigation, absent on non-video pages, disappears when navigating to /feed

**Checkpoint**: Button visible on YouTube video pages — US1 complete.

---

## Phase 4: User Story 2 — Click opens Gemini with pre-filled French prompt (Priority: P1)

**Goal**: Clicking the button opens `gemini.google.com/app?prompt=<encoded>` in a new tab. A content script on Gemini reads the `?prompt=` param and fills the input field with the structured French summary request. User sees the prompt ready to submit.

**Independent Test**: Click button on a YouTube video → new Gemini tab opens → French summary prompt is pre-filled in the Gemini input (not auto-submitted).

### Tests for User Story 2 ⚠️ Write FIRST — verify they FAIL before implementing

- [ ] T015 Write failing unit tests in `src/tests/gemini-content.test.ts`: assert that `defineContentScript` from `src/entrypoints/gemini.content/index.ts` has `matches` containing `'*://gemini.google.com/*'`

### Implementation for User Story 2

- [ ] T016 Create `src/entrypoints/gemini.content/index.ts`:
  - `defineContentScript({ matches: ['*://gemini.google.com/*'], runAt: 'document_idle', main() { ... } })`
  - Read `new URLSearchParams(location.search).get('prompt')` — if absent or empty, return early (no-op)
  - Wait for Gemini's input element to appear (try `rich-textarea div[contenteditable]` as primary, `textarea` as fallback — use `MutationObserver` to wait)
  - Inject prompt text via native `InputEvent`: set `element.value = promptText` then `element.dispatchEvent(new InputEvent('input', { bubbles: true, data: promptText }))`
  - MUST NOT auto-submit (no Enter key simulation)
- [ ] T017 Wire click handler in `src/entrypoints/youtube.content/index.ts`: replace `console.log` stub with `window.open(buildGeminiUrl(window.location.href), '_blank')`
- [ ] T018 Run `npm test` — T015 tests MUST NOW PASS (GREEN), full suite must stay green
- [ ] T019 REFACTOR `src/entrypoints/gemini.content/index.ts` and click handler if needed
- [ ] T020 Manual E2E validation:
  - Click button on a YouTube video → new tab opens on `gemini.google.com`
  - Prompt is pre-filled with intro/timestamps/conclusion structure in French containing the video URL
  - Prompt is NOT auto-submitted
  - Navigate to a different YouTube video and click again → Gemini opens with the new video's URL

**Checkpoint**: Full feature functional — US1 + US2 complete.

---

## Phase 5: Polish

- [ ] T021 Run full test suite `npm run test:run` — zero failures required
- [ ] T022 [P] Run `npm run build` — extension builds with no TypeScript errors, `manifest.json` lists both content scripts
- [ ] T023 Validate `quickstart.md` steps end-to-end (manual walkthrough) — explicitly verify in DevTools Network tab that clicking the button fires zero external network requests

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — start immediately
- **Foundational (Phase 2)**: Depends on Phase 1 — BLOCKS all user stories
- **US1 (Phase 3)**: Depends on Foundational (`isYouTubeWatchPage` used in content script)
- **US2 (Phase 4)**: Depends on Foundational (`buildGeminiUrl`) + US1 (click handler lives in youtube.content)
- **Polish (Phase 5)**: Depends on US1 + US2

### Within Each Phase

- Tests MUST be written (T002, T003, T009, T010, T015) and confirmed FAILING before implementation
- T004 (confirm RED) MUST run before T005/T006
- T007 (confirm GREEN) MUST follow T005/T006
- T012 (confirm GREEN) MUST follow T011
- T018 (confirm GREEN) MUST follow T016/T017

### Parallel Opportunities

- T002 and T003 can be written in parallel (different files)
- T005 and T006 can be implemented in parallel (different files)
- T020 and T021 can run in parallel (different commands)

---

## Implementation Strategy

### MVP (US1 only)

1. Phase 1: Baseline check
2. Phase 2: Utility functions (tests → implement → GREEN)
3. Phase 3: Button injection (test → implement → GREEN → manual)
4. **STOP and VALIDATE**: Button visible in Chrome, no duplicates, absent on non-video pages

### Full Delivery

1. MVP above
2. Phase 4: Click + Gemini content script (test → implement → GREEN → E2E manual)
3. Phase 5: Polish

---

## Notes

- `isYouTubeWatchPage` and `buildGeminiUrl` are pure functions — fully unit-testable without browser APIs
- Content script tests assert `defineContentScript` metadata (matches, runAt) — no DOM simulation needed for RED/GREEN
- The Gemini input selector may need to be discovered empirically at implementation time (T015) — `MutationObserver` handles timing
- `ctx.addEventListener` (WXT wrapper) must be used instead of raw `window.addEventListener` for automatic listener cleanup on context invalidation
- `wxt prepare` must have been run (`npm install` triggers `postinstall`) before writing any TS — `.wxt/` types must exist
