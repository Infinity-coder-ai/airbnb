# Reference analysis - supplied screenshots

Reference: https://airbnb-clone-umber-two.vercel.app

Updated 2026-10-26 (Asia/Calcutta).

## Amenities, description and review-strip evidence — 26 October

New user-supplied screenshots verify three additional reference interactions and one header detail:

- The search-home control represents the Unicode **🏡** glyph. The reference screenshot's emoji artwork differs from the local Chromium system-emoji artwork despite using the same code point. The clone therefore uses an original fixed SVG reconstruction of the visible gray roof, pale house, pink door/windows and green garden at the supplied31.59×30.4px bounds. This avoids platform-dependent emoji substitutions; it is visually reconstructed from the screenshot and is not copied source artwork.
- **Show all 50 amenities** opens a centered white modal over a dimmed Listing. Normalizing the2880×1800 screenshot to its1440×900 CSS viewport establishes x330,y48,width780,height804px. The reconstructed modal uses12px radius, a fixed close control,48px content gutters, a26/34px title,22/28px group headings,16/24px amenity text and56px divided rows. Its content surface scrolls independently. Escape and the visible close button restore the exact opener and preserve Listing scroll.
- The supplied amenity text contains12groups and44displayed rows, including Cot in both Bedroom and laundry and Family. The reference button still says50. The implementation renders all44verified rows in the supplied order and does not invent the six absent rows. Amenity icons are original local line drawings/approximations; no reference SVG paths were copied.
- The property description expands in place to the supplied full paragraph and changes its control to **Show less**. Collapse/expand exposes `aria-expanded` and keeps the description related through `aria-controls`.
- The eight review-highlight chips are a single horizontally scrollable row. The local region is keyboard focusable, hides only the scrollbar chrome and retains real horizontal overflow; the screenshot evidence does not establish buttons or click actions for these chips.

Local browser evidence is in [amenities report](../implementation-captures/amenities/report.json), with [modal top](../implementation-captures/amenities/amenities-top.png), [modal bottom](../implementation-captures/amenities/amenities-bottom.png), [expanded description](../implementation-captures/amenities/description-expanded.png) and [scrolled review highlights](../implementation-captures/amenities/review-highlights-scrolled.png). These verify the local behaviors against supplied static states; exact original scroll physics, focus handling and all six unprovided amenity rows remain unverified.

## Interaction audit and supplied computed-style evidence — 26 October

A headed Chromium 156.0.8078.4 visit at 1440×900, DPR 1 again returned **HTTP 429 / Vercel Security Checkpoint**, with “We're verifying your browser”. Requests stopped there. See the [access report](reference-audit/reference-access.json), [blocked-page capture](reference-audit/screenshots/reference-access-blocked.png), [interaction matrix](reference-audit/interaction-matrix.md), [gap analysis](reference-audit/gap-analysis.md) and [specific manual checklist](reference-audit/manual-capture-checklist.md). No original interaction was directly confirmed in this attempt. The initial sandbox network-denial was distinguished from the subsequent actual website response.

Three user-supplied inline DevTools screenshots now establish these exact computed-style values for the reference; earlier unknown-family statements are superseded **only for these elements**:

| Element | Supplied font / color | Supplied bounds | Local measured result |
| --- | --- | --- | --- |
| Listing H1 | 26px Arial, Helvetica, sans-serif; #222222 | 603.85×34 CSS px | Same family/size/color; 603.84375×34 |
| Property H2 | 22px Arial, Helvetica, sans-serif; #222222 | 498.4×28 CSS px | Same family/size/color; 28px line height; block width652, text bounds450.39 at 1440px viewport |
| Search house | 🏡 symbol; screenshot shows gray-roof/pink-door garden artwork | 31.59×30.4 CSS px | Stable original SVG at31.59×30.4 rather than platform emoji artwork |

These attachments are in the conversation, not files in reference-captures. Their original viewport/zoom/DPR was not provided. H2 block width is affected by the column/viewport and is not its text width. Do not upscale fonts from physical screenshot pixels or change a correct26px font to approximate a zoomed image. The tooltips do not explicitly report weight or letter spacing; local600/-0.6px H1 and600/-0.35px H2 remain local choices. Font identity elsewhere and all original motion remain unverified. The house symbol's supplied visual bounds are retained; its rendered artwork is stabilized as described above.

The user reports that sleeping images open Tour, date/guest selection works, Reserve scrolls to dates, and Save turns red. Those are **user-reported reference observations**, not automated confirmations. The local audit found sleeping images, 1–3 native guests and Listing red-heart Save already work. Basic date selection was defective: it changed only a day/day+5 highlight, without updating the booking dates or summary. A shared date-only range now synchronizes calendar and booking fields, supports month/year traversal and Clear dates; check-in/checkout and Reserve scroll to the inline calendar and focus its heading, respecting reduced motion. Selection mechanics and focus placement are local accessible decisions; exact reference field popups, unavailable-date rules and price calculation remain blocked.

The original **₹28,499 for five nights and cancellation terms remain fixed screenshot content**, not a recalculated quote for changed dates. Crossed-out November dates retain screenshot styling; live availability/disabled-date semantics have not been established or implemented. No fake availability, nightly rate, checkout service, guest-category popup, Save persistence or secondary dialog was invented. See [booking regression](reference-audit/booking-regression.json) for local coverage, and the matrix for no-action controls. All existing photo assets/order and gallery behavior remain intact.

## Lightbox sizing and image-quality follow-up

Root cause: `width:auto;height:auto` let each small screenshot crop render at its native size, whereas large files reached the max-size limits. The viewer now uses a persistent image element within a viewport-derived **1280 x 726 canvas at (80,88)** at 1440 x 900. `object-fit:contain` and centered positioning preserve each source's intrinsic aspect ratio. The canvas is a viewing area, not an imposed photo aspect ratio. The first 4:3 photo still paints at **(236,88), 968 x 726**, matching the supplied Lightbox. Wide exterior photos occupy the wider available area with letterboxing; portrait geometry is tested separately.

Arrow boxes remain (20,430) and (1380,430),40 x 40; close remains (1376,16),40 x 40. The counter has a fixed72px slot and tabular numerals. The centered title also has a stable field. Image source changes no longer remount the img or restart its initial fade; adjacent images are prefetched/decoded. The original initial150ms ease-out fade and reduced-motion override remain; exact reference motion is still unverified.

All 14 existing property photos now have visually matched public 2560px JPEGs; large Listing, Tour and Lightbox placements use them. These are the same photographs, not substitute property imagery. Listing cover crops were checked side by side; containers and positions were retained. Small category thumbnails and portraits still use appropriately sized screenshot derivatives. See the updated [asset inventory](asset-inventory.md) and [per-file quality audit](image-quality-audit.md).

Actual references contain no portrait example. A blue600 x1200 test-only fixture was injected at the browser network layer to verify contain/letterboxing and raster aspect ratio; it was never added to production data. Its screenshot is explicitly labelled as a fixture in the [quality test report](../implementation-captures/quality/lightbox-quality.json). Do not treat it as a supplied property photo or evidence of reference portrait behavior.

The remaining 43-photo sequence, exact fonts and interaction recordings are still missing. The older screenshot observations below remain valid visual evidence; their missing-original-media limitation is superseded for the 14 matched photos.

## Current evidence (supersedes historical unknown ledgers below)

All THREE supplied screenshots have now been inspected in full and in readable cropped panels from top to bottom. All are 2880 pixels wide; dimensions are consistent with 1440 CSS px at DPR 2, but actual DPR/viewport metadata was not supplied. Measurements below are half-resolution screenshot measurements, not original computed styles.

| Filename suffix | Visual identification | Coverage |
| --- | --- | --- |
| `modalItem=1006.png` | Listing | Full page,2880x12512, five hero images through nearby stays |
| `PHOTO_TOUR_SCROLLABLE (1).png` | Photo Tour over Listing | 2880x12512, but only category strip and first living-room group are Tour; remainder exposes underlying Listing |
| `modalItem=1000.png` | Lightbox | 2880x1800, Living room 1, first image, counter 1 of 43 |

The filename parameters do not reliably identify the view; classification is visual. Original files are preserved. Earlier smoke reports linked in the historical record below are no longer present in reference-captures.

### Verified Listing observations

Header88px high; main x160,width1120 at1440 target. Search pill centered,width404,height48. Title at y120: **Romantic Jacuzzi 1BHK Candolim | Mirashya UG10**; Share and Save. Hero x160,y174,width1120,height494; columns560/272/272,gap8,radius12. Images: terrace front, terrace side, hot tub, bedroom, exterior. Show all photos at bottom right.

Details begin y716 with left652/right372/gap96. Entire serviced apartment in Candolim, India;3 guests ·1 bedroom ·1 bed ·1 bathroom. Guest favourite /4.95 /19 Reviews. Hosted by Mirashya Homes /2 years hosting. Outdoor entertainment, Designed for staying cool, Self check-in. Translation notice and visible description. Sleeping cards318x211 at y1556: Bedroom/1double bed and Living room/1sofa.

Amenities: Kitchen,Wifi,Dedicated workspace,Free parking on premises,Pool,Hot tub,Pets allowed,Exterior security cameras on property; crossed-out Carbon monoxide alarm,Smoke alarm. Show all50 amenities. October/November2026 calendars,18–23October selected. Sidebar₹28,499 for5 nights;2 guests;10%offer; cancellation before17October; Reserve; You won't be charged yet.

Below-fold: large4.95 laurel rating; Cleanliness/Accuracy/Check-in/Communication5.0,Location/Value4.8. Six reviews by Amit,Aheesh,Samiksha,Vedant,Vaibhav S,Mohd. Candolim map illustration x160,y4225,w1120,h480. Host Mirashya Homes,1,463 reviews,4.68rating,2 years hosting; co-hosts and response details. Three policy columns and five nearby-stay cards. All visible excerpts are transcribed in application data; truncated review/description text is not extended with invented content.

### Verified Photo Tour and Lightbox observations

The earlier implementation placed the Tour beneath a duplicated 160px Listing header/title block. The user has since explicitly corrected this behavior: opening any photo must show the Photo Tour without the main-page site header or listing title. The Tour therefore starts with its own 72px back/title/share/save toolbar at the top. Content remains x232,width976 at 1440px; thumbnail112x104,radius8,gap12; eight in row1,one in row2. Category order: Living room 1,Living room 2,Full kitchen,Bedroom,Full bathroom,Gym,Exterior,Pool,Additional photos. The available long capture does NOT show the complete Tour after the first group, so lower-group fidelity remains unverified.

The supplied cropped scroll-state screenshot verifies a white fixed section bar containing `Photos`, `Amenities`, `Reviews`, and `Location`, with a dark underline beneath the active `Photos` tab and a light bottom divider. A wider supplied modal screenshot additionally shows the compact right side: `₹28,499 for 5 nights`, `★ 4.95 · 19 reviews`, and a red `Reserve` button. The user reports that this bar slides down as the Listing scrolls. The screenshots do not establish the exact trigger scroll offset or animation timing; the implementation uses 620px and 220ms as documented assumptions.

Lightbox white fullscreen; topbar72; grid at left,Living room 1,counter 1 of 43,close. Main image x236,y88,w968,h726 (4:3). Previous/next40px circles centered vertically. First previous is visibly muted. No other Lightbox state is supplied.

### Missing evidence reported before implementation

Complete Tour, all 43 originals/order, other Lightbox states, actual font files, and behavior recordings are missing. Only14 distinct property views are extractable. Screenshot-derived crops are used locally and identified as such; never unrelated stock or invented29 photos. Font family cannot be identified from pixels; system sans-serif is an approximation. White/#222/muted-gray/light-gray borders/pink Reserve are visual estimates, not measured original CSS colors.

### Behavior assumptions

Hero/show-all open Tour; category clicks scroll; gallery opens Lightbox. Arrow keys/buttons clamp at available14-photo boundaries and counter uses actual available count. Escape closes one level; focus and both scroll positions restored; only active overlay interactive. Hover transitions, focus styling, reduced-motion behavior and Tour scroll implementation are accessible design choices, not verified reference behavior. Ancillary booking/search controls are presentation outside the three-view scope; no real booking or messaging is claimed.

See [asset inventory](asset-inventory.md) for crop provenance. The current screenshot observations supersede the earlier automated-capture failure status.

---

## Earlier automation context

Integrated browser initialization failed with a missing kernel-assets path (OS error 3). Standalone Playwright 1.64.1 and matching Chromium 156.0.8078.4 started successfully; the reference returned HTTP 429, so automated reference requests stopped. The present implementation uses supplied screenshots, not fetched application source or new target requests. Old smoke/report files are no longer present in reference-captures.

The Lightbox title is centered in the original reference, as confirmed by the unmasked comparison; the local title has been centered accordingly. Local behavior checks and comparison limits are recorded in [visual QA](visual-qa.md) and [accessibility audit](accessibility-audit.md).
