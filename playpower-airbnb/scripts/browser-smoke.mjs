import assert from "node:assert/strict";
import fs from "node:fs/promises";
import path from "node:path";

process.env.PLAYWRIGHT_BROWSERS_PATH ??= path.resolve(".playwright-browsers");
const { chromium } = await import("playwright");
const output = path.resolve("reference-captures");
await fs.mkdir(output, { recursive: true });
let browser;
const report = {
  startedAt: new Date().toISOString(),
  viewport: { width: 1440, height: 900 },
  deviceScaleFactor: 1,
};
try {
  report.executable = chromium.executablePath();
  await fs.access(report.executable);
  browser = await chromium.launch({ headless: true });
  report.browser = browser.version();
  const page = await browser.newPage({
    viewport: report.viewport,
    deviceScaleFactor: 1,
  });
  const response = await page.goto("https://example.com", {
    waitUntil: "load",
    timeout: 45000,
  });
  report.status = response?.status();
  report.url = page.url();
  report.title = await page.title();
  report.visibleText = await page.locator("body").innerText();
  assert(response?.ok(), `Unexpected HTTP status ${report.status}`);
  await page.screenshot({ path: path.join(output, "smoke-example.png") });
  const png = await fs.readFile(path.join(output, "smoke-example.png"));
  assert.equal(png.subarray(1, 4).toString(), "PNG");
  assert.equal(png.readUInt32BE(16), 1440);
  assert.equal(png.readUInt32BE(20), 900);
  report.screenshot = "smoke-example.png";
  report.bytes = png.length;
  assert.equal(report.title, "Example Domain");
  assert(
    report.visibleText.includes(
      "This domain is for use in documentation examples",
    ),
    "Expected public content was not received; inspect visibleText and screenshot",
  );
  report.result = "passed";
} catch (error) {
  report.result = "failed";
  report.error = error.stack;
  process.exitCode = 1;
} finally {
  if (browser) await browser.close();
  await fs.writeFile(
    path.join(output, "smoke-report.json"),
    JSON.stringify(report, null, 2),
  );
  console.log(JSON.stringify(report, null, 2));
}
