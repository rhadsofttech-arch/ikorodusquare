import React, { useState } from 'react';
import {
  Search,
  Store,
  ShoppingBag,
  Bell,
  Heart,
  ShieldCheck,
  UserCheck,
  PlusCircle,
  Menu,
  X,
  ChevronDown,
  MapPin,
  CheckCircle2,
  AlertCircle,
  Building2,
  Sparkles,
  CreditCard,
  Layers,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { IkoroduArea, UserRole } from '../types';

export const Navbar: React.FC = () => {
  const {
    currentRole,
    setRole,
    currentUser,
    activeTab,
    setActiveTab,
    notifications,
    markNotificationRead,
    wishlist,
    searchQuery,
    setSearchQuery,
    selectedArea,
    setSelectedArea,
    vendors,
    promotionRequests,
    setSelectedVendorId,
    setSelectedProductId,
  } = useApp();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notifDropdownOpen, setNotifDropdownOpen] = useState(false);

  const ikoroduAreas: (IkoroduArea | 'All')[] = [
    'All',
    'Sabo',
    'Garage',
    'Agric',
    'Ebute',
    'Ayetoro',
    'Igbogbo',
    'Imota',
    'Ijede',
    'Ipakodo',
  ];

  const unreadNotifs = notifications.filter((n) => !n.isRead);
  const pendingVendorsCount = vendors.filter((v) => v.status === 'pending').length;
  const pendingPromosCount = promotionRequests.filter((pr) => pr.status === 'pending').length;

  const handleNavClick = (tab: string) => {
    setActiveTab(tab);
    setSelectedVendorId(null);
    setSelectedProductId(null);
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200/90 shadow-xs">
      {/* Top Demo Bar for Role Switcher */}
      <div className="bg-emerald-950 text-emerald-100 text-xs py-1.5 px-4 border-b border-emerald-900/80">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-black bg-amber-400 text-emerald-950 uppercase tracking-wider shadow-xs">
              Live Preview
            </span>
            <span className="hidden md:inline text-emerald-200/90 font-medium text-[11px]">
              IkoroduSquare — Discover. Connect. Shop Local.
            </span>
          </div>

          <div className="flex items-center gap-2 overflow-x-auto max-w-full py-0.5">
            <span className="text-emerald-400 font-semibold text-[11px] whitespace-nowrap">Switch Role:</span>
            <div className="flex items-center bg-emerald-900/90 rounded-xl p-1 border border-emerald-800/80 gap-1">
              {(['guest', 'customer', 'vendor', 'admin'] as UserRole[]).map((role) => (
                <button
                  key={role}
                  onClick={() => setRole(role)}
                  className={`px-3 py-1 rounded-lg text-xs font-bold capitalize transition-all whitespace-nowrap ${
                    currentRole === role
                      ? 'bg-amber-400 text-emerald-950 shadow-sm'
                      : 'text-emerald-200 hover:text-white hover:bg-emerald-800/60'
                  }`}
                >
                  {role === 'vendor' ? 'Vendor Portal' : role === 'admin' ? 'Admin' : role}
                  {role === 'admin' && (pendingVendorsCount > 0 || pendingPromosCount > 0) && (
                    <span className="ml-1.5 px-1.5 py-0.2 text-[10px] bg-red-500 text-white rounded-full font-black shadow-xs">
                      {pendingVendorsCount + pendingPromosCount}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Main Header Row */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <div className="flex items-center justify-between gap-4">
          {/* Logo */}
          <div
            onClick={() => handleNavClick('home')}
            className="flex items-center gap-3 cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-800 via-emerald-700 to-teal-600 flex items-center justify-center text-white shadow-sm border border-emerald-600/30 group-hover:scale-105 transition-transform">
              <Building2 className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xl font-black tracking-tight text-emerald-950 font-display">
                  Ikorodu<span className="text-amber-500">Square</span>
                </span>
                <span className="text-[10px] bg-emerald-100/80 text-emerald-900 px-1.5 py-0.5 rounded-full font-bold border border-emerald-300/60">
                  NG
                </span>
              </div>
              <p className="text-[10px] text-emerald-800 font-semibold leading-none">
                Local Business Directory & Marketplace
              </p>
            </div>
          </div>

          {/* Search Bar (Desktop Bento Container) */}
          <div className="hidden lg:flex items-center flex-1 max-w-xl mx-4">
            <div className="relative w-full flex items-center bg-slate-100/80 border border-slate-200 rounded-2xl focus-within:border-emerald-600 focus-within:bg-white focus-within:ring-2 focus-within:ring-emerald-500/20 transition-all p-1">
              {/* Area Selector */}
              <div className="relative border-r border-slate-200/80 pr-2 pl-2 py-1 flex items-center gap-1 text-xs text-slate-700 font-medium cursor-pointer">
                <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <select
                  value={selectedArea}
                  onChange={(e) => setSelectedArea(e.target.value as any)}
                  className="bg-transparent border-none text-xs font-bold text-emerald-950 focus:outline-none cursor-pointer pr-3"
                >
                  {ikoroduAreas.map((area) => (
                    <option key={area} value={area}>
                      {area === 'All' ? 'All Areas' : area}
                    </option>
                  ))}
                </select>
              </div>

              {/* Search Text Input */}
              <input
                type="text"
                placeholder="Search businesses, bread, phones, lace in Ikorodu..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleNavClick('marketplace');
                }}
                className="w-full pl-3 pr-10 py-1.5 text-xs text-emerald-950 placeholder-slate-400 bg-transparent focus:outline-none font-medium"
              />
              <button
                onClick={() => handleNavClick('marketplace')}
                className="absolute right-1 px-3 py-1.5 bg-emerald-800 hover:bg-emerald-900 text-white rounded-xl transition-colors text-xs font-bold flex items-center gap-1 shadow-xs"
              >
                <Search className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Actions & User Menu */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Wishlist Button */}
            <button
              onClick={() => handleNavClick('wishlist')}
              className="relative p-2.5 text-gray-600 hover:text-emerald-800 hover:bg-emerald-50 rounded-xl transition-colors"
              title="Saved Items"
            >
              <Heart className="w-5 h-5" />
              {wishlist.length > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 bg-amber-500 text-emerald-950 font-bold text-[10px] rounded-full flex items-center justify-center">
                  {wishlist.length}
                </span>
              )}
            </button>

            {/* Notifications Dropdown */}
            <div className="relative">
              <button
                onClick={() => setNotifDropdownOpen(!notifDropdownOpen)}
                className="relative p-2.5 text-gray-600 hover:text-emerald-800 hover:bg-emerald-50 rounded-xl transition-colors"
                title="Notifications"
              >
                <Bell className="w-5 h-5" />
                {unreadNotifs.length > 0 && (
                  <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white font-bold text-[10px] rounded-full flex items-center justify-center animate-pulse">
                    {unreadNotifs.length}
                  </span>
                )}
              </button>

              {notifDropdownOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-white border border-gray-100 rounded-2xl shadow-xl z-50 p-3">
                  <div className="flex items-center justify-between border-b pb-2 mb-2">
                    <span className="text-xs font-bold text-emerald-950">Notifications</span>
                    <span className="text-[10px] text-gray-500">{notifications.length} Total</span>
                  </div>
                  <div className="max-h-64 overflow-y-auto space-y-2">
                    {notifications.length === 0 ? (
                      <p className="text-xs text-gray-500 py-4 text-center">No notifications yet.</p>
                    ) : (
                      notifications.map((n) => (
                        <div
                          key={n.id}
                          onClick={() => markNotificationRead(n.id)}
                          className={`p-2.5 rounded-xl text-xs cursor-pointer border transition-colors ${
                            n.isRead
                              ? 'bg-gray-50 border-gray-100 text-gray-600'
                              : 'bg-emerald-50/70 border-emerald-200 text-emerald-950 font-medium'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-bold text-[11px] text-emerald-900">{n.title}</span>
                            <span className="text-[9px] text-gray-400">
                              {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                          <p className="text-[11px] leading-snug">{n.message}</p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* List Your Business CTA */}
            <button
              onClick={() => handleNavClick('register-vendor')}
              className="hidden sm:flex items-center gap-1.5 px-3.5 py-2 bg-gradient-to-r from-emerald-700 to-teal-700 hover:from-emerald-800 hover:to-teal-800 text-white text-xs font-bold rounded-xl shadow-sm transition-all hover:shadow-md"
            >
              <PlusCircle className="w-4 h-4 text-amber-300" />
              <span>Register Business</span>
            </button>

            {/* Mobile Hamburger Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 text-gray-600 hover:bg-gray-100 rounded-xl"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Secondary Nav Links (Desktop) */}
        <nav className="hidden lg:flex items-center justify-between border-t border-gray-100 mt-2 pt-2 text-xs font-medium text-gray-700">
          <div className="flex items-center gap-6">
            <button
              onClick={() => handleNavClick('home')}
              className={`hover:text-emerald-700 pb-1 border-b-2 transition-all ${
                activeTab === 'home'
                  ? 'border-emerald-700 text-emerald-950 font-bold'
                  : 'border-transparent text-gray-600'
              }`}
            >
              Home
            </button>
            <button
              onClick={() => handleNavClick('directory')}
              className={`flex items-center gap-1 hover:text-emerald-700 pb-1 border-b-2 transition-all ${
                activeTab === 'directory'
                  ? 'border-emerald-700 text-emerald-950 font-bold'
                  : 'border-transparent text-gray-600'
              }`}
            >
              <Store className="w-3.5 h-3.5 text-emerald-600" />
              Business Directory
            </button>
            <button
              onClick={() => handleNavClick('marketplace')}
              className={`flex items-center gap-1 hover:text-emerald-700 pb-1 border-b-2 transition-all ${
                activeTab === 'marketplace'
                  ? 'border-emerald-700 text-emerald-950 font-bold'
                  : 'border-transparent text-gray-600'
              }`}
            >
              <ShoppingBag className="w-3.5 h-3.5 text-amber-500" />
              Product Marketplace
            </button>
            <button
              onClick={() => handleNavClick('categories')}
              className={`hover:text-emerald-700 pb-1 border-b-2 transition-all ${
                activeTab === 'categories'
                  ? 'border-emerald-700 text-emerald-950 font-bold'
                  : 'border-transparent text-gray-600'
              }`}
            >
              Categories
            </button>
            <button
              onClick={() => handleNavClick('promotions-pricing')}
              className={`flex items-center gap-1 hover:text-emerald-700 pb-1 border-b-2 transition-all ${
                activeTab === 'promotions-pricing'
                  ? 'border-emerald-700 text-emerald-950 font-bold'
                  : 'border-transparent text-gray-600'
              }`}
            >
              <CreditCard className="w-3.5 h-3.5 text-emerald-600" />
              Promotions & Pricing
            </button>
          </div>

          <div className="flex items-center gap-4">
            {/* Vendor Portal Tab */}
            <button
              onClick={() => handleNavClick('vendor-portal')}
              className={`px-3 py-1.5 rounded-lg font-semibold flex items-center gap-1.5 transition-all ${
                activeTab === 'vendor-portal'
                  ? 'bg-emerald-100 text-emerald-950 border border-emerald-300'
                  : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100'
              }`}
            >
              <Store className="w-3.5 h-3.5 text-emerald-700" />
              <span>Vendor Dashboard</span>
            </button>

            {/* Admin Portal Tab */}
            <button
              onClick={() => handleNavClick('admin-portal')}
              className={`px-3 py-1.5 rounded-lg font-semibold flex items-center gap-1.5 transition-all ${
                activeTab === 'admin-portal'
                  ? 'bg-amber-100 text-amber-950 border border-amber-300'
                  : 'bg-amber-50 text-amber-900 hover:bg-amber-100'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5 text-amber-600" />
              <span>Admin Portal</span>
              {(pendingVendorsCount > 0 || pendingPromosCount > 0) && (
                <span className="w-4 h-4 bg-red-500 text-white rounded-full text-[10px] font-bold flex items-center justify-center">
                  {pendingVendorsCount + pendingPromosCount}
                </span>
              )}
            </button>
          </div>
        </nav>
      </div>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-gray-200 bg-white px-4 py-4 space-y-3">
          <div className="relative mb-3">
            <input
              type="text"
              placeholder="Search Ikorodu businesses..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleNavClick('marketplace');
              }}
              className="w-full pl-3 pr-10 py-2 text-xs border border-gray-200 rounded-xl bg-gray-50"
            />
            <button
              onClick={() => handleNavClick('marketplace')}
              className="absolute right-2 top-2 text-emerald-700"
            >
              <Search className="w-4 h-4" />
            </button>
          </div>

          <button
            onClick={() => handleNavClick('home')}
            className="block w-full text-left py-2 font-semibold text-gray-800 text-xs border-b border-gray-100"
          >
            Home
          </button>
          <button
            onClick={() => handleNavClick('directory')}
            className="block w-full text-left py-2 font-semibold text-gray-800 text-xs border-b border-gray-100"
          >
            Business Directory
          </button>
          <button
            onClick={() => handleNavClick('marketplace')}
            className="block w-full text-left py-2 font-semibold text-gray-800 text-xs border-b border-gray-100"
          >
            Product Marketplace
          </button>
          <button
            onClick={() => handleNavClick('categories')}
            className="block w-full text-left py-2 font-semibold text-gray-800 text-xs border-b border-gray-100"
          >
            Categories
          </button>
          <button
            onClick={() => handleNavClick('promotions-pricing')}
            className="block w-full text-left py-2 font-semibold text-gray-800 text-xs border-b border-gray-100"
          >
            Promotions & Manual Payment
          </button>
          <button
            onClick={() => handleNavClick('vendor-portal')}
            className="block w-full text-left py-2 font-semibold text-emerald-800 text-xs border-b border-gray-100"
          >
            Vendor Dashboard
          </button>
          <button
            onClick={() => handleNavClick('admin-portal')}
            className="block w-full text-left py-2 font-semibold text-amber-800 text-xs border-b border-gray-100"
          >
            Admin Portal ({pendingVendorsCount + pendingPromosCount} Pending)
          </button>
          <button
            onClick={() => handleNavClick('register-vendor')}
            className="w-full py-2.5 bg-emerald-800 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-2"
          >
            <PlusCircle className="w-4 h-4 text-amber-300" />
            Register Business
          </button>
        </div>
      )}
    </header>
  );
};
