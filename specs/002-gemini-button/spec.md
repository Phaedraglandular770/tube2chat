# Feature Specification: Gemini Button Injection

**Feature Branch**: `002-gemini-button`
**Created**: 2026-03-25
**Status**: Draft
**Input**: User description: "Inject a Summarize with Gemini button under the YouTube video player, only on /watch?v=... pages. On click, read window.location.href and open gemini.google.com in a new tab with a pre-filled prompt: intro + key points with timestamps + conclusion, in French (hardcoded v1). No DOM scraping — URL passed to Gemini which handles transcription."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Button appears on video pages (Priority: P1)

A user watching a YouTube video sees a "Summarize with Gemini" button injected below the video player. The button is only visible on pages with a video (`/watch?v=...`) and never on other YouTube pages (home, subscriptions, search results, etc.).

**Why this priority**: Core entry point — without the button, the feature does not exist.

**Independent Test**: Navigate to a YouTube video page → button appears below the player. Navigate to youtube.com/feed → button is absent.

**Acceptance Scenarios**:

1. **Given** the user is on `youtube.com/watch?v=<id>`, **When** the page loads, **Then** a "Summarize with Gemini" button appears below the video player.
2. **Given** the user is on `youtube.com/feed/subscriptions`, **When** the page loads, **Then** no button is injected.
3. **Given** the button has already been injected, **When** the content script runs again, **Then** no duplicate button appears (idempotent injection).

---

### User Story 2 - Click opens Gemini with pre-filled prompt (Priority: P1)

When the user clicks the button, the extension reads the current video URL and opens `gemini.google.com` in a new tab with a structured prompt pre-filled asking for a French summary (intro + key points with timestamps + conclusion).

**Why this priority**: Core value delivery — this is the primary action the tool performs.

**Independent Test**: Click the button on any YouTube video → new tab opens on Gemini with the prompt pre-filled and auto-submitted.

**Acceptance Scenarios**:

1. **Given** the user clicks the button, **When** the click is processed, **Then** a new browser tab opens pointing to `gemini.google.com`.
2. **Given** the user clicks the button, **When** the new tab opens, **Then** the prompt contains the YouTube video URL.
3. **Given** the user clicks the button, **When** the new tab opens, **Then** the prompt requests: an introduction, key points with timestamps, and a conclusion, in French.
4. **Given** the user clicks the button, **When** the Gemini tab loads, **Then** the prompt is automatically submitted — the user sees the summary generating immediately without manual action.
5. **Given** the user navigates from one video to another, **When** they click the button on the second video, **Then** the prompt contains the second video's URL (not the first).

---

### Edge Cases

- What happens when the user is on a YouTube page with no video ID (e.g., `/channel/...`)? → Button must not appear.
- What happens if the user clicks the button multiple times rapidly? → Each click opens a new Gemini tab (no deduplication required for v1).
- What happens when YouTube performs a client-side navigation (SPA) from one video to another? → Button must re-inject correctly on the new video page.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The extension MUST inject a "Summarize with Gemini" button below the YouTube video player.
- **FR-002**: The button MUST only appear on pages whose URL matches `*://*.youtube.com/watch?v=*`.
- **FR-003**: The button injection MUST be idempotent — repeated script executions MUST NOT create duplicate buttons.
- **FR-004**: On button click, the extension MUST read the current page URL (`window.location.href`).
- **FR-005**: On button click, the extension MUST open `gemini.google.com` in a new tab with a pre-filled prompt that is automatically submitted — the user should see Gemini start generating the summary immediately.
- **FR-006**: The prompt MUST include the YouTube video URL so Gemini can retrieve the transcript.
- **FR-007**: The prompt MUST request a structured summary in French: introduction, key points with timestamps, conclusion.
- **FR-008**: The extension MUST NOT scrape or parse any YouTube DOM content beyond reading `window.location.href`.
- **FR-009**: The extension MUST NOT transmit any data to an external server — all data stays in the browser.
- **FR-010**: The prompt language MUST be hardcoded to French in v1 (no user-configurable setting).

### Key Entities

- **Video URL**: The full `window.location.href` of the current YouTube watch page — the only data extracted from the page.
- **Gemini Prompt**: A structured text string containing the video URL and instructions for the summary format and language.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: The button appears on every YouTube video page within 1 second of page load.
- **SC-002**: The button never appears on non-video YouTube pages (0 false positives).
- **SC-003**: Clicking the button always opens a new Gemini tab with the correct video URL in the prompt (100% accuracy).
- **SC-004**: No duplicate buttons appear regardless of how many times the content script executes on the same page.
- **SC-005**: The prompt consistently uses French and includes all three sections (intro, key points with timestamps, conclusion).

## Assumptions

- The user has a Google account and access to `gemini.google.com`.
- YouTube's HTML structure provides a stable enough anchor point to inject the button below the player; if not, a fallback position below the title is acceptable.
- Gemini does not expose a native URL parameter for pre-filling prompts. The extension uses a second content script on `gemini.google.com` that reads a `?prompt=` query parameter and injects the text via native DOM input events (simulated user input).
- Client-side navigation on YouTube (SPA) requires the content script to listen for URL changes and re-inject the button as needed.
- Firefox / Safari / Edge support is out of scope for v1 (Chrome only).
- Prompt language configurability is deferred to v2.
