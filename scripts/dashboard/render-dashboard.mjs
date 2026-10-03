import {
  buildDashboardModel,
  buildDashboardNavigation,
  formatCompactNumber,
} from "./dashboard-data.mjs";

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function renderCoreValueItems(items) {
  return items
    .map((item) => {
      if (item.highlights) {
        return `
              <li class="core-value-item">
                <strong class="core-value-key">${escapeHtml(item.label)}</strong>
                <ol class="highlight-list">
                  ${item.highlights.map((highlight) => `<li>${escapeHtml(highlight)}</li>`).join("")}
                </ol>
              </li>
        `;
      }

      return `
              <li class="core-value-item">
                <strong class="core-value-key">${escapeHtml(item.label)}</strong>
                <span>${escapeHtml(item.text)}</span>
              </li>
      `;
    })
    .join("");
}

function renderMetaItems(items) {
  return items
    .map(
      (item) => `
              <div class="meta-pill">
                <span class="meta-label">${escapeHtml(item.label)}</span>
                <strong class="meta-value">${escapeHtml(item.value)}</strong>
              </div>
      `,
    )
    .join("");
}

function renderTrendHighlights(items) {
  if (!items || items.length === 0) {
    return "";
  }

  return `
      <section class="trend-analysis panel">
        <div class="section-head">
          <h3>整体趋势分析</h3>
          <span>从项目共性归纳当前技术趋势</span>
        </div>
        <div class="trend-list">
          ${items
            .map(
              (item, index) => `
                <article class="trend-card">
                  <span class="trend-index">趋势 ${index + 1}</span>
                  <h4>${escapeHtml(item.title)}</h4>
                  <p><strong>核心关键词：</strong>${escapeHtml(item.keywordLine)}</p>
                  <p><strong>宏观 What：</strong>${escapeHtml(item.whatLine || item.title)}</p>
                  <p><strong>宏观 Why：</strong>${escapeHtml(item.whyLine || "")}</p>
                  <p><strong>宏观 How：</strong>${escapeHtml(item.howLine || "")}</p>
                  <p><strong>代表项目：</strong>${escapeHtml(item.representativeLine)}</p>
                  <p><strong>潜在风险：</strong>${escapeHtml(item.riskLine || "")}</p>
                </article>
              `,
            )
            .join("")}
        </div>
      </section>
  `;
}

function renderDeepDive(period) {
  return period.deepDive
    .map(
      (repository) => `
        <article class="deep-card">
          <div class="card-heading">
            <div class="title-wrap">
              <img src="__ASSET_BASE__/repo-icon.svg" alt="" aria-hidden="true" class="icon icon-repo">
              <h3><a href="${escapeHtml(repository.projectLink)}" target="_blank" rel="noreferrer">${escapeHtml(repository.fullName)}</a></h3>
            </div>
            <span class="chip">${escapeHtml(repository.categoryChip)}</span>
          </div>
          <div class="insight-panel">
            <div class="insight-title">
              <img src="__ASSET_BASE__/spark-icon.svg" alt="" aria-hidden="true" class="icon icon-spark">
              <span>${escapeHtml(repository.insightLabel)}</span>
            </div>
            <p>${escapeHtml(repository.insightText)}</p>
            <div class="meta-row">
              ${renderMetaItems(repository.metaItems)}
            </div>
          </div>
          <div class="core-value-panel">
            <span class="core-value-label">核心价值</span>
            <ul class="core-value-list">
              ${renderCoreValueItems(repository.coreValueItems)}
            </ul>
          </div>
        </article>
      `,
    )
    .join("");
}

function renderPeriodSection(periodKey, period, currentDate, active = false) {
  return `
    <section
      class="period-panel${active ? " is-active" : ""}"
      data-period-panel="${escapeHtml(periodKey)}"
      data-lead-name="${escapeHtml(period.fastestMover.fullName)}"
      data-lead-growth="${escapeHtml(`${formatCompactNumber(period.fastestMover.deltaStars)} stars this ${period.meta.starsPeriodLabel}`)}"
      data-snapshot-date="${escapeHtml(currentDate)}"
    >
      <div class="hero-card">
        <div class="hero-visual">
          <img src="__ASSET_BASE__/hero-background-281466.png" alt="" aria-hidden="true">
        </div>
        <div class="hero-copy">
          <span class="eyebrow">${escapeHtml(period.hero.eyebrow)}</span>
          <h2>${escapeHtml(period.hero.title)}</h2>
          <p>${escapeHtml(period.hero.description)}</p>
        </div>
      </div>

      ${renderTrendHighlights(period.trendHighlights)}

      <section class="deep-dive-section panel">
        <div class="section-head">
          <h3>Deep Dive Analysis</h3>
          <span>${escapeHtml(period.label)}趋势解构</span>
        </div>
        ${period.trendOverview ? `<p class="trend-overview">${escapeHtml(period.trendOverview)}</p>` : ""}
        <div class="deep-list">
          ${renderDeepDive(period)}
        </div>
      </section>
    </section>
  `;
}

function snapshotHref(date, period, historyPathPrefix) {
  return `${historyPathPrefix}${encodeURIComponent(date)}.html?period=${encodeURIComponent(period)}`;
}

function renderDateControls(model, navigation, currentDate, historyPathPrefix, defaultPeriod) {
  const controlMeta = {
    daily: { title: "日报日期", prompt: "按天加载", aria: "选择日报日期" },
    weekly: { title: "周报周期", prompt: "按周加载", aria: "选择周报周期" },
    monthly: { title: "月报月份", prompt: "按月加载", aria: "选择月报月份" },
  };

  return model.periodOrder
    .map((periodKey) => {
      const meta = controlMeta[periodKey];
      const options = navigation.dateOptions[periodKey] || [];
      const selectedBucket = navigation.selectedBuckets[periodKey];
      return `
        <div class="date-control${periodKey === defaultPeriod ? " is-active" : ""}" data-date-control="${escapeHtml(periodKey)}">
          <div class="date-control-copy">
            <span>${escapeHtml(meta.prompt)}</span>
            <strong>${escapeHtml(meta.title)}</strong>
          </div>
          <label class="date-select-wrap">
            <span class="sr-only">${escapeHtml(meta.aria)}</span>
            <select data-date-select="${escapeHtml(periodKey)}" aria-label="${escapeHtml(meta.aria)}">
              ${options
                .map(
                  (option) => `
                    <option value="${escapeHtml(snapshotHref(option.date, periodKey, historyPathPrefix))}"${
                      option.key === selectedBucket ? " selected" : ""
                    }>${escapeHtml(option.label)}</option>
                  `,
                )
                .join("")}
            </select>
          </label>
          <span class="archive-count">${options.length} 个可用${meta.title === "日报日期" ? "日期" : meta.title === "周报周期" ? "周次" : "月份"}</span>
        </div>
      `;
    })
    .join("");
}

function renderDashboardHtml(repositories, generatedAt, options = {}) {
  const model = buildDashboardModel(repositories, generatedAt);
  if (model.periodOrder.length === 0) {
    throw new Error("Dashboard requires at least one repository with a supported period");
  }

  const currentDate = options.currentDate || generatedAt;
  const snapshotMetadata = options.snapshotMetadata || [
    { date: currentDate, periods: model.periodOrder },
  ];
  const navigation = buildDashboardNavigation(snapshotMetadata, currentDate);
  const defaultPeriod = model.periodOrder[0];
  const assetBase = options.assetBase || "./assets";
  const stylesheetHref = options.stylesheetHref || "./styles.css";
  const historyPathPrefix = options.historyPathPrefix || "./history/";

  const periodTabs = model.periodOrder
    .map(
      (periodKey) => `
        <button class="nav-link${periodKey === defaultPeriod ? " is-active" : ""}" type="button" data-period-tab="${escapeHtml(periodKey)}">
          ${escapeHtml(model.periods[periodKey].label)}
        </button>
      `,
    )
    .join("");

  const sections = model.periodOrder
    .map((periodKey) =>
      renderPeriodSection(periodKey, model.periods[periodKey], currentDate, periodKey === defaultPeriod),
    )
    .join("");

  const initialPeriod = model.periods[defaultPeriod];
  const dateControls = renderDateControls(
    model,
    navigation,
    currentDate,
    historyPathPrefix,
    defaultPeriod,
  );

  return `<!doctype html>
<html lang="zh-CN">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>GitHub Trending Dashboard</title>
  <link rel="stylesheet" href="${escapeHtml(stylesheetHref)}">
</head>
<body>
  <div class="app-shell">
    <header class="topbar">
      <div class="topbar-inner">
        <nav class="period-nav" aria-label="趋势周期切换">
          ${periodTabs}
        </nav>
        <span class="generated-at" data-generated-at>Snapshot · ${escapeHtml(currentDate)}</span>
      </div>
    </header>

    <main class="page">
      <section class="page-heading">
        <div>
          <span class="section-kicker">Trend Insights</span>
          <h1>GitHub Trending Dashboard</h1>
        </div>
        <div class="headline-callout">
          <span class="callout-label">Current Lead</span>
          <strong data-current-lead>${escapeHtml(initialPeriod.fastestMover.fullName)}</strong>
          <span data-current-growth>${escapeHtml(formatCompactNumber(initialPeriod.fastestMover.deltaStars))} stars this ${escapeHtml(
            initialPeriod.meta.starsPeriodLabel,
          )}</span>
        </div>
      </section>

      <section class="snapshot-toolbar" aria-label="历史快照选择">
        <div class="snapshot-toolbar-heading">
          <span>Archive Browser</span>
          <strong>按时间加载历史榜单</strong>
        </div>
        <div class="date-controls">
          ${dateControls}
        </div>
      </section>

      ${sections}
    </main>
  </div>

  <script>
    const tabs = Array.from(document.querySelectorAll("[data-period-tab]"));
    const panels = Array.from(document.querySelectorAll("[data-period-panel]"));
    const dateControls = Array.from(document.querySelectorAll("[data-date-control]"));
    const dateSelects = Array.from(document.querySelectorAll("[data-date-select]"));
    const leadName = document.querySelector("[data-current-lead]");
    const leadGrowth = document.querySelector("[data-current-growth]");
    const generatedAt = document.querySelector("[data-generated-at]");

    function setActivePeriod(period) {
      const activePanel = panels.find((panel) => panel.dataset.periodPanel === period);
      if (!activePanel) {
        return;
      }

      tabs.forEach((tab) => {
        tab.classList.toggle("is-active", tab.dataset.periodTab === period);
      });

      panels.forEach((panel) => {
        panel.classList.toggle("is-active", panel.dataset.periodPanel === period);
      });

      dateControls.forEach((control) => {
        control.classList.toggle("is-active", control.dataset.dateControl === period);
      });

      leadName.textContent = activePanel.dataset.leadName || "";
      leadGrowth.textContent = activePanel.dataset.leadGrowth || "";
      generatedAt.textContent = "Snapshot · " + (activePanel.dataset.snapshotDate || "");
    }

    tabs.forEach((tab) => {
      tab.addEventListener("click", () => setActivePeriod(tab.dataset.periodTab));
    });

    dateSelects.forEach((select) => {
      select.addEventListener("change", () => {
        if (select.value) {
          window.location.href = select.value;
        }
      });
    });

    const requestedPeriod = new URLSearchParams(window.location.search).get("period");
    setActivePeriod(tabs.some((tab) => tab.dataset.periodTab === requestedPeriod) ? requestedPeriod : "${escapeHtml(defaultPeriod)}");
  </script>
</body>
</html>`
    .replaceAll("__ASSET_BASE__", escapeHtml(assetBase))
    .replace(/[ \t]+$/gmu, "");
}

export { renderDashboardHtml };
