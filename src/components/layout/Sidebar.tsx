import React from 'react';
import { 
  Home, ShoppingBag, Package, Warehouse, ShoppingCart, 
  Users, Truck, FileText, DollarSign, BarChart2, Send, 
  UserCheck, FileClock, Settings, ChevronRight, ChevronDown
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import { UserPermissions } from '../../types';

export type ActiveTab = 
  | 'dashboard' | 'pos' | 'products' | 'inventory' | 'purchases' 
  | 'customers' | 'suppliers' | 'quotations' | 'accounting' | 'reports' 
  | 'marketing' | 'users' | 'audit' | 'backup' | 'returns' | 'loyalty' | 'counters' | 'permissions';

interface SidebarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  collapsed?: boolean;
  setCollapsed?: (c: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab }) => {
  const { hasPermission } = useAuth();
  const { products } = useApp();

  const lowStockCount = products.filter(p => !p.isArchived && p.currentStock <= p.minStockAlert).length;

  const menuItems = [
    { id: 'dashboard' as ActiveTab, label: 'Dashboard', icon: Home, hasSubmenu: false },
    { id: 'pos' as ActiveTab, label: 'POS', icon: ShoppingBag, hasSubmenu: false },
    { id: 'products' as ActiveTab, label: 'Products', icon: Package, hasSubmenu: true },
    { id: 'inventory' as ActiveTab, label: 'Inventory', icon: Warehouse, hasSubmenu: true, badge: lowStockCount > 0 ? `${lowStockCount}` : undefined },
    { id: 'purchases' as ActiveTab, label: 'Purchases', icon: ShoppingCart, hasSubmenu: true },
    { id: 'customers' as ActiveTab, label: 'Customers', icon: Users, hasSubmenu: true },
    { id: 'suppliers' as ActiveTab, label: 'Suppliers', icon: Truck, hasSubmenu: false },
    { id: 'quotations' as ActiveTab, label: 'Quotations', icon: FileText, hasSubmenu: true },
    { id: 'accounting' as ActiveTab, label: 'Accounts', icon: DollarSign, hasSubmenu: true, permission: 'canViewFinancials' as const },
    { id: 'reports' as ActiveTab, label: 'Reports', icon: BarChart2, hasSubmenu: true, permission: 'canViewProfit' as const },
    { id: 'marketing' as ActiveTab, label: 'Marketing', icon: Send, hasSubmenu: true },
    { id: 'users' as ActiveTab, label: 'Users', icon: UserCheck, hasSubmenu: true, permission: 'canManageUsers' as const },
    { id: 'audit' as ActiveTab, label: 'Audit Logs', icon: FileClock, hasSubmenu: true },
    { id: 'backup' as ActiveTab, label: 'Settings', icon: Settings, hasSubmenu: true },
  ];

  return (
    <aside className="w-56 bg-[#0B0E14] text-slate-300 border-r border-[#1B2232] flex flex-col justify-between select-none shrink-0 z-40 h-screen font-sans">
      {/* Brand Header */}
      <div>
        <div className="px-5 pt-5 pb-6 flex items-center gap-3">
          {/* Motorcycle Icon SVG */}
          <div className="relative flex items-center justify-center">
            <svg className="w-10 h-10 text-rose-600" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
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

        {/* Menu Items */}
        <nav className="px-3 space-y-1 overflow-y-auto max-h-[calc(100vh-170px)]">
          {menuItems.map(item => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            if (item.permission && !hasPermission(item.permission)) {
              return null;
            }

            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all duration-150 group ${
                  isActive
                    ? 'bg-rose-600 text-white shadow-md shadow-rose-600/30'
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

      {/* Footer Powered By */}
      <div className="px-5 py-4 border-t border-[#1B2232] flex items-center gap-2.5">
        <div className="w-6 h-6 rounded-lg bg-emerald-950/60 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
          <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <polygon points="12 2 2 7 12 12 22 7 12 2" />
            <polyline points="2 17 12 22 22 17" />
            <polyline points="2 12 12 17 22 12" />
          </svg>
        </div>
        <div className="text-[10px] leading-tight">
          <span className="text-slate-500 block">Powered by</span>
          <span className="font-bold text-slate-300 hover:text-white transition">CyberOrion.pk</span>
        </div>
      </div>
    </aside>
  );
};
