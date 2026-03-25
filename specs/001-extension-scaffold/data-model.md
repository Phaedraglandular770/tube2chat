# Data Model: Extension Scaffold

**Branch**: `001-extension-scaffold` | **Date**: 2026-03-25

## Overview

This spec has no persistent data entities. The scaffold establishes project structure
and tooling only. No storage, no user data, no state.

## Configuration Entities

These are file-based configuration artifacts, not runtime data:

### wxt.config.ts
- `srcDir`: `'src'` — source root
- `manifest.name`: `'Tube2Chat'`
- `manifest.version`: `'0.0.1'`
- `manifest.description`: `'Summarize YouTube videos with Gemini'`

### vitest.config.ts
- Plugin: `WxtVitest()` from `wxt/testing/vitest-plugin`

### tsconfig.json
- Extends: `.wxt/tsconfig.json`
- `strict`: `true`
- `moduleResolution`: `'Bundler'`

## Entry Points (Stubs)

### Content Script — `src/entrypoints/youtube.content/index.ts`
- matches: `['*://*.youtube.com/*']`
- runAt: `'document_idle'`
- main: empty stub
- imports: **none** (constitution: zero external deps in content script)

### Service Worker — `src/entrypoints/background.ts`
- No listeners at scaffold stage
- Empty stub only

## Notes

Data entities and storage design will be introduced in spec 003 (Gemini prompt integration)
if needed. At scaffold stage, the extension has no runtime state.
