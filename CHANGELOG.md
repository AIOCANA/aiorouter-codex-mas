# Changelog

All notable changes to the AIOrouter Codex plugin are documented here.
Format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/); versioning follows [SemVer](https://semver.org/).

## [0.1.0] - 2026-09-01

### Added
- Codex plugin package (`codex-aiorouter-mas`) with marketplace manifest for one-line install.
- `aiorouter-model-switch` skill: guided model switching via the live model catalog (no hard-coded model IDs).
- AIOrouter MCP server declaration (`npx -y @aiorouter/mcp`, key via environment-variable passthrough).
- Idempotent first-run onboarding hook that adds the AIOrouter provider block to local Codex config (with one-time backup; never touches credentials).
- Publish gate `verify-codex-plugin-package.mjs` plus CI workflow.
- README / SETUP guides covering the plugin path, the script-installer path, and the two-axis model concept.
