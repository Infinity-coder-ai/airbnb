# Reference analysis - supplied screenshots

Reference: https://airbnb-clone-umber-two.vercel.app

Updated 2026-10-25 (Asia/Calcutta).

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

Tour begins beneath global title around y160. Back/Photo tour/share/heart toolbar. Content x232,width976. Thumbnail112x104,radius8,gap12; eight in row1,one in row2. Category order: Living room 1,Living room 2,Full kitchen,Bedroom,Full bathroom,Gym,Exterior,Pool,Additional photos. First section y582: left32px heading and muted16px Sofa · Air conditioning · Ceiling fan · TV; right457x306 main photo and two222x148 photos below. The long capture does NOT show the complete Tour after this first group.

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
