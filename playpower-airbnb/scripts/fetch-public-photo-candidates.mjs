import fs from "node:fs/promises";
import sharp from "sharp";
const directory = "asset-candidates";
await fs.mkdir(directory, { recursive: true });
const ids = [
  "090d8b0b-b539-42c0-84f8-e1fb0cdf9a93",
  "9be71047-fc52-438a-9270-75cb470f6752",
  "67c61c6f-6260-4809-9510-0360e58a345d",
  "c904e1ab-a39d-4ef0-bdea-8c0bd16b9e3d",
  "f6de1663-4e9c-4414-b63b-29a154a92ee1",
  "a9831aeb-f441-44f5-a38f-4cf54e3f0fcf",
];
const results = await Promise.all(
  ids.map(async (id, index) => {
    // Same public image URL exposed by the listing, requesting its CDN's width parameter.
    const url = `https://a0.muscache.com/im/pictures/hosting/Hosting-1599895892448055764/original/${id}.jpeg?im_w=2048`;
    try {
      const response = await fetch(url, { signal: AbortSignal.timeout(20000) });
      if (!response.ok)
        return {
          id,
          url,
          status: response.status,
          result: "unavailable; no retry or bypass",
        };
      if (!response.headers.get("content-type")?.startsWith("image/"))
        return {
          id,
          url,
          status: response.status,
          result: "not an image; rejected",
        };
      const bytes = Buffer.from(await response.arrayBuffer());
      const metadata = await sharp(bytes).metadata();
      const file = `${directory}/candidate-${index + 1}.jpg`;
      await fs.writeFile(file, bytes);
      return {
        id,
        url,
        status: response.status,
        file,
        width: metadata.width,
        height: metadata.height,
        result: "downloaded candidate, not yet verified or used",
      };
    } catch (error) {
      return { id, url, result: "unavailable", error: error.message };
    }
  }),
);
await fs.writeFile(
  `${directory}/report.json`,
  JSON.stringify(
    { source: "https://www.airbnb.co.in/rooms/1599895892448055764", results },
    null,
    2,
  ),
);
console.log(JSON.stringify(results, null, 2));
