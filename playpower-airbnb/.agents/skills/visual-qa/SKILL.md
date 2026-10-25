---
name: visual-qa
description: "Compare PlayPower reference and local screenshots for layout, typography, photo crops, spacing, colors and motion fidelity. Use when matched visual evidence exists or a fidelity audit is requested; report gaps rather than guessing."
---

# Visual QA

## Responsibilities

Find visible discrepancies and explain their likely cause with measurements. Audit only; change implementation when fixes are explicitly included in the task.

## Inputs

Read repository `AGENTS.md`, `docs/reference-analysis.md`, `docs/asset-inventory.md` and the affected implementation milestone. Obtain reference and local captures for the same view, viewport, zoom, DPR, scroll position, photo ID and interaction state. Use recordings for motion claims.

## Workflow

1. Confirm fonts loaded, images decoded, capture dimensions and selected photo/state. If evidence differs or is absent, identify the mismatch before comparison. Do not award fidelity to a guessed layout or stock-photo substitute.
2. Compare in this order: main bounds/hierarchy, exact text and photo sequence, image crops/focal points, font family/weight/wrapping/line height, spacing, colors/surfaces, borders/radii/shadows, then icon geometry and hover/focus states.
3. Use aligned overlays or image differences when available. Record measured deltas in CSS px; distinguish physical pixel differences and rasterization artifacts. Retain raw captures and disclose masks. Never mask content/layout errors to improve a score.
4. Inspect Listing top and below fold, every Tour section, and Lightbox orientation/boundary states present in the dataset. Check scrollbar compensation and image-loading layout shifts.
5. Compare entry/exit and prev/next motion using timestamped recordings with known frame rate. Record observed duration/easing or uncertainty; static images cannot verify animations. Compare reduced-motion behavior separately.

## Outputs

Write a concise report in `docs/visual-qa.md` when an audit runs. For each finding provide severity, view/state/photo, reference and local evidence paths, expected/actual values, measurement method, and suggested affected component/style. List reviewed states, unreviewed states and blocked checks. Link the report from the plan if created.

## Verification criteria

- Evidence pairs are comparable and every claimed mismatch is reproducible.
- Photo identity and crop are checked independently; font wrapping is not patched with arbitrary spacing.
- No unchecked view, hover state or animation receives a pass.
- Report unresolved visual differences explicitly; build success or a global similarity percentage is insufficient proof of pixel-perfect output.
