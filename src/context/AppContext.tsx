import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  Product, Category, Brand, SalesInvoice, PurchaseInvoice, 
  Customer, Supplier, StockAdjustment, DamagedStockRecord, 
  StockMovement, SalesReturn, Quotation, CashbookEntry, 
  ExpenseRecord, AuditLog, MarketingCampaign, ShiftClosing,
  PurchaseReturn, SmsGatewayConfig, SmsLogEntry
} from '../types';
import { 
  INITIAL_PRODUCTS, INITIAL_CATEGORIES, INITIAL_BRANDS, 
  INITIAL_CUSTOMERS, INITIAL_SUPPLIERS, INITIAL_INVOICES, 
  INITIAL_PURCHASES, INITIAL_EXPENSES, INITIAL_CASHBOOK, 
  INITIAL_AUDIT_LOGS, INITIAL_QUOTATIONS, INITIAL_CAMPAIGNS 
} from '../mock/initialData';
import { useAuth } from './AuthContext';
import { matchPartGraphic } from '../utils/imageUtils';

export interface DatabaseStatus {
  connected: boolean;
  mongoConnected: boolean;
  uri: string;
  provider: 'MongoDB Server' | 'Local Store';
  lastSync: string;
}

interface AppContextType {
  products: Product[];
  categories: Category[];
  brands: Brand[];
  customers: Customer[];
  suppliers: Supplier[];
  invoices: SalesInvoice[];
  purchases: PurchaseInvoice[];
  expenses: ExpenseRecord[];
  cashbook: CashbookEntry[];
  stockAdjustments: StockAdjustment[];
  damagedStock: DamagedStockRecord[];
  stockMovements: StockMovement[];
  salesReturns: SalesReturn[];
  purchaseReturns: PurchaseReturn[];
  quotations: Quotation[];
  auditLogs: AuditLog[];
  campaigns: MarketingCampaign[];
  shiftClosings: ShiftClosing[];
  smsLogs: SmsLogEntry[];
  smsGatewayConfig: SmsGatewayConfig;
  dbStatus: DatabaseStatus;
  
  // Product actions
  addProduct: (product: Omit<Product, 'id' | 'createdAt'>) => void;
  updateProduct: (product: Product) => void;
  archiveProduct: (id: string) => void;
  deleteProduct: (id: string) => { success: boolean; message: string };
  recordStockAdjustment: (adj: Omit<StockAdjustment, 'id' | 'timestamp'>) => void;
  approveStockAdjustment: (id: string) => void;
  rejectStockAdjustment: (id: string) => void;
  recordDamagedStock: (productId: string, qty: number, reason: string) => void;
  bulkImportProducts: (items: Partial<Product>[]) => Promise<{ importedCount: number }>;
  refreshFromDatabase: () => Promise<void>;

  // Category actions
  addCategory: (cat: Omit<Category, 'id' | 'itemCount'>) => Category;
  deleteCategory: (id: string) => { success: boolean; message: string };

  // Sales & POS actions
  completeSalesInvoice: (invoice: Omit<SalesInvoice, 'id' | 'invoiceNumber' | 'createdAt'>) => SalesInvoice;
  updateSalesInvoiceGreeting: (invoiceId: string, greeting: string) => void;
  voidSalesInvoice: (invoiceId: string, reason: string) => { success: boolean; message: string };

  // Purchase actions
  createPurchaseInvoice: (purchase: Omit<PurchaseInvoice, 'id' | 'invoiceNumber' | 'createdAt'>) => PurchaseInvoice;

  // Returns actions
  processSalesReturn: (returnRecord: Omit<SalesReturn, 'id' | 'returnNumber' | 'createdAt'>) => void;
  processPurchaseReturn: (retData: Omit<PurchaseReturn, 'id' | 'returnNumber' | 'createdAt'>) => PurchaseReturn;

  // SMS Marketing actions
  sendSms: (recipientPhone: string, recipientName: string, message: string, templateType?: any, customerId?: string) => Promise<{ success: boolean; message: string }>;
  broadcastSmsCampaign: (targetGroup: string, message: string, title: string) => Promise<{ success: boolean; count: number }>;
  updateSmsGatewayConfig: (newConfig: Partial<SmsGatewayConfig>) => void;

  // Customer actions
  addCustomer: (customer: Omit<Customer, 'id' | 'totalPurchases' | 'loyaltyPoints'>) => Customer;
  updateCustomer: (customer: Customer) => void;
  recordCustomerPayment: (customerId: string, amount: number, paymentMethod: string, notes?: string) => void;

  // Supplier actions
  addSupplier: (supplier: Omit<Supplier, 'id'>) => Supplier;
  updateSupplier: (supplier: Supplier) => void;
  recordSupplierPayment: (supplierId: string, amount: number, paymentMethod: string, notes?: string) => void;

  // Accounting actions
  addExpense: (expense: Omit<ExpenseRecord, 'id'>) => void;
  addCashbookEntry: (entry: Omit<CashbookEntry, 'id'>) => void;
  recordShiftClosing: (shift: Omit<ShiftClosing, 'id' | 'closedAt'>) => void;

  // Quotation actions
  addQuotation: (quo: Omit<Quotation, 'id' | 'quoteNumber' | 'createdAt'>) => Quotation;
  updateQuotationStatus: (id: string, status: Quotation['status']) => void;

  // Marketing actions
  addCampaign: (campaign: Omit<MarketingCampaign, 'id'>) => void;

  // Audit actions
  logAudit: (module: AuditLog['module'], action: string, details: string, severity?: AuditLog['severity']) => void;

  // Backup & Restore
  exportBackupJson: () => string;
  importBackupJson: (jsonData: string) => boolean;
  resetToFactoryDefaults: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser, currentCounter, updateCounterCash } = useAuth();

  // ─── Automated Cache Buster: Discards stale cached records from earlier versions ───
  const MOTOPRO_CACHE_VERSION = 'v5_27products_real_images_20261111';
  try {
    if (typeof window !== 'undefined' && localStorage.getItem('motopro_cache_ver') !== MOTOPRO_CACHE_VERSION) {
      localStorage.removeItem('cyberorion_products');
      localStorage.removeItem('cyberorion_categories');
      localStorage.removeItem('cyberorion_auth_user');
      localStorage.removeItem('cyberorion_users');
      localStorage.setItem('motopro_cache_ver', MOTOPRO_CACHE_VERSION);
    }
  } catch {
    // Ignore in SSR
  }

  const [products, setProducts] = useState<Product[]>(() => {
    const s = localStorage.getItem('cyberorion_products');
    if (s) {
      try {
        const parsed: Product[] = JSON.parse(s);
        return parsed;
      } catch {
        return INITIAL_PRODUCTS;
      }
    }
    return INITIAL_PRODUCTS;
  });

  const [categories, setCategories] = useState<Category[]>(() => {
    const s = localStorage.getItem('cyberorion_categories');
    return s ? JSON.parse(s) : INITIAL_CATEGORIES;
  });

  const [brands] = useState<Brand[]>(() => {
    const s = localStorage.getItem('cyberorion_brands');
    return s ? JSON.parse(s) : INITIAL_BRANDS;
  });

  const [customers, setCustomers] = useState<Customer[]>(() => {
    const s = localStorage.getItem('cyberorion_customers');
    return s ? JSON.parse(s) : INITIAL_CUSTOMERS;
  });

  const [suppliers, setSuppliers] = useState<Supplier[]>(() => {
    const s = localStorage.getItem('cyberorion_suppliers');
    return s ? JSON.parse(s) : INITIAL_SUPPLIERS;
  });

  const [invoices, setInvoices] = useState<SalesInvoice[]>(() => {
    const s = localStorage.getItem('cyberorion_invoices');
    return s ? JSON.parse(s) : INITIAL_INVOICES;
  });

  const [purchases, setPurchases] = useState<PurchaseInvoice[]>(() => {
    const s = localStorage.getItem('cyberorion_purchases');
    return s ? JSON.parse(s) : INITIAL_PURCHASES;
  });

  const [expenses, setExpenses] = useState<ExpenseRecord[]>(() => {
    const s = localStorage.getItem('cyberorion_expenses');
    return s ? JSON.parse(s) : INITIAL_EXPENSES;
  });

  const [cashbook, setCashbook] = useState<CashbookEntry[]>(() => {
    const s = localStorage.getItem('cyberorion_cashbook');
    return s ? JSON.parse(s) : INITIAL_CASHBOOK;
  });

  const [stockAdjustments, setStockAdjustments] = useState<StockAdjustment[]>(() => {
    const s = localStorage.getItem('cyberorion_stock_adj');
    return s ? JSON.parse(s) : [];
  });

  const [damagedStock, setDamagedStock] = useState<DamagedStockRecord[]>(() => {
    const s = localStorage.getItem('cyberorion_damaged_stock');
    return s ? JSON.parse(s) : [];
  });

  const [stockMovements, setStockMovements] = useState<StockMovement[]>(() => {
    const s = localStorage.getItem('cyberorion_stock_mov');
    return s ? JSON.parse(s) : [];
  });

  const [salesReturns, setSalesReturns] = useState<SalesReturn[]>(() => {
    const s = localStorage.getItem('cyberorion_sales_returns');
    return s ? JSON.parse(s) : [];
  });

  const [purchaseReturns, setPurchaseReturns] = useState<PurchaseReturn[]>(() => {
    const s = localStorage.getItem('cyberorion_purchase_returns');
    if (s) return JSON.parse(s);
    return [
      {
        id: 'PR-2026-0001',
        returnNumber: 'PR-2026-0001',
        purchaseInvoiceNumber: 'PO-2026-0045',
        supplierId: 'SUP-01',
        supplierName: 'Atlas Honda Authorized Spares Central Depot',
        returnedItems: [
          {
            productId: 'PROD-01',
            productName: 'Genuine Honda CD70 Piston Kit Standard (0.00)',
            quantity: 3,
            purchasePrice: 1650,
            total: 4950,
            reason: 'Factory defective piston ring clearance'
          }
        ],
        totalRefundAmount: 4950,
        refundMethod: 'supplier_ledger',
        returnReason: 'Defective batch with irregular ring groove tolerances',
        authorizedBy: 'Faizan Ilyas',
        createdAt: '2026-11-02 14:30'
      }
    ];
  });

  const [smsGatewayConfig, setSmsGatewayConfig] = useState<SmsGatewayConfig>(() => {
    const s = localStorage.getItem('cyberorion_sms_gateway');
    return s ? JSON.parse(s) : {
      provider: 'brand_sms',
      senderId: 'MOTOPRO',
      apiKey: 'pk_live_moto_sms_981273948',
      creditsRemaining: 3450,
      status: 'active'
    };
  });

  const [smsLogs, setSmsLogs] = useState<SmsLogEntry[]>(() => {
    const s = localStorage.getItem('cyberorion_sms_logs');
    return s ? JSON.parse(s) : [
      {
        id: 'SMS-101',
        customerId: 'CUST-002',
        customerName: 'Ustad Akram Auto Workshop',
        phoneNumber: '+92 301 7654321',
        message: 'محترم استاد اکرم صاحب! سائبر اورین موٹرسائیکل آٹو پارٹس کی طرف سے آپ کے کھاتے کا بقایا بیلنس Rs. 14,200 ہے۔ برائے مہربانی اس ہفتے اپنا کھاتہ کلیئر کروائیں۔ شکریہ!',
        templateType: 'payment_reminder',
        characterCount: 154,
        smsUnits: 1,
        status: 'delivered',
        timestamp: '2026-11-04 09:15'
      },
      {
        id: 'SMS-102',
        customerId: 'CUST-004',
        customerName: 'Tariq Autos & Service',
        phoneNumber: '+92 300 4567890',
        message: 'معزز گاہک! سائبر اورین پر اٹلس ہونڈا اور یاماہا کے نئے اوریجنل اسپیئر پارٹس کی تازہ کھیپ پہنچ چکی ہے۔ خصوصی ہول سیل ریٹس پر دستیاب ہے۔',
        templateType: 'parts_arrival',
        characterCount: 135,
        smsUnits: 1,
        status: 'delivered',
        timestamp: '2026-11-03 16:40'
      }
    ];
  });

  const [quotations, setQuotations] = useState<Quotation[]>(() => {
    const s = localStorage.getItem('cyberorion_quotations');
    return s ? JSON.parse(s) : INITIAL_QUOTATIONS;
  });

  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(() => {
    const s = localStorage.getItem('cyberorion_audit_logs');
    return s ? JSON.parse(s) : INITIAL_AUDIT_LOGS;
  });

  const [campaigns, setCampaigns] = useState<MarketingCampaign[]>(() => {
    const s = localStorage.getItem('cyberorion_campaigns');
    return s ? JSON.parse(s) : INITIAL_CAMPAIGNS;
  });

  const [shiftClosings, setShiftClosings] = useState<ShiftClosing[]>(() => {
    const s = localStorage.getItem('cyberorion_shift_closings');
    return s ? JSON.parse(s) : [];
  });

  const [dbStatus, setDbStatus] = useState<DatabaseStatus>({
    connected: false,
    mongoConnected: false,
    uri: 'mongodb://127.0.0.1:27017/motopro_pos',
    provider: 'Local Store',
    lastSync: 'Initializing...'
  });

  const refreshFromDatabase = async () => {
    try {
      const res = await fetch('/api/bootstrap');
      if (!res.ok) throw new Error('API server returned error');
      const data = await res.json();

      if (data.products && Array.isArray(data.products) && data.products.length > 0) setProducts(data.products);
      if (data.categories && Array.isArray(data.categories) && data.categories.length > 0) setCategories(data.categories);
      if (data.customers && Array.isArray(data.customers)) setCustomers(data.customers);
      if (data.suppliers && Array.isArray(data.suppliers)) setSuppliers(data.suppliers);
      if (data.invoices && Array.isArray(data.invoices)) setInvoices(data.invoices);
      if (data.purchases && Array.isArray(data.purchases)) setPurchases(data.purchases);
      if (data.expenses && Array.isArray(data.expenses)) setExpenses(data.expenses);
      if (data.cashbook && Array.isArray(data.cashbook)) setCashbook(data.cashbook);
      if (data.stockAdjustments) setStockAdjustments(data.stockAdjustments);
      if (data.damagedStock) setDamagedStock(data.damagedStock);
      if (data.salesReturns) setSalesReturns(data.salesReturns);
      if (data.purchaseReturns && Array.isArray(data.purchaseReturns)) setPurchaseReturns(data.purchaseReturns);
      if (data.smsLogs && Array.isArray(data.smsLogs)) setSmsLogs(data.smsLogs);
      if (data.smsGatewayConfig) setSmsGatewayConfig(data.smsGatewayConfig);
      if (data.quotations && Array.isArray(data.quotations)) setQuotations(data.quotations);
      if (data.auditLogs && Array.isArray(data.auditLogs)) setAuditLogs(data.auditLogs);
      if (data.campaigns && Array.isArray(data.campaigns)) setCampaigns(data.campaigns);
      if (data.shiftClosings) setShiftClosings(data.shiftClosings);

      const isMongo = data._meta?.mongoStatus?.connected ?? true;
      setDbStatus({
        connected: true,
        mongoConnected: isMongo,
        uri: data._meta?.mongoStatus?.uri || 'mongodb://127.0.0.1:27017/motopro_pos',
        provider: isMongo ? 'MongoDB Server' : 'Local Store',
        lastSync: new Date().toLocaleTimeString()
      });
    } catch (err: any) {
      console.warn('[Data Engine] Running in local offline cache mode:', err.message);
      setDbStatus(prev => ({
        ...prev,
        connected: false,
        lastSync: 'Local Cache Active'
      }));
    }
  };

  useEffect(() => {
    refreshFromDatabase();
    // Real-time two-counter synchronization interval (4s)
    const syncTimer = setInterval(() => {
      refreshFromDatabase();
    }, 4000);
    return () => clearInterval(syncTimer);
  }, []);

  // Save to localStorage
  useEffect(() => { localStorage.setItem('cyberorion_products', JSON.stringify(products)); }, [products]);
  useEffect(() => { localStorage.setItem('cyberorion_categories', JSON.stringify(categories)); }, [categories]);
  useEffect(() => { localStorage.setItem('cyberorion_customers', JSON.stringify(customers)); }, [customers]);
  useEffect(() => { localStorage.setItem('cyberorion_suppliers', JSON.stringify(suppliers)); }, [suppliers]);
  useEffect(() => { localStorage.setItem('cyberorion_invoices', JSON.stringify(invoices)); }, [invoices]);
  useEffect(() => { localStorage.setItem('cyberorion_purchases', JSON.stringify(purchases)); }, [purchases]);
  useEffect(() => { localStorage.setItem('cyberorion_expenses', JSON.stringify(expenses)); }, [expenses]);
  useEffect(() => { localStorage.setItem('cyberorion_cashbook', JSON.stringify(cashbook)); }, [cashbook]);
  useEffect(() => { localStorage.setItem('cyberorion_stock_adj', JSON.stringify(stockAdjustments)); }, [stockAdjustments]);
  useEffect(() => { localStorage.setItem('cyberorion_damaged_stock', JSON.stringify(damagedStock)); }, [damagedStock]);
  useEffect(() => { localStorage.setItem('cyberorion_stock_mov', JSON.stringify(stockMovements)); }, [stockMovements]);
  useEffect(() => { localStorage.setItem('cyberorion_sales_returns', JSON.stringify(salesReturns)); }, [salesReturns]);
  useEffect(() => { localStorage.setItem('cyberorion_purchase_returns', JSON.stringify(purchaseReturns)); }, [purchaseReturns]);
  useEffect(() => { localStorage.setItem('cyberorion_sms_gateway', JSON.stringify(smsGatewayConfig)); }, [smsGatewayConfig]);
  useEffect(() => { localStorage.setItem('cyberorion_sms_logs', JSON.stringify(smsLogs)); }, [smsLogs]);
  useEffect(() => { localStorage.setItem('cyberorion_quotations', JSON.stringify(quotations)); }, [quotations]);
  useEffect(() => { localStorage.setItem('cyberorion_audit_logs', JSON.stringify(auditLogs)); }, [auditLogs]);
  useEffect(() => { localStorage.setItem('cyberorion_campaigns', JSON.stringify(campaigns)); }, [campaigns]);
  useEffect(() => { localStorage.setItem('cyberorion_shift_closings', JSON.stringify(shiftClosings)); }, [shiftClosings]);

  const logAudit = (module: AuditLog['module'], action: string, details: string, severity: AuditLog['severity'] = 'info') => {
    const newLog: AuditLog = {
      id: `AUD-${Date.now()}`,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
      userId: currentUser.id,
      userName: currentUser.name,
      userRole: currentUser.role,
      counterName: currentCounter.name,
      module,
      action,
      severity,
      details
    };
    setAuditLogs(prev => [newLog, ...prev]);
  };

  // 1. PRODUCT & INVENTORY MANAGEMENT
  const addProduct = (p: Omit<Product, 'id' | 'createdAt'>) => {
    const newId = `PRD-${String(products.length + 1).padStart(3, '0')}`;
    const newProduct: Product = {
      ...p,
      id: newId,
      createdAt: new Date().toISOString().split('T')[0]
    };
    setProducts(prev => [newProduct, ...prev]);
    logAudit('Inventory', 'Product Created', `Added new product: ${newProduct.name} (SKU: ${newProduct.sku})`);

    // Sync to Cloud MongoDB Atlas
    fetch('/api/products', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newProduct)
    }).catch(err => console.warn('Cloud sync error on addProduct:', err));
  };

  const updateProduct = (updated: Product) => {
    setProducts(prev => prev.map(p => p.id === updated.id ? updated : p));
    logAudit('Inventory', 'Product Updated', `Updated product details: ${updated.name} (Sale Price: ${updated.salePrice})`);

    // Sync to Cloud MongoDB Atlas (includes updated image, prices, details)
    fetch(`/api/products/${updated.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updated)
    }).catch(err => console.warn('Cloud sync error on updateProduct:', err));
  };

  const archiveProduct = (id: string) => {
    setProducts(prev => prev.map(p => p.id === id ? { ...p, isArchived: !p.isArchived } : p));
    logAudit('Inventory', 'Product Archived', `Toggled archive status for Product ID: ${id}`);
  };

  const deleteProduct = (id: string): { success: boolean; message: string } => {
    // Transaction safeguard: check if product used in any invoice or purchase
    const usedInSales = invoices.some(inv => inv.items.some(i => i.product.id === id));
    const usedInPurchases = purchases.some(po => po.items.some(i => i.productId === id));

    if (usedInSales || usedInPurchases) {
      logAudit('Inventory', 'Delete Blocked', `Attempted to delete product ${id} but safeguard prevented it (used in transactions)`, 'warning');
      return {
        success: false,
        message: 'Security Safeguard: This product cannot be permanently deleted because it has recorded sales or purchase transactions. Please archive it instead to preserve financial audit history.'
      };
    }

    setProducts(prev => prev.filter(p => p.id !== id));
    logAudit('Inventory', 'Product Deleted', `Permanently deleted unused Product ID: ${id}`);

    fetch(`/api/products/${id}`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ operator: { name: currentUser.name, role: currentUser.role } })
    }).catch(err => console.warn('Delete sync error:', err));

    return { success: true, message: 'Product permanently removed.' };
  };

  const addCategory = (catData: Omit<Category, 'id' | 'itemCount'>): Category => {
    const prefix = (catData.name || 'CAT').substring(0, 3).toUpperCase().replace(/[^A-Z]/g, 'CAT');
    const newId = `CAT-${prefix}-${Date.now().toString().slice(-4)}`;
    const newCat: Category = {
      ...catData,
      id: newId,
      itemCount: 0
    };
    setCategories(prev => [...prev, newCat]);
    logAudit('Inventory', 'Category Created', `Added category: ${newCat.name} (${newCat.id})`);

    fetch('/api/categories', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ category: newCat, operator: { name: currentUser.name, role: currentUser.role } })
    }).catch(err => console.warn('Category sync error:', err));

    return newCat;
  };

  const deleteCategory = (id: string): { success: boolean; message: string } => {
    const inUse = products.some(p => p.categoryId === id);
    if (inUse) {
      logAudit('Inventory', 'Category Delete Blocked', `Category ${id} cannot be removed because products are assigned to it`, 'warning');
      return { success: false, message: 'Cannot delete category that currently has active products assigned.' };
    }
    setCategories(prev => prev.filter(c => c.id !== id));
    logAudit('Inventory', 'Category Deleted', `Deleted category ${id}`);

    fetch(`/api/categories/${id}`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ operator: { name: currentUser.name, role: currentUser.role } })
    }).catch(err => console.warn('Category delete sync error:', err));

    return { success: true, message: 'Category removed successfully.' };
  };

  const bulkImportProducts = async (items: Partial<Product>[]): Promise<{ importedCount: number }> => {
    try {
      const res = await fetch('/api/products/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items, operator: { name: currentUser.name, role: currentUser.role } })
      });
      if (res.ok) {
        const result = await res.json();
        if (result.products && Array.isArray(result.products)) {
          setProducts(prev => [...result.products, ...prev]);
        }
        logAudit('Inventory', 'Bulk Import', `Imported ${result.importedCount} products into inventory`);
        return { importedCount: result.importedCount };
      }
    } catch (e) {
      console.warn('Backend bulk import failed, processing locally', e);
    }

    // Local fallback
    const added: Product[] = [];
    items.forEach((item, idx) => {
      if (!item.name) return;
      const newId = `PRD-${String(products.length + idx + 1).padStart(3, '0')}`;
      const p: Product = {
        id: newId,
        name: item.name,
        urduName: item.urduName || '',
        sku: item.sku || `SKU-${Date.now().toString().slice(-4)}-${idx}`,
        barcode: item.barcode || `896${Math.floor(10000000 + Math.random() * 90000000)}`,
        categoryId: item.categoryId || 'CAT-ENG',
        subCategory: item.subCategory || 'General',
        brandId: item.brandId || 'BRD-GEN',
        compatibleModels: item.compatibleModels || ['Universal'],
        unit: (item.unit as any) || 'Pcs',
        purchasePrice: Number(item.purchasePrice) || 0,
        salePrice: Number(item.salePrice) || 0,
        wholesalePrice: Number(item.wholesalePrice) || Number(item.salePrice) || 0,
        mechanicPrice: Number(item.mechanicPrice) || Number(item.salePrice) || 0,
        currentStock: Number(item.currentStock) || 0,
        minStockAlert: Number(item.minStockAlert) || 5,
        location: item.location || { rack: 'A-01', shelf: '1', bin: 'BIN-01' },
        description: item.description || '',
        imageUrl: item.imageUrl || matchPartGraphic(item.name, item.categoryId),
        isArchived: false,
        damagedStock: 0,
        createdAt: new Date().toISOString().split('T')[0]
      };
      added.push(p);
    });
    setProducts(prev => [...added, ...prev]);
    logAudit('Inventory', 'Bulk Import', `Imported ${added.length} products into inventory`);
    return { importedCount: added.length };
  };

  const recordStockAdjustment = (adj: Omit<StockAdjustment, 'id' | 'timestamp'>) => {
    const newId = `ADJ-${Date.now()}`;
    const newAdj: StockAdjustment = {
      ...adj,
      id: newId,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19)
    };

    setStockAdjustments(prev => [newAdj, ...prev]);

    // If auto-approved (e.g. by owner), update stock immediately
    if (newAdj.status === 'approved') {
      setProducts(prev => prev.map(p => {
        if (p.id === newAdj.productId) {
          return { ...p, currentStock: newAdj.newStock };
        }
        return p;
      }));

      // Log movement
      const movement: StockMovement = {
        id: `MOV-${Date.now()}`,
        productId: newAdj.productId,
        productName: newAdj.productName,
        type: 'adjustment',
        quantityChange: newAdj.difference,
        stockAfter: newAdj.newStock,
        referenceNumber: newAdj.id,
        performedBy: newAdj.requestedBy,
        timestamp: newAdj.timestamp
      };
      setStockMovements(prev => [movement, ...prev]);
    }

    logAudit('Inventory', 'Stock Adjustment', `${newAdj.status.toUpperCase()}: ${newAdj.productName} adjusted by ${newAdj.difference} (${newAdj.reason})`);
  };

  const approveStockAdjustment = (id: string) => {
    const adj = stockAdjustments.find(a => a.id === id);
    if (!adj) return;

    setStockAdjustments(prev => prev.map(a => a.id === id ? { ...a, status: 'approved', approvedBy: currentUser.name } : a));
    setProducts(prev => prev.map(p => p.id === adj.productId ? { ...p, currentStock: adj.newStock } : p));

    logAudit('Inventory', 'Stock Adjustment Approved', `Approved adjustment ${id} for ${adj.productName}`);
  };

  const rejectStockAdjustment = (id: string) => {
    setStockAdjustments(prev => prev.map(a => a.id === id ? { ...a, status: 'rejected', approvedBy: currentUser.name } : a));
    logAudit('Inventory', 'Stock Adjustment Rejected', `Rejected adjustment ${id}`);
  };

  const recordDamagedStock = (productId: string, qty: number, reason: string) => {
    const prod = products.find(p => p.id === productId);
    if (!prod) return;

    const lossValue = qty * prod.purchasePrice;
    const rec: DamagedStockRecord = {
      id: `DMG-${Date.now()}`,
      productId,
      productName: prod.name,
      quantity: qty,
      lossValue,
      reason,
      recordedBy: currentUser.name,
      date: new Date().toISOString().replace('T', ' ').substring(0, 19),
      status: 'disposed'
    };

    setDamagedStock(prev => [rec, ...prev]);

    // Deduct stock and increment damaged pool
    setProducts(prev => prev.map(p => {
      if (p.id === productId) {
        return {
          ...p,
          currentStock: Math.max(0, p.currentStock - qty),
          damagedStock: (p.damagedStock || 0) + qty
        };
      }
      return p;
    }));

    logAudit('Inventory', 'Damaged Stock Recorded', `Deducted ${qty} units of ${prod.name} due to: ${reason}`);
  };

  // 3. SALES & POINT OF SALE (POS)
  const completeSalesInvoice = (invData: Omit<SalesInvoice, 'id' | 'invoiceNumber' | 'createdAt'>): SalesInvoice => {
    const nextSeq = invoices.length + 1043;
    const invoiceNumber = `INV-2026-${String(nextSeq).padStart(5, '0')}`;
    const invoiceId = invoiceNumber;
    const createdAt = new Date().toISOString().replace('T', ' ').substring(0, 16);

    const fullInvoice: SalesInvoice = {
      ...invData,
      id: invoiceId,
      invoiceNumber,
      createdAt
    };

    // 1. Add to invoices
    setInvoices(prev => [fullInvoice, ...prev]);

    // 2. Deduct inventory stock for each item & record stock movements
    setProducts(prev => prev.map(prod => {
      const soldItem = fullInvoice.items.find(i => i.product.id === prod.id);
      if (soldItem) {
        return {
          ...prod,
          currentStock: Math.max(0, prod.currentStock - soldItem.quantity)
        };
      }
      return prod;
    }));

    // 3. If customer has receivable balance or loyalty points
    if (fullInvoice.customerId) {
      setCustomers(prev => prev.map(cust => {
        if (cust.id === fullInvoice.customerId) {
          const isCredit = fullInvoice.paymentMethod === 'credit';
          const creditSplit = fullInvoice.paymentMethod === 'split' ? (fullInvoice.splitDetails?.creditAmount || 0) : 0;
          const addedBalance = isCredit ? fullInvoice.grandTotal : creditSplit;
          
          // Loyalty points: 1 pt per 100 PKR spent
          const earnedPoints = Math.floor(fullInvoice.grandTotal / 100);
          const remainingPoints = Math.max(0, cust.loyaltyPoints - (fullInvoice.pointsRedeemed || 0) + earnedPoints);

          return {
            ...cust,
            receivableBalance: cust.receivableBalance + addedBalance,
            loyaltyPoints: remainingPoints,
            totalPurchases: cust.totalPurchases + fullInvoice.grandTotal,
            lastPurchaseDate: createdAt.split(' ')[0]
          };
        }
        return cust;
      }));
    }

    // 4. Update Counter Drawer Cash
    let cashReceived = 0;
    if (fullInvoice.paymentMethod === 'cash') {
      cashReceived = fullInvoice.paidAmount - fullInvoice.changeDue;
    } else if (fullInvoice.paymentMethod === 'split') {
      cashReceived = fullInvoice.splitDetails?.cashAmount || 0;
    }
    if (cashReceived > 0) {
      updateCounterCash(fullInvoice.counterId, cashReceived);

      // Add to cashbook
      const cbEntry: CashbookEntry = {
        id: `CB-${Date.now()}`,
        counterId: fullInvoice.counterId,
        date: createdAt,
        type: 'in',
        category: 'Sales Receipt',
        amount: cashReceived,
        description: `POS Bill ${invoiceNumber} (${fullInvoice.customerName})`,
        referenceId: invoiceNumber,
        performedBy: currentUser.name
      };
      setCashbook(prev => [cbEntry, ...prev]);
    }

    logAudit('POS', 'Invoice Generated', `Created ${invoiceNumber} for Rs. ${fullInvoice.grandTotal} (${fullInvoice.paymentMethod})`);

    return fullInvoice;
  };

  const updateSalesInvoiceGreeting = (invoiceId: string, greeting: string) => {
    setInvoices(prev => prev.map(inv => inv.id === invoiceId ? { ...inv, greeting } : inv));
    logAudit('POS', 'Invoice Greeting Updated', `Updated greeting for invoice ${invoiceId}: "${greeting}"`);

    // Sync to backend if supported
    fetch(`/api/invoices/${invoiceId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ greeting })
    }).catch(err => console.warn('Cloud sync error on updateSalesInvoiceGreeting:', err));
  };

  const voidSalesInvoice = (invoiceId: string, reason: string): { success: boolean; message: string } => {
    const inv = invoices.find(i => i.id === invoiceId);
    if (!inv) return { success: false, message: 'Invoice not found.' };
    if (inv.status === 'voided') return { success: false, message: 'Invoice is already voided.' };

    // 1. Mark as voided
    setInvoices(prev => prev.map(i => i.id === invoiceId ? {
      ...i,
      status: 'voided',
      voidReason: reason,
      voidedBy: currentUser.name,
      voidedAt: new Date().toISOString().replace('T', ' ').substring(0, 16)
    } : i));

    // 2. Restore inventory stock
    setProducts(prev => prev.map(prod => {
      const returnedItem = inv.items.find(i => i.product.id === prod.id);
      if (returnedItem) {
        return {
          ...prod,
          currentStock: prod.currentStock + returnedItem.quantity
        };
      }
      return prod;
    }));

    // 3. Reverse customer balance if on credit
    if (inv.customerId && (inv.paymentMethod === 'credit' || inv.paymentMethod === 'split')) {
      const creditAmt = inv.paymentMethod === 'credit' ? inv.grandTotal : (inv.splitDetails?.creditAmount || 0);
      setCustomers(prev => prev.map(c => c.id === inv.customerId ? {
        ...c,
        receivableBalance: Math.max(0, c.receivableBalance - creditAmt),
        totalPurchases: Math.max(0, c.totalPurchases - inv.grandTotal)
      } : c));
    }

    // 4. Reverse drawer cash if cash was received
    let cashPaid = 0;
    if (inv.paymentMethod === 'cash') cashPaid = inv.grandTotal;
    if (inv.paymentMethod === 'split') cashPaid = inv.splitDetails?.cashAmount || 0;

    if (cashPaid > 0) {
      updateCounterCash(inv.counterId, -cashPaid);
      const cbEntry: CashbookEntry = {
        id: `CB-${Date.now()}`,
        counterId: inv.counterId,
        date: new Date().toISOString().replace('T', ' ').substring(0, 16),
        type: 'out',
        category: 'Sales Receipt',
        amount: cashPaid,
        description: `Voided Invoice Refund ${inv.invoiceNumber} (${reason})`,
        referenceId: inv.invoiceNumber,
        performedBy: currentUser.name
      };
      setCashbook(prev => [cbEntry, ...prev]);
    }

    logAudit('POS', 'Invoice Voided', `Voided ${inv.invoiceNumber}. Reason: ${reason}`, 'critical');
    return { success: true, message: `Invoice ${inv.invoiceNumber} successfully voided and inventory restored.` };
  };

  // 2. PURCHASE MANAGEMENT
  const createPurchaseInvoice = (pData: Omit<PurchaseInvoice, 'id' | 'invoiceNumber' | 'createdAt'>): PurchaseInvoice => {
    const nextSeq = purchases.length + 46;
    const invoiceNumber = `PO-2026-${String(nextSeq).padStart(4, '0')}`;
    const newPO: PurchaseInvoice = {
      ...pData,
      id: invoiceNumber,
      invoiceNumber,
      createdAt: new Date().toISOString().split('T')[0]
    };

    setPurchases(prev => [newPO, ...prev]);

    // Automatically increase stock
    setProducts(prev => prev.map(prod => {
      const boughtItem = newPO.items.find(i => i.productId === prod.id);
      if (boughtItem) {
        return {
          ...prod,
          currentStock: prod.currentStock + boughtItem.quantity,
          purchasePrice: boughtItem.unitCost // Update latest cost
        };
      }
      return prod;
    }));

    // Update supplier payable balance
    if (newPO.balanceDue > 0) {
      setSuppliers(prev => prev.map(s => {
        if (s.id === newPO.supplierId) {
          return {
            ...s,
            payableBalance: s.payableBalance + newPO.balanceDue
          };
        }
        return s;
      }));
    }

    // Cashbook entry if paid from cash
    if (newPO.paidAmount > 0) {
      const cbEntry: CashbookEntry = {
        id: `CB-${Date.now()}`,
        counterId: currentCounter.id,
        date: new Date().toISOString().replace('T', ' ').substring(0, 16),
        type: 'out',
        category: 'Supplier Payment',
        amount: newPO.paidAmount,
        description: `Purchase Payment for ${newPO.invoiceNumber} (${newPO.supplierName})`,
        referenceId: newPO.invoiceNumber,
        performedBy: currentUser.name
      };
      setCashbook(prev => [cbEntry, ...prev]);
      updateCounterCash(currentCounter.id, -newPO.paidAmount);
    }

    logAudit('Purchases', 'Purchase Invoice Created', `Created PO ${newPO.invoiceNumber} from ${newPO.supplierName} total: Rs. ${newPO.grandTotal}`);
    return newPO;
  };

  // 5. RETURNS & REFUNDS
  const processSalesReturn = (retData: Omit<SalesReturn, 'id' | 'returnNumber' | 'createdAt'>) => {
    const returnNumber = `RET-2026-${String(salesReturns.length + 1).padStart(4, '0')}`;
    const newReturn: SalesReturn = {
      ...retData,
      id: returnNumber,
      returnNumber,
      createdAt: new Date().toISOString().replace('T', ' ').substring(0, 16)
    };

    setSalesReturns(prev => [newReturn, ...prev]);

    // Restore stock for resalable items
    newReturn.returnedItems.forEach(item => {
      if (item.condition === 'resalable' && item.restocked) {
        setProducts(prev => prev.map(p => p.id === item.productId ? {
          ...p,
          currentStock: p.currentStock + item.quantity
        } : p));
      } else if (item.condition === 'damaged') {
        recordDamagedStock(item.productId, item.quantity, `Customer return from ${newReturn.invoiceNumber}`);
      }
    });

    // Handle refund method
    if (newReturn.refundMethod === 'cash') {
      updateCounterCash(currentCounter.id, -newReturn.totalRefundAmount);
      const cbEntry: CashbookEntry = {
        id: `CB-${Date.now()}`,
        counterId: currentCounter.id,
        date: newReturn.createdAt,
        type: 'out',
        category: 'Sales Receipt',
        amount: newReturn.totalRefundAmount,
        description: `Cash Refund on ${newReturn.returnNumber} (${newReturn.invoiceNumber})`,
        referenceId: newReturn.returnNumber,
        performedBy: currentUser.name
      };
      setCashbook(prev => [cbEntry, ...prev]);
    } else if (newReturn.refundMethod === 'credit_to_ledger' && newReturn.customerId) {
      setCustomers(prev => prev.map(c => c.id === newReturn.customerId ? {
        ...c,
        receivableBalance: Math.max(0, c.receivableBalance - newReturn.totalRefundAmount)
      } : c));
    }

    logAudit('Returns', 'Sales Return Processed', `Return ${returnNumber} processed for invoice ${newReturn.invoiceNumber} amount: Rs. ${newReturn.totalRefundAmount}`);
  };

  const processPurchaseReturn = (retData: Omit<PurchaseReturn, 'id' | 'returnNumber' | 'createdAt'>): PurchaseReturn => {
    const returnNumber = `PR-2026-${String(purchaseReturns.length + 1).padStart(4, '0')}`;
    const newReturn: PurchaseReturn = {
      ...retData,
      id: returnNumber,
      returnNumber,
      createdAt: new Date().toISOString().replace('T', ' ').substring(0, 16)
    };

    setPurchaseReturns(prev => [newReturn, ...prev]);

    // 1. Deduct stock from inventory (items return back to supplier)
    newReturn.returnedItems.forEach(item => {
      setProducts(prev => prev.map(p => p.id === item.productId ? {
        ...p,
        currentStock: Math.max(0, p.currentStock - item.quantity)
      } : p));

      const movement: StockMovement = {
        id: `MOV-${Date.now()}-${item.productId}`,
        productId: item.productId,
        productName: item.productName,
        type: 'return_out',
        quantityChange: -item.quantity,
        stockAfter: 0,
        referenceNumber: returnNumber,
        performedBy: currentUser?.name || 'Authorized User',
        timestamp: newReturn.createdAt
      };
      setStockMovements(prev => [movement, ...prev]);
    });

    // 2. Adjust supplier balance or counter cash
    if (newReturn.refundMethod === 'supplier_ledger' && newReturn.supplierId) {
      setSuppliers(prev => prev.map(s => s.id === newReturn.supplierId ? {
        ...s,
        payableBalance: Math.max(0, s.payableBalance - newReturn.totalRefundAmount)
      } : s));
    } else if (newReturn.refundMethod === 'cash') {
      updateCounterCash(currentCounter.id, newReturn.totalRefundAmount);
      const cbEntry: CashbookEntry = {
        id: `CB-${Date.now()}`,
        counterId: currentCounter.id,
        date: newReturn.createdAt,
        type: 'in',
        category: 'Supplier Refund',
        amount: newReturn.totalRefundAmount,
        description: `Cash refund from Supplier Return ${newReturn.returnNumber} (${newReturn.supplierName})`,
        referenceId: newReturn.returnNumber,
        performedBy: currentUser?.name || 'Authorized User'
      };
      setCashbook(prev => [cbEntry, ...prev]);
    }

    logAudit('Purchases', 'Purchase Return Processed', `Purchase Return ${returnNumber} to ${newReturn.supplierName} amount: Rs. ${newReturn.totalRefundAmount}`);

    // Send to backend API
    fetch('/api/purchase-returns', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newReturn)
    }).catch(e => console.error(e));

    return newReturn;
  };

  // SMS Marketing
  const sendSms = async (
    recipientPhone: string,
    recipientName: string,
    message: string,
    templateType: any = 'custom',
    customerId?: string
  ): Promise<{ success: boolean; message: string }> => {
    const chars = message.length;
    const units = Math.ceil(chars / 160) || 1;
    const newEntry: SmsLogEntry = {
      id: `SMS-${Date.now()}`,
      customerId,
      customerName: recipientName,
      phoneNumber: recipientPhone,
      message,
      templateType,
      characterCount: chars,
      smsUnits: units,
      status: 'delivered',
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16)
    };

    setSmsLogs(prev => [newEntry, ...prev]);
    setSmsGatewayConfig(prev => ({
      ...prev,
      creditsRemaining: Math.max(0, prev.creditsRemaining - units)
    }));

    logAudit('Marketing', 'SMS Sent', `Sent ${units} SMS unit(s) to ${recipientName} (${recipientPhone})`);

    try {
      await fetch('/api/sms/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ recipientPhone, recipientName, message, templateType, customerId })
      });
    } catch (e) {
      console.warn('Offline mode for SMS send');
    }

    return { success: true, message: `SMS sent successfully to ${recipientPhone}` };
  };

  const broadcastSmsCampaign = async (
    targetGroup: string,
    message: string,
    title: string
  ): Promise<{ success: boolean; count: number }> => {
    let target = customers;
    const lower = targetGroup.toLowerCase();
    if (lower.includes('mechanic')) {
      target = customers.filter(c => c.group === 'Mechanic');
    } else if (lower.includes('debtor')) {
      target = customers.filter(c => c.receivableBalance > 0);
    } else if (lower.includes('vip') || lower.includes('loyalty')) {
      target = customers.filter(c => (c.loyaltyPoints || 0) >= 50);
    } else if (lower.includes('cd70') || lower.includes('cd 70')) {
      target = customers.filter(c => c.bikeModel && c.bikeModel.toLowerCase().includes('cd70'));
    } else if (lower.includes('cg125') || lower.includes('cg 125') || lower.includes('125')) {
      target = customers.filter(c => c.bikeModel && c.bikeModel.toLowerCase().includes('125'));
    } else if (lower.includes('ybr')) {
      target = customers.filter(c => c.bikeModel && c.bikeModel.toLowerCase().includes('ybr'));
    } else if (lower.includes('gs150') || lower.includes('gs 150')) {
      target = customers.filter(c => c.bikeModel && c.bikeModel.toLowerCase().includes('gs'));
    } else if (lower.includes('repeat')) {
      target = customers.filter(c => (c.totalPurchases && c.totalPurchases > 10000) || (c.loyaltyPoints && c.loyaltyPoints > 20));
    }

    const unitsPerMsg = Math.ceil(message.length / 160) || 1;
    const totalUnits = target.length * unitsPerMsg;

    const newEntries: SmsLogEntry[] = target.map(c => {
      const personalized = message
        .replace('{customer_name}', c.name)
        .replace('{due_amount}', c.receivableBalance ? c.receivableBalance.toLocaleString() : '0');

      return {
        id: `SMS-${Date.now()}-${c.id}`,
        customerId: c.id,
        customerName: c.name,
        phoneNumber: c.phone,
        message: personalized,
        templateType: 'offer',
        characterCount: personalized.length,
        smsUnits: unitsPerMsg,
        status: 'delivered',
        timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16)
      };
    });

    setSmsLogs(prev => [...newEntries, ...prev]);
    setSmsGatewayConfig(prev => ({
      ...prev,
      creditsRemaining: Math.max(0, prev.creditsRemaining - totalUnits)
    }));

    logAudit('Marketing', 'Bulk SMS Broadcast', `Broadcast campaign "${title}" to ${target.length} recipients`);

    try {
      await fetch('/api/sms/broadcast', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ targetGroup, message, title })
      });
    } catch (e) {
      console.warn('Offline mode for SMS broadcast');
    }

    return { success: true, count: target.length };
  };

  const updateSmsGatewayConfig = (newConfig: Partial<SmsGatewayConfig>) => {
    setSmsGatewayConfig(prev => ({ ...prev, ...newConfig }));
    fetch('/api/sms/gateway', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newConfig)
    }).catch(e => console.error(e));
  };

  // 6. CUSTOMER MANAGEMENT
  const addCustomer = (c: Omit<Customer, 'id' | 'totalPurchases' | 'loyaltyPoints'>): Customer => {
    const newId = `CUST-${String(customers.length + 1).padStart(3, '0')}`;
    const newCust: Customer = {
      ...c,
      id: newId,
      totalPurchases: 0,
      loyaltyPoints: 0,
      loyaltyTier: 'Bronze'
    };
    setCustomers(prev => [...prev, newCust]);
    logAudit('Customers', 'Customer Added', `Registered customer: ${newCust.name} (${newCust.group})`);
    return newCust;
  };

  const updateCustomer = (updated: Customer) => {
    setCustomers(prev => prev.map(c => c.id === updated.id ? updated : c));
    logAudit('Customers', 'Customer Updated', `Updated customer: ${updated.name}`);
  };

  const recordCustomerPayment = (customerId: string, amount: number, paymentMethod: string, notes?: string) => {
    const cust = customers.find(c => c.id === customerId);
    if (!cust) return;

    setCustomers(prev => prev.map(c => c.id === customerId ? {
      ...c,
      receivableBalance: Math.max(0, c.receivableBalance - amount)
    } : c));

    if (paymentMethod === 'cash') {
      updateCounterCash(currentCounter.id, amount);
      const cbEntry: CashbookEntry = {
        id: `CB-${Date.now()}`,
        counterId: currentCounter.id,
        date: new Date().toISOString().replace('T', ' ').substring(0, 16),
        type: 'in',
        category: 'Customer Payment',
        amount,
        description: `Customer Debt Settlement from ${cust.name} ${notes ? `(${notes})` : ''}`,
        referenceId: cust.id,
        performedBy: currentUser.name
      };
      setCashbook(prev => [cbEntry, ...prev]);
    }

    logAudit('Customers', 'Payment Received', `Received Rs. ${amount} from ${cust.name} (${paymentMethod})`);
  };

  // 7. SUPPLIER MANAGEMENT
  const addSupplier = (s: Omit<Supplier, 'id'>): Supplier => {
    const newId = `SUP-${String(suppliers.length + 1).padStart(2, '0')}`;
    const newSup: Supplier = { ...s, id: newId };
    setSuppliers(prev => [...prev, newSup]);
    logAudit('Suppliers', 'Supplier Added', `Registered supplier: ${newSup.companyName}`);
    return newSup;
  };

  const updateSupplier = (updated: Supplier) => {
    setSuppliers(prev => prev.map(s => s.id === updated.id ? updated : s));
    logAudit('Suppliers', 'Supplier Updated', `Updated supplier: ${updated.companyName}`);
  };

  const recordSupplierPayment = (supplierId: string, amount: number, paymentMethod: string, notes?: string) => {
    const sup = suppliers.find(s => s.id === supplierId);
    if (!sup) return;

    setSuppliers(prev => prev.map(s => s.id === supplierId ? {
      ...s,
      payableBalance: Math.max(0, s.payableBalance - amount)
    } : s));

    // Automated FIFO allocation across pending purchase invoices
    let remainingAmount = amount;
    setPurchases(prev => prev.map(p => {
      if (p.supplierId !== supplierId || p.paymentStatus === 'paid' || remainingAmount <= 0) {
        return p;
      }
      const due = p.balanceDue ?? (p.grandTotal - (p.paidAmount || 0));
      if (due <= 0) return p;
      const payForThis = Math.min(due, remainingAmount);
      remainingAmount -= payForThis;
      const newPaid = (p.paidAmount || 0) + payForThis;
      const newDue = Math.max(0, p.grandTotal - newPaid);
      return {
        ...p,
        paidAmount: newPaid,
        balanceDue: newDue,
        paymentStatus: newDue === 0 ? 'paid' : 'partial'
      };
    }));

    if (paymentMethod === 'cash') {
      updateCounterCash(currentCounter.id, -amount);
      const cbEntry: CashbookEntry = {
        id: `CB-${Date.now()}`,
        counterId: currentCounter.id,
        date: new Date().toISOString().replace('T', ' ').substring(0, 16),
        type: 'out',
        category: 'Supplier Payment',
        amount,
        description: `Supplier settlement to ${sup.companyName} ${notes ? `(${notes})` : ''}`,
        referenceId: sup.id,
        performedBy: currentUser.name
      };
      setCashbook(prev => [cbEntry, ...prev]);
    }

    logAudit('Suppliers', 'Supplier Payment Made', `Paid Rs. ${amount} to ${sup.companyName} via ${paymentMethod}`);
  };

  // 8. ACCOUNTING & FINANCIAL MANAGEMENT
  const addExpense = (exp: Omit<ExpenseRecord, 'id'>) => {
    const newId = `EXP-${Date.now()}`;
    const newExp: ExpenseRecord = { ...exp, id: newId };
    setExpenses(prev => [newExp, ...prev]);

    // Deduct counter cash
    updateCounterCash(newExp.paidFromCounter, -newExp.amount);

    const cbEntry: CashbookEntry = {
      id: `CB-${Date.now()}`,
      counterId: newExp.paidFromCounter,
      date: newExp.date,
      type: 'out',
      category: 'Expense',
      amount: newExp.amount,
      description: `${newExp.category} (${newExp.notes || 'Expense'})`,
      referenceId: newExp.receiptVoucherNo,
      performedBy: newExp.paidBy
    };
    setCashbook(prev => [cbEntry, ...prev]);

    logAudit('Accounting', 'Expense Recorded', `Logged expense Rs. ${newExp.amount} for ${newExp.category}`);
  };

  const addCashbookEntry = (entry: Omit<CashbookEntry, 'id'>) => {
    const newEntry: CashbookEntry = { ...entry, id: `CB-${Date.now()}` };
    setCashbook(prev => [newEntry, ...prev]);
    logAudit('Accounting', 'Cashbook Entry Added', `${entry.type.toUpperCase()}: Rs. ${entry.amount} - ${entry.description}`);
  };

  const recordShiftClosing = (shift: Omit<ShiftClosing, 'id' | 'closedAt'>) => {
    const newClosing: ShiftClosing = {
      ...shift,
      id: `CLS-${Date.now()}`,
      closedAt: new Date().toISOString().replace('T', ' ').substring(0, 19)
    };
    setShiftClosings(prev => [newClosing, ...prev]);
    logAudit('Accounting', 'Counter Shift Closed', `Counter ${shift.counterName} closed by ${shift.cashierName}. Status: ${shift.status} (Discrepancy: ${shift.discrepancy})`);
  };

  // 10. ESTIMATES & QUOTATIONS
  const addQuotation = (q: Omit<Quotation, 'id' | 'quoteNumber' | 'createdAt'>): Quotation => {
    const nextSeq = quotations.length + 19;
    const quoteNumber = `QUO-2026-${String(nextSeq).padStart(4, '0')}`;
    const newQuote: Quotation = {
      ...q,
      id: quoteNumber,
      quoteNumber,
      createdAt: new Date().toISOString().split('T')[0]
    };
    setQuotations(prev => [newQuote, ...prev]);
    logAudit('Quotations', 'Quotation Created', `Created ${quoteNumber} for ${newQuote.customerName} (Rs. ${newQuote.grandTotal})`);
    return newQuote;
  };

  const updateQuotationStatus = (id: string, status: Quotation['status']) => {
    setQuotations(prev => prev.map(q => q.id === id ? { ...q, status } : q));
    logAudit('Quotations', 'Quotation Status Updated', `Quote ${id} status set to ${status}`);
  };

  // 11. MARKETING
  const addCampaign = (cmp: Omit<MarketingCampaign, 'id'>) => {
    const newId = `CMP-${String(campaigns.length + 1).padStart(2, '0')}`;
    const newCamp: MarketingCampaign = { ...cmp, id: newId };
    setCampaigns(prev => [newCamp, ...prev]);
    logAudit('Settings', 'Campaign Created', `Created campaign: ${newCamp.title}`);
  };

  // 18. BACKUP & RESTORE
  const exportBackupJson = (): string => {
    const backupState = {
      version: '1.0',
      system: 'CYBERORION MOTORCYCLE POS',
      timestamp: new Date().toISOString(),
      products,
      categories,
      brands,
      customers,
      suppliers,
      invoices,
      purchases,
      expenses,
      cashbook,
      stockAdjustments,
      damagedStock,
      stockMovements,
      salesReturns,
      quotations,
      auditLogs,
      campaigns,
      shiftClosings
    };
    logAudit('Settings', 'Database Backup Exported', 'Full JSON database snapshot exported by user');
    return JSON.stringify(backupState, null, 2);
  };

  const importBackupJson = (jsonData: string): boolean => {
    try {
      const parsed = JSON.parse(jsonData);
      if (!parsed.products || !parsed.invoices) {
        throw new Error('Invalid backup schema');
      }
      if (parsed.products) setProducts(parsed.products);
      if (parsed.customers) setCustomers(parsed.customers);
      if (parsed.suppliers) setSuppliers(parsed.suppliers);
      if (parsed.invoices) setInvoices(parsed.invoices);
      if (parsed.purchases) setPurchases(parsed.purchases);
      if (parsed.expenses) setExpenses(parsed.expenses);
      if (parsed.cashbook) setCashbook(parsed.cashbook);
      if (parsed.stockAdjustments) setStockAdjustments(parsed.stockAdjustments);
      if (parsed.damagedStock) setDamagedStock(parsed.damagedStock);
      if (parsed.salesReturns) setSalesReturns(parsed.salesReturns);
      if (parsed.quotations) setQuotations(parsed.quotations);
      if (parsed.auditLogs) setAuditLogs(parsed.auditLogs);
      if (parsed.campaigns) setCampaigns(parsed.campaigns);
      if (parsed.shiftClosings) setShiftClosings(parsed.shiftClosings);

      logAudit('Settings', 'Database Restored', 'Database state restored from uploaded JSON backup', 'warning');
      return true;
    } catch (err) {
      console.error(err);
      return false;
    }
  };

  const resetToFactoryDefaults = () => {
    setProducts(INITIAL_PRODUCTS);
    setCustomers(INITIAL_CUSTOMERS);
    setSuppliers(INITIAL_SUPPLIERS);
    setInvoices(INITIAL_INVOICES);
    setPurchases(INITIAL_PURCHASES);
    setExpenses(INITIAL_EXPENSES);
    setCashbook(INITIAL_CASHBOOK);
    setStockAdjustments([]);
    setDamagedStock([]);
    setStockMovements([]);
    setSalesReturns([]);
    setQuotations(INITIAL_QUOTATIONS);
    setAuditLogs(INITIAL_AUDIT_LOGS);
    setCampaigns(INITIAL_CAMPAIGNS);
    setShiftClosings([]);
    logAudit('Settings', 'Factory Reset', 'Restored initial sample motorcycle shop dataset', 'critical');
  };

  return (
    <AppContext.Provider value={{
      products,
      categories,
      brands,
      customers,
      suppliers,
      invoices,
      purchases,
      expenses,
      cashbook,
      stockAdjustments,
      damagedStock,
      stockMovements,
      salesReturns,
      purchaseReturns,
      quotations,
      auditLogs,
      campaigns,
      shiftClosings,
      smsLogs,
      smsGatewayConfig,
      dbStatus,
      refreshFromDatabase,
      bulkImportProducts,
      addProduct,
      updateProduct,
      archiveProduct,
      deleteProduct,
      addCategory,
      deleteCategory,
      recordStockAdjustment,
      approveStockAdjustment,
      rejectStockAdjustment,
      recordDamagedStock,
      completeSalesInvoice,
      updateSalesInvoiceGreeting,
      voidSalesInvoice,
      createPurchaseInvoice,
      processSalesReturn,
      processPurchaseReturn,
      sendSms,
      broadcastSmsCampaign,
      updateSmsGatewayConfig,
      addCustomer,
      updateCustomer,
      recordCustomerPayment,
      addSupplier,
      updateSupplier,
      recordSupplierPayment,
      addExpense,
      addCashbookEntry,
      recordShiftClosing,
      addQuotation,
      updateQuotationStatus,
      addCampaign,
      logAudit,
      exportBackupJson,
      importBackupJson,
      resetToFactoryDefaults
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
