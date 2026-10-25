# PlayPower Airbnb assignment

React + TypeScript + Vite frontend implementation for the PlayPower Labs take-home assignment. Includes Listing Page, Photo Tour and keyboard-accessible Lightbox, built against the three supplied reference screenshots. All 14 existing property photos now have matched public high-resolution media; small screenshot-derived thumbnails and portraits are retained. Automated reference access returned HTTP 429. Exact fonts, the complete 43-photo sequence and some reference behavior remain unverified. No unrelated stock is used.

## Windows prerequisites

- Node.js LTS compatible with Vite: Node 20.19+ or 22.12+. Verified with Node 22.16.0 LTS and npm 10.9.2.
- Git for Windows: verified with 2.47.1.windows.2.
- VS Code with its code CLI: verified with 1.141.1.

Open PowerShell in this project folder. Use npm.cmd if PowerShell blocks npm.ps1; changing the execution policy is unnecessary. After installing or updating tools, close and reopen VS Code and its integrated terminals to refresh PATH.

## Install and run

```powershell
cd "E:\D space\Backend Projects\PlayPower_Submission\playpower-airbnb"
npm.cmd install
npm.cmd run dev
```

Open the local URL printed by Vite (normally http://localhost:5173). Stop the server with Ctrl+C. Vite may select another port if 5173 is busy. For a fixed local port, run:

```powershell
npm.cmd run dev -- --host 127.0.0.1 --port 5173 --strictPort
```

For reproducible dependency installation after a lockfile is available, use npm.cmd ci. All dependencies are project-local; no global npm packages are required.

## Commands

| Command | Purpose |
| --- | --- |
| npm.cmd run dev | Start Vite with hot reload |
| npm.cmd run build | Check TypeScript and build into dist/ |
| npm.cmd run lint | Run ESLint |
| npm.cmd run typecheck | Check TypeScript without bundling |
| npm.cmd run preview | Serve the production build after building |
| npm.cmd run browser:smoke | Verify Chromium startup, public-page rendering and a 1440 x 900 screenshot |
| npm.cmd run capture:reference | Attempt the initial Listing diagnostic capture; stops on an HTTP error |
| npm.cmd run assets:prepare | Reproduce31 lossless image-only crops from the supplied screenshots |
| npm.cmd run verify:frontend | Verify local interactions and save implementation screenshots; requires the dev server |
| npm.cmd run compare:reference | Create four unmasked reference-left/local-right comparisons and verify lossless crops |
| npm.cmd run audit:images | Audit every image's intrinsic/painted dimensions, aspect ratio and scaling at desktop size |
| npm.cmd run verify:lightbox | Test stable controls/canvas for all photos and an isolated portrait fixture |

## Structure

```text
public/             Static assets served without transformation
src/
  assets/reference/ Screenshot-derived photos/portraits and provenance.json
  components/       Listing sections, site chrome, calendars and photo views
  data/             Shared photo sequence, groups and transcribed listing text
  styles/           Plain CSS including responsive and reduced-motion rules
  App.tsx           Three-view state, scroll locking, focus and keyboard lifecycle
  main.tsx          React entry point
```

TypeScript retains the generated Vite configuration. ESLint uses recommended JavaScript, TypeScript, React Hooks, and Vite React Refresh rules. The current create-vite template ships Oxlint; ESLint replaces it to meet the requested tooling. Styling uses plain CSS. React and React DOM are the only runtime dependencies.

## Scope and repository

Image-quality follow-up: large Listing, Tour and Lightbox photos now use14visually matched public 2560px JPEGs, with sources/hashes in `src/assets/reference/public-media.json`. The fixed Lightbox canvas uses contain without distorting photo ratios, preserves control positions and preloads neighbours. Existing screenshot crops remain for small thumbnails/portraits and provenance. See the [complete quality audit](docs/image-quality-audit.md); no substitutes or artificial sharpening were used. The reference's full43-photo sequence is still unverified.

Reference: https://airbnb-clone-umber-two.vercel.app

No application source was copied. Visible text was transcribed and image-only regions were cropped from user-supplied reference screenshots. Local Lightbox navigates14 available property photos instead of inventing the missing29. Original media files, font metadata and reference interaction recordings are still needed for full fidelity. Ancillary search/booking/amenities/review controls are visual presentation outside the three primary-view scope; no real booking or messaging is claimed. The separate production architecture diagram remains a later deliverable.

## Planning and AI roles

- [Reference analysis and exact capture request](docs/reference-analysis.md)
- [Asset inventory and verification workflow](docs/asset-inventory.md)
- [Implementation architecture and milestones](docs/implementation-plan.md)
- [Repository instructions and role invocation](AGENTS.md)
- [Visual comparison and remaining mismatches](docs/visual-qa.md)
- [Keyboard and accessibility verification](docs/accessibility-audit.md)

Open this project folder as the Codex working repository. Roles are discoverable under `.agents/skills/`: `$frontend-implementer`, `$reference-auditor`, `$visual-qa`, and `$accessibility-auditor`. They are instruction workflows, not already running agents. See AGENTS.md for responsibilities and scope.

## Standalone browser tooling

Playwright is a development dependency. Matching Chromium binaries are installed locally in the ignored `.playwright-browsers/` folder. To install them on a new checkout:

```powershell
$env:PLAYWRIGHT_BROWSERS_PATH = Join-Path (Get-Location) '.playwright-browsers'
npx.cmd playwright install chromium
npm.cmd run browser:smoke
```

Supplied originals stay in [reference-captures](reference-captures/); local screenshots, comparisons and reports are in [implementation-captures](implementation-captures/). With the local dev server running, use `npm.cmd run verify:frontend`, then `npm.cmd run compare:reference`. sharp is a development-only dependency for repeatable crops/lossless compression and comparison; no PowerShell execution-policy change is necessary. The older capture script covers initial Listing diagnostics and must not be treated as a complete reference capture runner. No target-access bypass was attempted.

Keep work local until publication is explicitly requested. The local Git repository has no remote. The private flag in package.json also prevents accidental npm publication; it is not a hosting privacy setting.

node_modules/, dist/, local environment files, and logs are ignored. Never commit credentials. Empty directories contain .gitkeep files so Git can track them.
