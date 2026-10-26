import fs from "node:fs/promises";
import path from "node:path";

process.env.PLAYWRIGHT_BROWSERS_PATH ??= path.resolve(".playwright-browsers");
const { chromium } = await import("playwright");
const output = path.resolve("reference-captures", "zip-reference");
await fs.mkdir(output, { recursive: true });
const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({
  viewport: { width: 1440, height: 900 },
  deviceScaleFactor: 1,
  reducedMotion: "no-preference",
});
const page = await context.newPage();
await page.route("**/*", async (route) => {
  const url = new URL(route.request().url());
  if (url.hostname !== "127.0.0.1") return route.abort();
  return route.continue();
});
const errors = [];
page.on("pageerror", (error) => errors.push(error.message));
page.on("console", (message) => {
  if (message.type() === "error") errors.push(message.text());
});

const waitForImages = () =>
  page.evaluate(async () => {
    await document.fonts.ready;
    await Promise.race([
      Promise.all([...document.images].map((image) => image.decode().catch(() => {}))),
      new Promise((resolve) => setTimeout(resolve, 3000)),
    ]);
  });
const shot = async (name, fullPage = false) => {
  await waitForImages();
  await page.mouse.move(0, 0);
  await page.screenshot({ path: path.join(output, `${name}.png`), fullPage });
};
const elementInfo = (selector) =>
  page.locator(selector).first().evaluate((element) => {
    const style = getComputedStyle(element);
    const box = element.getBoundingClientRect();
    return {
      tag: element.tagName,
      text: element.textContent?.trim().replace(/\s+/g, " "),
      box: { x: box.x, y: box.y, width: box.width, height: box.height },
      style: Object.fromEntries([
        ["fontFamily", "font-family"], ["fontSize", "font-size"],
        ["fontWeight", "font-weight"], ["lineHeight", "line-height"],
        ["letterSpacing", "letter-spacing"], ["color", "color"],
        ["backgroundColor", "background-color"], ["border", "border"],
        ["borderRadius", "border-radius"], ["boxShadow", "box-shadow"],
        ["position", "position"], ["top", "top"], ["overflow", "overflow"],
        ["objectFit", "object-fit"], ["transition", "transition"],
      ].map(([name, property]) => [name, style.getPropertyValue(property)])),
    };
  });

const report = { url: "http://127.0.0.1:4174/api/content.html", errors };
try {
  console.log("opening saved reference");
  const response = await page.goto(report.url, { waitUntil: "load", timeout: 15000 });
  await page.waitForTimeout(800);
  report.status = response.status();
  console.log("capturing listing");
  await shot("listing-top");
  report.listing = {
    title: await page.title(),
    bodyText: await page.locator("body").innerText(),
    headings: await page.getByRole("heading").allTextContents(),
    buttons: await page.getByRole("button").allTextContents(),
    images: await page.locator("img").evaluateAll((images) =>
      images.map((image, index) => ({
        index,
        src: image.currentSrc,
        alt: image.alt,
        naturalWidth: image.naturalWidth,
        naturalHeight: image.naturalHeight,
        box: image.getBoundingClientRect().toJSON(),
        objectFit: getComputedStyle(image).objectFit,
      })),
    ),
    h1: await elementInfo("h1"),
    header: await elementInfo("header"),
    hero: await elementInfo("main img"),
  };

  await page.evaluate(() => scrollTo(0, 800));
  await page.waitForTimeout(350);
  await shot("listing-sticky");
  report.sticky = await page.locator("body").evaluate(() =>
    [...document.querySelectorAll("body *")]
      .filter((element) => {
        const text = element.textContent?.trim().replace(/\s+/g, " ");
        const box = element.getBoundingClientRect();
        return box.y <= 1 && box.height > 50 && box.height < 100 && text?.includes("Photos") && text?.includes("Amenities") && text?.includes("Reviews") && text?.includes("Location");
      })
      .slice(0, 4)
      .map((element) => ({
        text: element.textContent.trim().replace(/\s+/g, " "),
        box: element.getBoundingClientRect().toJSON(),
        style: {
          background: getComputedStyle(element).backgroundColor,
          border: getComputedStyle(element).borderBottom,
          transition: getComputedStyle(element).transition,
        },
      })),
  );

  await page.evaluate(() => scrollTo(0, 0));
  const showAll = page.getByRole("button", { name: /Show all.*photos/i });
  report.showAllCount = await showAll.count();
  await showAll.first().click();
  console.log("capturing tour");
  await page.waitForTimeout(350);
  await shot("tour-top");
  report.tour = {
    bodyText: await page.locator("body").innerText(),
    headings: await page.getByRole("heading").allTextContents(),
    buttons: await page.getByRole("button").allTextContents(),
    images: await page.locator("img").evaluateAll((images) =>
      images.map((image, index) => ({
        index, src: image.currentSrc, alt: image.alt,
        naturalWidth: image.naturalWidth, naturalHeight: image.naturalHeight,
        box: image.getBoundingClientRect().toJSON(), objectFit: getComputedStyle(image).objectFit,
      })),
    ),
  };

  const tourDialog = page.getByRole("dialog", { name: "Photo tour" });
  report.tourControls = await tourDialog.locator("button").evaluateAll((buttons) =>
    buttons.map((button, index) => ({
      index, text: button.textContent?.trim(), label: button.getAttribute("aria-label"),
      box: button.getBoundingClientRect().toJSON(), hasImage: !!button.querySelector("img"),
    })),
  );
  report.tourScroller = await tourDialog.evaluate((dialog) => {
    const candidates = [...dialog.querySelectorAll("*")].filter((element) => {
      const style = getComputedStyle(element);
      return /(auto|scroll)/.test(style.overflowY) && element.scrollHeight > element.clientHeight;
    });
    const scroller = candidates.sort((a, b) => b.scrollHeight - a.scrollHeight)[0];
    return scroller ? { className: scroller.className, clientHeight: scroller.clientHeight, scrollHeight: scroller.scrollHeight } : null;
  });

  const tourImages = tourDialog.locator("button:has(img)");
  report.tourImageButtonCount = await tourImages.count();
  await tourImages.nth(9).click({ force: true });
  console.log("capturing lightbox");
  await page.waitForTimeout(250);
  await shot("lightbox-first");
  report.lightbox = {
    text: await page.locator("body").innerText(),
    buttons: await page.getByRole("button").evaluateAll((buttons) =>
      buttons.filter((button) => button.getClientRects().length).map((button) => ({
        text: button.textContent?.trim(), label: button.getAttribute("aria-label"),
        disabled: button.disabled, box: button.getBoundingClientRect().toJSON(),
      })),
    ),
    images: await page.locator("img").evaluateAll((images) =>
      images.filter((image) => image.getClientRects().length).map((image) => ({
        src: image.currentSrc, alt: image.alt,
        naturalWidth: image.naturalWidth, naturalHeight: image.naturalHeight,
        box: image.getBoundingClientRect().toJSON(), objectFit: getComputedStyle(image).objectFit,
      })),
    ),
  };
} catch (error) {
  errors.push(error.stack);
} finally {
  await fs.writeFile(path.join(output, "audit.json"), JSON.stringify(report, null, 2));
  await browser.close();
}
