# Accessibility and interaction verification

## Amenities dialog and expandable content

The amenities surface uses a native modal dialog named “What this place offers”. Opening focuses the labelled close button, makes the background noninteractive, locks body scroll and keeps its own content scrollable. Escape and the close button both restore the exact Show all50amenities opener and original Listing scroll. The description toggle exposes `aria-expanded`/`aria-controls`. Review highlights are a named, focusable horizontal region so keyboard users can reach and horizontally scroll the strip. Automated coverage is in [amenities report](../implementation-captures/amenities/report.json). No screen-reader announcement or cross-browser native-dialog audit has been performed.

## 26 October dates and controls

The shared date-range repair adds semantic labelled check-in/checkout buttons and a named calendar section. Reserve and date-field activation scroll to and focus the calendar heading without adding a URL hash. Reduced-motion and normal smooth-scrolling paths are tested. Selected endpoints use aria-pressed; the formatted date summary is a polite atomic live region. Native guest selection remains1–3. Both sleeping photo openers restore exact focus and scroll after Tour closes; Listing Save exposes its pressed state and red heart.

All11 [booking regression checks](reference-audit/booking-regression.json), the17frontend checks and5Lightbox quality groups pass. Additional direct close/grid Lightbox clicks and the130-control inventory are in [gallery-controls.json](reference-audit/gallery-controls.json). This is local keyboard/semantics verification, not a screen-reader audit or proof of original behavior. Calendar day controls are ordinary Tab/Enter/Space buttons; a full ARIA-grid arrow-key datepicker was not invented. Availability/disabled dates and reference field popup structure remain unverified; see [gaps](reference-audit/gap-analysis.md).

## Sizing follow-up

Existing keyboard/focus/scroll checks continue to pass after the quality update. All 14 photos were tested using next/previous buttons and arrow keys; fixed media/control bounds prevent focus targets from moving. Title and counter fields have stable geometry, and tabular counter numerals avoid digit-width shifts. Focus restoration and disabled-boundary handling remain unchanged.

The new test-only portrait case uses a600x1200 solid rectangle fulfilled only inside Playwright. Rasterized output is363x726, preserving1:2ratio with letterboxing and the same controls. It is not a property photo, not included in application data and not evidence of reference portrait behavior. See the [Lightbox quality report](../implementation-captures/quality/lightbox-quality.json). The report separates input-driven text changes from unexpected CLS; it does not hide observer entries to claim an absolute zero-shift score.

2026-10-25. Tested locally with Playwright 1.64.1, Chromium 156.0.8078.4 on Windows,1440x900 CSS px,DPR 1. This is local behavior verification, not a claim about the reference's behavior or general WCAG conformance.

## Evidence and passing coverage

`npm.cmd run verify:frontend` records exact checks/results in [verification.json](../implementation-captures/verification.json). The suite covers:

- Show all photos and all five hero entry points open Tour and restore their individual opener focus on close.
- Space/Enter activate photo controls; a gallery image opens its corresponding Lightbox photo.
- Previous/next pointer buttons and ArrowLeft/ArrowRight agree; first/last boundaries clamp and disable. Focus stays usable when the clicked control becomes disabled.
- Tab/Shift+Tab remain in Lightbox; both directions wrap correctly in Tour. Decorative header controls are disabled, removed from tab order and hidden from accessibility semantics; inactive page/layer is inert.
- Escape closes only the top layer. Grid/return and visible close controls return one level. Correct tile focus and Tour scroll survive Lightbox; Listing scroll and original opener focus survive closing Tour.
- Body remains locked across Tour/Lightbox and unlocks after the final close. StrictMode is enabled during these checks.
- Reduced motion removes overlay/image transitions; normal preference permits hover dimming/transitions.
- All Listing images decode, desktop has no horizontal overflow, and no runtime/asset HTTP errors were observed.

Source review also confirms named dialog surfaces, semantic native buttons, labelled icon controls, visible focus outlines, descriptive verified-photo alt text, decorative portraits/icons excluded where appropriate, and an atomic polite photo counter announcement.

## Corrections made during verification

The initial decorative inert header did not paint in the headless capture. It was replaced with an aria-hidden, noninteractive decorative header with disabled controls. The focus-target filter now explicitly excludes negative tabindex and aria-hidden/inert ancestors. A rerun confirmed correct focus wrapping and visible header rendering.

When a navigation button becomes disabled at a boundary, Lightbox restores focus to its close control if focus would otherwise be left outside the active layer or on a disabled button. Pointer-to-keyboard regression checks pass for this case.

## Untested or limited

- No screen reader was available/tested. Actual announcement wording and assistive-technology navigation remain unverified.
- No axe scan, formal contrast audit, browser zoom/reflow audit or multi-browser accessibility certification was run.
- Reference keyboard, scrolling, focus and motion recordings are missing; accessible local behavior is an explicit design choice.
- Ancillary visual-only controls are not claimed as fully implemented product flows. The three required photo views are the tested interaction scope.
- Responsive CSS is included, but screenshot fidelity and this interaction report prioritize1440x900 desktop.

Future review should test Windows screen readers and actual font/asset updates, then retest focus, image alternatives, contrast and zoom. Do not infer a screen-reader or conformance pass from the automated keyboard tests.
