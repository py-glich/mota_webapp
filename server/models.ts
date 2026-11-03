import mongoose, { Schema } from 'mongoose';

// 1. Product Schema
const productSchema = new Schema({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  urduName: { type: String },
  sku: { type: String, required: true, unique: true },
  barcode: { type: String, required: true, unique: true },
  categoryId: { type: String, required: true },
  subCategory: { type: String },
  brandId: { type: String, required: true },
  compatibleModels: [{ type: String }],
  unit: { type: String, default: 'Pcs' },
  purchasePrice: { type: Number, required: true },
  salePrice: { type: Number, required: true },
  wholesalePrice: { type: Number, default: 0 },
  mechanicPrice: { type: Number, default: 0 },
  currentStock: { type: Number, default: 0 },
  minStockAlert: { type: Number, default: 5 },
  location: {
    rack: { type: String, default: 'General' },
    shelf: { type: String, default: '1' },
    bin: { type: String }
  },
  description: { type: String },
  imageUrl: { type: String },
  isArchived: { type: Boolean, default: false },
  damagedStock: { type: Number, default: 0 },
  createdAt: { type: String }
}, { timestamps: true });

// 2. Category Schema
const categorySchema = new Schema({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  urduName: { type: String },
  description: { type: String },
  itemCount: { type: Number, default: 0 }
});

// 3. Brand Schema
const brandSchema = new Schema({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  origin: { type: String },
  description: { type: String }
});

// 4. Customer Schema
const customerSchema = new Schema({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  phone: { type: String, required: true },
  group: { type: String, default: 'Retail Customer' },
  address: { type: String },
  bikeModel: { type: String },
  bikePlateNo: { type: String },
  creditLimit: { type: Number, default: 10000 },
  receivableBalance: { type: Number, default: 0 },
  totalPurchases: { type: Number, default: 0 },
  loyaltyPoints: { type: Number, default: 0 },
  loyaltyTier: { type: String, default: 'Bronze' },
  lastPurchaseDate: { type: String },
  notes: { type: String }
}, { timestamps: true });

// 5. Supplier Schema
const supplierSchema = new Schema({
  id: { type: String, required: true, unique: true },
  companyName: { type: String, required: true },
  contactPerson: { type: String },
  phone: { type: String, required: true },
  email: { type: String },
  address: { type: String },
  city: { type: String, default: 'Lahore' },
  taxNumber: { type: String },
  payableBalance: { type: Number, default: 0 },
  paymentTerms: { type: String, default: 'Net 15 Days' },
  productsSupplied: [{ type: String }]
}, { timestamps: true });

// 6. Sales Invoice Schema
const salesInvoiceSchema = new Schema({
  id: { type: String, required: true, unique: true },
  invoiceNumber: { type: String, required: true, unique: true },
  counterId: { type: String, required: true },
  counterName: { type: String, required: true },
  cashierId: { type: String, required: true },
  cashierName: { type: String, required: true },
  customerId: { type: String, required: true },
  customerName: { type: String, required: true },
  customerPhone: { type: String },
  items: [{
    product: { type: Schema.Types.Mixed, required: true },
    quantity: { type: Number, required: true },
    unitPrice: { type: Number, required: true },
    discountPercent: { type: Number, default: 0 },
    discountAmount: { type: Number, default: 0 },
    total: { type: Number, required: true },
    notes: { type: String }
  }],
  subtotal: { type: Number, required: true },
  taxAmount: { type: Number, default: 0 },
  discountAmount: { type: Number, default: 0 },
  pointsDiscountAmount: { type: Number, default: 0 },
  pointsRedeemed: { type: Number, default: 0 },
  grandTotal: { type: Number, required: true },
  paidAmount: { type: Number, required: true },
  changeDue: { type: Number, default: 0 },
  paymentMethod: { type: String, default: 'cash' },
  splitDetails: {
    cashAmount: { type: Number, default: 0 },
    bankAmount: { type: Number, default: 0 },
    creditAmount: { type: Number, default: 0 }
  },
  status: { type: String, default: 'completed' },
  voidReason: { type: String },
  voidedBy: { type: String },
  voidedAt: { type: String },
  createdAt: { type: String, required: true },
  urduNote: { type: String }
}, { timestamps: true });

// 7. Purchase Invoice Schema
const purchaseInvoiceSchema = new Schema({
  id: { type: String, required: true, unique: true },
  invoiceNumber: { type: String, required: true, unique: true },
  supplierId: { type: String, required: true },
  supplierName: { type: String, required: true },
  supplierInvoiceRef: { type: String },
  purchaseDate: { type: String, required: true },
  items: [{
    productId: { type: String, required: true },
    productName: { type: String, required: true },
    sku: { type: String },
    quantity: { type: Number, required: true },
    unitCost: { type: Number, required: true },
    taxPercent: { type: Number, default: 0 },
    discountAmount: { type: Number, default: 0 },
    total: { type: Number, required: true }
  }],
  subtotal: { type: Number, required: true },
  taxTotal: { type: Number, default: 0 },
  discountTotal: { type: Number, default: 0 },
  grandTotal: { type: Number, required: true },
  paidAmount: { type: Number, default: 0 },
  balanceDue: { type: Number, default: 0 },
  paymentStatus: { type: String, default: 'paid' },
  status: { type: String, default: 'received' },
  notes: { type: String },
  createdAt: { type: String }
}, { timestamps: true });

// 8. Expense Schema
const expenseSchema = new Schema({
  id: { type: String, required: true, unique: true },
  date: { type: String, required: true },
  category: { type: String, required: true },
  amount: { type: Number, required: true },
  paidFromCounter: { type: String, required: true },
  paidBy: { type: String, required: true },
  receiptVoucherNo: { type: String },
  notes: { type: String }
}, { timestamps: true });

// 9. Cashbook Schema
const cashbookSchema = new Schema({
  id: { type: String, required: true, unique: true },
  counterId: { type: String, required: true },
  date: { type: String, required: true },
  type: { type: String, enum: ['in', 'out'], required: true },
  category: { type: String, required: true },
  amount: { type: Number, required: true },
  description: { type: String, required: true },
  referenceId: { type: String },
  performedBy: { type: String, required: true }
}, { timestamps: true });

// 10. Stock Adjustment Schema
const stockAdjustmentSchema = new Schema({
  id: { type: String, required: true, unique: true },
  productId: { type: String, required: true },
  productName: { type: String, required: true },
  previousStock: { type: Number, required: true },
  newStock: { type: Number, required: true },
  difference: { type: Number, required: true },
  reason: { type: String, required: true },
  status: { type: String, enum: ['approved', 'rejected', 'pending'], default: 'approved' },
  authorizedBy: { type: String, required: true },
  timestamp: { type: String, required: true }
}, { timestamps: true });

// 11. Damaged Stock Schema
const damagedStockSchema = new Schema({
  id: { type: String, required: true, unique: true },
  productId: { type: String, required: true },
  productName: { type: String, required: true },
  quantity: { type: Number, required: true },
  lossValue: { type: Number, required: true },
  reason: { type: String, required: true },
  recordedBy: { type: String, required: true },
  date: { type: String, required: true },
  status: { type: String, default: 'disposed' }
}, { timestamps: true });

// 12. Sales Return Schema
const salesReturnSchema = new Schema({
  id: { type: String, required: true, unique: true },
  returnNumber: { type: String, required: true, unique: true },
  invoiceId: { type: String, required: true },
  invoiceNumber: { type: String, required: true },
  customerName: { type: String, required: true },
  items: [{
    productId: { type: String, required: true },
    productName: { type: String, required: true },
    quantity: { type: Number, required: true },
    unitPrice: { type: Number, required: true },
    refundAmount: { type: Number, required: true },
    condition: { type: String, default: 'resalable' },
    reason: { type: String }
  }],
  totalRefund: { type: Number, required: true },
  refundMethod: { type: String, default: 'cash' },
  stockRestored: { type: Boolean, default: true },
  approvedBy: { type: String, required: true },
  notes: { type: String },
  createdAt: { type: String, required: true }
}, { timestamps: true });

// 13. Quotation Schema
const quotationSchema = new Schema({
  id: { type: String, required: true, unique: true },
  quoteNumber: { type: String, required: true, unique: true },
  customerId: { type: String, required: true },
  customerName: { type: String, required: true },
  customerPhone: { type: String },
  bikeModel: { type: String },
  validUntil: { type: String, required: true },
  items: [{
    product: { type: Schema.Types.Mixed, required: true },
    quantity: { type: Number, required: true },
    unitPrice: { type: Number, required: true },
    discountPercent: { type: Number, default: 0 },
    discountAmount: { type: Number, default: 0 },
    total: { type: Number, required: true }
  }],
  subtotal: { type: Number, required: true },
  discountAmount: { type: Number, default: 0 },
  grandTotal: { type: Number, required: true },
  status: { type: String, default: 'sent' },
  notes: { type: String },
  convertedInvoiceId: { type: String },
  createdAt: { type: String, required: true }
}, { timestamps: true });

// 14. Marketing Campaign Schema
const campaignSchema = new Schema({
  id: { type: String, required: true, unique: true },
  title: { type: String, required: true },
  type: { type: String, enum: ['whatsapp', 'sms'], default: 'whatsapp' },
  targetGroup: { type: String, required: true },
  messageContent: { type: String, required: true },
  scheduledDate: { type: String, required: true },
  status: { type: String, default: 'draft' },
  recipientCount: { type: Number, default: 0 }
}, { timestamps: true });

// 15. Shift Closing Schema
const shiftClosingSchema = new Schema({
  id: { type: String, required: true, unique: true },
  counterId: { type: String, required: true },
  counterName: { type: String, required: true },
  cashierName: { type: String, required: true },
  date: { type: String, required: true },
  openingCash: { type: Number, required: true },
  cashSales: { type: Number, required: true },
  cashReceivedOnAccount: { type: Number, default: 0 },
  cashExpenses: { type: Number, default: 0 },
  cashPaidToSuppliers: { type: Number, default: 0 },
  expectedDrawerCash: { type: Number, required: true },
  actualDrawerCash: { type: Number, required: true },
  discrepancy: { type: Number, default: 0 },
  status: { type: String, default: 'balanced' },
  notes: { type: String },
  closedAt: { type: String, required: true }
}, { timestamps: true });

// 16. Audit Log Schema
const auditLogSchema = new Schema({
  id: { type: String, required: true, unique: true },
  timestamp: { type: String, required: true },
  userId: { type: String, required: true },
  userName: { type: String, required: true },
  userRole: { type: String, required: true },
  counterName: { type: String, default: 'Counter 1' },
  module: { type: String, required: true },
  action: { type: String, required: true },
  severity: { type: String, default: 'info' },
  details: { type: String, required: true }
}, { timestamps: true });

// 17. User Schema
const userSchema = new Schema({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  username: { type: String, required: true, unique: true },
  email: { type: String },
  password: { type: String, default: '123456' },
  role: { type: String, default: 'cashier' },
  counterId: { type: String },
  active: { type: Boolean, default: true },
  phone: { type: String },
  avatar: { type: String },
  lastLogin: { type: String },
  permissions: {
    canViewPurchasePrice: { type: Boolean, default: true },
    canViewProfit: { type: Boolean, default: true },
    canOverridePrice: { type: Boolean, default: true },
    canApplyCustomDiscount: { type: Boolean, default: true },
    maxDiscountPercent: { type: Number, default: 20 },
    canVoidInvoice: { type: Boolean, default: true },
    canEditInvoice: { type: Boolean, default: true },
    canAdjustStock: { type: Boolean, default: true },
    canViewFinancials: { type: Boolean, default: true },
    canManageUsers: { type: Boolean, default: false },
    canManageBackups: { type: Boolean, default: false },
    canApproveReturns: { type: Boolean, default: true },
    canCashierRegisterCustomers: { type: Boolean, default: true },
    canCashierReceivePayments: { type: Boolean, default: true },
    canCashierCreateQuotes: { type: Boolean, default: true },
    canCashierFlagDamaged: { type: Boolean, default: true },
    canCashierCloseShift: { type: Boolean, default: true }
  }
}, { timestamps: true });

// 18. Counter Schema
const counterSchema = new Schema({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  code: { type: String, required: true },
  description: { type: String },
  activeCashierId: { type: String },
  openingCash: { type: Number, default: 0 },
  currentCash: { type: Number, default: 0 },
  status: { type: String, default: 'open' },
  shiftStartTime: { type: String },
  todaySalesCount: { type: Number, default: 0 },
  todaySalesAmount: { type: Number, default: 0 }
}, { timestamps: true });

// Export Models
export const ProductModel = mongoose.models.Product || mongoose.model('Product', productSchema);
export const CategoryModel = mongoose.models.Category || mongoose.model('Category', categorySchema);
export const BrandModel = mongoose.models.Brand || mongoose.model('Brand', brandSchema);
export const CustomerModel = mongoose.models.Customer || mongoose.model('Customer', customerSchema);
export const SupplierModel = mongoose.models.Supplier || mongoose.model('Supplier', supplierSchema);
export const InvoiceModel = mongoose.models.SalesInvoice || mongoose.model('SalesInvoice', salesInvoiceSchema);
export const PurchaseModel = mongoose.models.PurchaseInvoice || mongoose.model('PurchaseInvoice', purchaseInvoiceSchema);
export const ExpenseModel = mongoose.models.Expense || mongoose.model('Expense', expenseSchema);
export const CashbookModel = mongoose.models.Cashbook || mongoose.model('Cashbook', cashbookSchema);
export const StockAdjustmentModel = mongoose.models.StockAdjustment || mongoose.model('StockAdjustment', stockAdjustmentSchema);
export const DamagedStockModel = mongoose.models.DamagedStock || mongoose.model('DamagedStock', damagedStockSchema);
export const SalesReturnModel = mongoose.models.SalesReturn || mongoose.model('SalesReturn', salesReturnSchema);
export const QuotationModel = mongoose.models.Quotation || mongoose.model('Quotation', quotationSchema);
export const CampaignModel = mongoose.models.Campaign || mongoose.model('Campaign', campaignSchema);
export const ShiftClosingModel = mongoose.models.ShiftClosing || mongoose.model('ShiftClosing', shiftClosingSchema);
export const AuditLogModel = mongoose.models.AuditLog || mongoose.model('AuditLog', auditLogSchema);
export const UserModel = mongoose.models.User || mongoose.model('User', userSchema);
export const CounterModel = mongoose.models.Counter || mongoose.model('Counter', counterSchema);
