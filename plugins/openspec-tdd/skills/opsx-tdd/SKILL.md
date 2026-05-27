---
name: opsx:tdd
description: Adds a TDD gate to OpenSpec — write REAL failing tests from a change's tests.md before implementation. Run after opsx:propose and before opsx:apply. Solid RED — never expect.fail placeholders.
license: MIT
compatibility: Requires the openspec CLI and a JS/TS test runner (vitest, jest, bun test, or node:test).
metadata:
  author: yuritoledo
  version: "2.0"
---

Convert a change's `tests.md` artifact into **real failing test files**. Confirms a *solid* RED
— tests that exercise the true contract and fail only because the implementation is missing —
before implementation begins. Never `expect.fail("TDD Red Phase")` placeholders: those prove
nothing, get fully rewritten at green, and leave the feature with zero real coverage while
`tests.md` happily shows every scenario checked off.

**Input**: Optionally specify a change name. If omitted, infer from conversation context or prompt.

**Steps**

0. **Discover project conventions** (do this first — never hardcode)

   This plugin runs in *any* repo. Detect the host project's testing setup, in priority order:

   1. **`.openspec-tdd.json`** at repo root, if present. Fields (all optional):
      ```jsonc
      {
        "testRunner": "npx vitest run",   // command to run a single test file
        "renderHelper": "@/test/render",  // import path for the project's custom render()
        "canonicalTest": "src/example.test.tsx", // a file to mirror for imports/mocks
        "testIdQuery": "getByTestId",     // how the project queries test ids
        "testFileGlob": "**/*.test.{ts,tsx}"
      }
      ```
   2. **`CLAUDE.md` / `AGENTS.md` / `.cursorrules`** — read for testing conventions, the
      canonical-reference test file, render-helper location, and selector rules.
   3. **`package.json`** — infer the runner from `scripts.test` / `devDependencies`
      (`vitest` → `npx vitest run`; `jest` → `npx jest`; `bun` → `bun test`; otherwise
      `node --test`). Infer React/Testing-Library presence from deps.
   4. **Fallback defaults** — bare `vitest`, plain testing-library render, `getByTestId`.

   Announce what you detected: "Runner: <cmd> · Render helper: <path|none> · Canonical ref: <file|none>".
   See `references/frameworks.md` for per-runner commands and `references/non-react.md` /
   `references/e2e.md` for non-component scenarios.

1. **Select the change**

   If a name is provided, use it. Otherwise:
   - Infer from conversation context
   - Auto-select if only one active change exists
   - If ambiguous, run `openspec list --json` and use **AskUserQuestion tool** to let user select

   Announce: "Using change: <name>"

2. **Read `tests.md`**

   Path: `openspec/changes/<name>/tests.md`

   If file does not exist:
   - Warn: "`tests.md` not found for change <name>. Was this change proposed with opsx:propose?"
   - Stop.

3. **Parse automated test scenarios**

   From the `## Automated` section, extract each scenario group:
   - `File:` — target test file path
   - `Describe:` — describe block name
   - `Scenarios:` — list of `it()` descriptions

   If no `## Automated` section exists, warn: "tests.md has no Automated section — nothing to
   write. Add scenarios to tests.md first." and stop.

   If `## Automated` exists but has zero scenarios, warn: "tests.md Automated section has no
   scenarios — nothing to write." and stop.

   Skip all entries under `## Manual` — no code generated for these.

4. **Write REAL failing tests** (solid RED, not forced fail)

   The goal is a *genuine* red: the test renders the real component, calls the real function,
   queries real `data-testid`s, and fails because the implementation does not exist yet.
   NOT `expect.fail(...)` placeholders.

   Before writing, gather concrete selectors and behavior from the change artifacts:
   - `openspec/changes/<name>/proposal.md` and `design.md` — component names, props,
     `data-testid` values, expected copy/values, API/mutation shapes.
   - The scenario text in `tests.md` itself.
   - Existing sibling code and the **canonical test reference** discovered in step 0.

   For each scenario group:
   - If the target file does not exist, create it using the conventions from step 0: the
     project's custom render/wrapper helper, `screen`, `userEvent`, and the shared mock setup —
     never a bare testing-library render for component tests when the project has a helper.
   - If a `describe` block with the exact name already exists, append `it()`s inside it.
     Otherwise append a new `describe` block.
   - For each scenario, write a **real test body**:
     - Render the component / invoke the unit under test (import it for real — if the module
       or export does not exist yet, that import failure IS a valid RED).
     - Query by real `data-testid`, role, or text — the exact selectors the implementation
       must satisfy. Use the project's `testIdQuery` convention.
     - Assert real outcomes: presence, values, call args, emitted state.
     - Drive interactions with `userEvent` where the scenario describes user action.
   - **`data-testid` contract:** when a scenario needs a testid that does not exist yet, pick
     the canonical name now and assert against it. The test defines the contract; `opsx:apply`
     must add that exact testid to make it GREEN. List every new testid in the step-7 report.
   - When a value is genuinely unknowable from the artifacts (e.g. exact copy) or a branch is
     unreachable under current config, assert the observable behavior instead — or mark the
     scenario `it.skip` with a one-line reason and note it as a behavior gap. Never pad with a
     forced fail.
   - Create the file at the `File:` path exactly as specified, relative to repo root.

5. **Run tests and confirm RED**

   Run the project's test runner (from step 0) against each written file. Where the runner
   supports it, filter per scenario by name (`-t "<scenario>"`).

   For each result:
   - If FAIL → confirm it fails for the **right reason**: missing element/testid, missing
     export/module, wrong value — i.e. the absent implementation. Capture the failure message.
     (A whole-suite collection error from a missing import is a valid solid RED.)
   - If FAIL for a wrong reason (typo, bad import path, malformed selector, missing mock) → fix
     the test and re-run. A red test must be a *correct* test failing only on missing impl.
   - If PASS → flag: "WARNING: '<scenario>' passes without implementation — already covered or
     the test asserts nothing real. Review before proceeding."

   Track per-test results (pass/fail + failure reason) to populate the report in step 7.

6. **Mark `tests` artifact done**

   ```bash
   openspec done tests --change "<name>"
   ```

   If the command fails because the `tests` artifact is not defined in the schema, skip
   silently. Any other error must be surfaced — do not suppress it.

7. **Report**

   ```text
   ## opsx:tdd complete — <change-name>

   **Runner:** <cmd>   **Render helper:** <path|none>
   **Tests written:** X
   **RED (expected):** X — each with its failure reason (missing testid/export/value)
   **Unexpected passes:** Y (review required)
   **New data-testid contract** (apply must implement these exact ids):
     - `<testid>` → <component/file>
   **Behavior gaps noted:** <scenarios skipped / asserting observable behavior only>
   **Manual checklist:** openspec/changes/<name>/tests.md → ## Manual
   ```

   Then: "Run `/opsx:apply` to implement tasks and make tests GREEN."

**Guardrails**
- Write REAL tests: real render/invoke, real selectors, real assertions. A red test must fail
  only because the implementation is missing — never `expect.fail(...)` placeholders.
- Every red must be a *correct* test failing for the *right* reason. Fix tests that fail on
  typos/bad imports/missing mocks before reporting RED.
- Component tests use the project's custom render/wrapper (step 0) and query by `data-testid`,
  not a bare testing-library render — when the project provides a helper.
- Never hardcode framework/runner/paths — discover them in step 0 for the host repo.
- New testids the test asserts against form a contract `opsx:apply` must satisfy — list them.
- Never modify existing passing tests.
- If a target file already has a `describe` block with the same name, append `it()`s inside it
  rather than duplicating the describe.
- Always run tests after writing — confirm RED for the right reason before reporting done.
- Stop and ask if `tests.md` is missing or has no parseable scenarios.
