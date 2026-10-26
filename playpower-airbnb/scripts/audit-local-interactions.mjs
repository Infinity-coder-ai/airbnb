import fs from 'node:fs/promises';
import path from 'node:path';

process.env.PLAYWRIGHT_BROWSERS_PATH ??= path.resolve('.playwright-browsers');
const { chromium } = await import('playwright');
const output = path.resolve('docs/reference-audit');
await fs.mkdir(path.join(output, 'screenshots'), { recursive: true });
const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1, reducedMotion: 'reduce' });
const errors = [], records = [];
page.on('pageerror', e => errors.push(e.message));
page.on('console', message => { if (message.type() === 'error') errors.push(message.text()); });
page.on('response', r => { if (r.status() >= 400) errors.push(`${r.status()} ${r.url()}`); });
const load = async () => {
  const response = await page.goto('http://127.0.0.1:5173/', { waitUntil: 'networkidle' });
  if (!response.ok()) throw new Error(`Local HTTP ${response.status()}`);
};
const state = () => page.evaluate(() => ({
  url: location.href, scrollY, text: document.body.innerText,
  dialogs: [...document.querySelectorAll('[role="dialog"]')].filter(e => !e.inert).map(e => e.getAttribute('aria-label') || e.getAttribute('aria-labelledby')),
  fields: [...document.querySelectorAll('select,input')].map(e => ({ label: e.getAttribute('aria-label'), value: e.value })),
  pressed: [...document.querySelectorAll('[aria-pressed="true"]')].map(e => e.getAttribute('aria-label') || e.textContent.trim()),
  focus: document.activeElement?.getAttribute('aria-label') || document.activeElement?.textContent?.trim().slice(0, 100),
  hearts: [...document.querySelectorAll('.title-actions button svg,.tour-toolbar button[aria-label="Save photos"] svg')].map(e => ({ fill: getComputedStyle(e).fill, color: getComputedStyle(e).color })),
}));
const changed = (before, after) => ['url','scrollY','text','dialogs','fields','pressed','hearts'].filter(k => JSON.stringify(before[k]) !== JSON.stringify(after[k]));
async function record(id, name, section, action, fn, screenshot = false) {
  const before = await state();
  const entry = { id, name, section, action, before };
  try {
    await fn();
    await page.waitForTimeout(100);
    entry.after = await state();
    entry.changed = changed(before, entry.after);
    entry.status = entry.changed.length ? 'CONFIRMED WORKING' : 'CONFIRMED NO ACTION';
    entry.result = entry.changed.length ? `Observed changes: ${entry.changed.join(', ')}` : 'No URL, text, dialog, field, pressed-state, heart-color or scroll change after action; focus-only changes excluded.';
  } catch (error) {
    entry.status = 'BLOCKED';
    entry.result = error.message;
  }
  if (screenshot) {
    entry.screenshot = `screenshots/local-${id}.png`;
    await page.screenshot({ path: path.join(output, entry.screenshot) });
  }
  records.push(entry);
  return entry;
}
let inventory = [], typography;
try {
  await load();
  typography = await page.locator('h1,.intro h2,.search-home').evaluateAll(elements => elements.map(e => {
    const s = getComputedStyle(e);
    const range = document.createRange();
    range.selectNodeContents(e);
    return { selector: e.tagName === 'H1' ? 'h1' : e.tagName === 'H2' ? '.intro h2' : '.search-home', text: e.textContent.trim(), fontFamily: s.fontFamily, fontSize: s.fontSize, fontWeight: s.fontWeight, lineHeight: s.lineHeight, letterSpacing: s.letterSpacing, color: s.color, box: e.getBoundingClientRect().toJSON(), textBox: range.getBoundingClientRect().toJSON() };
  }));
  inventory = await page.locator('button,a[href],select,input').evaluateAll(elements => elements.filter(e => e.getClientRects().length && !e.closest('[inert],[aria-hidden="true"]')).map((e, index) => ({ index, tag: e.tagName, name: e.getAttribute('aria-label') || e.textContent.trim(), section: e.closest('section')?.className || e.closest('aside,header')?.className || 'Listing header/gallery', disabled: e.disabled || false })));
  // Each Listing control starts from a clean page so outcomes do not leak between cases.
  for (const item of inventory) {
    await load();
    const target = page.locator('button,a[href],select,input').nth(item.index);
    await target.scrollIntoViewIfNeeded();
    if (item.disabled) {
      records.push({ id: `listing-${item.index}`, ...item, status: 'NOT TESTED', result: 'Disabled control in initial state.' });
      continue;
    }
    await record(`listing-${item.index}`, item.name, item.section, item.tag === 'SELECT' ? 'Choose 3 guests' : 'Click', async () => {
      if (item.tag === 'SELECT') await target.selectOption('3');
      else await target.click();
    }, /Save|Reserve|Clear dates|Previous month|Next month/.test(item.name));
  }
  await load();
  await record('home-icon', 'Home emoji', 'Header', 'Click rendered house emoji', () => page.locator('.search-home').click());
  await record('guest-badge', 'Guest favourite', 'Property details', 'Click badge', () => page.locator('.guest-label').click());
  await record('review-count', '19 Reviews', 'Property details', 'Click review count', () => page.locator('.review-count').click());
  for (const selector of ['.map-search', '.map-zoom span:first-child', '.map-zoom span:last-child', '.nearby-arrows:first-child', '.nearby-arrows:last-child']) {
    await page.locator(selector).first().scrollIntoViewIfNeeded();
    await record(`decorative-${records.length}`, selector, 'Other sections', 'Click rendered non-button control', () => page.locator(selector).first().click());
  }
  await load();
  await page.getByRole('button', { name: 'Save', exact: true }).click();
  await record('save-refresh', 'Save persistence', 'Listing header', 'Refresh after Save', () => page.reload({ waitUntil: 'networkidle' }), true);
  for (const selector of ['.booking-fields > :first-child', '.booking-fields > :nth-child(2)']) {
    await load();
    await page.locator(selector).scrollIntoViewIfNeeded();
    await record(`booking-field-${records.length}`, selector.includes('first') ? 'Check-in' : 'Checkout', 'Booking', 'Click field', () => page.locator(selector).click(), true);
  }
  await load();
  await page.getByRole('button', { name: 'Show all photos', exact: true }).click();
  const categories = await page.locator('.category-nav button').allTextContents();
  for (let index = 0; index < categories.length; index++) {
    await record(`category-${index}`, categories[index], 'Photo Tour', 'Click category', () => page.locator('.category-nav button').nth(index).click());
  }
  for (const name of ['Share photos', 'Save photos']) {
    await record(name.replaceAll(' ', '-').toLowerCase(), name, 'Photo Tour', 'Click toolbar control', () => page.getByRole('button', { name, exact: true }).click(), true);
  }
  const photoIds = await page.locator('.group-photos button').evaluateAll(elements => elements.map(e => e.id));
  for (let index = 0; index < photoIds.length; index++) {
    await record(`photo-${index}`, photoIds[index], 'Photo Tour', 'Click gallery photo, then close Lightbox with Escape', async () => {
      await page.locator(`#${photoIds[index]}`).click();
      const current = await state();
      if (!current.dialogs.includes('lightbox-title')) throw new Error('Lightbox did not open');
    });
    await page.keyboard.press('Escape');
  }
  await page.locator('#photo-living-01').click();
  for (const [name, action] of [
    ['first-boundary', () => page.keyboard.press('ArrowLeft')],
    ['keyboard-next', () => page.keyboard.press('ArrowRight')],
    ['pointer-next', () => page.getByRole('button', { name: 'Next photo', exact: true }).click()],
    ['pointer-previous', () => page.getByRole('button', { name: 'Previous photo', exact: true }).click()],
    ['keyboard-previous', () => page.keyboard.press('ArrowLeft')],
    ['last-boundary', async () => { for (let i = 0; i < 14; i++) await page.keyboard.press('ArrowRight'); }],
    ['escape-lightbox', () => page.keyboard.press('Escape')],
    ['close-tour', () => page.getByRole('button', { name: 'Close photo tour', exact: true }).click()],
  ]) await record(name, name, 'Gallery navigation', name, action, true);
} catch (error) {
  errors.push(error.stack);
  process.exitCode = 1;
} finally {
  const report = { at: new Date().toISOString(), browser: browser.version(), viewport: { width: 1440, height: 900, dpr: 1 }, inventory, typography, records, errors, note: 'Status describes only locally observed changes, not reference equivalence or correctness. No-action excludes focus-only effects and does not prove absent event handlers.' };
  await fs.writeFile(path.join(output, 'local-interactions.json'), JSON.stringify(report, null, 2));
  console.log(JSON.stringify({ controls: inventory.length, actions: records.length, counts: records.reduce((counts, e) => ({ ...counts, [e.status]: (counts[e.status] || 0) + 1 }), {}), typography, errors }, null, 2));
  await browser.close();
}
