# Contributing

Thanks for your interest in improving the AIOrouter Codex plugin!

## How changes work

- The plugin package structure is fixed: `.agents/plugins/marketplace.json` (marketplace manifest), `plugins/codex-aiorouter-mas/` (plugin root with `.codex-plugin/plugin.json`, `.mcp.json`, `hooks.json`, `skills/`).
- Every pull request runs the repository verify gate in CI (`node verify-codex-plugin-package.mjs`). If it fails, the change cannot merge.

## Hard rules (enforced by the gate)

1. **No secrets of any kind** — API keys, tokens, private keys, connection strings. Environment-variable *names* are fine; values are never.
2. **No internal or personal identifiers** — company-internal file paths, tooling directories, or personal account names/emails must not appear in this repository.
3. **No hard-coded model IDs in the skill** — model names come from the live catalog at `https://aiorouter.ca/docs/model-catalog`; the skill teaches the *procedure*, not a snapshot.
4. **Exact-pin discipline** — plugin name, marketplace name, and repository URL are pinned strings; changing one requires changing all references in the same PR.
5. **Two-axis narrative** — keep chat-model vs orchestration-model wording intact in README/SETUP/skill docs.

## Style

- Keep `SKILL.md` instructions safe: any step that edits user config must be idempotent, must back up once, and must never overwrite an existing backup.
- Documentation links must be public URLs.
