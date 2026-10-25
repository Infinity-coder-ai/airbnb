import fs from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";
process.env.PLAYWRIGHT_BROWSERS_PATH ??= path.resolve(".playwright-browsers");
const { chromium } = await import("playwright");
const baseline = process.argv.includes("--baseline");
const directory = path.resolve("implementation-captures");
await fs.mkdir(directory, { recursive: true });
const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({
  viewport: { width: 1440, height: 900 },
  deviceScaleFactor: 1,
  reducedMotion: "reduce",
});
const placements = [],
  errors = [];
page.on("pageerror", (error) => errors.push(error.message));
page.on("response", (response) => {
  if (response.status() >= 400)
    errors.push(`${response.status()} ${response.url()}`);
});
async function collect(view, selector) {
  const records = await page.locator(selector).evaluateAll(async (images) => {
    await Promise.all(
      images.map(async (image) => {
        image.loading = "eager";
        await image.decode();
      }),
    );
    return images.map((image) => {
      const box = image.getBoundingClientRect(),
        style = getComputedStyle(image);
      const width = image.naturalWidth,
        height = image.naturalHeight;
      const contain = Math.min(box.width / width, box.height / height);
      const scale =
        style.objectFit === "contain" || style.objectFit === "scale-down"
          ? style.objectFit === "scale-down"
            ? Math.min(1, contain)
            : contain
          : style.objectFit === "cover"
            ? Math.max(box.width / width, box.height / height)
            : box.width / width;
      return {
        id: decodeURIComponent(new URL(image.currentSrc).pathname)
          .split("/")
          .pop()
          .replace(/\.(webp|jpg)$/, ""),
        path: decodeURIComponent(new URL(image.currentSrc).pathname).replace(
          /^\//,
          "",
        ),
        alt: image.alt,
        objectFit: style.objectFit,
        elementBox: {
          x: box.x,
          y: box.y,
          width: box.width,
          height: box.height,
        },
        natural: { width, height },
        painted: { width: width * scale, height: height * scale },
        cssUpscale: scale,
        requiredScaleAtDpr2: scale * 2,
      };
    });
  });
  placements.push(...records.map((record) => ({ view, ...record })));
}
try {
  await page.goto("http://127.0.0.1:5173", { waitUntil: "networkidle" });
  await collect("Listing", ".listing-page img");
  await page
    .getByRole("button", { name: "Show all photos", exact: true })
    .click();
  await collect("Tour", ".category-nav img,.group-photos img");
  await page.locator("#photo-living-01").click();
  for (let index = 0; index < 14; index++) {
    await collect("Lightbox", ".lightbox-stage img");
    if (index < 13) await page.keyboard.press("ArrowRight");
  }
  const assets = [];
  async function rasterFiles(directory) {
    const result = [];
    for (const entry of await fs.readdir(directory, { withFileTypes: true })) {
      const file = path.posix.join(directory, entry.name);
      if (entry.isDirectory()) result.push(...(await rasterFiles(file)));
      else if (/\.(webp|jpg|png|jpeg|avif)$/i.test(entry.name))
        result.push(file);
    }
    return result;
  }
  for (const filePath of await rasterFiles("src/assets/reference")) {
    const id = path.basename(filePath).replace(/\.(webp|jpg)$/, "");
    const metadata = await sharp(filePath).metadata();
    const uses = placements.filter((record) => record.path === filePath);
    const maxUse = uses.toSorted((a, b) => b.cssUpscale - a.cssUpscale)[0];
    assets.push({
      id,
      path: filePath,
      intrinsicWidth: metadata.width,
      intrinsicHeight: metadata.height,
      aspectRatio: metadata.width / metadata.height,
      placements: uses,
      maximumCssUpscale: maxUse?.cssUpscale ?? null,
      maximumScaleAtDpr2: maxUse?.requiredScaleAtDpr2 ?? null,
      largestUse: maxUse?.view ?? "unused",
      appearanceAssessment: !maxUse
        ? "Archived screenshot crop, no longer rendered; missing detail would remain if enlarged"
        : maxUse.cssUpscale > 1.05
          ? "Insufficient source pixels at this size; visible softness/pixelation risk; detail cannot be recovered by CSS"
          : maxUse.requiredScaleAtDpr2 > 1.05
            ? "Adequate at DPR 1; pixel-limited at DPR 2; original quality unverified"
            : filePath.includes("/public/")
              ? "No pixel upscaling at DPR 1 or 2; direct matched public JPEG, no sharpening or re-encoding"
              : "No additional pixel upscaling at DPR 1 or 2; baked screenshot softness can remain",
    });
  }
  const report = {
    baseline,
    at: new Date().toISOString(),
    viewport: { width: 1440, height: 900, dpr: 1 },
    formula:
      "CSS scale = min(box/intrinsic) for contain; max for cover. DPR 2 requirement = CSS scale * 2. Painted dimensions are not the fixed img element box.",
    errors,
    assets,
  };
  const name = baseline ? "image-quality-baseline" : "image-quality";
  if (!baseline) {
    const cells = [];
    for (let index = 0; index < assets.length; index++) {
      const item = assets[index];
      const thumbnail = await sharp(item.path)
        .resize(180, 130, { fit: "contain", background: "#fff" })
        .png()
        .toBuffer();
      const label = Buffer.from(
        `<svg width="180" height="40"><rect width="180" height="40" fill="white"/><text x="4" y="14" font-size="11">${item.id}${item.path.includes("/public/") ? " [public]" : ""}</text><text x="4" y="30" font-size="11">${item.intrinsicWidth} x ${item.intrinsicHeight}</text></svg>`,
      );
      cells.push(
        {
          input: thumbnail,
          left: (index % 5) * 180,
          top: Math.floor(index / 5) * 170,
        },
        {
          input: label,
          left: (index % 5) * 180,
          top: Math.floor(index / 5) * 170 + 130,
        },
      );
    }
    await sharp({
      create: {
        width: 900,
        height: Math.ceil(assets.length / 5) * 170,
        channels: 3,
        background: "#eee",
      },
    })
      .composite(cells)
      .png()
      .toFile(path.join(directory, "image-quality-contact.png"));
  }
  await fs.writeFile(
    path.join(directory, `${name}.json`),
    JSON.stringify(report, null, 2),
  );
  if (!baseline) {
    const rows = assets.map((asset) => {
      const use = asset.placements.toSorted(
        (a, b) => b.cssUpscale - a.cssUpscale,
      )[0];
      return `| ${asset.path} | ${asset.intrinsicWidth} x ${asset.intrinsicHeight} | ${asset.aspectRatio.toFixed(3)} | ${use ? `${use.painted.width.toFixed(0)} x ${use.painted.height.toFixed(0)} (${use.view})` : "unused"} | ${asset.maximumCssUpscale === null ? "n/a" : `${asset.maximumCssUpscale.toFixed(2)}x`} | ${asset.maximumScaleAtDpr2 === null ? "n/a" : `${asset.maximumScaleAtDpr2.toFixed(2)}x`} | ${asset.appearanceAssessment} |`;
    });
    await fs.writeFile(
      "docs/image-quality-audit.md",
      `# Image quality audit\n\nGenerated from actual decoded local files and live rendered placements at 1440 x 900, DPR 1. Every image in src/assets/reference is included. The JSON report records every Listing, Tour and Lightbox placement, element box, painted dimensions, fit mode and scale. DPR 2 requirements are calculated, not a claim that the reference DPR is verified.\n\nA factor greater than 1 means the image is displayed beyond available source pixels. Contain preserves each intrinsic ratio; the stable image element box can be wider than the painted photo. Cover scale includes the image portion clipped outside its tile. Pixel adequacy does not prove original sharpness.\n\n| File | Intrinsic px | Ratio W/H | Largest painted CSS px | CSS scale | DPR 2 scale | Appearance assessment |\n| --- | --- | --- | --- | --- | --- | --- |\n${rows.join("\n")}\n\nDetailed placements: [image-quality.json](../implementation-captures/image-quality.json). Earlier sizing evidence: [baseline](../implementation-captures/image-quality-baseline.json). No sharpening, invented photos or unrelated replacements were applied.\n`,
    );
  }
  console.log(
    JSON.stringify({
      report: name,
      assetCount: assets.length,
      cssUpscaled: assets
        .filter((asset) => asset.maximumCssUpscale > 1.05)
        .map((asset) => asset.id),
      errors,
    }),
  );
  if (errors.length) process.exitCode = 1;
} finally {
  await browser.close();
}
