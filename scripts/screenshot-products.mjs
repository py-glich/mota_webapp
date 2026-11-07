import { chromium } from 'playwright';

const browser = await chromium.launch({ headless: true });
const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 } });
const page = await ctx.newPage();

// First load the app to seed localStorage with auth tokens
await page.goto('http://localhost:5173', { waitUntil: 'domcontentloaded' });

// Clear stale products from localStorage
await page.evaluate(() => { localStorage.removeItem('cyberorion_products'); });

// Set up mock session so we bypass login
await page.evaluate(() => {
  const user = {
    id: 'USER-001', name: 'Faizan Ilyas', username: 'owner',
    email: 'owner@cyberorion.pk', role: 'owner', 
    counterId: 'CTR-01', isActive: true, avatar: null
  };
  localStorage.setItem('cyberorion_current_user', JSON.stringify(user));
  localStorage.setItem('cyberorion_session_active', 'true');
});

// Now navigate to products page directly
await page.goto('http://localhost:5173/products', { waitUntil: 'networkidle' });
await page.waitForTimeout(4000);

console.log('URL:', page.url());
const bodyText = await page.locator('body').textContent();
console.log('Page preview:', bodyText?.substring(0, 200));

await page.screenshot({ path: 'test-results/products-fixed.png', fullPage: false });
console.log('Screenshot done!');
await browser.close();
process.exit(0);
