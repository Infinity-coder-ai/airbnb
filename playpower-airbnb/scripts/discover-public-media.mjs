import fs from "node:fs/promises";
import path from "node:path";
process.env.PLAYWRIGHT_BROWSERS_PATH ??= path.resolve(".playwright-browsers");
const { chromium } = await import("playwright");
const browser = await chromium.launch({ headless: true });
const reports = [];
try {
  for (const url of [
    "https://www.airbnb.co.in/rooms/1599895892448055764",
    "https://bukavilla.com/v/mirashya-homes-botanica-by-raichandani-romantic-jacuzzi-1bhk-candolim-mirashya-ug10",
  ]) {
    const page = await browser.newPage({
      viewport: { width: 1440, height: 900 },
    });
    const report = { url };
    try {
      const response = await page.goto(url, {
        waitUntil: "domcontentloaded",
        timeout: 25000,
      });
      report.status = response?.status();
      if (!response?.ok()) {
        report.result = "HTTP error; no retry or bypass";
        reports.push(report);
        await page.close();
        continue;
      }
      await page.locator("h1").waitFor({ timeout: 10000 });
      report.heading = await page.locator("h1").first().innerText();
      if (!report.heading.includes("Mirashya UG10"))
        throw new Error(
          "Expected property heading absent; no further interaction",
        );
      report.buttons = await page.getByRole("button").allTextContents();
      const showPhotos = page.getByRole("button", {
        name: /show all.*photos/i,
      });
      report.galleryButtons = await showPhotos.count();
      if (report.galleryButtons === 1) {
        await showPhotos.click();
        await page.waitForTimeout(700);
        report.openedGallery = true;
      }
      report.images = await page
        .locator("img")
        .evaluateAll((images) =>
          images.map((image) => ({
            url: image.currentSrc || image.src,
            alt: image.alt,
            width: image.naturalWidth,
            height: image.naturalHeight,
          })),
        );
      report.result =
        "rendered public media metadata only; no source, cookies or private endpoints saved";
    } catch (error) {
      report.error = error.message;
    }
    reports.push(report);
    await page.close();
  }
} finally {
  await browser.close();
}
await fs.writeFile(
  "asset-candidates/public-discovery.json",
  JSON.stringify(reports, null, 2),
);
console.log(JSON.stringify(reports, null, 2));
