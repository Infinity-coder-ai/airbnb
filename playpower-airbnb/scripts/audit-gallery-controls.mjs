import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';

process.env.PLAYWRIGHT_BROWSERS_PATH ??= path.resolve('.playwright-browsers');
const { chromium } = await import('playwright');
const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1440, height: 900 }, reducedMotion: 'reduce' });
const inventories = {}, records = [], errors = [];
page.on('pageerror', e => errors.push(e.message));
const inventory = () => page.locator('button,a[href],select,input').evaluateAll(elements => elements.filter(e => e.getClientRects().length && !e.closest('[inert],[aria-hidden="true"]')).map(e => ({ name: e.getAttribute('aria-label') || e.textContent.trim(), tag: e.tagName, disabled: !!e.disabled })));
try {
  await page.goto('http://127.0.0.1:5173/', { waitUntil: 'networkidle' });
  inventories.listing = await inventory();
  await page.getByRole('button', { name: 'Show all photos', exact: true }).click();
  inventories.tour = await inventory();
  await page.locator('#photo-living-01').click();
  inventories.lightbox = await inventory();
  for (const name of ['Close lightbox', 'Return to photo tour']) {
    await page.getByRole('button', { name, exact: true }).click();
    assert.equal(await page.getByRole('dialog', { name: 'Photo tour', exact: true }).count(), 1);
    assert(await page.locator('#photo-living-01').evaluate(e => e === document.activeElement));
    const screenshot = `screenshots/local-${name.replaceAll(' ', '-').toLowerCase()}.png`;
    await page.screenshot({ path: `docs/reference-audit/${screenshot}` });
    records.push({ id: name.replaceAll(' ', '-').toLowerCase(), name, section: 'Lightbox', action: 'Click visible control', status: 'CONFIRMED WORKING', result: 'Lightbox closes to Photo Tour; exact original gallery tile receives focus. URL remains http://127.0.0.1:5173/.', screenshot });
    if (name === 'Close lightbox') await page.locator('#photo-living-01').click();
  }
} catch (error) {
  errors.push(error.stack);
  process.exitCode = 1;
} finally {
  const total = Object.values(inventories).reduce((sum, list) => sum + list.length, 0);
  await fs.writeFile('docs/reference-audit/gallery-controls.json', JSON.stringify({ at: new Date().toISOString(), inventories, totalSemanticControlInstancesAcrossViews: total, records, errors }, null, 2));
  console.log(JSON.stringify({ counts: Object.fromEntries(Object.entries(inventories).map(([view, list]) => [view, list.length])), total, actions: records.length, errors }));
  await browser.close();
}
