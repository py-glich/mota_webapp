import React from 'react';
import { 
  Home, ShoppingBag, Package, Warehouse, ShoppingCart, 
  Users, Truck, FileText, DollarSign, BarChart2, Send, 
  UserCheck, FileClock, Settings, ChevronRight, X, 
  LogOut, User as UserIcon, RotateCcw, Award, Store, ShieldCheck
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';

export type ActiveTab = 
  | 'dashboard' | 'pos' | 'products' | 'inventory' | 'purchases' 
  | 'customers' | 'suppliers' | 'quotations' | 'accounting' | 'reports' 
  | 'marketing' | 'users' | 'audit' | 'backup' | 'returns' | 'loyalty' | 'counters' | 'permissions';

interface SidebarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  collapsed?: boolean;
  setCollapsed?: (c: boolean) => void;
  mobileMenuOpen?: boolean;
  setMobileMenuOpen?: (open: boolean) => void;
  openProfileModal?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ 
  activeTab, 
  setActiveTab, 
  mobileMenuOpen, 
  setMobileMenuOpen,
  openProfileModal
}) => {
  const { hasPermission, currentUser, logout } = useAuth();
  const { products } = useApp();

  const lowStockCount = products.filter(p => !p.isArchived && p.currentStock <= p.minStockAlert).length;

  const menuItems = [
    { id: 'dashboard' as ActiveTab, label: 'Dashboard', icon: Home, hasSubmenu: false },
    { id: 'pos' as ActiveTab, label: 'POS Billing', icon: ShoppingBag, hasSubmenu: false },
    { id: 'products' as ActiveTab, label: 'Products', icon: Package, hasSubmenu: true },
    { id: 'inventory' as ActiveTab, label: 'Inventory', icon: Warehouse, hasSubmenu: true, badge: lowStockCount > 0 ? `${lowStockCount}` : undefined },
    { id: 'purchases' as ActiveTab, label: 'Purchases', icon: ShoppingCart, hasSubmenu: true },
    { id: 'returns' as ActiveTab, label: 'Returns & Refunds', icon: RotateCcw, hasSubmenu: true },
    { id: 'customers' as ActiveTab, label: 'Customers', icon: Users, hasSubmenu: true },
    { id: 'loyalty' as ActiveTab, label: 'Loyalty Club', icon: Award, hasSubmenu: false },
    { id: 'suppliers' as ActiveTab, label: 'Suppliers', icon: Truck, hasSubmenu: false },
    { id: 'quotations' as ActiveTab, label: 'Quotations', icon: FileText, hasSubmenu: true },
    { id: 'accounting' as ActiveTab, label: 'Accounts', icon: DollarSign, hasSubmenu: true, permission: 'canViewFinancials' as const },
    { id: 'counters' as ActiveTab, label: 'Dual Counters', icon: Store, hasSubmenu: false },
    { id: 'reports' as ActiveTab, label: 'Reports', icon: BarChart2, hasSubmenu: true, permission: 'canViewProfit' as const },
    { id: 'marketing' as ActiveTab, label: 'SMS & Marketing', icon: Send, hasSubmenu: true },
    { id: 'users' as ActiveTab, label: 'Users', icon: UserCheck, hasSubmenu: true, permission: 'canManageUsers' as const },
    { id: 'permissions' as ActiveTab, label: 'Permissions', icon: ShieldCheck, hasSubmenu: false, permission: 'canManageUsers' as const },
    { id: 'audit' as ActiveTab, label: 'Audit Logs', icon: FileClock, hasSubmenu: true },
    { id: 'backup' as ActiveTab, label: 'Settings & DB', icon: Settings, hasSubmenu: true },
  ];

  const handleNavClick = (tabId: ActiveTab) => {
    setActiveTab(tabId);
    if (setMobileMenuOpen) {
      setMobileMenuOpen(false);
    }
  };

  return (
    <aside 
      className={`
        fixed inset-y-0 left-0 z-50 md:static md:translate-x-0
        w-64 md:w-56 bg-[#0B0E14] text-slate-300 border-r border-[#1B2232]
        flex flex-col justify-between select-none shrink-0 h-screen font-sans
        transition-transform duration-200 ease-in-out
        ${mobileMenuOpen ? 'translate-x-0 shadow-2xl shadow-black/80' : '-translate-x-full md:translate-x-0'}
      `}
    >
      {/* Brand Header */}
      <div>
        <div className="px-5 pt-5 pb-5 flex items-center justify-between border-b border-[#161C2A] md:border-b-0">
          <div className="flex items-center gap-3">
            {/* Motorcycle Icon SVG */}
            <div className="relative flex items-center justify-center">
              <svg className="w-9 h-9 text-rose-600" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 36C15.3137 36 18 33.3137 18 30C18 26.6863 15.3137 24 12 24C8.68629 24 6 26.6863 6 30C6 33.3137 8.68629 36 12 36Z" stroke="#E11D48" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M36 36C39.3137 36 42 33.3137 42 30C42 26.6863 39.3137 24 36 24C32.6863 24 30 26.6863 30 30C30 33.3137 32.6863 36 36 36Z" stroke="#E11D48" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M12 30H20L27 18H33L36 30" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M26 18L21 27H15" stroke="#E11D48" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M30 18L32 14H36" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round"/>
                <circle cx="12" cy="30" r="2" fill="#E11D48" />
                <circle cx="36" cy="30" r="2" fill="#E11D48" />
              </svg>
            </div>
            <div>
              <div className="flex items-center text-lg font-black tracking-tight leading-none text-white">
                <span>Moto</span>
                <span className="text-rose-600">Pro</span>
              </div>
              <span className="text-[10px] text-slate-400 font-medium tracking-wide block mt-0.5">
                Shop Management
              </span>
            </div>
          </div>

          {/* Close button on mobile */}
          <button
            onClick={() => setMobileMenuOpen?.(false)}
            className="md:hidden p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-[#161C2C] transition"
            aria-label="Close sidebar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Menu Items */}
        <nav className="px-3 py-2 space-y-1 overflow-y-auto max-h-[calc(100vh-210px)]">
          {menuItems.map(item => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            if (item.permission && !hasPermission(item.permission)) {
              return null;
            }

            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all duration-150 group ${
                  isActive
                    ? 'bg-rose-600 text-white shadow-md shadow-rose-600/30 font-bold'
                    : 'text-slate-400 hover:text-white hover:bg-[#151B28]'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-white'}`} />
                  <span className="truncate">{item.label}</span>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  {item.badge && (
                    <span className="px-1.5 py-0.2 rounded-full text-[9px] font-bold bg-rose-500/80 text-white">
                      {item.badge}
                    </span>
                  )}
                  {item.hasSubmenu && !isActive && (
                    <ChevronRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-slate-300" />
                  )}
                </div>
              </button>
            );
          })}
        </nav>
      </div>

      {/* User Session & Footer */}
      <div className="p-3 border-t border-[#1B2232] space-y-2 bg-[#080B10]">
        {/* Active user card with profile launcher */}
        <div className="p-2 rounded-xl bg-[#111622] border border-[#1E2638] flex items-center justify-between">
          <button
            onClick={() => {
              openProfileModal?.();
              setMobileMenuOpen?.(false);
            }}
            className="flex items-center gap-2.5 min-w-0 text-left flex-1 hover:opacity-80 transition"
            title="Edit Profile & Change Password"
          >
            <div className="relative shrink-0">
              <img
                src={currentUser?.avatar || "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80"}
                alt={currentUser?.name}
                className="w-8 h-8 rounded-full object-cover border border-rose-600"
              />
              <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 border border-[#111622] rounded-full"></span>
            </div>
            <div className="min-w-0 flex-1">
              <span className="font-bold text-white text-xs truncate block leading-tight">{currentUser?.name}</span>
              <span className="text-[10px] text-rose-400 capitalize block truncate">@{currentUser?.username}</span>
            </div>
          </button>

          <button
            onClick={() => {
              if (confirm('Log out from MotoPro?')) {
                logout();
              }
            }}
            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-[#161C2C] transition ml-1"
            title="Log Out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>

        {/* Powered by tag */}
        <div className="flex items-center justify-between px-1 text-[10px]">
          <span className="text-slate-500 font-medium">CyberOrion POS</span>
          <span className="font-bold text-slate-400 hover:text-white transition cursor-pointer">v2.5 Pro</span>
        </div>
      </div>
    </aside>
  );
};
