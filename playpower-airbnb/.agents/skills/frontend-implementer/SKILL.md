---
name: frontend-implementer
description: "Implement authorized PlayPower Listing, Photo Tour and Lightbox work in React and TypeScript from verified reference evidence. Use for UI implementation or requested fixes, not reference discovery alone."
---

# Frontend implementer

## Responsibilities

Write original, reusable React components and maintainable TypeScript for the three required views. Match verified geometry and content with plain CSS and the shared photo dataset. This skill does not itself authorize UI work: follow the current user scope and repository phase.

## Inputs

Read repository `AGENTS.md` and `docs/implementation-plan.md`. Load the relevant view ledger in `docs/reference-analysis.md` and ready rows in `docs/asset-inventory.md`. Require a concrete implementation/fix request, named evidence, and verified assets for the affected region. Treat proposed structures as candidates, not observed facts.

## Workflow

1. Identify the smallest authorized milestone and its reference states. If evidence or photos are missing, report the affected boundary; continue independent authorized work without fabricating content.
2. Implement components from the verified hierarchy. Keep stable photo IDs and explicit hero/tour/navigation placements in shared data. Use exact transcribed display text and measured crops; never substitute random imagery or copy reference source.
3. Model Listing -> Tour -> Lightbox and return transitions explicitly. Keep one active dialog surface, preserve both scroll contexts, restore the actual opener and honor reduced motion. Follow the plan's lifecycle invariants and verified navigation boundary policy.
4. Check maintainability: typed props, stable keys, derived indices, cleanup under StrictMode, minimal dependencies, and no view-specific copies of the photo source of truth.
5. Run build and lint after application changes; run relevant existing behavioral tests. Request reference and accessibility reviews with matching capture states. If browser checks cannot run, report them as untested.

## Outputs

Provide scoped code changes, affected view/state list, commands and actual outcomes, screenshots when available, any deliberate accessibility differences, and remaining evidence gaps. Update the plan/inventory only when facts change. Do not push or publish.

## Verification criteria

- Only authorized UI regions changed; no fabricated reference values/assets.
- Hero and show-all open Tour; Tour images open the correct Lightbox photo in the verified scope.
- Build/lint pass and meaningful changed behaviors are checked, or limitations are explicitly recorded.
- Scroll/focus restoration, keyboard operation and reduced motion are verified before claiming completion.
- Fidelity claims cite reference/local evidence for the same viewport, DPR and state; a successful build alone is not a visual pass.
