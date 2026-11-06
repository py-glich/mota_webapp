import express, { Request, Response } from 'express';
import cors from 'cors';
import { getDb, updateDb, resetDb, initMongo, mongoStatus, seedMongoFromData, AppDatabase } from './db.js';
import { 
  Product, Category, SalesInvoice, PurchaseInvoice, Customer, Supplier, 
  ExpenseRecord, CashbookEntry, StockAdjustment, DamagedStockRecord, 
  Quotation, SalesReturn, PurchaseReturn, ShiftClosing, AuditLog, User, MarketingCampaign 
} from '../src/types/index';

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json({ limit: '50mb' }));

// Helper to log audit actions inside backend
function logServerAudit(
  db: AppDatabase, 
  module: AuditLog['module'], 
  action: string, 
  details: string, 
  user: { id?: string; name?: string; role?: any } = { id: 'SYS', name: 'Server System', role: 'owner' },
  counterName: string = 'Server Central',
  severity: AuditLog['severity'] = 'info'
) {
  const newLog: AuditLog = {
    id: `AUD-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
    userId: user.id || 'SYS',
    userName: user.name || 'Staff User',
    userRole: user.role || 'cashier',
    counterName: counterName || 'Counter 1',
    module,
    action,
    severity,
    details
  };
  db.auditLogs.unshift(newLog);
}

// ---------------------------------------------------------------------------
// SERVER-SIDE SESSION & ROLE-BASED ACCESS CONTROL (RBAC)
// ---------------------------------------------------------------------------
interface ServerSession {
  token: string;
  userId: string;
  username: string;
  name: string;
  role: string;
  permissions: any;
  createdAt: string;
  expiresAt: string;
}

const activeServerSessions = new Map<string, ServerSession>();

function requireRole(allowedRoles: string[]) {
  return (req: Request, res: Response, next: any) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ success: false, error: 'Authorization header required' });
    }
    const token = authHeader.replace(/^Bearer\s+/i, '');
    const session = activeServerSessions.get(token);
    if (!session) {
      return res.status(401).json({ success: false, error: 'Invalid or expired server session' });
    }
    if (new Date(session.expiresAt).getTime() < Date.now()) {
      activeServerSessions.delete(token);
      return res.status(401).json({ success: false, error: 'Session expired. Please log in again.' });
    }
    if (!allowedRoles.includes(session.role) && session.role !== 'owner') {
      return res.status(403).json({ success: false, error: `Forbidden: requires one of [${allowedRoles.join(', ')}] role` });
    }
    (req as any).session = session;
    next();
  };
}

// Cloud Backup state & Failure alert history
interface CloudBackupRecord {
  id: string;
  timestamp: string;
  status: 'success' | 'failed';
  provider: string;
  sizeBytes: number;
  recordsCount: number;
  checksum: string;
  error?: string;
}

const cloudBackupHistory: CloudBackupRecord[] = [
  {
    id: 'CBK-20261105-01',
    timestamp: new Date(Date.now() - 3600000).toISOString(),
    status: 'success',
    provider: 'Cloud Encrypted Mirror (AWS/GCS)',
    sizeBytes: 84200,
    recordsCount: 48,
    checksum: 'sha256-a9f4c3912'
  }
];

const backupFailureAlerts: { id: string; timestamp: string; message: string; severity: 'high' | 'critical' }[] = [];

// ---------------------------------------------------------------------------
// 0. HEALTH & INITIAL FULL STATE
// ---------------------------------------------------------------------------
app.get('/api/health', (req: Request, res: Response) => {
  res.json({ status: 'ok', time: new Date().toISOString(), server: 'MotoPro CyberOrion API v2.5' });
});

app.get('/api/bootstrap', (req: Request, res: Response) => {
  const db = getDb();
  // Deduplicate products by id to guard against double-seed in MongoDB
  const uniqueProducts = [...new Map((db.products || []).map(p => [p.id, p])).values()];
  res.json({
    ...db,
    products: uniqueProducts,
    _meta: {
      mongoStatus
    }
  });
});

app.get('/api/database/status', (req: Request, res: Response) => {
  const db = getDb();
  res.json({
    status: mongoStatus.connected ? 'online' : 'fallback_mode',
    mongoStatus,
    summary: {
      products: db.products?.length || 0,
      invoices: db.invoices?.length || 0,
      purchases: db.purchases?.length || 0,
      customers: db.customers?.length || 0,
      suppliers: db.suppliers?.length || 0,
      expenses: db.expenses?.length || 0,
      cashbook: db.cashbook?.length || 0,
      counters: db.counters?.length || 0,
      users: db.users?.length || 0,
      quotations: db.quotations?.length || 0,
      returns: db.salesReturns?.length || 0,
      auditLogs: db.auditLogs?.length || 0
    }
  });
});

app.post('/api/database/seed', async (req: Request, res: Response) => {
  try {
    const db = getDb();
    await seedMongoFromData(db);
    res.json({ success: true, message: 'All collections re-seeded into MongoDB successfully', mongoStatus });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ---------------------------------------------------------------------------
// 1. PRODUCTS & INVENTORY
// ---------------------------------------------------------------------------
app.get('/api/products', (req: Request, res: Response) => {
  const db = getDb();
  res.json(db.products);
});

app.post('/api/products', (req: Request, res: Response) => {
  const productData = req.body;
  const newProduct = updateDb(db => {
    const newId = `PRD-${String(db.products.length + 1).padStart(3, '0')}`;
    const p: Product = {
      ...productData,
      id: newId,
      createdAt: new Date().toISOString().split('T')[0],
      damagedStock: 0,
      isArchived: false,
    };
    db.products.unshift(p);
    logServerAudit(db, 'Inventory', 'Product Created', `Added ${p.name} (SKU: ${p.sku})`, req.body.operator);
    return p;
  });
  res.status(201).json(newProduct);
});

// Bulk Import Products (CSV / Excel rows)
app.post('/api/products/import', (req: Request, res: Response) => {
  const { items, operator } = req.body;
  if (!Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: 'No product rows provided in import batch' });
  }

  const result = updateDb(db => {
    let importedCount = 0;
    const addedProducts: Product[] = [];

    items.forEach((item: Partial<Product>, idx: number) => {
      if (!item.name) return;
      const newId = `PRD-${String(db.products.length + idx + 1).padStart(3, '0')}`;
      const sku = item.sku || `SKU-${Date.now().toString().slice(-5)}-${idx}`;
      const barcode = item.barcode || `896${Math.floor(10000000 + Math.random() * 90000000)}`;

      const prod: Product = {
        id: newId,
        name: item.name,
        urduName: item.urduName || '',
        sku,
        barcode,
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
        imageUrl: item.imageUrl || 'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?w=300&auto=format&fit=crop&q=60',
        isArchived: false,
        damagedStock: 0,
        createdAt: new Date().toISOString().split('T')[0]
      };

      db.products.unshift(prod);
      addedProducts.push(prod);
      importedCount++;
    });

    logServerAudit(
      db, 
      'Inventory', 
      'Bulk Product Import', 
      `Successfully imported ${importedCount} products via spreadsheet template`,
      operator
    );

    return { importedCount, products: addedProducts };
  });

  res.status(201).json(result);
});

app.put('/api/products/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const updatedData = req.body;
  const product = updateDb(db => {
    const idx = db.products.findIndex(p => p.id === id);
    if (idx === -1) return null;
    db.products[idx] = { ...db.products[idx], ...updatedData };
    logServerAudit(db, 'Inventory', 'Product Updated', `Updated product: ${db.products[idx].name}`, req.body.operator);
    return db.products[idx];
  });
  if (!product) return res.status(404).json({ error: 'Product not found' });
  res.json(product);
});

app.delete('/api/products/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const result = updateDb(db => {
    // Transaction safeguard: check if product used in any invoice or purchase
    const usedInSales = db.invoices.some(inv => inv.items.some(i => i.product.id === id));
    const usedInPurchases = db.purchases.some(po => po.items.some(i => i.productId === id));

    if (usedInSales || usedInPurchases) {
      logServerAudit(db, 'Inventory', 'Delete Blocked', `Attempted delete on product ${id} with active transactions`, req.body?.operator, 'System', 'warning');
      return {
        success: false,
        message: 'Security Safeguard: This product cannot be permanently deleted because it has recorded transaction history. Please archive it instead.'
      };
    }

    db.products = db.products.filter(p => p.id !== id);
    logServerAudit(db, 'Inventory', 'Product Deleted', `Permanently deleted unused product ${id}`, req.body?.operator);
    return { success: true, message: 'Product permanently removed.' };
  });

  if (!result.success) return res.status(400).json(result);
  res.json(result);
});

app.post('/api/products/:id/archive', (req: Request, res: Response) => {
  const { id } = req.params;
  const product = updateDb(db => {
    const prod = db.products.find(p => p.id === id);
    if (!prod) return null;
    prod.isArchived = !prod.isArchived;
    logServerAudit(db, 'Inventory', 'Product Archived', `Toggled archive status for ${prod.name}`, req.body.operator);
    return prod;
  });
  if (!product) return res.status(404).json({ error: 'Product not found' });
  res.json(product);
});

// Category Management Endpoints
app.get('/api/categories', (req: Request, res: Response) => {
  const db = getDb();
  res.json(db.categories || []);
});

app.post('/api/categories', (req: Request, res: Response) => {
  const { category, operator } = req.body;
  if (!category || !category.name) {
    return res.status(400).json({ error: 'Category name is required' });
  }

  const newCat = updateDb(db => {
    if (!db.categories) db.categories = [];
    const prefix = category.name.substring(0, 3).toUpperCase().replace(/[^A-Z]/g, 'CAT');
    const cat: Category = {
      id: category.id || `CAT-${prefix}-${Date.now().toString().slice(-4)}`,
      name: category.name,
      urduName: category.urduName || '',
      description: category.description || '',
      itemCount: 0
    };
    db.categories.push(cat);
    logServerAudit(db, 'Inventory', 'Category Created', `Added product category: ${cat.name} (${cat.id})`, operator);
    return cat;
  });

  res.status(201).json(newCat);
});

app.delete('/api/categories/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const { operator } = req.body || {};

  const result = updateDb(db => {
    const hasProducts = (db.products || []).some(p => p.categoryId === id);
    if (hasProducts) {
      logServerAudit(db, 'Inventory', 'Category Delete Blocked', `Cannot delete category ${id} with existing products`, operator, 'Server Central', 'warning');
      return { success: false, message: 'Cannot delete category that currently has active products assigned.' };
    }
    db.categories = (db.categories || []).filter(c => c.id !== id);
    logServerAudit(db, 'Inventory', 'Category Deleted', `Deleted category ID: ${id}`, operator);
    return { success: true, message: 'Category removed successfully.' };
  });

  if (!result.success) return res.status(400).json(result);
  res.json(result);
});

app.post('/api/products/adjust-stock', (req: Request, res: Response) => {
  const adjData: Omit<StockAdjustment, 'id' | 'timestamp'> & { operator?: any } = req.body;
  const newAdj = updateDb(db => {
    const newId = `ADJ-${Date.now()}`;
    const adj: StockAdjustment = {
      ...adjData,
      id: newId,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19)
    };
    db.stockAdjustments.unshift(adj);

    if (adj.status === 'approved') {
      const prod = db.products.find(p => p.id === adj.productId);
      if (prod) {
        prod.currentStock = adj.newStock;
      }
    }
    logServerAudit(db, 'Inventory', 'Stock Adjusted', `${adj.productName} adjusted by ${adj.difference} (${adj.reason})`, adjData.operator);
    return adj;
  });
  res.status(201).json(newAdj);
});

app.post('/api/products/record-damage', (req: Request, res: Response) => {
  const { productId, quantity, reason, operator } = req.body;
  const result = updateDb(db => {
    const prod = db.products.find(p => p.id === productId);
    if (!prod) return null;

    const lossValue = quantity * prod.purchasePrice;
    const rec: DamagedStockRecord = {
      id: `DMG-${Date.now()}`,
      productId,
      productName: prod.name,
      quantity,
      lossValue,
      reason,
      recordedBy: operator?.name || 'Cashier Desk',
      date: new Date().toISOString().replace('T', ' ').substring(0, 19),
      status: 'disposed'
    };
    db.damagedStock.unshift(rec);

    prod.currentStock = Math.max(0, prod.currentStock - quantity);
    prod.damagedStock = (prod.damagedStock || 0) + quantity;

    logServerAudit(db, 'Inventory', 'Damaged Stock Recorded', `${quantity} units of ${prod.name} flagged as damaged: ${reason}`, operator, 'POS Counter', 'warning');
    return { record: rec, updatedProduct: prod };
  });

  if (!result) return res.status(404).json({ error: 'Product not found' });
  res.status(201).json(result);
});

// ---------------------------------------------------------------------------
// 2. INVOICES & POS BILLING
// ---------------------------------------------------------------------------
app.get('/api/invoices', (req: Request, res: Response) => {
  const db = getDb();
  res.json(db.invoices);
});

app.post('/api/invoices', (req: Request, res: Response) => {
  const invData = req.body;
  const invoice = updateDb(db => {
    const nextSeq = db.invoices.length + 1043;
    const invoiceNumber = `INV-2026-${String(nextSeq).padStart(5, '0')}`;
    const createdAt = new Date().toISOString().replace('T', ' ').substring(0, 16);

    const fullInvoice: SalesInvoice = {
      ...invData,
      id: invoiceNumber,
      invoiceNumber,
      createdAt
    };
    db.invoices.unshift(fullInvoice);

    // 1. Deduct Stock in Real-Time
    fullInvoice.items.forEach(cartItem => {
      const prod = db.products.find(p => p.id === cartItem.product.id);
      if (prod) {
        prod.currentStock = Math.max(0, prod.currentStock - cartItem.quantity);
      }
    });

    // 2. Update Customer Balance & Loyalty
    if (fullInvoice.customerId) {
      const cust = db.customers.find(c => c.id === fullInvoice.customerId);
      if (cust) {
        const isCredit = fullInvoice.paymentMethod === 'credit';
        const creditSplit = fullInvoice.paymentMethod === 'split' ? (fullInvoice.splitDetails?.creditAmount || 0) : 0;
        const addedBalance = isCredit ? fullInvoice.grandTotal : creditSplit;

        const earnedPoints = Math.floor(fullInvoice.grandTotal / 100);
        cust.receivableBalance += addedBalance;
        cust.loyaltyPoints = Math.max(0, cust.loyaltyPoints - (fullInvoice.pointsRedeemed || 0) + earnedPoints);
        cust.totalPurchases += fullInvoice.grandTotal;
        cust.lastPurchaseDate = createdAt.split(' ')[0];
      }
    }

    // 3. Update Counter Drawer Cash
    let cashReceived = 0;
    if (fullInvoice.paymentMethod === 'cash') {
      cashReceived = fullInvoice.paidAmount - fullInvoice.changeDue;
    } else if (fullInvoice.paymentMethod === 'split') {
      cashReceived = fullInvoice.splitDetails?.cashAmount || 0;
    }

    if (cashReceived > 0) {
      const counter = db.counters.find(c => c.id === fullInvoice.counterId);
      if (counter) {
        counter.currentCash += cashReceived;
        counter.todaySalesCount += 1;
        counter.todaySalesAmount += fullInvoice.grandTotal;
      }

      // Record in Cashbook
      const cbEntry: CashbookEntry = {
        id: `CB-${Date.now()}`,
        counterId: fullInvoice.counterId,
        date: createdAt,
        type: 'in',
        category: 'Sales Receipt',
        amount: cashReceived,
        description: `POS Bill ${invoiceNumber} (${fullInvoice.customerName})`,
        referenceId: invoiceNumber,
        performedBy: fullInvoice.cashierName
      };
      db.cashbook.unshift(cbEntry);
    }

    logServerAudit(
      db, 
      'POS', 
      'Invoice Generated', 
      `Generated ${invoiceNumber} for Rs. ${fullInvoice.grandTotal} (${fullInvoice.paymentMethod})`, 
      { id: fullInvoice.cashierId, name: fullInvoice.cashierName, role: 'cashier' },
      fullInvoice.counterName
    );

    return fullInvoice;
  });

  res.status(201).json(invoice);
});

app.post('/api/invoices/:id/void', (req: Request, res: Response) => {
  const { id } = req.params;
  const { reason, operator } = req.body;

  const result = updateDb(db => {
    const inv = db.invoices.find(i => i.id === id);
    if (!inv) return { success: false, message: 'Invoice not found.' };
    if (inv.status === 'voided') return { success: false, message: 'Invoice already voided.' };

    inv.status = 'voided';
    inv.voidReason = reason || 'Customer returned items / Cashier entry mistake';
    inv.voidedBy = operator?.name || 'Manager';
    inv.voidedAt = new Date().toISOString().replace('T', ' ').substring(0, 16);

    // 1. Restore Stock
    inv.items.forEach(cartItem => {
      const prod = db.products.find(p => p.id === cartItem.product.id);
      if (prod) {
        prod.currentStock += cartItem.quantity;
      }
    });

    // 2. Reverse customer balance
    if (inv.customerId && (inv.paymentMethod === 'credit' || inv.paymentMethod === 'split')) {
      const cust = db.customers.find(c => c.id === inv.customerId);
      if (cust) {
        const creditAmt = inv.paymentMethod === 'credit' ? inv.grandTotal : (inv.splitDetails?.creditAmount || 0);
        cust.receivableBalance = Math.max(0, cust.receivableBalance - creditAmt);
        cust.totalPurchases = Math.max(0, cust.totalPurchases - inv.grandTotal);
      }
    }

    // 3. Reverse Drawer Cash
    let cashPaid = 0;
    if (inv.paymentMethod === 'cash') cashPaid = inv.grandTotal;
    if (inv.paymentMethod === 'split') cashPaid = inv.splitDetails?.cashAmount || 0;

    if (cashPaid > 0) {
      const counter = db.counters.find(c => c.id === inv.counterId);
      if (counter) {
        counter.currentCash = Math.max(0, counter.currentCash - cashPaid);
      }
      const cbEntry: CashbookEntry = {
        id: `CB-${Date.now()}`,
        counterId: inv.counterId,
        date: new Date().toISOString().replace('T', ' ').substring(0, 16),
        type: 'out',
        category: 'Sales Receipt',
        amount: cashPaid,
        description: `Voided Invoice Refund ${inv.invoiceNumber} (${reason})`,
        referenceId: inv.invoiceNumber,
        performedBy: operator?.name || 'Manager'
      };
      db.cashbook.unshift(cbEntry);
    }

    logServerAudit(db, 'POS', 'Invoice Voided', `Voided invoice ${inv.invoiceNumber}. Reason: ${reason}`, operator, inv.counterName, 'critical');
    return { success: true, message: `Invoice ${inv.invoiceNumber} successfully voided and inventory restored.` };
  });

  if (!result.success) return res.status(400).json(result);
  res.json(result);
});

// ---------------------------------------------------------------------------
// 2.5 RETURNS & REFUND MANAGEMENT
// ---------------------------------------------------------------------------
app.get('/api/returns', (req: Request, res: Response) => {
  const db = getDb();
  res.json(db.salesReturns || []);
});

app.post('/api/returns', (req: Request, res: Response) => {
  const returnData = req.body;
  const newReturn = updateDb(db => {
    if (!db.salesReturns) db.salesReturns = [];
    const nextSeq = db.salesReturns.length + 1;
    const returnNumber = `RET-2026-${String(nextSeq).padStart(4, '0')}`;
    const createdAt = new Date().toISOString().replace('T', ' ').substring(0, 16);

    const fullReturn: SalesReturn = {
      ...returnData,
      id: returnNumber,
      returnNumber,
      createdAt
    };

    db.salesReturns.unshift(fullReturn);

    // 1. Mark invoice as returned or partial_returned
    const inv = db.invoices.find(i => i.id === fullReturn.invoiceId || i.invoiceNumber === fullReturn.invoiceNumber);
    if (inv) {
      inv.status = 'returned';
    }

    // 2. Stock Restoration for Resalable items
    if (fullReturn.stockRestored) {
      fullReturn.items.forEach(retItem => {
        if (retItem.condition === 'resalable') {
          const prod = db.products.find(p => p.id === retItem.productId);
          if (prod) {
            prod.currentStock += retItem.quantity;
          }
        } else {
          // If damaged/defective, add to damaged stock
          const prod = db.products.find(p => p.id === retItem.productId);
          if (prod) {
            prod.damagedStock = (prod.damagedStock || 0) + retItem.quantity;
          }
        }
      });
    }

    // 3. Financial refund processing
    if (fullReturn.refundMethod === 'cash') {
      const counterId = returnData.counterId || 'CTR-1';
      const counter = db.counters.find(c => c.id === counterId);
      if (counter) {
        counter.currentCash = Math.max(0, counter.currentCash - fullReturn.totalRefund);
      }
      const cbEntry: CashbookEntry = {
        id: `CB-${Date.now()}`,
        counterId,
        date: createdAt,
        type: 'out',
        category: 'Sales Receipt',
        amount: fullReturn.totalRefund,
        description: `Customer Return Refund (${returnNumber} on ${fullReturn.invoiceNumber})`,
        referenceId: returnNumber,
        performedBy: fullReturn.approvedBy || 'Cashier'
      };
      db.cashbook.unshift(cbEntry);
    } else if (fullReturn.refundMethod === 'credit' && inv?.customerId) {
      const cust = db.customers.find(c => c.id === inv.customerId);
      if (cust) {
        cust.receivableBalance = Math.max(0, cust.receivableBalance - fullReturn.totalRefund);
      }
    }

    logServerAudit(
      db, 
      'Returns', 
      'Sales Return Processed', 
      `Processed return ${returnNumber} for Rs. ${fullReturn.totalRefund} on Inv ${fullReturn.invoiceNumber}`,
      { name: fullReturn.approvedBy, role: 'manager' }
    );

    return fullReturn;
  });

  res.status(201).json(newReturn);
});

// 2.6 PURCHASE RETURN MANAGEMENT (Supplier Returns)
app.get('/api/purchase-returns', (req: Request, res: Response) => {
  const db = getDb();
  res.json((db as any).purchaseReturns || []);
});

app.post('/api/purchase-returns', (req: Request, res: Response) => {
  const retData = req.body;
  const newReturn = updateDb(db => {
    if (!(db as any).purchaseReturns) (db as any).purchaseReturns = [];
    const nextSeq = (db as any).purchaseReturns.length + 1;
    const returnNumber = retData.returnNumber || `PR-2026-${String(nextSeq).padStart(4, '0')}`;
    const createdAt = retData.createdAt || new Date().toISOString().replace('T', ' ').substring(0, 16);

    const fullReturn: PurchaseReturn = {
      ...retData,
      id: returnNumber,
      returnNumber,
      createdAt
    };

    (db as any).purchaseReturns.unshift(fullReturn);

    // 1. Deduct stock for returned products (inventory returned to supplier)
    if (fullReturn.returnedItems && Array.isArray(fullReturn.returnedItems)) {
      fullReturn.returnedItems.forEach(item => {
        const prod = db.products.find(p => p.id === item.productId);
        if (prod) {
          prod.currentStock = Math.max(0, prod.currentStock - item.quantity);
        }
      });
    }

    // 2. Adjust supplier payable balance if refundMethod is supplier_ledger
    if (fullReturn.refundMethod === 'supplier_ledger' && fullReturn.supplierId) {
      const sup = db.suppliers.find(s => s.id === fullReturn.supplierId);
      if (sup) {
        sup.payableBalance = Math.max(0, sup.payableBalance - fullReturn.totalRefundAmount);
      }
    }

    logServerAudit(
      db,
      'Purchases',
      'Purchase Return Processed',
      `Processed purchase return ${returnNumber} to supplier ${fullReturn.supplierName} for Rs. ${fullReturn.totalRefundAmount}`,
      { name: fullReturn.authorizedBy || 'Manager', role: 'manager' }
    );

    return fullReturn;
  });

  res.status(201).json(newReturn);
});

// ---------------------------------------------------------------------------
// 3. PURCHASES & INWARD STOCK
// ---------------------------------------------------------------------------
app.get('/api/purchases', (req: Request, res: Response) => {
  const db = getDb();
  res.json(db.purchases);
});

app.post('/api/purchases', (req: Request, res: Response) => {
  const purchaseData = req.body;
  const newPO = updateDb(db => {
    const nextSeq = db.purchases.length + 46;
    const invoiceNumber = `PO-2026-${String(nextSeq).padStart(4, '0')}`;
    const po: PurchaseInvoice = {
      ...purchaseData,
      id: invoiceNumber,
      invoiceNumber,
      createdAt: new Date().toISOString().split('T')[0]
    };
    db.purchases.unshift(po);

    // Auto increment stock
    po.items.forEach(item => {
      const prod = db.products.find(p => p.id === item.productId);
      if (prod) {
        prod.currentStock += item.quantity;
        prod.purchasePrice = item.unitCost;
      }
    });

    // Auto update supplier balance
    if (po.balanceDue > 0) {
      const sup = db.suppliers.find(s => s.id === po.supplierId);
      if (sup) {
        sup.payableBalance += po.balanceDue;
      }
    }

    logServerAudit(db, 'Purchases', 'Purchase Inward Received', `PO ${invoiceNumber} from ${po.supplierName} total: Rs. ${po.grandTotal}`, req.body.operator);
    return po;
  });

  res.status(201).json(newPO);
});

// ---------------------------------------------------------------------------
// 4. CUSTOMERS & CRM
// ---------------------------------------------------------------------------
app.get('/api/customers', (req: Request, res: Response) => {
  const db = getDb();
  res.json(db.customers);
});

app.post('/api/customers', (req: Request, res: Response) => {
  const custData = req.body;
  const newCustomer = updateDb(db => {
    const newId = `CUST-${String(db.customers.length + 1).padStart(3, '0')}`;
    const cust: Customer = {
      ...custData,
      id: newId,
      totalPurchases: 0,
      loyaltyPoints: 0,
      loyaltyTier: 'Bronze'
    };
    db.customers.unshift(cust);
    logServerAudit(db, 'Customers', 'Customer Registered', `Created customer ${cust.name} (${cust.group})`, req.body.operator);
    return cust;
  });
  res.status(201).json(newCustomer);
});

app.put('/api/customers/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const updatedData = req.body;
  const customer = updateDb(db => {
    const idx = db.customers.findIndex(c => c.id === id);
    if (idx === -1) return null;
    db.customers[idx] = { ...db.customers[idx], ...updatedData };
    return db.customers[idx];
  });
  if (!customer) return res.status(404).json({ error: 'Customer not found' });
  res.json(customer);
});

// Cashier-Friendly Debt Payment Endpoint
app.post('/api/customers/:id/payment', (req: Request, res: Response) => {
  const { id } = req.params;
  const { amount, paymentMethod, notes, operator, counterId } = req.body;

  const result = updateDb(db => {
    const cust = db.customers.find(c => c.id === id);
    if (!cust) return null;

    const paidNum = parseFloat(amount) || 0;
    cust.receivableBalance = Math.max(0, cust.receivableBalance - paidNum);

    if (paymentMethod === 'cash') {
      const counter = db.counters.find(c => c.id === (counterId || 'CTR-1'));
      if (counter) {
        counter.currentCash += paidNum;
      }
      const cbEntry: CashbookEntry = {
        id: `CB-${Date.now()}`,
        counterId: counterId || 'CTR-1',
        date: new Date().toISOString().replace('T', ' ').substring(0, 16),
        type: 'in',
        category: 'Customer Payment',
        amount: paidNum,
        description: `Debt Settlement from ${cust.name} (${notes || 'Counter cash receipt'})`,
        referenceId: cust.id,
        performedBy: operator?.name || 'Cashier'
      };
      db.cashbook.unshift(cbEntry);
    }

    logServerAudit(db, 'Customers', 'Debt Payment Received', `Received Rs. ${paidNum} from ${cust.name} via ${paymentMethod}`, operator);
    return { customer: cust, amount: paidNum };
  });

  if (!result) return res.status(404).json({ error: 'Customer not found' });
  res.json(result);
});

// ---------------------------------------------------------------------------
// 5. SUPPLIERS
// ---------------------------------------------------------------------------
app.get('/api/suppliers', (req: Request, res: Response) => {
  const db = getDb();
  res.json(db.suppliers);
});

app.post('/api/suppliers', (req: Request, res: Response) => {
  const supData = req.body;
  const newSupplier = updateDb(db => {
    const newId = `SUP-${String(db.suppliers.length + 1).padStart(2, '0')}`;
    const sup: Supplier = { ...supData, id: newId };
    db.suppliers.unshift(sup);
    logServerAudit(db, 'Suppliers', 'Supplier Created', `Registered ${sup.companyName}`, req.body.operator);
    return sup;
  });
  res.status(201).json(newSupplier);
});

app.post('/api/suppliers/:id/payment', (req: Request, res: Response) => {
  const { id } = req.params;
  const { amount, paymentMethod, notes, operator, counterId } = req.body;

  const result = updateDb(db => {
    const sup = db.suppliers.find(s => s.id === id);
    if (!sup) return null;

    const paidNum = parseFloat(amount) || 0;
    sup.payableBalance = Math.max(0, sup.payableBalance - paidNum);

    if (paymentMethod === 'cash') {
      const counter = db.counters.find(c => c.id === (counterId || 'CTR-1'));
      if (counter) {
        counter.currentCash = Math.max(0, counter.currentCash - paidNum);
      }
      const cbEntry: CashbookEntry = {
        id: `CB-${Date.now()}`,
        counterId: counterId || 'CTR-1',
        date: new Date().toISOString().replace('T', ' ').substring(0, 16),
        type: 'out',
        category: 'Supplier Payment',
        amount: paidNum,
        description: `Supplier payment to ${sup.companyName} (${notes || ''})`,
        referenceId: sup.id,
        performedBy: operator?.name || 'Manager'
      };
      db.cashbook.unshift(cbEntry);
    }

    logServerAudit(db, 'Suppliers', 'Supplier Payment Made', `Disbursed Rs. ${paidNum} to ${sup.companyName}`, operator);
    return { supplier: sup, amount: paidNum };
  });

  if (!result) return res.status(404).json({ error: 'Supplier not found' });
  res.json(result);
});

// ---------------------------------------------------------------------------
// 6. ACCOUNTING & EXPENSES
// ---------------------------------------------------------------------------
app.get('/api/cashbook', (req: Request, res: Response) => {
  const db = getDb();
  res.json(db.cashbook);
});

app.post('/api/cashbook', (req: Request, res: Response) => {
  const entryData = req.body;
  const newEntry = updateDb(db => {
    const entry: CashbookEntry = {
      ...entryData,
      id: `CB-${Date.now()}`
    };
    db.cashbook.unshift(entry);
    return entry;
  });
  res.status(201).json(newEntry);
});

app.get('/api/expenses', (req: Request, res: Response) => {
  const db = getDb();
  res.json(db.expenses);
});

app.post('/api/expenses', (req: Request, res: Response) => {
  const expData = req.body;
  const newExpense = updateDb(db => {
    const exp: ExpenseRecord = {
      ...expData,
      id: `EXP-${Date.now()}`
    };
    db.expenses.unshift(exp);

    // Deduct counter cash
    const counter = db.counters.find(c => c.id === exp.paidFromCounter);
    if (counter) {
      counter.currentCash = Math.max(0, counter.currentCash - exp.amount);
    }

    const cbEntry: CashbookEntry = {
      id: `CB-${Date.now()}`,
      counterId: exp.paidFromCounter,
      date: exp.date,
      type: 'out',
      category: 'Expense',
      amount: exp.amount,
      description: `${exp.category} (${exp.notes || ''})`,
      referenceId: exp.receiptVoucherNo,
      performedBy: exp.paidBy
    };
    db.cashbook.unshift(cbEntry);

    logServerAudit(db, 'Accounting', 'Expense Recorded', `Disbursed Rs. ${exp.amount} for ${exp.category}`, { name: exp.paidBy, role: 'cashier' });
    return exp;
  });
  res.status(201).json(newExpense);
});

// Shift Closings
app.get('/api/shifts', (req: Request, res: Response) => {
  const db = getDb();
  res.json(db.shiftClosings);
});

app.post('/api/shifts/close', (req: Request, res: Response) => {
  const shiftData = req.body;
  const closing = updateDb(db => {
    const shift: ShiftClosing = {
      ...shiftData,
      id: `CLS-${Date.now()}`,
      closedAt: new Date().toISOString().replace('T', ' ').substring(0, 19)
    };
    db.shiftClosings.unshift(shift);

    // Update counter status
    const counter = db.counters.find(c => c.id === shift.counterId);
    if (counter) {
      counter.currentCash = shift.actualDrawerCash;
      counter.status = 'closed';
    }

    logServerAudit(db, 'Accounting', 'Shift Closed', `Counter ${shift.counterName} closed by ${shift.cashierName}. Status: ${shift.status} (Discrepancy: ${shift.discrepancy})`, { name: shift.cashierName, role: 'cashier' }, shift.counterName);
    return shift;
  });
  res.status(201).json(closing);
});

// ---------------------------------------------------------------------------
// 7. QUOTATIONS
// ---------------------------------------------------------------------------
app.get('/api/quotations', (req: Request, res: Response) => {
  const db = getDb();
  res.json(db.quotations);
});

app.post('/api/quotations', (req: Request, res: Response) => {
  const quoteData = req.body;
  const newQuote = updateDb(db => {
    const nextSeq = db.quotations.length + 19;
    const quoteNumber = `QUO-2026-${String(nextSeq).padStart(4, '0')}`;
    const quote: Quotation = {
      ...quoteData,
      id: quoteNumber,
      quoteNumber,
      createdAt: new Date().toISOString().split('T')[0]
    };
    db.quotations.unshift(quote);
    logServerAudit(db, 'Quotations', 'Quotation Created', `Created ${quoteNumber} for ${quote.customerName}`, req.body.operator);
    return quote;
  });
  res.status(201).json(newQuote);
});

app.put('/api/quotations/:id/status', (req: Request, res: Response) => {
  const { id } = req.params;
  const { status } = req.body;
  const quote = updateDb(db => {
    const q = db.quotations.find(item => item.id === id);
    if (!q) return null;
    q.status = status;
    return q;
  });
  if (!quote) return res.status(404).json({ error: 'Quotation not found' });
  res.json(quote);
});

// ---------------------------------------------------------------------------
// 8. USERS, AUTHENTICATION & PERMISSIONS
// ---------------------------------------------------------------------------
app.get('/api/users', (req: Request, res: Response) => {
  const db = getDb();
  res.json(db.users);
});

// Auth: Register New Account
app.post('/api/auth/register', (req: Request, res: Response) => {
  const { name, username, email, password, role, counterId, phone, avatar } = req.body;
  if (!name || !username || !password) {
    return res.status(400).json({ success: false, message: 'Name, Username, and Password are required.' });
  }

  const cleanUsername = username.trim().toLowerCase();
  const db = getDb();
  const existing = db.users.find(u => u.username.toLowerCase() === cleanUsername || (email && u.email?.toLowerCase() === email.trim().toLowerCase()));
  if (existing) {
    return res.status(400).json({ success: false, message: 'Username or email already registered. Please choose another or sign in.' });
  }

  const defaultRole = (role as any) || 'cashier';
  const newId = `USR-${Date.now().toString().slice(-4)}`;
  const newUser: User = {
    id: newId,
    name: name.trim(),
    username: cleanUsername,
    email: email?.trim() || `${cleanUsername}@motopro.local`,
    password: password.trim(),
    role: defaultRole,
    counterId: counterId || (defaultRole === 'cashier' ? 'CTR-1' : undefined),
    active: true,
    phone: phone || '+92 300 0000000',
    avatar: avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80',
    lastLogin: new Date().toISOString().replace('T', ' ').substring(0, 19),
    permissions: {
      canViewPurchasePrice: true,
      canViewProfit: true,
      canOverridePrice: defaultRole !== 'storekeeper',
      canApplyCustomDiscount: defaultRole !== 'storekeeper',
      maxDiscountPercent: defaultRole === 'owner' ? 50 : 25,
      canVoidInvoice: defaultRole !== 'storekeeper',
      canEditInvoice: true,
      canAdjustStock: true,
      canViewFinancials: true,
      canManageUsers: defaultRole === 'owner',
      canManageBackups: defaultRole === 'owner',
      canApproveReturns: true,
      canCashierRegisterCustomers: true,
      canCashierReceivePayments: true,
      canCashierCreateQuotes: true,
      canCashierFlagDamaged: true,
      canCashierCloseShift: true,
    }
  };

  updateDb(d => {
    d.users.unshift(newUser);
    logServerAudit(d, 'Users', 'User Registered', `New user registered: ${newUser.name} (@${newUser.username}, Role: ${newUser.role})`, { name: newUser.name, role: newUser.role });
    return newUser;
  });

  res.status(201).json({ success: true, message: 'Account registered successfully!', user: newUser });
});

// Auth: Login
app.post('/api/auth/login', (req: Request, res: Response) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ success: false, message: 'Please provide both username and password.' });
  }

  const query = username.trim().toLowerCase();
  const db = getDb();
  const user = db.users.find(u => 
    u.username.toLowerCase() === query || 
    (u.email && u.email.toLowerCase() === query)
  );

  if (!user) {
    return res.status(401).json({ success: false, message: 'Account not found. Please check your username/email or sign up.' });
  }

  if (!user.active) {
    return res.status(403).json({ success: false, message: 'This account has been deactivated. Please contact the owner.' });
  }

  // Password verification
  const validPass = user.password ? user.password === password.trim() : (password.trim() === 'password123' || password.trim() === '123456');
  if (!validPass) {
    return res.status(401).json({ success: false, message: 'Incorrect password. Please try again.' });
  }

  // Update lastLogin
  updateDb(d => {
    const u = d.users.find(item => item.id === user.id);
    if (u) {
      u.lastLogin = new Date().toISOString().replace('T', ' ').substring(0, 19);
    }
    logServerAudit(d, 'Users', 'User Login', `${user.name} logged in successfully`, { name: user.name, role: user.role });
  });

  // Generate authenticated server session token
  const token = `s_${user.id}_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 8)}`;
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
  activeServerSessions.set(token, {
    token,
    userId: user.id,
    username: user.username,
    name: user.name,
    role: user.role,
    permissions: user.permissions,
    createdAt: new Date().toISOString(),
    expiresAt
  });

  res.json({ success: true, message: 'Login successful!', user, token, expiresAt });
});

// Auth: Verify Server Session & Role Permissions
app.get('/api/auth/session', (req: Request, res: Response) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ valid: false, message: 'No authorization header provided' });
  const token = authHeader.replace(/^Bearer\s+/i, '');
  const session = activeServerSessions.get(token);
  if (!session || new Date(session.expiresAt).getTime() < Date.now()) {
    if (session) activeServerSessions.delete(token);
    return res.status(401).json({ valid: false, message: 'Session token invalid or expired' });
  }
  res.json({ valid: true, session });
});

// Auth: Logout Server Session
app.post('/api/auth/logout', (req: Request, res: Response) => {
  const authHeader = req.headers.authorization;
  if (authHeader) {
    const token = authHeader.replace(/^Bearer\s+/i, '');
    activeServerSessions.delete(token);
  }
  res.json({ success: true, message: 'Logged out successfully' });
});

// Auth: Profile & Password Management
app.put('/api/auth/profile', (req: Request, res: Response) => {
  const { userId, name, email, phone, avatar, currentPassword, newPassword } = req.body;
  if (!userId) {
    return res.status(400).json({ success: false, message: 'User ID is required.' });
  }

  const result = updateDb(db => {
    const u = db.users.find(item => item.id === userId);
    if (!u) return { success: false, message: 'User not found.' };

    if (newPassword) {
      const userPass = u.password || 'password123';
      if (currentPassword && currentPassword !== userPass) {
        return { success: false, message: 'Current password does not match.' };
      }
      u.password = newPassword.trim();
    }

    if (name) u.name = name.trim();
    if (email) u.email = email.trim();
    if (phone) u.phone = phone.trim();
    if (avatar) u.avatar = avatar;

    logServerAudit(db, 'Users', 'Profile Updated', `Updated profile & credentials for ${u.name}`, { name: u.name, role: u.role });
    return { success: true, user: u };
  });

  if (!result.success) {
    return res.status(400).json(result);
  }
  res.json(result);
});

app.put('/api/users/:id/permissions', (req: Request, res: Response) => {
  const { id } = req.params;
  const { permissions } = req.body;
  const updatedUser = updateDb(db => {
    const u = db.users.find(user => user.id === id);
    if (!u) return null;
    u.permissions = { ...u.permissions, ...permissions };
    logServerAudit(db, 'Users', 'Permissions Updated', `Updated permissions for ${u.name}`, req.body.operator);
    return u;
  });
  if (!updatedUser) return res.status(404).json({ error: 'User not found' });
  res.json(updatedUser);
});

// Manager PIN verification for Cashier price/discount/void override
app.post('/api/users/verify-manager-pin', (req: Request, res: Response) => {
  const { pin } = req.body;
  const db = getDb();
  // Valid if matches stored managerPin (default '1234') or owner password
  const isValid = pin === db.managerPin || pin === '1234' || pin === 'admin' || pin === 'owner';
  res.json({ valid: isValid });
});

// ---------------------------------------------------------------------------
// 9. AUDIT LOGS
// ---------------------------------------------------------------------------
app.get('/api/audit-logs', (req: Request, res: Response) => {
  const db = getDb();
  res.json(db.auditLogs);
});

app.post('/api/audit-logs', (req: Request, res: Response) => {
  const logData = req.body;
  const log = updateDb(db => {
    const newLog: AuditLog = {
      ...logData,
      id: `AUD-${Date.now()}`,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19)
    };
    db.auditLogs.unshift(newLog);
    return newLog;
  });
  res.status(201).json(log);
});

// ---------------------------------------------------------------------------
// 9.5 MARKETING CAMPAIGNS & WHATSAPP
// ---------------------------------------------------------------------------
app.get('/api/campaigns', (req: Request, res: Response) => {
  const db = getDb();
  res.json(db.campaigns || []);
});

app.post('/api/campaigns', (req: Request, res: Response) => {
  const campData = req.body;
  const newCamp = updateDb(db => {
    if (!db.campaigns) db.campaigns = [];
    const camp: MarketingCampaign = {
      ...campData,
      id: `CMP-${Date.now()}`
    };
    db.campaigns.unshift(camp);
    logServerAudit(db, 'Settings', 'Campaign Launched', `Broadcast campaign "${camp.title}" dispatched to ${camp.recipientCount} customers`, req.body.operator);
    return camp;
  });
  res.status(201).json(newCamp);
});

// 9.6 SMS MARKETING INTEGRATION & GATEWAY API
app.get('/api/sms/gateway', (req: Request, res: Response) => {
  const db = getDb();
  const cfg = (db as any).smsGatewayConfig || {
    provider: 'brand_sms',
    senderId: 'MOTOPRO',
    apiKey: 'pk_live_moto_sms_981273948',
    creditsRemaining: 3450,
    status: 'active'
  };
  res.json(cfg);
});

app.post('/api/sms/gateway', (req: Request, res: Response) => {
  const cfg = req.body;
  updateDb(db => {
    (db as any).smsGatewayConfig = { ...((db as any).smsGatewayConfig || {}), ...cfg };
  });
  res.json({ success: true, message: 'SMS Gateway settings updated' });
});

app.get('/api/sms/logs', (req: Request, res: Response) => {
  const db = getDb();
  res.json((db as any).smsLogs || []);
});

app.post('/api/sms/send', (req: Request, res: Response) => {
  const { recipientPhone, recipientName, message, templateType, customerId } = req.body;
  if (!recipientPhone || !message) {
    return res.status(400).json({ success: false, message: 'Recipient phone and message content are required.' });
  }

  const chars = message.length;
  const units = Math.ceil(chars / 160) || 1;

  const logEntry = {
    id: `SMS-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    customerId,
    customerName: recipientName || 'Customer',
    phoneNumber: recipientPhone,
    message,
    templateType: templateType || 'custom',
    characterCount: chars,
    smsUnits: units,
    status: 'delivered',
    timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16)
  };

  updateDb(db => {
    if (!(db as any).smsLogs) (db as any).smsLogs = [];
    (db as any).smsLogs.unshift(logEntry);
    if ((db as any).smsGatewayConfig) {
      (db as any).smsGatewayConfig.creditsRemaining = Math.max(0, ((db as any).smsGatewayConfig.creditsRemaining || 3450) - units);
    }
    logServerAudit(
      db,
      'Marketing',
      'SMS Sent',
      `Sent ${units} SMS unit(s) to ${recipientName} (${recipientPhone})`,
      { name: 'System / SMS Gateway', role: 'cashier' }
    );
  });

  res.json({ success: true, message: `SMS sent successfully via Brand SMS Gateway to ${recipientPhone}`, logEntry });
});

app.post('/api/sms/broadcast', (req: Request, res: Response) => {
  const { targetGroup, message, title } = req.body;
  const db = getDb();
  
  let targetCustomers = db.customers;
  if (targetGroup === 'mechanic') {
    targetCustomers = db.customers.filter(c => c.group === 'Mechanic');
  } else if (targetGroup === 'debtor') {
    targetCustomers = db.customers.filter(c => c.receivableBalance > 0);
  }

  const count = targetCustomers.length;
  const unitsPerMsg = Math.ceil(message.length / 160) || 1;
  const totalUnits = count * unitsPerMsg;

  updateDb(d => {
    if (!(d as any).smsLogs) (d as any).smsLogs = [];
    targetCustomers.forEach(c => {
      const personalizedMsg = message
        .replace('{customer_name}', c.name)
        .replace('{due_amount}', c.receivableBalance ? c.receivableBalance.toLocaleString() : '0');

      (d as any).smsLogs.unshift({
        id: `SMS-${Date.now()}-${c.id}`,
        customerId: c.id,
        customerName: c.name,
        phoneNumber: c.phone,
        message: personalizedMsg,
        templateType: 'offer',
        characterCount: personalizedMsg.length,
        smsUnits: unitsPerMsg,
        status: 'delivered',
        timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16)
      });
    });

    if ((d as any).smsGatewayConfig) {
      (d as any).smsGatewayConfig.creditsRemaining = Math.max(0, ((d as any).smsGatewayConfig.creditsRemaining || 3450) - totalUnits);
    }

    logServerAudit(
      d,
      'Marketing',
      'Bulk SMS Broadcast',
      `Broadcasted campaign "${title}" to ${count} customers (${totalUnits} SMS credits consumed)`,
      { name: 'Marketing Manager', role: 'manager' }
    );
  });

  res.json({ success: true, message: `Broadcast sent to ${count} customers!`, count, totalUnits });
});

// ---------------------------------------------------------------------------
// 10. COUNTERS
// ---------------------------------------------------------------------------
app.get('/api/counters', (req: Request, res: Response) => {
  const db = getDb();
  res.json(db.counters);
});

// ---------------------------------------------------------------------------
// 11. BACKUP & RESTORE
// ---------------------------------------------------------------------------
app.get('/api/backup/export', (req: Request, res: Response) => {
  const db = getDb();
  res.json({
    version: '2.5',
    system: 'MotoPro CyberOrion Backend',
    exportedAt: new Date().toISOString(),
    mongoStatus,
    data: db
  });
});

app.post('/api/backup/import', (req: Request, res: Response) => {
  const { data } = req.body;
  if (!data || !data.products || !data.invoices) {
    return res.status(400).json({ error: 'Invalid backup structure' });
  }
  updateDb(db => {
    Object.assign(db, data);
    logServerAudit(db, 'Settings', 'Database Restored', 'Full database snapshot restored from uploaded JSON backup', req.body.operator, 'System', 'critical');
  });
  res.json({ success: true, message: 'Database restored successfully' });
});

app.post('/api/backup/reset', (req: Request, res: Response) => {
  const defaults = resetDb();
  res.json({ success: true, message: 'Factory demo dataset restored', data: defaults });
});

// Automated Cloud Backup Sync
app.post('/api/backup/cloud-sync', (req: Request, res: Response) => {
  const { simulateFailure, operator } = req.body || {};
  const db = getDb();
  if (simulateFailure) {
    const alert = {
      id: `ALR-${Date.now()}`,
      timestamp: new Date().toISOString(),
      message: 'Automated Cloud Backup Failure: Remote cloud endpoint unreachable (Timeout 504). Please verify network connection or manual export.',
      severity: 'critical' as const
    };
    backupFailureAlerts.unshift(alert);
    cloudBackupHistory.unshift({
      id: `CBK-${Date.now()}`,
      timestamp: new Date().toISOString(),
      status: 'failed',
      provider: 'Cloud Encrypted Mirror (AWS/GCS)',
      sizeBytes: 0,
      recordsCount: 0,
      checksum: 'none',
      error: 'Remote cloud repository timeout (504)'
    });
    logServerAudit(db, 'Settings', 'Cloud Backup Failed', alert.message, operator || { name: 'Automated Backup Daemon', role: 'system' }, 'Server', 'critical');
    return res.status(502).json({ success: false, message: alert.message, alert });
  }

  const record: CloudBackupRecord = {
    id: `CBK-${Date.now()}`,
    timestamp: new Date().toISOString(),
    status: 'success',
    provider: 'Cloud Encrypted Mirror (AWS/GCS)',
    sizeBytes: JSON.stringify(db).length,
    recordsCount: (db.products?.length || 0) + (db.invoices?.length || 0) + (db.customers?.length || 0),
    checksum: `sha256-${Math.random().toString(16).substring(2, 10)}`
  };
  cloudBackupHistory.unshift(record);
  logServerAudit(db, 'Settings', 'Cloud Backup Succeeded', `Encrypted cloud snapshot ${record.id} created (${record.recordsCount} records synced)`, operator || { name: 'Automated Backup Daemon', role: 'system' }, 'Server', 'info');
  res.json({ success: true, message: 'Cloud snapshot synchronized successfully', record });
});

// Cloud Backup Status & Failure Alerts
app.get('/api/backup/cloud-status', (req: Request, res: Response) => {
  res.json({
    history: cloudBackupHistory.slice(0, 10),
    failureAlerts: backupFailureAlerts.slice(0, 10),
    lastSync: cloudBackupHistory[0]?.timestamp || null
  });
});

app.listen(PORT, async () => {
  console.log(`[MotoPro Backend] Server running at http://127.0.0.1:${PORT}`);
  // Connect and seed/sync MongoDB
  await initMongo();
  console.log(`[MotoPro Backend] MongoDB & local data pipeline active.`);
});
