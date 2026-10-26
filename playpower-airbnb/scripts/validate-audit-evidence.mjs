import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

const root = 'docs/reference-audit';
let links = 0;
const markdown = ['README.md', 'AGENTS.md'];
async function collect(directory) {
  for (const entry of await fs.readdir(directory, { withFileTypes: true })) {
    const file = path.join(directory, entry.name);
    if (entry.isDirectory()) await collect(file);
    else if (file.endsWith('.md')) markdown.push(file);
  }
}
await collect('docs');
for (const file of markdown) {
  const text = await fs.readFile(file, 'utf8');
  for (const match of text.matchAll(/\[[^\]]*\]\(([^)]+)\)/g)) {
    const target = match[1].replace(/^<|>$/g, '').split('#')[0];
    if (!target || /^(https?:|mailto:)/.test(target)) continue;
    await fs.access(path.resolve(path.dirname(file), decodeURIComponent(target)));
    links++;
  }
}
const reports = [
  `${root}/local-interactions.json`, `${root}/gallery-controls.json`,
  `${root}/booking-regression.json`,
  "implementation-captures/amenities/report.json",
  'implementation-captures/verification.json',
  'implementation-captures/quality/lightbox-quality.json',
];
for (const file of reports) {
  const report = JSON.parse(await fs.readFile(file, 'utf8'));
  assert.deepEqual(report.errors, [], `Errors in ${file}`);
}
let screenshots = 0;
for (const file of await fs.readdir(`${root}/screenshots`)) {
  if (!file.endsWith('.png')) continue;
  const metadata = await sharp(`${root}/screenshots/${file}`).metadata();
  assert.equal(metadata.width, 1440, file);
  assert.equal(metadata.height, 900, file);
  screenshots++;
}
const result = { linksChecked: links, localReportsWithoutErrors: reports.length, auditScreenshotsVerified: screenshots, screenshotSize: '1440x900', note: 'Reference access remains blocked; these checks validate local evidence integrity only.' };
await fs.writeFile(`${root}/evidence-validation.json`, JSON.stringify(result, null, 2));
console.log(JSON.stringify(result));
