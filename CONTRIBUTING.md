# Contributing

Thanks for improving openspec-tdd.

## Dev loop

```sh
git clone https://github.com/yuritoledo/openspec-tdd
cd openspec-tdd
node --test        # contract tests
npx markdownlint-cli2 "**/*.md"
```

There is no build step — the plugin is a skill (Markdown) plus JSON manifests.

## What lives where

| Path | What |
|---|---|
| `plugins/openspec-tdd/skills/opsx-tdd/SKILL.md` | the skill itself |
| `plugins/openspec-tdd/skills/opsx-tdd/references/` | per-runner + non-react + e2e guidance |
| `plugins/openspec-tdd/.claude-plugin/plugin.json` | plugin manifest |
| `.claude-plugin/marketplace.json` | marketplace manifest |
| `tests/contract.test.mjs` | invariants that keep it "solid RED" |

## Ground rules

- **Keep it solid-RED.** Any change must preserve the core: real tests, never `expect.fail`
  placeholders. The contract tests enforce this — keep them green.
- **No hardcoded stacks.** The skill must discover the host project's runner/helpers (step 0),
  not assume one repo's layout.
- Bump `version` in **both** `plugin.json` and `package.json` together (a contract test checks
  they match), and add a `CHANGELOG.md` entry.

## Releasing

1. Update versions + CHANGELOG.
2. `git tag vX.Y.Z && git push --tags`
3. `gh release create vX.Y.Z --notes-from-tag` (or notes from the changelog section).
