import fs from "node:fs/promises";
import path from "node:path";

process.env.PLAYWRIGHT_BROWSERS_PATH ??= path.resolve(".playwright-browsers");
const { chromium } = await import("playwright");
const browser = await chromium.launch({ headless: true });
const output = path.resolve("implementation-captures", "tour-scroll-comparison.json");

async function inspect(url, reference) {
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 1,
    reducedMotion: "no-preference",
  });
  const page = await context.newPage();
  if (reference) {
    await page.route("**/*", async (route) => {
      const requestUrl = new URL(route.request().url());
      if (requestUrl.hostname !== "127.0.0.1") return route.abort();
      return route.continue();
    });
  }
  await page.goto(url, { waitUntil: "load" });
  await page.waitForTimeout(500);
  const showAll = page.getByRole("button", { name: /Show all.*photos/i }).first();
  const before = await page.evaluate(() => ({ scrollY, bodyOverflow: getComputedStyle(document.body).overflow }));
  await showAll.click();
  const dialogSelector = reference ? '[role="dialog"][aria-label="Photo tour"]' : '.photo-tour';
  const scrollSelector = reference ? '#tourScroll' : '.tour-scroll';
  const navSelector = reference ? '#tourNav button' : '.category-nav button';
  await page.locator(dialogSelector).waitFor({ state: "visible" });

  const layout = await page.evaluate(({ dialogSelector, scrollSelector }) => {
    const dialog = document.querySelector(dialogSelector);
    const scroller = document.querySelector(scrollSelector);
    const toolbar = dialog.querySelector("header,.tour-toolbar");
    const read = (element) => {
      const style = getComputedStyle(element);
      return {
        box: element.getBoundingClientRect().toJSON(),
        position: style.position,
        overflowX: style.overflowX,
        overflowY: style.overflowY,
        scrollBehavior: style.scrollBehavior,
        overscrollBehavior: style.overscrollBehavior,
        scrollbarWidth: style.scrollbarWidth,
        transition: style.transition,
        animation: style.animation,
        transform: style.transform,
        opacity: style.opacity,
      };
    };
    return {
      dialog: read(dialog),
      toolbar: read(toolbar),
      scroller: { ...read(scroller), clientHeight: scroller.clientHeight, scrollHeight: scroller.scrollHeight },
      body: { position: getComputedStyle(document.body).position, overflow: getComputedStyle(document.body).overflow },
    };
  }, { dialogSelector, scrollSelector });

  const categoryMotion = await page.evaluate(async ({ scrollSelector, navSelector }) => {
    const scroller = document.querySelector(scrollSelector);
    const buttons = document.querySelectorAll(navSelector);
    const button = buttons[3];
    const samples = [];
    const started = performance.now();
    button.click();
    await new Promise((resolve) => {
      const tick = () => {
        const elapsed = performance.now() - started;
        samples.push([Math.round(elapsed), Math.round(scroller.scrollTop * 100) / 100]);
        if (elapsed < 1200) requestAnimationFrame(tick);
        else resolve();
      };
      requestAnimationFrame(tick);
    });
    return samples;
  }, { scrollSelector, navSelector });

  await page.locator(scrollSelector).evaluate((element) => element.scrollTo({ top: 0, behavior: "instant" }));
  const box = await page.locator(scrollSelector).boundingBox();
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
  const wheelStarted = await page.evaluate(() => performance.now());
  await page.mouse.wheel(0, 620);
  const wheelMotion = [];
  for (let index = 0; index < 18; index++) {
    await page.waitForTimeout(16);
    wheelMotion.push(await page.evaluate(({ wheelStarted, scrollSelector }) => [
      Math.round(performance.now() - wheelStarted),
      Math.round(document.querySelector(scrollSelector).scrollTop * 100) / 100,
    ], { wheelStarted, scrollSelector }));
  }
  const after = await page.evaluate(({ scrollSelector }) => ({
    pageY: scrollY,
    tourY: document.querySelector(scrollSelector).scrollTop,
    bodyOverflow: getComputedStyle(document.body).overflow,
  }), { scrollSelector });
  await context.close();
  return { before, layout, categoryMotion, wheelMotion, after };
}

const result = {
  reference: await inspect("http://127.0.0.1:4174/api/content.html", true),
  implementation: await inspect("http://127.0.0.1:5173/", false),
};
await fs.writeFile(output, JSON.stringify(result, null, 2));
console.log(JSON.stringify(result, null, 2));
await browser.close();
