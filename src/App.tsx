import React, { useState } from 'react';
import { AuthProvider } from './context/AuthContext';
import { AppProvider } from './context/AppContext';
import { Header } from './components/layout/Header';
import { Sidebar, ActiveTab } from './components/layout/Sidebar';

// Pages
import { PosPage } from './pages/PosPage';
import { DashboardPage } from './pages/DashboardPage';
import { ProductsPage } from './pages/ProductsPage';
import { PurchasesPage } from './pages/PurchasesPage';
import { InventoryPage } from './pages/InventoryPage';
import { ReturnsPage } from './pages/ReturnsPage';
import { CustomersPage } from './pages/CustomersPage';
import { SuppliersPage } from './pages/SuppliersPage';
import { AccountingPage } from './pages/AccountingPage';
import { ReportsPage } from './pages/ReportsPage';
import { QuotationsPage } from './pages/QuotationsPage';
import { MarketingPage } from './pages/MarketingPage';
import { LoyaltyPage } from './pages/LoyaltyPage';
import { CountersPage } from './pages/CountersPage';
import { UsersPage } from './pages/UsersPage';
import { PermissionsPage } from './pages/PermissionsPage';
import { AuditLogsPage } from './pages/AuditLogsPage';
import { BackupPage } from './pages/BackupPage';

const MainLayout: React.FC = () => {
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard'); // Start on MotoPro Dashboard matching screenshot
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="flex h-screen bg-[#0A0D14] text-slate-100 overflow-hidden font-sans">
      {/* Sidebar Navigation */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        collapsed={collapsed}
        setCollapsed={setCollapsed}
      />

      {/* Main Body Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Header with live counter and user switchers */}
        <Header />

        {/* Dynamic Page Router */}
        <main className="flex-1 overflow-hidden relative">
          {activeTab === 'pos' && <PosPage />}
          {activeTab === 'dashboard' && <DashboardPage setActiveTab={setActiveTab} />}
          {activeTab === 'products' && <ProductsPage />}
          {activeTab === 'purchases' && <PurchasesPage />}
          {activeTab === 'inventory' && <InventoryPage />}
          {activeTab === 'returns' && <ReturnsPage />}
          {activeTab === 'customers' && <CustomersPage />}
          {activeTab === 'suppliers' && <SuppliersPage />}
          {activeTab === 'accounting' && <AccountingPage />}
          {activeTab === 'reports' && <ReportsPage />}
          {activeTab === 'quotations' && <QuotationsPage setActiveTab={setActiveTab} />}
          {activeTab === 'marketing' && <MarketingPage />}
          {activeTab === 'loyalty' && <LoyaltyPage />}
          {activeTab === 'counters' && <CountersPage />}
          {activeTab === 'users' && <UsersPage />}
          {activeTab === 'permissions' && <PermissionsPage />}
          {activeTab === 'audit' && <AuditLogsPage />}
          {activeTab === 'backup' && <BackupPage />}
        </main>
      </div>
    </div>
  );
};

export function App() {
  return (
    <AuthProvider>
      <AppProvider>
        <MainLayout />
      </AppProvider>
    </AuthProvider>
  );
}

export default App;
