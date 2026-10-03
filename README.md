# analyze-github-trending

`analyze-github-trending` 是一个面向 Agent CLI 的 GitHub Trending 分析 skill，可按用户指令单独或组合抓取 `Daily / Weekly / Monthly` 榜单，补充 README 语义信息，生成对应的中文 Markdown 报告，并同步输出 dashboard 页面。

这个目录的核心定位不是“给人手动点击运行的脚本仓库”，而是“给 agent 读取、理解并执行的技能包”。不同 Agent CLI 通过各自的入口文件触发同一套分析规则，真正的执行层由目录中的 Node.js 脚本承担。

## 它能做什么

- 抓取 GitHub Trending 项目列表与基础指标
- 可根据用户指令单独分析每日、每周或每月，也可任意组合两个或三个周期；只生成被选择的报告
- 扫描项目描述、Trending 摘要和 README 关键信息
- 为项目打上 `Agent`、`AI Coding`、`MCP`、`RAG`、`安全`、`多模态` 等标签
- 输出严格遵循 `What / Why / How` 的宏观趋势分析
- 为每个项目生成中文 `一句话读懂`，并输出 `what / how / why` 核心价值解读
- 生成 dashboard 所需的数据和静态页面

## Skill 入口

当前 skill 同时提供多种入口，方便不同 Agent CLI 发现并调用，但统一以 `scripts/run-analysis.mjs` 作为执行入口：

- `SKILL.md`
  - 面向 Codex 的技能发现与触发入口
- `agents/claude-code.md`
  - Claude Code 的 canonical 指令文件
- `agents/agent-cli.md`
  - OpenCode 与其他 Agent CLI 的 canonical 指令文件
- `README.md`
  - 面向没有专用 skill 约定的 agent 与维护者的通用说明
- `scripts/run-analysis.mjs`
  - skill 的实际执行入口，不依赖单一 agent 平台

## 输出内容

agent 触发 skill 后，只为用户指定的周期生成对应 Markdown；未指定周期时默认生成全部三个周期：

- `reports/github-trending/<date>-daily.md`（选择每日时）
- `reports/github-trending/<date>-weekly.md`（选择每周时）
- `reports/github-trending/<date>-monthly.md`（选择每月时）
- `reports/github-trending/cache/<date>/`
- `reports/github-trending/dashboard/index.html`
- `reports/github-trending/dashboard/history/<date>.html`

其中：

- Markdown 报告是主产物，也是对外发布时的权威内容
- `cache/<date>/` 是中间结构化数据，方便调试、复核与二次处理；同一天分批运行不同周期时，新结果替换所选周期，其他周期缓存继续保留
- dashboard 页面是和 Markdown 同步的 Web 展示层，不应引入额外结论
- dashboard 会扫描已有 `cache/<date>/enriched-repositories.json`：日报按日期切换，周报按 ISO 周切换，月报按自然月切换；每个周期默认使用该时间桶内最新的可用快照
- `dashboard/index.html` 默认打开最新快照，`dashboard/history/<date>.html` 是可直接通过 `file://` 打开的静态历史页，不依赖额外服务或异步请求

报告中的趋势部分会输出：

- `🔥 核心技术趋势洞察`
- `📊 趋势拆解分析`
- `🎯 宏观 What`
- `💡 宏观 Why`
- `⚙️ 宏观 How`
- `🏆 代表项目`
- `⚠️ 潜在风险与冷思考`

项目部分会输出：

- `一句话读懂`
- `核心价值`
  - `what`：项目是什么
  - `how`：项目如何解决目标场景问题
  - `why`：三个基于 README 证据提炼的核心亮点

## Skill 目录结构

```text
analyze-github-trending/
├─ SKILL.md
├─ README.md
├─ agents/
│  ├─ openai.yaml
│  ├─ claude-code.md
│  └─ agent-cli.md
├─ assets/
│  └─ dashboard/
├─ references/
│  ├─ focus-rubric.md
│  └─ report-guidelines.md
└─ scripts/
   ├─ analysis-core.mjs
   ├─ run-analysis.mjs
   ├─ self-check.mjs
   └─ dashboard/
```

## 快速开始

这一节面向“如何让 agent 使用这个 skill”，而不是面向人工把它当普通脚本手动操作。

推荐使用方式：

1. 让 agent 先识别这是一个 `analyze-github-trending` skill。
2. 让 agent 先读取与当前运行环境匹配的入口文件：
   - Codex: `SKILL.md`
   - Claude Code: `agents/claude-code.md`
   - OpenCode 或其他支持该约定的 Agent CLI: `agents/agent-cli.md`
   - 如果没有专用入口约定，则读取 `README.md`
3. 让 agent 根据入口文件中的规则，调用 `scripts/run-analysis.mjs` 执行正式分析流程。
4. 让 agent 先审阅生成的 Markdown 报告，再把 dashboard 作为同步展示层输出。

对 agent 来说，最常见的执行动作是：

```powershell
node .\scripts\run-analysis.mjs --period all
```

如果只需要单个周期，则执行：

```powershell
node .\scripts\run-analysis.mjs --period daily
node .\scripts\run-analysis.mjs --period weekly
node .\scripts\run-analysis.mjs --period monthly
```

如果用户指定两个或三个周期，则按需组合，不补充用户没有要求的周期：

```powershell
# 每日 + 每周
node .\scripts\run-analysis.mjs --period "daily,weekly"

# 每周 + 每月
node .\scripts\run-analysis.mjs --period "weekly,monthly"

# 每日 + 每月
node .\scripts\run-analysis.mjs --period "daily,monthly"

# 每日 + 每周 + 每月
node .\scripts\run-analysis.mjs --period "daily,weekly,monthly"
```

也可以重复传入参数，例如 `--period daily --period weekly`。推荐 agent 使用逗号分隔形式。周期会自动去重，并固定按 `daily → weekly → monthly` 顺序执行。用户未指定周期时，默认分析全部三个周期。

如果 skill 目录被其他仓库以子目录方式引用，例如 `./analyze-github-trending/`，agent 应自行调整脚本路径，例如：

```powershell
node .\analyze-github-trending\scripts\run-analysis.mjs --period all
```

如果需要指定报告日期或输出目录，agent 再补充参数：

```powershell
node .\scripts\run-analysis.mjs --period all --output-dir ..\reports\github-trending --date 2026-07-06
```

## Skill 设计约束

- 执行不依赖 Codex 专属 API、工具协议或隐藏上下文；只需要 Node.js 与公开的 GitHub 页面访问能力
- `README.md` 与 `agents/` 目录只负责适配不同 Agent CLI 的读取入口，不改变核心执行链路
- `scripts/analysis-core.mjs` 与 `references/report-guidelines.md` 才是趋势分析逻辑与输出约束的真实来源
- dashboard 必须复用与 Markdown 相同的趋势结论和项目分析，不得产生两套独立口径
- dashboard 的日期导航必须从缓存快照构建：日报按天、周报按 ISO 周、月报按自然月聚合，并跳转到对应静态历史页
- agent 应把中文周期指令精确映射为参数：`每日 → daily`、`每周 → weekly`、`每月 → monthly`；组合请求只运行所列周期，未指定时才默认 `all`
- agent 应优先把它当作 skill 使用；手动执行脚本只是维护、调试或独立集成时的次级路径

## Agent 使用约定

如果 agent 运行在不同的环境中，建议按以下顺序读取：

- Claude Code
  - 直接读取 `agents/claude-code.md`
  - 再根据需要读取 `README.md`、`references/report-guidelines.md` 和 `scripts/analysis-core.mjs`
- OpenCode
  - 直接读取 `agents/agent-cli.md`
  - 再执行 `node .\scripts\run-analysis.mjs ...`
- 其他 Agent CLI
  - 直接读取 `README.md`
  - 再根据需要读取 `references/` 与 `scripts/analysis-core.mjs`

## 维护与验证

下面这些命令主要面向 skill 维护者，而不是面向普通使用者。

更新了分析逻辑、dashboard 结构或入口说明后，建议运行核心测试：

```powershell
node --test .\scripts\analysis-core.test.mjs
node --test .\scripts\dashboard\dashboard-data.test.mjs .\scripts\dashboard\dashboard-render.test.mjs
```

需要验证真实抓取链路时，再运行一次自检：

```powershell
node .\scripts\self-check.mjs
```

## 入口文件分工

- `README.md`：给通用 agent 与维护者看，说明 skill 定位、结构、执行链路与输出结果
- `SKILL.md`：给 Codex 用，只负责技能发现与高信号执行约束，不是唯一事实来源
- `agents/claude-code.md`：Claude Code 的 canonical 指令文件
- `agents/agent-cli.md`：OpenCode 与其他 Agent CLI 的 canonical 指令文件

如果要把这个目录独立发布到其他 Agent CLI 环境，至少保留以下内容即可完整工作：

- `README.md`
- `agents/`
- `references/`
- `scripts/`
- `assets/dashboard/`

如果你要修改趋势分析逻辑，优先查看：

- [SKILL.md](./SKILL.md)
- [agents/claude-code.md](./agents/claude-code.md)
- [agents/agent-cli.md](./agents/agent-cli.md)
- [references/report-guidelines.md](./references/report-guidelines.md)
- [scripts/analysis-core.mjs](./scripts/analysis-core.mjs)
