import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Navbar } from './components/Navbar';
import { Breadcrumb } from './components/Breadcrumb';
import { Footer } from './components/Footer';
import { AdminAccessGuard } from './components/AdminAccessGuard';
import { ErrorBoundary } from './components/ErrorBoundary';

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
  const { activeTab, selectedVendorSlug, selectedVendorId } = useApp();

  // Lifecycle scroll restoration when tab, vendor, or route changes
  React.useEffect(() => {
    const scrollToTop = () => {
      window.scrollTo(0, 0);
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
    };

    scrollToTop();
    const rafId = requestAnimationFrame(scrollToTop);
    const timeoutId = setTimeout(scrollToTop, 50);

    return () => {
      cancelAnimationFrame(rafId);
      clearTimeout(timeoutId);
    };
  }, [activeTab, selectedVendorSlug, selectedVendorId]);

  // Compute a unique key for the active view to force remounting on storefront changes
  let viewKey = activeTab;
  if (activeTab === 'vendor-details') {
    let slugFromUrl = '';
    if (typeof window !== 'undefined' && window.location.pathname.toLowerCase().startsWith('/store/')) {
      slugFromUrl = decodeURIComponent(window.location.pathname.substring(7)).trim();
    }
    viewKey = `storefront-${slugFromUrl || selectedVendorSlug || selectedVendorId || 'default'}`;
  }

  return (
    <main className="w-full max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6 min-h-[75vh] overflow-x-hidden">
      <ErrorBoundary>
        <div key={viewKey}>
          {activeTab === 'home' && <HomeView />}
          {(activeTab === 'directory' || activeTab === 'categories') && <DirectoryView />}
          {activeTab === 'vendor-details' && <BusinessDetailsView />}
          {activeTab === 'marketplace' && <MarketplaceView />}
          {activeTab === 'product-details' && <ProductDetailsView />}
          {activeTab === 'vendor-portal' && <VendorDashboardView />}
          {(activeTab === 'vendor-register' || activeTab === 'register-vendor') && <VendorRegisterView />}
          {activeTab === 'admin-portal' && (
            <AdminAccessGuard>
              <AdminPortalView />
            </AdminAccessGuard>
          )}
          {(activeTab === 'promotions' || activeTab === 'promotions-pricing') && <PromotionsPricingView />}
          {activeTab === 'customer-portal' && <CustomerPortalView />}
        </div>
      </ErrorBoundary>
    </main>
  );
};

export default function App() {
  return (
    <ErrorBoundary fallbackTitle="An error occurred in the application">
      <AppProvider>
        <div className="min-h-screen w-full max-w-full overflow-x-hidden bg-slate-50 text-slate-900 font-sans flex flex-col justify-between selection:bg-amber-300 selection:text-emerald-950 bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] [background-size:24px_24px]">
          <Navbar />
          <Breadcrumb />
          <MainContent />
          <Footer />
        </div>
      </AppProvider>
    </ErrorBoundary>
  );
}
