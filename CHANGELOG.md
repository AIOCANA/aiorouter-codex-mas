# Changelog

All notable changes to the AIOrouter Codex plugin are documented here.
Format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/); versioning follows [SemVer](https://semver.org/).

## [Unreleased]

## [0.1.1] - 2026-09-03

### Added
- README / SETUP: MAS orchestrator CLI announced — published to npm as `@aiorouter/codex-aiorouter-mas`
  (companion `aiorouter-codex` command line: plan → human approval → sandboxed execution → review →
  billing reconciliation; model matrix served live from backend presets).

### Changed
- Dual-track entry-point table now lists the orchestration lane alongside desktop/CLI routing.
- Copy alignment: plugin long description and the model-switch skill now state MAS orchestration is
  available via the companion CLI (previously "arrives in V2").

## [0.1.0] - 2026-09-01

### Added
- Codex plugin package (`codex-aiorouter-mas`) with marketplace manifest for one-line install.
- `aiorouter-model-switch` skill: guided model switching via the live model catalog (no hard-coded model IDs).
- AIOrouter MCP server declaration (`npx -y @aiorouter/mcp`, key via environment-variable passthrough).
- Idempotent first-run onboarding hook that adds the AIOrouter provider block to local Codex config (with one-time backup; never touches credentials).
- Publish gate `verify-codex-plugin-package.mjs` plus CI workflow.
- README / SETUP guides covering the plugin path, the script-installer path, and the two-axis model concept.
