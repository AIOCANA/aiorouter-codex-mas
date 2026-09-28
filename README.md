# AIOrouter for Codex — `codex-aiorouter-mas`

> ## ⚠️ RETIRED — this plugin is no longer maintained. Use AIOrouter Gateway instead.
>
> The `codex-aiorouter-mas` plugin line has been **retired** (2026-09-28): the marketplace
> plugin is delisted, the `@aiorouter/codex-aiorouter-mas` npm package is **deprecated**,
> and this repository is **archived**. **AIOrouter Gateway** — an OpenAI-compatible API
> you reach with a base URL and an API key — is the recommended and supported path for
> Codex.
>
> 1. Create an AIOrouter API key at **https://dashboard.aiorouter.ca**.
> 2. Configure your client with base URL **`https://api.aiorouter.ca/v1`** and that key
>    as the API key.
> 3. Or run the one-line setup for your platform:
>
>    **Windows (PowerShell):**
>
>    ```powershell
>    irm https://www.aiorouter.ca/setup/install-codex.ps1 | iex
>    ```
>
>    **macOS / Linux:**
>
>    ```bash
>    curl -fsSL https://www.aiorouter.ca/setup/install-codex.sh | bash
>    ```
>
> Codex setup guide: **https://www.aiorouter.ca/codex-integration**
> Gateway setup guide: **https://www.aiorouter.ca/deepseek-harness-setup**

Route your **ChatGPT desktop app (Codex)** and **Codex CLI** to 15 AI models through
[AIOrouter](https://aiorouter.ca) (AIOCANA Technologies, Canada) — set up once, then just
say **"switch to &lt;model&gt;"** in chat.

## Recommended setup — AIOrouter Gateway

AIOrouter Gateway is an OpenAI-compatible API: set the base URL and authenticate with an
AIOrouter API key. No plugin is involved.

| Setting | Value |
|:---|:---|
| Base URL | `https://api.aiorouter.ca/v1` |
| API key | create one at https://dashboard.aiorouter.ca |
| Codex setup guide | https://www.aiorouter.ca/codex-integration |

**Windows (PowerShell):**

```powershell
irm https://www.aiorouter.ca/setup/install-codex.ps1 | iex
```

**macOS / Linux:**

```bash
curl -fsSL https://www.aiorouter.ca/setup/install-codex.sh | bash
```

Both scripts write the same `aiorouter` provider block into `~/.codex/config.toml`, then
store your key through `codex login --with-api-key` in `~/.codex/auth.json` (shared by the
desktop app and the CLI).

## Legacy (unmaintained): the Codex plugin

> **Everything below this heading describes the retired `codex-aiorouter-mas` plugin.**
> The marketplace plugin is delisted, the npm package is deprecated, and this repository
> is archived; the instructions are historical, unsupported, and no longer recommended.
> Use AIOrouter Gateway above.

### Install the plugin (one line)

```text
codex plugin marketplace add AIOCANA/aiorouter-codex-mas
codex plugin add codex-aiorouter-mas@aiorouter-codex-mas
```

Then set your key once (masked prompt; stored in `~/.codex/auth.json`, shared by app + CLI):

```bash
codex login --with-api-key        # get a key at https://dashboard.aiorouter.ca
```

That was it. New chats ran on AIOrouter; the onboarding hook configured the provider in
`~/.codex/config.toml` idempotently (it never touched your existing providers or
auth.json), the **model-switch skill** taught Codex "switch to X", and the **AIOrouter MCP
tools** (balance / usage / model catalog) came from the shared
[`@aiorouter/mcp`](https://www.npmjs.com/package/@aiorouter/mcp) package — set
`AIOROUTER_API_KEY` in your environment to enable them. (`@aiorouter/mcp` is a separate
package and is not part of this deprecation.)

### Two axes: chat model vs orchestration model

"Switch to X" changed the **direct-chat axis** — the model that answered you in Codex.
AIOrouter multi-agent (MAS) orchestration picked **execution models server-side** from
backend presets when a plan ran (the **plan axis**) — available as the companion CLI:
`npm install -g @aiorouter/codex-aiorouter-mas` (see below). The two axes were independent
and never overwrote each other. Switching your chat model never changed orchestration
behavior; orchestration never changed your chat model.

### Dual-track entry points

| You are a… | Use |
|:---|:---|
| Codex desktop / CLI user | AIOrouter Gateway — base URL `https://api.aiorouter.ca/v1` + API key |
| Codex MAS orchestration | ⚠️ retired — `@aiorouter/codex-aiorouter-mas` is deprecated |
| Claude Code user | AIOrouter Gateway routing — [AIOCANA/aiorouter-gateway](https://github.com/AIOCANA/aiorouter-gateway) |
| DSH user | AIOrouter Gateway — `irm https://www.aiorouter.ca/setup/install-dsh.ps1 \| iex` |

### MAS orchestrator CLI (`@aiorouter/codex-aiorouter-mas`) — deprecated

The companion command line turned one objective into a governed multi-agent run over the
Codex SDK: **plan → human approval → sandboxed execution → review → honest billing
reconciliation**.

```bash
npm install -g @aiorouter/codex-aiorouter-mas
set AIOROUTER_API_KEY=ak-…           # same key as above; env var, never a file
aiorouter-codex presets              # live model-matrix presets (free, non-billed)
aiorouter-codex cost                 # authoritative balance + spend (free, non-billed)
aiorouter-codex run "Implement a CLI that converts CSV files to JSON" --risk LOW
```

What it bought was **control**, not cost arbitrage: a versioned server-side model matrix
(displayed per run, never hardcoded here), a four-key human approval gate with a local
plan audit trail, risk-tiered review (LOW may skip; CRIT escalates to mixture-of-agents),
sandbox posture per role, and a visible `MAS · <model>` execution chip. A
plan→execute→review workflow made several model calls — for a simple task a single direct
call was usually cheaper, and we said so plainly.

### Coexistence with the script installer

The one-line script installer
(`irm https://aiorouter.ca/setup/install-codex.ps1 | iex` /
`curl -fsSL https://aiorouter.ca/setup/install-codex.sh | bash`) keeps working — that is now
the recommended path, and it is the only one still maintained. The retired plugin wrote
the same `aiorouter` provider block and was idempotent about the script's output.

## Key handling & rotation

- Your API key is stored only in `~/.codex/auth.json` (via `codex login --with-api-key`) or
  an env var you set yourself. **The installer and the retired plugin never echoed key
  material.**
- Rotate at https://dashboard.aiorouter.ca/keys , then re-run
  `codex login --with-api-key` and update `AIOROUTER_API_KEY` if you set it.

## Docs

- Full setup / troubleshooting: [SETUP.md](SETUP.md)
- Codex setup guide: https://www.aiorouter.ca/codex-integration
- Gateway setup guide: https://www.aiorouter.ca/deepseek-harness-setup
- Model catalog: https://aiorouter.ca/docs/model-catalog
- Support: support@aiorouter.ca · License: MIT
