import { chromium } from 'playwright';

const browser = await chromium.launch();
const page = await browser.newPage();

page.on('console', msg => console.log('BROWSER LOG:', msg.text()));
page.on('pageerror', err => console.log('PAGE ERROR:', err.message));
page.on('requestfailed', req => console.log('REQUEST FAILED:', req.url().slice(0, 100), req.failure()?.errorText));

await page.goto('https://mota-webapp.vercel.app/', { waitUntil: 'networkidle' });

await page.fill('input[type=text]', 'owner');
await page.fill('input[type=password]', 'password123');
await page.click('button[type=submit]');
await page.waitForTimeout(2000);

// Navigate to products
const buttons = await page.locator('a, nav button, aside button').all();
for (const b of buttons) {
  const t = await b.textContent().catch(() => '');
  if (t && t.includes('Product') && !t.includes('POS')) {
    await b.click();
    break;
  }
}
await page.waitForTimeout(2000);

const details = await page.evaluate(() => {
  const firstImg = document.querySelector('table img');
  if (!firstImg) return 'No img found';
  return {
    src: firstImg.src.slice(0, 120),
    currentSrc: firstImg.currentSrc.slice(0, 120),
    complete: firstImg.complete,
    naturalWidth: firstImg.naturalWidth,
    naturalHeight: firstImg.naturalHeight
  };
});
console.log('First img details:', details);

await browser.close();
