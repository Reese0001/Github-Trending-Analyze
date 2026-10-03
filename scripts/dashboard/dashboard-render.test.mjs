import test from "node:test";
import assert from "node:assert/strict";

import { renderDashboardHtml } from "./render-dashboard.mjs";

const repositories = [
  {
    period: "daily",
    rank: 1,
    fullName: "acme/daily-agent",
    projectLink: "https://github.com/acme/daily-agent",
    description: "Daily agent workflow launch.",
    language: "Go",
    stars: 5200,
    forks: 640,
    deltaStars: 1600,
    deltaLabel: "今日新增",
    isFocus: true,
    focusLabels: ["AI 智能体及其辅助工作"],
    themes: ["智能体与自动化工作流"],
    readmeHighlight: "Agent runtime for daily product workflows.",
    trendAnalysis: {
      overview: "社区正在把智能体推向更完整的执行闭环。",
      risk: "如果缺少稳定评测和权限控制，复杂系统会放大风险。",
      items: [
        {
          id: "agent-execution-loop",
          name: "智能体开始补齐执行闭环、记忆与工具编排",
          keywordLine: "Agent、Workflow、MCP",
          what: "让 Agent 从单轮交互升级为可持续运行的执行系统。",
          why: "长链路任务需要更稳定的执行、记忆和工具接入。",
          how: "通过多 Agent 协同、工具调用协议和长期记忆层实现。",
          risk: "复杂度上升会带来稳定性与安全性挑战。",
          representativeLine: "acme/daily-agent（今日新增1,600）",
          shortValueLine: "这些项目共同在解决执行链路不稳定与记忆缺失的问题。",
          valueLine: "这些项目共同在解决执行链路不稳定与记忆缺失的问题，说明社区热度正从概念验证转向可落地系统。",
        },
      ],
    },
    summary:
      "是什么：acme/daily-agent 是一个面向日常流程自动化的智能体运行时。解决什么问题：它主要解决团队在重复任务编排、交接和追踪上的效率问题。为什么值得被记住：如果你想把高频运营流程交给智能体稳定执行，它在本期以今日新增1,600 Star 体现出社区关注度。",
  },
  {
    period: "weekly",
    rank: 1,
    fullName: "acme/super-agent",
    projectLink: "https://github.com/acme/super-agent",
    description: "An agent workflow toolkit for shipping product features.",
    language: "TypeScript",
    stars: 18200,
    forks: 2400,
    deltaStars: 7200,
    deltaLabel: "本周新增",
    isFocus: true,
    focusLabels: ["AI 软件开发/代码自动化"],
    themes: ["AI 编程与开发自动化"],
    readmeHighlight: "Multi-agent task execution for product teams.",
    analysis: {
      oneLineSummary: "多智能体研发工作流，把任务拆解、上下文共享与交付执行串起来",
      what: "帮助产品团队协同完成开发任务的多智能体工具",
      how: "通过多 Agent 编排、上下文共享和工具调用推进研发任务",
      coreHighlights: [
        "支持多 Agent 协作与任务拆解",
        "共享项目上下文并保持执行连续性",
        "接入研发工具链形成交付闭环",
      ],
      insightText: "多智能体研发工作流，把任务拆解、上下文共享与交付执行串起来",
    },
    trendAnalysis: {
      overview: "榜单热度正在向真实研发场景中的工程化能力收敛。",
      risk: "如果只做工作流包装，缺少上下文与验证闭环，价值会被高估。",
      items: [
        {
          id: "ai-coding-engineering",
          name: "AI 编程从单点辅助走向工程化工作流",
          keywordLine: "AI Coding、Agent、Workflow",
          what: "让 AI 从单点编码辅助演进到完整研发链路协同。",
          why: "上下文断裂和工具链衔接问题正在成为主要瓶颈。",
          how: "依靠 MCP、代码索引、工作流编排和仓库级理解来支撑。",
          risk: "如果缺少稳定上下文管理和执行验证，工程化承诺容易落空。",
          representativeLine: "acme/super-agent（本周新增7,200）",
          shortValueLine: "这些项目共同在解决研发流程里的上下文断裂与工具链衔接问题。",
          valueLine: "这些项目共同在解决研发流程里的上下文断裂与工具链衔接问题，说明热度正在向真实工程场景收敛。",
        },
      ],
    },
    summary:
      "是什么：acme/super-agent 是一个帮助产品团队协同完成开发任务的多智能体工具。解决什么问题：它主要解决任务拆解、上下文共享和多角色协作效率问题。为什么值得被记住：如果你想让产品团队更快落地多代理协作，它在本期以本周新增7,200 Star 体现出社区关注度。",
  },
  {
    period: "monthly",
    rank: 1,
    fullName: "acme/monthly-one",
    projectLink: "https://github.com/acme/monthly-one",
    description: "Monthly chart leader.",
    language: "Python",
    stars: 80200,
    forks: 4100,
    deltaStars: 26100,
    deltaLabel: "本月新增",
    isFocus: false,
    focusLabels: [],
    themes: [],
    readmeHighlight: "Large monthly momentum.",
    trendAnalysis: {
      overview: "多模态内容生产正从单点生成转向系统化流水线。",
      risk: "渲染成本、质量波动和外部模型依赖会影响真实交付能力。",
      items: [
        {
          id: "multimodal-production",
          name: "多模态内容生成正在产品化和流水线化",
          keywordLine: "Multimodal、Video、Python",
          what: "把视频、图像和音频能力组织成可自动化交付的内容流水线。",
          why: "真实生产需要解决链路断裂和协作效率问题。",
          how: "通过多模态编排、渲染链路和自动化生产方法论支撑。",
          risk: "增长可能先于稳定产能和质量控制能力。",
          representativeLine: "acme/monthly-one（本月新增26,100）",
          shortValueLine: "这些项目共同在解决内容生产流程长和自动化不足的问题。",
          valueLine: "这些项目共同在解决内容生产流程长和自动化不足的问题，说明热度正在向规模化内容生产收敛。",
        },
      ],
    },
    summary:
      "是什么：acme/monthly-one 是一个月度增长最快的趋势项目。解决什么问题：它主要解决团队想快速了解长期热度变化时缺乏代表样本的问题。为什么值得被记住：如果你想把握月度趋势风向，它在本期以本月新增26,100 Star 体现出社区关注度。",
  },
];

test("dashboard renders single-column cards with meta row and core value lines", () => {
  const html = renderDashboardHtml(repositories, "2026-07-06");

  assert.equal(html.includes("Trend Queue"), false);
  assert.equal(html.includes("Growth Velocity"), false);
  assert.equal(html.includes("velocity-chart"), false);
  assert.doesNotMatch(html, /class="stats-grid"/);
  assert.doesNotMatch(html, /从每日、每周、每月 GitHub Trending 数据中提炼增长信号/);
  assert.match(html, /整体趋势分析/);
  assert.match(html, /AI 编程从单点辅助走向工程化工作流/);
  assert.match(html, /核心关键词：/);
  assert.match(html, /宏观 What：/);
  assert.match(html, /宏观 Why：/);
  assert.match(html, /宏观 How：/);
  assert.match(html, /代表项目：/);
  assert.match(html, /class="deep-list"/);
  assert.match(html, /一句话读懂/);
  assert.doesNotMatch(html, /AI Insight/);
  assert.match(html, /class="meta-row"/);
  assert.match(html, /<span class="meta-label">Star<\/span>/);
  assert.match(html, /<strong class="meta-value">18\.2k \+ 7\.2k<\/strong>/);
  assert.match(html, /<span class="meta-label">Fork<\/span>/);
  assert.match(html, /<span class="meta-label">Language<\/span>/);
  assert.match(html, /class="deep-card"[\s\S]*class="insight-panel"[\s\S]*class="meta-row"[\s\S]*class="core-value-panel"/);
  assert.match(html, /<span class="core-value-label">核心价值<\/span>/);
  assert.match(html, /class="core-value-list"/);
  assert.match(html, /class="highlight-list"/);
  assert.doesNotMatch(html, /class="deep-side"/);
  assert.doesNotMatch(html, /Theme:/);
  assert.match(html, /<strong class="core-value-key">what<\/strong>/);
  assert.match(html, /帮助产品团队协同完成开发任务的多智能体工具/);
  assert.match(html, /<strong class="core-value-key">how<\/strong>/);
  assert.match(html, /通过多 Agent 编排、上下文共享和工具调用推进研发任务/);
  assert.match(html, /<strong class="core-value-key">why<\/strong>/);
  assert.match(html, /支持多 Agent 协作与任务拆解/);
  assert.match(html, /共享项目上下文并保持执行连续性/);
  assert.match(html, /接入研发工具链形成交付闭环/);
  assert.doesNotMatch(html, /它是做什么的：/);
  assert.doesNotMatch(html, /解决了什么具体场景问题：/);
  assert.doesNotMatch(html, /它为什么会火：/);
});


test("dashboard renders period-aware historical snapshot selectors", () => {
  const html = renderDashboardHtml(repositories, "2026-07-27", {
    currentDate: "2026-07-27",
    snapshotMetadata: [
      { date: "2026-06-30", periods: ["daily", "weekly", "monthly"] },
      { date: "2026-07-20", periods: ["daily", "weekly", "monthly"] },
      { date: "2026-07-21", periods: ["daily", "weekly", "monthly"] },
      { date: "2026-07-27", periods: ["daily", "weekly", "monthly"] },
    ],
  });

  assert.match(html, /Archive Browser/);
  assert.match(html, /按时间加载历史榜单/);
  assert.match(html, /data-date-control="daily"/);
  assert.match(html, /data-date-control="weekly"/);
  assert.match(html, /data-date-control="monthly"/);
  assert.match(html, /\.\/history\/2026-07-21\.html\?period=daily/);
  assert.match(html, /2026 年第 31 周 · 07\/27–08\/02/);
  assert.match(html, /\.\/history\/2026-07-21\.html\?period=weekly/);
  assert.match(html, /2026 年 7 月/);
  assert.match(html, /\.\/history\/2026-07-27\.html\?period=monthly/);
  assert.match(html, /new URLSearchParams\(window\.location\.search\)/);
  assert.match(html, /window\.location\.href = select\.value/);
  assert.match(html, /data-lead-name=/);
  assert.match(html, /data-lead-growth=/);
  assert.match(html, /data-snapshot-date="2026-07-27"/);
});

test("historical dashboard pages resolve styles, assets, and sibling snapshots relatively", () => {
  const html = renderDashboardHtml(repositories, "2026-07-27", {
    currentDate: "2026-07-27",
    snapshotMetadata: [
      { date: "2026-07-20", periods: ["daily", "weekly", "monthly"] },
      { date: "2026-07-27", periods: ["daily", "weekly", "monthly"] },
    ],
    assetBase: "../assets",
    stylesheetHref: "../styles.css",
    historyPathPrefix: "./",
  });

  assert.match(html, /href="\.\.\/styles\.css"/);
  assert.match(html, /src="\.\.\/assets\/hero-background-281466\.png"/);
  assert.match(html, /value="\.\/2026-07-20\.html\?period=daily"/);
});
