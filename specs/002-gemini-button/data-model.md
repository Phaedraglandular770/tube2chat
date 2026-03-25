# Data Model: Gemini Button Injection

**Feature**: 002-gemini-button
**Date**: 2026-03-25

> This extension has no persistent storage. All data is transient, existing only during a single user interaction.

---

## Entities

### VideoUrl

The URL of the current YouTube watch page. Read once at click time from `window.location.href`.

| Field | Type | Description | Validation |
|-------|------|-------------|-----------|
| `href` | `string` | Full URL of the current YouTube page | Must match `/watch\?v=[\w-]+/` |
| `videoId` | `string` | The `v=` query parameter value | Non-empty string of URL-safe chars |

**State**: ephemeral — exists only during button click handler execution.

---

### GeminiPrompt

The structured text passed to Gemini to request the video summary.

| Field | Type | Description |
|-------|------|-------------|
| `videoUrl` | `string` | The full YouTube watch URL |
| `language` | `'fr'` | Target language (hardcoded `'fr'` in v1) |
| `text` | `string` | Final assembled prompt string |
| `encoded` | `string` | `encodeURIComponent(text)` — safe for URL params |

**State**: ephemeral — constructed on click, discarded after `window.open()`.

---

### GeminiTab

Represents the new browser tab opened pointing to Gemini.

| Field | Type | Description |
|-------|------|-------------|
| `url` | `string` | `https://gemini.google.com/app?prompt=<encoded>` |

**State**: ephemeral — constructed once, passed to `window.open()`.

---

## Data Flow

```
User clicks button
  │
  ▼
VideoUrl ← window.location.href (YouTube content script)
  │
  ▼
GeminiPrompt.text = template.replace('{VIDEO_URL}', videoUrl.href)
  │
  ▼
GeminiPrompt.encoded = encodeURIComponent(text)
  │
  ▼
GeminiTab.url = `https://gemini.google.com/app?prompt=${encoded}`
  │
  ▼
window.open(GeminiTab.url, '_blank')
  │
  ▼
Gemini content script reads ?prompt= → fills input field → user sees prompt
```

---

## No Persistent State

- No `localStorage`, `sessionStorage`, or `chrome.storage` usage.
- No cookies or IndexedDB.
- No cross-tab or cross-session data sharing.
