import { chromium } from 'playwright';

const browser = await chromium.launch({ headless: true });
const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 } });
const page = await ctx.newPage();

console.log('Navigating to live Vercel app...');
await page.goto('https://mota-webapp.vercel.app/', { waitUntil: 'networkidle' });

// Clear stale localStorage
await page.evaluate(() => { localStorage.removeItem('cyberorion_products'); });

// Login
await page.locator('input[type=text], input:not([type=password])').first().fill('owner');
await page.locator('input[type=password]').fill('password123');
await page.locator('button[type=submit]').click();
await page.waitForTimeout(2500);

// Check avatars in Header and Sidebar
const avatarCheck = await page.evaluate(() => {
  const imgs = Array.from(document.querySelectorAll('header img, aside img'));
  return imgs.map(i => ({
    alt: i.alt,
    w: i.naturalWidth,
    h: i.naturalHeight,
    ok: i.naturalWidth > 0
  }));
});
console.log('Live Vercel Avatar check:', avatarCheck);

// Navigate to Products page
const buttons = await page.locator('a, nav button, aside button').all();
for (const b of buttons) {
  const t = await b.textContent().catch(() => '');
  if (t && t.includes('Product') && !t.includes('POS')) {
    await b.click();
    break;
  }
}
await page.waitForTimeout(2500);

// Check product images
const productImgCheck = await page.evaluate(() => {
  const imgs = Array.from(document.querySelectorAll('table img, tbody img'));
  return imgs.map(i => ({
    alt: i.alt,
    w: i.naturalWidth,
    h: i.naturalHeight,
    ok: i.naturalWidth > 0
  }));
});

console.log('Live Vercel Product images total:', productImgCheck.length);
console.log('Live Vercel Product images rendering successfully:', productImgCheck.filter(p => p.ok).length);
console.log('Sample product checks:', productImgCheck.slice(0, 5));

await page.screenshot({ path: 'test-results/live-vercel-proof.png' });
console.log('Screenshot of live Vercel app saved to test-results/live-vercel-proof.png');

await browser.close();
