#!/usr/bin/env node
/**
 * verify-codex-plugin-package.mjs — publish gate for this repo (plan §5.4).
 *
 * Self-contained defense-in-depth content gate for the public package. The
 * authoritative pattern list is scripts/security-gate-patterns.mjs in the
 * private AIOrouter monorepo (single source of truth, R21) — the monorepo-side
 * gate imports it; this repo-side copy mirrors the categories so a standalone
 * clone can still self-verify. If patterns change, sync BOTH in the same task.
 *
 * Checks:
 *   1. File inventory (required files present)
 *   2. Forbidden content (secrets / internal paths / identity / contract terms)
 *   3. Metadata EXACT-PIN (V1.0.3): name / repository URL / marketplace path —
 *      full string equality only, NEVER includes() (DSH lesson: an "-mas-mas"
 *      repository-URL typo sailed past includes() checks into 6 published versions)
 *   4. Two-axis narrative pin (V1.0.3): README + SETUP + SKILL
 *   5. SKILL.md zero model-id hardcoding pin
 *
 * Exit 0 = publish-ready; exit 1 = blocked (prints every hit).
 */
import { readFileSync, readdirSync, statSync, existsSync } from "node:fs";
import { join, relative } from "node:path";

const ROOT = process.argv[2] || ".";
const fail = [];
const ok = [];

// ── 1. Inventory ─────────────────────────────────────────────────────────────
const REQUIRED = [
  ".agents/plugins/marketplace.json",
  "README.md",
  "SETUP.md",
  "LICENSE",
  "plugins/codex-aiorouter-mas/.codex-plugin/plugin.json",
  "plugins/codex-aiorouter-mas/.mcp.json",
  "plugins/codex-aiorouter-mas/hooks.json",
  "plugins/codex-aiorouter-mas/hooks/scripts/ensure-provider.mjs",
  "plugins/codex-aiorouter-mas/skills/aiorouter-model-switch/SKILL.md",
];
for (const f of REQUIRED) {
  if (existsSync(join(ROOT, f))) ok.push("inventory: " + f);
  else fail.push("MISSING required file: " + f);
}

// ── 2. Forbidden content patterns (mirror of monorepo security-gate-patterns) ─
const FORBIDDEN = [
  { re: /ak-[A-Za-z0-9_-]{20,}/g, label: "AIOrouter API key shape" },
  { re: /aiorouter_[a-f0-9]{40,}/gi, label: "Legacy API key shape" },
  { re: /sk-[A-Za-z0-9_-]{20,}/g, label: "OpenAI-style secret key" },
  { re: /BEGIN (RSA |EC |OPENSSH |DSA |PGP )?PRIVATE KEY/g, label: "Private key" },
  { re: /postgres:\/\/|postgresql:\/\//g, label: "DB connection string" },
  { re: /AKIA[0-9A-Z]{16}/g, label: "AWS access key" },
  { re: /gh[pousr]_[A-Za-z0-9]{30,}/g, label: "GitHub token" },
  { re: /eyJ[A-Za-z0-9_-]{10,}\./g, label: "JWT" },
  { re: /AIOROUTER_API_KEY\s*[:=]\s*["']?[A-Za-z0-9_-]{20,}/g, label: "Hardcoded key value" },
  { re: /AIOrouter-Business\//g, label: "Confidential business dir" },
  { re: /internal-docs\//gi, label: "Internal docs dir" },
  { re: /\bplans\/(?:codemas|marketing|AIOrouter)/g, label: "Internal plans/ ref" },
  { re: /\bops\/(?:tasks|governance|reports|decisions)/g, label: "Internal ops/ ref" },
  { re: /\bdiagnostics\//g, label: "Internal diagnostics/ ref" },
  { re: /src\/(?:gateway|mcp-server|security|billing|providers|ops|db|cache|router|config)\//g, label: "Internal src path" },
  { re: /AIOCANA-AIOROUTER/g, label: "Monorepo dir name" },
  { re: /10\.42\.0\.3|10\.133\.95\.3|34\.19\.216\.67/g, label: "Internal IP" },
  { re: /internal\.aiorouter|admin\.aiocana/g, label: "Internal hostname" },
  { re: /C:\\Users|[\\/]{1}mnt[\\/]{1}disks[\\/]/g, label: "Local dev path" },
  { re: /\d+\s*\u6298/g, label: "Chinese discount-rate" },
  { re: /discount\s*rate/gi, label: "Discount rate" },
  { re: /contract\s*price/gi, label: "Contract price" },
  { re: /Schedule\s*2/gi, label: "Contract Schedule 2" },
  { re: /\btayachu\b/gi, label: "Personal identity (R22)" },
  { re: /228390158/g, label: "Personal GitHub user ID (R22)" },
];
// Intentional doc placeholders (not real keys)
const ALLOW = ["ak-your-api-key-here", "ak-your-key", "your-api-key", "ak-placeholder"];

function* walk(dir) {
  for (const e of readdirSync(dir)) {
    if (e === ".git" || e === "node_modules") continue;
    const p = join(dir, e);
    if (statSync(p).isDirectory()) yield* walk(p);
    else yield p;
  }
}
let scanned = 0;
for (const p of walk(ROOT)) {
  const rel = relative(ROOT, p).split("\\").join("/");
  if (rel === "verify-codex-plugin-package.mjs") continue; // this file embeds the patterns themselves
  let text;
  try { text = readFileSync(p, "utf8"); } catch { continue; }
  scanned++;
  for (const { re, label } of FORBIDDEN) {
    re.lastIndex = 0;
    let m;
    while ((m = re.exec(text)) !== null) {
      const hit = text.slice(Math.max(0, m.index - 40), m.index + 80);
      if (ALLOW.some((a) => hit.includes(a))) continue;
      fail.push("FORBIDDEN [" + label + "] in " + rel + ": " + m[0].slice(0, 40));
      re.lastIndex = m.index + 1;
    }
  }
}
ok.push("content scan: " + scanned + " files");

// ── 3. Metadata EXACT-PIN (full string equality, never includes()) ──────────
const PLUGIN_NAME = "codex-aiorouter-mas";
const REPO_URL = "https://github.com/AIOCANA/aiorouter-codex-mas";
const MARKETPLACE_NAME = "aiorouter-codex-mas";
const PLUGIN_PATH = "./plugins/codex-aiorouter-mas";
const readJson = (f) => JSON.parse(readFileSync(join(ROOT, f), "utf8"));
try {
  const pj = readJson("plugins/codex-aiorouter-mas/.codex-plugin/plugin.json");
  if (pj.name !== PLUGIN_NAME) fail.push("EXACT-PIN plugin.name: " + JSON.stringify(pj.name));
  else ok.push("pin plugin.name === " + PLUGIN_NAME);
  if (pj.repository !== REPO_URL) fail.push("EXACT-PIN plugin.repository: " + JSON.stringify(pj.repository));
  else ok.push("pin repository === " + REPO_URL);
  if (!/^\d+\.\d+\.\d+$/.test(String(pj.version))) fail.push("plugin.version not semver: " + pj.version);
  else ok.push("pin version semver: " + pj.version);
} catch (e) { fail.push("plugin.json unreadable: " + e.message); }
try {
  const mj = readJson(".agents/plugins/marketplace.json");
  if (mj.name !== MARKETPLACE_NAME) fail.push("EXACT-PIN marketplace.name: " + JSON.stringify(mj.name));
  else ok.push("pin marketplace.name === " + MARKETPLACE_NAME);
  const p0 = mj.plugins && mj.plugins[0];
  if (!p0 || p0.name !== PLUGIN_NAME) fail.push("EXACT-PIN marketplace.plugins[0].name");
  else if (!p0.source || p0.source.source !== "local" || p0.source.path !== PLUGIN_PATH)
    fail.push("EXACT-PIN marketplace.plugins[0].source: " + JSON.stringify(p0.source));
  else ok.push("pin plugin source === " + PLUGIN_PATH);
} catch (e) { fail.push("marketplace.json unreadable: " + e.message); }
try {
  const readme = readFileSync(join(ROOT, "README.md"), "utf8");
  const INSTALL_A = "codex plugin marketplace add AIOCANA/aiorouter-codex-mas";
  const INSTALL_B = "codex plugin add codex-aiorouter-mas@aiorouter-codex-mas";
  if (!readme.includes(INSTALL_A) || !readme.includes(INSTALL_B)) fail.push("README one-line install commands missing");
  else ok.push("pin README install commands");
} catch (e) { fail.push("README unreadable"); }

// ── 4. Two-axis narrative pin (V1.0.3) ──────────────────────────────────────
for (const f of ["README.md", "SETUP.md", "plugins/codex-aiorouter-mas/skills/aiorouter-model-switch/SKILL.md"]) {
  let t = "";
  try { t = readFileSync(join(ROOT, f), "utf8"); } catch { }
  if (!t.includes("direct-chat axis") || !t.includes("plan axis"))
    fail.push("two-axis narrative missing in " + f);
  else ok.push("two-axis pin: " + f);
}

// ── 5. SKILL.md zero model-id hardcoding ────────────────────────────────────
try {
  const sk = readFileSync(join(ROOT, "plugins/codex-aiorouter-mas/skills/aiorouter-model-switch/SKILL.md"), "utf8");
  const bad = sk.match(/\b(deepseek[-\w]*|qwen[-\d.\w]*|glm-\d[\w.]*|kimi[-\d.\w]*|grok[-\d.\w]*|llama[-\d.\w]*)\b/gi);
  if (bad) fail.push("SKILL.md hardcodes model ids: " + [...new Set(bad)].join(", "));
  else ok.push("SKILL.md zero model ids");
} catch (e) { fail.push("SKILL.md unreadable"); }

// ── Report ───────────────────────────────────────────────────────────────────
for (const o of ok) console.log("  ok  " + o);
for (const f2 of fail) console.error("FAIL  " + f2);
if (fail.length) { console.error("\nverify-codex-plugin-package: " + fail.length + " FAILURE(S) — publish blocked"); process.exit(1); }
console.log("\nverify-codex-plugin-package: PASS (publish-ready)");
process.exit(0);
