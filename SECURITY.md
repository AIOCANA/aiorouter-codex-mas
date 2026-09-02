# Security Policy

## API keys

- This plugin **never stores, writes, or transmits API keys** on its own.
- The bundled MCP server reads your key from the `AIOROUTER_API_KEY` environment variable only (declared via `env_vars` passthrough; nothing is committed to this repository).
- The onboarding hook writes provider *configuration* (base URL, model name) to your local Codex `config.toml` — it never touches credentials files such as `auth.json`, and never asks you to paste a key into chat.
- Create or rotate keys at `https://dashboard.aiorouter.ca/keys`.

## Reporting a vulnerability

Please report security issues privately to **security@aiorouter.ca**. Do not open a public issue for vulnerabilities.
We aim to acknowledge reports within 2 business days.

## Supported versions

| Version | Supported |
|:---|:---|
| 0.1.x | ✅ |
