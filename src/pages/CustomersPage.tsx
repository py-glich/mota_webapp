import React, { useState } from 'react';
import { 
  Users, Search, Plus, Phone, 
  MessageCircle, X, Eye
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Customer } from '../types';

export const CustomersPage: React.FC = () => {
  const { customers, invoices, addCustomer, updateCustomer, recordCustomerPayment } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGroup, setSelectedGroup] = useState('All');
  const [showAddModal, setShowAddModal] = useState(false);
  const [viewCustomer, setViewCustomer] = useState<Customer | null>(null);
  const [paymentCustomer, setPaymentCustomer] = useState<Customer | null>(null);
  const [paymentAmount, setPaymentAmount] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState<string>('cash');
  const [paymentNote, setPaymentNote] = useState<string>('Cash debt settlement');

  // Shared dark theme class string
  const inputCls = 'w-full p-2 border rounded-xl bg-slate-800 border-slate-700 text-slate-100 placeholder-slate-500 focus:outline-hidden focus:ring-1 focus:ring-brand-500';

  // New Customer Form State
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    address: '',
    bikeModel: 'Honda CD70',
    regNumber: '',
    group: 'Regular' as Customer['group'],
    creditLimit: 10000,
    receivableBalance: 0,
    loyaltyTier: 'Bronze' as Customer['loyaltyTier'],
  });

  const handleSaveCustomer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.phone.trim()) {
      alert('Customer Name and Phone number are required.');
      return;
    }

    addCustomer({
      name: formData.name,
      phone: formData.phone,
      address: formData.address,
      bikeModel: formData.bikeModel,
      regNumber: formData.regNumber,
      group: formData.group,
      creditLimit: Number(formData.creditLimit),
      receivableBalance: Number(formData.receivableBalance),
      loyaltyTier: formData.loyaltyTier,
    });

    setShowAddModal(false);
    setFormData({
      name: '',
      phone: '',
      address: '',
      bikeModel: 'Honda CD70',
      regNumber: '',
      group: 'Regular',
      creditLimit: 10000,
      receivableBalance: 0,
      loyaltyTier: 'Bronze',
    });
  };

  const handleSettlePayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!paymentCustomer) return;
    if (paymentAmount <= 0) {
      alert('Please enter a valid payment amount.');
      return;
    }

    recordCustomerPayment(paymentCustomer.id, paymentAmount, paymentMethod, paymentNote);
    alert(`Payment of Rs. ${paymentAmount.toLocaleString()} recorded for ${paymentCustomer.name}. Ledger balance updated.`);
    setPaymentCustomer(null);
    setPaymentAmount(0);
  };

  const sendWhatsAppReminder = (cust: Customer) => {
    const text = encodeURIComponent(
      `السلام علیکم ${cust.name} صاحب! سائبر اورین موٹرسائیکل شاپ کی طرف سے آپ کے کھاتے کی بقایا رقم Rs. ${cust.receivableBalance.toLocaleString()} ہے۔ برائے مہربانی اپنا بقایا کلیئر کروائیں۔ شکریہ! رابطہ: 0300-1234567`
    );
    window.open(`https://wa.me/${cust.phone.replace(/[^0-9]/g, '')}?text=${text}`, '_blank');
  };

  const filteredCustomers = customers.filter(c => {
    const matchQuery = 
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.phone.includes(searchQuery) ||
      (c.bikeModel && c.bikeModel.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchGroup = selectedGroup === 'All' || c.group === selectedGroup;
    return matchQuery && matchGroup;
  });

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
              <Users className="w-5 h-5 text-brand-500" />
              Customer Management & CRM Ledgers
            </h1>
            <p className="text-xs text-slate-400">
              Accounts receivable, credit limits, maintenance reminders, and WhatsApp ledger alerts.
            </p>
          </div>

          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2 bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-md shadow-brand-500/25 transition"
          >
            <Plus className="w-4 h-4" />
            <span>Register New Customer</span>
          </button>
        </div>

        {/* Summary KPI Strip */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 shadow-xs">
            <span className="text-xs text-slate-400 font-semibold">Total Accounts Receivable</span>
            <div className="text-xl font-extrabold text-rose-400 mt-1">
              Rs. {customers.reduce((s, c) => s + c.receivableBalance, 0).toLocaleString()}
            </div>
            <span className="text-[10px] text-slate-400">Owed by workshop mechanics & credit buyers</span>
          </div>

          <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 shadow-xs">
            <span className="text-xs text-slate-400 font-semibold">Mechanic / Workshop Partners</span>
            <div className="text-xl font-extrabold text-white mt-1">
              {customers.filter(c => c.group === 'Mechanic' || c.group === 'Wholesale').length} Accounts
            </div>
            <span className="text-[10px] text-brand-500 font-semibold">Special mechanic rates applied in POS</span>
          </div>

          <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 shadow-xs">
            <span className="text-xs text-slate-400 font-semibold">Loyalty Program Members</span>
            <div className="text-xl font-extrabold text-amber-400 mt-1">
              {customers.reduce((s, c) => s + (c.loyaltyPoints || 0), 0)} Total Points
            </div>
            <span className="text-[10px] text-slate-400">Earn 1 pt per Rs. 100 spent</span>
          </div>
        </div>

        {/* Filter Toolbar */}
        <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800 shadow-xs flex flex-wrap gap-3 items-center justify-between">
          <div className="relative max-w-sm w-full">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              placeholder="Search name, phone, or bike model..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs border border-slate-700 rounded-xl bg-slate-800 text-slate-100 placeholder-slate-500 focus:outline-hidden focus:ring-1 focus:ring-brand-500"
            />
          </div>

          <div className="flex flex-wrap gap-1.5 text-xs">
            {['All', 'Walk-in', 'Regular', 'Mechanic', 'Wholesale', 'VIP'].map(group => (
              <button
                key={group}
                onClick={() => setSelectedGroup(group)}
                className={`px-3 py-1.5 rounded-lg font-semibold transition ${
                  selectedGroup === group
                    ? 'bg-brand-600 text-white shadow-xs'
                    : 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-slate-200'
                }`}
              >
                {group}
              </button>
            ))}
          </div>
        </div>

        {/* Customer List Table */}
        <div className="bg-slate-900 rounded-2xl border border-slate-800 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-800/60 text-slate-400 font-semibold uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="p-3">Customer Name</th>
                  <th className="p-3">Contact & Bike</th>
                  <th className="p-3">Category Group</th>
                  <th className="p-3">Receivable Balance</th>
                  <th className="p-3">Credit Limit</th>
                  <th className="p-3">Loyalty Pts</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {filteredCustomers.map(cust => (
                  <tr key={cust.id} className="hover:bg-slate-800/50 transition">
                    <td className="p-3">
                      <div className="font-bold text-white">{cust.name}</div>
                      <div className="text-[10px] text-slate-400">ID: {cust.id}</div>
                    </td>
                    <td className="p-3 text-[11px]">
                      <div className="flex items-center gap-1 text-slate-300">
                        <Phone className="w-3 h-3 text-slate-500" />
                        <span>{cust.phone}</span>
                      </div>
                      {cust.bikeModel && (
                        <div className="text-[10px] text-brand-500 font-medium mt-0.5">
                          {cust.bikeModel} {cust.regNumber ? `(${cust.regNumber})` : ''}
                        </div>
                      )}
                    </td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        cust.group === 'Mechanic' ? 'bg-orange-950 text-orange-300' :
                        cust.group === 'Wholesale' ? 'bg-blue-950 text-blue-300' :
                        cust.group === 'VIP' ? 'bg-purple-950 text-purple-300' :
                        'bg-slate-800 text-slate-300'
                      }`}>
                        {cust.group}
                      </span>
                    </td>
                    <td className="p-3 font-mono font-bold text-sm">
                      {cust.receivableBalance > 0 ? (
                        <span className="text-rose-400">
                          Rs. {cust.receivableBalance.toLocaleString()}
                        </span>
                      ) : (
                        <span className="text-emerald-400 text-xs">Clear (Rs. 0)</span>
                      )}
                    </td>
                    <td className="p-3 font-mono text-slate-400">
                      Rs. {cust.creditLimit.toLocaleString()}
                    </td>
                    <td className="p-3 text-amber-400 font-semibold">
                      {cust.loyaltyPoints} Pts ({cust.loyaltyTier})
                    </td>
                    <td className="p-3 text-right space-x-1 whitespace-nowrap">
                      {/* Receive Payment */}
                      {cust.receivableBalance > 0 && (
                        <button
                          onClick={() => {
                            setPaymentCustomer(cust);
                            setPaymentAmount(cust.receivableBalance);
                          }}
                          className="px-2 py-1 rounded bg-emerald-950 hover:bg-emerald-900 text-emerald-400 font-semibold text-[11px] transition"
                          title="Receive Ledger Payment"
                        >
                          Pay Debt
                        </button>
                      )}

                      {/* Send WhatsApp Reminder */}
                      {cust.receivableBalance > 0 && cust.phone && (
                        <button
                          onClick={() => sendWhatsAppReminder(cust)}
                          className="px-2 py-1 rounded bg-green-950 hover:bg-green-900 text-green-400 font-semibold text-[11px] transition"
                          title="Send WhatsApp Balance Notice"
                        >
                          <MessageCircle className="w-3.5 h-3.5 inline mr-1" />
                          Remind
                        </button>
                      )}

                      {/* View Details */}
                      <button
                        onClick={() => setViewCustomer(cust)}
                        className="p-1 rounded text-slate-400 hover:text-brand-500 hover:bg-slate-800 transition"
                        title="View Customer Profile"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* REGISTER CUSTOMER MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4" style={{ colorScheme: 'dark' }}>
          <div className="bg-slate-900 text-slate-100 rounded-2xl shadow-2xl max-w-lg w-full border border-slate-800 p-5 space-y-4 text-xs">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-white text-sm">Register Customer Account</h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveCustomer} className="space-y-3">
              <div>
                <label className="font-semibold block mb-1 text-slate-300">Customer / Workshop Name:</label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Ustad Shaukat (Shaukat Auto)"
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  className={inputCls}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold block mb-1 text-slate-300">Phone Number (WhatsApp):</label>
                  <input
                    type="text"
                    required
                    placeholder="+92 300 1234567"
                    value={formData.phone}
                    onChange={e => setFormData({ ...formData, phone: e.target.value })}
                    className={inputCls}
                  />
                </div>
                <div>
                  <label className="font-semibold block mb-1 text-slate-300">Customer Category:</label>
                  <select
                    value={formData.group}
                    onChange={e => setFormData({ ...formData, group: e.target.value as any })}
                    className={inputCls}
                  >
                    <option value="Regular">Regular Customer</option>
                    <option value="Mechanic">Mechanic (Special Rates)</option>
                    <option value="Wholesale">Wholesale Dealer</option>
                    <option value="VIP">VIP Customer</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold block mb-1 text-slate-300">Motorcycle Model:</label>
                  <input
                    type="text"
                    placeholder="Honda CG125, YBR, etc."
                    value={formData.bikeModel}
                    onChange={e => setFormData({ ...formData, bikeModel: e.target.value })}
                    className={inputCls}
                  />
                </div>
                <div>
                  <label className="font-semibold block mb-1 text-slate-300">Number Plate:</label>
                  <input
                    type="text"
                    placeholder="LEA-2024-9912"
                    value={formData.regNumber}
                    onChange={e => setFormData({ ...formData, regNumber: e.target.value })}
                    className={`${inputCls} font-mono`}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold block mb-1 text-slate-300">Authorized Credit Limit (Rs.):</label>
                  <input
                    type="number"
                    value={formData.creditLimit}
                    onChange={e => setFormData({ ...formData, creditLimit: parseFloat(e.target.value) || 0 })}
                    className={`${inputCls} font-bold`}
                  />
                </div>
                <div>
                  <label className="font-semibold block mb-1 text-slate-300">Opening Debt Balance (Rs.):</label>
                  <input
                    type="number"
                    value={formData.receivableBalance}
                    onChange={e => setFormData({ ...formData, receivableBalance: parseFloat(e.target.value) || 0 })}
                    className={`${inputCls} font-bold !text-rose-400`}
                  />
                </div>
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
                  Save Customer Account
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* SETTLE DEBT MODAL */}
      {paymentCustomer && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4" style={{ colorScheme: 'dark' }}>
          <div className="bg-slate-900 text-slate-100 rounded-2xl shadow-2xl max-w-md w-full border border-slate-800 p-5 space-y-4 text-xs">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-white text-sm">
                Receive Ledger Payment
              </h3>
              <button onClick={() => setPaymentCustomer(null)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-slate-400">
              Customer: <strong className="text-slate-100">{paymentCustomer.name}</strong> • Current Due: <strong className="text-rose-400">Rs. {paymentCustomer.receivableBalance.toLocaleString()}</strong>
            </p>

            <form onSubmit={handleSettlePayment} className="space-y-3">
              <div>
                <label className="font-semibold block mb-1 text-slate-300">Amount Received (PKR):</label>
                <input
                  type="number"
                  min="1"
                  max={paymentCustomer.receivableBalance}
                  value={paymentAmount}
                  onChange={e => setPaymentAmount(parseFloat(e.target.value) || 0)}
                  className={`${inputCls} font-bold text-base !text-emerald-400`}
                />
              </div>

              <div>
                <label className="font-semibold block mb-1 text-slate-300">Payment Method:</label>
                <select
                  value={paymentMethod}
                  onChange={e => setPaymentMethod(e.target.value)}
                  className={inputCls}
                >
                  <option value="cash">Cash Tendered (Updates Active Counter Drawer)</option>
                  <option value="bank">Bank Transfer / Online / Raast</option>
                  <option value="cheque">Bank Cheque</option>
                </select>
              </div>

              <div>
                <label className="font-semibold block mb-1 text-slate-300">Receipt Notes / Reference:</label>
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
                  onClick={() => setPaymentCustomer(null)}
                  className="px-4 py-2 rounded-xl text-slate-300 hover:bg-slate-800 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold transition"
                >
                  Confirm & Post Payment Receipt
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* VIEW CUSTOMER PROFILE & TIMELINE MODAL */}
      {viewCustomer && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4" style={{ colorScheme: 'dark' }}>
          <div className="bg-slate-900 text-slate-100 rounded-2xl shadow-2xl max-w-2xl w-full border border-slate-800 p-5 space-y-4 text-xs max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b pb-3 border-slate-800">
              <div>
                <h3 className="font-bold text-white text-base">{viewCustomer.name}</h3>
                <p className="text-slate-400">{viewCustomer.phone} • {viewCustomer.group} Account</p>
              </div>
              <button onClick={() => setViewCustomer(null)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="p-3 bg-slate-800/60 border border-slate-800 rounded-xl">
                <span className="text-[10px] text-slate-400">Receivable Due</span>
                <div className="text-base font-extrabold text-rose-400">Rs. {viewCustomer.receivableBalance.toLocaleString()}</div>
              </div>
              <div className="p-3 bg-slate-800/60 border border-slate-800 rounded-xl">
                <span className="text-[10px] text-slate-400">Total Purchases</span>
                <div className="text-base font-extrabold text-white">Rs. {viewCustomer.totalPurchases.toLocaleString()}</div>
              </div>
              <div className="p-3 bg-slate-800/60 border border-slate-800 rounded-xl">
                <span className="text-[10px] text-slate-400">Loyalty Balance</span>
                <div className="text-base font-extrabold text-amber-400">{viewCustomer.loyaltyPoints} Pts</div>
              </div>
            </div>

            {/* Maintenance Reminders */}
            {viewCustomer.reminders && viewCustomer.reminders.length > 0 && (
              <div className="p-3 bg-amber-950/30 rounded-xl border border-amber-800/60">
                <span className="font-bold text-amber-300 block mb-1">
                  Active Service Reminders:
                </span>
                {viewCustomer.reminders.map(r => (
                  <div key={r.id} className="text-[11px] text-amber-200 flex justify-between">
                    <span>{r.title}</span>
                    <span className="font-mono">Due: {r.dueDate}</span>
                  </div>
                ))}
              </div>
            )}

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setViewCustomer(null)}
                className="px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-bold transition"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};