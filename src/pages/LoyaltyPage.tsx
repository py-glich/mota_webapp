import React, { useState } from 'react';
import { 
  Award, Sparkles, Star, Users, ArrowUpRight, CheckCircle2, 
  Settings, DollarSign, Gift, Clock, Send, Calendar, 
  ShieldCheck, AlertTriangle, RefreshCw 
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export const LoyaltyPage: React.FC = () => {
  const { customers, sendSms } = useApp();

  const [earnRate, setEarnRate] = useState<number>(100); // 1 point per Rs. 100
  const [redeemRate, setRedeemRate] = useState<number>(1); // 1 point = Rs. 1
  const [expiryDays, setExpiryDays] = useState<string>('180'); // 180 days (6 months)
  const [autoExpiryAlert, setAutoExpiryAlert] = useState<boolean>(true);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [auditResult, setAuditResult] = useState<string | null>(null);
  const [sendingId, setSendingId] = useState<string | null>(null);

  const handleSaveRules = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem('motopro_loyalty_earn_rate', earnRate.toString());
    localStorage.setItem('motopro_loyalty_redeem_rate', redeemRate.toString());
    localStorage.setItem('motopro_loyalty_expiry_days', expiryDays);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  const calculateExpiryDate = (lastPurchaseDate?: string) => {
    if (expiryDays === 'never') return 'Never Expires';
    const days = parseInt(expiryDays) || 180;
    const base = lastPurchaseDate ? new Date(lastPurchaseDate) : new Date();
    base.setDate(base.getDate() + days);
    return base.toISOString().split('T')[0];
  };

  const handleRunExpiryAudit = () => {
    const withPoints = customers.filter(c => (c.loyaltyPoints || 0) > 0);
    const expiringSoon = withPoints.filter(c => (c.loyaltyPoints || 0) >= 30);
    setAuditResult(`Audit Complete: ${withPoints.length} accounts hold active points. ${expiringSoon.length} customers have balances valid under the ${expiryDays === 'never' ? 'permanent' : expiryDays + '-day'} policy.`);
    setTimeout(() => setAuditResult(null), 6000);
  };

  const handleSendExpiryReminder = async (customer: typeof customers[0]) => {
    setSendingId(customer.id);
    try {
      const expDate = calculateExpiryDate(customer.lastPurchaseDate);
      const msg = `Dear ${customer.name}! You have ${customer.loyaltyPoints} MotoPro Loyalty Points (Worth Rs. ${customer.loyaltyPoints * redeemRate}) expiring on ${expDate}. Visit our store to redeem them on your next parts or oil service! Call: 0300-1234567.`;
      const res = await sendSms(customer.phone, customer.name, msg, 'offer', customer.id);
      if (res.success) {
        alert(`Expiry reminder SMS sent to ${customer.name} (${customer.phone})!`);
      } else {
        alert(`Notice: ${res.message}`);
      }
    } catch (err: any) {
      alert(`Error: ${err.message}`);
    } finally {
      setSendingId(null);
    }
  };

  return (
    <div className="p-4 md:p-6 space-y-6 overflow-y-auto w-full pb-28">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-extrabold text-white flex items-center gap-2">
            <Award className="w-5 h-5 text-amber-500" />
            Customer Loyalty & Points Rewards Program
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Automated points accumulation, POS redemption rules, and expiry lifecycle policy.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleRunExpiryAudit}
            className="px-3.5 py-2 bg-[#1A2234] hover:bg-[#202A40] text-slate-200 border border-[#26334D] text-xs font-semibold rounded-xl flex items-center gap-1.5 transition"
          >
            <Clock className="w-3.5 h-3.5 text-amber-400" />
            <span>Audit Points Validity</span>
          </button>
        </div>
      </div>

      {auditResult && (
        <div className="p-3.5 rounded-xl bg-amber-950/40 border border-amber-800/60 text-amber-200 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
          <span>{auditResult}</span>
        </div>
      )}

      {/* Program Config Card */}
      <div className="bg-[#111622] p-5 rounded-2xl border border-[#1E2638] shadow-lg space-y-4">
        <h3 className="font-bold text-white text-sm flex items-center gap-2">
          <Settings className="w-4 h-4 text-rose-500" />
          Loyalty Rules & Automated Expiry Configuration
        </h3>

        <form onSubmit={handleSaveRules} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs items-end">
          <div>
            <label className="font-semibold block mb-1 text-slate-300">Earn Points Rule:</label>
            <div className="flex items-center gap-2">
              <span className="text-slate-400">1 Pt for each</span>
              <input
                type="number"
                min="10"
                value={earnRate}
                onChange={e => setEarnRate(parseInt(e.target.value) || 100)}
                className="w-20 p-2 border border-[#1E2638] rounded-xl bg-[#0B0E14] text-white font-bold text-center focus:outline-none focus:border-rose-500"
              />
              <span className="text-slate-400">PKR spent</span>
            </div>
          </div>

          <div>
            <label className="font-semibold block mb-1 text-slate-300">Redemption Value:</label>
            <div className="flex items-center gap-2">
              <span className="text-slate-400">1 Pt =</span>
              <input
                type="number"
                min="0.5"
                step="0.5"
                value={redeemRate}
                onChange={e => setRedeemRate(parseFloat(e.target.value) || 1)}
                className="w-16 p-2 border border-[#1E2638] rounded-xl bg-[#0B0E14] font-bold text-center text-amber-400 focus:outline-none focus:border-rose-500"
              />
              <span className="text-slate-400">PKR discount</span>
            </div>
          </div>

          <div>
            <label className="font-semibold block mb-1 text-slate-300">Points Expiry Policy:</label>
            <select
              value={expiryDays}
              onChange={e => setExpiryDays(e.target.value)}
              className="w-full p-2 border border-[#1E2638] rounded-xl bg-[#0B0E14] text-white font-semibold focus:outline-none focus:border-rose-500"
            >
              <option value="90">Expires in 90 Days (3 Months)</option>
              <option value="180">Expires in 180 Days (6 Months)</option>
              <option value="365">Expires in 365 Days (1 Year)</option>
              <option value="never">Never Expire (Lifetime)</option>
            </select>
          </div>

          <div>
            <button
              type="submit"
              className="w-full py-2.5 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-xl transition shadow-md shadow-rose-600/25 flex items-center justify-center gap-1.5"
            >
              {savedSuccess ? <CheckCircle2 className="w-4 h-4" /> : <Sparkles className="w-4 h-4" />}
              <span>{savedSuccess ? 'Rules Updated!' : 'Save Loyalty Rules'}</span>
            </button>
          </div>
        </form>
      </div>

      {/* POS Billing Redemption Notice Banner */}
      <div className="bg-gradient-to-r from-amber-950/40 to-[#111622] p-4 rounded-2xl border border-amber-800/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
            <DollarSign className="w-5 h-5" />
          </div>
          <div>
            <span className="font-bold text-white text-xs block">
              Automated POS Checkout Redemption Active
            </span>
            <span className="text-[11px] text-slate-400 block mt-0.5">
              When billing any registered customer in POS, cashiers can enter points to redeem. 1 point instantly deducts Rs. {redeemRate} from the final invoice.
            </span>
          </div>
        </div>
        <div className="shrink-0 flex items-center gap-2 font-mono text-[11px] text-amber-300 font-bold bg-[#0B0E14] px-3 py-1.5 rounded-xl border border-amber-800/40">
          <span>Formula: Subtotal - (Points × Rs. {redeemRate})</span>
        </div>
      </div>

      {/* Tiers Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Bronze */}
        <div className="p-4 rounded-2xl border border-amber-800/40 bg-amber-950/20 space-y-2">
          <div className="flex items-center justify-between">
            <span className="font-extrabold text-amber-400 text-sm">BRONZE RIDER</span>
            <Award className="w-5 h-5 text-amber-400" />
          </div>
          <p className="text-xs text-slate-400">Default for all registered retail customers.</p>
          <div className="pt-2 text-xs font-semibold text-slate-300 space-y-1">
            <div>• 1 pt per Rs. {earnRate} spent</div>
            <div>• Validity: {expiryDays === 'never' ? 'Never expires' : expiryDays + ' Days'}</div>
            <div>• Standard retail parts pricing</div>
          </div>
        </div>

        {/* Silver */}
        <div className="p-4 rounded-2xl border border-slate-700 bg-[#161C2C] space-y-2">
          <div className="flex items-center justify-between">
            <span className="font-extrabold text-slate-200 text-sm">SILVER FLEET</span>
            <Award className="w-5 h-5 text-slate-300" />
          </div>
          <p className="text-xs text-slate-400">Purchases &gt; Rs. 20,000 (Regular riders).</p>
          <div className="pt-2 text-xs font-semibold text-slate-300 space-y-1">
            <div>• 1.25x point booster multiplier</div>
            <div>• Validity: {expiryDays === 'never' ? 'Never expires' : expiryDays + ' Days'}</div>
            <div>• Free priority chain adjustment on visit</div>
          </div>
        </div>

        {/* Gold */}
        <div className="p-4 rounded-2xl border border-amber-500/40 bg-amber-950/30 space-y-2">
          <div className="flex items-center justify-between">
            <span className="font-extrabold text-amber-300 text-sm">GOLD MECHANIC VIP</span>
            <Award className="w-5 h-5 text-amber-400" />
          </div>
          <p className="text-xs text-slate-400">Purchases &gt; Rs. 100,000 (Workshops & Fleet).</p>
          <div className="pt-2 text-xs font-semibold text-slate-300 space-y-1">
            <div>• Wholesale & Mechanic pricing tier</div>
            <div>• 30-day extended credit khata terms</div>
            <div>• Priority delivery & seasonal bonuses</div>
          </div>
        </div>
      </div>

      {/* Customer Loyalty Table */}
      <div className="bg-[#111622] rounded-2xl border border-[#1E2638] shadow-lg overflow-hidden">
        <div className="p-4 border-b border-[#1E2638] flex items-center justify-between">
          <span className="font-bold text-xs uppercase text-slate-400 tracking-wider">
            Customer Points Roster & Expiry Tracking
          </span>
          <span className="text-[11px] text-slate-500">
            {customers.length} Registered Accounts
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-[#0B0E14] text-slate-400 font-semibold uppercase text-[10px]">
              <tr>
                <th className="p-3">Customer</th>
                <th className="p-3">Bike Model</th>
                <th className="p-3">Total Spent</th>
                <th className="p-3">Loyalty Tier</th>
                <th className="p-3">Points Balance</th>
                <th className="p-3">Cash Redemption</th>
                <th className="p-3">Points Expiry Date</th>
                <th className="p-3 text-right">Instant Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1E2638] text-slate-200">
              {customers.map(c => {
                const expiry = calculateExpiryDate(c.lastPurchaseDate);
                const hasPoints = (c.loyaltyPoints || 0) > 0;
                return (
                  <tr key={c.id} className="hover:bg-[#161D2C]/50 transition">
                    <td className="p-3 font-semibold text-white">
                      <div>{c.name}</div>
                      <div className="text-[10px] text-slate-400">{c.phone}</div>
                    </td>
                    <td className="p-3 text-slate-300">{c.bikeModel || 'Universal'}</td>
                    <td className="p-3 font-mono">Rs. {c.totalPurchases.toLocaleString()}</td>
                    <td className="p-3">
                      <span className="px-2 py-0.5 rounded font-bold text-[10px] uppercase bg-amber-950 text-amber-300 border border-amber-800/40">
                        {c.loyaltyTier || 'Bronze'}
                      </span>
                    </td>
                    <td className="p-3 font-mono font-bold text-amber-400">
                      {c.loyaltyPoints || 0} Points
                    </td>
                    <td className="p-3 font-mono font-bold text-emerald-400">
                      Rs. {((c.loyaltyPoints || 0) * redeemRate).toLocaleString()}
                    </td>
                    <td className="p-3 font-mono text-[11px]">
                      {hasPoints ? (
                        <span className={`px-2 py-0.5 rounded font-semibold ${expiryDays === 'never' ? 'text-slate-400' : 'text-amber-300 bg-amber-950/40 border border-amber-800/30'}`}>
                          {expiry}
                        </span>
                      ) : (
                        <span className="text-slate-500">No active points</span>
                      )}
                    </td>
                    <td className="p-3 text-right">
                      {hasPoints && (
                        <button
                          type="button"
                          disabled={sendingId === c.id}
                          onClick={() => handleSendExpiryReminder(c)}
                          className="px-2.5 py-1 rounded-lg bg-amber-600/20 hover:bg-amber-600 text-amber-300 hover:text-white border border-amber-500/30 text-[11px] font-bold inline-flex items-center gap-1.5 transition disabled:opacity-50"
                          title="Send Points Expiry & Balance SMS"
                        >
                          <Send className="w-3 h-3" />
                          <span>{sendingId === c.id ? 'Sending...' : 'Alert SMS'}</span>
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
