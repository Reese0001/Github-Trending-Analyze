# Claude Code Instructions

This file is the canonical Claude Code entry for this skill.

## What to do here

Use the Node.js scripts in `scripts/` to:

- fetch exactly the user-selected daily, weekly, and/or monthly GitHub Trending data
- enrich repository summaries from rendered README content
- generate Chinese Markdown reports
- sync a dashboard page from the same analysis result
- build static dashboard history pages with daily date, ISO-week, and calendar-month selectors from cached snapshots

Use `scripts/run-analysis.mjs` as the canonical execution entrypoint.
Treat Markdown reports as the primary deliverable.

## Main command

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

Map `每日 → daily`, `每周 → weekly`, and `每月 → monthly`. Run only the unique periods requested by the user in canonical order; default to all three only when no period is specified.

## Read these files when needed

- `README.md`
  - general usage and compatibility notes
- `references/report-guidelines.md`
  - report output rules
- `scripts/analysis-core.mjs`
  - analysis pipeline

`SKILL.md` exists for Codex discovery only. It is not required for Claude Code execution.

## Dashboard history

- `reports/github-trending/dashboard/index.html` opens the latest cached snapshot.
- `reports/github-trending/dashboard/history/<date>.html` stores each available static snapshot.
- Daily navigation switches exact dates, weekly navigation groups by ISO week, and monthly navigation groups by calendar month.
- All history views must reuse the cached Markdown analysis data and work directly through `file://`.

## Output expectations

Trend analysis:

- use `What / Why / How`
- output `1-2` core trends
- include representative projects and risks

Per-project analysis:

- `一句话读懂`：一句中文提炼项目的核心机制与实际收益
- `核心价值`
  - `what`：项目类别与主要功能
  - `how`：实现路径或解决场景问题的工作流
  - `why`：三个基于 README 证据提炼的核心亮点

If a project aligns with the macro trend, say how it validates the trend.
