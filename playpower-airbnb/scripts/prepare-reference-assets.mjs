import fs from "node:fs/promises";
import path from "node:path";
import { createHash } from "node:crypto";
import sharp from "sharp";

const root = path.resolve("src/assets/reference");
await fs.mkdir(root, { recursive: true });
const prefix =
  "airbnb-clone-umber-two.vercel.app__utm_source=chatgpt.com&modal=PHOTO_TOUR_SCROLLABLE";
const names = {
  listing: `${prefix}&modalItem=1006.png`,
  tour: `${prefix} (1).png`,
  lightbox: `${prefix}&modalItem=1000.png`,
};
// Rectangles are in half-resolution review pixels, not claimed original CSS measurements.
const regions = [
  ["terrace-front", "listing", 160, 174, 560, 494],
  ["terrace-side", "listing", 728, 174, 272, 242],
  ["jacuzzi", "listing", 1008, 174, 272, 242],
  ["bedroom", "listing", 160, 1556, 318, 211],
  ["bedroom-hero", "listing", 728, 424, 272, 244],
  ["exterior", "listing", 1008, 424, 272, 244],
  ["living-01", "lightbox", 236, 88, 968, 726],
  ["living-02", "tour", 751, 900, 222, 148],
  ["living-03", "tour", 985, 900, 223, 148],
  ["kitchen", "tour", 479, 234, 112, 104],
  ["bathroom", "tour", 727, 234, 111, 104],
  ["gym", "tour", 850, 234, 111, 104],
  ["exterior-aerial", "tour", 973, 234, 112, 104],
  ["pool", "tour", 1097, 234, 111, 104],
  ["additional", "tour", 232, 377, 111, 104],
  ["host", "listing", 236, 5060, 88, 88],
  ["aheesh", "listing", 760, 3351, 43, 43],
  ["samiksha", "listing", 160, 3588, 43, 43],
  ["vaibhav", "listing", 160, 3825, 43, 43],
  ["mohd", "listing", 760, 3825, 43, 43],
  ["cohost-sharath", "listing", 548, 5071, 34, 34],
  ["cohost-aman", "listing", 794, 5071, 34, 34],
  ["cohost-maria", "listing", 1042, 5071, 34, 34],
  ["cohost-simran", "listing", 548, 5121, 34, 34],
  ["cohost-pallavi", "listing", 794, 5121, 34, 34],
  ["cohost-sanyukta", "listing", 1042, 5121, 34, 34],
  ["nearby-01", "listing", 160, 5926, 208, 207],
  ["nearby-02", "listing", 388, 5926, 208, 207],
  ["nearby-03", "listing", 616, 5926, 208, 207],
  ["nearby-04", "listing", 844, 5926, 208, 207],
  ["nearby-05", "listing", 1072, 5926, 208, 207],
];
const originals = Object.fromEntries(
  await Promise.all(
    Object.entries(names).map(async ([key, name]) => [
      key,
      await fs.readFile(path.join("reference-captures", name)),
    ]),
  ),
);
const manifest = [];
for (const [id, kind, x, y, width, height] of regions) {
  const crop = {
    left: x * 2,
    top: y * 2,
    width: width * 2,
    height: height * 2,
  };
  const pixels = await sharp(originals[kind])
    .extract(crop)
    .webp({ lossless: true, effort: 4 })
    .toBuffer();
  await fs.writeFile(path.join(root, `${id}.webp`), pixels);
  manifest.push({
    id,
    file: `src/assets/reference/${id}.webp`,
    source: names[kind],
    sourceSha256: createHash("sha256").update(originals[kind]).digest("hex"),
    crop,
    width: crop.width,
    height: crop.height,
    bytes: pixels.length,
    sha256: createHash("sha256").update(pixels).digest("hex"),
    status:
      "user-screenshot-derived; lossless WebP; original media URL unavailable",
  });
}
// Remove only the earlier generated PNG derivatives, never captures or unrelated files.
for (const entry of manifest) {
  const oldFile = path.join(root, `${entry.id}.png`);
  if (path.dirname(oldFile) !== root)
    throw new Error("Asset path outside intended directory");
  await fs.unlink(oldFile).catch((error) => {
    if (error.code !== "ENOENT") throw error;
  });
}
await fs.writeFile(
  path.join(root, "provenance.json"),
  JSON.stringify(manifest, null, 2),
);
console.log(
  `Prepared ${manifest.length} reference-only image crops as lossless WebP (${manifest.reduce((sum, item) => sum + item.bytes, 0).toLocaleString()} bytes). Originals unchanged.`,
);
