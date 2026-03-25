<!--
SYNC IMPACT REPORT
==================
Version change: placeholder → 1.0.0 (initial ratification)
Modified principles: all placeholders replaced
Added sections: Core Principles (I–V), Scope, Key Decisions, Governance
Templates updated:
  - plan-template.md: Constitution Check gates align ✅ (no change needed — gates reference this file)
  - spec-template.md: no structural changes needed ✅
  - tasks-template.md: TDD gate already present in Phase 3+ test tasks ✅
Deferred TODOs: none
-->

# Tube2Chat Constitution

> Auto-loaded at session start via `.claude/hooks/session-start.sh`.

## Core Principles

### I. Chrome MV3 Compliance (NON-NEGOTIABLE)

The extension MUST target Manifest V3 exclusively.
Background logic MUST use service workers — background pages are forbidden.
Any Chrome API used MUST be available in MV3 (no `chrome.extension.*` legacy APIs).
**Why**: MV2 extensions are being phased out by Google; building on MV3 from day one avoids a
full rewrite later.

### II. Zero Data Leakage (NON-NEGOTIABLE)

The extension MUST NOT transmit any data to an external server or backend.
No user data, video metadata, watch history, or URL must leave the browser except to open
a new tab pointing to `gemini.google.com`.
No analytics, telemetry, or crash-reporting SDKs are allowed.
**Why**: Privacy is the core promise of this tool. Any external call breaks user trust
and would require a privacy policy, consent flows, and potential GDPR compliance.

### III. URL Delegation — No DOM Scraping

The extension MUST NOT parse or scrape YouTube's DOM to extract transcripts.
It MUST read only `window.location.href` (the current video URL) from the YouTube page.
Transcript handling MUST be fully delegated to Gemini via the injected prompt.
**Why**: YouTube's DOM structure changes frequently and without notice. Scraping it produces
brittle, maintenance-heavy code. Gemini handles YouTube URLs natively — this is the
stable, correct abstraction boundary.

### IV. Test-First (NON-NEGOTIABLE)

TDD is mandatory: tests MUST be written and confirmed failing (RED) before any
implementation code is written.
The RED → GREEN → REFACTOR cycle MUST be strictly followed for every task.
A feature is not "done" until its tests pass and the implementation has been refactored.
**Why**: As a dojo project, TDD is the primary learning discipline. Skipping it defeats
the purpose.

### V. Minimal Content Script Footprint

The content script injected into YouTube pages MUST be vanilla JavaScript only.
No frontend frameworks (React, Vue, etc.) and no external npm packages are allowed in
the content script.
The button injection MUST be idempotent — repeated calls MUST NOT create duplicate buttons.
**Why**: Heavy content scripts slow down every YouTube page load for the user. The content
script does one thing (inject a button + read the URL) and must stay minimal.

## Scope

### In Scope

- Chrome extension (MV3) injecting a button on YouTube video pages
- Reading the current YouTube video URL from the active tab
- Opening `gemini.google.com` in a new tab with a pre-filled prompt
- Structured prompt template: intro + key points with timestamps + conclusion, in the
  video's language
- Unit tests for prompt construction and URL extraction logic

### Out of Scope

- Firefox / Safari / Edge support (Chrome only for v1)
- YouTube DOM scraping or transcript extraction (delegated to Gemini)
- Any backend, server, or cloud function
- User settings / configuration UI (prompt is hardcoded in v1)
- Support for YouTube Shorts or playlists (single video pages only)

## Key Decisions

| # | Decision | Rationale |
|---|----------|-----------|
| 1 | Gemini over ChatGPT | User's primary AI tool; same technical approach either way |
| 2 | URL-only injection (no transcript scraping) | Robustness — YouTube DOM is unstable |
| 3 | Vanilla JS content script, no bundler for content script | Minimal footprint, zero deps |
| 4 | New tab strategy (not sidebar/popup) | Simplest UX; avoids CSP issues with iframes |
| 5 | WXT over Vite+CRXJS | Less config, TS-first, faster iteration for a dojo project |

## Governance

This constitution supersedes all other coding conventions for this project.
Any amendment MUST increment the version (MAJOR for removals/redefinitions, MINOR for
additions, PATCH for clarifications) and update `LAST_AMENDED_DATE`.
All PRs MUST include a "Constitution Check" section verifying compliance.
Complexity violations (deviations from these principles) MUST be documented in the
plan.md Complexity Tracking table with explicit justification.

**Version**: 1.0.0 | **Ratified**: 2026-03-25 | **Last Amended**: 2026-03-25
