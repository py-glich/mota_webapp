# MotoPro CyberOrion POS — Installation & Deployment Guide
### Technical Setup Manual | Version 2.5 Pro

---

## SYSTEM REQUIREMENTS

### Minimum Hardware

| Component | Minimum | Recommended |
|-----------|---------|-------------|
| **CPU** | Intel Core i3 (8th gen) | Core i5 / Ryzen 5 |
| **RAM** | 4 GB | 8 GB |
| **Storage** | 50 GB HDD | 128 GB SSD |
| **Display** | 1366×768 | 1920×1080 |
| **OS** | Windows 10 (64-bit) | Windows 11 |
| **Network** | LAN / WiFi (for multi-counter) | Gigabit LAN |

### Required Software

| Software | Version | Download |
|----------|---------|---------|
| **Node.js** | v18+ (LTS) | https://nodejs.org |
| **MongoDB Community** | v7.0+ | https://www.mongodb.com/try/download/community |
| **Git** *(optional)* | Latest | https://git-scm.com |
| **Google Chrome / Edge** | Latest | — |

### Optional Hardware

| Device | Use |
|--------|-----|
| Thermal Receipt Printer (80mm) | ESC/POS USB or Network |
| USB Barcode Scanner | Auto-fills product search |
| Cash Drawer | Connected to printer port |
| Label Printer (Zebra/Citizen) | Product barcode labels |
| UPS / Battery Backup | Protects against power cuts |

---

## PART 1 — FIRST TIME INSTALLATION

### Step 1: Install Node.js

1. Go to https://nodejs.org → Download **LTS version**
2. Run installer → Click **Next** through all steps → **Install**
3. Verify: Open **Command Prompt** → type: `node -v` → should show `v18.x.x` or higher

### Step 2: Install MongoDB

1. Go to https://www.mongodb.com/try/download/community
2. Download **MongoDB Community Server** → Windows → `.msi` installer
3. Run installer:
   - Choose **Complete** install
   - ✅ Check **Install MongoDB as a Windows Service** (auto-starts)
   - ✅ Check **Install MongoDB Compass** (optional GUI)
4. Verify: Open Command Prompt → type: `mongod --version` → should show version

### Step 3: Get the Project Files

**Option A — From a ZIP file (most common):**
1. Extract the ZIP to `C:\MotoPro\` (or any folder without spaces in path)
2. The folder should contain: `src/`, `server/`, `package.json`, etc.

**Option B — From Git:**
```bash
git clone <repo-url> C:\MotoPro\cyberorion-moto-pos
cd C:\MotoPro\cyberorion-moto-pos
```

### Step 4: Install Dependencies

Open **Command Prompt** in the project folder:
```bash
cd C:\MotoPro\cyberorion-moto-pos
npm install
```
Wait 2–5 minutes for all packages to download.

### Step 5: Configure Environment (Optional)

Create a `.env` file in the project root if you need custom settings:
```env
# MongoDB connection (default: local)
MONGO_URI=mongodb://127.0.0.1:27017/motopro_pos

# Backend port (default: 5000)
PORT=5000

# JWT secret for auth (change this!)
JWT_SECRET=your_super_secret_key_change_this

# Frontend URL for CORS
FRONTEND_URL=http://localhost:5173
```

> For single-PC setup, the defaults work without any `.env` file.

### Step 6: Start MongoDB Service

MongoDB should start automatically as a Windows service. To verify:
1. Press `Win + R` → type `services.msc` → Enter
2. Find **MongoDB** → Status should be **Running**

If not running: Right-click → **Start**

### Step 7: First Launch

Open **two separate Command Prompt windows**:

**Window 1 — Backend Server:**
```bash
cd C:\MotoPro\cyberorion-moto-pos
npx tsx watch server/index.ts
```
You should see:
```
✅ MongoDB connected: mongodb://127.0.0.1:27017/motopro_pos
🚀 MotoPro API running on port 5000
```

**Window 2 — Frontend (Vite Dev Server):**
```bash
cd C:\MotoPro\cyberorion-moto-pos
npx vite --host 0.0.0.0 --port 5173
```
You should see:
```
  VITE v5.x.x  ready in xxx ms
  ➜  Local:   http://localhost:5173/
  ➜  Network: http://192.168.x.x:5173/
```

### Step 8: Open the App

Open **Google Chrome** → go to: `http://localhost:5173`

Login with your admin credentials. Done! ✅

---

## PART 2 — MULTI-COUNTER SETUP (2 PCs / Tablets)

For a shop with 2 billing counters on separate machines:

### Server PC (Main Computer)

This PC runs both the backend and MongoDB.

Start backend as shown in Step 7. Note the IP address shown in Vite output (e.g., `192.168.1.10`).

### Client PCs / Tablets

On the second PC or tablet (must be on same WiFi/LAN):

Open browser → go to: `http://192.168.1.10:5173`

(Replace `192.168.1.10` with the actual server PC IP)

> Both counters share the same database — inventory, customers, and invoices sync automatically.

### Finding Your Server IP

On the server PC: Open Command Prompt → type: `ipconfig`
Look for **IPv4 Address** under your WiFi or Ethernet adapter.

---

## PART 3 — PRODUCTION BUILD (Faster & Stable)

For permanent deployment, build a production version:

```bash
cd C:\MotoPro\cyberorion-moto-pos
npm run build
```

Then serve the built files:
```bash
npm install -g serve
serve -s dist -l 5173
```

This is faster than the dev server and should be used in a live shop environment.

---

## PART 4 — AUTO-START ON WINDOWS BOOT

### Method: Windows Task Scheduler

1. Press `Win + S` → search **Task Scheduler** → Open
2. Click **Create Basic Task**
3. Name: `MotoPro Backend`
4. Trigger: **When the computer starts**
5. Action: **Start a program**
   - Program: `cmd.exe`
   - Arguments: `/c "cd /d C:\MotoPro\cyberorion-moto-pos && npx tsx watch server/index.ts"`
6. ✅ Check "Run whether user is logged on or not"
7. Repeat for `MotoPro Frontend` with Vite command

### Simpler Method: Startup Folder Scripts

Create two `.bat` files in `C:\Users\<YourUser>\AppData\Roaming\Microsoft\Windows\Start Menu\Programs\Startup\`:

**start-backend.bat:**
```batch
@echo off
cd /d C:\MotoPro\cyberorion-moto-pos
npx tsx watch server/index.ts
```

**start-frontend.bat:**
```batch
@echo off
cd /d C:\MotoPro\cyberorion-moto-pos
npx vite --host 0.0.0.0 --port 5173
```

---

## PART 5 — THERMAL PRINTER SETUP

### USB Thermal Printer

1. Connect printer via USB
2. Install printer driver from manufacturer CD or website
3. In Windows: Set as **default printer** (or note the printer name)
4. In MotoPro: Go to **Settings → Hardware** → Printer type: **USB Thermal**
5. Test: Run a sale → Print receipt → Should print automatically

### Network (LAN) Thermal Printer

1. Connect printer to same network router (via LAN cable or WiFi)
2. Print the printer's **self-test page** to find its IP address
3. In MotoPro: **Settings → Hardware** → Printer type: **Network/LAN** → Enter IP + Port (usually `9100`)

### Paper Width

- Standard roll (80mm): Use **80mm** setting
- Mini roll (58mm): Use **58mm** setting

---

## PART 6 — BACKUP STRATEGY

### Daily Backup (Recommended)

**Manual:** Settings → Backup & DB → **Download Backup (.json)**

Save to:
- USB drive (keep in safe place)
- Google Drive folder (auto-sync)

**Automated:** Settings → Backup & DB → Enable **Auto-Backup** → Set to **Daily at Shift Closing**

### Backup File Location

Downloaded backups are named:
```
CYBERORION_DB_BACKUP_2026-11-05T18-30-00.json
```

Keep at least 7 days of backups.

### Restore from Backup

Settings → Backup & DB → **Select & Restore Backup File** → choose `.json` → Confirm

---

## PART 7 — TROUBLESHOOTING

### App won't open in browser
- Check both Command Prompt windows are running (no error messages)
- Make sure you're on the right URL (`http://localhost:5173`)
- Try restarting both servers (Ctrl+C → re-run commands)

### "Cannot connect to database" error
- Check MongoDB is running: `services.msc` → MongoDB → Start
- Check backend terminal for error messages

### Products/data not showing
- Go to **Settings → Backup & DB** → Click **Sync to MongoDB**
- Refresh the page

### Printer not printing
- Check USB cable / network connection
- Verify printer is set as default in Windows
- Restart the printer
- Try **Settings → Hardware** → change printer type

### Slow performance
- Restart both servers
- Clear browser cache: `Ctrl + Shift + Delete`
- Check RAM usage: `Ctrl + Shift + Esc` → Task Manager

### "Port already in use" error
```bash
# Kill the process using port 5000:
netstat -ano | findstr :5000
taskkill /PID <PID_NUMBER> /F

# Kill process using port 5173:
netstat -ano | findstr :5173
taskkill /PID <PID_NUMBER> /F
```

---

## PART 8 — USER ACCOUNT SETUP

After first login with admin:

1. Go to **Users** → **Add User**
2. Create accounts for each staff member:

| Role | Recommended Permissions |
|------|------------------------|
| **Owner / Admin** | All permissions ON |
| **Senior Cashier** | canSell, canProcessReturns, canViewReports ON; canVoidInvoices OFF |
| **Cashier** | canSell only; all financial/void permissions OFF |
| **Stock Manager** | canManageProducts, canViewInventory ON |

3. Share username + password directly — no self-registration possible

---

## PART 9 — UPDATING THE SOFTWARE

When a new version is available:

```bash
# 1. Download backup first!
# Settings → Backup & DB → Download Backup

# 2. Stop both servers (Ctrl+C in each window)

# 3. Pull new code (if using Git):
cd C:\MotoPro\cyberorion-moto-pos
git pull origin main

# 4. Update dependencies:
npm install

# 5. Restart servers (Step 7)

# 6. If data issues: Settings → Backup & DB → Restore from your backup
```

---

## QUICK REFERENCE CARD

```
📌 START BACKEND:  cd C:\MotoPro\cyberorion-moto-pos && npx tsx watch server/index.ts
📌 START FRONTEND: cd C:\MotoPro\cyberorion-moto-pos && npx vite --host 0.0.0.0 --port 5173
📌 APP URL:        http://localhost:5173
📌 API URL:        http://localhost:5000
📌 MONGODB:        mongodb://127.0.0.1:27017/motopro_pos
📌 BACKUP:         Settings → Backup & DB → Download Backup (.json)
```

---

*MotoPro CyberOrion POS v2.5 Pro*
*For technical support, contact your system administrator.*
