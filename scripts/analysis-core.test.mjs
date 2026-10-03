import test from "node:test";
import assert from "node:assert/strict";
import { access, mkdtemp, readFile, rm } from "node:fs/promises";
import os from "node:os";
import path from "node:path";

import {
  buildTrendAnalysis,
  classifyRepository,
  mergePeriodRepositories,
  normalizePeriodSelection,
  parseArgs,
  parseTrendingHtml,
  renderMarkdownReport,
  runAnalysis,
  summarizeRepository,
} from "./analysis-core.mjs";

function makeRepo(overrides = {}) {
  return summarizeRepository(
    classifyRepository({
      fullName: "acme/codeflow-agent",
      description: "Coding agent for software engineering workflows.",
      readmeText: "Codeflow Agent is a coding agent that runs locally for software engineering workflows.",
      readmeHighlight: "Codeflow Agent is a coding agent that runs locally for software engineering workflows.",
      trendingSnippet: "coding agent local cli software engineering",
      deltaLabel: "今日新增",
      deltaStars: 1000,
      stars: 10000,
      projectLink: "https://github.com/acme/codeflow-agent",
      language: "Rust",
      rank: 1,
      period: "daily",
      owner: "acme",
      name: "codeflow-agent",
      ...overrides,
    }),
  );
}

test("parseArgs accepts single periods and all periods", () => {
  assert.deepEqual(parseArgs(["--period", "daily"]).periods, ["daily"]);
  assert.equal(parseArgs(["--period", "daily"]).period, "daily");
  assert.deepEqual(parseArgs(["--period", "all"]).periods, ["daily", "weekly", "monthly"]);
  assert.equal(parseArgs(["--period", "all"]).period, "all");
});

test("parseArgs accepts comma-separated and repeated period combinations", () => {
  const dailyWeekly = parseArgs(["--period", "daily,weekly"]);
  assert.deepEqual(dailyWeekly.periods, ["daily", "weekly"]);
  assert.equal(dailyWeekly.period, "daily,weekly");

  const weeklyMonthly = parseArgs(["--periods", "weekly,monthly"]);
  assert.deepEqual(weeklyMonthly.periods, ["weekly", "monthly"]);
  assert.equal(weeklyMonthly.period, "weekly,monthly");

  const repeated = parseArgs(["--period", "monthly", "--period", "daily"]);
  assert.deepEqual(repeated.periods, ["daily", "monthly"]);
  assert.equal(repeated.period, "daily,monthly");

  const spaceSeparated = parseArgs(["--period", "weekly", "monthly", "--date", "2026-07-27"]);
  assert.deepEqual(spaceSeparated.periods, ["weekly", "monthly"]);
  assert.equal(spaceSeparated.period, "weekly,monthly");

  const completeCombination = parseArgs(["--period", "daily+weekly+monthly"]);
  assert.deepEqual(completeCombination.periods, ["daily", "weekly", "monthly"]);
  assert.equal(completeCombination.period, "all");
});

test("parseArgs rejects unsupported or empty period values", () => {
  assert.throws(
    () => parseArgs(["--period", "yearly"]),
    /--period contains unsupported value\(s\): yearly/,
  );
  assert.throws(
    () => parseArgs(["--period", ""]),
    /--period requires at least one period/,
  );
  assert.throws(
    () => parseArgs(["--period", "all,yearly"]),
    /--period contains unsupported value\(s\): yearly/,
  );
});

test("normalizePeriodSelection removes duplicates and keeps canonical order", () => {
  assert.deepEqual(normalizePeriodSelection(["monthly,daily", "daily"]), ["daily", "monthly"]);
  assert.deepEqual(normalizePeriodSelection("both"), ["daily", "weekly", "monthly"]);
});

test("mergePeriodRepositories replaces selected periods and preserves other cached periods", () => {
  const existing = [
    { period: "daily", rank: 1, fullName: "acme/old-daily" },
    { period: "weekly", rank: 1, fullName: "acme/old-weekly" },
    { period: "monthly", rank: 1, fullName: "acme/old-monthly" },
  ];
  const current = [
    { period: "daily", rank: 2, fullName: "acme/new-daily-two" },
    { period: "daily", rank: 1, fullName: "acme/new-daily-one" },
    { period: "weekly", rank: 1, fullName: "acme/new-weekly" },
  ];

  const merged = mergePeriodRepositories(existing, current, ["daily", "weekly"]);
  assert.deepEqual(
    merged.map((repository) => repository.fullName),
    ["acme/new-daily-one", "acme/new-daily-two", "acme/new-weekly", "acme/old-monthly"],
  );
});

test("parseTrendingHtml parses daily stars today growth label", () => {
  const html = `
    <article class="Box-row">
      <h2><a href="/acme/daily-agent">acme / daily-agent</a></h2>
      <p class="col-9 color-fg-muted my-1 pr-4">Agent workflow toolkit.</p>
      <span itemprop="programmingLanguage">TypeScript</span>
      <a href="/acme/daily-agent/stargazers">12,345</a>
      <a href="/acme/daily-agent/forks">678</a>
      <span>Built by
        <a href="/alice"><img class="avatar mb-1 avatar-user" alt="@alice" /></a>
        <a href="/bob"><img class="avatar mb-1 avatar-user" alt="@bob" /></a>
      </span>
      <span>1,234 stars today</span>
    </article>
  `;

  const [repo] = parseTrendingHtml(html, "daily");

  assert.equal(repo.fullName, "acme/daily-agent");
  assert.equal(repo.stars, 12345);
  assert.equal(repo.forks, 678);
  assert.equal(repo.deltaStars, 1234);
  assert.equal(repo.deltaLabel, "今日新增");
  assert.deepEqual(
    repo.contributors.map((contributor) => contributor.login),
    ["alice", "bob"],
  );
});

test("trend analysis summarizes repositories into one to two core trends", () => {
  const markdown = buildTrendAnalysis(
    [
      makeRepo({
        fullName: "acme/codeflow-agent",
        description: "Coding agent for software engineering workflows.",
        readmeText: "Codeflow Agent is a coding agent with MCP and workflow support.",
        trendingSnippet: "coding agent mcp developer workflow",
        deltaStars: 2200,
        language: "Rust",
      }),
      makeRepo({
        fullName: "acme/agent-memory",
        description: "Persistent memory for multi-agent orchestration.",
        readmeText: "Agent memory and workflow orchestration for long-running tasks.",
        trendingSnippet: "agent memory workflow orchestrator",
        deltaStars: 1800,
        language: "TypeScript",
      }),
      makeRepo({
        fullName: "acme/model-router",
        description: "OpenAI-compatible model router for inference providers.",
        readmeText: "Model router and inference gateway for multi-provider AI stacks.",
        trendingSnippet: "openai-compatible inference provider model router",
        deltaStars: 900,
        language: "Go",
      }),
    ],
    "daily",
  );

  assert.match(markdown, /🔥 核心技术趋势洞察/);
  assert.match(markdown, /📊 趋势拆解分析/);
  assert.match(markdown, /1\. 🎯 宏观 What \(演进方向\)：/);
  assert.match(markdown, /- 核心关键词：/);
  assert.match(markdown, /- 💡 宏观 Why \(核心驱动力\)：/);
  assert.match(markdown, /- ⚙️ 宏观 How \(底层支撑\)：/);
  assert.match(markdown, /- 🏆 代表项目：/);
  assert.match(markdown, /⚠️ 潜在风险与冷思考/);
});

test("daily markdown report includes required publishable project fields", () => {
  const markdown = renderMarkdownReport({
    period: "daily",
    date: "2026-07-03",
    repos: [makeRepo()],
  });

  assert.match(markdown, /^# GitHub Trending 日报 \| 2026-07-03/m);
  assert.match(markdown, /https:\/\/github\.com\/trending\?since=daily/);
  assert.match(markdown, /## 整体趋势分析/);
  assert.match(markdown, /🔥 核心技术趋势洞察/);
  assert.match(markdown, /### 1\. \[acme\/codeflow-agent\]/);
  assert.match(markdown, /- Star：10,000/);
  assert.match(markdown, /- 今日新增：1,000/);
  assert.match(markdown, /- 一句话读懂：/);
  assert.match(markdown, /- 核心价值：/);
  assert.match(markdown, /  - \*\*what\*\*：/);
  assert.match(markdown, /  - \*\*how\*\*：/);
  assert.match(markdown, /  - \*\*why\*\*：/);
  assert.match(markdown, /    1\. /);
  assert.match(markdown, /    2\. /);
  assert.match(markdown, /    3\. /);
  assert.doesNotMatch(markdown, /- AI Insight：/);
  assert.match(markdown, /【重点关注/);
});


test("project analysis turns README evidence into a one-line summary and three core highlights", () => {
  const codebaseMemory = summarizeRepository(
    classifyRepository({
      fullName: "DeusData/codebase-memory-mcp",
      description: "High-performance code intelligence MCP server that indexes codebases into a persistent knowledge graph.",
      readmeText:
        "Indexes every codebase into a persistent knowledge graph. 158 languages are supported. " +
        "15 MCP tools provide architecture, search, call graph, trace and impact analysis. " +
        "Structural queries use 120x fewer tokens.",
      readmeHighlight: "A codebase knowledge graph for coding agents.",
      trendingSnippet: "codebase knowledge graph mcp code intelligence",
      deltaLabel: "本月新增",
      deltaStars: 20672,
      stars: 35695,
      projectLink: "https://github.com/DeusData/codebase-memory-mcp",
      language: "C",
      rank: 1,
      period: "monthly",
      owner: "DeusData",
      name: "codebase-memory-mcp",
    }),
  );

  assert.equal(
    codebaseMemory.analysis.oneLineSummary,
    "为 AI 编程 Agent 构建本地代码知识图谱，省 Token 看懂大仓库",
  );
  assert.deepEqual(codebaseMemory.analysis.coreHighlights, [
    "将代码库索引为可持续更新的本地知识图谱",
    "支持 158 种语言的代码解析与索引",
    "通过 MCP 提供架构、搜索、调用链与影响分析",
  ]);

  const strix = summarizeRepository(
    classifyRepository({
      fullName: "usestrix/strix",
      description: "Open-source AI penetration testing agents that find and fix vulnerabilities.",
      readmeText:
        "Autonomous AI pentesting agents perform reconnaissance, exploitation and validation. " +
        "Every finding includes a working proof-of-concept and remediation guidance with auto-fix patches. " +
        "GitHub Actions and CI/CD pipelines run security scans and produce reports.",
      readmeHighlight: "The open-source AI pentesting tool.",
      trendingSnippet: "autonomous ai pentest vulnerability security",
      deltaLabel: "本月新增",
      deltaStars: 18515,
      stars: 44673,
      projectLink: "https://github.com/usestrix/strix",
      language: "Python",
      rank: 2,
      period: "monthly",
      owner: "usestrix",
      name: "strix",
    }),
  );

  assert.equal(
    strix.analysis.oneLineSummary,
    "开源 AI 渗透测试 Agent，自动发现、验证并辅助修复漏洞",
  );
  assert.deepEqual(strix.analysis.coreHighlights, [
    "自动执行侦察、利用与漏洞验证",
    "生成可复现 PoC、修复建议与补丁",
    "支持 CI/CD 安全扫描与报告输出",
  ]);
});


test("runAnalysis generates only requested combinations and preserves other same-date cache periods", async (t) => {
  const outputDir = await mkdtemp(path.join(os.tmpdir(), "github-trending-periods-"));
  const originalFetch = globalThis.fetch;
  t.after(async () => {
    globalThis.fetch = originalFetch;
    await rm(outputDir, { recursive: true, force: true });
  });

  const periodGrowth = {
    daily: "101 stars today",
    weekly: "202 stars this week",
    monthly: "303 stars this month",
  };
  globalThis.fetch = async (url) => {
    const target = String(url);
    if (target.includes("/trending?since=")) {
      const period = new URL(target).searchParams.get("since");
      const html = `
        <article class="Box-row">
          <h2><a href="/acme/${period}-repo">acme / ${period}-repo</a></h2>
          <p class="col-9 color-fg-muted my-1 pr-4">${period} combination fixture.</p>
          <span itemprop="programmingLanguage">TypeScript</span>
          <a href="/acme/${period}-repo/stargazers">1,234</a>
          <a href="/acme/${period}-repo/forks">56</a>
          <span>${periodGrowth[period]}</span>
        </article>
      `;
      return new Response(html, { status: 200 });
    }

    return new Response(
      '<article class="markdown-body entry-content container-lg"><h1>Fixture</h1><p>Agent workflow with static cache support.</p></article>',
      { status: 200 },
    );
  };

  const first = await runAnalysis({
    period: "daily,weekly",
    periods: ["daily", "weekly"],
    outputDir,
    date: "2026-07-27",
  });
  assert.deepEqual(first.reports.map((report) => report.period), ["daily", "weekly"]);
  await access(path.join(outputDir, "2026-07-27-daily.md"));
  await access(path.join(outputDir, "2026-07-27-weekly.md"));
  await assert.rejects(access(path.join(outputDir, "2026-07-27-monthly.md")));

  const second = await runAnalysis({
    period: "weekly,monthly",
    periods: ["weekly", "monthly"],
    outputDir,
    date: "2026-07-27",
  });
  assert.deepEqual(second.reports.map((report) => report.period), ["weekly", "monthly"]);
  await access(path.join(outputDir, "2026-07-27-monthly.md"));

  const cachedRepositories = JSON.parse(
    await readFile(path.join(outputDir, "cache", "2026-07-27", "enriched-repositories.json"), "utf8"),
  );
  assert.deepEqual(
    [...new Set(cachedRepositories.map((repository) => repository.period))],
    ["daily", "weekly", "monthly"],
  );
});
