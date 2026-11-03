import React, { useState } from 'react';
import { 
  Warehouse, CheckCircle, Search, Plus, Check, X
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { StockAdjustment } from '../types';

export const InventoryPage: React.FC = () => {
  const { products, stockAdjustments, damagedStock, recordStockAdjustment, approveStockAdjustment, rejectStockAdjustment } = useApp();
  const { currentUser, hasPermission } = useAuth();

  const [activeTab, setActiveTab] = useState<'realtime' | 'adjustments' | 'damaged' | 'reconcile'>('realtime');
  const [searchQuery, setSearchQuery] = useState('');
  const [showAdjModal, setShowAdjModal] = useState(false);

  // Shared dark theme class strings
  const inputCls = 'w-full p-2 border rounded-xl bg-slate-800 border-slate-700 text-slate-100 placeholder-slate-500 focus:outline-hidden focus:ring-1 focus:ring-brand-500';
  const thCls = 'bg-slate-800/60 text-slate-400 font-semibold uppercase text-[10px] tracking-wider';
  const tabCls = (active: boolean) =>
    `flex-1 py-1.5 rounded-lg transition ${active ? 'bg-slate-950 text-brand-500 shadow-xs' : 'text-slate-400 hover:text-slate-200'}`;

  // Stock Adjustment Form
  const [selectedProductId, setSelectedProductId] = useState(products[0]?.id || '');
  const [newStockQty, setNewStockQty] = useState<number>(0);
  const [adjReason, setAdjReason] = useState<StockAdjustment['reason']>('Audit Correction');
  const [adjNotes, setAdjNotes] = useState('');

  // Physical Stock Reconciliation State
  const [physicalCounts, setPhysicalCounts] = useState<{ [id: string]: number }>(() => {
    const init: { [id: string]: number } = {};
    products.forEach(p => { init[p.id] = p.currentStock; });
    return init;
  });

  const selectedProduct = products.find(p => p.id === selectedProductId) || products[0];

  const handleCreateAdjustment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct) return;

    const diff = newStockQty - selectedProduct.currentStock;
    if (diff === 0) {
      alert('New quantity is identical to current stock. No difference to adjust.');
      return;
    }

    const isAutoApproved = hasPermission('canAdjustStock');

    recordStockAdjustment({
      productId: selectedProduct.id,
      productName: selectedProduct.name,
      oldStock: selectedProduct.currentStock,
      newStock: newStockQty,
      difference: diff,
      reason: adjReason,
      status: isAutoApproved ? 'approved' : 'pending',
      requestedBy: currentUser.name,
      notes: adjNotes
    });

    setShowAdjModal(false);
    alert(`Adjustment recorded as ${isAutoApproved ? 'Approved' : 'Pending Manager Approval'}.`);
  };

  const handleApplyReconciliation = () => {
    let adjustedCount = 0;
    products.forEach(p => {
      const counted = physicalCounts[p.id];
      if (counted !== undefined && counted !== p.currentStock) {
        recordStockAdjustment({
          productId: p.id,
          productName: p.name,
          oldStock: p.currentStock,
          newStock: counted,
          difference: counted - p.currentStock,
          reason: 'Audit Correction',
          status: 'approved',
          requestedBy: currentUser.name,
          notes: 'Batch Physical Stock Count Reconciliation'
        });
        adjustedCount++;
      }
    });

    alert(`Physical count reconciliation complete! ${adjustedCount} products adjusted to actual verified counts.`);
  };

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.location.rack.toLowerCase().includes(searchQuery.toLowerCase())
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
              <Warehouse className="w-5 h-5 text-brand-500" />
              Inventory & Real-Time Stock Control
            </h1>
            <p className="text-xs text-slate-400">
              Shared multi-counter live inventory, approval workflow for stock adjustments, and physical count audit.
            </p>
          </div>

          <button
            onClick={() => {
              if (selectedProduct) setNewStockQty(selectedProduct.currentStock);
              setShowAdjModal(true);
            }}
            className="px-4 py-2 bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-md shadow-brand-500/25 transition"
          >
            <Plus className="w-4 h-4" />
            <span>Manual Stock Adjustment</span>
          </button>
        </div>

        {/* Tabs */}
        <div className="flex bg-slate-800 p-1 rounded-xl text-xs font-semibold max-w-lg">
          <button onClick={() => setActiveTab('realtime')} className={tabCls(activeTab === 'realtime')}>
            Real-time Stock ({products.length})
          </button>
          <button onClick={() => setActiveTab('adjustments')} className={tabCls(activeTab === 'adjustments')}>
            Adjustments ({stockAdjustments.length})
          </button>
          <button onClick={() => setActiveTab('damaged')} className={tabCls(activeTab === 'damaged')}>
            Damaged Pool ({damagedStock.length})
          </button>
          <button onClick={() => setActiveTab('reconcile')} className={tabCls(activeTab === 'reconcile')}>
            Physical Count Audit
          </button>
        </div>

        {/* TAB 1: REAL-TIME STOCK */}
        {activeTab === 'realtime' && (
          <div className="bg-slate-900 rounded-2xl border border-slate-800 shadow-xs overflow-hidden">
            <div className="p-4 border-b border-slate-800 flex items-center justify-between">
              <div className="relative max-w-xs w-full">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="text"
                  placeholder="Filter by part or rack location..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 text-xs border border-slate-700 rounded-xl bg-slate-800 text-slate-100 placeholder-slate-500 focus:outline-hidden focus:ring-1 focus:ring-brand-500"
                />
              </div>
              <div className="text-xs text-slate-400 font-semibold flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                Live Synced across Counter 1 & 2
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className={thCls}>
                  <tr>
                    <th className="p-3">Spare Part</th>
                    <th className="p-3">Rack & Bin Location</th>
                    <th className="p-3">Current Stock</th>
                    <th className="p-3">Min Alert</th>
                    <th className="p-3">Damaged Units</th>
                    <th className="p-3">Stock Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {filteredProducts.map(p => (
                    <tr key={p.id} className="hover:bg-slate-800/50">
                      <td className="p-3">
                        <div className="font-bold text-white">{p.name}</div>
                        <div className="text-[10px] font-mono text-slate-400">SKU: {p.sku}</div>
                      </td>
                      <td className="p-3 font-mono">
                        <span className="font-bold text-slate-200">{p.location.rack}</span>
                        <span className="text-[10px] text-slate-400 block">{p.location.shelf}</span>
                      </td>
                      <td className="p-3 font-mono font-bold text-sm text-slate-100">
                        {p.currentStock} {p.unit}
                      </td>
                      <td className="p-3 text-slate-400">{p.minStockAlert} {p.unit}</td>
                      <td className="p-3 text-amber-400 font-semibold">{p.damagedStock || 0}</td>
                      <td className="p-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          p.currentStock <= 0 ? 'bg-rose-950 text-rose-400' :
                          p.currentStock <= p.minStockAlert ? 'bg-amber-950 text-amber-400' :
                          'bg-emerald-950 text-emerald-400'
                        }`}>
                          {p.currentStock <= 0 ? 'Out of Stock' : p.currentStock <= p.minStockAlert ? 'Low Stock' : 'Optimal'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 2: STOCK ADJUSTMENTS & APPROVALS */}
        {activeTab === 'adjustments' && (
          <div className="bg-slate-900 rounded-2xl border border-slate-800 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className={thCls}>
                  <tr>
                    <th className="p-3">ID / Time</th>
                    <th className="p-3">Product</th>
                    <th className="p-3">Old → New Stock</th>
                    <th className="p-3">Difference</th>
                    <th className="p-3">Reason</th>
                    <th className="p-3">Requested By</th>
                    <th className="p-3">Status</th>
                    <th className="p-3 text-right">Approval Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {stockAdjustments.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="p-6 text-center text-slate-400">No stock adjustments logged yet.</td>
                    </tr>
                  ) : (
                    stockAdjustments.map(adj => (
                      <tr key={adj.id} className="hover:bg-slate-800/50">
                        <td className="p-3 font-mono text-[10px]">
                          <div className="text-slate-200">{adj.id}</div>
                          <div className="text-slate-400">{adj.timestamp}</div>
                        </td>
                        <td className="p-3 font-semibold text-slate-100">{adj.productName}</td>
                        <td className="p-3 font-mono text-slate-300">
                          {adj.oldStock} → <strong className="text-white">{adj.newStock}</strong>
                        </td>
                        <td className="p-3 font-mono font-bold">
                          <span className={adj.difference >= 0 ? 'text-emerald-400' : 'text-rose-400'}>
                            {adj.difference >= 0 ? `+${adj.difference}` : adj.difference}
                          </span>
                        </td>
                        <td className="p-3 text-slate-300">{adj.reason}</td>
                        <td className="p-3 text-slate-300">{adj.requestedBy}</td>
                        <td className="p-3">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                            adj.status === 'approved' ? 'bg-emerald-950 text-emerald-400' :
                            adj.status === 'rejected' ? 'bg-rose-950 text-rose-400' :
                            'bg-amber-950 text-amber-400'
                          }`}>
                            {adj.status}
                          </span>
                        </td>
                        <td className="p-3 text-right space-x-1">
                          {adj.status === 'pending' && hasPermission('canAdjustStock') && (
                            <>
                              <button
                                onClick={() => approveStockAdjustment(adj.id)}
                                className="p-1 rounded bg-emerald-950 hover:bg-emerald-900 text-emerald-400 transition"
                                title="Approve Adjustment"
                              >
                                <Check className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => rejectStockAdjustment(adj.id)}
                                className="p-1 rounded bg-rose-950 hover:bg-rose-900 text-rose-400 transition"
                                title="Reject Adjustment"
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                            </>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 3: DAMAGED STOCK POOL */}
        {activeTab === 'damaged' && (
          <div className="bg-slate-900 rounded-2xl border border-slate-800 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className={thCls}>
                  <tr>
                    <th className="p-3">Date</th>
                    <th className="p-3">Damaged Product</th>
                    <th className="p-3">Quantity</th>
                    <th className="p-3">Estimated Loss (PKR)</th>
                    <th className="p-3">Reason / Details</th>
                    <th className="p-3">Recorded By</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {damagedStock.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="p-6 text-center text-slate-400">No damaged stock recorded.</td>
                    </tr>
                  ) : (
                    damagedStock.map(d => (
                      <tr key={d.id} className="hover:bg-slate-800/50">
                        <td className="p-3 font-mono text-[11px] text-slate-400">{d.date}</td>
                        <td className="p-3 font-bold text-white">{d.productName}</td>
                        <td className="p-3 font-mono font-bold text-rose-400">{d.quantity} units</td>
                        <td className="p-3 font-mono font-bold text-slate-100">Rs. {d.lossValue.toLocaleString()}</td>
                        <td className="p-3 text-slate-300">{d.reason}</td>
                        <td className="p-3 text-slate-400">{d.recordedBy}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 4: PHYSICAL COUNT AUDIT & RECONCILIATION */}
        {activeTab === 'reconcile' && (
          <div className="bg-slate-900 rounded-2xl border border-slate-800 shadow-xs p-5 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-4 border-slate-800">
              <div>
                <h3 className="font-bold text-white text-sm">
                  Physical Stock Count Audit & Batch Reconciliation
                </h3>
                <p className="text-xs text-slate-400">
                  Enter actual hand-counted quantities from shelves and racks. The system highlights discrepancies.
                </p>
              </div>
              <button
                onClick={handleApplyReconciliation}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 transition"
              >
                <CheckCircle className="w-4 h-4" />
                <span>Apply Physical Reconciliation</span>
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className={thCls}>
                  <tr>
                    <th className="p-2">Part</th>
                    <th className="p-2">Location</th>
                    <th className="p-2">System Qty</th>
                    <th className="p-2">Physical Counted Qty</th>
                    <th className="p-2">Discrepancy</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {products.map(p => {
                    const physical = physicalCounts[p.id] ?? p.currentStock;
                    const discrepancy = physical - p.currentStock;

                    return (
                      <tr key={p.id} className="hover:bg-slate-800/50">
                        <td className="p-2 font-semibold text-slate-100">{p.name}</td>
                        <td className="p-2 font-mono text-[10px] text-slate-400">{p.location.rack}</td>
                        <td className="p-2 font-mono font-bold text-slate-100">{p.currentStock} {p.unit}</td>
                        <td className="p-2">
                          <input
                            type="number"
                            min="0"
                            value={physical}
                            onChange={e => setPhysicalCounts({
                              ...physicalCounts,
                              [p.id]: parseInt(e.target.value) || 0
                            })}
                            className="w-20 px-2 py-1 border border-slate-700 rounded-lg font-bold bg-slate-800 text-slate-100 text-center focus:outline-hidden focus:ring-1 focus:ring-brand-500"
                          />
                        </td>
                        <td className="p-2 font-mono font-bold">
                          {discrepancy === 0 ? (
                            <span className="text-emerald-400 font-semibold">Matched (0)</span>
                          ) : discrepancy > 0 ? (
                            <span className="text-blue-400">Surplus (+{discrepancy})</span>
                          ) : (
                            <span className="text-rose-400">Shortage ({discrepancy})</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* ADJUSTMENT MODAL */}
      {showAdjModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4" style={{ colorScheme: 'dark' }}>
          <div className="bg-slate-900 text-slate-100 rounded-2xl shadow-2xl max-w-md w-full border border-slate-800 p-5 space-y-4 text-xs">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-white text-sm">Manual Stock Adjustment</h3>
              <button onClick={() => setShowAdjModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateAdjustment} className="space-y-3">
              <div>
                <label className="font-semibold block mb-1 text-slate-300">Select Spare Part:</label>
                <select
                  value={selectedProductId}
                  onChange={e => {
                    setSelectedProductId(e.target.value);
                    const p = products.find(prod => prod.id === e.target.value);
                    if (p) setNewStockQty(p.currentStock);
                  }}
                  className={inputCls}
                >
                  {products.map(p => (
                    <option key={p.id} value={p.id}>{p.name} (Current: {p.currentStock} {p.unit})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-semibold block mb-1 text-slate-300">New Verified Stock Qty:</label>
                <input
                  type="number"
                  min="0"
                  value={newStockQty}
                  onChange={e => setNewStockQty(parseInt(e.target.value) || 0)}
                  className={`${inputCls} font-bold text-center text-sm`}
                />
              </div>

              <div>
                <label className="font-semibold block mb-1 text-slate-300">Adjustment Reason:</label>
                <select
                  value={adjReason}
                  onChange={e => setAdjReason(e.target.value as any)}
                  className={inputCls}
                >
                  <option value="Audit Correction">Audit Correction</option>
                  <option value="Damaged Found">Damaged Found</option>
                  <option value="Theft / Missing">Theft / Missing</option>
                  <option value="Found Surplus">Found Surplus</option>
                  <option value="Supplier Replacement">Supplier Replacement</option>
                </select>
              </div>

              <div>
                <label className="font-semibold block mb-1 text-slate-300">Authorization Note:</label>
                <input
                  type="text"
                  placeholder="e.g., Physical count discrepancy after monthly cycle audit"
                  value={adjNotes}
                  onChange={e => setAdjNotes(e.target.value)}
                  className={inputCls}
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAdjModal(false)}
                  className="px-4 py-2 rounded-xl text-slate-300 hover:bg-slate-800 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-bold transition shadow-md shadow-brand-500/25"
                >
                  Submit Adjustment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};