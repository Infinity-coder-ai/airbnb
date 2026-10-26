import fs from 'node:fs/promises';
const root = 'docs/reference-audit';
const reference = JSON.parse(await fs.readFile(`${root}/reference-access.json`, 'utf8'));
const local = JSON.parse(await fs.readFile(`${root}/local-interactions.json`, 'utf8'));
const gallery = JSON.parse(await fs.readFile(`${root}/gallery-controls.json`, 'utf8'));
const records = [...local.records, ...gallery.records];
const escape = value => String(value ?? '').replaceAll('|', '\\|').replaceAll('\n', ' ').replace(/\s+/g, ' ').trim();
const summary = entry => {
  if (!entry.after) return entry.result;
  const changes = [];
  if (entry.before.url !== entry.after.url) changes.push(`URL ${entry.before.url} → ${entry.after.url}`);
  if (entry.before.scrollY !== entry.after.scrollY) changes.push(`scrollY ${entry.before.scrollY} → ${entry.after.scrollY}`);
  for (const key of ['dialogs', 'fields', 'pressed', 'hearts']) if (JSON.stringify(entry.before[key]) !== JSON.stringify(entry.after[key])) changes.push(`${key}: ${JSON.stringify(entry.before[key])} → ${JSON.stringify(entry.after[key])}`);
  if (entry.before.text !== entry.after.text) {
    const beforeLines = entry.before.text.split('\n');
    const afterLines = entry.after.text.split('\n');
    const added = afterLines.filter(line => !beforeLines.includes(line));
    const removed = beforeLines.filter(line => !afterLines.includes(line));
    changes.push(`text removed ${JSON.stringify(removed.slice(0, 10))}; added ${JSON.stringify(added.slice(0, 10))}; full before/after in JSON`);
  }
  return changes.join('; ') || entry.result;
};
const counts = records.reduce((result, row) => ({ ...result, [row.status]: (result[row.status] || 0) + 1 }), {});
const rows = records.map(entry => `| ${escape(entry.id)} | ${escape(entry.name)} | ${escape(entry.section)} | ${escape(entry.action)} | BLOCKED | ${entry.status} | ${escape(summary(entry))} | ${entry.screenshot ? `[capture](${entry.screenshot})` : '[before/after JSON](local-interactions.json)'} |`);
await fs.writeFile(`${root}/interaction-matrix.md`, `# Reference and clone interaction audit

Audit date: 26 October 2026, Asia/Calcutta. Browser ${local.browser}; 1440 × 900 CSS px, DPR 1. Reference attempt was headed; clone audit was headless with reduced motion.

## Access and counting

Reference: **BLOCKED**, HTTP ${reference.httpStatus}, title **${reference.title}**. Rendered message: “We're verifying your browser”. See [response report](reference-access.json) and [checkpoint screenshot](screenshots/reference-access-blocked.png). An initial sandbox attempt returned net::ERR_NETWORK_ACCESS_DENIED; the single approved normal-network attempt reached the site and returned 429. No retries, proxy, user-agent modification or checkpoint bypass followed. No reference source was read.

**Reference interactive-element total: unknown. Reference interactions successfully tested: 0. All ${records.length} comparison cases below remain blocked on the reference side.** The supplied screenshots establish appearance, not click outcomes. No feature is labelled CONFIRMED WORKING or CONFIRMED NO ACTION for the original.

Clone semantic controls discovered across the three views: **${gallery.totalSemanticControlInstancesAcrossViews}** (${Object.entries(gallery.inventories).map(([view, list]) => `${view}: ${list.length}`).join('; ')}), counting individual calendar days and repeated controls in different views. See [control inventory](gallery-controls.json). Clone actions executed: **${records.length}**, including non-semantic visual click targets and repeat/boundary/persistence cases. Local outcome counts: ${Object.entries(counts).map(([status, count]) => `${status}: ${count}`).join('; ')}. These are action outcomes, not a count of distinct original features.

CONFIRMED WORKING in the local column means an observable state/navigation/scroll change occurred; it does **not** mean the result is correct or reference-equivalent. CONFIRMED NO ACTION means no measured outcome after the click during the observation window, excluding focus-only changes. It does not prove an absent event handler. Full before/after text, URL, scroll, form values, dialogs, pressed state, heart colors and focus are retained in [local-interactions.json](local-interactions.json). Initial defects remain reproducible in [baseline](local-interactions-before.json).

## Interaction cases

| Case | Element | Location | Action | Original status | Clone outcome | Exact observed clone result | Evidence |
| --- | --- | --- | --- | --- | --- | --- | --- |
${rows.join('\n')}

## Additional requested coverage and limits

- Actual reference hero entry, every Tour photo/category, all 43-photo ordering, first/last boundary policy, keyboard, focus, hover timing, disabled dates, price calculation, booking popovers, Save persistence, secondary dialogs, host/policy/map/footer destinations: **BLOCKED**.
- Local footer navigation: no footer-link controls exist in the current rendered page; the supplied full-page screenshot ends with nearby stays. Original footer-link existence remains NOT TESTED.
- Local map search/zoom and nearby arrows are drawn spans; the click cases above test their rendered targets. They are not semantic keyboard controls. No live map service is claimed.
- Local guest selection uses a native select with 1–3 guests; no separate plus/minus controls exist to test. Original popup structure and limits remain blocked; “3 guests maximum” is visible screenshot evidence.
- Gallery keyboard, focus trapping/restoration, scroll restoration, reduced motion, hover, disabled boundary behavior, image aspect ratios and all 14-image decoding have separate regression evidence in [frontend results](../../implementation-captures/verification.json) and [Lightbox quality results](../../implementation-captures/quality/lightbox-quality.json). Those are local checks only.
- The user explicitly reported: sleeping photos open Tour, Reserve scrolls to choose dates, date/guest selection works, Save turns red. These are **user-reported reference behaviors**, not direct automated confirmations. Only this bounded evidence supports the corresponding repairs.

Runtime/HTTP errors observed by this local audit: ${JSON.stringify([...local.errors, ...gallery.errors])}.
`);
console.log(`Wrote interaction matrix: ${records.length} local action cases; ${gallery.totalSemanticControlInstancesAcrossViews} local controls; reference blocked.`);
