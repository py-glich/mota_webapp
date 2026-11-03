import React, { useState } from 'react';
import { 
  Monitor, CheckCircle2, Clock, DollarSign, AlertTriangle, 
  ArrowRight, ShieldCheck, X, FileText, UserCheck 
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useApp } from '../context/AppContext';
import { Counter, ShiftClosing } from '../types';

export const CountersPage: React.FC = () => {
  const { counters, currentCounter, setCurrentCounterById, closeCounterShift, currentUser } = useAuth();
  const { invoices, expenses, shiftClosings, recordShiftClosing } = useApp();

  const [closingModalCounter, setClosingModalCounter] = useState<Counter | null>(null);
  const [actualCountedCash, setActualCountedCash] = useState<number>(0);
  const [shiftNotes, setShiftNotes] = useState<string>('');

  const openCloseShiftModal = (counter: Counter) => {
    setClosingModalCounter(counter);
    setActualCountedCash(counter.currentCash);
    setShiftNotes('');
  };

  const handleConfirmShiftClosing = (e: React.FormEvent) => {
    e.preventDefault();
    if (!closingModalCounter) return;

    // Expected cash = current drawer cash
    const expected = closingModalCounter.currentCash;
    const discrepancy = actualCountedCash - expected;
    const status = discrepancy === 0 ? 'balanced' : discrepancy > 0 ? 'surplus' : 'shortage';

    recordShiftClosing({
      counterId: closingModalCounter.id,
      counterName: closingModalCounter.name,
      cashierName: currentUser.name,
      date: new Date().toISOString().replace('T', ' ').substring(0, 16),
      openingCash: closingModalCounter.openingCash,
      cashSales: closingModalCounter.todaySalesAmount,
      cashReceivedOnAccount: 0,
      cashExpenses: 0,
      cashPaidToSuppliers: 0,
      expectedDrawerCash: expected,
      actualDrawerCash: actualCountedCash,
      discrepancy,
      status,
      notes: shiftNotes
    });

    closeCounterShift(closingModalCounter.id, actualCountedCash, shiftNotes);
    alert(`Shift closed for ${closingModalCounter.name}! Reconciliation status: ${status.toUpperCase()} (Discrepancy: Rs. ${discrepancy}).`);
    setClosingModalCounter(null);
  };

  return (
    <div className="p-4 md:p-6 space-y-6 overflow-y-auto max-w-7xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-xl font-extrabold text-white flex items-center gap-2">
          <Monitor className="w-5 h-5 text-rose-500" />
          Multiple Billing Counters & Drawer Reconciliation
        </h1>
        <p className="text-xs text-slate-400">
          Two independent physical POS terminals connected to shared real-time inventory with shift closing controls.
        </p>
      </div>

      {/* Counter Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {counters.map(counter => {
          const isCurrent = counter.id === currentCounter.id;

          return (
            <div
              key={counter.id}
              className={`bg-[#111622] rounded-2xl border p-5 shadow-lg space-y-4 transition ${
                isCurrent ? 'border-rose-500 ring-2 ring-rose-500/20' : 'border-[#1E2638]'
              }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-white text-base">{counter.name}</h3>
                    {isCurrent && (
                      <span className="px-2 py-0.5 rounded-full bg-rose-950 text-rose-300 border border-rose-800/40 text-[10px] font-bold">
                        Active Terminal
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-400">{counter.description}</p>
                </div>

                <span className="px-2.5 py-1 rounded-full text-xs font-bold uppercase bg-emerald-950 text-emerald-300 border border-emerald-800/40">
                  ● {counter.status}
                </span>
              </div>

              {/* Financial Metrics */}
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 bg-[#0B0E14] rounded-xl border border-[#1E2638]">
                  <span className="text-[10px] text-slate-400 block">Opening Cash Float</span>
                  <span className="font-mono font-bold text-sm text-white">
                    Rs. {counter.openingCash.toLocaleString()}
                  </span>
                </div>
                <div className="p-3 bg-[#0B0E14] rounded-xl border border-[#1E2638]">
                  <span className="text-[10px] text-slate-400 block">Current Cash in Drawer</span>
                  <span className="font-mono font-extrabold text-sm text-rose-400">
                    Rs. {counter.currentCash.toLocaleString()}
                  </span>
                </div>
                <div className="p-3 bg-[#0B0E14] rounded-xl border border-[#1E2638]">
                  <span className="text-[10px] text-slate-400 block">Today's Invoices Generated</span>
                  <span className="font-bold text-sm text-white">
                    {counter.todaySalesCount} Bills
                  </span>
                </div>
                <div className="p-3 bg-[#0B0E14] rounded-xl border border-[#1E2638]">
                  <span className="text-[10px] text-slate-400 block">Today's Total Billing</span>
                  <span className="font-mono font-bold text-sm text-emerald-400">
                    Rs. {counter.todaySalesAmount.toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2 pt-2 border-t border-[#1E2638]">
                {!isCurrent ? (
                  <button
                    onClick={() => setCurrentCounterById(counter.id)}
                    className="flex-1 py-2 bg-[#1A2234] hover:bg-[#202A40] text-slate-200 font-bold text-xs rounded-xl transition border border-[#26334D]"
                  >
                    Switch to This Terminal
                  </button>
                ) : (
                  <div className="flex-1 py-2 text-center text-xs font-semibold text-emerald-400 flex items-center justify-center gap-1">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Operating on this terminal</span>
                  </div>
                )}

                <button
                  onClick={() => openCloseShiftModal(counter)}
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs rounded-xl transition shadow-md shadow-rose-600/20"
                >
                  Close Shift & Drawer
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Shift Closings Log */}
      <div className="bg-[#111622] rounded-2xl border border-[#1E2638] shadow-lg overflow-hidden">
        <div className="p-4 border-b border-[#1E2638] font-bold text-xs uppercase text-slate-400">
          Previous Shift Closings & Cash Drawer Audit Log
        </div>
        <table className="w-full text-xs text-left">
          <thead className="bg-[#0B0E14] text-slate-400 font-semibold uppercase text-[10px]">
            <tr>
              <th className="p-3">Closing Time</th>
              <th className="p-3">Counter</th>
              <th className="p-3">Cashier</th>
              <th className="p-3">Expected Cash</th>
              <th className="p-3">Actual Counted Cash</th>
              <th className="p-3">Discrepancy</th>
              <th className="p-3">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#1E2638] text-slate-200">
            {shiftClosings.length === 0 ? (
              <tr>
                <td colSpan={7} className="p-6 text-center text-slate-500">No shift closings logged today yet.</td>
              </tr>
            ) : (
              shiftClosings.map(shift => (
                <tr key={shift.id} className="hover:bg-[#161C2C]/50 transition">
                  <td className="p-3 font-mono text-[11px] text-slate-400">{shift.closedAt}</td>
                  <td className="p-3 font-bold text-white">{shift.counterName.split('(')[0]}</td>
                  <td className="p-3 text-slate-300">{shift.cashierName}</td>
                  <td className="p-3 font-mono">Rs. {shift.expectedDrawerCash.toLocaleString()}</td>
                  <td className="p-3 font-mono font-bold text-white">Rs. {shift.actualDrawerCash.toLocaleString()}</td>
                  <td className="p-3 font-mono font-bold">
                    {shift.discrepancy === 0 ? (
                      <span className="text-emerald-400">Balanced (0)</span>
                    ) : shift.discrepancy > 0 ? (
                      <span className="text-blue-400">Surplus (+{shift.discrepancy})</span>
                    ) : (
                      <span className="text-rose-400">Shortage ({shift.discrepancy})</span>
                    )}
                  </td>
                  <td className="p-3">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                      shift.status === 'balanced' ? 'bg-emerald-950 text-emerald-400 border border-emerald-800/40' :
                      shift.status === 'surplus' ? 'bg-blue-950 text-blue-400 border border-blue-800/40' :
                      'bg-rose-950 text-rose-400 border border-rose-800/40'
                    }`}>
                      {shift.status}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* CLOSE SHIFT MODAL */}
      {closingModalCounter && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#111622] rounded-2xl shadow-2xl max-w-md w-full border border-[#1E2638] p-5 space-y-4 text-xs text-slate-200">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-white text-sm">
                Close Drawer Shift: {closingModalCounter.name}
              </h3>
              <button onClick={() => setClosingModalCounter(null)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3 bg-[#0B0E14] border border-[#1E2638] rounded-xl space-y-1">
              <div className="flex justify-between">
                <span className="text-slate-400">System Expected Cash in Drawer:</span>
                <span className="font-mono font-bold text-white">
                  Rs. {closingModalCounter.currentCash.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Cashier:</span>
                <span className="font-semibold text-rose-400">{currentUser.name}</span>
              </div>
            </div>

            <form onSubmit={handleConfirmShiftClosing} className="space-y-3">
              <div>
                <label className="font-semibold block mb-1 text-slate-300">
                  Actual Physical Cash Counted in Drawer (PKR):
                </label>
                <input
                  type="number"
                  min="0"
                  required
                  value={actualCountedCash}
                  onChange={e => setActualCountedCash(parseFloat(e.target.value) || 0)}
                  className="w-full p-2.5 border border-[#1E2638] rounded-xl bg-[#0B0E14] text-white font-mono font-extrabold text-base text-center focus:outline-none focus:border-rose-500"
                />
              </div>

              {/* Real-time discrepancy check */}
              <div className="flex justify-between font-bold pt-1">
                <span className="text-slate-300">Discrepancy (Over / Short):</span>
                <span className={actualCountedCash - closingModalCounter.currentCash >= 0 ? 'text-emerald-400' : 'text-rose-400'}>
                  Rs. {(actualCountedCash - closingModalCounter.currentCash).toLocaleString()}
                </span>
              </div>

              <div>
                <label className="font-semibold block mb-1 text-slate-300">Shift Closing Handover Notes:</label>
                <input
                  type="text"
                  placeholder="e.g., Handed over Rs. 20,000 to shop manager, kept Rs. 5,000 float"
                  value={shiftNotes}
                  onChange={e => setShiftNotes(e.target.value)}
                  className="w-full p-2 border border-[#1E2638] rounded-xl bg-[#0B0E14] text-white placeholder-slate-500 focus:outline-none focus:border-rose-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setClosingModalCounter(null)}
                  className="px-4 py-2 rounded-xl text-slate-400 hover:text-white hover:bg-[#161C2C]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold transition shadow-md shadow-rose-600/25"
                >
                  Finalize Drawer Closing
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
