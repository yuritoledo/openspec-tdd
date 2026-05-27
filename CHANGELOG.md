# Changelog

All notable changes to this project are documented here. Format follows
[Keep a Changelog](https://keepachangelog.com/); versioning is [SemVer](https://semver.org/).

## [2.0.0] - 2026-05-27

First public release.

### Added

- `opsx:tdd` skill — a test-first gate between `opsx:propose` and `opsx:apply` that writes
  **real failing tests** (real render/invoke, real `data-testid`s, real assertions) instead of
  `expect.fail("TDD Red Phase")` placeholders.
- Step 0 **project-convention discovery**: `.openspec-tdd.json` → `CLAUDE.md`/`AGENTS.md` →
  `package.json` → defaults. No hardcoded paths or runner — works in any repo.
- Reference docs: `references/frameworks.md` (vitest/jest/bun/node:test), `references/non-react.md`
  (pure-unit), `references/e2e.md` (Playwright).
- Solid-RED report includes the new `data-testid` contract for the apply phase and honest
  `it.skip` behavior gaps for unreachable branches.
- Distribution as a Claude Code plugin: `marketplace` `yuritoledo`, plugin `openspec-tdd`.
- Contract self-tests (`node --test`) and CI (manifest + markdown validation).

[2.0.0]: https://github.com/yuritoledo/openspec-tdd/releases/tag/v2.0.0
