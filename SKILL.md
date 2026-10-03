---
name: analyze-github-trending
description: Analyze any user-selected subset or combination of GitHub Trending daily, weekly, and monthly repositories, then generate publish-ready Chinese Markdown reports with a synced dashboard view. Use when an agent needs one period, two combined periods, or all three periods; needs README-grounded macro What/Why/How analysis; needs concise Chinese “一句话读懂” plus per-project what/how/three-highlight why analysis; or needs explicit AI open source, AI agent, and AI software-development-automation labels. The canonical entrypoint is `scripts/run-analysis.mjs`.
---

# Analyze GitHub Trending

## Overview

Use this skill to turn GitHub Trending daily, weekly, and monthly pages into publish-ready Chinese reports and a synced dashboard-style view.
Treat the bundled Node script as the canonical workflow: it collects repository metadata, reads rendered README content from each repository page, extracts tags and trend signals, classifies AI relevance, and writes Markdown plus synchronized cache and dashboard outputs.

This `SKILL.md` only adapts the toolkit to Codex skill discovery. The repository itself is agent-agnostic:

- `README.md` is the primary human-facing and portable usage guide
- `agents/claude-code.md` and `agents/agent-cli.md` hold the canonical non-Codex agent instructions
- `scripts/run-analysis.mjs` is the canonical CLI entrypoint for every environment

## Workflow

1. Infer the requested period set from the user's instruction before running the script: `每日 → daily`, `每周 → weekly`, `每月 → monthly`.
2. Run exactly the requested unique periods in canonical order `daily → weekly → monthly`. Do not silently add an unrequested period. If the user does not specify a period, default to all three.
3. Run the analysis script from the repository root, or adjust the relative path if this toolkit is vendored as a subdirectory.
4. Review only the generated Markdown reports for the selected periods; they are the canonical publishable outputs.
5. Treat the generated dashboard at `reports/github-trending/dashboard/index.html` as a synchronized companion view, not a separate source of truth. The dashboard scans cached dates and exposes day, ISO-week, and calendar-month selectors.
6. Edit generated articles only when the user asks for tone, structure, or editorial refinement.

## Bundled Resources

This toolkit is self-contained for independent publishing:

- `agents/`
  - OpenAI metadata plus non-Codex canonical agent instruction files
- `scripts/analysis-core.mjs`
  - 主分析与报告生成逻辑
- `scripts/dashboard/`
  - dashboard 数据模型与 HTML 渲染器
- `assets/dashboard/`
  - dashboard 样式与图形资源
- `references/`
  - 报告结构、重点关注口径与编辑规范

## Trend Analysis Framework

Use the overall trend section to infer the current GitHub Trending direction from the full project set, not from isolated repositories.

Follow these four standardized steps:

1. `Step 1: 数据获取 (Fetch)`
   - 抓取指定时间范围（Daily / Weekly / Monthly）的 Trending 页面数据。
   - 提取字段至少包括：项目名称、描述、编程语言、Star 增量、Fork 数、核心贡献者列表。
2. `Step 2: 特征提取 (Extract)`
   - 基于项目描述、Trending 摘要与 README 关键内容做快速扫描。
   - 为每个项目打技术标签，例如：`Agent`、`RAG`、`Rust`、`前端框架`、`安全`、`多模态`、`AI Coding`、`MCP`。
3. `Step 3: 宏观归纳 (Synthesize)`
   - 严格从以下三个维度分析趋势：
     - `宏观 What（现象层）`：寻找高 Star 增量项目之间的最大公约数，识别“集群化”演进方向。
     - `宏观 Why（本质层）`：解释为什么社区会集体转向该方向，把微观工程价值升维为行业痛点与范式转移。
     - `宏观 How（支撑层）`：抽象支撑趋势落地的基础设施、架构模式与方法论。
   - 结合当前科技大背景交叉验证趋势合理性，例如：AI 工业化、模型平台化、云原生工程化、多模态内容生产。
4. `Step 4: 结构化输出 (Format)`
   - 每篇报告的 `整体趋势分析` 只输出 `1-2 个核心趋势`。
   - 必须严格使用以下 Markdown 结构：
     - `🔥 核心技术趋势洞察`
     - `📊 趋势拆解分析`
     - `🎯 宏观 What (演进方向)：...`
     - `💡 宏观 Why (核心驱动力)：...`
     - `⚙️ 宏观 How (底层支撑)：...`
     - `🏆 代表项目：...`
     - `⚠️ 潜在风险与冷思考`
   - 保持客观、专业、精炼，避免脱离输入项目数据臆造趋势。

## Quick Start

Run the full daily + weekly + monthly workflow:

```powershell
node .\scripts\run-analysis.mjs --period all
```

Run a single period:

```powershell
node .\scripts\run-analysis.mjs --period daily
node .\scripts\run-analysis.mjs --period weekly
node .\scripts\run-analysis.mjs --period monthly
```

Run any two-period or three-period combination:

```powershell
node .\scripts\run-analysis.mjs --period "daily,weekly"
node .\scripts\run-analysis.mjs --period "weekly,monthly"
node .\scripts\run-analysis.mjs --period "daily,monthly"
node .\scripts\run-analysis.mjs --period "daily,weekly,monthly"
```

Repeated flags are also accepted, for example `--period daily --period weekly`. Prefer the comma-separated form when translating a natural-language user request.

Override the output directory or report date when needed:

```powershell
node .\scripts\run-analysis.mjs --period all --output-dir ..\reports\github-trending --date 2026-07-03
```

If another workspace vendors this toolkit as a subdirectory, prefix the script path accordingly, for example `node .\analyze-github-trending\scripts\run-analysis.mjs --period all`.

## Expected Outputs

- Save canonical Markdown reports only for the requested periods under `./reports/github-trending/<date>-<period>.md`; the default with no explicit period remains all three.
- Save parsed Trending JSON for the selected periods and enriched repository JSON under `./reports/github-trending/cache/<date>/`. When the same date is analyzed again with another subset, replace the selected periods and preserve other cached periods for Dashboard continuity.
- Save a synced dashboard webpage under `./reports/github-trending/dashboard/index.html`.
- Save one static historical snapshot per cached date under `./reports/github-trending/dashboard/history/<date>.html`. The daily selector lists dates, the weekly selector groups snapshots by ISO week, and the monthly selector groups snapshots by calendar month.
- Keep every repository from each selected Trending page.
- Mark AI-related repositories inline with visible `【重点关注：...】` labels.

## Project Card Rules

Every project entry must include:

- project link
- `Star`
- period delta: `今日新增`, `本周新增`, or `本月新增`
- `一句话读懂`
- `核心价值`
  - `what`: 用一句话说明项目是什么
  - `how`: 说明项目如何解决目标场景问题
  - `why`: 输出三个具体、可验证的核心亮点

Generate project-level analysis from the repository description and README evidence:

1. `One-Line Synthesis`
   - Compress the project into one direct Chinese sentence.
   - State the target user or system, the core mechanism, and the practical benefit whenever evidence supports them.
   - Do not repeat macro trend commentary, Star growth, or generic popularity claims.
2. `Core Value`
   - `what` must identify the project category and primary function.
   - `how` must explain the implementation path or workflow, not merely restate the problem.
   - `why` must contain exactly three concise highlights grounded in README capabilities.
3. `Evidence Selection`
   - Prefer concrete details such as supported languages, MCP tools, architecture analysis, PoC validation, CI/CD integration, deployment mode, and measurable efficiency gains.
   - Do not claim full-codebase auditing; use only the description and rendered README evidence.

Use this Markdown shape for every repository:

```markdown
- 一句话读懂：...
- 核心价值：
  - **what**：...
  - **how**：...
  - **why**：
    1. ...
    2. ...
    3. ...
```

The same fields and wording must feed the daily, weekly, and monthly Markdown reports and the dashboard project cards. Historical dashboard pages must be generated only from `cache/<date>/enriched-repositories.json`, so switching dates never creates a second analysis口径.

## Review Guidelines

- Treat generated Markdown as publishable drafts.
- Read [references/focus-rubric.md](references/focus-rubric.md) when you need to understand why a repository was marked as `重点关注`.
- Read [references/report-guidelines.md](references/report-guidelines.md) when reshaping the article without changing the data pipeline.
- Keep the workflow portable: do not rely on Codex-only behaviors when the same result can be produced by reading Markdown instructions and running the bundled Node scripts.
- When revising `整体趋势分析`, keep it anchored to shared pain points and macro trends rather than per-repo summaries.
- When revising project cards, keep `一句话读懂` concise and preserve the exact `what` / `how` / three-item `why` structure.
- If the user asks for deeper technical commentary, build on cached README-derived notes instead of re-scraping unless the report date or period changed.
