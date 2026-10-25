import assert from "node:assert/strict";
import fs from "node:fs/promises";
import path from "node:path";

process.env.PLAYWRIGHT_BROWSERS_PATH ??= path.resolve(".playwright-browsers");
const { chromium } = await import("playwright");
const output = path.resolve("implementation-captures");
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
  measurements = {};
page.on("pageerror", (error) => errors.push(error.message));
page.on("response", (response) => {
  if (response.status() >= 400)
    errors.push(`${response.status()} ${response.url()}`);
});
async function check(name, action) {
  await action();
  checks.push(name);
  console.log(`PASS ${name}`);
}
async function capture(name, fullPage = false) {
  await page.mouse.move(0, 0);
  await page.evaluate(async () => {
    await document.fonts.ready;
    await Promise.all(
      [...document.images]
        .filter((image) => image.complete && image.naturalWidth)
        .map((image) => image.decode().catch(() => {})),
    );
  });
  await page.screenshot({ path: path.join(output, `${name}.png`), fullPage });
}
try {
  assert(
    (
      await page.goto("http://127.0.0.1:5173", { waitUntil: "networkidle" })
    ).ok(),
  );
  await capture("listing-top");
  measurements.listing = await page.evaluate(() =>
    Object.fromEntries(
      [
        ".hero-grid",
        ".listing-details",
        ".guest-badge",
        ".sleep-image",
        ".amenities",
        ".calendar-section",
        ".reviews-section",
        ".map-illustration",
        ".host-section",
        ".nearby",
      ].map((selector) => {
        const r = document.querySelector(selector).getBoundingClientRect();
        return [selector, { x: r.x, y: r.y, width: r.width, height: r.height }];
      }),
    ),
  );
  const height = await page.evaluate(
    () => document.documentElement.scrollHeight,
  );
  for (let y = 0; y < height; y += 700) {
    await page.evaluate((y) => scrollTo(0, y), y);
    await page.waitForTimeout(70);
  }
  await page.evaluate(() => scrollTo(0, 0));
  await capture("listing-full", true);
  await check("all visible reference-derived Listing images decode", async () =>
    assert(
      await page
        .locator(".listing-page img")
        .evaluateAll((images) =>
          images.every((image) => image.complete && image.naturalWidth > 0),
        ),
    ),
  );
  await check("desktop has no horizontal overflow", async () =>
    assert(
      await page.evaluate(
        () => document.documentElement.scrollWidth === innerWidth,
      ),
    ),
  );
  await page.evaluate(() => scrollTo(0, 300));
  await page
    .getByRole("button", { name: "Show all photos", exact: true })
    .click();
  await check(
    "Show all photos opens a single active Tour dialog and locks body",
    async () => {
      assert.equal(await page.getByRole("dialog").count(), 1);
      assert.equal(
        await page
          .locator("#tour-close")
          .evaluate((element) => element === document.activeElement),
        true,
      );
      assert.equal(
        await page.evaluate(() => document.body.style.position),
        "fixed",
      );
    },
  );
  await capture("tour-top");
  measurements.tourChrome = await page
    .locator(".tour-chrome")
    .evaluate((element) => ({
      text: element.innerText,
      scrollTop: element.parentElement.scrollTop,
      rectangle: element.getBoundingClientRect().toJSON(),
      visibility: getComputedStyle(element).visibility,
      children: [...element.children].map((child) => ({
        text: child.innerText,
        rectangle: child.getBoundingClientRect().toJSON(),
        visibility: getComputedStyle(child).visibility,
      })),
    }));
  measurements.tour = await page.locator("#group-living-1").boundingBox();
  await page.locator("#photo-living-01").click();
  await check("clicked photo maps to the correct Lightbox image", async () => {
    assert.equal(await page.getByRole("dialog").count(), 1);
    assert.equal(
      await page.locator(".lightbox-counter").innerText(),
      "1 of 14",
    );
    assert(
      await page
        .getByRole("button", { name: "Previous photo", exact: true })
        .isDisabled(),
    );
    assert(
      (await page.locator(".lightbox-stage img").getAttribute("src")).includes(
        "living-01",
      ),
    );
  });
  await capture("lightbox-first");
  measurements.lightbox = await page
    .locator(".lightbox-stage img")
    .evaluate((image) => {
      const box = image.getBoundingClientRect();
      const scale = Math.min(
        box.width / image.naturalWidth,
        box.height / image.naturalHeight,
      );
      return {
        x: box.x + (box.width - image.naturalWidth * scale) / 2,
        y: box.y + (box.height - image.naturalHeight * scale) / 2,
        width: image.naturalWidth * scale,
        height: image.naturalHeight * scale,
        canvas: { x: box.x, y: box.y, width: box.width, height: box.height },
      };
    });
  await page.keyboard.press("ArrowLeft");
  assert.equal(await page.locator(".lightbox-counter").innerText(), "1 of 14");
  await page.keyboard.press("ArrowRight");
  await check("ArrowRight advances and previous button returns", async () => {
    assert.equal(
      await page.locator(".lightbox-counter").innerText(),
      "2 of 14",
    );
    await page
      .getByRole("button", { name: "Previous photo", exact: true })
      .click();
    assert.equal(
      await page.locator(".lightbox-counter").innerText(),
      "1 of 14",
    );
  });
  for (let i = 0; i < 13; i++) await page.keyboard.press("ArrowRight");
  await check(
    "last boundary is disabled and arrow navigation clamps",
    async () => {
      assert.equal(
        await page.locator(".lightbox-counter").innerText(),
        "14 of 14",
      );
      assert(
        await page
          .getByRole("button", { name: "Next photo", exact: true })
          .isDisabled(),
      );
      await page.keyboard.press("ArrowRight");
      assert.equal(
        await page.locator(".lightbox-counter").innerText(),
        "14 of 14",
      );
    },
  );
  await capture("lightbox-last");
  await page
    .getByRole("button", { name: "Previous photo", exact: true })
    .click();
  await page.getByRole("button", { name: "Next photo", exact: true }).click();
  await check(
    "pointer navigation at a disabled boundary retains usable keyboard focus",
    async () => {
      await page.keyboard.press("ArrowLeft");
      assert.equal(
        await page.locator(".lightbox-counter").innerText(),
        "13 of 14",
      );
      await page.keyboard.press("ArrowRight");
    },
  );
  await check("Tab and Shift+Tab stay within the active Lightbox", async () => {
    for (const key of ["Tab", "Shift+Tab"])
      for (let i = 0; i < 8; i++) {
        await page.keyboard.press(key);
        assert(
          await page.evaluate(
            () => !!document.activeElement.closest(".lightbox"),
          ),
        );
      }
  });
  await page.keyboard.press("Escape");
  await check(
    "Escape closes one layer and restores gallery tile focus",
    async () => {
      assert.equal(await page.locator(".lightbox").count(), 0);
      assert(
        await page
          .locator("#photo-living-01")
          .evaluate((element) => element === document.activeElement),
      );
      assert.equal(
        await page.evaluate(() => document.body.style.position),
        "fixed",
      );
    },
  );
  await page.locator("#photo-terrace-front").scrollIntoViewIfNeeded();
  const tourScroll = await page
    .locator(".tour-scroll")
    .evaluate((element) => element.scrollTop);
  await page.locator("#photo-terrace-front").click();
  await page.keyboard.press("Escape");
  await check(
    "Tour scroll and exact tile focus survive Lightbox open/close",
    async () => {
      assert.equal(
        await page
          .locator(".tour-scroll")
          .evaluate((element) => element.scrollTop),
        tourScroll,
      );
      assert(
        await page
          .locator("#photo-terrace-front")
          .evaluate((element) => element === document.activeElement),
      );
    },
  );
  await page.keyboard.press("Escape");
  await check(
    "Tour close restores Listing scroll and Show all photos focus",
    async () => {
      assert.equal(await page.getByRole("dialog").count(), 0);
      assert.equal(await page.evaluate(() => scrollY), 300);
      assert(
        await page
          .getByRole("button", { name: "Show all photos", exact: true })
          .evaluate((element) => element === document.activeElement),
      );
      assert.equal(await page.evaluate(() => document.body.style.position), "");
    },
  );
  for (let i = 0; i < 5; i++) {
    await page.locator(".hero-tile").nth(i).click();
    await page.keyboard.press("Escape");
    assert(
      await page
        .locator(".hero-tile")
        .nth(i)
        .evaluate((element) => element === document.activeElement),
    );
  }
  checks.push(
    "all five hero entries open Tour and restore their individual focus",
  );
  await page
    .getByRole("button", { name: "Show all photos", exact: true })
    .click();
  await check("Tour focus wraps in both directions", async () => {
    await page.locator("#tour-close").focus();
    await page.keyboard.press("Shift+Tab");
    assert(
      await page
        .locator("#photo-jacuzzi")
        .evaluate((element) => element === document.activeElement),
    );
    await page.keyboard.press("Tab");
    assert(
      await page
        .locator("#tour-close")
        .evaluate((element) => element === document.activeElement),
    );
  });
  await check(
    "reduced motion removes overlay and image transitions",
    async () =>
      assert.equal(
        await page
          .locator(".photo-tour")
          .evaluate((element) => getComputedStyle(element).animationName),
        "none",
      ),
  );
  await page.keyboard.press("Escape");
  await check(
    "Space and Enter activate photo controls; visible close buttons return one level",
    async () => {
      const showAll = page.getByRole("button", {
        name: "Show all photos",
        exact: true,
      });
      await showAll.focus();
      await page.keyboard.press("Space");
      assert.equal(await page.getByRole("dialog").count(), 1);
      await page.locator("#photo-living-01").focus();
      await page.keyboard.press("Enter");
      assert.equal(
        await page.locator(".lightbox-counter").innerText(),
        "1 of 14",
      );
      await page
        .getByRole("button", { name: "Return to photo tour", exact: true })
        .click();
      assert(
        await page
          .locator("#photo-living-01")
          .evaluate((element) => element === document.activeElement),
      );
      await page
        .getByRole("button", { name: "Close photo tour", exact: true })
        .click();
      assert.equal(await page.getByRole("dialog").count(), 0);
    },
  );
  await check("hover dimming works with normal motion preference", async () => {
    await page.emulateMedia({ reducedMotion: "no-preference" });
    await page.locator(".hero-tile").first().hover();
    await page.waitForFunction(
      () =>
        getComputedStyle(document.querySelector(".hero-tile img")).filter !==
        "none",
    );
    const duration = await page
      .locator(".hero-tile img")
      .first()
      .evaluate((element) => getComputedStyle(element).transitionDuration);
    assert.notEqual(duration, "0s");
    await page.emulateMedia({ reducedMotion: "reduce" });
  });
  await check("no browser runtime or asset HTTP errors", async () =>
    assert.deepEqual(errors, []),
  );
} catch (error) {
  errors.push(error.stack);
  await capture("failure");
  process.exitCode = 1;
  console.error(error.stack);
} finally {
  const report = {
    at: new Date().toISOString(),
    browser: browser.version(),
    viewport: { width: 1440, height: 900, dpr: 1 },
    reducedMotion: true,
    checks,
    measurements,
    errors,
  };
  await fs.writeFile(
    path.join(output, "verification.json"),
    JSON.stringify(report, null, 2),
  );
  await browser.close();
}
