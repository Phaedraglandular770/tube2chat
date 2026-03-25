# Internal Contracts: Gemini Button Injection

**Feature**: 002-gemini-button
**Date**: 2026-03-25

> No external API. Contracts here define the TypeScript interfaces and pure-function signatures that form the testable boundary between modules.

---

## `buildGeminiUrl(videoUrl: string): string`

**Location**: `src/utils/prompt.ts`

**Purpose**: Given a YouTube video URL, returns the full Gemini URL with the structured French summary prompt encoded as a query parameter.

**Signature**:
```typescript
export function buildGeminiUrl(videoUrl: string): string
```

**Contract**:
- Input: a non-empty string (the full YouTube watch URL)
- Output: a string starting with `https://gemini.google.com/app?prompt=`
- Output: the returned URL contains the input `videoUrl` somewhere in the decoded prompt
- Output: the returned URL contains the words `introduction`, `timestamps`, `conclusion` (French prompt structure)
- Output: `encodeURIComponent` is applied — no raw spaces or newlines in the URL
- Throws: never (defensive — if input is invalid, returns a best-effort URL)

**Test vectors**:
```
Input:  "https://www.youtube.com/watch?v=dQw4w9WgXcQ"
Output: starts with "https://gemini.google.com/app?prompt="
        decoded prompt contains "https://www.youtube.com/watch?v=dQw4w9WgXcQ"
        decoded prompt contains "introduction"
        decoded prompt contains "timestamps" or "horodatages"
        decoded prompt contains "conclusion"
```

---

## `isYouTubeWatchPage(url: string): boolean`

**Location**: `src/utils/url.ts`

**Purpose**: Returns `true` if the given URL is a YouTube video watch page.

**Signature**:
```typescript
export function isYouTubeWatchPage(url: string): boolean
```

**Contract**:
- `"https://www.youtube.com/watch?v=abc123"` → `true`
- `"https://youtu.be/abc123"` → `false` (short URLs not supported in v1)
- `"https://www.youtube.com/feed/subscriptions"` → `false`
- `"https://www.youtube.com/channel/UCxyz"` → `false`
- `"https://www.youtube.com/watch"` (no `v=`) → `false`
- Empty string → `false`

---

## `injectButton(anchorEl: Element): void`

**Location**: `src/entrypoints/youtube.content/index.ts`

**Purpose**: Injects the "Summarize with Gemini" button after the given anchor element. Idempotent.

**Contract**:
- If `document.getElementById('tube2chat-btn')` already exists → no-op, returns immediately.
- Creates a `<button id="tube2chat-btn">` element with text "Summarize with Gemini".
- Calls `anchorEl.insertAdjacentElement('afterend', button)`.
- On click: calls `buildGeminiUrl(window.location.href)` and calls `window.open(url, '_blank')`.

---

## Gemini Content Script Protocol

**Location**: `src/entrypoints/gemini.content/index.ts`

**Purpose**: On load of `gemini.google.com/app?prompt=...`, reads the `prompt` query parameter and fills the Gemini input field.

**Contract**:
- Matches: `['*://gemini.google.com/*']`
- On load: read `new URLSearchParams(location.search).get('prompt')`
- If param is empty or absent → no-op.
- If param is present: wait for the Gemini textarea/input to appear in the DOM, then dispatch a native `InputEvent` of type `input` with the prompt text to fill the field.
- MUST NOT submit the prompt automatically (user clicks Send themselves).
