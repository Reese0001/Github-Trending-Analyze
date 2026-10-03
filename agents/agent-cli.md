# Agent CLI Instructions

This file is the canonical instruction set for OpenCode and other agents that follow an `AGENTS.md`-style convention.

## Purpose

This repository is a reusable, agent-agnostic GitHub Trending analysis skill.

Use it to:

- fetch any requested subset or combination of daily, weekly, and monthly GitHub Trending repositories
- enrich repository summaries from rendered README content
- generate publish-ready Chinese Markdown reports
- sync a dashboard page under `reports/.../dashboard/index.html`

Treat `scripts/run-analysis.mjs` as the canonical execution entrypoint.
Treat Markdown reports as the primary deliverable.
Treat the dashboard as a synchronized presentation layer, not a second analysis source.

## Primary entrypoint

From the skill root, run:

```powershell
node .\scripts\run-analysis.mjs --period all
```

Single period:

```powershell
node .\scripts\run-analysis.mjs --period daily
node .\scripts\run-analysis.mjs --period weekly
node .\scripts\run-analysis.mjs --period monthly
```

Selected combinations:

```powershell
node .\scripts\run-analysis.mjs --period "daily,weekly"
node .\scripts\run-analysis.mjs --period "weekly,monthly"
node .\scripts\run-analysis.mjs --period "daily,monthly"
node .\scripts\run-analysis.mjs --period "daily,weekly,monthly"
```

Map the user's requested periods exactly, deduplicate them, and keep canonical execution order `daily → weekly → monthly`. Do not add an unrequested period; default to all only when no period is specified. Repeated flags such as `--period daily --period weekly` are also supported.

Override output and date:

```powershell
node .\scripts\run-analysis.mjs --period all --output-dir ..\reports\github-trending --date 2026-07-06
```

## Output contract

Expected outputs:

- `reports/github-trending/<date>-daily.md` when daily is selected
- `reports/github-trending/<date>-weekly.md` when weekly is selected
- `reports/github-trending/<date>-monthly.md` when monthly is selected
- `reports/github-trending/cache/<date>/`
- `reports/github-trending/dashboard/index.html`
- `reports/github-trending/dashboard/history/<date>.html`

Interpret them as:

- Markdown reports: canonical publishable outputs
- Cache JSON: structured intermediate artifacts
- Dashboard HTML: synced web view built from the same data, with daily date, ISO-week, and calendar-month archive selectors

## Analysis rules

Macro trend analysis must:

- summarize the whole set into `1-2` core trends
- use strict `What / Why / How` framing
- include representative projects and star deltas
- include risk notes

Project analysis must include:

- `一句话读懂`：一句中文提炼项目的核心机制与实际收益
- `核心价值`
  - `what`：项目类别与主要功能
  - `how`：实现路径或解决场景问题的工作流
  - `why`：三个基于 README 证据提炼的核心亮点

When a project aligns with a macro trend, explicitly state how it validates that trend.

Do not require provider-specific tools or Codex-only context if the same result can be achieved by reading the repo files and running Node.js.

## Important files

- `README.md`
  - general skill overview for agents and maintainers
- `SKILL.md`
  - Codex-specific discovery adapter; not required outside Codex
- `references/report-guidelines.md`
  - report structure and editorial rules
- `scripts/analysis-core.mjs`
  - core pipeline
- `scripts/dashboard/`
  - dashboard data model and renderer

## Validation

Run tests:

```powershell
node --test .\scripts\analysis-core.test.mjs
node --test .\scripts\dashboard\dashboard-data.test.mjs .\scripts\dashboard\dashboard-render.test.mjs
```

Run end-to-end self-check:

```powershell
node .\scripts\self-check.mjs
```
