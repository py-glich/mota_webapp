import React, { useState } from 'react';
import { 
  UserCheck, Plus, CheckCircle, XCircle, X, Edit3
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { User, Role } from '../types';

export const UsersPage: React.FC = () => {
  const { users, addUser, updateUser, currentUser } = useAuth();

  const [showAddModal, setShowAddModal] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  // Shared dark theme class string
  const inputCls = 'w-full p-2 border rounded-xl bg-slate-800 border-slate-700 text-slate-100 placeholder-slate-500 focus:outline-hidden focus:ring-1 focus:ring-brand-500';

  const [formData, setFormData] = useState({
    name: '',
    username: '',
    email: '',
    phone: '',
    role: 'cashier' as Role,
    counterId: 'CTR-1',
    active: true,
  });

  const handleSaveUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.username.trim()) {
      alert('Name and username are required.');
      return;
    }

    if (editingUser) {
      updateUser({
        ...editingUser,
        name: formData.name,
        username: formData.username,
        email: formData.email,
        phone: formData.phone,
        role: formData.role,
        counterId: formData.counterId,
        active: formData.active
      });
    } else {
      addUser({
        name: formData.name,
        username: formData.username,
        email: formData.email || `${formData.username}@cyberorion.com`,
        phone: formData.phone,
        role: formData.role,
        counterId: formData.counterId,
        active: formData.active,
        permissions: {
          canViewPurchasePrice: formData.role === 'owner' || formData.role === 'manager',
          canViewProfit: formData.role === 'owner' || formData.role === 'manager',
          canOverridePrice: formData.role === 'owner',
          canApplyCustomDiscount: true,
          maxDiscountPercent: formData.role === 'owner' ? 50 : formData.role === 'manager' ? 25 : 10,
          canVoidInvoice: formData.role === 'owner' || formData.role === 'manager',
          canEditInvoice: formData.role === 'owner',
          canAdjustStock: formData.role === 'owner' || formData.role === 'manager' || formData.role === 'storekeeper',
          canViewFinancials: formData.role === 'owner' || formData.role === 'manager',
          canManageUsers: formData.role === 'owner',
          canManageBackups: formData.role === 'owner',
          canApproveReturns: formData.role === 'owner' || formData.role === 'manager',
        }
      });
    }

    setShowAddModal(false);
    setEditingUser(null);
  };

  const toggleUserActive = (user: User) => {
    if (user.role === 'owner') {
      alert('Cannot deactivate primary system owner account.');
      return;
    }
    updateUser({
      ...user,
      active: !user.active
    });
  };

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
              <UserCheck className="w-5 h-5 text-brand-500" />
              User Accounts & Staff Management
            </h1>
            <p className="text-xs text-slate-400">
              Manager, Cashier 1, Cashier 2, and Storekeeper profiles, passwords, and counter terminal assignments.
            </p>
          </div>

          <button
            onClick={() => {
              setEditingUser(null);
              setFormData({
                name: '',
                username: '',
                email: '',
                phone: '',
                role: 'cashier',
                counterId: 'CTR-1',
                active: true,
              });
              setShowAddModal(true);
            }}
            className="px-4 py-2 bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-md shadow-brand-500/25 transition"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Staff Account</span>
          </button>
        </div>

        {/* Users Table */}
        <div className="bg-slate-900 rounded-2xl border border-slate-800 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-800/60 text-slate-400 font-semibold uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="p-3">Staff Name</th>
                  <th className="p-3">Username & Email</th>
                  <th className="p-3">Assigned Role</th>
                  <th className="p-3">Terminal Binding</th>
                  <th className="p-3">Account Status</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {users.map(u => (
                  <tr key={u.id} className="hover:bg-slate-800/50 transition">
                    <td className="p-3">
                      <div className="font-bold text-white flex items-center gap-2">
                        <div className="w-6 h-6 rounded-md bg-brand-950 text-brand-500 flex items-center justify-center font-bold text-[11px]">
                          {u.name.charAt(0)}
                        </div>
                        <span>{u.name}</span>
                        {u.id === currentUser.id && (
                          <span className="text-[9px] bg-brand-950 text-brand-500 font-bold px-1.5 py-0.5 rounded">
                            (Active Session)
                          </span>
                        )}
                      </div>
                      <div className="text-[10px] text-slate-400 mt-0.5">{u.phone}</div>
                    </td>
                    <td className="p-3 font-mono">
                      <div className="font-semibold text-white">@{u.username}</div>
                      <div className="text-[10px] text-slate-400">{u.email}</div>
                    </td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 rounded font-bold text-[10px] uppercase font-mono ${
                        u.role === 'owner' ? 'bg-amber-950 text-amber-300' :
                        u.role === 'manager' ? 'bg-blue-950 text-blue-300' :
                        u.role === 'storekeeper' ? 'bg-purple-950 text-purple-300' :
                        'bg-slate-800 text-slate-300'
                      }`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="p-3 text-slate-300 font-semibold">
                      {u.counterId === 'CTR-1' ? 'Counter 1 (Showroom)' : u.counterId === 'CTR-2' ? 'Counter 2 (Workshop)' : 'All Terminals'}
                    </td>
                    <td className="p-3">
                      <button
                        onClick={() => toggleUserActive(u)}
                        className={`px-2 py-0.5 rounded text-[10px] font-bold flex items-center gap-1 transition ${
                          u.active ? 'bg-emerald-950 text-emerald-400 hover:bg-emerald-900' : 'bg-rose-950 text-rose-400 hover:bg-rose-900'
                        }`}
                      >
                        {u.active ? <CheckCircle className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                        <span>{u.active ? 'Active' : 'Suspended'}</span>
                      </button>
                    </td>
                    <td className="p-3 text-right">
                      <button
                        onClick={() => {
                          setEditingUser(u);
                          setFormData({
                            name: u.name,
                            username: u.username,
                            email: u.email,
                            phone: u.phone,
                            role: u.role,
                            counterId: u.counterId || 'CTR-1',
                            active: u.active
                          });
                          setShowAddModal(true);
                        }}
                        className="p-1 rounded text-slate-400 hover:text-brand-500 hover:bg-slate-800 transition"
                        title="Edit User"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* ADD / EDIT USER MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4" style={{ colorScheme: 'dark' }}>
          <div className="bg-slate-900 text-slate-100 rounded-2xl shadow-2xl max-w-md w-full border border-slate-800 p-5 space-y-4 text-xs">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-white text-sm">
                {editingUser ? 'Edit Staff Account' : 'Register New Staff User'}
              </h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveUser} className="space-y-3">
              <div>
                <label className="font-semibold block mb-1 text-slate-300">Full Name:</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  className={inputCls}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold block mb-1 text-slate-300">Username:</label>
                  <input
                    type="text"
                    required
                    value={formData.username}
                    onChange={e => setFormData({ ...formData, username: e.target.value.toLowerCase() })}
                    className={`${inputCls} font-mono`}
                  />
                </div>
                <div>
                  <label className="font-semibold block mb-1 text-slate-300">Role:</label>
                  <select
                    value={formData.role}
                    onChange={e => setFormData({ ...formData, role: e.target.value as Role })}
                    className={`${inputCls} font-semibold`}
                  >
                    <option value="owner">Owner (Administrator)</option>
                    <option value="manager">Store Manager</option>
                    <option value="cashier">Cashier</option>
                    <option value="storekeeper">Storekeeper / Warehouse</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold block mb-1 text-slate-300">Assigned Counter:</label>
                  <select
                    value={formData.counterId}
                    onChange={e => setFormData({ ...formData, counterId: e.target.value })}
                    className={inputCls}
                  >
                    <option value="CTR-1">Counter 1 (Front Showroom)</option>
                    <option value="CTR-2">Counter 2 (Workshop & Parts)</option>
                  </select>
                </div>
                <div>
                  <label className="font-semibold block mb-1 text-slate-300">Phone Number:</label>
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={e => setFormData({ ...formData, phone: e.target.value })}
                    className={inputCls}
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
                  Save User Account
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};