import fs from "node:fs/promises";
import path from "node:path";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import sharp from "sharp";

const output = path.resolve("implementation-captures");
const prefix =
  "airbnb-clone-umber-two.vercel.app__utm_source=chatgpt.com&modal=PHOTO_TOUR_SCROLLABLE";
const pairs = [
  ["listing-top", `${prefix}&modalItem=1006.png`, false],
  ["listing-full", `${prefix}&modalItem=1006.png`, true],
  ["tour-top", `${prefix} (1).png`, false],
  ["lightbox-first", `${prefix}&modalItem=1000.png`, false],
];
const comparisons = [];
for (const [name, referenceName, fullPage] of pairs) {
  const normalized = await sharp(path.join("reference-captures", referenceName))
    .resize({ width: 1440 })
    .png()
    .toBuffer();
  const reference = fullPage
    ? normalized
    : await sharp(normalized)
        .extract({ left: 0, top: 0, width: 1440, height: 900 })
        .png()
        .toBuffer();
  const local = await fs.readFile(path.join(output, `${name}.png`));
  const referenceInfo = await sharp(reference).metadata(),
    localInfo = await sharp(local).metadata();
  assert.equal(localInfo.width, 1440);
  const file = `comparison-${name}.png`;
  await sharp({
    create: {
      width: 2880,
      height: Math.max(referenceInfo.height, localInfo.height),
      channels: 3,
      background: "#fff",
    },
  })
    .composite([
      { input: reference, left: 0, top: 0 },
      { input: local, left: 1440, top: 0 },
    ])
    .png()
    .toFile(path.join(output, file));
  comparisons.push({
    file,
    left: referenceName,
    right: `${name}.png`,
    referenceHeight: referenceInfo.height,
    localHeight: localInfo.height,
    normalization:
      "reference resized to 1440px wide; no masks; full-page heights not stretched",
  });
}
const manifest = JSON.parse(
  await fs.readFile("src/assets/reference/provenance.json", "utf8"),
);
for (const entry of manifest) {
  const expected = await sharp(path.join("reference-captures", entry.source))
    .extract(entry.crop)
    .removeAlpha()
    .raw()
    .toBuffer();
  const actual = await sharp(entry.file).removeAlpha().raw().toBuffer();
  assert(expected.equals(actual), `Lossless crop mismatch: ${entry.id}`);
}
const publicMedia = JSON.parse(
  await fs.readFile("src/assets/reference/public-media.json", "utf8"),
);
for (const entry of publicMedia) {
  const bytes = await fs.readFile(entry.file);
  assert.equal(
    createHash("sha256").update(bytes).digest("hex"),
    entry.sha256,
    `Public media changed: ${entry.id}`,
  );
}
await fs.writeFile(
  path.join(output, "comparison-report.json"),
  JSON.stringify(
    {
      comparisons,
      pixelIdenticalReferenceCrops: manifest.length,
      byteVerifiedPublicPhotos: publicMedia.length,
      noMasks: true,
      note: "Side-by-side evidence, not a pixel-perfect or global similarity claim.",
    },
    null,
    2,
  ),
);
console.log(
  `Created ${comparisons.length} unmasked side-by-side comparisons; verified ${manifest.length} screenshot crops have identical decoded pixels.`,
);
