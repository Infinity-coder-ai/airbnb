# Asset inventory — current screenshot-derived assets

## Search-home icon update — 26 October 2026

`src/assets/reference/search-home.png` is a128×115 transparent PNG derived from the user's newly supplied house artwork through the built-in image editing workflow, then losslessly PNG-compressed for the31.59×30.4px header placement. The edit request preserved the house, roof, red door, windows, greenery, path, circular lighting and proportions while removing only surrounding background pixels. It replaces the temporary code-drawn SVG and avoids system emoji variation. The generated extraction is a close visual derivative rather than a byte-identical crop because the chat image was not exposed as a local source file. It is used only for the search-home placement and is not presented as a reference-site original download.

## Computed font/icon evidence — 26 October 2026

The inline user DevTools screenshots verify Arial, Helvetica, sans-serif at26px for H1 and22px for the property H2; color#222222. The search-home span is23px in the reference and its visible symbol occupies31.59×30.4px, but OS emoji artwork did not visually match between captures. The local house is now an original screenshot-matched SVG inside the same measured box, with no downloaded asset or copied reference path. Weight, letter spacing, rendered font files elsewhere, and redistribution rights are not established by the tooltips. See [reference analysis](reference-analysis.md) for bounds and viewport limitations.

No photo files or image sequence were changed during the interaction audit. All14 matched public photographs and31 screenshot derivatives are preserved. The reference audit is [blocked by HTTP429](reference-audit/reference-access.json); no additional29 gallery entries were inferred or imported.

## Current quality update

There are now **45 local raster assets: 31 retained screenshot crops and 14 high-resolution public JPEGs**. Every existing property photo has been visually matched to a public photograph from the [same Airbnb listing](https://www.airbnb.co.in/rooms/1599895892448055764) and its [public property gallery](https://bukavilla.com/v/mirashya-homes-botanica-by-raichandani-romantic-jacuzzi-1bhk-candolim-mirashya-ug10). All 14 public files are 2560 pixels wide: twelve are 2560 x 1920, and the two exterior views are 2560 x 1437. The public JPEG bytes are preserved without re-encoding, sharpening or enlargement.

Exact source URLs, visual-match IDs, discovery/identity pages, dimensions and SHA-256 are in [public-media.json](../src/assets/reference/public-media.json). Large Listing photos, sleeping cards, Tour photos and Lightbox use these local files through `galleryAsset`. Category thumbnails, portraits and nearby cards retain screenshot crops at appropriate small sizes. The exterior hero no longer contains a baked-in screenshot of the Show all photos control; the real React control is drawn once over the clean photo.

The full per-file/per-placement audit is [image-quality-audit.md](image-quality-audit.md), with raw [measurements](../implementation-captures/image-quality.json). All 45 files were inspected through the contact sheet and source/placement comparisons. No active photo has material pixel upscaling at 1440 x 900, DPR 1 or the calculated DPR 2 requirement (5% reporting tolerance; maximum fractional rounding is about 0.5%). Small thumbnail/avatar crops can retain baked screenshot softness; this is not repaired with filters. Archived unused low-resolution crops remain traceable, not enlarged in the UI.

### Discovery and remaining gaps

Normal rendered public galleries were inspected without copying source, reading private endpoints or logging in. Seventeen candidates were checked against the supplied evidence; 14 exact matches were imported, three unmatched views were excluded. A public gallery exposes 37 property photos, but this does not establish the reference clone's 43-photo identities or ordering. The app therefore retains its existing 14-photo sequence. The other 29 reference positions remain unverified; do not fill them with the other public photos or unrelated substitutes without evidence/approval.

An attempted 2048-width variant on the first CDN returned HTTP 404; those failed requests were not retried or bypassed. The imported 2560-wide images come from the explicitly exposed public image URLs on the property gallery. Public accessibility establishes the local source, not an unrestricted redistribution license. No public publishing was performed.

The earlier screenshot-only inventory below describes the retained crop set and provenance. Its missing-original-resolution statement is superseded for these 14 matched photographs.

---

All three supplied screenshots are now inspected. Original font files remain unavailable; public media sources for the 14 matched photos are documented above. **31 local image crops, including 14 distinct property views plus a hero-specific bedroom crop**, were extracted from actual reference screenshots into `src/assets/reference/`. No stock photos, generated photos or full-page screenshot UI backgrounds are used. Files are screenshot derivatives, not recovered originals. No public redistribution/license claim is made.

`src/assets/reference/provenance.json` records exact source filenames, physical-pixel crop rectangles, dimensions and SHA-256. `npm.cmd run assets:prepare` uses `scripts/prepare-reference-assets.mjs` and development-only sharp to reproduce lossless WebP crops. All original captures remain unchanged. Pixel comparison verified all 31 decoded crops exactly match the specified source rectangles. The blocked PowerShell script was replaced without changing execution policy.

| Local IDs (.webp) | Use/order | Verification |
| --- | --- | --- |
| terrace-front,terrace-side,jacuzzi,bedroom,exterior | Listing hero1–5 | Actual reference subjects; screenshot crops |
| living-01 | Tour/Lightbox first photo | Lightbox crop1936x1452 |
| living-02,living-03 | First group photos2–3 | Tour crops444x296,446x296 |
| kitchen,bathroom,gym,exterior-aerial,pool,additional | Category thumbnails3,5,6,7,8,9 | Approximately222–224x208, not originals |
| host | Host summary/card | Actual reference logo/portrait crop |
| bedroom-hero | Bedroom hero placement | Exact hero screenshot crop; bedroom remains separate for wider sleeping placement |
| cohost-sharath,cohost-aman,cohost-maria,cohost-simran,cohost-pallavi,cohost-sanyukta | First six co-host portraits | Actual screenshot crops; Shruti and Amisha use the observed initial-avatar treatment |
| aheesh,samiksha,vaibhav,mohd | Reviews | Actual reference portraits |
| nearby-01 through nearby-05 | Nearby stays1–5 | Actual separate property images; never used in current property's gallery |

First living-room group order is verified. Remaining groups follow observed category order but unseen within-group order is assumed. Reference total43 is observed;29 photos unavailable. Local navigation uses14 available photos and honest local count. Thumbnail enlargement will be visibly limited. Font family/weights unknown: system sans-serif approximation. Icons/brand are original vector approximations; map is original CSS rendering of observed illustration, not invented geographic data.

Missing before full fidelity approval: all 43 ordered originals/public URLs, complete Tour beyond first group, other Lightbox states/boundaries, actual fonts, higher-resolution avatars and motion/keyboard recordings. The earlier empty inventory is superseded by this supplied-screenshot register.

---
