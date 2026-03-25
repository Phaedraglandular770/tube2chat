# Tube2Chat

Chrome extension that adds a "Summarize with Gemini" button under YouTube videos.

## Stack

- WXT (Chrome extension framework, MV3)
- TypeScript (strict mode)
- Vitest (unit tests)

## Quickstart

```bash
npm install
```

### Development (hot reload)

```bash
npm run dev
```

Then load the extension in Chrome: open `chrome://extensions`, enable Developer mode, click "Load unpacked" and select the `.output/chrome-mv3-dev/` folder.

### Build

```bash
npm run build
```

Output in `.output/chrome-mv3/`. Load as unpacked extension in Chrome.

### Tests

```bash
npm test
```

Runs Vitest. All tests must pass before committing.
