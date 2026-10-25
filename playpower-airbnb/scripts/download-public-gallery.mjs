import fs from "node:fs/promises";
import sharp from "sharp";
const sources = JSON.parse(
  await fs.readFile("asset-candidates/public-discovery.json", "utf8"),
);
const airbnb = sources.find((item) => item.url.includes("airbnb.co.in"));
const publicGallery = sources.find((item) =>
  item.url.includes("bukavilla.com"),
);
const knownIds = new Set(
  airbnb.images
    .filter((image) => image.url.includes("Hosting-1599895892448055764"))
    .map((image) =>
      new URL(image.url).pathname.split("/").pop().replace(".jpeg", ""),
    ),
);
const urls = [
  ...new Set(publicGallery.images.map((image) => image.url)),
].filter(
  (url) =>
    url.includes("/01db68c9-6bc8-42be-9e2c-214a0e617409/") &&
    knownIds.has(
      new URL(url).pathname
        .split("/")
        .pop()
        .replace(/^ab-/, "")
        .replace(".jpg", ""),
    ),
);
const results = [];
let cursor = 0;
await Promise.all(
  Array.from({ length: 4 }, async () => {
    while (cursor < urls.length) {
      const index = cursor++,
        url = urls[index];
      const id = new URL(url).pathname
        .split("/")
        .pop()
        .replace(/^ab-/, "")
        .replace(".jpg", "");
      try {
        const response = await fetch(url, {
          signal: AbortSignal.timeout(20000),
        });
        if (!response.ok) {
          results.push({ id, url, status: response.status, used: false });
          continue;
        }
        if (!response.headers.get("content-type")?.startsWith("image/"))
          throw new Error("Non-image response rejected");
        const bytes = Buffer.from(await response.arrayBuffer());
        const info = await sharp(bytes).metadata();
        const file = `asset-candidates/${id}.jpg`;
        await fs.writeFile(file, bytes);
        results.push({
          id,
          url,
          status: response.status,
          file,
          width: info.width,
          height: info.height,
          used: false,
          verification: "pending visual matching against supplied screenshots",
        });
      } catch (error) {
        results.push({ id, url, error: error.message, used: false });
      }
    }
  }),
);
results.sort((a, b) => a.id.localeCompare(b.id));
await fs.writeFile(
  "asset-candidates/high-resolution-report.json",
  JSON.stringify(
    { discoveryPage: publicGallery.url, identityPage: airbnb.url, results },
    null,
    2,
  ),
);
const tiles = [];
for (let index = 0; index < results.length; index++) {
  const item = results[index];
  if (!item.file) continue;
  const thumb = await sharp(item.file)
    .resize(240, 180, { fit: "contain", background: "#fff" })
    .png()
    .toBuffer();
  const label = Buffer.from(
    `<svg width="240" height="32"><rect width="240" height="32" fill="white"/><text x="6" y="20" font-size="14">${index + 1}: ${item.id.slice(0, 8)}</text></svg>`,
  );
  tiles.push(
    { input: thumb, left: (index % 4) * 240, top: Math.floor(index / 4) * 212 },
    {
      input: label,
      left: (index % 4) * 240,
      top: Math.floor(index / 4) * 212 + 180,
    },
  );
}
await sharp({
  create: {
    width: 960,
    height: Math.ceil(results.length / 4) * 212,
    channels: 3,
    background: "#eee",
  },
})
  .composite(tiles)
  .png()
  .toFile("asset-candidates/high-resolution-contact.png");
console.log(
  JSON.stringify(
    results.map((item, index) => ({
      index: index + 1,
      id: item.id,
      width: item.width,
      height: item.height,
      status: item.status,
      error: item.error,
    })),
    null,
    2,
  ),
);
