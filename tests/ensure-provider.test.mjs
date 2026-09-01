#!/usr/bin/env node
/**
 * tests/ensure-provider.test.mjs — self-contained matrix for the onboarding hook.
 * Scenarios: A fresh home (first run + idempotent rerun), B existing user config
 * (openai provider + its own model lines preserved), C already-onboarded no-op.
 * Zero network, zero real keys. Exit 0 = all green.
 */
import { execFileSync } from "node:child_process";
import { mkdtempSync, mkdirSync, writeFileSync, readFileSync, existsSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const HOOK = join(import.meta.dirname, "..", "plugins", "codex-aiorouter-mas", "hooks", "scripts", "ensure-provider.mjs");
const Q = String.fromCharCode(34);
let pass = 0, failn = 0;
const check = (name, cond) => { if (cond) { pass++; console.log("  ok  " + name); } else { failn++; console.error("FAIL  " + name); } };
const runHook = (home) => execFileSync(process.execPath, [HOOK], { env: { ...process.env, CODEX_HOME: home }, encoding: "utf8" });
const simpleHash = (f) => { try { return readFileSync(f, "utf8"); } catch { return "<none>"; } };

const root = mkdtempSync(join(tmpdir(), "ocx-hook-"));

// A — fresh machine
const a = join(root, "fresh"); mkdirSync(a, { recursive: true });
const aOut1 = runHook(a);
const aCfg = join(a, "config.toml");
const a1 = readFileSync(aCfg, "utf8");
check("A1 provider block written", a1.includes("[model_providers.aiorouter]"));
check("A1 defaults set", a1.includes("model_provider = " + Q + "aiorouter" + Q) && a1.includes("model = "));
check("A1 key guidance printed", aOut1.includes("codex login --with-api-key"));
check("A1 no key material in output", !/ak-[A-Za-z0-9_-]{20,}/.test(aOut1));
check("A1 no auth.json touched", !existsSync(join(a, "auth.json")));
check("A1 no backup for brand-new file", !existsSync(aCfg + ".bak"));
runHook(a);
check("A2 rerun byte-identical (idempotent)", simpleHash(aCfg) === a1);
check("A2 rerun silent", runHook(a) === "");

// B — existing ChatGPT/openai user config
const b = join(root, "existing"); mkdirSync(b, { recursive: true });
const bCfg = join(b, "config.toml");
const b0 = ["model = " + Q + "gpt-5.1" + Q, "model_provider = " + Q + "openai" + Q, "", "[model_providers.openai]", "name = " + Q + "OpenAI" + Q, ""].join("\n");
writeFileSync(bCfg, b0, "utf8");
runHook(b);
const b1 = readFileSync(bCfg, "utf8");
check("B1 provider appended", b1.includes("[model_providers.aiorouter]"));
check("B1 user model_provider untouched", b1.includes("model_provider = " + Q + "openai" + Q));
check("B1 user model untouched", b1.includes("model = " + Q + "gpt-5.1" + Q) && !b1.includes("deepseek"));
check("B1 existing openai table intact", b1.includes("[model_providers.openai]"));
check("B1 one-time backup created", existsSync(bCfg + ".bak") && readFileSync(bCfg + ".bak", "utf8") === b0);
runHook(b);
check("B2 rerun byte-identical (idempotent)", simpleHash(bCfg) === b1);
check("B3 backup never overwritten", readFileSync(bCfg + ".bak", "utf8") === b0);

// C — already onboarded (from A result) silent no-op
const c1 = simpleHash(aCfg);
check("C no-op byte-identical + silent", runHook(a) === "" && simpleHash(aCfg) === c1);

rmSync(root, { recursive: true, force: true });
console.log("\nensure-provider.test: " + pass + " pass, " + failn + " fail");
process.exit(failn ? 1 : 0);
