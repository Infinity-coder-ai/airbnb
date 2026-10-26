import assert from "node:assert/strict";
import fs from "node:fs/promises";
import path from "node:path";

process.env.PLAYWRIGHT_BROWSERS_PATH ??= path.resolve(".playwright-browsers");
const { chromium } = await import("playwright");
const output = "implementation-captures/amenities";
await fs.mkdir(output, { recursive: true });
const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({
  viewport: { width: 1440, height: 900 },
  reducedMotion: "reduce",
});
const checks = [];
const errors = [];
page.on("pageerror", (error) => errors.push(error.message));
page.on("console", (message) => {
  if (message.type() === "error") errors.push(message.text());
});
page.on("response", (response) => {
  if (response.status() >= 400)
    errors.push(`${response.status()} ${response.url()}`);
});
async function check(name, action) {
  await action();
  checks.push(name);
  console.log(`PASS ${name}`);
}

try {
  await page.goto("http://127.0.0.1:5173/", { waitUntil: "networkidle" });
  await check("house icon uses stable supplied-symbol artwork and exact bounds", async () => {
    const result = await page.locator(".search-home").evaluate((element) => {
      const box = element.getBoundingClientRect();
      return {
        symbol: element.dataset.referenceSymbol,
        imageCount: element.querySelectorAll("img").length,
        width: box.width,
        height: box.height,
      };
    });
    assert.equal(result.symbol, "🏡");
    assert.equal(result.imageCount, 1);
    assert(
      await page
        .locator(".search-home img")
        .evaluate(
          (image) =>
            image.complete &&
            image.naturalWidth === 240 &&
            image.naturalHeight === 216,
        ),
    );
    assert.equal(result.width, 48);
    assert.equal(result.height, 48);
  });
  await page.screenshot({
    path: `${output}/header-house.png`,
    clip: { x: 480, y: 0, width: 480, height: 120 },
  });

  const description = page.locator("#listing-description");
  const descriptionButton = page.locator(
    'button[aria-controls="listing-description"]',
  );
  await descriptionButton.scrollIntoViewIfNeeded();
  const collapsedHeight = await description.evaluate(
    (element) => element.getBoundingClientRect().height,
  );
  await check("description expands to supplied full copy and collapses again", async () => {
    assert.equal(await descriptionButton.getAttribute("aria-expanded"), "false");
    await descriptionButton.click();
    const less = page.getByRole("button", { name: "Show less", exact: true });
    assert.equal(await less.getAttribute("aria-expanded"), "true");
    assert.match(await description.innerText(), /touch of luxury in North Goa/);
    assert(
      (await description.evaluate((element) => element.getBoundingClientRect().height)) >
        collapsedHeight,
    );
    await page.screenshot({ path: `${output}/description-expanded.png` });
    await less.click();
    assert.equal(
      await description.evaluate((element) => element.getBoundingClientRect().height),
      collapsedHeight,
    );
  });

  const opener = page.getByRole("button", {
    name: "Show all 50 amenities",
    exact: true,
  });
  await opener.scrollIntoViewIfNeeded();
  const listingScroll = await page.evaluate(() => scrollY);
  await opener.click();
  const dialog = page.getByRole("dialog", { name: "What this place offers" });
  await dialog.waitFor({ state: "visible" });
  await check("amenities button opens one modal, locks background and focuses close", async () => {
    assert.equal(await dialog.count(), 1);
    assert.equal(await page.evaluate(() => document.body.style.overflow), "hidden");
    assert(
      await page
        .getByRole("button", { name: "Close amenities" })
        .evaluate((element) => element === document.activeElement),
    );
    const geometry = await dialog.evaluate((element) => {
      const box = element.getBoundingClientRect();
      const title = element.querySelector("h2");
      const section = element.querySelector("h3");
      const item = element.querySelector("li");
      const titleStyle = getComputedStyle(title);
      const sectionStyle = getComputedStyle(section);
      const itemStyle = getComputedStyle(item);
      return {
        box: { x: box.x, y: box.y, width: box.width, height: box.height },
        title: {
          font: titleStyle.fontFamily,
          size: titleStyle.fontSize,
          weight: titleStyle.fontWeight,
          lineHeight: titleStyle.lineHeight,
        },
        section: {
          size: sectionStyle.fontSize,
          weight: sectionStyle.fontWeight,
          lineHeight: sectionStyle.lineHeight,
        },
        item: {
          size: itemStyle.fontSize,
          weight: itemStyle.fontWeight,
          lineHeight: itemStyle.lineHeight,
          height: item.getBoundingClientRect().height,
        },
      };
    });
    assert.deepEqual(geometry.box, {
      x: 330,
      y: 48,
      width: 780,
      height: 804,
    });
    assert.deepEqual(geometry.title, {
      font: "Arial, Helvetica, sans-serif",
      size: "26px",
      weight: "600",
      lineHeight: "34px",
    });
    assert.deepEqual(geometry.section, {
      size: "22px",
      weight: "600",
      lineHeight: "28px",
    });
    assert.deepEqual(geometry.item, {
      size: "16px",
      weight: "400",
      lineHeight: "24px",
      height: 56,
    });
  });
  const expectedGroups = [
    "Bathroom",
    "Bedroom and laundry",
    "Entertainment",
    "Family",
    "Heating and cooling",
    "Home safety",
    "Internet and office",
    "Kitchen and dining",
    "Location features",
    "Outdoor",
    "Parking and facilities",
    "Services",
  ];
  await check("all supplied amenity groups and 44 verified rows render in order", async () => {
    assert.deepEqual(
      await dialog.locator(".amenity-group h3").allTextContents(),
      expectedGroups,
    );
    assert.equal(await dialog.locator(".amenity-group li").count(), 44);
    assert.equal(
      await dialog.locator(".amenity-group li").first().innerText(),
      "Hairdryer",
    );
    assert.equal(
      await dialog.locator(".amenity-group li").last().innerText(),
      "Self check-in",
    );
  });
  await check("amenities content scrolls independently while the page remains fixed", async () => {
    const scroller = dialog.locator(".amenities-dialog-scroll");
    const before = await scroller.evaluate((element) => ({
      top: element.scrollTop,
      height: element.clientHeight,
      scrollHeight: element.scrollHeight,
    }));
    assert(before.scrollHeight > before.height);
    await scroller.evaluate((element) => element.scrollTo(0, element.scrollHeight));
    assert((await scroller.evaluate((element) => element.scrollTop)) > 0);
    assert.equal(await page.evaluate(() => scrollY), listingScroll);
    await page.screenshot({ path: `${output}/amenities-bottom.png` });
  });
  await dialog.locator(".amenities-dialog-scroll").evaluate((element) =>
    element.scrollTo(0, 0),
  );
  await page.screenshot({ path: `${output}/amenities-top.png` });
  await page.keyboard.press("Escape");
  await check("Escape closes amenities and restores opener focus and scroll", async () => {
    assert.equal(await dialog.count(), 0);
    assert.equal(await page.evaluate(() => document.body.style.overflow), "");
    assert.equal(await page.evaluate(() => scrollY), listingScroll);
    assert(await opener.evaluate((element) => element === document.activeElement));
  });
  await opener.click();
  await page.getByRole("button", { name: "Close amenities" }).click();
  await check("visible close button closes amenities and restores focus", async () => {
    assert.equal(await dialog.count(), 0);
    assert(await opener.evaluate((element) => element === document.activeElement));
  });

  const chips = page.getByRole("region", { name: "Review highlights" });
  await chips.scrollIntoViewIfNeeded();
  await check("review highlights are a keyboard-focusable horizontal scroller", async () => {
    const metrics = await chips.evaluate((element) => ({
      clientWidth: element.clientWidth,
      scrollWidth: element.scrollWidth,
      overflowX: getComputedStyle(element).overflowX,
      count: element.children.length,
    }));
    assert.equal(metrics.count, 10);
    assert(metrics.scrollWidth > metrics.clientWidth);
    assert.equal(metrics.overflowX, "auto");
    await chips.focus();
    await chips.evaluate((element) => element.scrollTo(element.scrollWidth, 0));
    assert((await chips.evaluate((element) => element.scrollLeft)) > 0);
    await page.screenshot({ path: `${output}/review-highlights-scrolled.png` });
  });
  await check("no runtime, console or HTTP errors", async () => {
    assert.deepEqual(errors, []);
  });
} catch (error) {
  errors.push(error.stack);
  await page.screenshot({ path: `${output}/failure.png` });
  process.exitCode = 1;
  console.error(error.stack);
} finally {
  await fs.writeFile(
    `${output}/report.json`,
    JSON.stringify(
      {
        at: new Date().toISOString(),
        browser: browser.version(),
        viewport: { width: 1440, height: 900, dpr: 1 },
        checks,
        errors,
        suppliedAmenityRows: 44,
        referenceButtonLabel: "Show all 50 amenities",
      },
      null,
      2,
    ),
  );
  await browser.close();
}
