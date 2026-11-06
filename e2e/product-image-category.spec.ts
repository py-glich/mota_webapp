import { test, expect } from '@playwright/test';

test.describe('Product Images Display, Auto-Resizing & Category Addition Suite', () => {

  test.beforeEach(async ({ context, page }) => {
    // Instant session authentication as Owner
    await context.addInitScript(() => {
      localStorage.setItem('cyberorion_is_authenticated', 'true');
    });
    await page.goto('/');
    await page.waitForSelector('aside', { timeout: 10000 });
  });

  test('1. Every product row displays a visible image thumbnail without blank spaces', async ({ page }) => {
    await page.click('button[data-tab="products"]');
    await expect(page.locator('text=Product & Inventory Catalog').first()).toBeVisible();

    // Verify product rows exist
    const rows = page.locator('tbody tr');
    const count = await rows.count();
    expect(count).toBeGreaterThan(0);

    // Verify all images rendered inside rows have valid src
    const images = page.locator('tbody tr td img');
    const imageCount = await images.count();
    expect(imageCount).toBeGreaterThanOrEqual(count);

    // Verify the first image has a non-empty src attribute
    const firstImgSrc = await images.first().getAttribute('src');
    expect(firstImgSrc).toBeTruthy();
    expect(firstImgSrc?.length).toBeGreaterThan(10);
  });

  test('2. Clicking thumbnail opens high-resolution lightbox modal', async ({ page }) => {
    await page.click('button[data-tab="products"]');
    await expect(page.locator('text=Product & Inventory Catalog').first()).toBeVisible();

    // Click the first product thumbnail button
    const thumbBtn = page.locator('tbody tr td button[title*="Click to view"]').first();
    await thumbBtn.click();

    // Verify Lightbox Modal appears with preview image
    const lightboxImg = page.locator('.fixed.inset-0 img[alt]');
    await expect(lightboxImg).toBeVisible();

    // Close preview
    await page.locator('button:has-text("Close Preview")').click();
    await expect(lightboxImg).not.toBeVisible();
  });

  test('3. Can add a new category directly from Product section and filter by it', async ({ page }) => {
    await page.click('button[data-tab="products"]');
    await expect(page.locator('text=Product & Inventory Catalog').first()).toBeVisible();

    // Click + Add Category button
    const addCatBtn = page.locator('button:has-text("+ Add Category")');
    await expect(addCatBtn).toBeVisible();
    await addCatBtn.click();

    // Check modal opened
    await expect(page.locator('h3:has-text("Add New Category")')).toBeVisible();

    // Fill new category form
    const testCatName = `Shocks & Springs ${Date.now().toString().slice(-4)}`;
    await page.locator('input[placeholder*="Suspension"]').fill(testCatName);
    await page.locator('input[placeholder*="جمپ اور سسپنشن"]').fill('سسپنشن اور جمپ');
    await page.locator('textarea[placeholder*="Front fork"]').fill('Front shocks, hydraulic rear dampers');

    // Handle alert
    page.once('dialog', dialog => dialog.dismiss());

    // Submit form
    await page.locator('button:has-text("Save Category")').click();

    // Verify new category now appears in the category dropdown filter
    const categorySelect = page.locator('select').first();
    await expect(categorySelect).toContainText(testCatName);
  });

  test('4. Add Product modal includes "+ New" Quick Category button and image preview', async ({ page }) => {
    await page.click('button[data-tab="products"]');
    await expect(page.locator('text=Product & Inventory Catalog').first()).toBeVisible();

    // Open Add Product modal
    await page.locator('button:has-text("Add New Product")').click();
    await expect(page.locator('h3:has-text("Add New Motorcycle Product")')).toBeVisible();

    // Verify Quick Add Category button is present beside Category dropdown
    const quickAddCat = page.locator('button:has-text("+ New")');
    await expect(quickAddCat).toBeVisible();

    // Verify product preview image is visible (showing default category graphic or loaded image)
    const previewImg = page.locator('img[alt="Product preview"]');
    await expect(previewImg).toBeVisible();
    const src = await previewImg.getAttribute('src');
    expect(src).toBeTruthy();

    // Close modal
    await page.locator('button:has-text("Cancel")').click();
  });

  test('5. POS page displays product image cards for all products', async ({ page }) => {
    await page.click('button[data-tab="pos"]');
    await expect(page.locator('text=Terminal:').first()).toBeVisible();

    // Check catalog cards render images
    const posImages = page.locator('.group:has-text("Rs.") img[alt]');
    const count = await posImages.count();
    expect(count).toBeGreaterThan(0);

    const firstPosImg = await posImages.first().getAttribute('src');
    expect(firstPosImg).toBeTruthy();
    expect(firstPosImg?.length).toBeGreaterThan(10);
  });
});
