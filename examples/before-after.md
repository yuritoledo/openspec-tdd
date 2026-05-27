# Before / after — false red vs solid red

Same `tests.md` scenario. Two ways to write the red phase.

## ❌ Before — placeholder (false red)

```ts
import { describe, it, expect } from "vitest"

describe("ScheduleEdit", () => {
  it("renders the schedule trigger for a permitted user", () => {
    expect.fail("TDD Red Phase: Implementation missing")
  })
})
```

- Proves nothing — it would "fail" even if the contract were wrong.
- Gets fully **rewritten** at green, so the red phase bought you zero coverage.
- If someone forgets to come back, `tests.md` shows ✅ while the feature has **no real test**.

## ✅ After — solid red (this plugin)

```ts
import { render } from "@/test/render"     // ← discovered: project render helper
import { useAuthAtom } from "@/lib/atoms/auth"
import { describe, it, expect, vi, beforeEach } from "vitest"

import { ScheduleEdit } from "./schedule-edit" // ← does not exist yet → import = RED

vi.mock("@/lib/atoms/auth")

describe("ScheduleEdit", () => {
  beforeEach(() => vi.clearAllMocks())

  it("renders the schedule trigger for a permitted user", () => {
    vi.mocked(useAuthAtom).mockReturnValue({ isFriends: false } as never)
    const { screen } = render(<ScheduleEdit id="player-42" />)
    expect(screen.getByTestId("schedule-edit-trigger")).toBeInTheDocument()
  })
})
```

- Fails for the **right reason**: `./schedule-edit` / `schedule-edit-trigger` don't exist yet.
- Defines the `data-testid` contract `opsx:apply` must satisfy.
- Turns green by **implementing**, with **no test rewrite**.
- Guards against regressions from the first commit.

## What the gate reports

```text
## opsx:tdd complete — arms-930-player-schedule
Runner: npx vitest run   Render helper: @/test/render
Tests written: 17
RED (expected): 17 — Failed to resolve import "./schedule-edit"
Unexpected passes: 0
New data-testid contract (apply must implement these exact ids):
  - schedule-edit-trigger → schedule-edit.tsx
  - schedule-day-{mon..sun} → schedule-day-row.tsx
  - ...
```
