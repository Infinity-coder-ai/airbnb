import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';

process.env.PLAYWRIGHT_BROWSERS_PATH ??= path.resolve('.playwright-browsers');
const { chromium } = await import('playwright');
const output = 'docs/reference-audit';
await fs.mkdir(`${output}/screenshots`, { recursive: true });
const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1440, height: 900 }, reducedMotion: 'reduce' });
const checks = [], errors = [];
page.on('pageerror', error => errors.push(error.message));
page.on('console', message => { if (message.type() === 'error') errors.push(message.text()); });
page.on('response', response => { if (response.status() >= 400) errors.push(`${response.status()} ${response.url()}`); });
const date = name => page.getByRole('button', { name, exact: true });
const check = async (name, run) => { await run(); checks.push(name); console.log(`PASS ${name}`); };
const reload = () => page.goto('http://127.0.0.1:5173/', { waitUntil: 'networkidle' });
const capture = name => page.screenshot({ path: `${output}/screenshots/${name}.png` });
try {
  await reload();
  await check('initial dates and supplied font/icon values are retained', async () => {
    assert.match(await page.locator('.booking-fields').innerText(), /10\/18\/2026/);
    assert.match(await page.locator('.booking-fields').innerText(), /10\/23\/2026/);
    assert.equal(await page.locator('.search-home img').getAttribute('alt'), '');
    assert.equal(await page.locator('.search-home img').evaluate(image => image.naturalWidth), 240);
    assert.equal(await page.locator('h1').evaluate(e => getComputedStyle(e).fontSize), '26px');
    assert.equal(await page.locator('.intro h2').evaluate(e => getComputedStyle(e).fontSize), '22px');
  });
  await check('Reserve scrolls to dates and focuses calendar without changing URL', async () => {
    const url = page.url();
    await date('Reserve').click();
    assert.equal(page.url(), url);
    assert.equal(await page.locator('#dates').evaluate(e => Math.round(e.getBoundingClientRect().top)), 67);
    assert.equal(await page.evaluate(() => document.activeElement.id), 'dates-heading');
    await capture('local-reserve-calendar');
  });
  await check('clear dates resets both booking fields and accessible date summary', async () => {
    await date('Clear dates').click();
    assert.equal(await page.locator('.booking-date span').allTextContents().then(values => values.join(',')), 'Add date,Add date');
    assert.equal(await page.locator('#dates-heading').innerText(), 'Select check-in date');
  });
  await check('cross-month range updates endpoints, intervening highlights and booking fields', async () => {
    await date('October 30, 2026').click();
    assert.equal(await page.locator('#dates-heading').innerText(), 'Select checkout date');
    await date('November 4, 2026').click();
    assert.equal(await page.locator('#dates-heading').innerText(), '5 nights in Candolim');
    assert.match(await page.locator('.booking-fields').innerText(), /10\/30\/2026/);
    assert.match(await page.locator('.booking-fields').innerText(), /11\/04\/2026/);
    assert.equal(await page.locator('.day.selected').count(), 2);
    assert.equal(await page.locator('.day.between').count(), 4);
    await capture('local-selected-range');
  });
  await check('check-in and checkout fields choose the intended endpoint with keyboard activation', async () => {
    await date('Choose checkout date').click();
    assert.equal(await page.evaluate(() => document.activeElement.id), 'dates-heading');
    await date('November 6, 2026').focus();
    await page.keyboard.press('Enter');
    assert.match(await page.locator('.booking-fields').innerText(), /11\/06\/2026/);
    assert.equal(await page.locator('#dates-heading').innerText(), '7 nights in Candolim');
    await date('Choose check-in date').click();
    await date('October 31, 2026').focus();
    await page.keyboard.press('Space');
    await date('November 2, 2026').click();
    assert.equal(await page.locator('#dates-heading').innerText(), '2 nights in Candolim');
  });
  await check('months and date arithmetic cross a year; earlier end restarts selection', async () => {
    await date('Clear dates').click();
    await date('Next month').click();
    await date('Next month').click();
    await date('December 30, 2026').click();
    await date('January 4, 2027').click();
    assert.equal(await page.locator('#dates-heading').innerText(), '5 nights in Candolim');
    assert.match(await page.locator('.booking-fields').innerText(), /01\/04\/2027/);
    await date('December 29, 2026').click();
    await date('December 28, 2026').click();
    assert.equal(await page.locator('#dates-heading').innerText(), 'Select checkout date');
    assert.match(await page.locator('.booking-fields').innerText(), /12\/28\/2026/);
    await date('December 29, 2026').click();
    assert.equal(await page.locator('#dates-heading').innerText(), '1 night in Candolim');
    await capture('local-year-boundary-range');
    await date('Previous month').click();
    assert.match(await page.locator('.month-heading').first().innerText(), /November 2026/);
  });
  await check('native guest selector supports all three allowed values and survives gallery round-trip', async () => {
    const guests = page.getByRole('combobox', { name: 'Number of guests' });
    assert.deepEqual(await guests.locator('option').evaluateAll(options => options.map(e => e.value)), ['1', '2', '3']);
    for (const value of ['1', '2', '3']) {
      await guests.selectOption(value);
      assert.equal(await guests.inputValue(), value);
    }
    await date('Show all photos').click();
    await page.keyboard.press('Escape');
    assert.equal(await guests.inputValue(), '3');
  });
  await check('both sleeping cards open Tour and restore scroll and exact focus', async () => {
    for (let index = 0; index < 2; index++) {
      const card = page.locator('.sleep-image').nth(index);
      await card.scrollIntoViewIfNeeded();
      const scroll = await page.evaluate(() => scrollY);
      await card.click();
      assert.equal(await page.getByRole('dialog', { name: 'Photo tour' }).count(), 1);
      await page.keyboard.press('Escape');
      assert.equal(await page.evaluate(() => scrollY), scroll);
      assert(await card.evaluate(e => e === document.activeElement));
    }
  });
  await check('Save toggles a red heart and existing refresh behavior is preserved', async () => {
    const save = date('Save');
    await save.click();
    assert.equal(await date('Saved').getAttribute('aria-pressed'), 'true');
    assert.equal(await date('Saved').locator('svg').evaluate(e => getComputedStyle(e).fill), 'rgb(255, 56, 92)');
    await capture('local-saved-heart');
    await date('Saved').click();
    assert.equal(await save.getAttribute('aria-pressed'), 'false');
    await save.click();
    await reload();
    assert.equal(await save.getAttribute('aria-pressed'), 'false');
  });
  await check('Reserve also reaches the calendar with normal smooth-motion preference', async () => {
    await page.emulateMedia({ reducedMotion: 'no-preference' });
    await reload();
    await date('Reserve').click();
    await page.waitForFunction(() => Math.abs(document.getElementById('dates').getBoundingClientRect().top - 67) < 2);
    assert.equal(await page.evaluate(() => document.activeElement.id), 'dates-heading');
  });
  await check('no runtime, console or HTTP asset errors', async () => assert.deepEqual(errors, []));
} catch (error) {
  errors.push(error.stack);
  await capture('local-booking-regression-failure');
  process.exitCode = 1;
  console.error(error.stack);
} finally {
  await fs.writeFile(`${output}/booking-regression.json`, JSON.stringify({ at: new Date().toISOString(), browser: browser.version(), viewport: { width: 1440, height: 900, dpr: 1 }, checks, errors, referenceEquivalence: 'Unverified: original access blocked; basic scope supported by explicit user reports.' }, null, 2));
  await browser.close();
}
