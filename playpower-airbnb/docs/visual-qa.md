# Visual QA — supplied screenshot comparison

## Image-quality improvement pass

Validation: lint/build passed; the existing17interaction checks and5new Lightbox quality groups passed. The latter traversed all14real photos, checked fixed canvas/control/title/counter rectangles, decoded every image, exercised both navigation methods and boundaries, and raster-checked the portrait fixture. The layout-shift observer reported approximately0.00259total input-driven text movement in the changing title/counter, with no non-input Lightbox CLS and no media/control rectangle changes. This distinction is deliberate; an absolute zero observed-shift claim would be incorrect.

The existing viewer was improved without rebuilding its three-view architecture. `width:auto/height:auto` was replaced by a fixed viewing canvas with contain/center fitting; source changes reuse the same image element. Image pixels keep their own ratios, while the canvas, toolbar, title field, arrows, close and counter have invariant bounds across all 14 photos. At1440x900 the first image retains its measured968x726 reference paint area.

All 14 existing property photographs now use matched public 2560px files in large Listing, Tour and Lightbox placements. Original JPEG bytes and provenance are retained. Listing hero cover crops were visually checked before replacement, including removal of a baked Show all photos button inside the old exterior screenshot crop. No source code or unrelated photos were copied. The current comparison files linked below were regenerated and visually inspected for Listing, Tour and Lightbox.

The [image audit](image-quality-audit.md) covers all 45 files, including encoded resolution, actual element/painted resolution, aspect ratio and CSS/DPR 2 scale. No active image has material upscaling at the tested desktop sizes. Archived low-resolution files are not used as enlarged photos; thumbnail/avatar softness can remain because their pixels came from screenshots. Source originals for those small decorative assets remain missing.

The new [Lightbox report](../implementation-captures/quality/lightbox-quality.json) includes all 14 actual photos, first/middle/last screenshots, wide/landscape images, and an isolated600x1200 portrait raster fixture. Every media/control rectangle stays fixed. Unexpected Lightbox CLS is zero; the report retains small input-driven text-change entries rather than falsely reporting no layout-shift observations at all. This is local correctness evidence, not proof of reference animation or portrait behavior.

Remaining visual differences: 14 local entries versus43reference entries; unknown full Tour order/layout; unavailable exact font files; original icon/brand/laurel approximations; minor crop/rasterization differences between public JPEGs and reference bitmaps. No substitute photos or sharpening were used, and no pixel-perfect claim is made.

The following comparison geometry is still relevant. The older high-priority enlargement problem in item2 is resolved for the 14large property photos by this follow-up.

---

2026-10-25. All three supplied originals were inspected, including both full-page images. Local Chromium 156.0.8078.4 captures use1440x900 CSS px,DPR 1. References are2880wide, normalized to1440 for comparison; original DPR/zoom is not independently verified. Font rasterization differences therefore cannot all be attributed to CSS.

## Comparison evidence

Run `npm.cmd run verify:frontend` with the local server running, then `npm.cmd run compare:reference`. Four unmasked reference-left/local-right comparisons are saved:

- [Listing top](../implementation-captures/comparison-listing-top.png)
- [Full Listing](../implementation-captures/comparison-listing-full.png)
- [Photo Tour top](../implementation-captures/comparison-tour-top.png)
- [First Lightbox](../implementation-captures/comparison-lightbox-first.png)

Local screenshots were visually reviewed against all supplied reference states. The complete Listing was reviewed in full; only the first Tour section and first Lightbox have reference coverage. No masks, selective hiding or stretched full-page heights are used. Full-page height equality does not establish pixel-perfect fidelity.

## Measured comparison

Reference numbers are estimates from half-resolution pixels; local values are DOM measurements recorded in [verification.json](../implementation-captures/verification.json).

| Element | Reference target | Local result | Finding |
| --- | --- | --- | --- |
| Hero | x160,y174,w1120,h494 | x160,y174,w1120,h494 | Major bounds match |
| Details | top716,left652,right372,gap96 | same structure and top716 | Major columns match |
| Sleeping images | x160/495,y1556,w318,h211 | x160/494,y1556,w318,h211 | Right card about1px left |
| First Tour section | x232,y582,w976 | x232,y582,w976 | Section start and width match |
| First Tour main image | x≈751,w≈457,h306 | x750,w458,h306 | Approximately1px horizontal/width difference |
| Lightbox photo | x236,y88,w968,h726 | x236,y88,w968,h726 | Image bounds/aspect match |
| Map | x160,y4225,w1120,h480 | x160,y4225,w1120,h480 | Bounds match; internal illustration approximate |
| Listing full height | 6256 after normalization | 6256 | Total extent matches; internal text/icon differences remain |

The first comparison exposed a blank decorative Tour header and incorrect sleeping/section spacing. Those were corrected and screenshots regenerated. Lightbox title was centered after inspecting the original side-by-side evidence. See the current images rather than the initial capture iteration.

## Remaining differences and missing coverage

1. **High — missing gallery:** reference counter43; local dataset14. Only first group's three-photo order is verified. Other group layouts/order are assumptions;29 photos and complete Tour screenshots are unavailable. No invented filler is used.
2. **Resolved for large property photos — image resolution:** the roughly222px category crops are no longer enlarged in Tour/Lightbox. All 14large property photographs use matched public 2560px media. Screenshot crops are retained for small UI placements/provenance. All31 retained WebP derivatives still match their original source rectangles;14 public JPEG hashes are checked separately.
3. **Medium — typography:** Arial/system sans-serif is an approximation. Original family/weight files are not supplied. Some headings, line wrapping and weight differ; exact font fidelity is unverified.
4. **Medium — icons/decorations:** brand, line icons and laurels are original approximations. Search uses a house emoji rather than the reference's illustrated house. Tag/chip emoji rendering differs by platform. No source SVG paths were copied.
5. **Medium — map and host details:** map geometry/colors and decorations are reconstructed in CSS; small offsets remain. Actual screenshot co-host portraits are used where available; styling/raster detail varies.
6. **Medium — peripheral interactions:** search, sharing, offer, amenities expansion, review expansion and messaging are not connected to services or unprovided content. Save toggles locally; calendar controls are local UI; Reserve goes to dates. These are outside the three primary-view scope.
7. **Unverified — behavior fidelity:** hover, transition duration/easing, overlay scrolling, focus restoration, history and navigation boundaries have no reference recordings. Local behavior is implemented and tested, but not claimed identical to the reference.

No pixel-perfect claim is made. Supplying the original43-photo sequence, fonts and complete Tour/Lightbox evidence is the next step toward full fidelity.
