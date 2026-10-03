import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  classifyRepository,
  extractReadmeTextFromHtml,
  parseTrendingHtml,
  renderMarkdownReport,
  runAnalysis,
  summarizeRepository,
} from "./analysis-core.mjs";

async function fetchGithubHtml(url) {
  return fetch(url, {
    headers: { "user-agent": "Mozilla/5.0" },
  }).then((response) => response.text());
}

async function main() {
  const scriptDir = path.dirname(fileURLToPath(import.meta.url));

  for (const period of ["daily", "weekly", "monthly"]) {
    const trendingHtml = await fetchGithubHtml(`https://github.com/trending?since=${period}`);
    const repos = parseTrendingHtml(trendingHtml, period);
    assert.ok(repos.length > 0, `${period} parser should return repositories`);
    assert.ok(
      repos.every(
        (repo) =>
          repo.projectLink &&
          repo.stars >= 0 &&
          repo.forks >= 0 &&
          repo.deltaStars >= 0 &&
          Array.isArray(repo.contributors),
      ),
      `${period} parser should capture link, star, fork, and contributor fields`,
    );
  }

  const repoHtml = await fetchGithubHtml("https://github.com/modelcontextprotocol/servers");
  const readme = extractReadmeTextFromHtml(repoHtml);
  assert.ok(readme.readmeText.length > 0, "README extraction should return text");
  assert.ok(readme.readmeSource === "overview-files", "README should come from overview files");

  const aiRepo = summarizeRepository(
    classifyRepository({
      fullName: "acme/codeflow-agent",
      description: "Coding agent for software engineering workflows.",
      readmeText: "Codeflow Agent is a coding agent that runs locally for software engineering workflows.",
      readmeHighlight: "Codeflow Agent is a coding agent that runs locally for software engineering workflows.",
      trendingSnippet: "coding agent local cli software engineering",
      deltaLabel: "本周新增",
      deltaStars: 1000,
      stars: 10000,
      projectLink: "https://github.com/acme/codeflow-agent",
      language: "Rust",
      rank: 1,
      period: "weekly",
      owner: "acme",
      name: "codeflow-agent",
    }),
  );
  assert.ok(aiRepo.isFocus, "AI coding repo should be marked as focus");
  assert.ok(aiRepo.focusLabels.includes("AI 软件开发/代码自动化"), "AI coding repo should get the coding focus label");

  const nonAiRepo = classifyRepository({
    fullName: "sharkdp/fd",
    description: "A simple, fast and user-friendly alternative to find.",
    readmeText: "fd is a program to find entries in your filesystem.",
    readmeHighlight: "",
    trendingSnippet: "filesystem search utility",
    deltaLabel: "本周新增",
    deltaStars: 50,
    stars: 1000,
    projectLink: "https://github.com/sharkdp/fd",
    language: "Rust",
    rank: 1,
    period: "weekly",
    owner: "sharkdp",
    name: "fd",
  });
  assert.ok(!nonAiRepo.isFocus, "non-AI repo should stay outside focus labels");

  const markdown = renderMarkdownReport({
    period: "weekly",
    date: "2026-07-02",
    repos: [aiRepo],
  });
  assert.ok(!markdown.includes("本期重点关注"), "markdown should not render a focus-only section");
  assert.ok(markdown.includes("【重点关注："), "markdown should show inline focus badge");
  assert.ok(markdown.includes("- 项目链接："), "markdown should include project link");
  assert.ok(markdown.includes("- 一句话读懂："), "markdown should include one-line project summary");
  assert.ok(markdown.includes("- **what**："), "markdown should include project what");
  assert.ok(markdown.includes("- **how**："), "markdown should include project how");
  assert.ok(markdown.includes("- **why**："), "markdown should include project highlights");
  assert.ok(!markdown.includes("AI Insight"), "markdown should not include the old AI Insight label");
  assert.ok(markdown.includes("🎯 宏观 What (演进方向)："), "markdown should render structured trend headings");
  assert.ok(markdown.includes("核心关键词："), "markdown should render structured trend keywords");

  const outputDir = path.join(scriptDir, "..", "tmp-self-check-output");
  const result = await runAnalysis({
    period: "daily",
    outputDir,
    date: "2026-07-02",
  });
  assert.ok(result.dashboardPath.endsWith("dashboard\\index.html") || result.dashboardPath.endsWith("dashboard/index.html"));
  const dashboardHtml = await readFile(result.dashboardPath, "utf8");
  const historyPath = path.join(path.dirname(result.dashboardPath), "history", "2026-07-02.html");
  const historyHtml = await readFile(historyPath, "utf8");
  assert.ok(dashboardHtml.includes('data-date-control="daily"'), "dashboard should render a daily date selector");
  assert.ok(dashboardHtml.includes("Archive Browser"), "dashboard should render the history browser");
  assert.ok(historyHtml.includes('../styles.css'), "history page should resolve shared styles relatively");

  console.log("[ok] self-check passed");
}

main().catch((error) => {
  console.error(error.stack || error.message);
  process.exitCode = 1;
});
