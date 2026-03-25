# Quickstart: Extension Scaffold

## Prerequisites

- Node.js 20+
- Chrome (latest stable)
- npm 10+

## Setup

```bash
npm install
```

> Note: After install, WXT auto-runs `wxt prepare` to generate `.wxt/` types.
> If not, run: `npx wxt prepare`

## Development

```bash
npm run dev
```

WXT starts a Vite dev server and opens Chrome with the extension loaded automatically.
File changes trigger hot reload.

## Build

```bash
npm run build
```

Output in `dist/`. Load as unpacked extension in Chrome:
1. Open `chrome://extensions`
2. Enable "Developer mode"
3. Click "Load unpacked" → select `dist/`

## Tests

```bash
npm test
```

Runs Vitest. On a fresh scaffold, a placeholder test should pass.

## Validation

After loading the extension in Chrome:
- Extensions page shows "Tube2Chat" with no errors
- No red badges or warning icons
