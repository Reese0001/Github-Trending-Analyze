import test from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";

import { writeDashboard } from "../analysis-core.mjs";

function buildRepository(period, dateSuffix) {
  const deltaLabels = {
    daily: "今日新增",
    weekly: "本周新增",
    monthly: "本月新增",
  };

  return {
    period,
    rank: 1,
    fullName: `acme/${period}-${dateSuffix}`,
    projectLink: `https://github.com/acme/${period}-${dateSuffix}`,
    description: `${period} test repository`,
    language: "TypeScript",
    stars: 1200,
    forks: 120,
    deltaStars: 240,
    deltaLabel: deltaLabels[period],
    isFocus: false,
    focusLabels: [],
    themes: [],
    readmeHighlight: "Static dashboard archive fixture.",
    summary: `一句话读懂：${period} 历史快照测试项目。what：静态 Dashboard 测试项目。how：通过缓存快照生成历史页面。why：1）无需服务端；2）支持相对路径；3）可按周期切换。`,
  };
}

function buildSnapshot(dateSuffix) {
  return ["daily", "weekly", "monthly"].map((period) => buildRepository(period, dateSuffix));
}

test("writeDashboard scans cached dates and writes static history pages", async (t) => {
  const outputDir = await mkdtemp(path.join(os.tmpdir(), "github-trending-dashboard-"));
  t.after(() => rm(outputDir, { recursive: true, force: true }));

  const oldSnapshot = buildSnapshot("old");
  const currentSnapshot = buildSnapshot("current");
  const oldCacheDir = path.join(outputDir, "cache", "2026-07-20");
  await mkdir(oldCacheDir, { recursive: true });
  await writeFile(
    path.join(oldCacheDir, "enriched-repositories.json"),
    `${JSON.stringify(oldSnapshot, null, 2)}\n`,
  );

  const dashboardPath = await writeDashboard({
    outputDir,
    date: "2026-07-27",
    repos: currentSnapshot,
  });

  const indexHtml = await readFile(dashboardPath, "utf8");
  const oldHistoryHtml = await readFile(
    path.join(outputDir, "dashboard", "history", "2026-07-20.html"),
    "utf8",
  );
  const currentHistoryHtml = await readFile(
    path.join(outputDir, "dashboard", "history", "2026-07-27.html"),
    "utf8",
  );

  assert.match(indexHtml, /\.\/history\/2026-07-20\.html\?period=daily/);
  assert.match(indexHtml, /2026 年第 30 周 · 07\/20–07\/26/);
  assert.match(indexHtml, /2026 年 7 月/);
  assert.match(oldHistoryHtml, /href="\.\.\/styles\.css"/);
  assert.match(oldHistoryHtml, /\.\/2026-07-27\.html\?period=daily/);
  assert.match(currentHistoryHtml, /data-snapshot-date="2026-07-27"/);
});
