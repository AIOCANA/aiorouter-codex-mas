# ChatGPT / Codex Setup — Say "switch to X" to Change Models

> **Applies to:** ChatGPT desktop app (Codex), Codex CLI + AIOrouter
> **Result:** one-line plugin install → your AIOrouter key works in the app
> and CLI → **say "switch to X"** in the chat and the AI switches your model for you
> (verified in-app, new chats use the new model immediately — no restart needed).

---

## Before you start (Prerequisites)

1. **Register + get an API key** at [dashboard.aiorouter.ca](https://dashboard.aiorouter.ca)
   — new accounts get a free 7-day trial. AIOrouter is a **paid service — no free tier**
   beyond the trial; keys are issued after activation.
2. Install the **ChatGPT desktop app** (Windows/macOS) **or** the **Codex CLI**
   (`codex --version`, v0.146+ recommended).
3. ⚠️ **Quit the ChatGPT/Codex app completely** before first-time setup (including the tray
   icon) — a background app can overwrite `~/.codex/auth.json` right after you write your
   AIOrouter key. If unsure: **reboot Windows** and don't start the app before setup.

---

## Option 0 — Plugin install (recommended)

```text
codex plugin marketplace add AIOCANA/aiorouter-codex-mas
codex plugin add codex-aiorouter-mas@aiorouter-codex-mas
```

Then, in a terminal:

```bash
codex login --with-api-key        # paste your key once — stored in ~/.codex/auth.json
```

The plugin:
1. Installs the **AIOrouter model-switch SKILL** — after relaunch, just say **"switch to X"**.
2. Registers an idempotent **onboarding hook** that adds the `aiorouter` provider block to
   `~/.codex/config.toml` at next session start (never touches existing providers, model
   settings, or auth.json contents; backs up config.toml once before its first write).
3. Exposes the **AIOrouter MCP tools** (balance / usage / model catalog) via the shared
   `@aiorouter/mcp` package — set `AIOROUTER_API_KEY` in your environment to enable them.

**The key is never written into `config.toml` and never echoed.**

---

## Option 1 — Script installer (still supported)

- **Windows (PowerShell):** `irm https://aiorouter.ca/setup/install-codex.ps1 | iex`
- **macOS / Linux:** `curl -fsSL https://aiorouter.ca/setup/install-codex.sh | bash`

Same provider block, masked key prompt, SKILL install. Coexists with the plugin (each is
idempotent about the other's output).

---

## Option 2 — One prompt (AI does the setup)

Paste the prompt from
[codex-install-prompt.md](https://github.com/AIOCANA/aiorouter-gateway/blob/main/one-prompt/codex-install-prompt.md)
into the ChatGPT/Codex chat. The AI sets up your key (never pasted into the chat), writes
`~/.codex/config.toml`, installs the SKILL, and guides you through restart + verification.

---

## Switching models — say "switch to X"

Open a new chat and say:

> **"switch to qwen3.7-max"** (or any model slug from the catalog)

The AI (via the SKILL) edits exactly one `model =` line in `~/.codex/config.toml`
(after backing it up), verifies the change, and confirms. **New chats use the new
model immediately — no restart needed** (verified in-app, 2026-08-09).

Supported triggers: "switch to / change to / use <model>".

**Fallbacks if you don't want the SKILL:**
- CLI per-run: `codex exec -m <model> "your prompt"`
- Manual: uncomment exactly ONE `model = "..."` line in `~/.codex/config.toml`
  (quit the app first so it doesn't overwrite the file while running).

> ⚠️ The app's model menu is OpenAI-limited (hardcoded) — do NOT use it to switch;
> say "switch to X" in the chat instead (or edit `config.toml` manually with the app
> fully closed).

## Two axes: chat model vs orchestration model

"Switch to X" controls the **direct-chat axis** (the model answering your messages).
MAS orchestration selects **execution models server-side** from backend presets at plan
time (the **plan axis**) — available now via the companion CLI
(`npm install -g @aiorouter/codex-aiorouter-mas`, see README). The two axes are
independent and never overwrite each other; this plugin configures only the first.

---

## Manual setup (if you prefer to do it yourself)

Create/merge in `~/.codex/config.toml`:

```toml
model = "deepseek-v4-flash"      # uncomment exactly ONE model line; full list: https://aiorouter.ca/docs/model-catalog
model_provider = "aiorouter"

[model_providers.aiorouter]
  name = "AIOrouter"
  base_url = "https://api.aiorouter.ca/v1"
  wire_api = "responses"
  # Key lives in ~/.codex/auth.json (set by codex login --with-api-key) —
  # NOT via env_key, so the desktop app never reports "Missing environment
  # variable" when it did not inherit the env var.
```

Set your key (never paste it into `config.toml`):

```bash
codex login --with-api-key
```

Verify:

```bash
codex "Hello, are you connected to AIOrouter?"
codex exec -m deepseek-v4-flash "2+2=?"
```

Expected: normal reply; Codex startup output shows `provider: aiorouter` and your model.

---

## Verify your setup (30 seconds)

Paste these prompts in a chat to prove the PII Shield is active:

1. [verify/name-placeholder-prompt.md](https://github.com/AIOCANA/aiorouter-gateway/blob/main/verify/name-placeholder-prompt.md) — fake
   identity "Jason Wang": the LLM must say it sees a placeholder, never your real name.
2. [verify/api-key-redact-prompt.md](https://github.com/AIOCANA/aiorouter-gateway/blob/main/verify/api-key-redact-prompt.md) — fake key:
   the LLM must refuse to echo it.

---

## Troubleshooting

| Symptom | Cause / Fix |
|:---|:---|
| App shows your ChatGPT name instead of "AIOrouter" | A background app overwrote `auth.json`. Fully quit (tray icon) → `codex login --with-api-key` again. |
| `401` / `invalid_api_key` / `Key revoked` | The API key was rotated/revoked on the dashboard. Get the NEW key, re-run `codex login --with-api-key`, fully quit the app (tray icon) and relaunch. |
| "Missing environment variable: AIOROUTER_API_KEY" | Old `config.toml` has an uncommented `env_key = "AIOROUTER_API_KEY"` line (pre-2026-08-15 installers). Comment it out (`# env_key = ...`) and use `codex login --with-api-key` instead. The plugin hook never writes env_key lines. |
| Error mentions `api.openai.com` | `base_url` is wrong — requests are going to OpenAI. Fix `base_url = "https://api.aiorouter.ca/v1"`. |
| App menu switching broke `model` in config | The app's menu overwrote `model` with an OpenAI ID. Quit the app → restore your uncommented `model =` line → relaunch. Don't use the app menu; say "switch to X". |
| Hook did nothing visible | Expected for repeat runs — the hook is idempotent and silent once the provider block exists. Check `~/.codex/config.toml` for `[model_providers.aiorouter]`. |

---

## Deep-dive reference

- [docs/mcp-integration.md](https://github.com/AIOCANA/aiorouter-gateway/blob/main/docs/mcp-integration.md) — advanced MCP tools (10 tools)
  for Claude Code / Codex CLI users (separate optional package)
- Canonical model list: https://aiorouter.ca/docs/model-catalog
- Privacy: https://aiorouter.ca/privacy-policy
