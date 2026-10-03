# Report Guidelines

Use these rules when refining generated Markdown or dashboard output.

## Article Goal

Write Chinese articles that can be published externally without additional restructuring.

## Required Reports

Generate one Markdown report for each period explicitly selected by the user. Map `每日 → daily`, `每周 → weekly`, and `每月 → monthly`; support any one-period, two-period, or three-period combination. Do not generate an unrequested period. If no period is specified, run the full workflow and generate:

1. `GitHub Trending 日报`
2. `GitHub Trending 周报`
3. `GitHub Trending 月报`

Deduplicate period requests and execute them in canonical order `daily → weekly → monthly`. When the same report date is run in multiple batches, replace the selected periods in the enriched cache and preserve the other periods for Dashboard continuity.

Each generated report must include:

1. Title with period and date
2. `整体趋势分析`
3. `项目清单`

Do not create a separate focus-only section. Show `【重点关注：...】` inline on affected project entries only, and keep the full project list unchanged.
Treat Markdown as the source of truth. Any dashboard or secondary web presentation must mirror the same conclusions and field values.

## Repository Entry Requirements

Every repository entry must include:

- project name with hyperlink
- project link
- `Star`
- period delta: `今日新增`, `本周新增`, or `本月新增`
- `一句话读懂`
- `核心价值`
  - `what`: 项目是什么
  - `how`: 项目如何解决目标场景问题
  - `why`: 三个基于 README 证据提炼的核心亮点

The repository analysis should stay compact and publish-ready. Write it in Chinese and follow these rules:

- `一句话读懂` 必须用一句直接、易懂的中文提炼项目，不复述 Star 增量或宏观趋势。
- `what` 必须说明项目类别与主要功能。
- `how` 必须说明实现路径或工作流，而不是只重复痛点。
- `why` 必须且只能输出三个具体亮点，优先使用支持语言数、MCP 工具、架构分析、PoC、CI/CD、部署模式和效率收益等 README 证据。

## Overall Trend Analysis Rules

The `整体趋势分析` section must summarize the whole Trending set into `1-2 个核心趋势`, not a loose collection of per-project observations.

Use this logic:

1. `宏观 What（现象层）`
   - 寻找高 Star 增量项目之间的“最大公约数”。
   - 将孤立工具抽象为行业演进方向，而不是停留在项目罗列。
2. `宏观 Why（本质层）`
   - 回答“为什么整个社区都在向这个方向发力”。
   - 将微观工程价值升维为行业痛点与范式转移。
3. `宏观 How（支撑层）`
   - 分析支撑趋势落地的通用工具链、架构模式或开发方法论。
   - 提炼社区正在沉淀的基础设施与标准化规范。
4. `结构化输出`
   - 严格使用以下 Markdown 结构：
     - `🔥 核心技术趋势洞察`
     - `📊 趋势拆解分析`
     - `🎯 宏观 What (演进方向)：...`
     - `💡 宏观 Why (核心驱动力)：...`
     - `⚙️ 宏观 How (底层支撑)：...`
     - `🏆 代表项目：...`
     - `⚠️ 潜在风险与冷思考`
   - 语言保持客观、专业、精炼，归纳必须锚定输入项目数据。

## Project Analysis Rules

Treat the repository description and rendered README as the evidence layer for every project card.

1. `One-Line Synthesis`
   - 提炼目标用户或系统、核心机制与实际收益。
   - 保持一句话，不堆叠无证据的宣传词。
2. `Core Value`
   - `what` 回答“它是什么、做什么”。
   - `how` 回答“它通过什么机制解决场景问题”。
   - `why` 固定输出三个能力亮点，不再输出“为什么会火”的热度推测。
3. `Cross-Output Consistency`
   - 日报、周报、月报与 Dashboard 必须复用相同的 `一句话读懂`、`what`、`how`、`why` 内容。
   - Dashboard 的字段名必须直接显示为 `what`、`how`、`why`。

## Dashboard Direction

- Generate a webpage in the bundled `analyze-github-trending/assets/dashboard/` dark information-board style.
- Show tabs for daily, weekly, and monthly when all periods are available.
- Build the archive browser from cached enriched snapshots. Daily navigation lists each date, weekly navigation groups by ISO week, and monthly navigation groups by calendar month.
- Generate `dashboard/history/<date>.html` as self-contained static views so history switching also works when the dashboard is opened directly with `file://`.
- Sync the dashboard hero and trend panel with the same `整体趋势分析` results used in Markdown.
- Emphasize focus projects with clear inline badges and dashboard chips.
- Preserve the project-level ranking and do not remove non-focus repositories.
- Do not invent new trend claims, labels, or project conclusions in dashboard-only rendering.

## Tone

- Write in Chinese.
- Keep the tone analytical, concrete, and outward-facing.
- Use README-derived details when they are specific enough to explain the project.
- Avoid pretending to have audited the whole codebase when the input is the repo description plus rendered README.
