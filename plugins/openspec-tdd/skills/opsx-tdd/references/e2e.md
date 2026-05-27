# End-to-end (Playwright) scenarios

When a `tests.md` scenario is a full user flow (`File:` points into an `e2e/` / `tests/` spec
dir, or the project uses `@playwright/test`), write a real Playwright spec. Solid RED here = the
route/page/selectors don't exist yet, so navigation or a locator assertion fails.

```ts
import { test, expect } from "@playwright/test"

test("player can open and save a schedule", async ({ page }) => {
  await page.goto("/player-management")
  await page.getByTestId("schedule-edit-trigger").first().click()
  await expect(page.getByRole("dialog")).toBeVisible()
  await page.getByRole("button", { name: /save/i }).click()
  await expect(page.getByText(/schedule updated/i)).toBeVisible()
})
```

## Rules

- Select by `getByTestId` / `getByRole` — the same `data-testid` contract the component tests
  pin. Report the testids for `opsx:apply`.
- Honor the project's auth/setup conventions (storage state, fixtures, tenant cookies) — read
  the existing specs and any `CLAUDE.md` / `e2e` conventions doc.
- Run with `npx playwright test <file>` (or the project's script). A failed navigation or a
  not-found locator is a valid solid RED — never `expect.fail`.
- One spec = one user scenario. Don't split linked assertions across tests.
