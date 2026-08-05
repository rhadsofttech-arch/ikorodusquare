import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';

// Views
import { HomeView } from './views/HomeView';
import { DirectoryView } from './views/DirectoryView';
import { BusinessDetailsView } from './views/BusinessDetailsView';
import { MarketplaceView } from './views/MarketplaceView';
import { ProductDetailsView } from './views/ProductDetailsView';
import { VendorDashboardView } from './views/VendorDashboardView';
import { VendorRegisterView } from './views/VendorRegisterView';
import { AdminPortalView } from './views/AdminPortalView';
import { PromotionsPricingView } from './views/PromotionsPricingView';
import { CustomerPortalView } from './views/CustomerPortalView';

const MainContent: React.FC = () => {
  const { activeTab } = useApp();

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 min-h-[75vh]">
      {activeTab === 'home' && <HomeView />}
      {activeTab === 'directory' && <DirectoryView />}
      {activeTab === 'vendor-details' && <BusinessDetailsView />}
      {activeTab === 'marketplace' && <MarketplaceView />}
      {activeTab === 'product-details' && <ProductDetailsView />}
      {activeTab === 'vendor-portal' && <VendorDashboardView />}
      {activeTab === 'vendor-register' && <VendorRegisterView />}
      {activeTab === 'admin-portal' && <AdminPortalView />}
      {activeTab === 'promotions' && <PromotionsPricingView />}
      {activeTab === 'customer-portal' && <CustomerPortalView />}
    </main>
  );
};

export default function App() {
  return (
    <AppProvider>
      <div className="min-h-screen bg-slate-50 text-slate-900 font-sans flex flex-col justify-between selection:bg-amber-300 selection:text-emerald-950 bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] [background-size:24px_24px]">
        <Navbar />
        <MainContent />
        <Footer />
      </div>
    </AppProvider>
  );
}
