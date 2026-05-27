# Test runner matrix

How to run a single test file (and a single scenario) per runner. The skill picks one in
step 0 — from `.openspec-tdd.json` → `package.json` → fallback.

| Runner | Detect (devDependency / script) | Run one file | Filter one scenario |
|---|---|---|---|
| **vitest** | `vitest` | `npx vitest run <file>` | `npx vitest run <file> -t "<name>"` |
| **jest** | `jest` | `npx jest <file>` | `npx jest <file> -t "<name>"` |
| **bun test** | `bun` / bun lockfile | `bun test <file>` | `bun test <file> -t "<name>"` |
| **node:test** | none of the above | `node --test <file>` | `node --test --test-name-pattern="<name>" <file>` |

## Import style by runner

- **vitest:** `import { describe, it, expect, vi } from "vitest"`. Mocks via `vi.mock`.
- **jest:** globals available; mocks via `jest.mock`. With ESM, prefer explicit imports.
- **bun test:** `import { describe, it, expect, mock } from "bun:test"`.
- **node:test:** `import { test, describe } from "node:test"` + `import assert from "node:assert/strict"`.

## Picking the canonical reference

A "canonical reference" is one existing, representative test file the new tests should mirror
for imports, render helper, and mock setup. Resolve in this order:

1. `.openspec-tdd.json` → `canonicalTest`
2. The file named in the host repo's `CLAUDE.md` / `AGENTS.md` as the testing pattern
3. The largest / most recently edited `*.test.tsx` near the target file
4. None — write minimal idiomatic imports for the detected runner

## React vs non-React

If Testing Library is present (`@testing-library/react` / `…/dom`), component scenarios use the
project's custom `render()` (see `renderHelper`) and `userEvent`. Otherwise treat scenarios as
pure-unit — see `non-react.md`.
