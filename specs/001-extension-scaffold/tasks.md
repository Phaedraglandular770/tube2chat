---
description: "Task list for extension scaffold"
---

# Tasks: Extension Scaffold

**Input**: Design documents from `/specs/001-extension-scaffold/`
**Prerequisites**: plan.md ✅ spec.md ✅ research.md ✅ data-model.md ✅

**TDD**: Required by constitution (RED → GREEN → REFACTOR for every implementation task).

**Organization**: Tasks are grouped by user story to enable independent implementation
and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1, US2, US3)

---

## Phase 1: Setup

**Purpose**: Initialize the WXT + TypeScript project base.

- [ ] T001 Initialize WXT project: run `npx wxt@latest init` in repo root, select TypeScript template, name `tube2chat`
- [ ] T002 Configure `wxt.config.ts` at repo root: set `srcDir: 'src'`, manifest `name`, `version`, `description`
- [ ] T003 [P] Configure `tsconfig.json` at repo root: extend `.wxt/tsconfig.json`, add `strict: true`, `moduleResolution: "Bundler"`
- [ ] T004 [P] Update `.gitignore`: ensure `dist/`, `.wxt/`, `node_modules/` are listed
- [ ] T005 [P] Add `engines` field to `package.json`: `"engines": { "node": ">=20" }` — documents required Node version per edge case in spec

---

## Phase 2: Foundational

**Purpose**: Configure Vitest — required before any user story can be tested (TDD gate).

**⚠️ CRITICAL**: No user story implementation can begin until Vitest is configured and `npm test` runs without error.

- [ ] T006 Install Vitest: `npm install -D vitest`
- [ ] T007 Create `vitest.config.ts` at repo root with `WxtVitest()` plugin from `wxt/testing/vitest-plugin`
- [ ] T008 Add `"test": "vitest"` script to `package.json`
- [ ] T009 Run `npm test` — must exit with no failures (empty suite is acceptable)

**Checkpoint**: `npm test` runs cleanly — user story implementation can begin.

---

## Phase 3: User Story 1 — Build and load extension in Chrome (Priority: P1) 🎯 MVP

**Goal**: A developer can run `npm run build` and load the extension in Chrome with no errors.

**Independent Test**: Load `dist/` as unpacked extension in Chrome → no errors in Extensions page.

### Tests for User Story 1 ⚠️ Write FIRST — verify they FAIL before implementing

- [ ] T010 [P] [US1] Write failing unit test in `src/tests/content-script.test.ts`: import `src/entrypoints/youtube.content/index.ts` and assert it exports a `defineContentScript` result with `matches` containing `'*://*.youtube.com/*'`
- [ ] T011 [P] [US1] Write failing unit test in `src/tests/background.test.ts`: assert `src/entrypoints/background.ts` can be imported without error

### Implementation for User Story 1

- [ ] T012 [US1] Create content script stub at `src/entrypoints/youtube.content/index.ts`: export `defineContentScript({ matches: ['*://*.youtube.com/*'], runAt: 'document_idle', main() {} })` — zero imports
- [ ] T013 [US1] Create service worker stub at `src/entrypoints/background.ts`: export `defineBackground(() => {})` — empty stub
- [ ] T014 [US1] Run `npm test` — T010 and T011 must now pass (GREEN)
- [ ] T015 [US1] Run `npm run build` — verify `dist/` is produced and `dist/manifest.json` declares `manifest_version: 3`
- [ ] T016 [US1] Manual validation: load `dist/` as unpacked extension in Chrome — verify no errors in `chrome://extensions`

**Checkpoint**: Extension builds and loads in Chrome — US1 complete.

---

## Phase 4: User Story 2 — Run the test suite (Priority: P2)

**Goal**: `npm test` runs and reports zero failures with a real test (not empty suite).

**Independent Test**: Run `npm test` → sees at least one passing test, zero failures.

### Implementation for User Story 2

- [ ] T017 [US2] Write placeholder smoke test in `src/tests/scaffold.test.ts`: `describe('scaffold', () => { it('test infrastructure is operational', () => { expect(true).toBe(true) }) })` — infrastructure smoke test, RED phase N/A
- [ ] T018 [US2] Run `npm test` — all tests pass including scaffold.test.ts

**Checkpoint**: Test suite operational with at least one passing test — US2 complete.

---

## Phase 5: User Story 3 — Dev mode with hot reload (Priority: P3)

**Goal**: `npm run dev` starts without errors and reflects file changes.

**Independent Test**: Run `npm run dev` → WXT starts Vite dev server, no error in terminal.

### Implementation for User Story 3

- [ ] T019 [US3] Run `npm run dev` and verify the WXT dev server starts without errors
- [ ] T020 [US3] Manual validation: modify `src/entrypoints/youtube.content/index.ts` (add/remove a comment), verify WXT triggers a reload without manual intervention

**Checkpoint**: Dev mode functional — US3 complete.

---

## Phase 6: Polish

- [ ] T021 Update `README.md` with quickstart commands: `npm install`, `npm run build`, `npm test`, `npm run dev`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — start immediately
- **Foundational (Phase 2)**: Depends on Phase 1 — BLOCKS all user stories
- **US1 (Phase 3)**: Depends on Foundational
- **US2 (Phase 4)**: Depends on Foundational (Vitest already configured)
- **US3 (Phase 5)**: Depends on US1 (extension must build before dev mode is meaningful)
- **Polish (Phase 6)**: Depends on all stories complete

### Within Each User Story

- Tests MUST be written (T010, T011) and confirmed FAILING before T012/T013
- T014 (run tests GREEN) MUST follow T012/T013
- T015/T016 (build + load) MUST follow T014

### Parallel Opportunities

- T003, T004, T005 can run in parallel (different files)
- T010 and T011 can run in parallel (different test files)

---

## Implementation Strategy

### MVP (User Story 1 only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (Vitest configured)
3. Complete Phase 3: US1 (build + load in Chrome)
4. **STOP and VALIDATE**: Extension loads in Chrome with no errors

### Incremental Delivery

1. Setup + Foundational → base ready
2. US1 → buildable extension (MVP)
3. US2 → test suite confirmed
4. US3 → dev mode confirmed

---

## Notes

- `wxt prepare` runs automatically after `npm install` to generate `.wxt/` types
- If `.wxt/` is missing, run `npx wxt prepare` before writing any TS
- The content script MUST have zero imports — constitution Principle V
- `dist/` and `.wxt/` are gitignored — never commit them
