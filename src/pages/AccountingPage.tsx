import React, { useState } from 'react';
import { 
  DollarSign, Plus, ArrowUpRight, ArrowDownRight, X
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { ExpenseRecord, CashbookEntry } from '../types';

export const AccountingPage: React.FC = () => {
  const { cashbook, expenses, addExpense, addCashbookEntry, invoices, purchases } = useApp();
  const { currentCounter, currentUser, counters } = useAuth();

  const [activeTab, setActiveTab] = useState<'cashbook' | 'expenses' | 'summary' | 'coa'>('cashbook');
  const [showExpenseModal, setShowExpenseModal] = useState(false);
  const [showCashbookModal, setShowCashbookModal] = useState(false);

  // Shared dark theme class strings
  const inputCls = 'w-full p-2 border rounded-xl bg-slate-800 border-slate-700 text-slate-100 placeholder-slate-500 focus:outline-hidden focus:ring-1 focus:ring-brand-500';
  const thCls = 'bg-slate-800/60 text-slate-400 font-semibold uppercase text-[10px] tracking-wider';
  const tabCls = (active: boolean) =>
    `flex-1 py-1.5 rounded-lg transition ${active ? 'bg-slate-950 text-brand-500 shadow-xs' : 'text-slate-400 hover:text-slate-200'}`;

  // Expense form
  const [expenseForm, setExpenseForm] = useState({
    category: 'Shop Refreshment & Tea' as ExpenseRecord['category'],
    amount: 500,
    paidFromCounter: currentCounter.id,
    receiptVoucherNo: `CPV-${Date.now().toString().slice(-4)}`,
    notes: 'Daily staff tea and water bottles'
  });

  // Cashbook entry form
  const [cashbookForm, setCashbookForm] = useState({
    type: 'in' as 'in' | 'out',
    category: 'Capital In' as CashbookEntry['category'],
    amount: 5000,
    description: 'Owner cash injection for drawer float',
  });

  const handleSaveExpense = (e: React.FormEvent) => {
    e.preventDefault();
    if (expenseForm.amount <= 0) {
      alert('Please enter a valid expense amount.');
      return;
    }

    addExpense({
      date: new Date().toISOString().replace('T', ' ').substring(0, 16),
      category: expenseForm.category,
      amount: expenseForm.amount,
      paidFromCounter: expenseForm.paidFromCounter,
      paidBy: currentUser.name,
      receiptVoucherNo: expenseForm.receiptVoucherNo,
      notes: expenseForm.notes
    });

    setShowExpenseModal(false);
    alert(`Expense of Rs. ${expenseForm.amount.toLocaleString()} logged. Cash drawer adjusted.`);
  };

  const handleSaveCashbook = (e: React.FormEvent) => {
    e.preventDefault();
    addCashbookEntry({
      counterId: currentCounter.id,
      date: new Date().toISOString().replace('T', ' ').substring(0, 16),
      type: cashbookForm.type,
      category: cashbookForm.category,
      amount: cashbookForm.amount,
      description: cashbookForm.description,
      performedBy: currentUser.name
    });

    setShowCashbookModal(false);
    alert('Cashbook entry recorded.');
  };

  const totalIn = cashbook.filter(c => c.type === 'in').reduce((s, c) => s + c.amount, 0);
  const totalOut = cashbook.filter(c => c.type === 'out').reduce((s, c) => s + c.amount, 0);
  const totalExpenses = expenses.reduce((s, e) => s + e.amount, 0);

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
              <DollarSign className="w-5 h-5 text-brand-500" />
              Accounting & Financial Cashbook
            </h1>
            <p className="text-xs text-slate-400">
              Cash-in/cash-out tracking, expense vouchers, gross profit calculations, and counter drawer reconciliation.
            </p>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => setShowCashbookModal(true)}
              className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl flex items-center gap-1.5 transition border border-slate-700"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Cash Entry</span>
            </button>
            <button
              onClick={() => setShowExpenseModal(true)}
              className="px-4 py-2 bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-md shadow-brand-500/25 transition"
            >
              <Plus className="w-4 h-4" />
              <span>Record Shop Expense</span>
            </button>
          </div>
        </div>

        {/* Financial Overview Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 shadow-xs">
            <span className="text-xs text-slate-400 font-semibold">Total Cash-In Today</span>
            <div className="text-lg font-extrabold text-emerald-400 mt-1 flex items-center gap-1">
              <ArrowUpRight className="w-4 h-4" />
              Rs. {totalIn.toLocaleString()}
            </div>
            <span className="text-[10px] text-slate-400">Sales receipts & debt collection</span>
          </div>

          <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 shadow-xs">
            <span className="text-xs text-slate-400 font-semibold">Total Cash-Out Today</span>
            <div className="text-lg font-extrabold text-rose-400 mt-1 flex items-center gap-1">
              <ArrowDownRight className="w-4 h-4" />
              Rs. {totalOut.toLocaleString()}
            </div>
            <span className="text-[10px] text-slate-400">Expenses & supplier settlements</span>
          </div>

          <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 shadow-xs">
            <span className="text-xs text-slate-400 font-semibold">Net Cash Flow</span>
            <div className="text-lg font-extrabold text-white mt-1">
              Rs. {(totalIn - totalOut).toLocaleString()}
            </div>
            <span className="text-[10px] text-slate-400">Cashbook balance position</span>
          </div>

          <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 shadow-xs">
            <span className="text-xs text-slate-400 font-semibold">Total Operational Expenses</span>
            <div className="text-lg font-extrabold text-amber-400 mt-1">
              Rs. {totalExpenses.toLocaleString()}
            </div>
            <span className="text-[10px] text-slate-400">{expenses.length} Expense Vouchers</span>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex bg-slate-800 p-1 rounded-xl text-xs font-semibold max-w-md">
          <button onClick={() => setActiveTab('cashbook')} className={tabCls(activeTab === 'cashbook')}>
            Daily Cashbook
          </button>
          <button onClick={() => setActiveTab('expenses')} className={tabCls(activeTab === 'expenses')}>
            Expenses ({expenses.length})
          </button>
          <button onClick={() => setActiveTab('coa')} className={tabCls(activeTab === 'coa')}>
            Chart of Accounts
          </button>
        </div>

        {/* TAB 1: DAILY CASHBOOK */}
        {activeTab === 'cashbook' && (
          <div className="bg-slate-900 rounded-2xl border border-slate-800 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className={thCls}>
                  <tr>
                    <th className="p-3">Time & Counter</th>
                    <th className="p-3">Type</th>
                    <th className="p-3">Category</th>
                    <th className="p-3">Description</th>
                    <th className="p-3">Cash-In (Rs.)</th>
                    <th className="p-3">Cash-Out (Rs.)</th>
                    <th className="p-3">Cashier</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {cashbook.map(entry => (
                    <tr key={entry.id} className="hover:bg-slate-800/50">
                      <td className="p-3 font-mono text-[10px]">
                        <div className="text-slate-200">{entry.date}</div>
                        <div className="text-slate-400">{entry.counterId}</div>
                      </td>
                      <td className="p-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          entry.type === 'in' ? 'bg-emerald-950 text-emerald-400' : 'bg-rose-950 text-rose-400'
                        }`}>
                          {entry.type === 'in' ? '↓ Cash-In' : '↑ Cash-Out'}
                        </span>
                      </td>
                      <td className="p-3 font-semibold text-slate-200">{entry.category}</td>
                      <td className="p-3 text-slate-300">{entry.description}</td>
                      <td className="p-3 font-mono font-bold text-emerald-400">
                        {entry.type === 'in' ? `Rs. ${entry.amount.toLocaleString()}` : '-'}
                      </td>
                      <td className="p-3 font-mono font-bold text-rose-400">
                        {entry.type === 'out' ? `Rs. ${entry.amount.toLocaleString()}` : '-'}
                      </td>
                      <td className="p-3 text-slate-400">{entry.performedBy}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 2: EXPENSES */}
        {activeTab === 'expenses' && (
          <div className="bg-slate-900 rounded-2xl border border-slate-800 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className={thCls}>
                  <tr>
                    <th className="p-3">Date</th>
                    <th className="p-3">Voucher #</th>
                    <th className="p-3">Expense Category</th>
                    <th className="p-3">Amount</th>
                    <th className="p-3">Paid From Counter</th>
                    <th className="p-3">Paid By / Notes</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {expenses.map(exp => (
                    <tr key={exp.id} className="hover:bg-slate-800/50">
                      <td className="p-3 text-slate-400 font-mono text-[11px]">{exp.date}</td>
                      <td className="p-3 font-mono font-bold text-slate-100">{exp.receiptVoucherNo}</td>
                      <td className="p-3 font-semibold text-slate-100">{exp.category}</td>
                      <td className="p-3 font-mono font-bold text-rose-400">Rs. {exp.amount.toLocaleString()}</td>
                      <td className="p-3 text-slate-400">{exp.paidFromCounter}</td>
                      <td className="p-3 text-slate-300">
                        <div>{exp.paidBy}</div>
                        <div className="text-[10px] text-slate-400">{exp.notes}</div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 3: CHART OF ACCOUNTS PREVIEW */}
        {activeTab === 'coa' && (
          <div className="bg-slate-900 rounded-2xl border border-slate-800 shadow-xs p-5 space-y-4 text-xs">
            <div>
              <h3 className="font-bold text-white text-sm">
                Standard Double-Entry Chart of Accounts (COA)
              </h3>
              <p className="text-xs text-slate-400">
                Structured ledger mapping for motorcycle retail enterprise.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-3.5 rounded-xl border border-slate-800 bg-slate-800/40">
                <span className="font-bold text-brand-500 uppercase text-[10px] block mb-2">1000 - Assets</span>
                <ul className="space-y-1.5 font-mono text-slate-300">
                  <li className="flex justify-between"><span>1010 - Counter 1 Drawer Float</span><span className="font-bold text-slate-100">Rs. {counters[0]?.currentCash.toLocaleString()}</span></li>
                  <li className="flex justify-between"><span>1020 - Counter 2 Drawer Float</span><span className="font-bold text-slate-100">Rs. {counters[1]?.currentCash.toLocaleString()}</span></li>
                  <li className="flex justify-between"><span>1100 - Accounts Receivable (Customer Debt)</span><span className="font-bold text-rose-400">Active</span></li>
                  <li className="flex justify-between"><span>1200 - Motorcycle Spares Merchandise Stock</span><span className="font-bold text-emerald-400">Asset</span></li>
                </ul>
              </div>

              <div className="p-3.5 rounded-xl border border-slate-800 bg-slate-800/40">
                <span className="font-bold text-blue-400 uppercase text-[10px] block mb-2">2000 - Liabilities</span>
                <ul className="space-y-1.5 font-mono text-slate-300">
                  <li className="flex justify-between"><span>2010 - Accounts Payable (Atlas Honda Depot)</span><span className="font-bold text-rose-400">Payable</span></li>
                  <li className="flex justify-between"><span>2020 - Accounts Payable (Crown Lifan Hub)</span><span className="font-bold text-slate-100">Payable</span></li>
                  <li className="flex justify-between"><span>2100 - Customer Advance Float</span><span className="font-bold text-slate-100">Liability</span></li>
                </ul>
              </div>

              <div className="p-3.5 rounded-xl border border-slate-800 bg-slate-800/40">
                <span className="font-bold text-emerald-400 uppercase text-[10px] block mb-2">4000 - Operating Revenue</span>
                <ul className="space-y-1.5 font-mono text-slate-300">
                  <li className="flex justify-between"><span>4010 - Motorcycle Spare Parts Sales</span><span className="font-bold text-emerald-400">Revenue</span></li>
                  <li className="flex justify-between"><span>4020 - Workshop Service & Tuning Labor</span><span className="font-bold text-slate-100">Revenue</span></li>
                  <li className="flex justify-between"><span>4090 - Scrap & Old Battery Sale</span><span className="font-bold text-slate-100">Other</span></li>
                </ul>
              </div>

              <div className="p-3.5 rounded-xl border border-slate-800 bg-slate-800/40">
                <span className="font-bold text-purple-400 uppercase text-[10px] block mb-2">5000 - Expenses & COGS</span>
                <ul className="space-y-1.5 font-mono text-slate-300">
                  <li className="flex justify-between"><span>5010 - Cost of Goods Sold (Parts Inward)</span><span className="font-bold text-slate-100">COGS</span></li>
                  <li className="flex justify-between"><span>5100 - Shop Rent & Plaza Maintenance</span><span className="font-bold text-slate-100">Expense</span></li>
                  <li className="flex justify-between"><span>5200 - Electricity, Water & Utilities</span><span className="font-bold text-slate-100">Expense</span></li>
                  <li className="flex justify-between"><span>5300 - Staff Salaries & Daily Refreshment</span><span className="font-bold text-slate-100">Expense</span></li>
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* RECORD EXPENSE MODAL */}
      {showExpenseModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4" style={{ colorScheme: 'dark' }}>
          <div className="bg-slate-900 text-slate-100 rounded-2xl shadow-2xl max-w-md w-full border border-slate-800 p-5 space-y-4 text-xs">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-white text-sm">Record Operational Expense</h3>
              <button onClick={() => setShowExpenseModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveExpense} className="space-y-3">
              <div>
                <label className="font-semibold block mb-1 text-slate-300">Expense Category:</label>
                <select
                  value={expenseForm.category}
                  onChange={e => setExpenseForm({ ...expenseForm, category: e.target.value as any })}
                  className={inputCls}
                >
                  <option value="Shop Refreshment & Tea">Shop Refreshment & Tea</option>
                  <option value="Electricity & Utilities">Electricity & Utilities</option>
                  <option value="Stationery & Receipt Paper">Stationery & Receipt Paper Rolls</option>
                  <option value="Shop Rent">Shop Rent</option>
                  <option value="Staff Salaries & Wages">Staff Salaries & Wages</option>
                  <option value="Maintenance & Tools">Maintenance & Workshop Tools</option>
                  <option value="Marketing">Marketing / WhatsApp SMS</option>
                  <option value="Misc">Miscellaneous</option>
                </select>
              </div>

              <div>
                <label className="font-semibold block mb-1 text-slate-300">Amount (PKR):</label>
                <input
                  type="number"
                  required
                  value={expenseForm.amount}
                  onChange={e => setExpenseForm({ ...expenseForm, amount: parseFloat(e.target.value) || 0 })}
                  className={`${inputCls} font-bold !text-rose-400`}
                />
              </div>

              <div>
                <label className="font-semibold block mb-1 text-slate-300">Disburse from Counter Cash Drawer:</label>
                <select
                  value={expenseForm.paidFromCounter}
                  onChange={e => setExpenseForm({ ...expenseForm, paidFromCounter: e.target.value })}
                  className={inputCls}
                >
                  {counters.map(c => (
                    <option key={c.id} value={c.id}>{c.name} (Available: Rs. {c.currentCash.toLocaleString()})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-semibold block mb-1 text-slate-300">Notes / Description:</label>
                <input
                  type="text"
                  value={expenseForm.notes}
                  onChange={e => setExpenseForm({ ...expenseForm, notes: e.target.value })}
                  className={inputCls}
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowExpenseModal(false)}
                  className="px-4 py-2 rounded-xl text-slate-300 hover:bg-slate-800 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-bold transition shadow-md shadow-brand-500/25"
                >
                  Save & Deduct from Drawer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* RECORD CASHBOOK MODAL */}
      {showCashbookModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4" style={{ colorScheme: 'dark' }}>
          <div className="bg-slate-900 text-slate-100 rounded-2xl shadow-2xl max-w-md w-full border border-slate-800 p-5 space-y-4 text-xs">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-white text-sm">Add Cashbook Entry</h3>
              <button onClick={() => setShowCashbookModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveCashbook} className="space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setCashbookForm({ ...cashbookForm, type: 'in' })}
                  className={`py-2 rounded-xl font-bold transition ${cashbookForm.type === 'in' ? 'bg-emerald-600 text-white' : 'bg-slate-800 text-slate-400 hover:text-slate-200'}`}
                >
                  Cash-In (Deposit)
                </button>
                <button
                  type="button"
                  onClick={() => setCashbookForm({ ...cashbookForm, type: 'out' })}
                  className={`py-2 rounded-xl font-bold transition ${cashbookForm.type === 'out' ? 'bg-rose-600 text-white' : 'bg-slate-800 text-slate-400 hover:text-slate-200'}`}
                >
                  Cash-Out (Withdrawal)
                </button>
              </div>

              <div>
                <label className="font-semibold block mb-1 text-slate-300">Category:</label>
                <select
                  value={cashbookForm.category}
                  onChange={e => setCashbookForm({ ...cashbookForm, category: e.target.value as any })}
                  className={inputCls}
                >
                  <option value="Capital In">Capital Float Injection</option>
                  <option value="Owner Drawing">Owner Drawing / Profit Takeout</option>
                  <option value="Cash Transfer">Counter Float Transfer</option>
                  <option value="Customer Payment">Customer Payment Settlement</option>
                </select>
              </div>

              <div>
                <label className="font-semibold block mb-1 text-slate-300">Amount (Rs.):</label>
                <input
                  type="number"
                  value={cashbookForm.amount}
                  onChange={e => setCashbookForm({ ...cashbookForm, amount: parseFloat(e.target.value) || 0 })}
                  className={`${inputCls} font-bold`}
                />
              </div>

              <div>
                <label className="font-semibold block mb-1 text-slate-300">Description:</label>
                <input
                  type="text"
                  value={cashbookForm.description}
                  onChange={e => setCashbookForm({ ...cashbookForm, description: e.target.value })}
                  className={inputCls}
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCashbookModal(false)}
                  className="px-4 py-2 rounded-xl text-slate-300 hover:bg-slate-800 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-bold transition"
                >
                  Post to Cashbook
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};