import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';
import { 
  Product, Category, Brand, SalesInvoice, PurchaseInvoice, 
  Customer, Supplier, StockAdjustment, DamagedStockRecord, 
  StockMovement, SalesReturn, Quotation, CashbookEntry, 
  ExpenseRecord, AuditLog, MarketingCampaign, ShiftClosing, 
  User, Counter 
} from '../src/types/index';
import { 
  INITIAL_PRODUCTS, INITIAL_CATEGORIES, INITIAL_BRANDS, 
  INITIAL_CUSTOMERS, INITIAL_SUPPLIERS, INITIAL_INVOICES, 
  INITIAL_PURCHASES, INITIAL_EXPENSES, INITIAL_CASHBOOK, 
  INITIAL_AUDIT_LOGS, INITIAL_QUOTATIONS, INITIAL_CAMPAIGNS,
  INITIAL_USERS, INITIAL_COUNTERS
} from '../src/mock/initialData';
import {
  ProductModel, CategoryModel, BrandModel, CustomerModel,
  SupplierModel, InvoiceModel, PurchaseModel, ExpenseModel,
  CashbookModel, StockAdjustmentModel, DamagedStockModel,
  SalesReturnModel, QuotationModel, CampaignModel,
  ShiftClosingModel, AuditLogModel, UserModel, CounterModel
} from './models.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.join(__dirname, 'data');
const DB_FILE = path.join(DATA_DIR, 'store.json');

export interface AppDatabase {
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
  quotations: Quotation[];
  auditLogs: AuditLog[];
  campaigns: MarketingCampaign[];
  shiftClosings: ShiftClosing[];
  users: User[];
  counters: Counter[];
  managerPin: string;
}

export const mongoStatus = {
  connected: false,
  uri: process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/motopro_pos',
  dbName: 'motopro_pos',
  lastSync: '',
  error: null as string | null
};

export function getDefaultDatabase(): AppDatabase {
  return {
    products: INITIAL_PRODUCTS,
    categories: INITIAL_CATEGORIES,
    brands: INITIAL_BRANDS,
    customers: INITIAL_CUSTOMERS,
    suppliers: INITIAL_SUPPLIERS,
    invoices: INITIAL_INVOICES,
    purchases: INITIAL_PURCHASES,
    expenses: INITIAL_EXPENSES,
    cashbook: INITIAL_CASHBOOK,
    stockAdjustments: [],
    damagedStock: [],
    stockMovements: [],
    salesReturns: [],
    quotations: INITIAL_QUOTATIONS,
    auditLogs: INITIAL_AUDIT_LOGS,
    campaigns: INITIAL_CAMPAIGNS,
    shiftClosings: [],
    users: INITIAL_USERS,
    counters: INITIAL_COUNTERS,
    managerPin: '1234',
  };
}

let cachedDb: AppDatabase | null = null;

export function getDb(): AppDatabase {
  if (cachedDb) return cachedDb;

  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }

  if (fs.existsSync(DB_FILE)) {
    try {
      const raw = fs.readFileSync(DB_FILE, 'utf-8');
      cachedDb = JSON.parse(raw);
      return cachedDb!;
    } catch (err) {
      console.error('[DB] Failed to read store.json, re-initializing default state:', err);
    }
  }

  const defaultDb = getDefaultDatabase();
  saveDb(defaultDb);
  cachedDb = defaultDb;
  return cachedDb;
}

export function saveDb(data: AppDatabase): void {
  cachedDb = data;
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  const tempFile = `${DB_FILE}.tmp`;
  fs.writeFileSync(tempFile, JSON.stringify(data, null, 2), 'utf-8');
  fs.renameSync(tempFile, DB_FILE);

  // Async dual-sync to MongoDB
  syncMemoryToMongo(data).catch(err => {
    console.error('[MongoDB Dual-Sync Error]', err.message);
  });
}

export function updateDb<T>(updater: (db: AppDatabase) => T): T {
  const db = getDb();
  const result = updater(db);
  saveDb(db);
  return result;
}

export function resetDb(): AppDatabase {
  const defaults = getDefaultDatabase();
  saveDb(defaults);
  // Also wipe and re-seed MongoDB
  seedMongoFromData(defaults).catch(err => console.error('[Mongo Reset Error]', err));
  return defaults;
}

// -------------------------------------------------------------
// MONGODB CONNECTION & SEEDING ENGINE
// -------------------------------------------------------------
export async function initMongo(): Promise<boolean> {
  const uri = mongoStatus.uri;
  try {
    console.log(`[MongoDB] Connecting to ${uri}...`);
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000,
      connectTimeoutMS: 5000
    });

    mongoStatus.connected = true;
    mongoStatus.lastSync = new Date().toISOString();
    mongoStatus.error = null;
    console.log('[MongoDB] Connected successfully to motopro_pos database!');

    // Check if initial seeding is needed
    const count = await ProductModel.countDocuments();
    if (count === 0) {
      console.log('[MongoDB] Database is empty. Seeding all motorcycle collections from defaults...');
      const db = getDb();
      await seedMongoFromData(db);
      console.log('[MongoDB] Seeding completed successfully!');
    } else {
      console.log(`[MongoDB] Database contains ${count} products. Loading latest state into memory...`);
      await loadMongoIntoMemory();
    }

    return true;
  } catch (err: any) {
    mongoStatus.connected = false;
    mongoStatus.error = err.message;
    console.warn(`[MongoDB Warning] Could not connect to MongoDB: ${err.message}. System operating in resilient local storage mode.`);
    return false;
  }
}

export async function seedMongoFromData(db: AppDatabase) {
  if (!mongoStatus.connected) return;

  try {
    await Promise.all([
      ProductModel.deleteMany({}),
      CategoryModel.deleteMany({}),
      BrandModel.deleteMany({}),
      CustomerModel.deleteMany({}),
      SupplierModel.deleteMany({}),
      InvoiceModel.deleteMany({}),
      PurchaseModel.deleteMany({}),
      ExpenseModel.deleteMany({}),
      CashbookModel.deleteMany({}),
      StockAdjustmentModel.deleteMany({}),
      DamagedStockModel.deleteMany({}),
      SalesReturnModel.deleteMany({}),
      QuotationModel.deleteMany({}),
      CampaignModel.deleteMany({}),
      ShiftClosingModel.deleteMany({}),
      AuditLogModel.deleteMany({}),
      UserModel.deleteMany({}),
      CounterModel.deleteMany({}),
    ]);

    const clean = (arr: any[]) => arr ? arr.map(item => {
      const { _id, ...rest } = item;
      return rest;
    }) : [];

    if (db.products?.length) await ProductModel.insertMany(clean(db.products), { ordered: false });
    if (db.categories?.length) await CategoryModel.insertMany(clean(db.categories), { ordered: false });
    if (db.brands?.length) await BrandModel.insertMany(clean(db.brands), { ordered: false });
    if (db.customers?.length) await CustomerModel.insertMany(clean(db.customers), { ordered: false });
    if (db.suppliers?.length) await SupplierModel.insertMany(clean(db.suppliers), { ordered: false });
    if (db.invoices?.length) await InvoiceModel.insertMany(clean(db.invoices), { ordered: false });
    if (db.purchases?.length) await PurchaseModel.insertMany(clean(db.purchases), { ordered: false });
    if (db.expenses?.length) await ExpenseModel.insertMany(clean(db.expenses), { ordered: false });
    if (db.cashbook?.length) await CashbookModel.insertMany(clean(db.cashbook), { ordered: false });
    if (db.stockAdjustments?.length) await StockAdjustmentModel.insertMany(clean(db.stockAdjustments), { ordered: false });
    if (db.damagedStock?.length) await DamagedStockModel.insertMany(clean(db.damagedStock), { ordered: false });
    if (db.salesReturns?.length) await SalesReturnModel.insertMany(clean(db.salesReturns), { ordered: false });
    if (db.quotations?.length) await QuotationModel.insertMany(clean(db.quotations), { ordered: false });
    if (db.campaigns?.length) await CampaignModel.insertMany(clean(db.campaigns), { ordered: false });
    if (db.shiftClosings?.length) await ShiftClosingModel.insertMany(clean(db.shiftClosings), { ordered: false });
    if (db.auditLogs?.length) await AuditLogModel.insertMany(clean(db.auditLogs), { ordered: false });
    if (db.users?.length) await UserModel.insertMany(clean(db.users), { ordered: false });
    if (db.counters?.length) await CounterModel.insertMany(clean(db.counters), { ordered: false });

    mongoStatus.lastSync = new Date().toISOString();
  } catch (err: any) {
    console.error('[MongoDB Seed Error]', err);
  }
}

export async function loadMongoIntoMemory(): Promise<void> {
  if (!mongoStatus.connected) return;

  try {
    const [
      products, categories, brands, customers, suppliers,
      invoices, purchases, expenses, cashbook, stockAdjustments,
      damagedStock, salesReturns, quotations, campaigns,
      shiftClosings, auditLogs, users, counters
    ] = await Promise.all([
      ProductModel.find({}).lean(),
      CategoryModel.find({}).lean(),
      BrandModel.find({}).lean(),
      CustomerModel.find({}).lean(),
      SupplierModel.find({}).lean(),
      InvoiceModel.find({}).lean(),
      PurchaseModel.find({}).lean(),
      ExpenseModel.find({}).lean(),
      CashbookModel.find({}).lean(),
      StockAdjustmentModel.find({}).lean(),
      DamagedStockModel.find({}).lean(),
      SalesReturnModel.find({}).lean(),
      QuotationModel.find({}).lean(),
      CampaignModel.find({}).lean(),
      ShiftClosingModel.find({}).lean(),
      AuditLogModel.find({}).lean(),
      UserModel.find({}).lean(),
      CounterModel.find({}).lean(),
    ]);

    cachedDb = {
      products: (products as any) || [],
      categories: (categories as any) || [],
      brands: (brands as any) || [],
      customers: (customers as any) || [],
      suppliers: (suppliers as any) || [],
      invoices: (invoices as any) || [],
      purchases: (purchases as any) || [],
      expenses: (expenses as any) || [],
      cashbook: (cashbook as any) || [],
      stockAdjustments: (stockAdjustments as any) || [],
      damagedStock: (damagedStock as any) || [],
      stockMovements: [],
      salesReturns: (salesReturns as any) || [],
      quotations: (quotations as any) || [],
      campaigns: (campaigns as any) || [],
      shiftClosings: (shiftClosings as any) || [],
      auditLogs: (auditLogs as any) || [],
      users: (users as any) || [],
      counters: (counters as any) || [],
      managerPin: '1234'
    };

    // Save synced memory to local backup store
    if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
    fs.writeFileSync(DB_FILE, JSON.stringify(cachedDb, null, 2), 'utf-8');
    mongoStatus.lastSync = new Date().toISOString();
  } catch (err: any) {
    console.error('[MongoDB Load Error]', err);
  }
}

export async function syncMemoryToMongo(db: AppDatabase): Promise<void> {
  if (!mongoStatus.connected) return;

  try {
    // Bulk upsert key collections
    const productOps = db.products.map(p => ({
      updateOne: { filter: { id: p.id }, update: { $set: p }, upsert: true }
    }));
    if (productOps.length) await ProductModel.bulkWrite(productOps);

    const customerOps = db.customers.map(c => ({
      updateOne: { filter: { id: c.id }, update: { $set: c }, upsert: true }
    }));
    if (customerOps.length) await CustomerModel.bulkWrite(customerOps);

    const supplierOps = db.suppliers.map(s => ({
      updateOne: { filter: { id: s.id }, update: { $set: s }, upsert: true }
    }));
    if (supplierOps.length) await SupplierModel.bulkWrite(supplierOps);

    const counterOps = db.counters.map(c => ({
      updateOne: { filter: { id: c.id }, update: { $set: c }, upsert: true }
    }));
    if (counterOps.length) await CounterModel.bulkWrite(counterOps);

    const userOps = db.users.map(u => ({
      updateOne: { filter: { id: u.id }, update: { $set: u }, upsert: true }
    }));
    if (userOps.length) await UserModel.bulkWrite(userOps);

    // Invoices, Purchases, Cashbook, Expenses, AuditLogs: insert new records
    if (db.invoices.length) {
      const invOps = db.invoices.map(i => ({
        updateOne: { filter: { id: i.id }, update: { $set: i }, upsert: true }
      }));
      await InvoiceModel.bulkWrite(invOps);
    }

    if (db.purchases.length) {
      const poOps = db.purchases.map(po => ({
        updateOne: { filter: { id: po.id }, update: { $set: po }, upsert: true }
      }));
      await PurchaseModel.bulkWrite(poOps);
    }

    if (db.cashbook.length) {
      const cbOps = db.cashbook.slice(0, 100).map(cb => ({
        updateOne: { filter: { id: cb.id }, update: { $set: cb }, upsert: true }
      }));
      await CashbookModel.bulkWrite(cbOps);
    }

    if (db.expenses.length) {
      const expOps = db.expenses.map(e => ({
        updateOne: { filter: { id: e.id }, update: { $set: e }, upsert: true }
      }));
      await ExpenseModel.bulkWrite(expOps);
    }

    if (db.quotations.length) {
      const quoOps = db.quotations.map(q => ({
        updateOne: { filter: { id: q.id }, update: { $set: q }, upsert: true }
      }));
      await QuotationModel.bulkWrite(quoOps);
    }

    if (db.auditLogs.length) {
      const audOps = db.auditLogs.slice(0, 50).map(a => ({
        updateOne: { filter: { id: a.id }, update: { $set: a }, upsert: true }
      }));
      await AuditLogModel.bulkWrite(audOps);
    }

    mongoStatus.lastSync = new Date().toISOString();
  } catch (err: any) {
    console.error('[MongoDB Sync Error]', err.message);
  }
}
