import React, { useState } from 'react';
import { 
  RotateCcw, Search, CheckCircle, AlertTriangle, ArrowRight, 
  DollarSign, Package, User, Plus, X 
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { SalesInvoice, SalesReturn } from '../types';

export const ReturnsPage: React.FC = () => {
  const { invoices, salesReturns, processSalesReturn } = useApp();
  const { currentUser, hasPermission } = useAuth();

  const [searchInvoiceNo, setSearchInvoiceNo] = useState('');
  const [searchedInvoice, setSearchedInvoice] = useState<SalesInvoice | null>(null);
  
  // Return workflow state
  const [returnItems, setReturnItems] = useState<{ [productId: string]: { qty: number; condition: 'resalable' | 'damaged' } }>({});
  const [refundMethod, setRefundMethod] = useState<'cash' | 'credit_to_ledger' | 'exchange'>('cash');
  const [returnReason, setReturnReason] = useState('Customer wrong part selection / Mechanic advice');

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
      // Initialize return map
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
      authorizedBy: currentUser.name
    });

    alert(`Return processed for Rs. ${refundTotal.toLocaleString()}! Stock and cash/ledger balances updated.`);
    setSearchedInvoice(null);
    setSearchInvoiceNo('');
    setReturnItems({});
  };

  return (
    <div className="p-4 md:p-6 space-y-6 overflow-y-auto max-w-7xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-xl font-extrabold text-white flex items-center gap-2">
          <RotateCcw className="w-5 h-5 text-rose-500" />
          Returns & Refund Management
        </h1>
        <p className="text-xs text-slate-400">
          Process partial item or full invoice returns, inspect item condition, and restore resalable inventory.
        </p>
      </div>

      {/* Invoice Search Box */}
      <div className="bg-[#111622] p-5 rounded-2xl border border-[#1E2638] shadow-lg">
        <h3 className="font-bold text-white text-sm mb-3">
          Search Original Customer Sales Invoice
        </h3>
        <form onSubmit={handleSearchInvoice} className="flex gap-2 max-w-lg">
          <input
            type="text"
            placeholder="Enter Invoice Number (e.g. INV-2026-01041)..."
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
        <form onSubmit={handleReturnSubmit} className="bg-[#111622] p-5 rounded-2xl border border-rose-900/50 shadow-xl space-y-4 text-xs">
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
                        className="w-20 px-2 py-1 border border-[#1E2638] rounded-lg font-bold bg-[#0B0E14] text-white text-center"
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
                        className="p-1 text-xs border border-[#1E2638] rounded-lg bg-[#0B0E14] text-slate-200"
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

          {/* Refund Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 bg-[#0B0E14] rounded-xl border border-[#1E2638]">
            <div>
              <label className="font-semibold block mb-1 text-slate-300">Refund Method:</label>
              <select
                value={refundMethod}
                onChange={e => setRefundMethod(e.target.value as any)}
                className="w-full p-2 border border-[#1E2638] rounded-xl bg-[#111622] text-white"
              >
                <option value="cash">Instant Cash Refund</option>
                <option value="credit_to_ledger">Credit Customer Ledger (Debt reduction)</option>
                <option value="exchange">Exchange for Another Part</option>
              </select>
            </div>
            <div>
              <label className="font-semibold block mb-1 text-slate-300">Return Reason / Fault Description:</label>
              <input
                type="text"
                value={returnReason}
                onChange={e => setReturnReason(e.target.value)}
                className="w-full p-2 border border-[#1E2638] rounded-xl bg-[#111622] text-white"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setSearchedInvoice(null)}
              className="px-4 py-2 rounded-xl text-slate-400 hover:text-white hover:bg-[#161C2C]"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold transition shadow-md shadow-rose-600/25 flex items-center gap-1.5"
            >
              <CheckCircle className="w-4 h-4" />
              <span>Authorize & Process Return</span>
            </button>
          </div>
        </form>
      )}

      {/* Returns History Table */}
      <div className="bg-[#111622] rounded-2xl border border-[#1E2638] shadow-lg overflow-hidden">
        <div className="p-4 border-b border-[#1E2638] font-bold text-xs uppercase text-slate-400">
          Historical Returns Audit Trail
        </div>
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
                <td colSpan={7} className="p-6 text-center text-slate-500">No returns recorded yet.</td>
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
  );
};
