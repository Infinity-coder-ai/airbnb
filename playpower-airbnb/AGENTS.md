# PlayPower repository instructions

This repository is a React + TypeScript + Vite desktop reference-clone assignment. Work from the repository root (`playpower-airbnb`) so these instructions and `.agents/skills/` are discoverable. If Codex is opened in the parent workspace, open this folder or explicitly load this file and the selected skill.

## Scope and evidence

- Current phase is frontend implementation, explicitly authorized by the user. All three supplied screenshots have been inspected. Continue original React/TypeScript work against those screenshots and document missing assets/behavior assumptions.
- The sole visual reference is https://airbnb-clone-umber-two.vercel.app. Exactly three primary views: Listing Page, Photo Tour, Lightbox. Hero images and Show all photos open Tour; a Tour photo opens Lightbox.
- Read [reference analysis](docs/reference-analysis.md), [asset inventory](docs/asset-inventory.md), and [implementation plan](docs/implementation-plan.md) for the selected task. Keep Requirement, Verified, Proposed and Unknown distinct.
- Automated reference access returned HTTP 429; supplied screenshots are the current visual evidence. Their complete Tour and all 43 photo originals are missing. Never invent missing photos or claim unobserved behavior as verified. Local14-image order beyond the first group and behavior assumptions are documented.
- Inspect rendered output and legitimate public media only. Do not copy source HTML, JS, CSS, SVG path data, source maps or private resources. Draw original measured simple icons or use legitimate supplied assets; never invent missing property photos.
- Keep changes local. Do not push, publish, configure a remote, deploy, install system software or add backend infrastructure without the user's authorization. Preserve unrelated files.

## Roles and invocation

These roles are implemented as repo-local Codex skills, not decorative role documents. In Codex use `/skills` or invoke a role in a prompt, for example `$reference-auditor inspect the three reference views at 1440x900`. If a new skill is not visible, restart Codex with this repository open; instructions can also be loaded by their explicit paths.

| Skill | Input | Output |
| --- | --- | --- |
| [frontend-implementer](.agents/skills/frontend-implementer/SKILL.md) | Authorized UI scope, measured reference, ready assets | Reusable original React/TS changes and validation report |
| [reference-auditor](.agents/skills/reference-auditor/SKILL.md) | Browser access or supplied screenshots/recordings/metadata | Verified reference ledger, exact missing-evidence list |
| [visual-qa](.agents/skills/visual-qa/SKILL.md) | Matching reference/local captures and asset register | Prioritized visual findings with locations and measured deltas |
| [accessibility-auditor](.agents/skills/accessibility-auditor/SKILL.md) | Running local UI, required transition model, available browser/AT | Reproducible keyboard/focus/semantics findings and test limits |

The role selected for a task owns its output. Auditors do not silently implement fixes. Pass evidence paths, viewport/DPR, state/scroll offsets, reproduction steps and unknowns between roles. Do not create parallel edits merely because four roles exist.

## Implementation and verification

- Prefer existing React/TypeScript/Vite tooling and plain CSS; justify any added package. Keep photos in one typed dataset with explicit per-view placements and stable IDs.
- Use semantic controls, meaningful image alternatives, visible focus, one active modal layer, background scroll lock, correct focus return and reduced-motion support. Record any intentional accessibility improvement over the reference.
- For application changes run `npm.cmd run build` and `npm.cmd run lint`; use meaningful interaction tests once those behaviors exist. Documentation-only changes need link/configuration validation, not newly invented UI tests.
- Report passed, failed, blocked and untested checks separately. Do not claim visual, keyboard, screen-reader or reduced-motion verification from static screenshots alone.

## Configuration format sources

Repo-local skills use a directory containing `SKILL.md` with YAML `name` and `description`, following [official Codex skill documentation](https://learn.chatgpt.com/docs/build-skills). `AGENTS.md` supplies persistent repository guidance as described in [official agent configuration documentation](https://learn.chatgpt.com/docs/agent-configuration/agents-md). No global Codex configuration or external service is required.
