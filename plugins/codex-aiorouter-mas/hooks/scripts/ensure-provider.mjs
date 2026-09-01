#!/usr/bin/env node
/**
 * ensure-provider.mjs — AIOrouter onboarding hook for the codex-aiorouter-mas plugin.
 *
 * Runs non-interactively at session start (see hooks.json). Contract:
 *  - IDEMPOTENT: repeated runs never duplicate or corrupt ~/.codex/config.toml.
 *  - NON-DESTRUCTIVE: never touches auth.json CONTENT, never modifies an existing
 *    model_provider / model setting, never rewrites the user's other providers.
 *  - NO SECRETS: never reads, writes, echoes, or stores an API key.
 *  - SILENT DEGRADE: on any failure it exits 0 quietly — the README/SETUP text
 *    procedure remains the fallback.
 */
import { readFileSync, writeFileSync, existsSync, mkdirSync, copyFileSync } from "node:fs";
import { homedir } from "node:os";
import { join, dirname } from "node:path";

const HOME = process.env.CODEX_HOME || join(homedir(), ".codex");
const CFG = join(HOME, "config.toml");

const PROVIDER_RE = /^\s*\[model_providers\.aiorouter\]\s*$/m;
const PROVIDER_BLOCK = [
  "",
  "# ── AIOrouter model provider (added by codex-aiorouter-mas plugin) ──",
  "[model_providers.aiorouter]",
  'name = "AIOrouter"',
  'base_url = "https://api.aiorouter.ca/v1"',
  'wire_api = "responses"',
  "# Your key lives in ~/.codex/auth.json (set once via: codex login --with-api-key).",
  "# NEVER paste the key into this file.",
  "",
].join("\n");

const hasLine = (text, key) =>
  text.split(/\r?\n/).some((l) => new RegExp("^\\s*" + key + "\\s*=").test(l));

function main() {
  if (!existsSync(HOME)) mkdirSync(HOME, { recursive: true });
  const had = existsSync(CFG);
  let text = had ? readFileSync(CFG, "utf8") : "";
  const lines = text.split(/\r?\n/);
  let changed = false;
  const inserts = [];

  // Top-level defaults — only when the user has none (inserted above the first table).
  if (!hasLine(text, "model_provider")) { inserts.push('model_provider = "aiorouter"'); changed = true; }
  if (!hasLine(text, "model")) { inserts.push('model = "deepseek-v4-flash" # default — say "switch to X" in chat'); changed = true; }

  if (!PROVIDER_RE.test(text)) { changed = true; }

  if (!changed) {
    // Provider already present and user settings untouched: silent no-op (idempotent).
    process.exit(0);
  }

  if (had) {
    const bak = CFG + ".bak";
    if (!existsSync(bak)) copyFileSync(CFG, bak); // one-time backup; never overwritten
  }

  let out = text;
  if (inserts.length) {
    const firstTable = lines.findIndex((l) => /^\s*\[/.test(l));
    const at = firstTable === -1 ? 0 : firstTable;
    lines.splice(at, 0, ...inserts);
    out = lines.join("\n");
  }
  if (!PROVIDER_RE.test(out)) out = out.replace(/\s*$/, "\n") + PROVIDER_BLOCK;

  writeFileSync(CFG, out, "utf8");

  // Guidance only — never key material, never interactive.
  console.log(
    "[codex-aiorouter-mas] AIOrouter provider configured in " + CFG +
    ". Next: set your key once with  codex login --with-api-key  " +
    "(get one at https://dashboard.aiorouter.ca). Say \"switch to <model>\" in chat to change models."
  );
}

try { main(); } catch { /* silent degrade — README/SETUP carry the manual procedure */ }
process.exit(0);
