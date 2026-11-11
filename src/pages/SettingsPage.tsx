import React, { useState } from 'react';
import {
  Settings, Printer, CreditCard, Receipt, FileText, Database,
  Download, Upload, RefreshCw, AlertTriangle, CheckCircle,
  Clock, Globe, Building2, Phone, MapPin, DollarSign,
  Wifi, HardDrive, Monitor, Zap, Shield, ChevronRight,
  Save, RotateCcw, PlusCircle, Trash2, Eye, EyeOff,
  Percent, Hash, ToggleLeft, ToggleRight, Palette, Type,
  Package, Truck, Image, AlignLeft
} from 'lucide-react';
import { useApp } from '../context/AppContext';

type SettingsTab =
  | 'general'
  | 'hardware'
  | 'payment'
  | 'tax'
  | 'invoice'
  | 'backup';

const TAB_CONFIG: { id: SettingsTab; label: string; icon: React.ElementType; color: string }[] = [
  { id: 'general',  label: 'General',         icon: Globe,     color: 'text-blue-400' },
  { id: 'hardware', label: 'Hardware',         icon: Printer,   color: 'text-purple-400' },
  { id: 'payment',  label: 'Payment',          icon: CreditCard, color: 'text-emerald-400' },
  { id: 'tax',      label: 'Tax & GST',        icon: Percent,   color: 'text-amber-400' },
  { id: 'invoice',  label: 'Invoice',          icon: FileText,  color: 'text-sky-400' },
  { id: 'backup',   label: 'Backup & DB',      icon: Database,  color: 'text-rose-400' },
];

/* ─────────────────────────── helpers ─────────────────────────── */
const SettingRow: React.FC<{ label: string; desc?: string; children: React.ReactNode }> = ({ label, desc, children }) => (
  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 py-3 border-b border-[#1E2638] last:border-0">
    <div className="min-w-0">
      <span className="text-xs font-semibold text-white block">{label}</span>
      {desc && <span className="text-[11px] text-slate-500 mt-0.5 block">{desc}</span>}
    </div>
    <div className="shrink-0">{children}</div>
  </div>
);

const Toggle: React.FC<{ checked: boolean; onChange: (v: boolean) => void }> = ({ checked, onChange }) => (
  <button
    onClick={() => onChange(!checked)}
    className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${checked ? 'bg-rose-600' : 'bg-slate-700'}`}
  >
    <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow transition-transform ${checked ? 'translate-x-4.5' : 'translate-x-0.5'}`} />
  </button>
);

const Input: React.FC<React.InputHTMLAttributes<HTMLInputElement>> = (props) => (
  <input
    {...props}
    className={`bg-[#0B0E14] border border-[#1E2638] rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-rose-500 transition ${props.className ?? ''}`}
  />
);

const Select: React.FC<React.SelectHTMLAttributes<HTMLSelectElement>> = ({ children, ...props }) => (
  <select
    {...props}
    className={`bg-[#0B0E14] border border-[#1E2638] rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-rose-500 transition ${props.className ?? ''}`}
  >
    {children}
  </select>
);

const SaveBtn: React.FC<{ saved: boolean; onClick: () => void }> = ({ saved, onClick }) => (
  <button
    onClick={onClick}
    className={`flex items-center gap-1.5 px-4 py-2 rounded-xl font-bold text-xs transition shadow-md ${saved ? 'bg-emerald-600 text-white' : 'bg-rose-600 hover:bg-rose-500 text-white shadow-rose-600/25'}`}
  >
    {saved ? <CheckCircle className="w-3.5 h-3.5" /> : <Save className="w-3.5 h-3.5" />}
    {saved ? 'Saved!' : 'Save Changes'}
  </button>
);

/* ═══════════════════════════════════════════════════════════
   TAB 1 — General System Settings
══════════════════════════════════════════════════════════════ */
const GeneralSettings: React.FC = () => {
  const [saved, setSaved] = useState(false);
  const [shopName,    setShopName]    = useState('MotoPro Motorcycle Shop');
  const [shopAddress, setShopAddress] = useState('Main Bazar, Lahore, Punjab, Pakistan');
  const [shopPhone,   setShopPhone]   = useState('+92 300 1234567');
  const [shopEmail,   setShopEmail]   = useState('info@motopro.pk');
  const [currency,    setCurrency]    = useState('PKR');
  const [currSymbol,  setCurrSymbol]  = useState('Rs.');
  const [timezone,    setTimezone]    = useState('Asia/Karachi');
  const [language,    setLanguage]    = useState('en');
  const [dateFormat,  setDateFormat]  = useState('DD/MM/YYYY');
  const [fiscalStart, setFiscalStart] = useState('January');
  const [lowStockDef, setLowStockDef] = useState('5');
  const [autoLogout,  setAutoLogout]  = useState('30');

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div className="space-y-6">
      {/* Shop Identity */}
      <div className="bg-[#111622] border border-[#1E2638] rounded-2xl p-5">
        <h3 className="font-bold text-white text-sm flex items-center gap-2 mb-4">
          <Building2 className="w-4 h-4 text-blue-400" /> Shop Identity
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-[11px] text-slate-400 font-semibold block mb-1">Shop Name</label>
            <Input className="w-full" value={shopName} onChange={e => setShopName(e.target.value)} />
          </div>
          <div>
            <label className="text-[11px] text-slate-400 font-semibold block mb-1">Phone Number</label>
            <Input className="w-full" value={shopPhone} onChange={e => setShopPhone(e.target.value)} />
          </div>
          <div className="sm:col-span-2">
            <label className="text-[11px] text-slate-400 font-semibold block mb-1">Address</label>
            <Input className="w-full" value={shopAddress} onChange={e => setShopAddress(e.target.value)} />
          </div>
          <div>
            <label className="text-[11px] text-slate-400 font-semibold block mb-1">Email Address</label>
            <Input className="w-full" type="email" value={shopEmail} onChange={e => setShopEmail(e.target.value)} />
          </div>
        </div>
      </div>

      {/* Locale & Region */}
      <div className="bg-[#111622] border border-[#1E2638] rounded-2xl p-5">
        <h3 className="font-bold text-white text-sm flex items-center gap-2 mb-4">
          <Globe className="w-4 h-4 text-blue-400" /> Locale & Region
        </h3>
        <SettingRow label="Currency" desc="Primary currency for all transactions">
          <div className="flex gap-2">
            <Select value={currency} onChange={e => setCurrency(e.target.value)} className="w-24">
              <option value="PKR">PKR</option>
              <option value="USD">USD</option>
              <option value="AED">AED</option>
            </Select>
            <Input className="w-16" placeholder="Symbol" value={currSymbol} onChange={e => setCurrSymbol(e.target.value)} />
          </div>
        </SettingRow>
        <SettingRow label="Timezone" desc="Used for reports, receipts & auto-backup scheduling">
          <Select value={timezone} onChange={e => setTimezone(e.target.value)} className="w-44">
            <option value="Asia/Karachi">Asia/Karachi (PKT +5)</option>
            <option value="Asia/Dubai">Asia/Dubai (GST +4)</option>
            <option value="UTC">UTC (GMT +0)</option>
          </Select>
        </SettingRow>
        <SettingRow label="Language" desc="UI display language">
          <Select value={language} onChange={e => setLanguage(e.target.value)} className="w-36">
            <option value="en">English</option>
            <option value="ur">اردو (Urdu)</option>
          </Select>
        </SettingRow>
        <SettingRow label="Date Format" desc="How dates appear on receipts & reports">
          <Select value={dateFormat} onChange={e => setDateFormat(e.target.value)} className="w-40">
            <option value="DD/MM/YYYY">DD/MM/YYYY</option>
            <option value="MM/DD/YYYY">MM/DD/YYYY</option>
            <option value="YYYY-MM-DD">YYYY-MM-DD</option>
          </Select>
        </SettingRow>
        <SettingRow label="Fiscal Year Start" desc="Month your financial year begins">
          <Select value={fiscalStart} onChange={e => setFiscalStart(e.target.value)} className="w-36">
            {['January','February','March','April','May','June','July','August','September','October','November','December'].map(m => (
              <option key={m} value={m}>{m}</option>
            ))}
          </Select>
        </SettingRow>
      </div>

      {/* Operational Defaults */}
      <div className="bg-[#111622] border border-[#1E2638] rounded-2xl p-5">
        <h3 className="font-bold text-white text-sm flex items-center gap-2 mb-4">
          <Zap className="w-4 h-4 text-blue-400" /> Operational Defaults
        </h3>
        <SettingRow label="Default Low Stock Alert Level" desc="Items below this quantity trigger low-stock badge">
          <Input className="w-20" type="number" min="1" value={lowStockDef} onChange={e => setLowStockDef(e.target.value)} />
        </SettingRow>
        <SettingRow label="Auto-Logout Idle Timeout (minutes)" desc="Session expires after this many idle minutes">
          <Select value={autoLogout} onChange={e => setAutoLogout(e.target.value)} className="w-36">
            <option value="15">15 minutes</option>
            <option value="30">30 minutes</option>
            <option value="60">60 minutes</option>
            <option value="0">Never</option>
          </Select>
        </SettingRow>
      </div>

      <div className="flex justify-end"><SaveBtn saved={saved} onClick={handleSave} /></div>
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════
   TAB 2 — Hardware & Printer Settings
══════════════════════════════════════════════════════════════ */
const HardwareSettings: React.FC = () => {
  const [saved, setSaved] = useState(false);
  const [printerType,   setPrinterType]   = useState('thermal_usb');
  const [printerIp,     setPrinterIp]     = useState('192.168.100.50');
  const [printerPort,   setPrinterPort]   = useState('9100');
  const [receiptWidth,  setReceiptWidth]  = useState('80');
  const [autoPrint,     setAutoPrint]     = useState(true);
  const [printCopies,   setPrintCopies]   = useState('1');
  const [barcodeScanner,setBarcodeScanner]= useState(true);
  const [cashDrawer,    setCashDrawer]    = useState(false);
  const [displayScale,  setDisplayScale]  = useState('100');
  const [labelPrinter,  setLabelPrinter]  = useState(false);
  const [labelIp,       setLabelIp]       = useState('192.168.100.51');
  const [labelWidth,    setLabelWidth]    = useState('50');

  const handleSave = () => { setSaved(true); setTimeout(() => setSaved(false), 2500); };

  return (
    <div className="space-y-6">
      {/* Receipt Printer */}
      <div className="bg-[#111622] border border-[#1E2638] rounded-2xl p-5">
        <h3 className="font-bold text-white text-sm flex items-center gap-2 mb-4">
          <Printer className="w-4 h-4 text-purple-400" /> Thermal Receipt Printer
        </h3>
        <SettingRow label="Printer Connection Type" desc="How the receipt printer is connected">
          <Select value={printerType} onChange={e => setPrinterType(e.target.value)} className="w-44">
            <option value="thermal_usb">USB Thermal Printer</option>
            <option value="thermal_network">Network / LAN Thermal</option>
            <option value="thermal_bluetooth">Bluetooth Thermal</option>
            <option value="browser_print">Browser Print (PDF)</option>
          </Select>
        </SettingRow>
        {(printerType === 'thermal_network') && (
          <SettingRow label="Printer IP & Port" desc="Network address of your ESC/POS printer">
            <div className="flex gap-2">
              <Input className="w-36" placeholder="192.168.x.x" value={printerIp} onChange={e => setPrinterIp(e.target.value)} />
              <Input className="w-20" placeholder="9100" value={printerPort} onChange={e => setPrinterPort(e.target.value)} />
            </div>
          </SettingRow>
        )}
        <SettingRow label="Receipt Paper Width (mm)" desc="80mm for standard thermal, 58mm for mini">
          <Select value={receiptWidth} onChange={e => setReceiptWidth(e.target.value)} className="w-36">
            <option value="80">80 mm (Standard)</option>
            <option value="58">58 mm (Mini Roll)</option>
          </Select>
        </SettingRow>
        <SettingRow label="Auto-Print After Sale" desc="Automatically print receipt when payment is confirmed">
          <Toggle checked={autoPrint} onChange={setAutoPrint} />
        </SettingRow>
        <SettingRow label="Number of Copies" desc="Copies per sale (1 = customer, 2 = customer + shop)">
          <Select value={printCopies} onChange={e => setPrintCopies(e.target.value)} className="w-28">
            <option value="1">1 Copy</option>
            <option value="2">2 Copies</option>
            <option value="3">3 Copies</option>
          </Select>
        </SettingRow>
      </div>

      {/* Peripheral Devices */}
      <div className="bg-[#111622] border border-[#1E2638] rounded-2xl p-5">
        <h3 className="font-bold text-white text-sm flex items-center gap-2 mb-4">
          <Monitor className="w-4 h-4 text-purple-400" /> Peripheral Devices
        </h3>
        <SettingRow label="Barcode Scanner" desc="USB HID barcode scanner connected (auto-detects keypress)">
          <Toggle checked={barcodeScanner} onChange={setBarcodeScanner} />
        </SettingRow>
        <SettingRow label="Cash Drawer" desc="Trigger cash drawer open via printer port signal">
          <Toggle checked={cashDrawer} onChange={setCashDrawer} />
        </SettingRow>
        <SettingRow label="UI Scale / Zoom" desc="Scale interface for touch-screen or large monitor">
          <Select value={displayScale} onChange={e => setDisplayScale(e.target.value)} className="w-32">
            <option value="80">80% (Compact)</option>
            <option value="100">100% (Default)</option>
            <option value="120">120% (Large)</option>
            <option value="150">150% (Extra Large)</option>
          </Select>
        </SettingRow>
      </div>

      {/* Label Printer */}
      <div className="bg-[#111622] border border-[#1E2638] rounded-2xl p-5">
        <h3 className="font-bold text-white text-sm flex items-center gap-2 mb-4">
          <Package className="w-4 h-4 text-purple-400" /> Product Label Printer
        </h3>
        <SettingRow label="Enable Label Printer" desc="Print barcode / price labels on products">
          <Toggle checked={labelPrinter} onChange={setLabelPrinter} />
        </SettingRow>
        {labelPrinter && (
          <>
            <SettingRow label="Label Printer IP" desc="Network IP of Zebra / Citizen label printer">
              <Input className="w-36" value={labelIp} onChange={e => setLabelIp(e.target.value)} />
            </SettingRow>
            <SettingRow label="Label Width (mm)" desc="Width of your label stock">
              <Select value={labelWidth} onChange={e => setLabelWidth(e.target.value)} className="w-36">
                <option value="30">30 mm</option>
                <option value="40">40 mm</option>
                <option value="50">50 mm (Default)</option>
                <option value="60">60 mm</option>
              </Select>
            </SettingRow>
          </>
        )}
      </div>

      <div className="flex justify-end"><SaveBtn saved={saved} onClick={handleSave} /></div>
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════
   TAB 3 — Payment Settings
══════════════════════════════════════════════════════════════ */
const PaymentSettings: React.FC = () => {
  const [saved, setSaved] = useState(false);
  const [cashEnabled,   setCashEnabled]   = useState(true);
  const [cardEnabled,   setCardEnabled]   = useState(true);
  const [bankEnabled,   setBankEnabled]   = useState(true);
  const [jazzEnabled,   setJazzEnabled]   = useState(true);
  const [easyEnabled,   setEasyEnabled]   = useState(true);
  const [creditEnabled, setCreditEnabled] = useState(true);
  const [cardSurcharge, setCardSurcharge] = useState('2');
  const [jazzTitle,     setJazzTitle]     = useState('JazzCash');
  const [easyTitle,     setEasyTitle]     = useState('EasyPaisa');
  const [bankName,      setBankName]      = useState('HBL / MCB / UBL');
  const [defaultMethod, setDefaultMethod] = useState('cash');
  const [splitPayment,  setSplitPayment]  = useState(true);
  const [roundingMode,  setRoundingMode]  = useState('nearest');

  const handleSave = () => { setSaved(true); setTimeout(() => setSaved(false), 2500); };

  const methodBadge = (enabled: boolean) => (
    <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${enabled ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30' : 'bg-slate-800 text-slate-500 border border-slate-700'}`}>
      {enabled ? 'ENABLED' : 'DISABLED'}
    </span>
  );

  return (
    <div className="space-y-6">
      {/* Accepted Payment Methods */}
      <div className="bg-[#111622] border border-[#1E2638] rounded-2xl p-5">
        <h3 className="font-bold text-white text-sm flex items-center gap-2 mb-4">
          <CreditCard className="w-4 h-4 text-emerald-400" /> Accepted Payment Methods
        </h3>
        <div className="space-y-0">
          <SettingRow label={<span className="flex items-center gap-2">💵 Cash {methodBadge(cashEnabled)}</span> as unknown as string} desc="Physical currency payments">
            <Toggle checked={cashEnabled} onChange={setCashEnabled} />
          </SettingRow>
          <SettingRow label={<span className="flex items-center gap-2">💳 Card / POS Machine {methodBadge(cardEnabled)}</span> as unknown as string} desc={`Card surcharge: ${cardSurcharge}%`}>
            <div className="flex items-center gap-3">
              {cardEnabled && (
                <div className="flex items-center gap-1.5">
                  <span className="text-[11px] text-slate-400">Surcharge %</span>
                  <Input className="w-16" type="number" min="0" max="10" step="0.5" value={cardSurcharge} onChange={e => setCardSurcharge(e.target.value)} />
                </div>
              )}
              <Toggle checked={cardEnabled} onChange={setCardEnabled} />
            </div>
          </SettingRow>
          <SettingRow label={<span className="flex items-center gap-2">🏦 Bank Transfer {methodBadge(bankEnabled)}</span> as unknown as string} desc="IBFT / wire transfer">
            <div className="flex items-center gap-3">
              {bankEnabled && <Input className="w-36" value={bankName} onChange={e => setBankName(e.target.value)} placeholder="Bank name..." />}
              <Toggle checked={bankEnabled} onChange={setBankEnabled} />
            </div>
          </SettingRow>
          <SettingRow label={<span className="flex items-center gap-2">📱 JazzCash {methodBadge(jazzEnabled)}</span> as unknown as string} desc="Mobile wallet">
            <div className="flex items-center gap-3">
              {jazzEnabled && <Input className="w-28" value={jazzTitle} onChange={e => setJazzTitle(e.target.value)} />}
              <Toggle checked={jazzEnabled} onChange={setJazzEnabled} />
            </div>
          </SettingRow>
          <SettingRow label={<span className="flex items-center gap-2">📱 EasyPaisa {methodBadge(easyEnabled)}</span> as unknown as string} desc="Mobile wallet">
            <div className="flex items-center gap-3">
              {easyEnabled && <Input className="w-28" value={easyTitle} onChange={e => setEasyTitle(e.target.value)} />}
              <Toggle checked={easyEnabled} onChange={setEasyEnabled} />
            </div>
          </SettingRow>
          <SettingRow label={<span className="flex items-center gap-2">📒 Customer Credit {methodBadge(creditEnabled)}</span> as unknown as string} desc="Sell on credit (adds to receivables)">
            <Toggle checked={creditEnabled} onChange={setCreditEnabled} />
          </SettingRow>
        </div>
      </div>

      {/* POS Behaviour */}
      <div className="bg-[#111622] border border-[#1E2638] rounded-2xl p-5">
        <h3 className="font-bold text-white text-sm flex items-center gap-2 mb-4">
          <Zap className="w-4 h-4 text-emerald-400" /> POS Behaviour
        </h3>
        <SettingRow label="Default Payment Method" desc="Pre-selected method when opening payment modal">
          <Select value={defaultMethod} onChange={e => setDefaultMethod(e.target.value)} className="w-36">
            <option value="cash">Cash</option>
            <option value="card">Card</option>
            <option value="bank">Bank Transfer</option>
            <option value="jazzcash">JazzCash</option>
            <option value="easypaisa">EasyPaisa</option>
          </Select>
        </SettingRow>
        <SettingRow label="Allow Split Payment" desc="Let a customer pay with multiple methods in one transaction">
          <Toggle checked={splitPayment} onChange={setSplitPayment} />
        </SettingRow>
        <SettingRow label="Amount Rounding" desc="How to round final totals at POS">
          <Select value={roundingMode} onChange={e => setRoundingMode(e.target.value)} className="w-44">
            <option value="nearest">Round to nearest Re.</option>
            <option value="up">Always round up</option>
            <option value="down">Always round down</option>
            <option value="none">No rounding (exact)</option>
          </Select>
        </SettingRow>
      </div>

      <div className="flex justify-end"><SaveBtn saved={saved} onClick={handleSave} /></div>
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════
   TAB 4 — Tax Configuration
══════════════════════════════════════════════════════════════ */
const TaxSettings: React.FC = () => {
  const [saved, setSaved] = useState(false);
  const [taxEnabled,  setTaxEnabled]  = useState(true);
  const [taxLabel,    setTaxLabel]    = useState('GST');
  const [defaultRate, setDefaultRate] = useState('17');
  const [taxMode,     setTaxMode]     = useState('exclusive');
  const [ntnNumber,   setNtnNumber]   = useState('');
  const [stnNumber,   setStnNumber]   = useState('');
  const [showTaxOnReceipt, setShowTaxOnReceipt] = useState(true);
  const [categoryRates, setCategoryRates] = useState([
    { category: 'Spare Parts', rate: '17' },
    { category: 'Accessories', rate: '17' },
    { category: 'Lubricants & Oil', rate: '0' },
    { category: 'Tyres', rate: '17' },
  ]);

  const handleSave = () => { setSaved(true); setTimeout(() => setSaved(false), 2500); };
  const updateRate = (idx: number, rate: string) => setCategoryRates(prev => prev.map((r, i) => i === idx ? { ...r, rate } : r));

  return (
    <div className="space-y-6">
      {/* Core Tax Config */}
      <div className="bg-[#111622] border border-[#1E2638] rounded-2xl p-5">
        <h3 className="font-bold text-white text-sm flex items-center gap-2 mb-4">
          <Percent className="w-4 h-4 text-amber-400" /> Core Tax Configuration
        </h3>
        <SettingRow label="Enable Tax / GST" desc="Apply tax on sales transactions">
          <Toggle checked={taxEnabled} onChange={setTaxEnabled} />
        </SettingRow>
        {taxEnabled && (
          <>
            <SettingRow label="Tax Label" desc="Name shown on receipts (GST, VAT, Sales Tax…)">
              <Input className="w-28" value={taxLabel} onChange={e => setTaxLabel(e.target.value)} />
            </SettingRow>
            <SettingRow label="Default Tax Rate (%)" desc="Applied when no category-specific rate is set">
              <Input className="w-24" type="number" min="0" max="100" step="0.5" value={defaultRate} onChange={e => setDefaultRate(e.target.value)} />
            </SettingRow>
            <SettingRow label="Tax Calculation Mode" desc="Whether the sale price already includes tax or not">
              <Select value={taxMode} onChange={e => setTaxMode(e.target.value)} className="w-44">
                <option value="exclusive">Tax Exclusive (add on top)</option>
                <option value="inclusive">Tax Inclusive (already in price)</option>
              </Select>
            </SettingRow>
            <SettingRow label="Show Tax Breakdown on Receipt" desc="Print GST line on customer receipt">
              <Toggle checked={showTaxOnReceipt} onChange={setShowTaxOnReceipt} />
            </SettingRow>
          </>
        )}
      </div>

      {/* Business Registration */}
      <div className="bg-[#111622] border border-[#1E2638] rounded-2xl p-5">
        <h3 className="font-bold text-white text-sm flex items-center gap-2 mb-4">
          <Shield className="w-4 h-4 text-amber-400" /> Business Tax Registration (FBR)
        </h3>
        <SettingRow label="NTN Number" desc="National Tax Number (shown on invoices)">
          <Input className="w-44" placeholder="e.g. 1234567-8" value={ntnNumber} onChange={e => setNtnNumber(e.target.value)} />
        </SettingRow>
        <SettingRow label="STRN / STN Number" desc="Sales Tax Registration Number">
          <Input className="w-44" placeholder="e.g. 03-00-9999-999-77" value={stnNumber} onChange={e => setStnNumber(e.target.value)} />
        </SettingRow>
      </div>

      {/* Per-Category Tax Rates */}
      {taxEnabled && (
        <div className="bg-[#111622] border border-[#1E2638] rounded-2xl p-5">
          <h3 className="font-bold text-white text-sm flex items-center gap-2 mb-4">
            <Package className="w-4 h-4 text-amber-400" /> Per-Category Tax Rates
          </h3>
          <div className="space-y-2">
            {categoryRates.map((row, idx) => (
              <div key={idx} className="flex items-center gap-3 py-2 border-b border-[#1E2638] last:border-0">
                <span className="text-xs text-slate-300 flex-1 font-semibold">{row.category}</span>
                <div className="flex items-center gap-1.5">
                  <Input className="w-16 text-center" type="number" min="0" max="100" value={row.rate} onChange={e => updateRate(idx, e.target.value)} />
                  <span className="text-xs text-slate-400">%</span>
                </div>
              </div>
            ))}
          </div>
          <p className="text-[11px] text-slate-500 mt-3">Set 0% for zero-rated items. Category rates override the default rate above.</p>
        </div>
      )}

      <div className="flex justify-end"><SaveBtn saved={saved} onClick={handleSave} /></div>
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════
   TAB 5 — Invoice Customization
══════════════════════════════════════════════════════════════ */
const InvoiceSettings: React.FC = () => {
  const [saved, setSaved] = useState(false);
  const [headerText,     setHeaderText]     = useState('MotoPro Motorcycle Shop');
  const [subHeaderText,  setSubHeaderText]  = useState('Complete Motorcycle Spare Parts & Accessories');
  const [footerLine1,    setFooterLine1]    = useState('Thank you for your business! | شکریہ');
  const [footerLine2,    setFooterLine2]    = useState('No warranty on electrical parts. Exchange within 3 days with bill.');
  const [footerUrdu,     setFooterUrdu]     = useState('بل کے بغیر واپسی قابل قبول نہیں۔');
  const [showLogo,       setShowLogo]       = useState(true);
  const [showAddress,    setShowAddress]    = useState(true);
  const [showPhone,      setShowPhone]      = useState(true);
  const [showNtn,        setShowNtn]        = useState(false);
  const [showBarcodeOnReceipt, setShowBarcodeOnReceipt] = useState(false);
  const [invoicePrefix,  setInvoicePrefix]  = useState('INV');
  const [quotationPrefix,setQuotationPrefix]= useState('QT');
  const [purchasePrefix, setPurchasePrefix] = useState('PO');
  const [invoiceNotes,   setInvoiceNotes]   = useState('All prices in PKR. Goods once sold will not be taken back.');
  const [dualLanguage,   setDualLanguage]   = useState(true);

  const handleSave = () => { setSaved(true); setTimeout(() => setSaved(false), 2500); };

  return (
    <div className="space-y-6">
      {/* Receipt Header */}
      <div className="bg-[#111622] border border-[#1E2638] rounded-2xl p-5">
        <h3 className="font-bold text-white text-sm flex items-center gap-2 mb-4">
          <AlignLeft className="w-4 h-4 text-sky-400" /> Receipt / Invoice Header
        </h3>
        <SettingRow label="Show Shop Logo" desc="Print logo at top of receipt (upload in Shop Identity)">
          <Toggle checked={showLogo} onChange={setShowLogo} />
        </SettingRow>
        <SettingRow label="Header Title" desc="Main business name on receipt">
          <Input className="w-56" value={headerText} onChange={e => setHeaderText(e.target.value)} />
        </SettingRow>
        <SettingRow label="Sub-header / Tagline" desc="Second line below business name">
          <Input className="w-56" value={subHeaderText} onChange={e => setSubHeaderText(e.target.value)} />
        </SettingRow>
        <SettingRow label="Show Address on Receipt" desc="">
          <Toggle checked={showAddress} onChange={setShowAddress} />
        </SettingRow>
        <SettingRow label="Show Phone Number" desc="">
          <Toggle checked={showPhone} onChange={setShowPhone} />
        </SettingRow>
        <SettingRow label="Show NTN/STN on Receipt" desc="Required for GST-registered businesses">
          <Toggle checked={showNtn} onChange={setShowNtn} />
        </SettingRow>
        <SettingRow label="Print Barcode on Receipt" desc="Adds scannable barcode of invoice number">
          <Toggle checked={showBarcodeOnReceipt} onChange={setShowBarcodeOnReceipt} />
        </SettingRow>
      </div>

      {/* Footer Messages */}
      <div className="bg-[#111622] border border-[#1E2638] rounded-2xl p-5">
        <h3 className="font-bold text-white text-sm flex items-center gap-2 mb-4">
          <Type className="w-4 h-4 text-sky-400" /> Footer Messages
        </h3>
        <div className="space-y-3">
          <div>
            <label className="text-[11px] text-slate-400 font-semibold block mb-1">Footer Line 1 (English)</label>
            <Input className="w-full" value={footerLine1} onChange={e => setFooterLine1(e.target.value)} />
          </div>
          <div>
            <label className="text-[11px] text-slate-400 font-semibold block mb-1">Footer Line 2 (Return Policy)</label>
            <Input className="w-full" value={footerLine2} onChange={e => setFooterLine2(e.target.value)} />
          </div>
          <div>
            <label className="text-[11px] text-slate-400 font-semibold block mb-1">Urdu Footer Line (اردو)</label>
            <Input className="w-full" dir="rtl" value={footerUrdu} onChange={e => setFooterUrdu(e.target.value)} />
          </div>
          <SettingRow label="Dual Language (English + Urdu) Receipts" desc="">
            <Toggle checked={dualLanguage} onChange={setDualLanguage} />
          </SettingRow>
        </div>
      </div>

      {/* Invoice Numbering */}
      <div className="bg-[#111622] border border-[#1E2638] rounded-2xl p-5">
        <h3 className="font-bold text-white text-sm flex items-center gap-2 mb-4">
          <Hash className="w-4 h-4 text-sky-400" /> Invoice Number Prefixes
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="text-[11px] text-slate-400 font-semibold block mb-1">Sales Invoice</label>
            <Input className="w-full" value={invoicePrefix} onChange={e => setInvoicePrefix(e.target.value)} placeholder="INV" />
            <span className="text-[10px] text-slate-500 mt-1 block">e.g. INV-2026-0001</span>
          </div>
          <div>
            <label className="text-[11px] text-slate-400 font-semibold block mb-1">Quotation</label>
            <Input className="w-full" value={quotationPrefix} onChange={e => setQuotationPrefix(e.target.value)} placeholder="QT" />
            <span className="text-[10px] text-slate-500 mt-1 block">e.g. QT-2026-0001</span>
          </div>
          <div>
            <label className="text-[11px] text-slate-400 font-semibold block mb-1">Purchase Order</label>
            <Input className="w-full" value={purchasePrefix} onChange={e => setPurchasePrefix(e.target.value)} placeholder="PO" />
            <span className="text-[10px] text-slate-500 mt-1 block">e.g. PO-2026-0001</span>
          </div>
        </div>
      </div>

      {/* General Invoice Notes */}
      <div className="bg-[#111622] border border-[#1E2638] rounded-2xl p-5">
        <h3 className="font-bold text-white text-sm flex items-center gap-2 mb-2">
          <FileText className="w-4 h-4 text-sky-400" /> General Invoice Notes
        </h3>
        <textarea
          value={invoiceNotes}
          onChange={e => setInvoiceNotes(e.target.value)}
          rows={3}
          className="w-full bg-[#0B0E14] border border-[#1E2638] rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-rose-500 transition resize-none"
        />
        <p className="text-[11px] text-slate-500 mt-1">Printed at bottom of every invoice / purchase order.</p>
      </div>

      <div className="flex justify-end"><SaveBtn saved={saved} onClick={handleSave} /></div>
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════
   TAB 6 — Backup Configuration
══════════════════════════════════════════════════════════════ */
const BackupSettings: React.FC = () => {
  const { exportBackupJson, importBackupJson, resetToFactoryDefaults, dbStatus, refreshFromDatabase } = useApp();

  const [autoBackupEnabled, setAutoBackupEnabled] = useState(true);
  const [backupFrequency,   setBackupFrequency]   = useState('daily');
  const [cloudSyncEnabled,  setCloudSyncEnabled]  = useState(true);
  const [retentionDays,     setRetentionDays]      = useState('30');
  const [restoreStatus,     setRestoreStatus]     = useState<string | null>(null);
  const [seeding,           setSeeding]           = useState(false);
  const [saved,             setSaved]             = useState(false);
  const [cloudSyncing,      setCloudSyncing]      = useState(false);
  const [cloudHistory,      setCloudHistory]      = useState<any[]>([]);
  const [failureAlerts,     setFailureAlerts]     = useState<any[]>([]);

  const fetchCloudStatus = async () => {
    try {
      const res = await fetch('/api/backup/cloud-status');
      if (res.ok) {
        const data = await res.json();
        setCloudHistory(data.history || []);
        setFailureAlerts(data.failureAlerts || []);
      }
    } catch {}
  };

  React.useEffect(() => {
    fetchCloudStatus();
  }, []);

  const handleTriggerCloudSync = async () => {
    setCloudSyncing(true);
    try {
      const res = await fetch('/api/backup/cloud-sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ simulateFailure: false })
      });
      const data = await res.json();
      if (data.success) {
        setRestoreStatus('Automated Cloud Snapshot created & synced successfully!');
        fetchCloudStatus();
      } else {
        alert(data.message || 'Sync failed');
      }
    } catch (err: any) {
      alert('Cloud Sync Error: ' + err.message);
    } finally {
      setCloudSyncing(false);
      setTimeout(() => setRestoreStatus(null), 4000);
    }
  };

  const handleSimulateFailure = async () => {
    try {
      const res = await fetch('/api/backup/cloud-sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ simulateFailure: true })
      });
      const data = await res.json();
      fetchCloudStatus();
      alert('⚠️ Automatic Failure Alert Dispatched: ' + (data.message || 'Cloud backup failed'));
    } catch (err: any) {
      alert('Alert fired: ' + err.message);
    }
  };

  const handleSeedMongo = async () => {
    setSeeding(true);
    try {
      const res  = await fetch('/api/database/seed', { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        setRestoreStatus('MongoDB collections successfully synchronized & populated!');
        await refreshFromDatabase();
      } else {
        alert('Failed: ' + (data.error || 'Could not seed MongoDB'));
      }
    } catch (e: any) {
      alert('Error triggering MongoDB sync: ' + e.message);
    } finally {
      setSeeding(false);
      setTimeout(() => setRestoreStatus(null), 4000);
    }
  };

  const handleDownloadBackup = () => {
    const jsonStr = exportBackupJson();
    const dataUri = 'data:text/json;charset=utf-8,' + encodeURIComponent(jsonStr);
    const name    = `CYBERORION_DB_BACKUP_${new Date().toISOString().replace(/[:.]/g, '-')}.json`;
    const a = document.createElement('a');
    a.setAttribute('href', dataUri);
    a.setAttribute('download', name);
    a.click();
    a.remove();
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const success = importBackupJson(ev.target?.result as string);
        if (success) {
          setRestoreStatus('Database successfully restored from JSON backup!');
          setTimeout(() => setRestoreStatus(null), 4000);
        } else {
          alert('Failed to restore: The uploaded file has an invalid schema.');
        }
      } catch {
        alert('Error parsing uploaded backup JSON.');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-6">
      {restoreStatus && (
        <div className="p-4 rounded-xl bg-emerald-950/60 border border-emerald-800 text-emerald-200 text-xs font-bold flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-emerald-500" /> {restoreStatus}
        </div>
      )}

      {/* MongoDB Status */}
      <div className="bg-[#111622] border border-[#1E2638] rounded-2xl p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center">
              <Database className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-white text-sm">MongoDB Database Engine</h3>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${dbStatus.mongoConnected ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'}`}>
                  {dbStatus.mongoConnected ? 'ONLINE' : 'LOCAL STANDALONE'}
                </span>
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5">
                URI: <span className="text-emerald-400 font-mono">{dbStatus.uri}</span> | Engine: <span className="text-slate-300 font-semibold">{dbStatus.provider}</span>
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={refreshFromDatabase} className="px-3 py-1.5 bg-[#1B2232] hover:bg-slate-700 text-slate-200 rounded-xl font-semibold text-xs flex items-center gap-1.5 transition">
              <RefreshCw className="w-3.5 h-3.5 text-slate-400" /> Refresh
            </button>
            <button onClick={handleSeedMongo} disabled={seeding} className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold text-xs flex items-center gap-1.5 transition shadow-md shadow-emerald-600/20">
              <Database className="w-3.5 h-3.5" /> {seeding ? 'Syncing...' : 'Sync to MongoDB'}
            </button>
          </div>
        </div>
      </div>

      {/* Backup Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="bg-[#111622] p-5 rounded-2xl border border-[#1E2638] flex flex-col gap-4">
          <div>
            <div className="flex items-center gap-2 text-rose-400 mb-1">
              <Download className="w-4 h-4" />
              <h3 className="font-bold text-white text-sm">Manual Backup</h3>
            </div>
            <p className="text-xs text-slate-400">Downloads a complete JSON snapshot of all 18 modules. Store on USB or external drive.</p>
          </div>
          <button onClick={handleDownloadBackup} className="w-full py-2.5 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 shadow-md shadow-rose-600/20 transition">
            <Download className="w-4 h-4" /> Download Backup (.json)
          </button>
        </div>

        <div className="bg-[#111622] p-5 rounded-2xl border border-[#1E2638] flex flex-col gap-4">
          <div>
            <div className="flex items-center gap-2 text-blue-400 mb-1">
              <Upload className="w-4 h-4" />
              <h3 className="font-bold text-white text-sm">Restore from Backup</h3>
            </div>
            <p className="text-xs text-slate-400">Upload a previously exported <code className="bg-[#0B0E14] px-1 rounded text-rose-400">.json</code> file to fully restore shop state.</p>
          </div>
          <label className="w-full py-2.5 bg-[#1A2234] hover:bg-[#202A40] border border-[#26334D] text-slate-200 font-bold text-xs rounded-xl flex items-center justify-center gap-2 cursor-pointer transition">
            <Upload className="w-4 h-4 text-blue-400" /> Select & Restore Backup File
            <input type="file" accept=".json" onChange={handleFileUpload} className="hidden" />
          </label>
        </div>
      </div>

      {/* Auto-Backup Schedule */}
      <div className="bg-[#111622] border border-[#1E2638] rounded-2xl p-5">
        <h3 className="font-bold text-white text-sm flex items-center gap-2 mb-4">
          <Clock className="w-4 h-4 text-rose-400" /> Automated Backup Schedule
        </h3>
        <SettingRow label="Enable Auto-Backup" desc="Automatically backs up on the schedule below">
          <Toggle checked={autoBackupEnabled} onChange={setAutoBackupEnabled} />
        </SettingRow>
        <SettingRow label="Backup Frequency" desc="">
          <Select value={backupFrequency} onChange={e => setBackupFrequency(e.target.value)} className="w-44">
            <option value="daily">Daily at Shift Closing</option>
            <option value="6h">Every 6 Hours</option>
            <option value="weekly">Weekly (Sunday Midnight)</option>
          </Select>
        </SettingRow>
        <SettingRow label="Retention Period" desc="How many days to keep old backup files">
          <Select value={retentionDays} onChange={e => setRetentionDays(e.target.value)} className="w-36">
            <option value="7">7 days</option>
            <option value="14">14 days</option>
            <option value="30">30 days</option>
            <option value="90">90 days</option>
          </Select>
        </SettingRow>
        <SettingRow label="Cloud Sync Replication" desc="Encrypted off-site copy to cloud repository">
          <Toggle checked={cloudSyncEnabled} onChange={setCloudSyncEnabled} />
        </SettingRow>
      </div>

      {/* Cloud Mirror & Failure Notifications Panel */}
      <div className="bg-[#111622] border border-[#1E2638] rounded-2xl p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="font-bold text-white text-sm flex items-center gap-2">
              <HardDrive className="w-4 h-4 text-emerald-400" />
              Automated Cloud Mirror & Failure Notifications
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Offsite repository mirroring with automated failure incident logging & alert dispatch.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleTriggerCloudSync}
              disabled={cloudSyncing}
              className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold text-xs flex items-center gap-1.5 transition disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${cloudSyncing ? 'animate-spin' : ''}`} />
              <span>{cloudSyncing ? 'Syncing...' : 'Sync Cloud Now'}</span>
            </button>
            <button
              onClick={handleSimulateFailure}
              className="px-3.5 py-1.5 bg-rose-950 hover:bg-rose-900 border border-rose-800 text-rose-300 rounded-xl font-bold text-xs flex items-center gap-1.5 transition"
              title="Test Failure Notification Trigger"
            >
              <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
              <span>Test Failure Alert</span>
            </button>
          </div>
        </div>

        {/* Failure Alerts Banner */}
        {failureAlerts.length > 0 && (
          <div className="p-3.5 rounded-xl bg-rose-950/40 border border-rose-800/60 space-y-1.5">
            <div className="flex items-center gap-2 text-rose-400 text-xs font-bold">
              <AlertTriangle className="w-4 h-4 shrink-0 text-rose-500" />
              <span>Active Backup Failure Incident Notifications ({failureAlerts.length})</span>
            </div>
            {failureAlerts.slice(0, 2).map((alr: any) => (
              <div key={alr.id} className="text-[11px] text-rose-300 flex items-center justify-between pl-6">
                <span>{alr.message}</span>
                <span className="font-mono text-slate-400">{alr.timestamp ? alr.timestamp.substring(11, 19) : ''}</span>
              </div>
            ))}
          </div>
        )}

        {/* Recent Cloud Snapshots */}
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-[#0B0E14] text-slate-400 font-semibold uppercase text-[10px]">
              <tr>
                <th className="p-2.5">Snapshot ID</th>
                <th className="p-2.5">Timestamp</th>
                <th className="p-2.5">Cloud Provider</th>
                <th className="p-2.5">Records</th>
                <th className="p-2.5">Size</th>
                <th className="p-2.5 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1E2638] text-slate-200">
              {cloudHistory.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-3 text-center text-slate-500">
                    No cloud snapshots recorded yet. Click "Sync Cloud Now" above.
                  </td>
                </tr>
              ) : (
                cloudHistory.map((snap: any) => (
                  <tr key={snap.id} className="hover:bg-[#161C2C]/50 transition">
                    <td className="p-2.5 font-mono text-white font-bold">{snap.id}</td>
                    <td className="p-2.5 font-mono text-slate-400">{snap.timestamp ? snap.timestamp.replace('T', ' ').substring(0, 19) : ''}</td>
                    <td className="p-2.5 text-slate-300">{snap.provider}</td>
                    <td className="p-2.5 font-mono">{snap.recordsCount} records</td>
                    <td className="p-2.5 font-mono">{Math.round((snap.sizeBytes || 0) / 1024)} KB</td>
                    <td className="p-2.5 text-right">
                      <span className={`px-2 py-0.5 rounded font-bold text-[10px] uppercase ${snap.status === 'success' ? 'bg-emerald-950 text-emerald-400 border border-emerald-800/40' : 'bg-rose-950 text-rose-400 border border-rose-800/40'}`}>
                        {snap.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Danger Zone */}
      <div className="bg-rose-950/20 p-5 rounded-2xl border border-rose-900/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h4 className="font-bold text-rose-300 text-sm flex items-center gap-1.5">
            <AlertTriangle className="w-4 h-4 text-rose-500" /> Reset to Sample Demo Data
          </h4>
          <p className="text-xs text-rose-400/80 mt-0.5">Restores motorcycle parts catalog, demo customers (Ustad Akram), suppliers (Atlas Honda), and sample transactions.</p>
        </div>
        <button
          onClick={() => { if (confirm('Reset system database to factory sample data?')) { resetToFactoryDefaults(); alert('System reset to factory demo state.'); } }}
          className="px-4 py-2 bg-rose-700 hover:bg-rose-600 text-white font-bold text-xs rounded-xl transition shrink-0"
        >
          Reset Demo Data
        </button>
      </div>
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════
   MAIN COMPONENT
══════════════════════════════════════════════════════════════ */
export const SettingsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<SettingsTab>('general');
  const current = TAB_CONFIG.find(t => t.id === activeTab)!;

  const renderTab = () => {
    switch (activeTab) {
      case 'general':  return <GeneralSettings />;
      case 'hardware': return <HardwareSettings />;
      case 'payment':  return <PaymentSettings />;
      case 'tax':      return <TaxSettings />;
      case 'invoice':  return <InvoiceSettings />;
      case 'backup':   return <BackupSettings />;
    }
  };

  return (
    <div className="p-3 sm:p-5 md:p-6 w-full pb-28 space-y-5">
      {/* Page Header */}
      <div>
        <h1 className="text-xl font-extrabold text-white flex items-center gap-2">
          <Settings className="w-5 h-5 text-rose-500" />
          System Settings
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">Configure shop identity, hardware, payments, taxes, invoices & backup</p>
      </div>

      {/* Tab Navigation — horizontal scroll on mobile */}
      <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-hide">
        {TAB_CONFIG.map(tab => {
          const Icon  = tab.icon;
          const active = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold whitespace-nowrap transition shrink-0 ${
                active
                  ? 'bg-rose-600 text-white shadow-md shadow-rose-600/30'
                  : 'bg-[#111622] border border-[#1E2638] text-slate-400 hover:text-white hover:bg-[#1A2236]'
              }`}
            >
              <Icon className={`w-3.5 h-3.5 ${active ? 'text-white' : tab.color}`} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Active Tab Content */}
      <div>
        {renderTab()}
      </div>
    </div>
  );
};
