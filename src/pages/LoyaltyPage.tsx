import React, { useState } from 'react';
import { 
  Award, Sparkles, Star, Users, ArrowUpRight, CheckCircle2, 
  Settings, DollarSign, Gift 
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export const LoyaltyPage: React.FC = () => {
  const { customers } = useApp();

  const [earnRate, setEarnRate] = useState<number>(100); // 1 point per Rs. 100
  const [redeemRate, setRedeemRate] = useState<number>(1); // 1 point = Rs. 1
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSaveRules = (e: React.FormEvent) => {
    e.preventDefault();
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  return (
    <div className="p-4 md:p-6 space-y-6 overflow-y-auto max-w-7xl mx-auto pb-28">
      {/* Header */}
      <div>
        <h1 className="text-xl font-extrabold text-white flex items-center gap-2">
          <Award className="w-5 h-5 text-amber-500" />
          Customer Loyalty & Repeat-Buyer Rewards Program
        </h1>
        <p className="text-xs text-slate-400">
          Incentivize workshop mechanics and bike riders with automatic loyalty points on every purchase.
        </p>
      </div>

      {/* Program Config Card */}
      <div className="bg-[#111622] p-5 rounded-2xl border border-[#1E2638] shadow-lg space-y-4">
        <h3 className="font-bold text-white text-sm flex items-center gap-2">
          <Settings className="w-4 h-4 text-rose-500" />
          Loyalty Rules Configuration
        </h3>

        <form onSubmit={handleSaveRules} className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs items-end">
          <div>
            <label className="font-semibold block mb-1 text-slate-300">Earn Points Rule:</label>
            <div className="flex items-center gap-2">
              <span className="text-slate-400">Earn 1 Point for every</span>
              <input
                type="number"
                min="10"
                value={earnRate}
                onChange={e => setEarnRate(parseInt(e.target.value) || 100)}
                className="w-24 p-2 border border-[#1E2638] rounded-xl bg-[#0B0E14] text-white font-bold text-center focus:outline-none focus:border-rose-500"
              />
              <span className="text-slate-400">PKR spent</span>
            </div>
          </div>

          <div>
            <label className="font-semibold block mb-1 text-slate-300">Redemption Value:</label>
            <div className="flex items-center gap-2">
              <span className="text-slate-400">1 Loyalty Point =</span>
              <input
                type="number"
                min="0.5"
                step="0.5"
                value={redeemRate}
                onChange={e => setRedeemRate(parseFloat(e.target.value) || 1)}
                className="w-20 p-2 border border-[#1E2638] rounded-xl bg-[#0B0E14] font-bold text-center text-amber-400 focus:outline-none focus:border-rose-500"
              />
              <span className="text-slate-400">PKR discount</span>
            </div>
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

      {/* Tiers Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Bronze */}
        <div className="p-4 rounded-2xl border border-amber-800/40 bg-amber-950/20 space-y-2">
          <div className="flex items-center justify-between">
            <span className="font-extrabold text-amber-400 text-sm">BRONZE RIDER</span>
            <Award className="w-5 h-5 text-amber-400" />
          </div>
          <p className="text-xs text-slate-400">Default for all registered retail customers.</p>
          <div className="pt-2 text-xs font-semibold text-slate-300">
            • 1 pt per Rs. 100 spent<br/>
            • Seasonal oil change coupons
          </div>
        </div>

        {/* Silver */}
        <div className="p-4 rounded-2xl border border-slate-700 bg-[#161C2C] space-y-2">
          <div className="flex items-center justify-between">
            <span className="font-extrabold text-slate-200 text-sm">SILVER FLEET</span>
            <Award className="w-5 h-5 text-slate-300" />
          </div>
          <p className="text-xs text-slate-400">Purchases &gt; Rs. 20,000.</p>
          <div className="pt-2 text-xs font-semibold text-slate-300">
            • 1.25x point booster<br/>
            • Priority parts delivery
          </div>
        </div>

        {/* Gold */}
        <div className="p-4 rounded-2xl border border-amber-500/40 bg-amber-950/30 space-y-2">
          <div className="flex items-center justify-between">
            <span className="font-extrabold text-amber-300 text-sm">GOLD MECHANIC VIP</span>
            <Award className="w-5 h-5 text-amber-400" />
          </div>
          <p className="text-xs text-slate-400">Purchases &gt; Rs. 100,000 (Workshops).</p>
          <div className="pt-2 text-xs font-semibold text-slate-300">
            • Wholesale & Mechanic pricing unlocked<br/>
            • 30-day extended credit terms
          </div>
        </div>
      </div>

      {/* Customer Loyalty Table */}
      <div className="bg-[#111622] rounded-2xl border border-[#1E2638] shadow-lg overflow-hidden">
        <div className="p-4 border-b border-[#1E2638] font-bold text-xs uppercase text-slate-400">
          Customer Points Roster
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-[#0B0E14] text-slate-400 font-semibold uppercase text-[10px]">
              <tr>
                <th className="p-3">Customer</th>
                <th className="p-3">Category</th>
                <th className="p-3">Total Spent</th>
                <th className="p-3">Loyalty Tier</th>
                <th className="p-3">Active Points Balance</th>
                <th className="p-3">Cash Redemption Value</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1E2638] text-slate-200">
              {customers.map(c => (
                <tr key={c.id} className="hover:bg-[#161C2C]/50 transition">
                  <td className="p-3 font-semibold text-white">{c.name}</td>
                  <td className="p-3 text-slate-400">{c.group}</td>
                  <td className="p-3 font-mono">Rs. {c.totalPurchases.toLocaleString()}</td>
                  <td className="p-3">
                    <span className="px-2 py-0.5 rounded font-bold text-[10px] uppercase bg-amber-950 text-amber-300 border border-amber-800/40">
                      {c.loyaltyTier}
                    </span>
                  </td>
                  <td className="p-3 font-mono font-bold text-amber-400">
                    {c.loyaltyPoints} Points
                  </td>
                  <td className="p-3 font-mono font-bold text-emerald-400">
                    Rs. {(c.loyaltyPoints * redeemRate).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
