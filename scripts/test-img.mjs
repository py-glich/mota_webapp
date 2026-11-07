import { chromium } from 'playwright';
import { PART_IMAGES } from '../src/utils/imageUtils.ts';

const browser = await chromium.launch();
const page = await browser.newPage();

const raw = PART_IMAGES.PISTON_CYLINDER.replace('data:image/svg+xml;base64,', '');
const decoded = Buffer.from(raw, 'base64').toString('utf8');
const fixed = decoded.replace('CYLINDER & PISTON', 'CYLINDER &amp; PISTON');
const fixedB64 = 'data:image/svg+xml;base64,' + Buffer.from(fixed).toString('base64');

await page.setContent(`<!DOCTYPE html><html><body><img id="test" src="${fixedB64}" /></body></html>`);
await page.waitForTimeout(500);

const res = await page.evaluate(() => {
  const img = document.querySelector('#test');
  return {
    complete: img.complete,
    naturalWidth: img.naturalWidth,
    naturalHeight: img.naturalHeight
  };
});
console.log('Result with &amp;:', res);
await browser.close();
