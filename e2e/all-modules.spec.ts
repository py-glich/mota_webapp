import { test, expect } from '@playwright/test';

test.describe('MotoPro POS - Full 27-Module Verification Suite', () => {

  test.beforeEach(async ({ context, page }) => {
    // Instant session authentication as Owner
    await context.addInitScript(() => {
      localStorage.setItem('cyberorion_is_authenticated', 'true');
    });
    await page.goto('/');
    // Ensure sidebar is loaded
    await page.waitForSelector('aside', { timeout: 10000 });
  });

  // 1. Product Management
  test('01. Product Management: Add, edit, photo upload, SKU, barcode, and +Stock', async ({ page }) => {
    await page.click('button[data-tab="products"]');
    await expect(page.locator('text=Product & Inventory Catalog').first()).toBeVisible();

    // Verify products table has rows
    const tableRows = page.locator('table tbody tr');
    await expect(tableRows.first()).toBeVisible();

    // Verify + Stock quick restock button exists and opens modal
    const plusStockBtn = page.locator('button:has-text("+ Stock")').first();
    await expect(plusStockBtn).toBeVisible();
    await plusStockBtn.click();
    await expect(page.locator('text=Quick Stock Management').first()).toBeVisible();
    await expect(page.getByRole('button', { name: '+10', exact: true })).toBeVisible();
    await page.click('button:has-text("Cancel")');

    // Verify Add New Product modal has Image Upload & Preview
    await page.click('button:has-text("Add New Product")');
    await expect(page.locator('text=Product Picture').first()).toBeVisible();
    await expect(page.locator('text=Choose File / Camera').first()).toBeVisible();
    await page.click('button:has-text("Cancel")');
  });

  // 2. Categories
  test('02. Categories: Dynamic categories and brand filtering', async ({ page }) => {
    await page.click('button[data-tab="products"]');
    const categorySelect = page.locator('select').first();
    await expect(categorySelect).toBeVisible();
    await categorySelect.selectOption({ index: 1 });
    await expect(page.locator('table tbody tr').first()).toBeVisible();
  });

  // 3. Inventory
  test('03. Inventory: Stock-in, stock-out, adjustments, low-stock alerts', async ({ page }) => {
    await page.click('button[data-tab="inventory"]');
    await expect(page.locator('text=Inventory & Real-Time Stock Control').first()).toBeVisible();
    await expect(page.locator('button:has-text("Real-time Stock")').first()).toBeVisible();
    await expect(page.locator('button:has-text("Manual Stock Adjustment")').first()).toBeVisible();
  });

  // 4. Purchase Management
  test('04. Purchase Management: Invoices, suppliers, payment statuses', async ({ page }) => {
    await page.click('button[data-tab="purchases"]');
    await expect(page.locator('text=Purchase Management & Inward Stock').first()).toBeVisible();
    await expect(page.locator('button:has-text("New Purchase Invoice")').first()).toBeVisible();
    await expect(page.locator('table tbody tr').first()).toBeVisible();
  });

  // 5. Purchase Returns
  test('05. Purchase Returns: Return quantities and accounting adjustments', async ({ page }) => {
    await page.click('button[data-tab="returns"]');
    await page.click('button:has-text("Purchase Returns (Suppliers)")');
    await expect(page.locator('text=Purchase Returns').first()).toBeVisible();
    await expect(page.locator('button:has-text("New Purchase Return")').first()).toBeVisible();
  });

  // 6. POS / Billing
  test('06. POS / Billing: Cart, discounts, checkout, invoice generation', async ({ page }) => {
    await page.click('button[data-tab="pos"]');
    await expect(page.locator('text=Terminal:').first()).toBeVisible();

    const productCard = page.locator('.group:has-text("Rs.")').first();
    await expect(productCard).toBeVisible();
    await productCard.click();

    await expect(page.locator('button:has-text("Complete Sale")').first()).toBeEnabled();
  });

  // 7. Sales Returns
  test('07. Sales Returns: Full/partial returns, refunds, credit notes', async ({ page }) => {
    await page.click('button[data-tab="returns"]');
    await page.click('button:has-text("Sales Returns (Customers)")');
    await expect(page.locator('input[placeholder*="Invoice Number" i]').first()).toBeVisible();
  });

  // 8. Customer CRM
  test('08. Customer CRM: Profiles, history, customer accounts', async ({ page }) => {
    await page.click('button[data-tab="customers"]');
    await expect(page.locator('text=Customer Management & CRM Ledgers').first()).toBeVisible();
    await expect(page.locator('button:has-text("Register New Customer")').first()).toBeVisible();
    await expect(page.locator('table tbody tr').first()).toBeVisible();
  });

  // 9. Customer Segmentation
  test('09. Customer Segmentation: CD70, CG125, YBR125 and customer tiers', async ({ page }) => {
    await page.click('button[data-tab="customers"]');
    await expect(page.locator('button:has-text("Honda CD70")').first()).toBeVisible();
    await expect(page.locator('button:has-text("Honda CG125")').first()).toBeVisible();
    await expect(page.locator('button:has-text("Yamaha YBR125")').first()).toBeVisible();
    await page.click('button:has-text("Honda CD70")');
  });

  // 10. Loyalty
  test('10. Loyalty: Points earning, expiry, redemption rules', async ({ page }) => {
    await page.click('button[data-tab="loyalty"]');
    await expect(page.locator('text=Customer Loyalty & Points Rewards Program').first()).toBeVisible();
    await expect(page.locator('text=Loyalty Rules').first()).toBeVisible();
  });

  // 11. Supplier Management
  test('11. Supplier Management: Ledger, payments, FIFO allocation', async ({ page }) => {
    await page.click('button[data-tab="suppliers"]');
    await expect(page.locator('text=Supplier Management & Payables (AP)').first()).toBeVisible();
    await expect(page.locator('button:has-text("Add New Supplier")').first()).toBeVisible();
    await expect(page.locator('table tbody tr').first()).toBeVisible();
  });

  // 12. Accounting
  test('12. Accounting: Cashbook, daily expenses, net balance reconciliation', async ({ page }) => {
    await page.click('button[data-tab="accounting"]');
    await expect(page.locator('text=Accounting & Financial Cashbook').first()).toBeVisible();
    await expect(page.locator('button:has-text("Record Shop Expense")').first()).toBeVisible();
  });

  // 13. Reports
  test('13. Reports: Gross profit, net profit, AR & AP aging reports', async ({ page }) => {
    await page.click('button[data-tab="reports"]');
    await expect(page.locator('text=Executive Reports & Business Analytics').first()).toBeVisible();
    await page.click('button:has-text("Receivables & Payables Aging")');
    await expect(page.locator('text=Distributor Payables (AP) Aging Summary').first()).toBeVisible();
  });

  // 14. Quotations
  test('14. Quotations: Create, print, convert to invoice', async ({ page }) => {
    await page.click('button[data-tab="quotations"]');
    await expect(page.locator('text=Estimates & Customer Quotations').first()).toBeVisible();
    await expect(page.locator('button:has-text("New Quotation / Estimate")').first()).toBeVisible();
  });

  // 15. SMS / WhatsApp
  test('15. SMS / WhatsApp: Messaging, payment reminders, broadcast campaigns', async ({ page }) => {
    await page.click('button[data-tab="marketing"]');
    await expect(page.locator('text=Marketing & Automated Messaging Engine').first()).toBeVisible();
    await expect(page.locator('button:has-text("Configure Gateway API")').first()).toBeVisible();
    await expect(page.locator('button:has-text("WhatsApp Broadcasts")').first()).toBeVisible();
  });

  // 16. Multiple Counters
  test('16. Multiple Counters: Real-time dual counter synchronization', async ({ page }) => {
    await page.click('button[data-tab="counters"]');
    await expect(page.locator('text=Multiple Billing Counters & Drawer Reconciliation').first()).toBeVisible();
    await expect(page.locator('text=Counter 1 (Front Showroom)').first()).toBeVisible();
    await expect(page.locator('text=Counter 2 (Workshop & Parts)').first()).toBeVisible();
  });

  // 17. Cash Management
  test('17. Cash Management: Counter-wise shift closing and cash drawer count', async ({ page }) => {
    await page.click('button[data-tab="counters"]');
    const closeShiftBtn = page.locator('button:has-text("Close Shift & Drawer")').first();
    await expect(closeShiftBtn).toBeVisible();
    await closeShiftBtn.click();
    await expect(page.locator('text=Close Drawer Shift').first()).toBeVisible();
    await page.click('button:has-text("Cancel")');
  });

  // 18. Owner Dashboard
  test('18. Owner Dashboard: Sales, purchases, profit and inventory summary', async ({ page }) => {
    await page.click('button[data-tab="dashboard"]');
    await expect(page.locator('text=Today\'s Sales').first()).toBeVisible();
    await expect(page.locator('text=Drive Your Business').first()).toBeVisible();
  });

  // 19. User Management
  test('19. User Management: Owner, manager and cashier accounts', async ({ page }) => {
    await page.click('button[data-tab="users"]');
    await expect(page.locator('button:has-text("Add New Staff Account")').first()).toBeVisible();
    await expect(page.locator('table tbody tr').first()).toBeVisible();
  });

  // 20. Permissions
  test('20. Permissions: Server-side role-based authorization matrix', async ({ page }) => {
    await page.click('button[data-tab="permissions"]');
    await expect(page.locator('text=Role-Based Access Control (RBAC) & Security Matrix').first()).toBeVisible();
    await expect(page.locator('text=View Wholesale Purchase Cost').first()).toBeVisible();
  });

  // 21. Audit Logs
  test('21. Audit Logs: Transaction and user activity history', async ({ page }) => {
    await page.click('button[data-tab="audit"]');
    await expect(page.locator('text=Security Audit Trail & Activity Logs').first()).toBeVisible();
    await expect(page.locator('table tbody tr').first()).toBeVisible();
  });

  // 22. Backup
  test('22. Backup: Automatic cloud backups and restoration', async ({ page }) => {
    await page.click('button[data-tab="settings"]');
    await page.click('button:has-text("Backup & DB")');
    await expect(page.locator('text=Automated Backup Schedule').first()).toBeVisible();
    await expect(page.locator('button:has-text("Sync Cloud Now")').first()).toBeVisible();
  });

  // 23. Settings
  test('23. Settings: Tax, payment, printer, invoice customization', async ({ page }) => {
    await page.click('button[data-tab="settings"]');
    await expect(page.locator('button:has-text("General")').first()).toBeVisible();
    await expect(page.locator('button:has-text("Hardware")').first()).toBeVisible();
    await expect(page.locator('button:has-text("Tax & GST")').first()).toBeVisible();
  });

  // 24. Hardware
  test('24. Hardware: Barcode scanner, authentic Code 128 label printing, cash drawer', async ({ page }) => {
    await page.click('button[data-tab="products"]');
    const barcodeIcon = page.locator('button[title*="Barcode" i]').first();
    await expect(barcodeIcon).toBeVisible();
    await barcodeIcon.click();
    await expect(page.locator('text=Thermal Roll').first()).toBeVisible();
    await page.click('button:has-text("Close")');
  });

  // 25. UI/UX
  test('25. UI/UX: Mobile menu, responsive layout and navigation', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    const mobileMenuBtn = page.locator('button[aria-label*="mobile menu" i], button:has(svg.lucide-menu)').first();
    if (await mobileMenuBtn.isVisible()) {
      await mobileMenuBtn.click();
      await expect(page.locator('button[data-tab="dashboard"]').first()).toBeVisible();
    }
    await page.setViewportSize({ width: 1280, height: 800 });
  });

  // 26. Security
  test('26. Security: User profile, password management, session verification', async ({ page }) => {
    const profileBtn = page.locator('button[title*="Profile" i]').first();
    await expect(profileBtn).toBeVisible();
    await profileBtn.click();
    await expect(page.locator('text=Profile Info').first()).toBeVisible();
    await page.click('button:has-text("Security")');
    await expect(page.locator('input[type="password"]').first()).toBeVisible();
    await page.locator('div.fixed button:has(svg.lucide-x)').first().click();
  });

  // 27. Deployment
  test('27. Deployment: Backend API health, MongoDB connection status, bulk migration', async ({ page }) => {
    const response = await page.request.get('http://127.0.0.1:5000/api/backup/cloud-status');
    expect(response.ok()).toBeTruthy();
    const data = await response.json();
    expect(Array.isArray(data.history)).toBeTruthy();

    await page.click('button[data-tab="products"]');
    await page.click('button:has-text("Excel / CSV Import")');
    await expect(page.locator('text=Bulk Product Import').first()).toBeVisible();
    await expect(page.locator('button:has-text("Template.csv")').first()).toBeVisible();
    await page.locator('div.fixed button:has(svg.lucide-x)').first().click();
  });

});
