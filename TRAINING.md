# MotoPro CyberOrion POS — Training Guide
### Owner & Cashier Manual | Version 2.5 Pro

---

## TABLE OF CONTENTS

1. [How to Login](#1-how-to-login)
2. [Dashboard Overview](#2-dashboard-overview)
3. [POS Billing (Cashier)](#3-pos-billing-cashier)
4. [Products & Inventory](#4-products--inventory)
5. [Purchases & Receiving Stock](#5-purchases--receiving-stock)
6. [Returns Management](#6-returns-management)
7. [Customer Management & CRM](#7-customer-management--crm)
8. [Suppliers](#8-suppliers)
9. [Accounts & Cashbook](#9-accounts--cashbook)
10. [Reports](#10-reports)
11. [SMS & Marketing](#11-sms--marketing)
12. [Loyalty Program](#12-loyalty-program)
13. [Dual Billing Counters](#13-dual-billing-counters)
14. [Settings](#14-settings)
15. [Backup & Data Safety](#15-backup--data-safety)
16. [Owner Tips & Best Practices](#16-owner-tips--best-practices)

---

## 1. How to Login

**URL:** Open browser → `http://localhost:5173` (or your server IP)

**Login credentials** are created by the system owner in the **Users** section. No self-registration is allowed.

| Field | What to enter |
|-------|--------------|
| Username | Your assigned username (e.g. `admin`, `cashier1`) |
| Password | Your assigned password |

> **Forgot password?** Ask the shop owner to reset it via **Settings → Users**.

---

## 2. Dashboard Overview

After login you see the **Owner Dashboard** with:

| Card | Meaning |
|------|---------|
| **Today's Sales** | Total Rs. billed today across all counters |
| **Today's Transactions** | Number of invoices issued today |
| **Stock Alerts** | Products below minimum stock level |
| **Outstanding Dues** | Total receivable from credit customers |
| **Recent Invoices** | Last 5 sales with amounts |
| **Top Products** | Best-selling parts this month |
| **Low Stock Items** | Parts needing reorder (shown in red) |

Click any sidebar item to navigate. On mobile, tap the **☰ hamburger menu** (top-left).

---

## 3. POS Billing (Cashier)

### Starting a Sale

1. Click **POS Billing** in sidebar
2. Select the **Customer** from the dropdown at top (default: Walk-in)
3. Search for a product:
   - Type in the **search box** (name, SKU, or model)
   - Or scan barcode with scanner → presses Enter automatically
4. Click a product card to add it to cart

### Modifying Cart Items

| Action | How |
|--------|-----|
| Increase qty | Click **+** button on cart item |
| Decrease qty | Click **–** button on cart item |
| Remove item | Click **🗑️ trash** icon |
| Change unit price | Click the price field and type new amount |
| Add item discount | Type percentage in the **Disc%** field |
| Bill-level discount | Enter amount in **Bill Discount** field below cart |

### Payment Methods

Select from: **Cash / Card / Bank Transfer / JazzCash / EasyPaisa / Split / Credit**

For **Cash**: Enter amount tendered → system shows change automatically.

For **Split Payment**: Enter cash portion + card portion.

For **Credit**: Sale is recorded and added to customer's receivable balance.

### Completing the Sale

Click **"Complete Sale & Print Bill"** → system:
1. Deducts stock from inventory
2. Posts revenue to cashbook
3. Adds loyalty points to customer
4. Shows **Thermal Receipt** preview → click **Print** to print

### Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `F1` | Focus barcode scanner input |
| `F2` | Focus product search |
| `F4` | Clear cart (with confirmation) |
| `F8` | Set payment method to Cash |

### Voiding an Invoice

Click **Recent Bills** (clock icon) → find invoice → click **Void**. Enter reason. Only users with **canVoidInvoices** permission can do this.

---

## 4. Products & Inventory

### Adding a New Product

1. Go to **Products** in sidebar
2. Click **+ Add Product**
3. Fill in:
   - **Product Name** (e.g., Honda CD70 Piston)
   - **SKU** (unique code, e.g., `CD70-PIST-STD`)
   - **Barcode** (optional, for scanner)
   - **Category** (Spare Parts / Accessories / Lubricants / Tyres)
   - **Compatible Model** (Honda CD70, CG125, etc.)
   - **Purchase Price** (cost from supplier)
   - **Selling Price** (retail price)
   - **Current Stock** (opening quantity)
   - **Minimum Stock Alert** (reorder point)
4. Click **Save Product**

### Stock Adjustment

Go to **Inventory** → find product → click **Adjust Stock** → enter qty + reason (e.g. "Damaged in transit").

### Low Stock Alerts

Dashboard and Inventory page show a **red badge** count. Any product at or below its minimum stock level triggers this.

---

## 5. Purchases & Receiving Stock

### Recording a Purchase (Supplier Invoice)

1. Go to **Purchases** → click **New Purchase Order**
2. Select **Supplier**
3. Add items: Product + Qty + Purchase Price
4. Enter **Invoice Number** (from supplier's bill)
5. Click **Save** → stock is automatically added to inventory

### Paying a Supplier

In Purchases → find the PO → click **Mark as Paid** → select payment method.

### A4 Purchase Order Print

Click **🖨️ Print** on any purchase order to generate an A4 PDF.

---

## 6. Returns Management

### Sales Return (Customer Returns Item)

1. Go to **Returns & Refunds** → click **Sales Returns** tab
2. Enter the **Invoice Number** from customer's receipt
3. Select which items are being returned + reason
4. Choose refund method (cash refund / credit note / exchange)
5. Click **Process Return** → stock is restored, cashbook updated

### Purchase Return (Returning to Supplier)

1. Go to **Returns & Refunds** → click **Purchase Returns** tab
2. Enter **Supplier name** and select **Purchase Order**
3. Enter items being returned + reason
4. Click **Create Debit Note** → a formal Debit Note document is generated
5. Print the Debit Note and send to supplier

---

## 7. Customer Management & CRM

### Registering a Customer

Go to **Customers** → **Register New Customer**:
- Name, Phone, Address
- Motorcycle model + number plate
- Category: Regular / Mechanic / Wholesale / VIP
- Credit limit (how much credit allowed)

### Receiving Payment from Credit Customer

In the customer table → find customer with **red balance** → click **Pay Debt** → enter amount received → Confirm.

### Sending WhatsApp Reminder

Click **Remind** (green button) on any customer with outstanding balance → opens WhatsApp with pre-filled Urdu message.

### Advanced CRM — View Profile

Click the **👁️ Eye** icon on any customer to open their full CRM profile:

| Tab | Contents |
|-----|---------|
| **Overview** | Balance, purchases, loyalty, bike info, service reminders |
| **CRM Timeline** | Full history of calls, visits, notes, SMS sent |
| **Follow-up** | Schedule next follow-up with reason and countdown |
| **Service Tracker** | Track next service date (oil change, full service, etc.) |

**Logging an Interaction:**
Timeline tab → Select type (Call/Visit/Note/SMS) → Write note → **Add Note**

**Follow-up Badge:** If a follow-up is overdue, a **🔴 red dot** appears next to the customer name in the table.

**Service Due Badge:** If service is due within 7 days, an **🟡 amber dot** appears.

---

## 8. Suppliers

### Adding a Supplier

Go to **Suppliers** → **+ Add Supplier**:
- Supplier name + company
- Phone, email, address
- NTN number (for GST billing)
- Credit terms (days)

### Supplier Ledger

Each supplier shows their **payable balance** (what you owe them). Record payments from the Purchases page.

---

## 9. Accounts & Cashbook

### What It Tracks

The **Accounts** page (visible to users with `canViewFinancials`) shows:
- **Cashbook**: All cash in/out entries with categories
- **Expense Logging**: Record operating expenses (rent, electricity, etc.)
- **Daily Summary**: Opening balance + receipts – payments = closing balance

### Recording an Expense

Accounts → **Log Expense** → Category + Amount + Description + Date.

### Owner Drawings

Log any cash taken by owner as **Owner Drawing** category.

---

## 10. Reports

Go to **Reports** (requires `canViewProfit` permission):

| Report | Description |
|--------|------------|
| **Sales Summary** | Daily/monthly revenue, invoice count, average sale |
| **Top Products** | Best-selling items by revenue and quantity |
| **Customer Report** | Top customers by purchase volume |
| **Profit & Loss** | Gross profit after cost of goods |
| **Stock Valuation** | Current inventory value at cost and selling price |
| **Tax Report** | GST collected for FBR filing |

---

## 11. SMS & Marketing

### Sending a Single SMS

Marketing → SMS Engine tab → Select customer from list → Type message → **Send SMS**

### Bulk Broadcast Campaign

Marketing → Create Campaign → Select recipients (All / Group / Specific) → Write message → **Broadcast**

### 1-Click Payment Reminders

Marketing → **Due Payment Reminders** section → Click **📤 Remind** next to any customer with balance → SMS sent instantly with their due amount in Urdu.

### SMS Gateway Configuration

Marketing → **Gateway Settings** tab → Enter your SMS provider API key (Brand SMS / Jazz API etc.)

---

## 12. Loyalty Program

Go to **Loyalty Club**:
- Customers earn **1 point per Rs. 100** spent
- Points can be redeemed at POS (enter **Points to Redeem** in cart)
- Tiers: **Bronze** (0–999 pts) → **Silver** (1000–4999) → **Gold** (5000+)
- Gold customers get priority service badge in POS

---

## 13. Dual Billing Counters

Go to **Dual Counters** to manage two separate billing stations:

- **Counter 1**: Main counter (default cashier)
- **Counter 2**: Second counter (for busy periods)

Each counter has its own:
- Cash drawer balance
- Day opening/closing
- Transaction log

The active counter is shown in the top header bar. Change it with the counter selector.

---

## 14. Settings

Go to **Settings** in sidebar — 6 tabs:

| Tab | What to configure |
|-----|------------------|
| **General** | Shop name, address, phone, currency (PKR), timezone (Karachi), language |
| **Hardware** | Thermal printer type (USB/Network), paper width, barcode scanner, cash drawer |
| **Payment** | Enable/disable payment methods, card surcharge %, split payment |
| **Tax & GST** | GST rate (17%), inclusive/exclusive, NTN/STN, per-category rates |
| **Invoice** | Receipt header/footer text, Urdu footer, invoice prefixes, logo |
| **Backup & DB** | Manual backup download, restore, auto-backup schedule |

---

## 15. Backup & Data Safety

> ⚠️ **VERY IMPORTANT — Do this daily!**

### Manual Backup

Settings → **Backup & DB** tab → **Download Backup (.json)**

Save this file to:
- A USB drive
- Google Drive / WhatsApp to yourself
- External hard disk

### Restore from Backup

Settings → Backup & DB → **Select & Restore Backup File** → choose your `.json` file

### Auto-Backup

Enable **Auto-Backup** toggle → set schedule → system auto-saves at shift closing.

---

## 16. Owner Tips & Best Practices

### Daily Routine (Cashier)

| Time | Task |
|------|------|
| **Opening** | Log in → Check counter cash balance → Verify stock alerts |
| **During day** | Scan products, take payments, issue receipts |
| **Closing** | Check daily sales on Dashboard → Download backup → Log cash in/out |

### Weekly Tasks (Owner)

| Task | Where |
|------|-------|
| Review top-selling products | Reports → Top Products |
| Check supplier dues | Suppliers page |
| Check customer receivables | Customers → sort by balance |
| Send payment reminders | Marketing → Due Reminders |
| Download weekly backup | Settings → Backup & DB |

### Monthly Tasks (Owner)

| Task | Where |
|------|-------|
| Run P&L Report | Reports → Profit & Loss |
| Generate GST report | Reports → Tax Report |
| Reorder low-stock items | Inventory → Low Stock filter |
| Run loyalty points audit | Loyalty Club |

### Security Rules

1. **Never share the admin password** — create separate user accounts for each cashier
2. Cashiers should have `canVoidInvoices = false` to prevent fraud
3. Only owner should have `canViewFinancials = true` and `canViewProfit = true`
4. Audit Logs track every action — review weekly for suspicious activity
5. Download backup before any system changes

---

*MotoPro CyberOrion POS v2.5 Pro — Developed by CyberOrion*
*For support: contact your system administrator*
