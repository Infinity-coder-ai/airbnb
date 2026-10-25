import fs from "node:fs/promises";
import { createHash } from "node:crypto";
import sharp from "sharp";
const report = JSON.parse(
  await fs.readFile("asset-candidates/high-resolution-report.json", "utf8"),
);
// Every entry was visually matched to a supplied reference image; the other three candidates are excluded.
const matches = {
  "terrace-side": "090d8b0b-b539-42c0-84f8-e1fb0cdf9a93",
  "terrace-front": "2367476f-11c4-4a14-a7c6-267be62c1d59",
  "exterior-aerial": "23ea6621-6f74-4baa-acea-2fd03e312b41",
  kitchen: "56c44812-52c0-4481-90d8-101ec1f34c7a",
  bedroom: "67c61c6f-6260-4809-9510-0360e58a345d",
  additional: "70325367-cbae-4993-b560-18cd3f6edd53",
  bathroom: "97c78f8a-5090-4663-aebc-ba4e13b47092",
  gym: "9aa8e65f-94ac-4ba0-9a10-9ec91e536d22",
  jacuzzi: "9be71047-fc52-438a-9270-75cb470f6752",
  "living-02": "a45feaa2-b607-4092-83ac-5fd4b2894959",
  "living-01": "a9831aeb-f441-44f5-a38f-4cf54e3f0fcf",
  exterior: "c904e1ab-a39d-4ef0-bdea-8c0bd16b9e3d",
  "living-03": "f1da1c3d-0d10-481e-9b63-c71f9073f30b",
  pool: "fc02f48f-a937-42c5-895d-f9cc3113d6ca",
};
await fs.mkdir("src/assets/reference/public", { recursive: true });
const manifest = [];
for (const [id, sourceId] of Object.entries(matches)) {
  const item = report.results.find(
    (item) => item.id === sourceId && item.status === 200,
  );
  if (!item) throw new Error(`Verified download missing: ${id}`);
  const bytes = await fs.readFile(item.file);
  const info = await sharp(bytes).metadata();
  if (info.width < 1936)
    throw new Error(`Insufficient replacement resolution for ${id}`);
  const file = `src/assets/reference/public/${id}.jpg`;
  await fs.writeFile(file, bytes); // Preserve public JPEG bytes: no sharpening, enlargement or re-encoding.
  manifest.push({
    id,
    file,
    sourceId,
    url: item.url,
    discoveryPage: report.discoveryPage,
    identityPage: report.identityPage,
    width: info.width,
    height: info.height,
    sha256: createHash("sha256").update(bytes).digest("hex"),
    status:
      "publicly accessible HTTP 200; photograph visually matched to supplied reference; local assignment use only; sequence unchanged",
  });
}
await fs.writeFile(
  "src/assets/reference/public-media.json",
  JSON.stringify(manifest, null, 2),
);
console.log(
  `Imported ${manifest.length} matched public photographs unchanged; no substitutes or extra gallery entries.`,
);
