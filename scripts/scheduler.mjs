import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const RUN_ANALYSIS = path.join(__dirname, 'run-analysis.mjs');

const DEFAULT_CRON = '0 0 * * *';
const DEFAULT_PERIOD = process.env.SCHEDULE_PERIOD || 'all';

function parseCron(expr) {
  const parts = expr.trim().split(/\s+/);
  if (parts.length !== 5) {
    throw new Error(`Invalid cron expression: ${expr} (expected 5 fields: min hour dom month dow)`);
  }
  const [minute, hour, dom, month, dow] = parts;
  return { minute, hour, dom, month, dow };
}

function nextRunTime(cron, from = new Date()) {
  const { minute, hour } = cron;
  const next = new Date(from);
  next.setSeconds(0, 0);
  const targetMin = minute === '*' ? next.getMinutes() : parseInt(minute, 10);
  const targetHour = hour === '*' ? next.getHours() : parseInt(hour, 10);
  next.setMinutes(targetMin);
  next.setHours(targetHour);
  if (next <= from) {
    next.setDate(next.getDate() + 1);
  }
  return next;
}

function formatDuration(ms) {
  const totalSec = Math.ceil(ms / 1000);
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = totalSec % 60;
  return [h, m, s].map((v) => String(v).padStart(2, '0')).join(':');
}

function runAnalysis(period) {
  const start = Date.now();
  const stamp = new Date().toISOString();
  console.log(`\n[scheduler] ${stamp} — starting analysis (period=${period})`);
  try {
    const output = execFileSync('node', [RUN_ANALYSIS, '--period', period], {
      cwd: process.cwd(),
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'pipe'],
    });
    console.log(output.trim());
    console.log(`[scheduler] completed in ${formatDuration(Date.now() - start)}`);
    return true;
  } catch (err) {
    console.error(`[scheduler] FAILED in ${formatDuration(Date.now() - start)}`);
    console.error(err.stderr || err.message);
    return false;
  }
}

function main() {
  const cronExpr = process.env.SCHEDULE_CRON || DEFAULT_CRON;
  const period = DEFAULT_PERIOD;
  const runOnce = process.argv.includes('--once');
  const cron = parseCron(cronExpr);

  console.log('═══════════════════════════════════════════════════');
  console.log('  GitHub Trending Scheduler');
  console.log('═══════════════════════════════════════════════════');
  console.log(`  cron    : ${cronExpr}`);
  console.log(`  period  : ${period}`);
  console.log(`  script  : ${RUN_ANALYSIS}`);
  console.log(`  mode    : ${runOnce ? 'once (single run)' : 'daemon (continuous)'}`);
  console.log('═══════════════════════════════════════════════════\n');

  if (runOnce) {
    const ok = runAnalysis(period);
    process.exit(ok ? 0 : 1);
  }

  let failureCount = 0;
  const MAX_CONSECUTIVE_FAILURES = 5;

  const tick = () => {
    const now = new Date();
    const target = nextRunTime(cron, now);
    const delay = target - now;
    console.log(`[scheduler] next run at ${target.toISOString()} (in ${formatDuration(delay)})`);
    setTimeout(() => {
      const ok = runAnalysis(period);
      if (ok) {
        failureCount = 0;
      } else {
        failureCount += 1;
        if (failureCount >= MAX_CONSECUTIVE_FAILURES) {
          console.error(`[scheduler] ${failureCount} consecutive failures, exiting.`);
          process.exit(1);
        }
      }
      tick();
    }, delay);
  };

  tick();
}

main();