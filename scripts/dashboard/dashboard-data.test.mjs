import test from "node:test";
import assert from "node:assert/strict";

import {
  buildDashboardModel,
  buildDashboardNavigation,
  formatCompactNumber,
  formatStarsThisPeriod,
} from "./dashboard-data.mjs";

const sampleRepositories = [
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
      overview: "社区正在把智能体从概念验证推进到可执行系统。",
      risk: "权限和评测缺失会放大复杂 Agent 系统的稳定性风险。",
      items: [
        {
          id: "agent-execution-loop",
          name: "智能体开始补齐执行闭环、记忆与工具编排",
          keywordLine: "Agent、Workflow、MCP",
          what: "让 Agent 从单轮问答走向可持续执行的工作系统。",
          why: "真实任务需要更长链路、更强记忆和更稳定工具调用。",
          how: "依靠任务编排、长期记忆和标准化工具接入来落地。",
          risk: "复杂度增加会带来稳定性和安全性问题。",
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
      overview: "榜单热度正在收敛到真实研发流程中的 AI 工程化能力。",
      risk: "如果缺少仓库级上下文和执行验证，工程化叙事会被高估。",
      items: [
        {
          id: "ai-coding-engineering",
          name: "AI 编程从单点辅助走向工程化工作流",
          keywordLine: "AI Coding、Agent、Workflow",
          what: "让 AI 从代码补全演进到完整研发链路协同。",
          why: "上下文断裂、工具链衔接和任务交接问题越来越突出。",
          how: "依靠 MCP、代码索引、工作流编排和仓库级理解支撑。",
          risk: "缺少上下文管理和执行闭环时，价值容易停留在演示层。",
          representativeLine: "acme/super-agent（本周新增7,200）、acme/rust-infra（本周新增5,300）",
          shortValueLine: "这些项目共同在解决研发流程里的上下文断裂与工具链衔接问题。",
          valueLine: "这些项目共同在解决研发流程里的上下文断裂与工具链衔接问题，说明热度正在向真实工程场景收敛。",
        },
      ],
    },
    summary:
      "是什么：acme/super-agent 是一个帮助产品团队协同完成开发任务的多智能体工具。解决什么问题：它主要解决任务拆解、上下文共享和多角色协作效率问题。为什么值得被记住：如果你想让产品团队更快落地多代理协作，它在本期以本周新增7,200 Star 体现出社区关注度。",
  },
  {
    period: "weekly",
    rank: 2,
    fullName: "acme/plain-trending",
    projectLink: "https://github.com/acme/plain-trending",
    description: "A high growth repository without an AI focus label.",
    language: "TypeScript",
    stars: 25600,
    forks: 1800,
    deltaStars: 8100,
    deltaLabel: "本周新增",
    isFocus: false,
    focusLabels: [],
    themes: [],
    readmeHighlight: "Fast-moving community momentum project.",
    trendAnalysis: {
      overview: "榜单热度正在收敛到真实研发流程中的 AI 工程化能力。",
      risk: "如果缺少仓库级上下文和执行验证，工程化叙事会被高估。",
      items: [
        {
          id: "ai-coding-engineering",
          name: "AI 编程从单点辅助走向工程化工作流",
          keywordLine: "AI Coding、Agent、Workflow",
          what: "让 AI 从代码补全演进到完整研发链路协同。",
          why: "上下文断裂、工具链衔接和任务交接问题越来越突出。",
          how: "依靠 MCP、代码索引、工作流编排和仓库级理解支撑。",
          risk: "缺少上下文管理和执行闭环时，价值容易停留在演示层。",
          representativeLine: "acme/super-agent（本周新增7,200）、acme/rust-infra（本周新增5,300）",
          shortValueLine: "这些项目共同在解决研发流程里的上下文断裂与工具链衔接问题。",
          valueLine: "这些项目共同在解决研发流程里的上下文断裂与工具链衔接问题，说明热度正在向真实工程场景收敛。",
        },
      ],
    },
    summary:
      "是什么：acme/plain-trending 是一个高增长的社区项目样本。解决什么问题：它主要解决开发者寻找成熟趋势参考时信息分散的问题。为什么值得被记住：如果你想快速判断社区正在追逐什么方向，它在本期以本周新增8,100 Star 体现出社区关注度。",
  },
  {
    period: "weekly",
    rank: 3,
    fullName: "acme/rust-infra",
    projectLink: "https://github.com/acme/rust-infra",
    description: "Memory-safe platform tooling for backend teams.",
    language: "Rust",
    stars: 16400,
    forks: 960,
    deltaStars: 5300,
    deltaLabel: "本周新增",
    isFocus: true,
    focusLabels: ["平台基础设施与工程化"],
    themes: ["平台基础设施与工程化"],
    readmeHighlight: "Ops-focused developer infrastructure.",
    trendAnalysis: {
      overview: "榜单热度正在收敛到真实研发流程中的 AI 工程化能力。",
      risk: "如果缺少仓库级上下文和执行验证，工程化叙事会被高估。",
      items: [
        {
          id: "ai-coding-engineering",
          name: "AI 编程从单点辅助走向工程化工作流",
          keywordLine: "AI Coding、Agent、Workflow",
          what: "让 AI 从代码补全演进到完整研发链路协同。",
          why: "上下文断裂、工具链衔接和任务交接问题越来越突出。",
          how: "依靠 MCP、代码索引、工作流编排和仓库级理解支撑。",
          risk: "缺少上下文管理和执行闭环时，价值容易停留在演示层。",
          representativeLine: "acme/super-agent（本周新增7,200）、acme/rust-infra（本周新增5,300）",
          shortValueLine: "这些项目共同在解决研发流程里的上下文断裂与工具链衔接问题。",
          valueLine: "这些项目共同在解决研发流程里的上下文断裂与工具链衔接问题，说明热度正在向真实工程场景收敛。",
        },
      ],
    },
    summary:
      "是什么：acme/rust-infra 是一个面向工程团队的平台基础设施工具。解决什么问题：它主要解决服务构建、部署可靠性和运行时性能优化问题。为什么值得被记住：如果你想为工程平台补齐可靠的底层能力，它在本期以本周新增5,300 Star 体现出社区关注度。",
  },
  {
    period: "weekly",
    rank: 4,
    fullName: "acme/agent-notes",
    projectLink: "https://github.com/acme/agent-notes",
    description: "Shared memory and notes for autonomous coding agents.",
    language: "Python",
    stars: 9800,
    forks: 720,
    deltaStars: 4100,
    deltaLabel: "本周新增",
    isFocus: true,
    focusLabels: ["AI 智能体及其辅助工作"],
    themes: ["智能体与自动化工作流"],
    readmeHighlight: "Persistent memory for long-running agents.",
    trendAnalysis: {
      overview: "榜单热度正在收敛到真实研发流程中的 AI 工程化能力。",
      risk: "如果缺少仓库级上下文和执行验证，工程化叙事会被高估。",
      items: [
        {
          id: "ai-coding-engineering",
          name: "AI 编程从单点辅助走向工程化工作流",
          keywordLine: "AI Coding、Agent、Workflow",
          what: "让 AI 从代码补全演进到完整研发链路协同。",
          why: "上下文断裂、工具链衔接和任务交接问题越来越突出。",
          how: "依靠 MCP、代码索引、工作流编排和仓库级理解支撑。",
          risk: "缺少上下文管理和执行闭环时，价值容易停留在演示层。",
          representativeLine: "acme/super-agent（本周新增7,200）、acme/rust-infra（本周新增5,300）",
          shortValueLine: "这些项目共同在解决研发流程里的上下文断裂与工具链衔接问题。",
          valueLine: "这些项目共同在解决研发流程里的上下文断裂与工具链衔接问题，说明热度正在向真实工程场景收敛。",
        },
      ],
    },
    summary:
      "是什么：acme/agent-notes 是一个为长任务智能体提供持久记忆的工具。解决什么问题：它主要解决多轮执行中的上下文遗失和任务衔接问题。为什么值得被记住：如果你想让智能体在长周期任务里保持稳定记忆，它在本期以本周新增4,100 Star 体现出社区关注度。",
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
      overview: "多模态内容生产正从单点生成转向完整流水线。",
      risk: "如果渲染成本和质量评估不可控，交付能力会弱于热度。",
      items: [
        {
          id: "multimodal-production",
          name: "多模态内容生成正在产品化和流水线化",
          keywordLine: "Multimodal、Video、Python",
          what: "把内容生成能力组织成可自动化交付的生产流水线。",
          why: "真实内容生产需要更完整的链路编排与协作效率。",
          how: "依靠多模态编排、渲染链路和自动化生产方法论落地。",
          risk: "增长可能先于稳定产能和质量控制。",
          representativeLine: "acme/monthly-two（本月新增21,400）",
          shortValueLine: "这些项目共同在解决内容生产流程长和自动化不足的问题。",
          valueLine: "这些项目共同在解决内容生产流程长和自动化不足的问题，说明热度正在向规模化内容生产收敛。",
        },
      ],
    },
    summary:
      "是什么：acme/monthly-one 是一个月度增长最快的趋势项目。解决什么问题：它主要解决团队想快速了解长期热度变化时缺乏代表样本的问题。为什么值得被记住：如果你想把握月度趋势风向，它在本期以本月新增26,100 Star 体现出社区关注度。",
  },
  {
    period: "monthly",
    rank: 2,
    fullName: "acme/monthly-two",
    projectLink: "https://github.com/acme/monthly-two",
    description: "AI video workflow stack.",
    language: "Python",
    stars: 48600,
    forks: 2200,
    deltaStars: 21400,
    deltaLabel: "本月新增",
    isFocus: true,
    focusLabels: ["AI 开源项目"],
    themes: ["多模态内容生成"],
    readmeHighlight: "Automated generation pipeline.",
    trendAnalysis: {
      items: [
        {
          id: "multimodal-production",
          name: "多模态内容生成正在产品化和流水线化",
          keywordLine: "Multimodal、Video、Python",
          representativeLine: "acme/monthly-two（本月新增21,400）",
          shortValueLine: "这些项目共同在解决内容生产流程长和自动化不足的问题。",
          valueLine: "这些项目共同在解决内容生产流程长和自动化不足的问题，说明热度正在向规模化内容生产收敛。",
        },
      ],
    },
    summary:
      "是什么：acme/monthly-two 是一个 AI 视频工作流项目。解决什么问题：它主要解决从素材到成片之间流程断裂和自动化不足的问题。为什么值得被记住：如果你想缩短内容生产链路，它在本期以本月新增21,400 Star 体现出社区关注度。",
  },
];

test("buildDashboardModel calculates headline signals for each period", () => {
  const model = buildDashboardModel(sampleRepositories, "2026-07-02");
  const weekly = model.periods.weekly;

  assert.deepEqual(model.periodOrder, ["daily", "weekly", "monthly"]);
  assert.equal(model.generatedAt, "2026-07-02");
  assert.equal(model.periods.daily.label, "每日");
  assert.equal(model.periods.daily.meta.deltaLabel, "今日新增");
  assert.equal(model.periods.daily.meta.starsPeriodLabel, "day");
  assert.equal(weekly.label, "每周");
  assert.equal(weekly.totalRepositories, 4);
  assert.equal(weekly.focusCount, 3);
  assert.equal(weekly.focusRatio, 75);
  assert.equal(weekly.dominantLanguage.name, "TypeScript");
  assert.equal(weekly.averageDelta, 6175);
  assert.equal(weekly.fastestMover.fullName, "acme/plain-trending");
  assert.equal(weekly.hero.title, "AI 编程从单点辅助走向工程化工作流");
  assert.match(weekly.hero.description, /核心关键词：AI Coding、Agent、Workflow/);
  assert.equal(weekly.trendHighlights[0].title, "AI 编程从单点辅助走向工程化工作流");
});

test("buildDashboardModel prioritizes focus repositories in the deep dive cards", () => {
  const model = buildDashboardModel(sampleRepositories, "2026-07-02");
  const weeklyCards = model.periods.weekly.deepDive;

  assert.deepEqual(
    weeklyCards.map((card) => card.fullName),
    ["acme/super-agent", "acme/rust-infra", "acme/agent-notes", "acme/plain-trending"],
  );
  assert.equal(weeklyCards[0].insightLabel, "一句话读懂");
  assert.equal(weeklyCards[0].categoryChip, "AI Coding");
  assert.equal(weeklyCards[0].starsThisPeriod, "7.2k stars this week");
  assert.equal(
    weeklyCards[0].insightText,
    sampleRepositories[1].analysis.oneLineSummary,
  );
  assert.equal(weeklyCards[3].insightLabel, "一句话读懂");
  assert.deepEqual(weeklyCards[0].metaItems, [
    { label: "Star", value: "18.2k + 7.2k" },
    { label: "Fork", value: "2.4k" },
    { label: "Language", value: "TypeScript" },
  ]);
  assert.deepEqual(weeklyCards[0].coreValueItems, [
    { label: "what", text: "帮助产品团队协同完成开发任务的多智能体工具" },
    { label: "how", text: "通过多 Agent 编排、上下文共享和工具调用推进研发任务" },
    {
      label: "why",
      highlights: [
        "支持多 Agent 协作与任务拆解",
        "共享项目上下文并保持执行连续性",
        "接入研发工具链形成交付闭环",
      ],
    },
  ]);
  assert.deepEqual(weeklyCards[0].coreValueLines, [
    "what：帮助产品团队协同完成开发任务的多智能体工具",
    "how：通过多 Agent 编排、上下文共享和工具调用推进研发任务",
    "why：1）支持多 Agent 协作与任务拆解；2）共享项目上下文并保持执行连续性；3）接入研发工具链形成交付闭环",
  ]);
});

test("buildDashboardModel falls back to repo signals when summary is missing", () => {
  const model = buildDashboardModel(
    [
      {
        period: "daily",
        rank: 1,
        fullName: "acme/runbook-agent",
        projectLink: "https://github.com/acme/runbook-agent",
        description: "Shared incident automation for ops teams.",
        language: "TypeScript",
        stars: 4200,
        forks: 320,
        deltaStars: 430,
        deltaLabel: "今日新增",
        isFocus: true,
        focusLabels: ["AI 智能体及其辅助工作"],
        themes: ["智能体与自动化工作流"],
        readmeHighlight: "Automates incident triage and response runbooks.",
        summary: "",
      },
    ],
    "2026-07-02",
  );

  const fallbackCard = model.periods.daily.deepDive[0];
  assert.deepEqual(fallbackCard.coreValueItems.map((item) => item.label), ["what", "how", "why"]);
  assert.equal(fallbackCard.coreValueItems[2].highlights.length, 3);
  assert.equal(fallbackCard.insightLabel, "一句话读懂");
});

test("formatters keep dashboard metrics readable", () => {
  assert.equal(formatCompactNumber(950), "950");
  assert.equal(formatCompactNumber(7200), "7.2k");
  assert.equal(formatCompactNumber(1265000), "1.3M");
  assert.equal(formatStarsThisPeriod(26100, "month"), "26.1k stars this month");
});


test("buildDashboardNavigation groups snapshots by day, ISO week, and month", () => {
  const navigation = buildDashboardNavigation(
    [
      { date: "2026-06-30", periods: ["daily", "weekly", "monthly"] },
      { date: "2026-07-20", periods: ["daily", "weekly", "monthly"] },
      { date: "2026-07-21", periods: ["daily", "weekly", "monthly"] },
      { date: "2026-07-27", periods: ["daily", "weekly", "monthly"] },
    ],
    "2026-07-27",
  );

  assert.deepEqual(
    navigation.dateOptions.daily.map((option) => option.date),
    ["2026-07-27", "2026-07-21", "2026-07-20", "2026-06-30"],
  );
  assert.deepEqual(
    navigation.dateOptions.weekly.map((option) => [option.key, option.date]),
    [
      ["2026-W31", "2026-07-27"],
      ["2026-W30", "2026-07-21"],
      ["2026-W27", "2026-06-30"],
    ],
  );
  assert.equal(navigation.dateOptions.weekly[0].label, "2026 年第 31 周 · 07/27–08/02");
  assert.deepEqual(
    navigation.dateOptions.monthly.map((option) => [option.label, option.date]),
    [
      ["2026 年 7 月", "2026-07-27"],
      ["2026 年 6 月", "2026-06-30"],
    ],
  );
  assert.deepEqual(navigation.selectedBuckets, {
    daily: "2026-07-27",
    weekly: "2026-W31",
    monthly: "2026-07",
  });
});

test("buildDashboardNavigation keeps the latest snapshot available in each period bucket", () => {
  const navigation = buildDashboardNavigation(
    [
      { date: "2026-07-20", periods: ["daily", "weekly"] },
      { date: "2026-07-21", periods: ["daily"] },
      { date: "2026-07-22", periods: ["weekly", "monthly"] },
    ],
    "2026-07-22",
  );

  assert.equal(navigation.dateOptions.daily[0].date, "2026-07-21");
  assert.equal(navigation.dateOptions.weekly[0].date, "2026-07-22");
  assert.equal(navigation.dateOptions.monthly[0].date, "2026-07-22");
  assert.deepEqual(navigation.periodOrder, ["daily", "weekly", "monthly"]);
});
