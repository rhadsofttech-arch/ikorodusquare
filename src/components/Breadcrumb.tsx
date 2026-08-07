import React from 'react';
import { Home, ChevronRight, Store, ShoppingBag, Grid, Shield, User, Sparkles, Tag } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const Breadcrumb: React.FC = () => {
  const {
    activeTab,
    setActiveTab,
    selectedCategory,
    setSelectedCategory,
    selectedVendorId,
    selectedProductId,
    vendors,
    products,
  } = useApp();

  // Selected vendor & product
  const vendor = selectedVendorId ? vendors.find((v) => v.id === selectedVendorId) : null;
  const product = selectedProductId ? products.find((p) => p.id === selectedProductId) : null;

  // Don't render breadcrumb on home view
  if (activeTab === 'home') {
    return null;
  }

  interface BreadcrumbItem {
    label: string;
    onClick?: () => void;
    icon?: React.ReactNode;
    isCurrent?: boolean;
  }

  const items: BreadcrumbItem[] = [
    {
      label: 'Home',
      onClick: () => {
        setActiveTab('home');
      },
      icon: <Home className="w-3.5 h-3.5 text-emerald-700" />,
    },
  ];

  if (activeTab === 'directory') {
    items.push({
      label: 'Directory',
      onClick: selectedCategory !== 'All' ? () => setSelectedCategory('All') : undefined,
      icon: <Store className="w-3.5 h-3.5 text-slate-500" />,
      isCurrent: selectedCategory === 'All',
    });
    if (selectedCategory !== 'All') {
      items.push({
        label: selectedCategory,
        isCurrent: true,
      });
    }
  } else if (activeTab === 'marketplace') {
    items.push({
      label: 'Marketplace',
      onClick: selectedCategory !== 'All' ? () => setSelectedCategory('All') : undefined,
      icon: <ShoppingBag className="w-3.5 h-3.5 text-slate-500" />,
      isCurrent: selectedCategory === 'All',
    });
    if (selectedCategory !== 'All') {
      items.push({
        label: selectedCategory,
        isCurrent: true,
      });
    }
  } else if (activeTab === 'vendor-details') {
    items.push({
      label: 'Directory',
      onClick: () => setActiveTab('directory'),
      icon: <Store className="w-3.5 h-3.5 text-slate-500" />,
    });
    if (vendor?.category) {
      items.push({
        label: vendor.category,
        onClick: () => {
          setSelectedCategory(vendor.category);
          setActiveTab('directory');
        },
      });
    }
    items.push({
      label: vendor ? vendor.businessName : 'Vendor Details',
      isCurrent: true,
    });
  } else if (activeTab === 'product-details') {
    items.push({
      label: 'Marketplace',
      onClick: () => setActiveTab('marketplace'),
      icon: <ShoppingBag className="w-3.5 h-3.5 text-slate-500" />,
    });
    if (product?.category) {
      items.push({
        label: product.category,
        onClick: () => {
          setSelectedCategory(product.category);
          setActiveTab('marketplace');
        },
      });
    }
    items.push({
      label: product ? product.name : 'Product Details',
      isCurrent: true,
    });
  } else if (activeTab === 'vendor-portal') {
    items.push({
      label: 'Vendor Portal',
      isCurrent: true,
      icon: <Grid className="w-3.5 h-3.5 text-slate-500" />,
    });
  } else if (activeTab === 'register-vendor' || activeTab === 'vendor-register') {
    items.push({
      label: 'Vendor Registration',
      isCurrent: true,
      icon: <Tag className="w-3.5 h-3.5 text-slate-500" />,
    });
  } else if (activeTab === 'customer-portal') {
    items.push({
      label: 'My Account',
      isCurrent: true,
      icon: <User className="w-3.5 h-3.5 text-slate-500" />,
    });
  } else if (activeTab === 'admin-portal') {
    items.push({
      label: 'Admin Portal',
      isCurrent: true,
      icon: <Shield className="w-3.5 h-3.5 text-slate-500" />,
    });
  } else if (activeTab === 'promotions' || activeTab === 'promotions-pricing') {
    items.push({
      label: 'Promotions & Pricing',
      isCurrent: true,
      icon: <Sparkles className="w-3.5 h-3.5 text-slate-500" />,
    });
  }

  return (
    <nav
      aria-label="Breadcrumb navigation"
      className="bg-white/90 backdrop-blur-md border-b border-slate-200/80 sticky top-[64px] z-20 shadow-2xs transition-all"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2">
        <ol className="flex items-center gap-1.5 text-xs text-slate-600 overflow-x-auto whitespace-nowrap scrollbar-none py-0.5">
          {items.map((item, index) => {
            const isLast = index === items.length - 1;

            return (
              <li key={index} className="flex items-center gap-1.5 shrink-0">
                {index > 0 && (
                  <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" aria-hidden="true" />
                )}

                {item.onClick && !isLast ? (
                  <button
                    onClick={item.onClick}
                    className="inline-flex items-center gap-1.5 font-medium text-slate-600 hover:text-emerald-800 transition-colors py-1 px-1.5 rounded-lg hover:bg-slate-100"
                    title={item.label}
                  >
                    {item.icon}
                    <span>{item.label}</span>
                  </button>
                ) : (
                  <span
                    className={`inline-flex items-center gap-1.5 py-1 px-1.5 rounded-lg ${
                      isLast
                        ? 'font-bold text-emerald-950 bg-emerald-50/80 text-emerald-900 border border-emerald-200/60 max-w-[200px] sm:max-w-[320px] truncate'
                        : 'font-medium text-slate-500'
                    }`}
                    title={item.label}
                  >
                    {item.icon}
                    <span className="truncate">{item.label}</span>
                  </span>
                )}
              </li>
            );
          })}
        </ol>
      </div>
    </nav>
  );
};
