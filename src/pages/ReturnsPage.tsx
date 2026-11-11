import React, { useState } from 'react';
import { 
  RotateCcw, Search, CheckCircle, AlertTriangle, ArrowRight, 
  DollarSign, Package, User, Plus, X, Truck, FileText, Printer, 
  ArrowLeftRight, ShieldCheck, Clock
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { SalesInvoice, SalesReturn, PurchaseReturn, Supplier, Product } from '../types';

export const ReturnsPage: React.FC = () => {
  const { 
    invoices, salesReturns, processSalesReturn, 
    purchases, suppliers, products, purchaseReturns, processPurchaseReturn 
  } = useApp();
  const { currentUser, hasPermission } = useAuth();

  // Active Tab: Sales Returns vs Purchase Returns
  const [activeTab, setActiveTab] = useState<'sales' | 'purchases'>('sales');

  // -------------------------------------------------------------
  // 1. SALES RETURN STATE
  // -------------------------------------------------------------
  const [searchInvoiceNo, setSearchInvoiceNo] = useState('');
  const [searchedInvoice, setSearchedInvoice] = useState<SalesInvoice | null>(null);
  const [returnItems, setReturnItems] = useState<{ [productId: string]: { qty: number; condition: 'resalable' | 'damaged' } }>({});
  const [refundMethod, setRefundMethod] = useState<'cash' | 'credit_to_ledger' | 'exchange'>('cash');
  const [returnReason, setReturnReason] = useState('Customer wrong part selection / Mechanic advice');

  // -------------------------------------------------------------
  // 2. PURCHASE RETURN STATE (Supplier Returns)
  // -------------------------------------------------------------
  const [showNewPurchaseReturn, setShowNewPurchaseReturn] = useState(false);
  const [selectedSupplierId, setSelectedSupplierId] = useState<string>(suppliers[0]?.id || '');
  const [poRefNumber, setPoRefNumber] = useState('');
  const [prRefundMethod, setPrRefundMethod] = useState<'supplier_ledger' | 'cash'>('supplier_ledger');
  const [prReason, setPrReason] = useState('Factory defective / Damaged in transit');
  
  // Dynamic items list for purchase return
  const [prItems, setPrItems] = useState<{
    productId: string;
    productName: string;
    quantity: number;
    purchasePrice: number;
    reason: string;
  }[]>([
    {
      productId: products[0]?.id || '',
      productName: products[0]?.name || '',
      quantity: 1,
      purchasePrice: products[0]?.purchasePrice || 0,
      reason: 'Defective batch tolerance'
    }
  ]);

  // Selected Debit Note for Printing
  const [selectedDebitNote, setSelectedDebitNote] = useState<PurchaseReturn | null>(null);
  const [supplierFilter, setSupplierFilter] = useState<string>('All');

  // -------------------------------------------------------------
  // HANDLERS: SALES RETURNS
  // -------------------------------------------------------------
  const handleSearchInvoice = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchInvoiceNo.trim()) return;
    const inv = invoices.find(i => i.invoiceNumber.toLowerCase() === searchInvoiceNo.trim().toLowerCase());
    if (inv) {
      if (inv.status === 'voided') {
        alert('This invoice is already voided. No returns can be processed against voided bills.');
        return;
      }
      setSearchedInvoice(inv);
      const map: { [productId: string]: { qty: number; condition: 'resalable' | 'damaged' } } = {};
      inv.items.forEach(i => {
        map[i.product.id] = { qty: 0, condition: 'resalable' };
      });
      setReturnItems(map);
    } else {
      alert(`Invoice "${searchInvoiceNo}" not found.`);
    }
  };

  const handleReturnSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchedInvoice) return;

    if (!hasPermission('canApproveReturns')) {
      alert('Permission Denied: Supervisor / Manager approval required to process customer sales returns.');
      return;
    }

    const itemsToReturn: SalesReturn['returnedItems'] = [];
    let refundTotal = 0;

    searchedInvoice.items.forEach(item => {
      const entry = returnItems[item.product.id];
      if (entry && entry.qty > 0) {
        const lineRefund = entry.qty * item.unitPrice;
        refundTotal += lineRefund;
        itemsToReturn.push({
          productId: item.product.id,
          productName: item.product.name,
          quantity: entry.qty,
          unitPrice: item.unitPrice,
          condition: entry.condition,
          restocked: entry.condition === 'resalable'
        });
      }
    });

    if (itemsToReturn.length === 0) {
      alert('Please specify return quantity for at least one item.');
      return;
    }

    processSalesReturn({
      invoiceId: searchedInvoice.id,
      invoiceNumber: searchedInvoice.invoiceNumber,
      customerId: searchedInvoice.customerId,
      customerName: searchedInvoice.customerName,
      returnedItems: itemsToReturn,
      totalRefundAmount: refundTotal,
      refundMethod,
      reason: returnReason,
      authorizedBy: currentUser?.name || 'Manager'
    });

    alert(`Customer return processed for Rs. ${refundTotal.toLocaleString()}! Stock and balances updated.`);
    setSearchedInvoice(null);
    setSearchInvoiceNo('');
    setReturnItems({});
  };

  // -------------------------------------------------------------
  // HANDLERS: PURCHASE RETURNS
  // -------------------------------------------------------------
  const handleAddPrItem = () => {
    const firstProd = products[0];
    setPrItems(prev => [
      ...prev,
      {
        productId: firstProd?.id || '',
        productName: firstProd?.name || '',
        quantity: 1,
        purchasePrice: firstProd?.purchasePrice || 0,
        reason: 'Defective batch tolerance'
      }
    ]);
  };

  const handleRemovePrItem = (index: number) => {
    if (prItems.length <= 1) return;
    setPrItems(prev => prev.filter((_, idx) => idx !== index));
  };

  const handlePrItemChange = (index: number, field: string, value: any) => {
    setPrItems(prev => prev.map((item, idx) => {
      if (idx !== index) return item;
      if (field === 'productId') {
        const selected = products.find(p => p.id === value);
        return {
          ...item,
          productId: value,
          productName: selected?.name || item.productName,
          purchasePrice: selected?.purchasePrice || item.purchasePrice
        };
      }
      return { ...item, [field]: value };
    }));
  };

  const handlePurchaseReturnSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const sup = suppliers.find(s => s.id === selectedSupplierId);
    if (!sup) {
      alert('Please select a valid supplier.');
      return;
    }

    if (prItems.length === 0 || prItems.some(i => i.quantity <= 0)) {
      alert('Please enter valid quantities for all returned items.');
      return;
    }

    const calculatedItems = prItems.map(i => ({
      ...i,
      total: i.quantity * i.purchasePrice
    }));

    const totalRefund = calculatedItems.reduce((sum, i) => sum + i.total, 0);

    const created = processPurchaseReturn({
      purchaseInvoiceNumber: poRefNumber || undefined,
      supplierId: sup.id,
      supplierName: sup.name,
      returnedItems: calculatedItems,
      totalRefundAmount: totalRefund,
      refundMethod: prRefundMethod,
      returnReason: prReason,
      authorizedBy: currentUser?.name || 'Owner / Manager'
    });

    alert(`Purchase Return ${created.returnNumber} successfully posted! Returned inventory deducted and supplier ledger updated.`);
    setShowNewPurchaseReturn(false);
    setSelectedDebitNote(created);
  };

  const filteredPurchaseReturns = purchaseReturns.filter(pr => {
    if (supplierFilter === 'All') return true;
    return pr.supplierId === supplierFilter;
  });

  return (
    <div className="p-3 sm:p-5 md:p-6 space-y-6 w-full pb-28 text-slate-100 font-sans">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-extrabold text-white flex items-center gap-2">
            <RotateCcw className="w-5 h-5 text-rose-500" />
            Returns & Refund Management
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Manage customer sales returns, defect inspections, and supplier purchase returns with automated inventory and ledger reconciliation.
          </p>
        </div>

        {/* Tab Switcher: Sales Returns vs Purchase Returns */}
        <div className="flex bg-[#0B0E14] p-1 rounded-xl border border-[#1E2638] text-xs font-bold shrink-0">
          <button
            type="button"
            onClick={() => setActiveTab('sales')}
            className={`px-4 py-2 rounded-lg transition flex items-center gap-1.5 ${
              activeTab === 'sales'
                ? 'bg-rose-600 text-white shadow-md shadow-rose-600/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <User className="w-4 h-4" />
            <span>Sales Returns (Customers)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('purchases')}
            className={`px-4 py-2 rounded-lg transition flex items-center gap-1.5 ${
              activeTab === 'purchases'
                ? 'bg-rose-600 text-white shadow-md shadow-rose-600/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Truck className="w-4 h-4" />
            <span>Purchase Returns (Suppliers)</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-white/20 text-white">
              {purchaseReturns.length}
            </span>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: CUSTOMER SALES RETURNS */}
      {/* ========================================================================= */}
      {activeTab === 'sales' && (
        <div className="space-y-6">
          {/* Invoice Search Box */}
          <div className="bg-[#111622] p-5 rounded-2xl border border-[#1E2638] shadow-lg">
            <h3 className="font-bold text-white text-sm mb-2">
              Search Original Customer Sales Invoice
            </h3>
            <p className="text-xs text-slate-400 mb-3">
              Enter the invoice number from the customer's thermal receipt or A4 bill to retrieve sold items.
            </p>
            <form onSubmit={handleSearchInvoice} className="flex gap-2 max-w-lg">
              <input
                type="text"
                placeholder="Enter Invoice Number (e.g. S-2025-1104-001)..."
                value={searchInvoiceNo}
                onChange={e => setSearchInvoiceNo(e.target.value)}
                className="flex-1 px-3 py-2 text-xs border border-[#1E2638] rounded-xl bg-[#0B0E14] text-white font-mono placeholder-slate-500 focus:outline-none focus:border-rose-500"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 transition shadow-md shadow-rose-600/20"
              >
                <Search className="w-4 h-4" />
                <span>Find Bill</span>
              </button>
            </form>
          </div>

          {/* Return Process Box (When Invoice Found) */}
          {searchedInvoice && (
            <form onSubmit={handleReturnSubmit} className="bg-[#111622] p-5 rounded-2xl border border-rose-900/50 shadow-xl space-y-4 text-xs animate-in fade-in duration-150">
              <div className="flex items-center justify-between border-b pb-3 border-[#1E2638]">
                <div>
                  <span className="font-bold text-white text-sm">
                    Return Items from Invoice: {searchedInvoice.invoiceNumber}
                  </span>
                  <span className="text-slate-400 block text-[11px] mt-0.5">
                    Customer: {searchedInvoice.customerName} • Terminal: {searchedInvoice.counterName}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setSearchedInvoice(null)}
                  className="p-1 rounded-lg hover:bg-[#161C2C] text-slate-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Items Return Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-[#0B0E14] text-slate-400 text-[10px] uppercase font-semibold">
                    <tr>
                      <th className="p-2">Purchased Part</th>
                      <th className="p-2">Sold Qty & Rate</th>
                      <th className="p-2">Qty to Return</th>
                      <th className="p-2">Item Condition</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#1E2638] text-slate-200">
                    {searchedInvoice.items.map(item => {
                      const cur = returnItems[item.product.id] || { qty: 0, condition: 'resalable' };

                      return (
                        <tr key={item.product.id}>
                          <td className="p-2 font-semibold text-white">{item.product.name}</td>
                          <td className="p-2 text-slate-400">
                            {item.quantity} pcs @ Rs. {item.unitPrice}
                          </td>
                          <td className="p-2">
                            <input
                              type="number"
                              min="0"
                              max={item.quantity}
                              value={cur.qty}
                              onChange={e => {
                                const val = Math.min(item.quantity, Math.max(0, parseInt(e.target.value) || 0));
                                setReturnItems({
                                  ...returnItems,
                                  [item.product.id]: { ...cur, qty: val }
                                });
                              }}
                              className="w-20 px-2 py-1 border border-[#1E2638] rounded-lg font-bold bg-[#0B0E14] text-white text-center focus:border-rose-500"
                            />
                          </td>
                          <td className="p-2">
                            <select
                              value={cur.condition}
                              onChange={e => {
                                setReturnItems({
                                  ...returnItems,
                                  [item.product.id]: { ...cur, condition: e.target.value as any }
                                });
                              }}
                              className="p-1 text-xs border border-[#1E2638] rounded-lg bg-[#0B0E14] text-slate-200 focus:border-rose-500"
                            >
                              <option value="resalable">Resalable (Return to Stock)</option>
                              <option value="damaged">Damaged (Move to Scrap)</option>
                            </select>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Settlement Options */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-[#1E2638]">
                <div>
                  <label className="font-bold text-slate-300 block mb-1">Refund Method</label>
                  <select
                    value={refundMethod}
                    onChange={e => setRefundMethod(e.target.value as any)}
                    className="w-full p-2 border border-[#1E2638] rounded-xl bg-[#0B0E14] text-white focus:border-rose-500"
                  >
                    <option value="cash">Instant Cash Refund (Drawer Deduction)</option>
                    <option value="credit_to_ledger">Credit to Customer Ledger Balance</option>
                    <option value="exchange">Exchange for Replacement Part</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-300 block mb-1">Return Reason</label>
                  <input
                    type="text"
                    value={returnReason}
                    onChange={e => setReturnReason(e.target.value)}
                    placeholder="e.g. Wrong model advice, mechanic change..."
                    className="w-full p-2 border border-[#1E2638] rounded-xl bg-[#0B0E14] text-white focus:border-rose-500"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-rose-600 hover:bg-rose-500 text-white font-extrabold rounded-xl transition shadow-lg shadow-rose-600/30 flex items-center gap-1.5"
                >
                  <CheckCircle className="w-4 h-4" />
                  <span>Approve & Post Customer Return</span>
                </button>
              </div>
            </form>
          )}

          {/* Historical Sales Returns Table */}
          <div className="bg-[#111622] rounded-2xl border border-[#1E2638] shadow-lg overflow-hidden">
            <div className="p-4 border-b border-[#1E2638] font-bold text-xs uppercase text-slate-400">
              Customer Returns Audit Trail
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-[#0B0E14] text-slate-400 text-[10px] uppercase font-semibold">
                  <tr>
                    <th className="p-3">Return #</th>
                    <th className="p-3">Original Invoice</th>
                    <th className="p-3">Customer</th>
                    <th className="p-3">Refund Amount</th>
                    <th className="p-3">Refund Method</th>
                    <th className="p-3">Authorized By</th>
                    <th className="p-3">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1E2638] text-slate-200">
                  {salesReturns.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="p-6 text-center text-slate-500">No customer sales returns recorded yet.</td>
                    </tr>
                  ) : (
                    salesReturns.map(ret => (
                      <tr key={ret.id} className="hover:bg-[#161C2C]/50 transition">
                        <td className="p-3 font-mono font-bold text-white">{ret.returnNumber}</td>
                        <td className="p-3 font-mono text-slate-400">{ret.invoiceNumber}</td>
                        <td className="p-3 font-semibold text-white">{ret.customerName}</td>
                        <td className="p-3 font-bold text-rose-400">Rs. {ret.totalRefundAmount.toLocaleString()}</td>
                        <td className="p-3 uppercase font-semibold text-[10px] text-slate-400">{ret.refundMethod}</td>
                        <td className="p-3 text-slate-300">{ret.authorizedBy}</td>
                        <td className="p-3 text-slate-400">{ret.createdAt}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: SUPPLIER PURCHASE RETURNS (PURCHASE RETURN MANAGEMENT) */}
      {/* ========================================================================= */}
      {activeTab === 'purchases' && (
        <div className="space-y-6">
          {/* Purchase Returns Control Bar & KPIs */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 rounded-2xl bg-[#111622] border border-[#1E2638] shadow-md flex items-center justify-between">
              <div>
                <span className="text-[11px] font-semibold text-slate-400 uppercase">Total Purchase Returns</span>
                <div className="text-xl font-black text-white mt-0.5">{purchaseReturns.length} Orders</div>
              </div>
              <div className="w-10 h-10 rounded-xl bg-rose-950/60 border border-rose-800/40 flex items-center justify-center text-rose-400">
                <RotateCcw className="w-5 h-5" />
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-[#111622] border border-[#1E2638] shadow-md flex items-center justify-between">
              <div>
                <span className="text-[11px] font-semibold text-slate-400 uppercase">Supplier Credits Claimed</span>
                <div className="text-xl font-black text-emerald-400 font-mono mt-0.5">
                  Rs. {purchaseReturns.reduce((sum, pr) => sum + pr.totalRefundAmount, 0).toLocaleString()}
                </div>
              </div>
              <div className="w-10 h-10 rounded-xl bg-emerald-950/60 border border-emerald-800/40 flex items-center justify-center text-emerald-400">
                <DollarSign className="w-5 h-5" />
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-[#111622] border border-[#1E2638] shadow-md flex items-center justify-between">
              <div>
                <span className="text-[11px] font-semibold text-slate-400 uppercase">Active Suppliers</span>
                <div className="text-xl font-black text-white mt-0.5">{suppliers.length} Depots</div>
              </div>
              <button
                type="button"
                onClick={() => setShowNewPurchaseReturn(true)}
                className="px-3.5 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-bold transition shadow-md shadow-rose-600/30 flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4" />
                <span>New Purchase Return</span>
              </button>
            </div>
          </div>

          {/* Filter Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#111622] p-4 rounded-2xl border border-[#1E2638]">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-400">Filter Supplier:</span>
              <select
                value={supplierFilter}
                onChange={e => setSupplierFilter(e.target.value)}
                className="px-3 py-1.5 bg-[#0B0E14] border border-[#1E2638] rounded-xl text-xs text-white focus:border-rose-500 focus:outline-none"
              >
                <option value="All">All Suppliers ({suppliers.length})</option>
                {suppliers.map(s => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </div>

            <span className="text-xs text-slate-400 font-mono">
              Showing {filteredPurchaseReturns.length} supplier return debit note(s)
            </span>
          </div>

          {/* Purchase Returns History Table */}
          <div className="bg-[#111622] rounded-2xl border border-[#1E2638] shadow-lg overflow-hidden">
            <div className="p-4 border-b border-[#1E2638] font-bold text-xs uppercase text-slate-400 flex items-center justify-between">
              <span>Supplier Purchase Returns & Debit Notes</span>
              <span className="text-[10px] text-emerald-400 font-mono">Real-time Stock Inward Reversal</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-[#0B0E14] text-slate-400 text-[10px] uppercase font-semibold border-b border-[#1E2638]">
                  <tr>
                    <th className="p-3">Return #</th>
                    <th className="p-3">Supplier Name</th>
                    <th className="p-3">PO Reference</th>
                    <th className="p-3">Items Returned</th>
                    <th className="p-3">Total Debit Amount</th>
                    <th className="p-3">Settlement</th>
                    <th className="p-3">Reason</th>
                    <th className="p-3">Authorized By</th>
                    <th className="p-3">Date</th>
                    <th className="p-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1E2638] text-slate-200">
                  {filteredPurchaseReturns.length === 0 ? (
                    <tr>
                      <td colSpan={10} className="p-8 text-center text-slate-500">
                        No purchase returns found. Click "New Purchase Return" to return defective or surplus parts to a supplier.
                      </td>
                    </tr>
                  ) : (
                    filteredPurchaseReturns.map(pr => (
                      <tr key={pr.id} className="hover:bg-[#161C2C]/50 transition">
                        <td className="p-3 font-mono font-bold text-rose-400">{pr.returnNumber}</td>
                        <td className="p-3 font-semibold text-white">{pr.supplierName}</td>
                        <td className="p-3 font-mono text-slate-400">{pr.purchaseInvoiceNumber || 'Direct Return'}</td>
                        <td className="p-3">
                          <span className="px-2 py-0.5 rounded-full bg-[#1A2234] border border-[#26334D] text-[11px] font-bold text-slate-300">
                            {pr.returnedItems.length} lines ({pr.returnedItems.reduce((s, i) => s + i.quantity, 0)} pcs)
                          </span>
                        </td>
                        <td className="p-3 font-bold text-emerald-400 font-mono">
                          Rs. {pr.totalRefundAmount.toLocaleString()}
                        </td>
                        <td className="p-3">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                            pr.refundMethod === 'supplier_ledger'
                              ? 'bg-blue-950/70 text-blue-400 border border-blue-800/40'
                              : 'bg-emerald-950/70 text-emerald-400 border border-emerald-800/40'
                          }`}>
                            {pr.refundMethod === 'supplier_ledger' ? 'Ledger Debit' : 'Cash Received'}
                          </span>
                        </td>
                        <td className="p-3 text-slate-400 truncate max-w-xs">{pr.returnReason}</td>
                        <td className="p-3 text-slate-300">{pr.authorizedBy}</td>
                        <td className="p-3 text-slate-400 font-mono">{pr.createdAt}</td>
                        <td className="p-3 text-right">
                          <button
                            type="button"
                            onClick={() => setSelectedDebitNote(pr)}
                            className="px-2.5 py-1 rounded-lg bg-[#1A2234] hover:bg-slate-700 text-slate-200 text-[11px] font-semibold transition border border-[#26334D] inline-flex items-center gap-1"
                            title="Print Debit Note"
                          >
                            <Printer className="w-3.5 h-3.5 text-rose-400" />
                            <span>Debit Note</span>
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: CREATE NEW PURCHASE RETURN */}
      {/* ========================================================================= */}
      {showNewPurchaseReturn && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-[#111622] rounded-2xl border border-[#1E2638] shadow-2xl max-w-3xl w-full flex flex-col my-auto overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="p-4 sm:p-5 border-b border-[#1E2638] flex items-center justify-between bg-[#0B0E14]">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-rose-950/60 border border-rose-800/40 flex items-center justify-center text-rose-400">
                  <RotateCcw className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-white text-base">New Purchase Return (Debit Note)</h3>
                  <p className="text-xs text-slate-400">Return defective or overstock parts to supplier and adjust ledger.</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowNewPurchaseReturn(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-[#161C2C]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handlePurchaseReturnSubmit} className="p-4 sm:p-5 space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-300 block mb-1">Select Supplier *</label>
                  <select
                    value={selectedSupplierId}
                    onChange={e => setSelectedSupplierId(e.target.value)}
                    className="w-full px-3 py-2 bg-[#0B0E14] border border-[#1E2638] rounded-xl text-white focus:border-rose-500"
                  >
                    {suppliers.map(s => (
                      <option key={s.id} value={s.id}>
                        {s.name} (Payable: Rs. {s.payableBalance.toLocaleString()})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-300 block mb-1">Original PO Invoice Number (Optional)</label>
                  <input
                    type="text"
                    placeholder="e.g. PO-2026-0045"
                    value={poRefNumber}
                    onChange={e => setPoRefNumber(e.target.value)}
                    className="w-full px-3 py-2 bg-[#0B0E14] border border-[#1E2638] rounded-xl text-white font-mono placeholder-slate-500 focus:border-rose-500"
                  />
                </div>
              </div>

              {/* Returned Items Repeater */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white text-xs uppercase">Parts to Return Back to Supplier:</span>
                  <button
                    type="button"
                    onClick={handleAddPrItem}
                    className="px-2.5 py-1 bg-[#1A2234] hover:bg-slate-700 text-rose-400 rounded-lg text-xs font-bold transition flex items-center gap-1 border border-[#26334D]"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Item</span>
                  </button>
                </div>

                <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
                  {prItems.map((item, idx) => (
                    <div key={idx} className="p-3 bg-[#0B0E14] border border-[#1E2638] rounded-xl grid grid-cols-1 sm:grid-cols-12 gap-2 items-center">
                      <div className="sm:col-span-5">
                        <label className="text-[10px] text-slate-400 block mb-0.5">Product</label>
                        <select
                          value={item.productId}
                          onChange={e => handlePrItemChange(idx, 'productId', e.target.value)}
                          className="w-full px-2 py-1.5 bg-[#111622] border border-[#1E2638] rounded-lg text-white text-xs"
                        >
                          {products.map(p => (
                            <option key={p.id} value={p.id}>
                              {p.name} (In Stock: {p.currentStock})
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="sm:col-span-2">
                        <label className="text-[10px] text-slate-400 block mb-0.5">Return Qty</label>
                        <input
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={e => handlePrItemChange(idx, 'quantity', parseInt(e.target.value) || 1)}
                          className="w-full px-2 py-1.5 bg-[#111622] border border-[#1E2638] rounded-lg text-white text-center font-bold"
                        />
                      </div>

                      <div className="sm:col-span-2">
                        <label className="text-[10px] text-slate-400 block mb-0.5">Purchase Rate</label>
                        <input
                          type="number"
                          min="0"
                          value={item.purchasePrice}
                          onChange={e => handlePrItemChange(idx, 'purchasePrice', parseFloat(e.target.value) || 0)}
                          className="w-full px-2 py-1.5 bg-[#111622] border border-[#1E2638] rounded-lg text-white font-mono text-right"
                        />
                      </div>

                      <div className="sm:col-span-2">
                        <label className="text-[10px] text-slate-400 block mb-0.5">Line Total</label>
                        <div className="px-2 py-1.5 font-bold font-mono text-emerald-400 text-xs">
                          Rs. {(item.quantity * item.purchasePrice).toLocaleString()}
                        </div>
                      </div>

                      <div className="sm:col-span-1 flex justify-end">
                        <button
                          type="button"
                          onClick={() => handleRemovePrItem(idx)}
                          disabled={prItems.length <= 1}
                          className="p-1.5 text-slate-500 hover:text-rose-500 transition disabled:opacity-30"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Settlement & Reason */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-[#1E2638]">
                <div>
                  <label className="font-bold text-slate-300 block mb-1">Refund / Settlement Method</label>
                  <select
                    value={prRefundMethod}
                    onChange={e => setPrRefundMethod(e.target.value as any)}
                    className="w-full px-3 py-2 bg-[#0B0E14] border border-[#1E2638] rounded-xl text-white"
                  >
                    <option value="supplier_ledger">Deduct from Supplier Payable Balance (Debit Note)</option>
                    <option value="cash">Supplier Direct Cash Refund (Drawer Inward)</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-300 block mb-1">Return Reason / Notes</label>
                  <input
                    type="text"
                    value={prReason}
                    onChange={e => setPrReason(e.target.value)}
                    placeholder="e.g. Broken packaging, defective bore, factory recall..."
                    className="w-full px-3 py-2 bg-[#0B0E14] border border-[#1E2638] rounded-xl text-white"
                  />
                </div>
              </div>

              {/* Summary Bar */}
              <div className="p-3 bg-[#0B0E14] border border-[#1E2638] rounded-xl flex items-center justify-between font-bold">
                <span className="text-slate-400">Total Supplier Debit Amount:</span>
                <span className="text-base text-emerald-400 font-mono">
                  Rs. {prItems.reduce((sum, i) => sum + (i.quantity * i.purchasePrice), 0).toLocaleString()}
                </span>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-2 pt-2 border-t border-[#1E2638]">
                <button
                  type="button"
                  onClick={() => setShowNewPurchaseReturn(false)}
                  className="px-4 py-2 text-slate-400 hover:text-white rounded-xl font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-rose-600 hover:bg-rose-500 text-white font-extrabold rounded-xl transition shadow-lg shadow-rose-600/30 flex items-center gap-1.5"
                >
                  <CheckCircle className="w-4 h-4" />
                  <span>Confirm & Post Debit Note</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: VIEW & PRINT SUPPLIER DEBIT NOTE VOUCHER */}
      {/* ========================================================================= */}
      {selectedDebitNote && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-[#111622] rounded-2xl border border-[#1E2638] shadow-2xl max-w-2xl w-full p-6 space-y-4 my-auto">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-[#1E2638] pb-3">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-rose-500" />
                <h3 className="font-extrabold text-white text-base">Supplier Debit Note (Voucher)</h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedDebitNote(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-[#161C2C]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Printable Voucher Body */}
            <div className="p-5 bg-[#0B0E14] border border-[#1E2638] rounded-xl space-y-4 text-xs font-mono">
              <div className="flex justify-between items-start border-b border-[#1E2638] pb-3">
                <div>
                  <h4 className="text-base font-black text-white">MOTOPRO SPARE PARTS</h4>
                  <p className="text-[11px] text-slate-400">Main Auto Market, Workshop Road</p>
                  <p className="text-[11px] text-slate-400">Phone: +92 300 1234567</p>
                </div>
                <div className="text-right">
                  <span className="px-2 py-0.5 rounded bg-rose-950 text-rose-400 font-bold border border-rose-800/40 text-[10px] uppercase block mb-1">
                    OFFICIAL DEBIT NOTE
                  </span>
                  <span className="font-bold text-white text-sm block">{selectedDebitNote.returnNumber}</span>
                  <span className="text-[10px] text-slate-400">{selectedDebitNote.createdAt}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-[11px] pb-2 border-b border-[#1E2638]">
                <div>
                  <span className="text-slate-500 block">DEBIT TO SUPPLIER:</span>
                  <span className="font-bold text-white text-xs block">{selectedDebitNote.supplierName}</span>
                  <span className="text-slate-400">ID: {selectedDebitNote.supplierId}</span>
                </div>
                <div className="text-right">
                  <span className="text-slate-500 block">SETTLEMENT METHOD:</span>
                  <span className="font-bold text-emerald-400 block capitalize">
                    {selectedDebitNote.refundMethod.replace('_', ' ')}
                  </span>
                  <span className="text-slate-400">Ref: {selectedDebitNote.purchaseInvoiceNumber || 'N/A'}</span>
                </div>
              </div>

              {/* Items List */}
              <table className="w-full text-left text-[11px]">
                <thead className="border-b border-[#1E2638] text-slate-400 uppercase text-[9px]">
                  <tr>
                    <th className="py-1">Part Description</th>
                    <th className="py-1 text-center">Qty</th>
                    <th className="py-1 text-right">Unit Rate</th>
                    <th className="py-1 text-right">Debit Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1A2234]">
                  {selectedDebitNote.returnedItems.map((item, idx) => (
                    <tr key={idx}>
                      <td className="py-1.5 text-white font-semibold">
                        {item.productName}
                        <span className="block text-[9px] text-slate-500">{item.reason}</span>
                      </td>
                      <td className="py-1.5 text-center text-slate-300 font-bold">{item.quantity}</td>
                      <td className="py-1.5 text-right font-mono">Rs. {item.purchasePrice.toLocaleString()}</td>
                      <td className="py-1.5 text-right font-mono font-bold text-white">Rs. {item.total.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="border-t border-[#1E2638] pt-3 flex justify-between items-center text-sm font-bold">
                <span className="text-white">TOTAL DEBIT AMOUNT:</span>
                <span className="text-emerald-400 text-base font-mono">
                  Rs. {selectedDebitNote.totalRefundAmount.toLocaleString()}
                </span>
              </div>

              <div className="pt-2 text-[10px] text-slate-500">
                Reason: {selectedDebitNote.returnReason} • Authorized By: {selectedDebitNote.authorizedBy}
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setSelectedDebitNote(null)}
                className="px-4 py-2 text-slate-400 hover:text-white rounded-xl text-xs font-semibold"
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => window.print()}
                className="px-5 py-2 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-xl text-xs transition flex items-center gap-1.5 shadow-lg shadow-rose-600/30"
              >
                <Printer className="w-4 h-4" />
                <span>Print Debit Note / Voucher</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
