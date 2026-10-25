# Implementation plan

## Follow-up: stable Lightbox and adequate-resolution media

Implemented on the existing components/state model: persistent contain-fit image in a fixed viewport-derived canvas; stable title/counter fields and unchanged arrow/close positions; neighbour preload/decode; no forced photo ratio. Fourteen exact photo matches from public rendered galleries are local 2560px JPEGs with source/hash provenance. No photos or sequence entries were invented; count stays14until the reference's full43sequence is verified. Listing photo placements use the clean media with their existing cover geometry; small screenshot thumbnails/avatars remain.

New verification commands: `npm.cmd run verify:lightbox` tests every real photo and an isolated non-production portrait fixture; `npm.cmd run audit:images` measures every 45image asset across all three views. See [image-quality-audit.md](image-quality-audit.md) for the complete asset table and links to JSON placement measurements. `verify:frontend`, lint and build continue to validate the existing app; `compare:reference` checks31 crop pixels and14 public-media hashes while generating unmasked comparisons.

Reference fidelity gaps remain fonts,43-photo identity/order and recorded behavior. Portrait fitting is functionally tested, but there is no reference portrait screenshot to compare. No unrelated substitutions, source lifting, sharpening, new infrastructure or public pushes.

## Frontend implementation — current status (supersedes historical plan status below)

Current validation: `npm.cmd run lint` and `npm.cmd run build` passed. All 17 local Playwright interaction checks passed with zero runtime/asset HTTP errors. Four unmasked comparisons were generated; all 31 decoded lossless crops match their source rectangles. All35 local documentation links resolved. Local server HTTP200 at http://127.0.0.1:5173/. See the verification/comparison JSON reports in `implementation-captures/`; no reference behavior, screen-reader or pixel-perfect claim is implied.

The user authorized implementation after supplying three screenshots. Listing, Photo Tour and Lightbox are implemented in original React/TypeScript/plain CSS. All screenshot originals were inspected. Their full Listing is covered; Tour evidence stops after Living room 1, and only the first Lightbox photo is supplied. Read the current [reference analysis](reference-analysis.md) and [asset inventory](asset-inventory.md) before changing photo order or claiming fidelity.

Components: `SiteChrome`, `ListingPage` with reusable sections, `Calendar`, `PhotoViews`, and original `Icon`/`Laurel` drawings. `data/photos.ts` owns14 stable property-photo IDs, nine groups and explicit hero order; `data/listing.ts` owns review/nearby text. `App.tsx` owns the discriminated three-view state and overlay lifecycle. The mounted Tour is hidden/inert under Lightbox so its scroll remains intact; body lock lasts through both levels; exact opener refs restore focus. Only the active layer participates in keyboard navigation.

Both hero/show-all entry paths open Tour. Category controls scroll to groups. Gallery photos open Lightbox; pointer and arrow keys navigate within available data; disabled boundaries clamp. Escape closes one layer, with Listing/Tour scroll and focus restoration. Hover and reduced motion are supported. Ancillary booking/search/amenities/review controls remain visual outside three-view scope; Reserve links to the date section rather than pretending to book.

`sharp` is a development-only preparation/comparison dependency. `npm.cmd run assets:prepare` reproduces31 lossless reference-image crops with provenance; `npm.cmd run verify:frontend` runs the local Playwright interaction checks and captures; `npm.cmd run compare:reference` creates four unmasked reference-left/local-right comparisons and checks decoded crop pixels. No added production runtime libraries, backend, hosted service or public push.

Known gaps:29 unavailable property photos, full Tour ordering/layout, exact fonts, icon/brand/laurel details, original images and reference behavior recordings. Local Lightbox displays14 available photos rather than claiming43navigable entries. Unseen groups use the observed category sequence with explicitly assumed layouts. See [visual QA](visual-qa.md) and [accessibility audit](accessibility-audit.md) for coverage and limits.

---

## Historical planning and browser-diagnosis record

## Status and scope

2026-10-25 update: standalone browser tooling is configured under the user's browser-diagnosis instruction. Playwright 1.64.1 and matching project-local Chromium 156.0.8078.4 start successfully; the corrected public-page smoke test passes at 1440 x 900, DPR 1. Reference capture stopped on HTTP 429. No assignment UI is implemented; the setup status page remains unchanged. [reference-analysis.md](reference-analysis.md) records the diagnosis, exact failure and manual fallback. [asset-inventory.md](asset-inventory.md) still contains zero verified reference assets.

The design below is **proposed engineering architecture**, not a description of observed reference components or behavior. Exactly three primary views are in scope: Listing Page, Photo Tour, Lightbox. Use React + TypeScript + Vite, plain CSS, and local assets. No backend, authentication, reservations service, router package, icon library or state-management package is justified at this stage.

## Proposed component and module structure

```text
src/
  App.tsx                         Owns the three-view state and photo transitions
  components/
    listing/
      ListingPage.tsx              Composes only sections confirmed by inspection
      HeroPhotos.tsx               Uses explicit hero placements, opens Photo Tour
      ListingHeader.tsx            Conditional on observed content/structure
    photos/
      PhotoTour.tsx                Ordered gallery and observed group structure
      PhotoTile.tsx                Semantic image opener with aspect/crop metadata
      Lightbox.tsx                 Active photo, previous/next, close and counter
    shared/
      IconButton.tsx               Accessible name and visible keyboard focus
      PhotoImage.tsx               Shared source, dimensions, crop and loading rules
      OverlayFrame.tsx             Dialog lifecycle, focus, scroll and motion rules
  data/
    photos.ts                      Verified metadata, explicit placements and order
    listing.ts                     Exact transcribed reference content
  hooks/
    usePhotoNavigation.ts          Reducer/transitions with explicit return state
    useOverlayLifecycle.ts         Scroll lock and focus setup/cleanup
  types/
    photos.ts                      Photo, placement and group types
  assets/
    photos/                        Verified property originals and derivatives
    fonts/                         Verified faces with license/attribution
    icons/                         Supplied assets or original measured vectors
  styles/
    global.css                     Reset, fonts, measured shared tokens
    listing.css
    photo-tour.css
    lightbox.css
```

This is a candidate file layout, not instructions to create empty modules now. Add Listing sections and any grouping/sidebar/sticky regions only when observed. Keep photo presentation shared without forcing differently cropped placements into the same CSS. Use original semantic markup and implementation; do not retrieve or copy the reference's source.

## Shared photo dataset

- Give every distinct original a stable `PhotoId`, independent of array index or filename order. Store `src`, intrinsic width/height, verified alternative text, optional exact caption, and available derivative sources once in a normalized photo map.
- Store hero placements separately: ordered photo IDs and per-placement aspect ratio/object position. Do not assume there are five hero tiles or that gallery order matches hero order.
- Store tour groups and ordered photo IDs according to observed display order. If there are no groups, use a single ordered sequence without invented category labels.
- Define the Lightbox navigation sequence explicitly from observations. It may be global or group-specific; this is currently unknown. Keep the current photo ID plus sequence ID, deriving index/counter from that sequence. Never maintain a second competing active-index state.
- Keep crops at the placement level, since the same original may be covered in the hero and contained in Lightbox. Captions, labels and counts must be transcribed, not generated. Alt text may be written originally to describe verified photos; do not invent visual content.
- Validate that every placement references an existing photo, dimensions are positive, sequence IDs are unique, and the current photo belongs to its navigation scope. Preserve intentional repeated placements; do not deduplicate the reference's presentation order by accident.
- Keep provenance, licenses and hashes in the inventory rather than in application UI. Derive displayed totals from verified sequences unless the reference uses another explicit count.

## Three-view navigation and state model

Use a discriminated union/reducer rather than unrelated booleans such as `tourOpen` and `lightboxOpen`. Candidate logical states:

```text
Listing
Tour { entryPhotoId? }
Lightbox { photoId, sequenceId, returnToTour }
```

`returnToTour` retains the tour context and active opener identity. Keep DOM references and scroll snapshots in lifecycle refs, outside the serializable reducer. All transitions must be explicit:

| Current | Event | Next | Preserved state / open question |
| --- | --- | --- | --- |
| Listing | Show all photos | Tour | Save Listing opener and page position; actual initial tour position unknown |
| Listing | Hero image activation | Tour | Save exact opener and optional entry photo; whether tour scrolls to that photo is unverified |
| Tour | Gallery image activation | Lightbox | Save tour scroll position, originating tile and scope; display exactly the clicked photo |
| Lightbox | Previous / next | Lightbox | Resolve in verified scope; wrap/clamp/disabled boundary policy awaits evidence |
| Lightbox | Close / Escape | Tour | Restore tour context, scroll and tile focus; desired accessible behavior |
| Tour | Close / Escape | Listing | Restore Listing scroll and original opener focus; desired accessible behavior |

No direct Listing -> Lightbox transition is planned; the user requires hero images to open Photo Tour. Do not introduce a fourth primary view. Incidental observed controls can be components, but new functional flows require separate scope. Do not invent navigation for unobserved content. Browser Back, deep links, URL changes, backdrop-click closing, zoom and thumbnails are unresolved; do not add them because a typical photo site has them.

## Overlay scrolling and focus restoration

These are proposed accessibility requirements; none is a verified claim about the reference:

- Keep Listing mounted to preserve its state and scroll position. Render overlay content outside any inert Listing subtree, using one active dialog surface at a time. The visual overlay treatment must still match observed behavior.
- Save the initiating element before each open. Move initial focus to an appropriate labelled heading or close control after the active dialog mounts. Use semantic buttons for gallery/hero activation and explicitly labelled icon buttons.
- Make only the top view interactive. Keep the background inert and outside the active dialog's tab order. If Tour remains mounted behind Lightbox to retain its layout/scroll, hide/inert it and suspend its focus trap; never run two active modal focus traps.
- Choose native `dialog` or a small tested dialog implementation after inspecting the reference and testing Windows browsers. Do not combine native modality with a competing custom focus trap. Include a dialog name and appropriate semantics; handle Escape exactly once so one keypress closes only the top layer.
- Capture existing body style values and page scroll once at first overlay entry. Apply a body scroll lock and measured scrollbar compensation if required. Keep that lock through Tour <-> Lightbox changes and restore original values only on return to Listing. Do not hard-code a scrollbar width.
- Preserve the tour scroll container and scroll offset before Lightbox opens. Restore after Tour is visible, then focus the actual tile using `preventScroll` so focus does not undo restoration. If an opener no longer exists, use a deterministic visible fallback within the returned view.
- Clean up listeners, inert state, styles and focus handling under unmount and React StrictMode. Prevent background arrow-key handling and ignore unintended shortcuts from editable controls. Avoid intercepting Tab unless the selected dialog strategy needs it.
- Support `prefers-reduced-motion`; keep all content and controls usable without motion. Prioritize accessibility for keyboard/focus/reduced motion even if the reference has a defect, and document the intentional difference instead of hiding it as a fidelity match.

## Image loading, fonts and optimization

- Import verified local assets through Vite, retaining a provenance record. Prefer actual licensed WOFF2 faces and only the used weights/styles; verify loading before visual baselines. No guessed Airbnb font substitute can receive a fidelity pass.
- Supply width/height or an observed aspect ratio to reserve space. Set cover/contain and object position per measured placement. Confirm both orientation cases if the dataset contains them.
- Load the primary visible hero image eagerly; prioritize only the probable LCP image. Lazy-load offscreen Tour photos. Keep low-quality placeholders out unless the reference actually uses them.
- Load the active Lightbox image promptly and prefetch/decode a bounded set of adjacent images. Avoid downloading every full-size original when the user opens Tour. Handle rapid navigation without stale image/caption combinations.
- Generate responsive derivatives only from verified originals and after display sizes are measured. Use `srcset`/`sizes` when worthwhile; keep enough resolution for the largest Lightbox at the target DPR. Do not generate property imagery or upscale small thumbnails as a substitute for missing originals.
- Use local decoded dimensions and hashes to prevent image/order mistakes. Keep any failure/loading treatment restrained and original; never silently replace missing reference media with unrelated stock content.

## Test and comparison plan

The later browser-diagnosis task explicitly authorized the `playwright` development dependency. It is now installed as a standalone library; no test runner or axe dependency was added. Use `npm.cmd run browser:smoke` for the public-page startup/render/screenshot check and `npm.cmd run capture:reference` for the initial Listing diagnostic capture when normal reference access becomes available. Extend capture interactions from observed controls rather than inventing selectors or photo sequences. During UI implementation, choose meaningful browser tests and optional accessibility scanning as needed; do not write tests that restate JSX.

| Area | Cases and expected result |
| --- | --- |
| Build quality | `npm.cmd run build` and `npm.cmd run lint` pass after implementation changes; TypeScript remains clean |
| Dataset integrity | Every hero/tour/lightbox placement resolves, all sizes positive, clicked IDs map to intended sequence, intentional duplicates preserved |
| Entry paths | Show-all and each distinct hero entry open Tour; every tour image opens the corresponding Lightbox photo |
| Navigation | Pointer and arrow-key navigation agree; first/last behavior matches evidence; counter/caption stay aligned during rapid changes |
| Lifecycle | Escape closes one level; repeated open/close restores correct opener and both scroll offsets; no leaked body lock or listeners under StrictMode |
| Accessibility | Keyboard-only completion, Tab/Shift+Tab containment, meaningful dialog/control names, sensible alt text, focus visibility, inactive backgrounds unreachable, reduced motion |
| Rendering | Same 1440 x 900 CSS viewport, zoom, DPR and browser as reference; fonts loaded and images decoded; fixed scroll states; no runtime errors or missing asset requests |
| Visual review | Listing top/below-fold, all Tour sections, representative landscape/portrait Lightbox states, controls, hover/focus states and transitions compared against named evidence |
| Stability | No layout jump when media loads or scrollbar disappears; slow image loading and rapid prev/next do not corrupt state |

For comparisons, keep both images at the same CSS viewport and DPR. Document raw screenshot differences and any masks; never mask text, photos or layout to manufacture a pass. Start with major bounds/order/crops, then fonts/wrapping, spacing, colors, icons and motion. Record element-specific pixel deviations and evidence instead of asserting an arbitrary global similarity score. Review antialiasing and OS rendering differences separately from real geometry errors. A static screenshot match is not an interaction or accessibility pass.

## Milestones and exit criteria

1. **Evidence intake:** standalone Playwright works; initial reference request returned HTTP 429 and automated reference attempts have stopped. Obtain normal reference access or the manual capture package, then complete all three ledgers and verify photo sequences/overlay boundaries. Current status: blocked, not complete.
2. **Asset readiness:** enumerate actual photos/icons/fonts, acquire legitimate files, verify visual identity, dimensions/order/crops and reuse basis. Current status: pending; zero verified assets.
3. **Design measurements:** document actual hierarchy and measured tokens, exact text and content extent. Resolve hero/tour entry behavior and Lightbox scope. No generic Airbnb values count as evidence.
4. **Listing implementation:** after the user requests UI work, build observed Listing sections and hero from the verified dataset. Compare at 1440 x 900 and all recorded scroll positions.
5. **Photo Tour:** implement measured grouping/layout/scroll behavior, both entry paths and accessible exit. Verify every photo placement and restoration.
6. **Lightbox:** implement measured canvas/controls, clicked-photo mapping, verified prev/next policy, keyboard navigation and return context.
7. **Audit and refinement:** run the four configured roles against the same evidence set; resolve layout, typography, crop, focus and lifecycle issues; record limitations rather than claiming untested fidelity.
8. **Assignment documentation:** produce a separate production-scale architecture diagram as an explanatory deliverable when requested for that phase. Keep hypothetical CDN/media delivery, application services, storage and scale tradeoffs distinct from this frontend-only implementation; no backend deployment is implied.

## Role execution and handoff

Repository instructions live in [AGENTS.md](../AGENTS.md). Four repo-local skills provide responsibilities, inputs, outputs and verification criteria:

- [frontend-implementer](../.agents/skills/frontend-implementer/SKILL.md): implementation only when the user authorizes UI work.
- [reference-auditor](../.agents/skills/reference-auditor/SKILL.md): observation and state-by-state evidence completeness.
- [visual-qa](../.agents/skills/visual-qa/SKILL.md): measured screenshot, crop, font and motion differences.
- [accessibility-auditor](../.agents/skills/accessibility-auditor/SKILL.md): keyboard, focus, semantics, scroll and reduced motion.

These are executable-instruction workflows for Codex, not separate running agents or a cloud agent service. Work can be sequential; use delegated work only when separately authorized and supported. Audit roles report findings instead of changing implementation unless fixes are requested. Hand off evidence paths, tested state, prioritized findings, reproduction steps and remaining unknowns.

## Risks and decisions still needed

| Risk / missing information | Consequence | Resolution |
| --- | --- | --- |
| Reference returns HTTP 429 despite working standalone Chromium | Exact appearance, content and behavior cannot be claimed | Stop automated reference requests; obtain normal site access or the manual capture/metadata package |
| Missing photo originals and ordering | Hero/Tour/Lightbox can show the wrong image or insufficient quality | Complete the concrete asset register before photo layout approval |
| Unknown fonts, weights and reuse rights | Different wrapping and uncertain asset use | Verify rendered font files and legitimate reuse source |
| Unknown navigation scope and boundary behavior | Incorrect previous/next or counter | Traverse first/last and group transitions on the actual reference |
| Unknown overlay, sticky and scrolling rules | Incorrect positioning and return context | Capture full entry/scroll/exit and read the scroll container offsets |
| Screenshots alone | Motion, keyboard/focus, computed styles and original media cannot be established | Supply recordings and rendered metadata; retain gaps explicitly |
| Cross-platform font rasterization / DPR | False-positive visual differences | Match capture environment and report residual rendering differences |
| UI not authorized in this phase | Premature implementation would exceed scope | Finish docs/config validation and wait for the next UI instruction |

No additional product decisions are needed from the user yet: the reference determines them. The immediate input needed is access to its rendered states and legitimate assets, not invented replacement content.

## Validation recorded for this documentation phase

On 2026-10-25, `npm.cmd run build` and `npm.cmd run lint` both completed with exit code 0. A Node-based structural check validated the four skill names/frontmatter, all 22 local Markdown links across the nine Markdown files, and the continued presence of the setup status page. Descriptions use double-quoted JSON scalars, which are a valid YAML subset; no general YAML parser was installed for this check.

The skill-creator bundled `quick_validate.py` command was attempted through `py` but could not execute: `No installed Python found!`. The Node check is a structural fallback, not a claim that the bundled validator ran or that skill behavior was independently tested. Live skill discovery in VS Code, browser screenshot comparisons, keyboard/assistive-technology testing, reference measurements, and asset verification remain untested or blocked as stated above. No UI source, npm dependency, global tool configuration, Git remote, or hosted resource was changed in this phase. README, planning documents and repo-local instructions are the authored changes.

## Browser-diagnosis follow-up

The later authorized browser setup adds one development dependency (`playwright`), two npm scripts, `scripts/browser-smoke.mjs`, `scripts/reference-capture.mjs`, project-local ignored browser binaries, and evidence files under root `reference-captures/`. It does not change UI source, production runtime dependencies, global configuration or Git remotes. No bypass of the target's HTTP 429 was attempted. The initial capture runner has been run and failed with the exact error recorded in `capture-report.json`; complete Tour/Lightbox capture remains pending until the actual rendered controls can be inspected.

The original smoke test's h1 assumption was corrected after inspecting the real public page's current content; the corrected test verifies HTTP success, title, visible text and PNG dimensions. The successful smoke PNG is infrastructure evidence only and must never be used as a reference baseline. Current evidence count is one smoke PNG and zero reference PNGs.

Follow-up validation completed: `npm.cmd run build`, `npm.cmd run lint`, and `node --check` for both scripts all exited 0. The PNG signature, dimensions (1440 x 900) and byte size (38,162) were verified from the saved file. JSON reports confirm smoke `passed`, reference HTTP 429, and zero reference media responses. All 29 local documentation links resolved, the application remains the setup status page, browser binaries are Git-ignored, and `git remote -v` remains empty. No live Tour, Lightbox, reference accessibility, animation or photo-order check could run; those remain blocked rather than passed.
