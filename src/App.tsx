import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AppProvider } from './context/AppContext';
import { Header } from './components/layout/Header';
import { Sidebar, ActiveTab } from './components/layout/Sidebar';
import { ProfileModal } from './components/layout/ProfileModal';
import { AuthPage } from './pages/AuthPage';

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
import { SettingsPage } from './pages/SettingsPage';

const MainLayout: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  // If not logged in, show Auth / Sign In / Sign Up Screen
  if (!isAuthenticated) {
    return <AuthPage />;
  }

  return (
    <div className="flex h-[100dvh] min-h-screen bg-[#0A0D14] text-slate-100 overflow-hidden font-sans relative">
      {/* Mobile Drawer Backdrop */}
      {mobileMenuOpen && (
        <div 
          onClick={() => setMobileMenuOpen(false)}
          className="fixed inset-0 bg-black/70 backdrop-blur-xs z-40 md:hidden transition-opacity"
        />
      )}

      {/* Sidebar Navigation */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        mobileMenuOpen={mobileMenuOpen}
        setMobileMenuOpen={setMobileMenuOpen}
        openProfileModal={() => setIsProfileModalOpen(true)}
      />

      {/* Main Body Area */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        {/* Top Header with live counter, user switchers, hamburger */}
        <Header 
          onOpenMobileMenu={() => setMobileMenuOpen(true)}
          onOpenProfileModal={() => setIsProfileModalOpen(true)}
        />

        {/* Dynamic Page Router with Mobile Scroll Support */}
        <main className="flex-1 overflow-y-auto min-h-0 relative overscroll-y-contain">
          {activeTab === 'pos' && <PosPage />}
          {activeTab === 'dashboard' && <DashboardPage setActiveTab={setActiveTab} />}
          {activeTab === 'products' && <ProductsPage />}
          {activeTab === 'purchases' && <PurchasesPage setActiveTab={setActiveTab} />}
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
          {activeTab === 'settings' && <SettingsPage />}
        </main>
      </div>

      {/* Profile & Password Management Modal */}
      <ProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
      />
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
