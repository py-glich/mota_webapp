import React, { useState } from 'react';
import { 
  ShoppingBag, Plus, Search, Truck, 
  Trash2, Printer, X, Eye
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { PurchaseInvoice, PurchaseItem } from '../types';

export const PurchasesPage: React.FC = () => {
  const { purchases, suppliers, products, createPurchaseInvoice } = useApp();
  const { hasPermission } = useAuth();

  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<PurchaseInvoice | null>(null);

  // Shared dark theme class strings
  const inputCls = 'w-full p-2 border rounded-xl bg-slate-800 border-slate-700 text-slate-100 placeholder-slate-500 focus:outline-hidden focus:ring-1 focus:ring-brand-500';
  const smallInputCls = 'w-full p-1.5 border border-slate-700 rounded-lg bg-slate-900 text-slate-100 focus:outline-hidden focus:ring-1 focus:ring-brand-500';

  // Form State for New Purchase
  const [selectedSupplierId, setSelectedSupplierId] = useState<string>(suppliers[0]?.id || '');
  const [supplierRef, setSupplierRef] = useState<string>('');
  const [purchaseDate, setPurchaseDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [purchaseItems, setPurchaseItems] = useState<PurchaseItem[]>([]);
  const [paidAmount, setPaidAmount] = useState<number>(0);
  const [notes, setNotes] = useState<string>('');

  // Item selector in form
  const [tempProductId, setTempProductId] = useState<string>(products[0]?.id || '');
  const [tempQty, setTempQty] = useState<number>(10);
  const [tempCost, setTempCost] = useState<number>(products[0]?.purchasePrice || 1000);

  const addItemToPO = () => {
    const prod = products.find(p => p.id === tempProductId);
    if (!prod) return;

    const lineTotal = tempQty * tempCost;
    const newItem: PurchaseItem = {
      productId: prod.id,
      productName: prod.name,
      sku: prod.sku,
      quantity: tempQty,
      unitCost: tempCost,
      taxPercent: 0,
      discountAmount: 0,
      total: lineTotal
    };

    setPurchaseItems(prev => [...prev, newItem]);
  };

  const removeItemFromPO = (idx: number) => {
    setPurchaseItems(prev => prev.filter((_, i) => i !== idx));
  };

  const subtotal = purchaseItems.reduce((sum, item) => sum + item.total, 0);
  const grandTotal = subtotal; // tax/discount can be factored
  const balanceDue = Math.max(0, grandTotal - paidAmount);

  const handleSubmitPO = (e: React.FormEvent) => {
    e.preventDefault();
    if (purchaseItems.length === 0) {
      alert('Please add at least one spare part line to this purchase order.');
      return;
    }

    const sup = suppliers.find(s => s.id === selectedSupplierId);
    if (!sup) return;

    createPurchaseInvoice({
      supplierId: sup.id,
      supplierName: sup.companyName,
      supplierInvoiceRef: supplierRef || `REF-${Date.now().toString().slice(-4)}`,
      purchaseDate,
      items: purchaseItems,
      subtotal,
      taxAmount: 0,
      discountAmount: 0,
      grandTotal,
      paidAmount,
      balanceDue,
      paymentStatus: balanceDue === 0 ? 'paid' : paidAmount > 0 ? 'partial' : 'unpaid',
      status: 'posted',
      notes,
    });

    setShowCreateModal(false);
    setPurchaseItems([]);
    setPaidAmount(0);
    setSupplierRef('');
    alert('Purchase invoice posted! Inventory stock quantities have been automatically updated.');
  };

  const filteredPurchases = purchases.filter(p => 
    p.invoiceNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.supplierName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.supplierInvoiceRef.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div
      className="min-h-full bg-slate-950 text-slate-100 p-4 md:p-6 space-y-6 overflow-y-auto"
      style={{ colorScheme: 'dark' }}
    >
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-extrabold text-white flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-brand-500" />
              Purchase Management & Inward Stock
            </h1>
            <p className="text-xs text-slate-400">
              Supplier purchase invoices, automated stock increment, and payables ledger tracking.
            </p>
          </div>

          <button
            onClick={() => {
              setPurchaseItems([]);
              setShowCreateModal(true);
            }}
            className="px-4 py-2 bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-md shadow-brand-500/25 transition"
          >
            <Plus className="w-4 h-4" />
            <span>New Purchase Invoice</span>
          </button>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 shadow-xs">
            <span className="text-xs text-slate-400 font-semibold">Total Purchases Recorded</span>
            <div className="text-lg font-extrabold text-white mt-1">
              Rs. {purchases.reduce((s, p) => s + p.grandTotal, 0).toLocaleString()}
            </div>
            <span className="text-[10px] text-slate-400">{purchases.length} Inward Invoices</span>
          </div>

          <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 shadow-xs">
            <span className="text-xs text-slate-400 font-semibold">Outstanding Payables</span>
            <div className="text-lg font-extrabold text-rose-400 mt-1">
              Rs. {suppliers.reduce((s, sup) => s + sup.payableBalance, 0).toLocaleString()}
            </div>
            <span className="text-[10px] text-slate-400">Owed to Spare Distributors</span>
          </div>

          <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 shadow-xs">
            <span className="text-xs text-slate-400 font-semibold">Active Distributors</span>
            <div className="text-lg font-extrabold text-white mt-1">
              {suppliers.length} Suppliers
            </div>
            <span className="text-[10px] text-emerald-400 font-semibold">Atlas Honda, Crown, Havoline, Shell</span>
          </div>
        </div>

        {/* Purchases Table */}
        <div className="bg-slate-900 rounded-2xl border border-slate-800 shadow-xs overflow-hidden">
          <div className="p-4 border-b border-slate-800">
            <div className="relative max-w-sm">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="text"
                placeholder="Search PO number, supplier, or ref..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs border border-slate-700 rounded-xl bg-slate-800 text-slate-100 placeholder-slate-500 focus:outline-hidden focus:ring-1 focus:ring-brand-500"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-800/60 text-slate-400 font-semibold uppercase text-[10px] tracking-wider border-b border-slate-800">
                <tr>
                  <th className="p-3">PO Number</th>
                  <th className="p-3">Supplier Name</th>
                  <th className="p-3">Date & Ref</th>
                  <th className="p-3">Total Amount</th>
                  <th className="p-3">Paid / Due</th>
                  <th className="p-3">Payment Status</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {filteredPurchases.map(po => (
                  <tr key={po.id} className="hover:bg-slate-800/50 transition">
                    <td className="p-3 font-mono font-bold text-white">
                      {po.invoiceNumber}
                    </td>
                    <td className="p-3 font-semibold text-slate-100">
                      {po.supplierName}
                    </td>
                    <td className="p-3 text-slate-400 text-[11px]">
                      <div>{po.purchaseDate}</div>
                      <div className="font-mono text-[10px]">Ref: {po.supplierInvoiceRef}</div>
                    </td>
                    <td className="p-3 font-extrabold text-white">
                      Rs. {po.grandTotal.toLocaleString()}
                    </td>
                    <td className="p-3 text-[11px]">
                      <div className="text-emerald-400 font-semibold">Paid: Rs. {po.paidAmount.toLocaleString()}</div>
                      {po.balanceDue > 0 && (
                        <div className="text-rose-400 font-bold">Due: Rs. {po.balanceDue.toLocaleString()}</div>
                      )}
                    </td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        po.paymentStatus === 'paid' ? 'bg-emerald-950 text-emerald-400' :
                        po.paymentStatus === 'partial' ? 'bg-amber-950 text-amber-400' :
                        'bg-rose-950 text-rose-400'
                      }`}>
                        {po.paymentStatus}
                      </span>
                    </td>
                    <td className="p-3 text-right">
                      <button
                        onClick={() => setSelectedInvoice(po)}
                        className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-[11px] flex items-center gap-1 ml-auto border border-slate-700 transition"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>View PO</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* CREATE PURCHASE MODAL */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto" style={{ colorScheme: 'dark' }}>
          <div className="bg-slate-900 text-slate-100 rounded-2xl shadow-2xl max-w-3xl w-full border border-slate-800 flex flex-col max-h-[92vh]">
            <div className="p-4 bg-slate-800/60 border-b border-slate-800 flex items-center justify-between rounded-t-2xl">
              <h3 className="font-bold text-white text-sm flex items-center gap-2">
                <Truck className="w-4 h-4 text-brand-500" />
                Inward Purchase Invoice & Stock Inward
              </h3>
              <button onClick={() => setShowCreateModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitPO} className="flex-1 overflow-y-auto p-5 space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="font-semibold block mb-1 text-slate-300">Select Supplier:</label>
                  <select
                    value={selectedSupplierId}
                    onChange={e => setSelectedSupplierId(e.target.value)}
                    className={inputCls}
                  >
                    {suppliers.map(s => (
                      <option key={s.id} value={s.id}>{s.companyName}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="font-semibold block mb-1 text-slate-300">Supplier Ref / Bilty No:</label>
                  <input
                    type="text"
                    placeholder="e.g., AH-99213"
                    value={supplierRef}
                    onChange={e => setSupplierRef(e.target.value)}
                    className={`${inputCls} font-mono`}
                  />
                </div>
                <div>
                  <label className="font-semibold block mb-1 text-slate-300">Purchase Date:</label>
                  <input
                    type="date"
                    value={purchaseDate}
                    onChange={e => setPurchaseDate(e.target.value)}
                    className={inputCls}
                  />
                </div>
              </div>

              {/* Line item adder */}
              <div className="p-3 bg-slate-800/50 rounded-xl border border-slate-700 space-y-2">
                <span className="font-bold text-slate-300 uppercase tracking-wider text-[10px] block">
                  Add Spare Parts to Purchase Order
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 items-end">
                  <div className="sm:col-span-2">
                    <label className="text-[11px] text-slate-400 block">Select Part:</label>
                    <select
                      value={tempProductId}
                      onChange={e => {
                        setTempProductId(e.target.value);
                        const p = products.find(prod => prod.id === e.target.value);
                        if (p) setTempCost(p.purchasePrice);
                      }}
                      className={smallInputCls}
                    >
                      {products.map(p => (
                        <option key={p.id} value={p.id}>{p.name} ({p.sku})</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-[11px] text-slate-400 block">Qty:</label>
                    <input
                      type="number"
                      min="1"
                      value={tempQty}
                      onChange={e => setTempQty(parseInt(e.target.value) || 1)}
                      className={`${smallInputCls} font-bold`}
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-slate-400 block">Unit Cost (Rs.):</label>
                    <input
                      type="number"
                      value={tempCost}
                      onChange={e => setTempCost(parseFloat(e.target.value) || 0)}
                      className={`${smallInputCls} font-bold`}
                    />
                  </div>
                </div>
                <button
                  type="button"
                  onClick={addItemToPO}
                  className="px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-white rounded-lg text-xs font-semibold flex items-center gap-1 ml-auto transition"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Line Item</span>
                </button>
              </div>

              {/* Items List */}
              <div className="border border-slate-800 rounded-xl overflow-hidden">
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-800 text-[10px] uppercase font-semibold text-slate-400">
                    <tr>
                      <th className="p-2">Part Name</th>
                      <th className="p-2">Qty</th>
                      <th className="p-2">Cost Rate</th>
                      <th className="p-2">Total</th>
                      <th className="p-2 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {purchaseItems.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="p-4 text-center text-slate-400">No items added to invoice yet.</td>
                      </tr>
                    ) : (
                      purchaseItems.map((item, idx) => (
                        <tr key={idx}>
                          <td className="p-2 font-semibold text-slate-100">{item.productName}</td>
                          <td className="p-2 text-slate-300">{item.quantity}</td>
                          <td className="p-2 font-mono text-slate-300">Rs. {item.unitCost}</td>
                          <td className="p-2 font-bold font-mono text-slate-100">Rs. {item.total.toLocaleString()}</td>
                          <td className="p-2 text-right">
                            <button
                              type="button"
                              onClick={() => removeItemFromPO(idx)}
                              className="text-rose-400 hover:text-rose-300 transition"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* Financial Totals */}
              <div className="p-3 bg-slate-800/50 rounded-xl border border-slate-700 space-y-2">
                <div className="flex justify-between font-bold text-white">
                  <span>Grand Total:</span>
                  <span className="text-base text-brand-500">Rs. {grandTotal.toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-300">Amount Paid Immediately (Rs.):</span>
                  <input
                    type="number"
                    value={paidAmount}
                    onChange={e => setPaidAmount(parseFloat(e.target.value) || 0)}
                    className="w-32 p-1.5 text-right font-bold border border-slate-700 rounded-lg bg-slate-900 text-emerald-400 focus:outline-hidden focus:ring-1 focus:ring-brand-500"
                  />
                </div>
                <div className="flex justify-between font-bold text-rose-400">
                  <span>Payable Balance Due:</span>
                  <span>Rs. {balanceDue.toLocaleString()}</span>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 rounded-xl text-slate-300 hover:bg-slate-800 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-bold transition shadow-md shadow-brand-500/25"
                >
                  Post Purchase & Update Stock
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* VIEW PO MODAL */}
      {selectedInvoice && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4" style={{ colorScheme: 'dark' }}>
          <div className="bg-slate-900 text-slate-100 rounded-2xl shadow-2xl max-w-xl w-full border border-slate-800 p-5 space-y-4 text-xs">
            <div className="flex items-center justify-between border-b pb-3 border-slate-800">
              <div>
                <h3 className="font-bold text-white text-base">Purchase Order {selectedInvoice.invoiceNumber}</h3>
                <p className="text-slate-400 text-[11px]">{selectedInvoice.supplierName} • {selectedInvoice.purchaseDate}</p>
              </div>
              <button onClick={() => setSelectedInvoice(null)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2">
              <div className="font-semibold text-slate-300">Ordered Spare Parts:</div>
              <div className="divide-y divide-slate-800 border border-slate-800 rounded-xl p-2 bg-slate-800/40">
                {selectedInvoice.items.map((i, idx) => (
                  <div key={idx} className="py-1.5 flex justify-between">
                    <div>
                      <span className="font-semibold text-slate-100">{i.productName}</span>
                      <span className="text-[10px] text-slate-400 block">SKU: {i.sku}</span>
                    </div>
                    <div className="text-right text-slate-300">
                      <span>{i.quantity} pcs @ Rs. {i.unitCost}</span>
                      <span className="block font-bold text-white">Rs. {i.total.toLocaleString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-between border-t pt-3 border-slate-800 font-bold">
              <span className="text-slate-200">Grand Total:</span>
              <span className="text-brand-500">Rs. {selectedInvoice.grandTotal.toLocaleString()}</span>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => window.print()}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold flex items-center gap-1.5 border border-slate-700 transition"
              >
                <Printer className="w-4 h-4" />
                <span>Print PO</span>
              </button>
              <button
                onClick={() => setSelectedInvoice(null)}
                className="px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-bold transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};