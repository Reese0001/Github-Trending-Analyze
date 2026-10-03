const PERIOD_META = {
  daily: {
    label: "每日",
    deltaLabel: "今日新增",
    starsPeriodLabel: "day",
  },
  weekly: {
    label: "每周",
    deltaLabel: "本周新增",
    starsPeriodLabel: "week",
  },
  monthly: {
    label: "每月",
    deltaLabel: "本月新增",
    starsPeriodLabel: "month",
  },
};

const PERIOD_ORDER = ["daily", "weekly", "monthly"];

const CATEGORY_RULES = [
  { match: /AI 软件开发|代码自动化|coding|code/i, name: "AI Coding" },
  { match: /智能体|agent/i, name: "Agent Systems" },
  { match: /基础设施|infra|platform|rust/i, name: "Infra" },
  { match: /视频|media|content/i, name: "Media Ops" },
];

function classifyCategory(repository) {
  const signals = [
    ...(repository.focusLabels || []),
    ...(repository.themes || []),
    repository.fullName || "",
    repository.description || "",
    repository.readmeHighlight || "",
  ].join(" ");

  const match = CATEGORY_RULES.find((rule) => rule.match.test(signals));
  return match?.name || "Community Build";
}

function normalizeLanguage(language) {
  return language || "未标注";
}

function formatCompactNumber(value) {
  if (value >= 1_000_000) {
    return `${(value / 1_000_000).toFixed(1).replace(/\.0$/, "")}M`;
  }

  if (value >= 1_000) {
    return `${(value / 1_000).toFixed(1).replace(/\.0$/, "")}k`;
  }

  return String(value);
}

function formatStarsThisPeriod(deltaStars, periodLabel) {
  return `${formatCompactNumber(deltaStars)} stars this ${periodLabel}`;
}

function splitSummarySections(summary) {
  const text = String(summary || "").trim();
  if (!text) {
    return {
      oneLine: "",
      what: "",
      how: "",
      problem: "",
      why: "",
      highlights: [],
    };
  }

  const extract = (label, nextLabels) => {
    const start = text.indexOf(`${label}：`);
    if (start === -1) {
      return "";
    }

    const contentStart = start + label.length + 1;
    const end = nextLabels
      .map((nextLabel) => text.indexOf(`${nextLabel}：`, contentStart))
      .filter((index) => index !== -1)
      .sort((left, right) => left - right)[0];

    return text.slice(contentStart, end === undefined ? text.length : end).trim().replace(/[。]+$/u, "");
  };

  const oneLine = extract("一句话读懂", ["what", "how", "why"]);
  const what = extract("what", ["how", "why"]) || extract("是什么", ["解决什么问题", "为什么值得被记住"]);
  const how = extract("how", ["why"]) || extract("解决什么问题", ["为什么值得被记住"]);
  const why = extract("why", []) || extract("为什么值得被记住", []);
  const highlights = [...why.matchAll(/(?:^|；)\s*\d+[）.)]\s*([^；。]+)/gu)].map((match) => match[1].trim());

  return {
    oneLine,
    what,
    how,
    problem: how,
    why,
    highlights,
  };
}

function normalizeAnalysis(repository) {
  return repository.analysis || {
    oneLineSummary: "",
    what: "",
    how: "",
    coreHighlights: [],
    projectIntro: "",
    problemScenario: "",
    technicalHighlight: "",
    whyHot: "",
    insightText: "",
  };
}

function cleanSentence(value) {
  return String(value || "").trim().replace(/[。.!?]+$/u, "");
}

function quoteSignal(value) {
  return `“${cleanSentence(value)}”`;
}

function formatGrowthSignal(deltaStars, meta) {
  return `${meta.deltaLabel}${Number(deltaStars || 0).toLocaleString("en-US")} Star`;
}

function rewriteWhyFromSummary(why) {
  const text = cleanSentence(why);
  const ifYouWantMatch = text.match(/^如果你想(.+)$/u);

  if (!ifYouWantMatch) {
    return text;
  }

  const needText = ifYouWantMatch[1];
  const firstCommaIndex = needText.indexOf("，");
  if (firstCommaIndex === -1) {
    return `它切中了${cleanSentence(needText)}的需求`;
  }

  const need = cleanSentence(needText.slice(0, firstCommaIndex));
  const trailing = needText.slice(firstCommaIndex + 1).trim();
  return `它切中了${need}的需求${trailing ? `，${trailing}` : ""}`;
}

function buildWhatLine(repository, summaryParts) {
  return summaryParts.what || cleanSentence(repository.description) || repository.fullName;
}

function buildProblemLine(repository, summaryParts) {
  if (summaryParts.problem) {
    return summaryParts.problem;
  }

  const readmeHighlight = cleanSentence(repository.readmeHighlight);
  if (readmeHighlight) {
    return `它主要解决团队在${readmeHighlight}这类场景下，信息分散、流程割裂或执行成本偏高的问题`;
  }

  if ((repository.themes || []).length > 0) {
    return `它主要解决${repository.themes[0]}落地过程中，协作链路不清、工具衔接松散或交付效率不足的问题`;
  }

  if ((repository.focusLabels || []).length > 0) {
    return `它主要解决${repository.focusLabels[0]}从想法走向实际应用时，落地成本高、流程复杂或经验门槛偏高的问题`;
  }

  return "它主要解决团队在理解项目价值、组织执行流程和连接使用场景时的摩擦成本问题";
}

function buildWhyLine(repository, summaryParts, meta) {
  const focusLabel = repository.isFocus ? "它同时命中重点关注方向，并" : "它";
  const growthSignal = formatGrowthSignal(repository.deltaStars, meta);

  if (summaryParts.why) {
    const rewrittenWhy = rewriteWhyFromSummary(summaryParts.why);
    if (rewrittenWhy.includes("Star") || rewrittenWhy.includes(meta.deltaLabel)) {
      return rewrittenWhy;
    }

    return `${rewrittenWhy}，它在本期以${growthSignal}体现出社区关注度`;
  }

  const readmeHighlight = cleanSentence(repository.readmeHighlight);
  if (readmeHighlight) {
    return `${focusLabel}在本期拿到${growthSignal}；同时它的价值主张${quoteSignal(readmeHighlight)}足够直接，容易被开发者快速理解和传播`;
  }

  if ((repository.themes || []).length > 0) {
    return `${focusLabel}在${repository.themes[0]}这条热线上提供了更容易落地的方案，并在本期拿到${growthSignal}`;
  }

  if ((repository.focusLabels || []).length > 0) {
    return `${focusLabel}围绕${repository.focusLabels[0]}提供了更贴近真实工作流的能力组合，并在本期拿到${growthSignal}`;
  }

  return `${focusLabel}在本期拿到${growthSignal}，说明它的定位足够清晰，也更容易被社区快速采纳和扩散`;
}

function buildHero(periodData) {
  const topTrend = periodData.trendItems[0];
  const topFocus = periodData.repositories.find((repository) => repository.isFocus);
  const fallback = periodData.fastestMover;
  const subject = topFocus || fallback;
  const category = classifyCategory(subject);

  if (topTrend) {
    return {
      eyebrow: "TREND SIGNAL",
      title: topTrend.name,
      description:
        `核心关键词：${topTrend.keywordLine}。` +
        `代表项目：${topTrend.representativeLine}。` +
        ` ${topTrend.what || topTrend.shortValueLine || topTrend.valueLine || ""}`,
    };
  }

  return {
    eyebrow: "TREND SIGNAL",
    title: `Rising: ${category} & ${periodData.dominantLanguage.name}`,
    description: `${fallback.fullName} 是当前增长最快的项目，${subject.fullName} 则代表这一轮主题中心。 ${periodData.meta.label}榜单中最高增长为 ${formatStarsThisPeriod(
      fallback.deltaStars,
      periodData.meta.starsPeriodLabel,
    )}，当前榜单里 ${periodData.focusCount}/${periodData.totalRepositories} 个项目带有 AI 或工程化重点标签。`,
  };
}

function buildTrendHighlights(trendItems) {
  return (trendItems || []).slice(0, 2).map((trend, index) => ({
    id: trend.id || `trend-${index + 1}`,
    title: trend.name,
    keywordLine: trend.keywordLine,
    representativeLine: trend.representativeLine,
    whatLine: trend.what,
    whyLine: trend.why,
    howLine: trend.how,
    valueLine: trend.valueLine,
    riskLine: trend.risk,
  }));
}

function buildDeepDive(repositories, meta) {
  return repositories
    .slice()
    .sort((left, right) => {
      if (left.isFocus !== right.isFocus) {
        return Number(right.isFocus) - Number(left.isFocus);
      }

      return right.deltaStars - left.deltaStars;
    })
    .slice(0, 8)
    .map((repository) => {
      const categoryChip = classifyCategory(repository);
      const summaryParts = splitSummarySections(repository.summary);
      const analysis = normalizeAnalysis(repository);

      const what = analysis.what || analysis.projectIntro || buildWhatLine(repository, summaryParts);
      const how = analysis.how || analysis.problemScenario || buildProblemLine(repository, summaryParts);
      const coreHighlights = (analysis.coreHighlights || summaryParts.highlights || []).slice(0, 3);
      const fallbackHighlights = [
        analysis.technicalHighlight,
        repository.readmeHighlight,
        buildWhyLine(repository, summaryParts, meta),
      ]
        .map(cleanSentence)
        .filter(Boolean);

      for (const fallback of fallbackHighlights) {
        if (coreHighlights.length >= 3) {
          break;
        }
        if (!coreHighlights.includes(fallback)) {
          coreHighlights.push(fallback);
        }
      }

      while (coreHighlights.length < 3) {
        coreHighlights.push("提供清晰、可复用的工程能力");
      }

      return {
        fullName: repository.fullName,
        projectLink: repository.projectLink,
        description: repository.description,
        insightLabel: "一句话读懂",
        insightText:
          analysis.oneLineSummary || summaryParts.oneLine || analysis.insightText || repository.description || repository.fullName,
        categoryChip,
        language: normalizeLanguage(repository.language),
        stars: repository.stars,
        forks: repository.forks ?? 0,
        deltaStars: repository.deltaStars,
        starsThisPeriod: formatStarsThisPeriod(repository.deltaStars, meta.starsPeriodLabel),
        metaItems: [
          {
            label: "Star",
            value: `${formatCompactNumber(repository.stars)} + ${formatCompactNumber(repository.deltaStars)}`,
          },
          { label: "Fork", value: formatCompactNumber(repository.forks ?? 0) },
          { label: "Language", value: normalizeLanguage(repository.language) },
        ],
        coreValueItems: [
          { label: "what", text: what },
          { label: "how", text: how },
          { label: "why", highlights: coreHighlights },
        ],
        coreValueLines: [
          `what：${what}`,
          `how：${how}`,
          `why：${coreHighlights.map((item, index) => `${index + 1}）${item}`).join("；")}`,
        ],
      };
    });
}

function buildPeriodSummary(period, repositories) {
  const meta = PERIOD_META[period] || {
    label: period,
    deltaLabel: "新增",
    starsPeriodLabel: period,
  };

  const languageCounts = repositories.reduce((counts, repository) => {
    const language = normalizeLanguage(repository.language);
    counts.set(language, (counts.get(language) || 0) + 1);
    return counts;
  }, new Map());

  const dominantLanguageEntry = [...languageCounts.entries()].sort((left, right) => {
    if (left[1] !== right[1]) {
      return right[1] - left[1];
    }

    return left[0].localeCompare(right[0]);
  })[0] || ["未标注", 0];

  const totalRepositories = repositories.length;
  const focusCount = repositories.filter((repository) => repository.isFocus).length;
  const averageDelta = Math.round(
    repositories.reduce((sum, repository) => sum + repository.deltaStars, 0) / Math.max(1, totalRepositories),
  );
  const fastestMover = repositories
    .slice()
    .sort((left, right) => right.deltaStars - left.deltaStars)[0];

  const summary = {
    key: period,
    label: meta.label,
    meta,
    repositories,
    trendItems: repositories[0]?.trendAnalysis?.items || [],
    trendOverview: repositories[0]?.trendAnalysis?.overview || "",
    trendRisk: repositories[0]?.trendAnalysis?.risk || "",
    totalRepositories,
    focusCount,
    focusRatio: Math.round((focusCount / Math.max(1, totalRepositories)) * 100),
    averageDelta,
    dominantLanguage: {
      name: dominantLanguageEntry[0],
      count: dominantLanguageEntry[1],
    },
    fastestMover,
  };

  summary.hero = buildHero(summary);
  summary.trendHighlights = buildTrendHighlights(summary.trendItems);
  summary.deepDive = buildDeepDive(repositories, meta);
  return summary;
}

function parseDateKey(value) {
  const match = String(value || "").match(/^(\d{4})-(\d{2})-(\d{2})$/u);
  if (!match) {
    return null;
  }

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const date = new Date(Date.UTC(year, month - 1, day));

  if (
    date.getUTCFullYear() !== year ||
    date.getUTCMonth() !== month - 1 ||
    date.getUTCDate() !== day
  ) {
    return null;
  }

  return date;
}

function formatMonthDay(date) {
  return `${String(date.getUTCMonth() + 1).padStart(2, "0")}/${String(date.getUTCDate()).padStart(2, "0")}`;
}

function getIsoWeekInfo(dateKey) {
  const date = parseDateKey(dateKey);
  if (!date) {
    return null;
  }

  const day = date.getUTCDay() || 7;
  const monday = new Date(date);
  monday.setUTCDate(date.getUTCDate() - day + 1);

  const thursday = new Date(monday);
  thursday.setUTCDate(monday.getUTCDate() + 3);
  const isoYear = thursday.getUTCFullYear();

  const januaryFourth = new Date(Date.UTC(isoYear, 0, 4));
  const januaryFourthDay = januaryFourth.getUTCDay() || 7;
  const firstMonday = new Date(januaryFourth);
  firstMonday.setUTCDate(januaryFourth.getUTCDate() - januaryFourthDay + 1);

  const weekNumber = Math.floor((monday - firstMonday) / 604_800_000) + 1;
  const sunday = new Date(monday);
  sunday.setUTCDate(monday.getUTCDate() + 6);

  return {
    key: `${isoYear}-W${String(weekNumber).padStart(2, "0")}`,
    label: `${isoYear} 年第 ${weekNumber} 周 · ${formatMonthDay(monday)}–${formatMonthDay(sunday)}`,
  };
}

function periodBucket(period, dateKey) {
  if (period === "daily") {
    return { key: dateKey, label: dateKey };
  }

  if (period === "weekly") {
    return getIsoWeekInfo(dateKey);
  }

  if (period === "monthly") {
    const date = parseDateKey(dateKey);
    if (!date) {
      return null;
    }
    return {
      key: dateKey.slice(0, 7),
      label: `${date.getUTCFullYear()} 年 ${date.getUTCMonth() + 1} 月`,
    };
  }

  return null;
}

function buildDashboardNavigation(snapshotMetadata, currentDate) {
  const normalizedSnapshots = (snapshotMetadata || [])
    .map((snapshot) => ({
      date: snapshot.date,
      periods: [...new Set(snapshot.periods || [])],
    }))
    .filter((snapshot) => parseDateKey(snapshot.date))
    .sort((left, right) => left.date.localeCompare(right.date));

  const dateOptions = {};
  for (const period of PERIOD_ORDER) {
    const buckets = new Map();
    for (const snapshot of normalizedSnapshots) {
      if (!snapshot.periods.includes(period)) {
        continue;
      }

      const bucket = periodBucket(period, snapshot.date);
      if (!bucket) {
        continue;
      }

      const previous = buckets.get(bucket.key);
      if (!previous || snapshot.date > previous.date) {
        buckets.set(bucket.key, {
          ...bucket,
          date: snapshot.date,
        });
      }
    }

    dateOptions[period] = [...buckets.values()].sort((left, right) => right.date.localeCompare(left.date));
  }

  const selectedBuckets = Object.fromEntries(
    PERIOD_ORDER.map((period) => [period, periodBucket(period, currentDate)?.key || ""]),
  );

  return {
    currentDate,
    periodOrder: PERIOD_ORDER.filter((period) => dateOptions[period].length > 0),
    dateOptions,
    selectedBuckets,
  };
}

function buildDashboardModel(repositories, generatedAt) {
  const grouped = repositories.reduce((map, repository) => {
    const list = map.get(repository.period) || [];
    list.push(repository);
    map.set(repository.period, list);
    return map;
  }, new Map());

  const periodOrder = PERIOD_ORDER.filter((period) => grouped.has(period));
  const periods = Object.fromEntries(
    periodOrder.map((period) => [period, buildPeriodSummary(period, grouped.get(period))]),
  );

  return {
    generatedAt,
    periodOrder,
    periods,
  };
}

export {
  buildDashboardModel,
  buildDashboardNavigation,
  formatCompactNumber,
  formatStarsThisPeriod,
};
