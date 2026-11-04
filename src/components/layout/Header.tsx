import React, { useState } from 'react';
import { 
  Search, Bell, ChevronDown, CheckCircle2, Shield, 
  Monitor, RefreshCw, Database, Menu, UserCheck, 
  KeyRound, LogOut, Settings
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';

interface HeaderProps {
  onOpenMobileMenu?: () => void;
  onOpenProfileModal?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenMobileMenu, onOpenProfileModal }) => {
  const { currentUser, currentCounter, counters, setCurrentCounterById, logout } = useAuth();
  const { resetToFactoryDefaults, dbStatus, refreshFromDatabase } = useApp();

  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [showCounterDropdown, setShowCounterDropdown] = useState(false);
  const [showDbModal, setShowDbModal] = useState(false);

  return (
    <header className="h-16 bg-[#0B0E14] border-b border-[#1B2232] px-3 sm:px-6 flex items-center justify-between sticky top-0 z-30 select-none gap-2 sm:gap-4">
      {/* Left: Hamburger (Mobile) + Global Search Input */}
      <div className="flex items-center gap-2 flex-1 max-w-xl">
        <button
          type="button"
          onClick={onOpenMobileMenu}
          className="md:hidden p-2 rounded-xl text-slate-300 hover:text-white hover:bg-[#111622] border border-[#1E2638] shrink-0 transition"
          aria-label="Open Navigation Menu"
        >
          <Menu className="w-5 h-5 text-slate-300" />
        </button>

        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search products, customers... (Ctrl + K)"
            className="w-full pl-9 sm:pl-10 pr-3 py-2 bg-[#111622] border border-[#1E2638] rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500 transition"
          />
        </div>
      </div>

      {/* Right Controls: MongoDB Pill, Counter Selector, Notifications, User Profile */}
      <div className="flex items-center gap-2 sm:gap-4 shrink-0">
        {/* Live MongoDB Status Pill */}
        <div className="relative">
          <button
            onClick={() => setShowDbModal(!showDbModal)}
            className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#111622] border border-[#1E2638] hover:border-slate-700 text-xs text-slate-300 transition"
            title="MongoDB Connection Status"
          >
            <Database className="w-3.5 h-3.5 text-emerald-400" />
            <span className="font-semibold text-[11px] text-slate-300">
              {dbStatus.mongoConnected ? 'MongoDB' : 'DB'}
            </span>
            <span className={`w-2 h-2 rounded-full ${dbStatus.mongoConnected ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
          </button>

          {showDbModal && (
            <div className="absolute right-0 mt-2 w-72 bg-[#111622] border border-[#1E2638] rounded-xl shadow-2xl p-4 z-50 text-xs text-slate-300">
              <div className="flex items-center justify-between pb-2 mb-2 border-b border-[#1B2232]">
                <span className="font-bold text-white flex items-center gap-2">
                  <Database className="w-4 h-4 text-emerald-400" />
                  MongoDB Engine
                </span>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${dbStatus.mongoConnected ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'}`}>
                  {dbStatus.mongoConnected ? 'ONLINE' : 'OFFLINE'}
                </span>
              </div>
              <p className="text-[11px] text-slate-400 mb-2">
                Real-time MongoDB collections active for Products, POS Invoices, Purchases, Inventory, Customers & Ledgers.
              </p>
              <div className="bg-[#0B0E14] p-2 rounded-lg font-mono text-[10px] text-emerald-400 break-all mb-3 border border-slate-800">
                {dbStatus.uri}
              </div>
              <button
                onClick={() => { refreshFromDatabase(); setShowDbModal(false); }}
                className="w-full py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg font-bold text-xs transition"
              >
                Sync with MongoDB Now
              </button>
            </div>
          )}
        </div>

        {/* Terminal Switcher */}
        <div className="relative">
          <button
            onClick={() => { setShowCounterDropdown(!showCounterDropdown); setShowUserDropdown(false); setShowDbModal(false); }}
            className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#111622] border border-[#1E2638] hover:border-slate-700 text-xs text-slate-300 transition"
          >
            <Monitor className="w-3.5 h-3.5 text-rose-500" />
            <span className="font-semibold">{currentCounter.name.split('(')[0]}</span>
            <ChevronDown className="w-3 h-3 text-slate-500" />
          </button>

          {showCounterDropdown && (
            <div className="absolute right-0 mt-2 w-64 bg-[#111622] border border-[#1E2638] rounded-xl shadow-2xl py-2 z-50">
              <div className="px-3 py-1 text-[10px] uppercase font-bold text-slate-500 border-b border-[#1B2232]">
                Active Billing Terminal
              </div>
              {counters.map(c => (
                <button
                  key={c.id}
                  onClick={() => {
                    setCurrentCounterById(c.id);
                    setShowCounterDropdown(false);
                  }}
                  className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-[#161C2C] transition ${
                    c.id === currentCounter.id ? 'text-rose-500 font-bold bg-[#161C2C]' : 'text-slate-300'
                  }`}
                >
                  <span>{c.name}</span>
                  <span className="font-mono text-[11px] text-slate-400">Rs. {c.currentCash.toLocaleString()}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Demo Reset */}
        <button
          onClick={() => {
            if (confirm('Reset to sample motorcycle shop demo data?')) resetToFactoryDefaults();
          }}
          className="hidden md:flex items-center gap-1 text-[11px] text-slate-500 hover:text-slate-300 px-2 py-1 transition"
          title="Reset to initial MotoPro demo data"
        >
          <RefreshCw className="w-3 h-3" />
          <span>Reset</span>
        </button>

        {/* Notification Bell with Red Badge "3" */}
        <div className="relative cursor-pointer p-2 rounded-xl text-slate-300 hover:bg-[#111622] transition">
          <Bell className="w-4 h-4" />
          <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-rose-600 text-white font-bold text-[9px] flex items-center justify-center">
            3
          </span>
        </div>

        {/* User Profile Pill & Dropdown */}
        <div className="relative">
          <button
            onClick={() => { setShowUserDropdown(!showUserDropdown); setShowCounterDropdown(false); setShowDbModal(false); }}
            className="flex items-center gap-2.5 pl-1 pr-2 py-1 rounded-full hover:bg-[#111622] transition border border-transparent hover:border-[#1E2638]"
          >
            <div className="relative">
              <img
                src={currentUser?.avatar || "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80"}
                alt={currentUser?.name}
                className="w-8 h-8 rounded-full object-cover border border-rose-600"
              />
              <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 border border-[#0B0E14] rounded-full"></span>
            </div>
            <div className="text-left text-xs leading-tight hidden sm:block">
              <span className="font-bold text-white block truncate max-w-[110px]">{currentUser?.name}</span>
              <span className="text-[10px] text-rose-400 block capitalize">{currentUser?.role}</span>
            </div>
            <ChevronDown className="w-3 h-3 text-slate-400" />
          </button>

          {showUserDropdown && (
            <div className="absolute right-0 mt-2 w-64 bg-[#111622] border border-[#1E2638] rounded-2xl shadow-2xl py-2 z-50">
              {/* Active Profile Info Header */}
              <div className="px-4 py-2.5 border-b border-[#1B2232] flex items-center gap-3">
                <img
                  src={currentUser?.avatar || "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80"}
                  alt={currentUser?.name}
                  className="w-10 h-10 rounded-full object-cover border border-rose-500"
                />
                <div className="min-w-0 flex-1">
                  <h4 className="font-bold text-white text-xs truncate leading-tight">{currentUser?.name}</h4>
                  <p className="text-[10px] text-slate-400 truncate">@{currentUser?.username}</p>
                  <span className="inline-block mt-0.5 px-1.5 py-0.2 rounded text-[9px] font-bold uppercase bg-rose-950/70 text-rose-400 border border-rose-800/40">
                    {currentUser?.role}
                  </span>
                </div>
              </div>

              {/* Account Management & Log Out */}
              <div className="p-1 space-y-0.5">
                <button
                  onClick={() => {
                    setShowUserDropdown(false);
                    onOpenProfileModal?.();
                  }}
                  className="w-full text-left px-3 py-2 text-xs rounded-xl hover:bg-[#161C2C] text-slate-200 hover:text-white flex items-center gap-2.5 transition font-semibold"
                >
                  <KeyRound className="w-4 h-4 text-rose-500" />
                  <span>Manage Profile & Password</span>
                </button>

                <button
                  onClick={() => {
                    setShowUserDropdown(false);
                    if (confirm('Log out from your current account?')) {
                      logout();
                    }
                  }}
                  className="w-full text-left px-3 py-2 text-xs rounded-xl text-rose-400 hover:bg-rose-950/40 hover:text-rose-300 flex items-center gap-2.5 transition font-bold"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Log Out</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
