import { parseArgs, runAnalysis, usage } from "./analysis-core.mjs";

async function main() {
  let options;
  try {
    options = parseArgs(process.argv.slice(2));
  } catch (error) {
    console.error(error.message);
    console.error("");
    console.error(usage());
    process.exitCode = 1;
    return;
  }

  if (options.help) {
    console.log(usage());
    return;
  }

  const result = await runAnalysis(options);
  for (const report of result.reports) {
    console.log(`[ok] ${report.period} -> md=${report.markdownPath} | repos=${report.repoCount} focus=${report.focusCount}`);
    for (const warning of report.warnings) {
      console.warn(`[warn] ${warning.repo}: ${warning.warning}`);
    }
  }
  console.log(`[ok] cache -> ${result.cacheDir}`);
  console.log(`[ok] dashboard sync -> ${result.dashboardPath}`);
  console.log(`[ok] unique repos enriched -> ${result.uniqueRepoCount}`);
}

main().catch((error) => {
  console.error(error.stack || error.message);
  process.exitCode = 1;
});
