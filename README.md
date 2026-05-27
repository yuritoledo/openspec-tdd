# openspec-tdd

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
/plugin install openspec-tdd@openspec-tdd

# or from a local clone
/plugin marketplace add ~/code/openspec-tdd
/plugin install openspec-tdd@openspec-tdd
```

The skill is named `opsx:tdd`. It ships as a plugin skill, so it lives independently of your
project's `.claude/` and survives `openspec` CLI runs.

## Workflow

```
opsx:propose  →  opsx:tdd (this — solid red)  →  opsx:apply (green)  →  opsx:verify
```

## License

MIT
