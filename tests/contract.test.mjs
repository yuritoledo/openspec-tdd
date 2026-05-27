// Contract tests for the openspec-tdd plugin package.
// Validates the manifests and the SKILL invariants that make it a "solid RED" gate.
// Run with: node --test

import assert from "node:assert/strict"
import { readFileSync } from "node:fs"
import { fileURLToPath } from "node:url"
import { dirname, join } from "node:path"
import { describe, it } from "node:test"

const root = join(dirname(fileURLToPath(import.meta.url)), "..")
const read = p => readFileSync(join(root, p), "utf8")
const json = p => JSON.parse(read(p))

const marketplace = json(".claude-plugin/marketplace.json")
const plugin = json("plugins/openspec-tdd/.claude-plugin/plugin.json")
const skill = read("plugins/openspec-tdd/skills/opsx-tdd/SKILL.md")

describe("manifests", () => {
  it("marketplace is the 'yuritoledo' namespace", () => {
    assert.equal(marketplace.name, "yuritoledo")
  })

  it("marketplace lists the openspec-tdd plugin with a local source", () => {
    const entry = marketplace.plugins.find(p => p.name === "openspec-tdd")
    assert.ok(entry, "openspec-tdd plugin entry missing")
    assert.equal(entry.source, "./plugins/openspec-tdd")
  })

  it("plugin manifest name + skills dir are correct", () => {
    assert.equal(plugin.name, "openspec-tdd")
    assert.equal(plugin.skills, "./skills/")
    assert.match(plugin.version, /^\d+\.\d+\.\d+$/)
  })

  it("plugin and root package versions agree", () => {
    assert.equal(plugin.version, json("package.json").version)
  })
})

describe("skill frontmatter", () => {
  it("is named opsx:tdd", () => {
    assert.match(skill, /^name:\s*opsx:tdd\s*$/m)
  })
})

describe("solid-RED invariants", () => {
  it("forbids expect.fail placeholders in a guardrail", () => {
    assert.match(skill, /never\s+`expect\.fail\(\.\.\.\)`\s+placeholders/i)
  })

  it("requires real render/invoke + real assertions", () => {
    assert.match(skill, /real render\/invoke/i)
  })

  it("discovers host project conventions instead of hardcoding", () => {
    assert.match(skill, /Discover project conventions/i)
    assert.match(skill, /\.openspec-tdd\.json/)
    assert.match(skill, /package\.json/)
  })

  it("does NOT ship a forced-fail template body", () => {
    // The anti-pattern may be *named*, but must never appear as an it(){...} template.
    const forcedTemplate = /it\([^)]*\)\s*=>\s*\{\s*expect\.fail\(/
    assert.ok(!forcedTemplate.test(skill), "skill embeds a forced-fail test template")
  })

  it("points at the framework / non-react / e2e references", () => {
    assert.match(skill, /references\/frameworks\.md/)
    assert.match(skill, /references\/non-react\.md/)
    assert.match(skill, /references\/e2e\.md/)
    // and those files exist
    read("plugins/openspec-tdd/skills/opsx-tdd/references/frameworks.md")
    read("plugins/openspec-tdd/skills/opsx-tdd/references/non-react.md")
    read("plugins/openspec-tdd/skills/opsx-tdd/references/e2e.md")
  })
})
