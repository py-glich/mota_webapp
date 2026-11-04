import React, { useState } from 'react';
import { 
  Truck, Plus, Search, Phone, X
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Supplier } from '../types';

export const SuppliersPage: React.FC = () => {
  const { suppliers, addSupplier, updateSupplier, recordSupplierPayment, purchases } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [paymentSupplier, setPaymentSupplier] = useState<Supplier | null>(null);
  const [paymentAmount, setPaymentAmount] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState<string>('cash');
  const [paymentNote, setPaymentNote] = useState<string>('Supplier invoice settlement');

  // Shared dark theme class string
  const inputCls = 'w-full p-2 border rounded-xl bg-slate-800 border-slate-700 text-slate-100 placeholder-slate-500 focus:outline-hidden focus:ring-1 focus:ring-brand-500';

  // New Supplier Form State
  const [formData, setFormData] = useState({
    name: '',
    companyName: '',
    phone: '',
    email: '',
    address: '',
    ntn: '',
    payableBalance: 0,
    creditTermsDays: 15,
    contactPerson: '',
  });

  const handleSaveSupplier = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.companyName.trim() || !formData.phone.trim()) {
      alert('Company Name and Phone are required.');
      return;
    }

    addSupplier({
      name: formData.name || formData.companyName,
      companyName: formData.companyName,
      phone: formData.phone,
      email: formData.email,
      address: formData.address,
      ntn: formData.ntn,
      payableBalance: Number(formData.payableBalance),
      creditTermsDays: Number(formData.creditTermsDays),
      contactPerson: formData.contactPerson || 'Sales Desk',
    });

    setShowAddModal(false);
    setFormData({
      name: '',
      companyName: '',
      phone: '',
      email: '',
      address: '',
      ntn: '',
      payableBalance: 0,
      creditTermsDays: 15,
      contactPerson: '',
    });
  };

  const handlePaySupplier = (e: React.FormEvent) => {
    e.preventDefault();
    if (!paymentSupplier) return;
    if (paymentAmount <= 0) {
      alert('Please enter a valid payment amount.');
      return;
    }

    recordSupplierPayment(paymentSupplier.id, paymentAmount, paymentMethod, paymentNote);
    alert(`Payment of Rs. ${paymentAmount.toLocaleString()} recorded for ${paymentSupplier.companyName}. Payable balance updated.`);
    setPaymentSupplier(null);
    setPaymentAmount(0);
  };

  const filteredSuppliers = suppliers.filter(s => 
    s.companyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.contactPerson.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.phone.includes(searchQuery)
  );

  return (
    <div
      className="min-h-full bg-slate-950 text-slate-100 p-4 md:p-6 space-y-6 overflow-y-auto pb-28"
      style={{ colorScheme: 'dark' }}
    >
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-extrabold text-white flex items-center gap-2">
              <Truck className="w-5 h-5 text-brand-500" />
              Supplier Management & Payables (AP)
            </h1>
            <p className="text-xs text-slate-400">
              Authorized motorcycle spare parts distributors, payable balances, and payment voucher records.
            </p>
          </div>

          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2 bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-md shadow-brand-500/25 transition"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Supplier</span>
          </button>
        </div>

        {/* Supplier Cards / Table */}
        <div className="bg-slate-900 rounded-2xl border border-slate-800 shadow-xs overflow-hidden">
          <div className="p-4 border-b border-slate-800">
            <div className="relative max-w-sm">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="text"
                placeholder="Search supplier, contact person, or phone..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs border border-slate-700 rounded-xl bg-slate-800 text-slate-100 placeholder-slate-500 focus:outline-hidden focus:ring-1 focus:ring-brand-500"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-800/60 text-slate-400 font-semibold uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="p-3">Company Name</th>
                  <th className="p-3">Contact Person & Phone</th>
                  <th className="p-3">Credit Terms</th>
                  <th className="p-3">Payable Balance</th>
                  <th className="p-3">NTN / Tax #</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {filteredSuppliers.map(sup => (
                  <tr key={sup.id} className="hover:bg-slate-800/50 transition">
                    <td className="p-3">
                      <div className="font-bold text-white">{sup.companyName}</div>
                      <div className="text-[10px] text-slate-400">{sup.address}</div>
                    </td>
                    <td className="p-3 text-[11px]">
                      <div className="font-semibold text-slate-200">{sup.contactPerson}</div>
                      <div className="text-slate-400 text-[10px] flex items-center gap-1 mt-0.5">
                        <Phone className="w-3 h-3 text-slate-500" />
                        <span>{sup.phone}</span>
                      </div>
                    </td>
                    <td className="p-3 font-semibold text-slate-300">
                      Net {sup.creditTermsDays} Days
                    </td>
                    <td className="p-3 font-mono font-bold text-sm">
                      {sup.payableBalance > 0 ? (
                        <span className="text-rose-400">
                          Rs. {sup.payableBalance.toLocaleString()}
                        </span>
                      ) : (
                        <span className="text-emerald-400 text-xs">Clear (Rs. 0)</span>
                      )}
                    </td>
                    <td className="p-3 font-mono text-[10px] text-slate-400">
                      {sup.ntn || 'Non-filer'}
                    </td>
                    <td className="p-3 text-right">
                      {sup.payableBalance > 0 && (
                        <button
                          onClick={() => {
                            setPaymentSupplier(sup);
                            setPaymentAmount(sup.payableBalance);
                          }}
                          className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[11px] transition"
                        >
                          Pay Supplier
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* ADD SUPPLIER MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4" style={{ colorScheme: 'dark' }}>
          <div className="bg-slate-900 text-slate-100 rounded-2xl shadow-2xl max-w-lg w-full border border-slate-800 p-5 space-y-4 text-xs">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-white text-sm">Register Spare Parts Supplier</h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveSupplier} className="space-y-3">
              <div>
                <label className="font-semibold block mb-1 text-slate-300">Company / Distributor Name:</label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Crown Group Wholesale Hub"
                  value={formData.companyName}
                  onChange={e => setFormData({ ...formData, companyName: e.target.value })}
                  className={inputCls}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold block mb-1 text-slate-300">Contact Person:</label>
                  <input
                    type="text"
                    placeholder="e.g., Muhammad Waqas"
                    value={formData.contactPerson}
                    onChange={e => setFormData({ ...formData, contactPerson: e.target.value })}
                    className={inputCls}
                  />
                </div>
                <div>
                  <label className="font-semibold block mb-1 text-slate-300">Phone Number:</label>
                  <input
                    type="text"
                    required
                    placeholder="+92 300 0000000"
                    value={formData.phone}
                    onChange={e => setFormData({ ...formData, phone: e.target.value })}
                    className={inputCls}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold block mb-1 text-slate-300">NTN / STRN #:</label>
                  <input
                    type="text"
                    placeholder="0819234-5"
                    value={formData.ntn}
                    onChange={e => setFormData({ ...formData, ntn: e.target.value })}
                    className={`${inputCls} font-mono`}
                  />
                </div>
                <div>
                  <label className="font-semibold block mb-1 text-slate-300">Opening Payable Balance (Rs.):</label>
                  <input
                    type="number"
                    value={formData.payableBalance}
                    onChange={e => setFormData({ ...formData, payableBalance: parseFloat(e.target.value) || 0 })}
                    className={`${inputCls} font-bold !text-rose-400`}
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold block mb-1 text-slate-300">Warehouse / Depot Address:</label>
                <input
                  type="text"
                  placeholder="Circular Road Auto Market, Lahore"
                  value={formData.address}
                  onChange={e => setFormData({ ...formData, address: e.target.value })}
                  className={inputCls}
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl text-slate-300 hover:bg-slate-800 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-bold transition shadow-md shadow-brand-500/25"
                >
                  Save Supplier
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* PAY SUPPLIER MODAL */}
      {paymentSupplier && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4" style={{ colorScheme: 'dark' }}>
          <div className="bg-slate-900 text-slate-100 rounded-2xl shadow-2xl max-w-md w-full border border-slate-800 p-5 space-y-4 text-xs">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-white text-sm">
                Supplier Payment Voucher (CPV / BPV)
              </h3>
              <button onClick={() => setPaymentSupplier(null)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-slate-400">
              Supplier: <strong className="text-slate-100">{paymentSupplier.companyName}</strong> • Current Payable: <strong className="text-rose-400">Rs. {paymentSupplier.payableBalance.toLocaleString()}</strong>
            </p>

            <form onSubmit={handlePaySupplier} className="space-y-3">
              <div>
                <label className="font-semibold block mb-1 text-slate-300">Payment Amount (PKR):</label>
                <input
                  type="number"
                  min="1"
                  max={paymentSupplier.payableBalance}
                  value={paymentAmount}
                  onChange={e => setPaymentAmount(parseFloat(e.target.value) || 0)}
                  className={`${inputCls} font-bold text-base !text-rose-400`}
                />
              </div>

              <div>
                <label className="font-semibold block mb-1 text-slate-300">Disbursed Via:</label>
                <select
                  value={paymentMethod}
                  onChange={e => setPaymentMethod(e.target.value)}
                  className={inputCls}
                >
                  <option value="cash">Shop Drawer Cash (Reduces Active Counter Drawer)</option>
                  <option value="bank">Bank Online Transfer</option>
                  <option value="cheque">Bank Cheque</option>
                </select>
              </div>

              <div>
                <label className="font-semibold block mb-1 text-slate-300">Reference / Cheque Number / Notes:</label>
                <input
                  type="text"
                  value={paymentNote}
                  onChange={e => setPaymentNote(e.target.value)}
                  className={inputCls}
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setPaymentSupplier(null)}
                  className="px-4 py-2 rounded-xl text-slate-300 hover:bg-slate-800 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold transition shadow-md shadow-rose-500/25"
                >
                  Post Payment Voucher
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};