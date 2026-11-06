import { chromium } from 'playwright';

async function main() {
  const browser = await chromium.launch();
  const context = await browser.newContext();
  await context.addInitScript(() => {
    localStorage.setItem('cyberorion_is_authenticated', 'true');
  });
  const page = await context.newPage();
  await page.goto('http://localhost:5173');
  await page.waitForSelector('aside');
  await page.click('button[data-tab="products"]');
  await page.waitForTimeout(1000);
  await page.screenshot({ path: 'test-results/products-screenshot.png', fullPage: false });
  await browser.close();
  console.log('SUCCESS: Screenshot captured at test-results/products-screenshot.png');
}

main().catch(console.error);
