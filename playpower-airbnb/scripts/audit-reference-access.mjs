import fs from 'node:fs/promises';
import path from 'node:path';

process.env.PLAYWRIGHT_BROWSERS_PATH ??= path.resolve('.playwright-browsers');
const { chromium } = await import('playwright');
const output = path.resolve('docs/reference-audit');
await fs.mkdir(path.join(output, 'screenshots'), { recursive: true });
const report = { attemptedAt: new Date().toISOString(), target: 'https://airbnb-clone-umber-two.vercel.app/', viewport: { width: 1440, height: 900, dpr: 1 }, headed: true, errors: [] };
let browser;
try {
  browser = await chromium.launch({ headless: false });
  report.browser = browser.version();
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 });
  const page = await context.newPage();
  const response = await page.goto(report.target, { waitUntil: 'domcontentloaded', timeout: 45000 });
  report.httpStatus = response?.status();
  report.finalUrl = page.url();
  report.title = await page.title();
  report.renderedText = await page.locator('body').innerText();
  report.blocked = !response?.ok() || /security checkpoint|verify you are human|access denied|too many requests/i.test(report.renderedText);
  report.status = report.blocked ? 'BLOCKED' : 'ACCESSIBLE — interaction audit pending';
  await page.screenshot({ path: path.join(output, 'screenshots', report.blocked ? 'reference-access-blocked.png' : 'reference-initial.png') });
  if (report.blocked) process.exitCode = 1;
} catch (error) {
  report.status = 'BLOCKED';
  report.blocked = true;
  report.errors.push(error.stack);
  process.exitCode = 1;
} finally {
  await fs.writeFile(path.join(output, 'reference-access.json'), JSON.stringify(report, null, 2));
  await browser?.close();
  console.log(JSON.stringify(report, null, 2));
}
