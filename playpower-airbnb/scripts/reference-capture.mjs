import fs from "node:fs/promises";
import path from "node:path";

process.env.PLAYWRIGHT_BROWSERS_PATH ??= path.resolve(".playwright-browsers");
const { chromium } = await import("playwright");
const output = path.resolve("reference-captures");
await fs.mkdir(output, { recursive: true });
const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({
  viewport: { width: 1440, height: 900 },
  deviceScaleFactor: 1,
});
const page = await context.newPage();
const mediaResponses = new Map();
const errors = [];
page.on("pageerror", (error) => errors.push(error.message));
page.on("response", (response) => {
  const type = response.request().resourceType();
  if (type === "image" || type === "font")
    mediaResponses.set(response.url(), {
      url: response.url(),
      type,
      status: response.status(),
      contentType: response.headers()["content-type"],
    });
});

async function snapshot(name, fullPage = false) {
  await page.evaluate(async () => {
    await document.fonts.ready;
    await Promise.all(
      Array.from(document.images)
        .filter((image) => image.complete && image.naturalWidth)
        .map((image) => image.decode().catch(() => {})),
    );
  });
  const metadata = await page.evaluate(() => {
    const box = (element) => {
      const r = element.getBoundingClientRect();
      return { x: r.x, y: r.y, width: r.width, height: r.height };
    };
    const properties = [
      "display",
      "position",
      "fontFamily",
      "fontSize",
      "fontWeight",
      "lineHeight",
      "letterSpacing",
      "color",
      "backgroundColor",
      "border",
      "borderRadius",
      "boxShadow",
      "padding",
      "margin",
      "gap",
      "gridTemplateColumns",
      "objectFit",
      "objectPosition",
      "overflow",
      "overflowY",
      "transition",
      "animation",
      "opacity",
      "stroke",
      "strokeWidth",
    ];
    const elements = Array.from(
      document.querySelectorAll(
        'header,nav,main,section,article,aside,footer,h1,h2,h3,p,button,a,img,dialog,[role="dialog"],svg',
      ),
    )
      .filter((element) => {
        const style = getComputedStyle(element);
        return (
          element.getBoundingClientRect().width > 0 &&
          style.display !== "none" &&
          style.visibility !== "hidden"
        );
      })
      .map((element, index) => {
        const style = getComputedStyle(element);
        return {
          index,
          tag: element.tagName.toLowerCase(),
          role: element.getAttribute("role"),
          text:
            element.tagName.toLowerCase() === "svg"
              ? null
              : element.innerText?.trim().slice(0, 500),
          ariaLabel: element.getAttribute("aria-label"),
          alt: element.getAttribute("alt"),
          tabIndex: element.tabIndex,
          box: box(element),
          styles: Object.fromEntries(
            properties.map((key) => [key, style[key]]),
          ),
        };
      });
    return {
      url: location.href,
      title: document.title,
      viewport: {
        width: innerWidth,
        height: innerHeight,
        dpr: devicePixelRatio,
      },
      scroll: {
        x: scrollX,
        y: scrollY,
        height: document.documentElement.scrollHeight,
        bodyOverflow: getComputedStyle(document.body).overflow,
      },
      focused: {
        tag: document.activeElement?.tagName,
        text: document.activeElement?.textContent?.trim().slice(0, 100),
        label: document.activeElement?.getAttribute("aria-label"),
      },
      visibleText: document.body.innerText,
      fonts: Array.from(document.fonts).map((font) => ({
        family: font.family,
        weight: font.weight,
        style: font.style,
        status: font.status,
      })),
      images: Array.from(document.images).map((image, index) => ({
        index,
        alt: image.alt,
        src: image.currentSrc || image.src,
        naturalWidth: image.naturalWidth,
        naturalHeight: image.naturalHeight,
        complete: image.complete,
        box: box(image),
        objectFit: getComputedStyle(image).objectFit,
        objectPosition: getComputedStyle(image).objectPosition,
      })),
      scrollContainers: Array.from(document.querySelectorAll("body *"))
        .filter(
          (element) =>
            element.clientHeight > 0 &&
            element.scrollHeight > element.clientHeight &&
            /auto|scroll/.test(getComputedStyle(element).overflowY),
        )
        .map((element) => ({
          tag: element.tagName,
          role: element.getAttribute("role"),
          box: box(element),
          scrollTop: element.scrollTop,
          scrollHeight: element.scrollHeight,
          clientHeight: element.clientHeight,
        })),
      elements,
    };
  });
  await page.screenshot({ path: path.join(output, `${name}.png`), fullPage });
  await fs.writeFile(
    path.join(output, `${name}.json`),
    JSON.stringify(metadata, null, 2),
  );
  await fs.writeFile(
    path.join(output, `${name}.txt`),
    await page.locator("body").ariaSnapshot(),
  );
  console.log(
    JSON.stringify({
      snapshot: name,
      text: metadata.visibleText,
      images: metadata.images,
      scroll: metadata.scroll,
      buttons: metadata.elements
        .filter((element) => element.tag === "button")
        .map(({ text, ariaLabel, box }) => ({ text, ariaLabel, box })),
    }),
  );
  return metadata;
}

try {
  const response = await page.goto(
    "https://airbnb-clone-umber-two.vercel.app",
    { waitUntil: "networkidle", timeout: 45000 },
  );
  if (!response?.ok())
    throw new Error(`Reference HTTP status ${response?.status()}`);
  await snapshot("listing-top");
} catch (error) {
  errors.push(error.stack);
  process.exitCode = 1;
  console.error(error.stack);
} finally {
  await fs.writeFile(
    path.join(output, "capture-report.json"),
    JSON.stringify(
      {
        at: new Date().toISOString(),
        browser: browser.version(),
        mediaResponses: [...mediaResponses.values()],
        errors,
      },
      null,
      2,
    ),
  );
  await browser.close();
}
