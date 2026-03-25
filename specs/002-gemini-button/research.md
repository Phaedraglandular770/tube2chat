# Research: Gemini Button Injection

**Feature**: 002-gemini-button
**Date**: 2026-03-25

---

## Decision 1: Gemini prompt pre-filling strategy

**Decision**: Use a second content script targeting `gemini.google.com` that reads a `?prompt=` query parameter and injects the text into Gemini's input field via native DOM input events.

**Rationale**: `gemini.google.com` does not expose any native URL parameter for pre-filling prompts. The Gemini frontend is a complex SPA (Angular/Lit-based) that ignores unknown query params. The only working approach — used by every published extension doing this — is to run a content script on Gemini that reads the URL param on load and simulates native `input` / `InputEvent` DOM events so the framework registers the text as user-typed input.

**URL format used**:
```
https://gemini.google.com/app?prompt=<percent-encoded-prompt-text>
```

**Alternatives considered**:
- Native `?q=` or `?prompt=` param without a content script → rejected, does nothing; Gemini ignores unknown params.
- Chrome Omnibox / custom search engine → rejected, requires manual user setup, not a zero-friction UX.
- Google AI Studio URL seeding → rejected, different product, not `gemini.google.com`.

**Implication on architecture**: Two content scripts are required:
1. `youtube.content` — injects the button on YouTube watch pages.
2. `gemini.content` — runs on `gemini.google.com/app`, reads `?prompt=`, fills the input field.

This is Constitution-compliant: the Gemini content script does not scrape YouTube DOM, and no data leaves the browser except via the new tab URL.

---

## Decision 2: YouTube SPA navigation handling

**Decision**: Use `yt-page-data-updated` (YouTube's internal custom event) as the primary navigation trigger, backed up by WXT's `wxt:locationchange` for edge cases. Register listeners with `ctx.addEventListener` (WXT's auto-cleanup wrapper). Set `runAt: 'document_start'` to ensure listeners are attached before YouTube's scripts boot.

**Rationale**: YouTube is a SPA — navigating between videos does not trigger a full page reload. `yt-page-data-updated` fires after YouTube has applied new video data to the DOM, making it the safest event to read the new URL and re-inject the button. `wxt:locationchange` (WXT's History API wrapper) provides a fallback in case YouTube's events do not fire.

**Alternatives considered**:
- `yt-navigate-finish` → usable but `yt-page-data-updated` is more reliable (DOM is fully updated when it fires).
- `MutationObserver` as primary → rejected; too noisy and expensive; acceptable only as a DOM-readiness wait helper.
- `chrome.webNavigation.onHistoryStateUpdated` → rejected; lives in the service worker, requires a messaging round-trip, fires before new content renders.
- Raw `history.pushState` monkey-patch → unnecessary when WXT's `wxt:locationchange` does this cleanly.

---

## Decision 3: Button DOM injection anchor

**Decision**: Primary selector: `ytd-watch-metadata #above-the-fold`. Fallback chain: `['#above-the-fold', '#top-row.ytd-watch-metadata', '#primary-inner ytd-watch-metadata', '#primary.ytd-watch-flexy']`. Wait for the anchor with a `MutationObserver` if it is not yet in the DOM when the event fires.

**Rationale**: `ytd-watch-metadata #above-the-fold` is the most stable selector for the area directly below the player and above the description. It has been present since YouTube's 2022 redesign and is used by multiple production extensions. Inserting `afterend` of `#above-the-fold` places the button cleanly between the title/actions row and the description.

**Alternatives considered**:
- `#actions-inner` / `#top-level-buttons-computed` → rejected for this feature; placing the button alongside Like/Share creates visual confusion and risks conflict with YouTube's own UI.
- `#movie_player` → rejected; causes z-index and fullscreen issues.
- `ytd-video-primary-info-renderer` → rejected; deprecated since 2022 redesign.
- `setInterval` polling → rejected; use MutationObserver instead.

---

## Decision 4: Prompt template (French, hardcoded v1)

**Decision**: Use the following template, URL-encoded when passed as the `?prompt=` parameter:

```
Voici une vidéo YouTube : {VIDEO_URL}

Génère un résumé structuré en français avec :
1. Une introduction présentant le sujet et le contenu de la vidéo
2. Les points clés avec les timestamps correspondants
3. Une conclusion résumant les idées principales

Réponds entièrement en français.
```

**Rationale**: Directly addresses the spec requirements (intro + timestamps + conclusion, in French). The URL is embedded as plain text so Gemini can fetch the transcript natively via its YouTube integration.

**Alternatives considered**:
- Embedding the video title or metadata in the prompt → rejected; would require DOM scraping (Constitution Principle III violation).
- Dynamic language detection → deferred to v2 per spec.
