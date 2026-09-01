---
name: aiorouter-model-switch
description: Switch the active AIOrouter model in Codex when the user says "switch to <model>" / "change to <model>" / "use <model>". Use when the user asks to change models in the ChatGPT desktop app or Codex CLI.
---

# AIOrouter model switch

When the user asks to "switch to / change to / use <model>":
1. Read ~/.codex/config.toml
2. Confirm model_provider = "aiorouter"; if not, tell the user you cannot proceed (and point them to the plugin install or SETUP.md manual steps)
3. Determine if <model> is supported:
   a. Check the commented "model =" list in ~/.codex/config.toml
   b. If not there, fetch https://aiorouter.ca/docs/model-catalog (canonical list)
   c. If the network is blocked, tell the user you could not verify the catalog and list the local models you know about
4. If <model> is not supported → refuse, list available models, ask the user to re-specify. Do NOT edit config.toml.
5. Edit config.toml (back it up first as config.toml.bak):
   - Change the currently uncommented model = "..." line to the target model
   - Keep exactly ONE uncommented "model =" line; leave all others commented
   - If the target model line does not exist yet, add it (commented) first, then uncomment it — this keeps the local list up to date
   - Do NOT change model_provider / base_url or anything else
   - Do NOT add any new keys (no model_reasoning_effort, no notify, etc.)
   - NEVER write API keys into config.toml
6. Re-read config.toml to verify: exactly one uncommented "model =" line and model_provider is still "aiorouter", and NO extra keys were added, then say: "Switched to <model> — new chats use it immediately (no restart needed)."

## Which model is actually answering?

The uncommented `model =` line is the only model selection Codex uses for your chats —
there is no hidden override. Whatever you switched to is what answers (verify any time:
ask "what model are you?" or run `codex` and check the status line).

## Two axes: chat model vs orchestration model (important)

"Switch to X" controls the **direct-chat axis** — the model that answers your messages.
AIOrouter's multi-agent (MAS) orchestration — arriving in a later version — selects
**execution models server-side** from backend presets when a plan runs (the **plan axis**).
The two axes are independent and never overwrite each other: switching your chat model
does not change orchestration behavior, and orchestration never changes your chat model.
Which models run which orchestration roles is decided by the AIOrouter backend, not by
anything configured in this plugin.
