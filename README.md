# AIOrouter for Codex — `codex-aiorouter-mas`

Route your **ChatGPT desktop app (Codex)** and **Codex CLI** to 20+ AI models through
[AIOrouter](https://aiorouter.ca) (AIOCANA Technologies, Canada) — install once, then just
say **"switch to &lt;model&gt;"** in chat.

## Install (one line)

```text
codex plugin marketplace add AIOCANA/aiorouter-codex-mas
codex plugin add codex-aiorouter-mas@aiorouter-codex-mas
```

Then set your key once (masked prompt; stored in `~/.codex/auth.json`, shared by app + CLI):

```bash
codex login --with-api-key        # get a key at https://dashboard.aiorouter.ca
```

That's it. New chats run on AIOrouter; the onboarding hook configures the provider in
`~/.codex/config.toml` idempotently (it never touches your existing providers or auth.json),
the **model-switch skill** teaches Codex "switch to X", and the **AIOrouter MCP tools**
(balance / usage / model catalog) come from the shared [`@aiorouter/mcp`](https://www.npmjs.com/package/@aiorouter/mcp)
package — set `AIOROUTER_API_KEY` in your environment to enable them.

## Two axes: chat model vs orchestration model

"Switch to X" changes the **direct-chat axis** — the model that answers you in Codex.
AIOrouter multi-agent (MAS) orchestration picks **execution models server-side** from
backend presets when a plan runs (the **plan axis**) — available today as the companion
CLI: `npm install -g @aiorouter/codex-aiorouter-mas` (see below).
The two axes are independent and never overwrite each other. Switching your chat model
never changes orchestration behavior; orchestration never changes your chat model.

## Dual-track entry points

| You are a… | Use |
|:---|:---|
| Codex desktop / CLI user | `codex plugin add codex-aiorouter-mas@aiorouter-codex-mas` (routing works out of the box; MAS orchestration via the companion CLI below) |
| Codex MAS orchestration | `npm install -g @aiorouter/codex-aiorouter-mas` — plan → approve → execute → review with server-side model matrix |
| Claude Code user | AIOrouter Gateway routing ([AIOCANA/aiorouter-gateway](https://github.com/AIOCANA/aiorouter-gateway)) |
| DSH user | `@aiorouter/dsh-aiorouter-mas` |

## MAS orchestrator CLI (`@aiorouter/codex-aiorouter-mas`)

The companion command line turns one objective into a governed multi-agent run over the
Codex SDK: **plan → human approval → sandboxed execution → review → honest billing
reconciliation**.

```bash
npm install -g @aiorouter/codex-aiorouter-mas
set AIOROUTER_API_KEY=ak-…           # same key as above; env var, never a file
aiorouter-codex presets              # live model-matrix presets (free, non-billed)
aiorouter-codex cost                 # authoritative balance + spend (free, non-billed)
aiorouter-codex run "Implement a CLI that converts CSV files to JSON" --risk LOW
```

What it buys is **control**, not cost arbitrage: a versioned server-side model matrix
(displayed per run, never hardcoded here), a four-key human approval gate with a local
plan audit trail, risk-tiered review (LOW may skip; CRIT escalates to mixture-of-agents),
sandbox posture per role, and a visible `MAS · <model>` execution chip. A plan→execute→review
workflow makes several model calls — for a simple task a single direct call is usually
cheaper, and we say so plainly.

## Coexistence with the script installer

The one-line script installer (`irm https://aiorouter.ca/setup/install-codex.ps1 | iex` /
`curl -fsSL https://aiorouter.ca/setup/install-codex.sh | bash`) keeps working and is
untouched by this plugin — both write the same `aiorouter` provider block, and each is
idempotent about the other's output. **The plugin is the recommended entry point** from
here on (marketplace updates, skills, hooks, MCP tools in one package).

## Key handling & rotation

- Your API key is stored only in `~/.codex/auth.json` (via `codex login --with-api-key`) or an
  env var you set yourself. **Nothing in this plugin ever writes, reads, or echoes key material.**
- Rotate at https://dashboard.aiorouter.ca/keys , then re-run `codex login --with-api-key`
  and update `AIOROUTER_API_KEY` if you set it.

## Docs

- Full setup / troubleshooting: [SETUP.md](SETUP.md)
- Model catalog: https://aiorouter.ca/docs/model-catalog
- Support: support@aiorouter.ca · License: Apache-2.0
