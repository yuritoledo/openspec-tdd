# Non-React / pure-unit scenarios

Many `tests.md` scenarios target pure functions, hooks, services, reducers, or API clients —
no rendering. The solid-RED rule is identical: import the real unit and assert real behavior.
The RED comes from the module/export not existing yet, or the value being wrong.

## Pure function

```ts
import { describe, expect, it } from "vitest"
import { hhmmToMins } from "./time" // does not exist yet → import error = solid RED

describe("time helpers", () => {
  it('hhmmToMins parses "HH:MM" to minutes; null for empty', () => {
    expect(hhmmToMins("09:30")).toBe(570)
    expect(hhmmToMins("")).toBeNull()
  })
})
```

## Service / API client (mock the transport, assert the call + mapping)

```ts
import { describe, expect, it, vi } from "vitest"
import { fetchUser } from "./user-service"

vi.mock("./http", () => ({ get: vi.fn() }))

it("maps the wire payload to a User", async () => {
  const { get } = await import("./http")
  vi.mocked(get).mockResolvedValue({ data: { user_id: "u1", name: "Ada" } })
  expect(await fetchUser("u1")).toEqual({ id: "u1", name: "Ada" })
})
```

## Reducer / state machine

```ts
it("toggles open on TOGGLE", () => {
  expect(reducer({ open: false }, { type: "TOGGLE" })).toEqual({ open: true })
})
```

## Rules

- Import the real subject — a missing module/export is a valid solid RED.
- Assert concrete values, mapping, and call arguments — never `expect.fail`.
- Unreachable branch under current config (e.g. a compile-time const) → `it.skip` with a
  one-line reason and report it as a behavior gap. Do not fake-pass or fake-fail.
