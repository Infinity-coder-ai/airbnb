import assert from "node:assert/strict";
import fs from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";
process.env.PLAYWRIGHT_BROWSERS_PATH ??= path.resolve(".playwright-browsers");
const { chromium } = await import("playwright");
const output = "implementation-captures/quality";
await fs.mkdir(output, { recursive: true });
const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({
  viewport: { width: 1440, height: 900 },
  deviceScaleFactor: 1,
  reducedMotion: "reduce",
});
const page = await context.newPage();
const errors = [],
  checks = [],
  states = [];
page.on("pageerror", (error) => errors.push(error.message));
page.on("response", (response) => {
  if (response.status() >= 400)
    errors.push(`${response.status()} ${response.url()}`);
});
await page.addInitScript(() => {
  window.__qualityShifts = [];
  new PerformanceObserver((list) => {
    for (const entry of list.getEntries())
      window.__qualityShifts.push({
        at: entry.startTime,
        value: entry.value,
        hadRecentInput: entry.hadRecentInput,
        sources: entry.sources.map(source => ({
          node: source.node?.nodeName,
          parent: source.node?.parentElement?.id || source.node?.parentElement?.className,
          previous: source.previousRect.toJSON(), current: source.currentRect.toJSON(),
        })),
        lightbox: entry.sources.some((source) => {
          const element = source.node instanceof Element ? source.node : source.node?.parentElement;
          return !!element?.closest('.lightbox');
        }),
      });
  }).observe({ type: "layout-shift", buffered: true });
});
async function geometry(target) {
  await target
    .locator(".lightbox-stage img")
    .evaluate((image) => image.decode());
  return target.evaluate(() => {
    const selectors = [
      ".lightbox-stage",
      ".lightbox-stage img",
      ".lightbox-toolbar",
      "#lightbox-title",
      ".lightbox-arrow.previous",
      ".lightbox-arrow.next",
      "#lightbox-close",
      ".lightbox-counter",
    ];
    const boxes = Object.fromEntries(
      selectors.map((selector) => {
        const r = document.querySelector(selector).getBoundingClientRect();
        return [selector, { x: r.x, y: r.y, width: r.width, height: r.height }];
      }),
    );
    const image = document.querySelector(".lightbox-stage img"),
      r = image.getBoundingClientRect();
    const scale = Math.min(
      r.width / image.naturalWidth,
      r.height / image.naturalHeight,
    );
    return {
      boxes,
      source: image.currentSrc,
      natural: { width: image.naturalWidth, height: image.naturalHeight },
      fit: getComputedStyle(image).objectFit,
      painted: {
        x: r.x + (r.width - image.naturalWidth * scale) / 2,
        y: r.y + (r.height - image.naturalHeight * scale) / 2,
        width: image.naturalWidth * scale,
        height: image.naturalHeight * scale,
      },
    };
  });
}
let fixtureResult;
try {
  await page.goto("http://127.0.0.1:5173", { waitUntil: "networkidle" });
  await page
    .getByRole("button", { name: "Show all photos", exact: true })
    .click();
  await page.locator("#photo-living-01").click();
  const first = await geometry(page);
  await page.evaluate(() => {
    window.__qualityStart = performance.now();
  });
  for (let index = 0; index < 18; index++) {
    const state = await geometry(page);
    assert.deepEqual(
      state.boxes,
      first.boxes,
      `Frame/control shift at image ${index + 1}`,
    );
    assert.equal(state.fit, "contain");
    assert(
      Math.abs(
        state.painted.width / state.painted.height -
          state.natural.width / state.natural.height,
      ) < 0.00001,
    );
    assert(state.painted.width <= state.boxes[".lightbox-stage"].width + 0.01);
    assert(
      state.painted.height <= state.boxes[".lightbox-stage"].height + 0.01,
    );
    assert.equal(
      await page.locator(".lightbox-counter").innerText(),
      `${index + 1} of 18`,
    );
    states.push({ index: index + 1, ...state });
    if ([0, 7, 10, 17].includes(index))
      await page.screenshot({ path: `${output}/image-${index + 1}.png` });
    if (index < 17) {
      if (index % 2 === 0)
        await page
          .getByRole("button", { name: "Next photo", exact: true })
          .click();
      else await page.keyboard.press("ArrowRight");
    }
  }
  checks.push(
    "all 18 available reference images decode; stable image canvas, toolbar, arrows, close and counter; contain without ratio distortion",
  );
  assert(
    await page
      .getByRole("button", { name: "Next photo", exact: true })
      .isDisabled(),
  );
  await page.keyboard.press("ArrowRight");
  assert.equal(await page.locator(".lightbox-counter").innerText(), "18 of 18");
  for (let index = 17; index > 0; index--)
    await page.keyboard.press("ArrowLeft");
  assert.equal(await page.locator(".lightbox-counter").innerText(), "1 of 18");
  assert(
    await page
      .getByRole("button", { name: "Previous photo", exact: true })
      .isDisabled(),
  );
  await page.getByRole("button", { name: "Next photo", exact: true }).click();
  await page
    .getByRole("button", { name: "Previous photo", exact: true })
    .click();
  assert.equal(await page.locator(".lightbox-counter").innerText(), "1 of 18");
  checks.push(
    "first, middle and last navigation verified by buttons and arrow keys in both directions; boundary clamping retained",
  );
  const shifts = await page.evaluate(() =>
    window.__qualityShifts.filter((entry) => entry.at >= window.__qualityStart),
  );
  assert.equal(
    shifts
      .filter((entry) => entry.lightbox && !entry.hadRecentInput)
      .reduce((sum, entry) => sum + entry.value, 0),
    0,
  );
  checks.push(
    "fixed frame/control rectangles across every photo; zero unexpected Lightbox CLS (input-driven label text changes reported separately)",
  );
  const fixturePage = await context.newPage();
  const fixture = await sharp({
    create: { width: 600, height: 1200, channels: 3, background: "#216c96" },
  })
    .png()
    .toBuffer();
  await fixturePage.route("**/public/living-02.jpg", (route) =>
    route.fulfill({ status: 200, contentType: "image/png", body: fixture }),
  );
  await fixturePage.goto("http://127.0.0.1:5173", { waitUntil: "networkidle" });
  await fixturePage
    .getByRole("button", { name: "Show all photos", exact: true })
    .click();
  await fixturePage.locator("#photo-living-01").click();
  await fixturePage.keyboard.press("ArrowRight");
  fixtureResult = await geometry(fixturePage);
  assert.deepEqual(fixtureResult.natural, { width: 600, height: 1200 });
  assert.deepEqual(fixtureResult.boxes, first.boxes);
  const screenshot = await fixturePage.screenshot({
    path: `${output}/portrait-test-fixture.png`,
  });
  const { data, info } = await sharp(screenshot)
    .removeAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  let left = info.width,
    right = 0,
    top = info.height,
    bottom = 0;
  for (let y = 0; y < info.height; y++)
    for (let x = 0; x < info.width; x++) {
      const i = (y * info.width + x) * 3;
      if (
        Math.abs(data[i] - 33) < 3 &&
        Math.abs(data[i + 1] - 108) < 3 &&
        Math.abs(data[i + 2] - 150) < 3
      ) {
        left = Math.min(left, x);
        right = Math.max(right, x);
        top = Math.min(top, y);
        bottom = Math.max(bottom, y);
      }
    }
  const ratio = (right - left + 1) / (bottom - top + 1);
  assert(
    Math.abs(ratio - 0.5) < 0.003,
    "Rasterized portrait must retain its 1:2 ratio",
  );
  assert.equal(bottom - top + 1, 726);
  fixtureResult.rasterPainted = {
    left,
    top,
    width: right - left + 1,
    height: bottom - top + 1,
    ratio,
  };
  checks.push(
    "test-only 600x1200 portrait raster retains 1:2 ratio and full height with letterboxing; same controls and canvas; no portrait inserted into production data",
  );
  await fixturePage.keyboard.press("ArrowLeft");
  assert.deepEqual((await geometry(fixturePage)).boxes, first.boxes);
  await fixturePage.close();
  assert.deepEqual(errors, []);
  checks.push("no broken actual images or browser runtime/HTTP errors");
  await fs.writeFile(
    `${output}/lightbox-quality.json`,
    JSON.stringify(
      { checks, states, shifts, portraitFixture: fixtureResult, errors },
      null,
      2,
    ),
  );
  console.log(checks.map((check) => `PASS ${check}`).join("\n"));
} catch (error) {
  process.exitCode = 1;
  console.error(error.stack);
  await fs.writeFile(
    `${output}/failure.json`,
    JSON.stringify({ error: error.stack, errors, states }, null, 2),
  );
} finally {
  await browser.close();
}
