# openspec-tdd

[![ci](https://github.com/yuritoledo/openspec-tdd/actions/workflows/ci.yml/badge.svg)](https://github.com/yuritoledo/openspec-tdd/actions/workflows/ci.yml)
[![license: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](./LICENSE)
![version](https://img.shields.io/badge/version-2.0.0-informational)

**Adds a TDD gate to [OpenSpec](https://github.com/Fission-AI/OpenSpec)** — a new `opsx:tdd`
command that sits between `opsx:propose` and `opsx:apply`.

OpenSpec generates BDD scenarios in `tests.md` but jumps straight to implementation — no
test-first step exists. This plugin adds one. And it does it with **real failing tests**, not
`expect.fail("TDD Red Phase")` placeholders.

## Why real red, not placeholder red

A naive TDD gate writes placeholder tests:

```ts
it("renders the schedule trigger for a permitted user", () => {
  expect.fail("TDD Red Phase: Implementation missing")
})
```

This is a **false red**. It proves nothing, gets fully rewritten at green, and — if anyone
forgets to come back — leaves the feature with *zero real coverage* while `tests.md` happily
shows every scenario checked off.

`openspec-tdd` writes a **solid red** instead:

```ts
it("renders the schedule trigger for a permitted user", () => {
  setup()
  const { screen } = render(<ScheduleEdit id={PLAYER_ID} />)
  expect(screen.getByTestId("schedule-edit-trigger")).toBeInTheDocument()
})
```

This fails for the *right* reason (the component / testid doesn't exist yet), defines the
`data-testid` contract `opsx:apply` must satisfy, and turns green by implementing — **no test
rewrite**. It guards against regressions from the very first commit.

## What you get

A new `opsx:tdd` skill that:
- reads the change's `tests.md`, `proposal.md`, `design.md`
- writes real render / invoke / `data-testid` / `userEvent` assertions
- runs the suite and confirms RED fails for the right reason (missing impl, not a typo)
- reports the new `data-testid` contract for the apply phase
- marks unreachable branches / unknowable values as honest `it.skip` gaps, never forced fails

## Install

```sh
# from GitHub
/plugin marketplace add yuritoledo/openspec-tdd
/plugin install openspec-tdd@yuritoledo

# or from a local clone
/plugin marketplace add ~/code/openspec-tdd
/plugin install openspec-tdd@yuritoledo
```

The skill is named `opsx:tdd`. It ships as a plugin skill, so it lives independently of your
project's `.claude/` and survives `openspec` CLI runs.

## Workflow

```text
opsx:propose  →  opsx:tdd (this — solid red)  →  opsx:apply (green)  →  opsx:verify
```

## Configuration

Zero config by default — the skill detects your test runner and conventions from
`CLAUDE.md`/`AGENTS.md` and `package.json` (vitest, jest, bun test, or node:test). To pin them,
drop a `.openspec-tdd.json` at your repo root (see [`examples/.openspec-tdd.json`](./examples/.openspec-tdd.json)):

```jsonc
{
  "testRunner": "npx vitest run",
  "renderHelper": "@/test/render",
  "canonicalTest": "src/components/example.test.tsx",
  "testIdQuery": "getByTestId"
}
```

## Docs

- [`examples/before-after.md`](./examples/before-after.md) — false red vs solid red, side by side
- Per-runner / non-React / e2e guidance lives in the skill's `references/`

## Contributing

See [`CONTRIBUTING.md`](./CONTRIBUTING.md). Core rule: keep it solid-RED, never hardcode a stack.

## License

[MIT](./LICENSE)
