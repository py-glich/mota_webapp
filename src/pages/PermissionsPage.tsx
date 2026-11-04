import React from 'react';
import { 
  ShieldCheck, Lock, Check, X, ShieldAlert, Sparkles, 
  Eye, Percent, RotateCcw, AlertTriangle, Database, Users 
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { User, UserPermissions } from '../types';

export const PermissionsPage: React.FC = () => {
  const { users, updateUserPermissions, currentUser } = useAuth();

  const permissionDefinitions: { key: keyof UserPermissions; label: string; desc: string; danger?: boolean }[] = [
    { key: 'canViewPurchasePrice', label: 'View Wholesale Purchase Cost', desc: 'Allow viewing confidential purchase prices from spare parts suppliers.' },
    { key: 'canViewProfit', label: 'View Gross Profit & Margins', desc: 'Allow viewing financial profit margins on dashboard and reports.' },
    { key: 'canOverridePrice', label: 'Override Unit Selling Prices', desc: 'Permit cashier to manually edit unit sale price on the POS cart.', danger: true },
    { key: 'canApplyCustomDiscount', label: 'Apply Custom Bill Discounts', desc: 'Permit entering invoice-level or line-level special discounts.' },
    { key: 'canVoidInvoice', label: 'Void / Cancel Completed Sales Bills', desc: 'Permit cashier to cancel a posted invoice and reinstate stock.', danger: true },
    { key: 'canAdjustStock', label: 'Direct Stock Adjustments', desc: 'Authorize editing warehouse quantities without manager review.', danger: true },
    { key: 'canViewFinancials', label: 'View Cashbook & Financial Vouchers', desc: 'Allow access to shop cashbook, expenses, and drawer totals.' },
    { key: 'canApproveReturns', label: 'Approve Customer Returns & Refunds', desc: 'Authorize cash refunds and credit returns from customers.' },
    { key: 'canManageUsers', label: 'Manage Staff Accounts', desc: 'Create, edit, or deactivate cashier and manager profiles.', danger: true },
    { key: 'canManageBackups', label: 'Database Backup & Restore', desc: 'Export full database snapshot or restore from external JSON.', danger: true },
  ];

  const handleToggle = (user: User, permKey: keyof UserPermissions) => {
    if (user.role === 'owner') {
      alert('Owner permissions cannot be restricted.');
      return;
    }
    const currentVal = !!user.permissions[permKey];
    updateUserPermissions(user.id, {
      [permKey]: !currentVal
    });
  };

  const handleMaxDiscountChange = (user: User, newMax: number) => {
    updateUserPermissions(user.id, {
      maxDiscountPercent: newMax
    });
  };

  return (
    <div className="p-4 md:p-6 space-y-6 overflow-y-auto max-w-7xl mx-auto pb-28">
      {/* Header */}
      <div>
        <h1 className="text-xl font-extrabold text-white flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-rose-500" />
          Role-Based Access Control (RBAC) & Security Matrix
        </h1>
        <p className="text-xs text-slate-400">
          Granular permission toggles enforced instantly across POS billing, financial reports, cost hiding, and void workflows.
        </p>
      </div>

      {/* Permissions Matrix Table */}
      <div className="bg-[#111622] rounded-2xl border border-[#1E2638] shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-[#0B0E14] text-slate-400 font-semibold uppercase text-[10px]">
              <tr>
                <th className="p-4 min-w-[260px]">Capability / Security Control</th>
                {users.map(u => (
                  <th key={u.id} className="p-4 text-center min-w-[130px]">
                    <div className="font-bold text-white">{u.name.split(' ')[0]}</div>
                    <span className="text-[9px] font-mono uppercase text-rose-500 block mt-0.5">
                      {u.role}
                    </span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1E2638] text-slate-200">
              {permissionDefinitions.map(def => (
                <tr key={def.key} className="hover:bg-[#161C2C]/50 transition">
                  <td className="p-4">
                    <div className="font-bold text-white flex items-center gap-1.5">
                      {def.danger && <ShieldAlert className="w-3.5 h-3.5 text-rose-500" />}
                      <span>{def.label}</span>
                    </div>
                    <div className="text-[10px] text-slate-400 mt-0.5">{def.desc}</div>
                  </td>

                  {users.map(u => {
                    const isAllowed = u.role === 'owner' || !!u.permissions[def.key];
                    const isOwner = u.role === 'owner';

                    return (
                      <td key={u.id} className="p-4 text-center">
                        <button
                          disabled={isOwner}
                          onClick={() => handleToggle(u, def.key)}
                          className={`w-7 h-7 rounded-lg inline-flex items-center justify-center transition ${
                            isAllowed
                              ? 'bg-emerald-950 text-emerald-400 border border-emerald-800/40'
                              : 'bg-rose-950 text-rose-400 border border-rose-800/40'
                          } ${isOwner ? 'opacity-80 cursor-default' : 'hover:scale-105 cursor-pointer shadow-xs'}`}
                          title={isOwner ? 'Owner has full privileges' : 'Click to Toggle Permission'}
                        >
                          {isAllowed ? <Check className="w-4 h-4" /> : <X className="w-4 h-4" />}
                        </button>
                      </td>
                    );
                  })}
                </tr>
              ))}

              {/* Max Discount Limit Row */}
              <tr className="bg-[#0B0E14]">
                <td className="p-4 font-bold text-white">
                  <div>Max Allowed Bill Discount (%)</div>
                  <div className="text-[10px] text-slate-400 font-normal">
                    Cashier POS bill discount cannot exceed this limit without supervisor authorization.
                  </div>
                </td>
                {users.map(u => (
                  <td key={u.id} className="p-4 text-center">
                    <input
                      type="number"
                      min="0"
                      max="100"
                      disabled={u.role === 'owner'}
                      value={u.permissions.maxDiscountPercent}
                      onChange={e => handleMaxDiscountChange(u, parseInt(e.target.value) || 0)}
                      className="w-16 p-1 text-center font-bold border border-[#1E2638] rounded-lg bg-[#111622] text-rose-400 disabled:opacity-80"
                    />
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
