// CYBERORION - Complete System Types covering all 18 Modules

export type Role = 'owner' | 'manager' | 'cashier' | 'storekeeper';

export interface UserPermissions {
  canViewPurchasePrice: boolean;
  canViewProfit: boolean;
  canOverridePrice: boolean;
  canApplyCustomDiscount: boolean;
  maxDiscountPercent: number;
  canVoidInvoice: boolean;
  canEditInvoice: boolean;
  canAdjustStock: boolean;
  canViewFinancials: boolean;
  canManageUsers: boolean;
  canManageBackups: boolean;
  canApproveReturns: boolean;
  // Intelligent Cashier Management Delegations
  canCashierRegisterCustomers?: boolean;
  canCashierReceivePayments?: boolean;
  canCashierCreateQuotes?: boolean;
  canCashierFlagDamaged?: boolean;
  canCashierCloseShift?: boolean;
}

export interface User {
  id: string;
  name: string;
  username: string;
  email: string;
  password?: string;
  role: Role;
  counterId?: string; // e.g. 'CTR-1' or 'CTR-2'
  active: boolean;
  phone: string;
  avatar?: string;
  lastLogin?: string;
  permissions: UserPermissions;
}

export interface Counter {
  id: string;
  name: string;
  code: string;
  description: string;
  activeCashierId?: string;
  openingCash: number;
  currentCash: number;
  status: 'open' | 'closed';
  shiftStartTime?: string;
  todaySalesCount: number;
  todaySalesAmount: number;
}

export interface Category {
  id: string;
  name: string;
  urduName?: string;
  description?: string;
  itemCount: number;
}

export interface Brand {
  id: string;
  name: string;
  origin?: string;
  description?: string;
}

export interface Product {
  id: string;
  name: string;
  urduName?: string;
  sku: string;
  barcode: string;
  categoryId: string;
  subCategory?: string;
  brandId: string;
  compatibleModels: string[]; // e.g., ['Honda CD70', 'Honda CG125', 'Yamaha YBR125']
  unit: 'Pcs' | 'Set' | 'Liter' | 'Box' | 'Pair' | 'Meter';
  purchasePrice: number;
  salePrice: number;
  wholesalePrice: number;
  mechanicPrice: number;
  currentStock: number;
  minStockAlert: number;
  location: {
    rack: string;
    shelf: string;
    bin?: string;
  };
  description?: string;
  imageUrl?: string;
  isArchived: boolean;
  damagedStock: number;
  createdAt: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
  unitPrice: number;
  discountPercent: number;
  discountAmount: number;
  total: number;
  notes?: string;
}

export type PaymentMethod = 'cash' | 'credit' | 'bank' | 'split';

export interface SalesInvoice {
  id: string;
  invoiceNumber: string;
  counterId: string;
  counterName: string;
  cashierId: string;
  cashierName: string;
  customerId: string;
  customerName: string;
  customerPhone?: string;
  items: CartItem[];
  subtotal: number;
  taxAmount: number;
  discountAmount: number;
  pointsDiscountAmount: number;
  pointsRedeemed: number;
  grandTotal: number;
  paidAmount: number;
  changeDue: number;
  paymentMethod: PaymentMethod;
  splitDetails?: {
    cashAmount: number;
    bankAmount: number;
    creditAmount: number;
  };
  status: 'completed' | 'voided' | 'returned' | 'partial_returned';
  voidReason?: string;
  voidedBy?: string;
  voidedAt?: string;
  createdAt: string;
  urduNote?: string;
  greeting?: string;
}

export interface PurchaseItem {
  productId: string;
  productName: string;
  sku: string;
  quantity: number;
  unitCost: number;
  taxPercent: number;
  discountAmount: number;
  total: number;
}

export interface PurchaseInvoice {
  id: string;
  invoiceNumber: string;
  supplierId: string;
  supplierName: string;
  supplierInvoiceRef: string;
  purchaseDate: string;
  items: PurchaseItem[];
  subtotal: number;
  taxAmount: number;
  discountAmount: number;
  grandTotal: number;
  paidAmount: number;
  balanceDue: number;
  paymentStatus: 'paid' | 'partial' | 'unpaid';
  status: 'posted' | 'draft' | 'cancelled';
  notes?: string;
  createdAt: string;
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  address?: string;
  bikeModel?: string;
  regNumber?: string;
  group: 'Walk-in' | 'Regular' | 'Mechanic' | 'Wholesale' | 'VIP';
  receivableBalance: number;
  creditLimit: number;
  loyaltyPoints: number;
  loyaltyTier: 'Bronze' | 'Silver' | 'Gold';
  totalPurchases: number;
  lastPurchaseDate?: string;
  reminders?: CustomerReminder[];
}

export interface CustomerReminder {
  id: string;
  title: string;
  dueDate: string;
  status: 'pending' | 'completed' | 'overdue';
  bikeDetail?: string;
}

export interface Supplier {
  id: string;
  name: string;
  companyName: string;
  phone: string;
  email?: string;
  address?: string;
  ntn?: string;
  payableBalance: number;
  creditTermsDays: number;
  contactPerson: string;
}

export interface StockAdjustment {
  id: string;
  productId: string;
  productName: string;
  oldStock: number;
  newStock: number;
  difference: number;
  reason: 'Audit Correction' | 'Damaged Found' | 'Theft / Missing' | 'Found Surplus' | 'Supplier Replacement';
  status: 'approved' | 'pending' | 'rejected';
  requestedBy: string;
  approvedBy?: string;
  timestamp: string;
  notes?: string;
}

export interface DamagedStockRecord {
  id: string;
  productId: string;
  productName: string;
  quantity: number;
  lossValue: number;
  reason: string;
  recordedBy: string;
  date: string;
  status: 'disposed' | 'under_review' | 'supplier_claim';
}

export interface StockMovement {
  id: string;
  productId: string;
  productName: string;
  type: 'sale' | 'purchase' | 'adjustment' | 'return_in' | 'return_out' | 'damaged';
  quantityChange: number;
  stockAfter: number;
  referenceNumber: string;
  performedBy: string;
  timestamp: string;
}

export interface SalesReturn {
  id: string;
  returnNumber: string;
  invoiceId: string;
  invoiceNumber: string;
  customerId: string;
  customerName: string;
  returnedItems: {
    productId: string;
    productName: string;
    quantity: number;
    unitPrice: number;
    condition: 'resalable' | 'damaged';
    restocked: boolean;
  }[];
  totalRefundAmount: number;
  refundMethod: 'cash' | 'credit_to_ledger' | 'exchange';
  reason: string;
  authorizedBy: string;
  createdAt: string;
}

export interface PurchaseReturnItem {
  productId: string;
  productName: string;
  quantity: number;
  purchasePrice: number;
  total: number;
  reason: string;
}

export interface PurchaseReturn {
  id: string;
  returnNumber: string;
  purchaseId?: string;
  purchaseInvoiceNumber?: string;
  supplierId: string;
  supplierName: string;
  returnedItems: PurchaseReturnItem[];
  totalRefundAmount: number;
  refundMethod: 'supplier_ledger' | 'cash';
  returnReason: string;
  authorizedBy: string;
  createdAt: string;
}

export interface Quotation {
  id: string;
  quoteNumber: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  bikeModel?: string;
  validUntil: string;
  items: CartItem[];
  subtotal: number;
  discountAmount: number;
  grandTotal: number;
  status: 'draft' | 'sent' | 'approved' | 'expired' | 'converted';
  notes?: string;
  convertedInvoiceId?: string;
  createdAt: string;
}

export interface CashbookEntry {
  id: string;
  counterId: string;
  date: string;
  type: 'in' | 'out';
  category: 'Sales Receipt' | 'Customer Payment' | 'Supplier Payment' | 'Supplier Refund' | 'Expense' | 'Cash Transfer' | 'Owner Drawing' | 'Capital In';
  amount: number;
  description: string;
  referenceId?: string;
  performedBy: string;
}

export interface ExpenseRecord {
  id: string;
  date: string;
  category: 'Shop Rent' | 'Electricity & Utilities' | 'Staff Salaries & Wages' | 'Shop Refreshment & Tea' | 'Stationery & Receipt Paper' | 'Maintenance & Tools' | 'Marketing' | 'Misc';
  amount: number;
  paidFromCounter: string;
  paidBy: string;
  receiptVoucherNo: string;
  notes?: string;
}

export interface ShiftClosing {
  id: string;
  counterId: string;
  counterName: string;
  cashierName: string;
  date: string;
  openingCash: number;
  cashSales: number;
  cashReceivedOnAccount: number;
  cashExpenses: number;
  cashPaidToSuppliers: number;
  expectedDrawerCash: number;
  actualDrawerCash: number;
  discrepancy: number; // actual - expected (negative is shortage)
  status: 'balanced' | 'surplus' | 'shortage';
  notes?: string;
  closedAt: string;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  userId: string;
  userName: string;
  userRole: Role;
  counterName: string;
  module: 'POS' | 'Inventory' | 'Purchases' | 'Customers' | 'Suppliers' | 'Accounting' | 'Settings' | 'Users' | 'Returns' | 'Quotations' | 'Marketing';
  action: string;
  severity: 'info' | 'warning' | 'critical';
  details: string;
}

export interface MarketingCampaign {
  id: string;
  title: string;
  type: 'whatsapp' | 'sms';
  targetGroup: string;
  messageContent: string;
  scheduledDate: string;
  status: 'draft' | 'sent' | 'active';
  recipientCount: number;
}

export interface SmsGatewayConfig {
  provider: 'brand_sms' | 'twilio' | 'sms_country' | 'telnyx' | 'custom_http';
  senderId: string;
  apiKey: string;
  apiSecret?: string;
  endpointUrl?: string;
  creditsRemaining: number;
  status: 'active' | 'disconnected';
}

export interface SmsLogEntry {
  id: string;
  customerId?: string;
  customerName: string;
  phoneNumber: string;
  message: string;
  templateType: 'payment_reminder' | 'offer' | 'custom' | 'parts_arrival';
  characterCount: number;
  smsUnits: number;
  status: 'delivered' | 'sent' | 'failed';
  timestamp: string;
}
