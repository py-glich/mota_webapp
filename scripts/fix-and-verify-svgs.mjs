import { PART_IMAGES } from '../src/utils/imageUtils.ts';
import { chromium } from 'playwright';

const browser = await chromium.launch();
const page = await browser.newPage();

const fixedPartImages = {};

for (const [key, val] of Object.entries(PART_IMAGES)) {
  const b64 = val.replace('data:image/svg+xml;base64,', '');
  const xml = Buffer.from(b64, 'base64').toString('utf8');
  // Replace bare & with &amp;
  const fixedXml = xml.replace(/&(?!(amp|lt|gt|quot|apos);)/g, '&amp;');
  const fixedB64 = 'data:image/svg+xml;base64,' + Buffer.from(fixedXml).toString('base64');
  
  await page.setContent(`<!DOCTYPE html><html><body><img id="test" src="${fixedB64}" /></body></html>`);
  await page.waitForTimeout(100);
  const dims = await page.evaluate(() => {
    const img = document.querySelector('#test');
    return { w: img.naturalWidth, h: img.naturalHeight };
  });

  console.log(`${key}: naturalWidth=${dims.w}, naturalHeight=${dims.h} -> ${dims.w > 0 ? '✅ OK' : '❌ FAILED'}`);
  fixedPartImages[key] = fixedB64;
}

await browser.close();
