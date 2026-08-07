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
  LogIn,
  LogOut,
  User,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { IkoroduArea, UserRole } from '../types';
import { AuthModal } from './AuthModal';

export const Navbar: React.FC = () => {
  const {
    currentUser,
    currentRole,
    setRole,
    signOutSupabase,
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
    isAuthModalOpen,
    openAuthModal,
    closeAuthModal,
  } = useApp();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notifDropdownOpen, setNotifDropdownOpen] = useState(false);
  const [accountMenuOpen, setAccountMenuOpen] = useState(false);

  const isVendor = currentUser ? currentUser.role === 'vendor' : false;
  const isAdmin = currentUser ? currentUser.role === 'admin' : false;

  const loggedVendor = currentUser
    ? vendors.find(
        (v) =>
          (currentUser.email && v.ownerEmail?.toLowerCase() === currentUser.email.toLowerCase()) ||
          (currentUser.id && v.userId === currentUser.id)
      )
    : null;

  const vendorDisplayName = loggedVendor
    ? loggedVendor.businessName
    : currentUser?.firstName
    ? `${currentUser.firstName} ${currentUser.lastName || ''}`.trim()
    : 'Vendor';

  const handleSignOut = async () => {
    setAccountMenuOpen(false);
    setNotifDropdownOpen(false);
    setMobileMenuOpen(false);
    await signOutSupabase();
  };

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

  const handleNavClick = (tab: string) => {
    setActiveTab(tab);
    setSelectedVendorId(null);
    setSelectedProductId(null);
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200/90 shadow-xs">
      {/* Main Header Row */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5">
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

          {/* Search Bar (Desktop Compact Input) */}
          <div className="hidden md:flex items-center flex-1 max-w-lg mx-4">
            <div className="relative w-full flex items-center bg-slate-100/90 border border-slate-200 rounded-2xl focus-within:border-emerald-600 focus-within:bg-white focus-within:ring-2 focus-within:ring-emerald-500/20 transition-all p-1">
              {/* Area Selector */}
              <div className="relative border-r border-slate-200/80 pr-2 pl-2 py-1 flex items-center gap-1 text-xs text-slate-700 font-medium cursor-pointer">
                <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <select
                  value={selectedArea}
                  onChange={(e) => setSelectedArea(e.target.value as any)}
                  className="bg-transparent border-none text-xs font-bold text-emerald-950 focus:outline-none cursor-pointer pr-2"
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
                placeholder="Search products or businesses in Ikorodu..."
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

          {/* Actions & Register Button */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Wishlist Button */}
            <button
              onClick={() => handleNavClick('wishlist')}
              className="relative p-2.5 text-slate-600 hover:text-emerald-800 hover:bg-emerald-50 rounded-xl transition-colors"
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
                className="relative p-2.5 text-slate-600 hover:text-emerald-800 hover:bg-emerald-50 rounded-xl transition-colors"
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
                <div className="absolute right-0 mt-2 w-80 bg-white border border-slate-200 rounded-2xl shadow-xl z-50 p-3">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2 mb-2">
                    <span className="text-xs font-bold text-emerald-950">Notifications</span>
                    <span className="text-[10px] text-slate-500">{notifications.length} Total</span>
                  </div>
                  <div className="max-h-64 overflow-y-auto space-y-2">
                    {notifications.length === 0 ? (
                      <p className="text-xs text-slate-500 py-4 text-center">No notifications yet.</p>
                    ) : (
                      notifications.map((n) => (
                        <div
                          key={n.id}
                          onClick={() => markNotificationRead(n.id)}
                          className={`p-2.5 rounded-xl text-xs cursor-pointer border transition-colors ${
                            n.isRead
                              ? 'bg-slate-50 border-slate-100 text-slate-600'
                              : 'bg-emerald-50/70 border-emerald-200 text-emerald-950 font-medium'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-bold text-[11px] text-emerald-900">{n.title}</span>
                            <span className="text-[9px] text-slate-400">
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

            {/* Authentication / Account Menu */}
            {currentUser ? (
              <div className="relative">
                <button
                  onClick={() => setAccountMenuOpen(!accountMenuOpen)}
                  className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold flex items-center gap-2 border border-slate-200 transition-all shadow-2xs"
                >
                  <User className="w-4 h-4 text-emerald-700" />
                  <span className="max-w-[140px] truncate font-display">
                    {isVendor ? vendorDisplayName : currentUser.firstName}
                  </span>
                  <span className="text-[10px] bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded-md font-extrabold uppercase">
                    {currentUser.role}
                  </span>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
                </button>

                {accountMenuOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-200 py-2 z-50 text-xs animate-in fade-in slide-in-from-top-1">
                    <div className="px-3.5 py-2 border-b border-slate-100">
                      <p className="font-black text-slate-900 truncate">
                        {isVendor ? vendorDisplayName : `${currentUser.firstName} ${currentUser.lastName || ''}`}
                      </p>
                      <p className="text-[11px] text-slate-500 truncate">{currentUser.email}</p>
                    </div>

                    {isVendor && (
                      <>
                        <button
                          onClick={() => {
                            setAccountMenuOpen(false);
                            handleNavClick('vendor-portal');
                          }}
                          className="w-full text-left px-3.5 py-2 hover:bg-emerald-50 text-emerald-900 font-bold flex items-center gap-2"
                        >
                          <Store className="w-4 h-4 text-emerald-600" />
                          <span>Vendor Dashboard</span>
                        </button>
                        <button
                          onClick={() => {
                            setAccountMenuOpen(false);
                            handleNavClick('marketplace');
                          }}
                          className="w-full text-left px-3.5 py-2 hover:bg-slate-50 text-slate-800 font-semibold flex items-center gap-2"
                        >
                          <ShoppingBag className="w-4 h-4 text-amber-500" />
                          <span>Back to Marketplace</span>
                        </button>
                      </>
                    )}

                    {currentUser.role === 'customer' && (
                      <button
                        onClick={() => {
                          setAccountMenuOpen(false);
                          handleNavClick('customer-portal');
                        }}
                        className="w-full text-left px-3.5 py-2 hover:bg-emerald-50 text-emerald-900 font-bold flex items-center gap-2"
                      >
                        <User className="w-4 h-4 text-emerald-600" />
                        <span>Customer Account</span>
                      </button>
                    )}

                    {isAdmin && (
                      <button
                        onClick={() => {
                          setAccountMenuOpen(false);
                          handleNavClick('admin-portal');
                        }}
                        className="w-full text-left px-3.5 py-2 hover:bg-amber-50 text-amber-950 font-bold flex items-center gap-2"
                      >
                        <ShieldCheck className="w-4 h-4 text-amber-600" />
                        <span>Admin Portal</span>
                      </button>
                    )}

                    <div className="border-t border-slate-100 mt-1 pt-1">
                      <button
                        onClick={handleSignOut}
                        className="w-full text-left px-3.5 py-2 hover:bg-red-50 text-red-600 font-bold flex items-center gap-2"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={() => openAuthModal()}
                className="flex items-center gap-1.5 px-3.5 py-2 border border-slate-300 hover:border-emerald-600 text-slate-800 hover:text-emerald-950 text-xs font-bold rounded-xl transition-all hover:bg-slate-50"
              >
                <LogIn className="w-3.5 h-3.5 text-emerald-700" />
                <span>Sign In</span>
              </button>
            )}

            {/* Register Business CTA - HIDDEN WHEN LOGGED IN AS VENDOR */}
            {!isVendor && (
              <button
                onClick={() => handleNavClick('register-vendor')}
                className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-emerald-800 to-teal-700 hover:from-emerald-900 hover:to-teal-800 text-white text-xs font-bold rounded-xl shadow-sm transition-all hover:shadow-md"
              >
                <PlusCircle className="w-4 h-4 text-amber-300" />
                <span className="hidden sm:inline">Register Business</span>
                <span className="sm:hidden">Register</span>
              </button>
            )}

            {/* Mobile Hamburger Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 text-slate-600 hover:bg-slate-100 rounded-xl"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Secondary Nav Links (Desktop) */}
        <nav className="hidden lg:flex items-center justify-between border-t border-slate-100 mt-2.5 pt-2 text-xs font-medium text-slate-700">
          <div className="flex items-center gap-7">
            <button
              onClick={() => handleNavClick('home')}
              className={`hover:text-emerald-700 pb-1 border-b-2 transition-all ${
                activeTab === 'home'
                  ? 'border-emerald-700 text-emerald-950 font-bold'
                  : 'border-transparent text-slate-600'
              }`}
            >
              Home
            </button>
            <button
              onClick={() => handleNavClick('marketplace')}
              className={`flex items-center gap-1.5 hover:text-emerald-700 pb-1 border-b-2 transition-all ${
                activeTab === 'marketplace'
                  ? 'border-emerald-700 text-emerald-950 font-bold'
                  : 'border-transparent text-slate-600'
              }`}
            >
              <ShoppingBag className="w-3.5 h-3.5 text-amber-500" />
              Product Marketplace
            </button>
            <button
              onClick={() => handleNavClick('directory')}
              className={`flex items-center gap-1.5 hover:text-emerald-700 pb-1 border-b-2 transition-all ${
                activeTab === 'directory'
                  ? 'border-emerald-700 text-emerald-950 font-bold'
                  : 'border-transparent text-slate-600'
              }`}
            >
              <Store className="w-3.5 h-3.5 text-emerald-600" />
              Business Directory
            </button>
            <button
              onClick={() => handleNavClick('categories')}
              className={`hover:text-emerald-700 pb-1 border-b-2 transition-all ${
                activeTab === 'categories'
                  ? 'border-emerald-700 text-emerald-950 font-bold'
                  : 'border-transparent text-slate-600'
              }`}
            >
              Categories
            </button>
            <button
              onClick={() => handleNavClick('promotions-pricing')}
              className={`flex items-center gap-1.5 hover:text-emerald-700 pb-1 border-b-2 transition-all ${
                activeTab === 'promotions-pricing' || activeTab === 'promotions'
                  ? 'border-emerald-700 text-emerald-950 font-bold'
                  : 'border-transparent text-slate-600'
              }`}
            >
              <CreditCard className="w-3.5 h-3.5 text-emerald-600" />
              Promotions & Pricing
            </button>
          </div>

          <div className="flex items-center gap-3">
            {/* Vendor Dashboard Tab - ONLY APPEARS FOR VENDORS */}
            {isVendor && (
              <button
                onClick={() => handleNavClick('vendor-portal')}
                className={`px-3 py-1.5 rounded-xl font-bold flex items-center gap-1.5 transition-all text-xs ${
                  activeTab === 'vendor-portal'
                    ? 'bg-emerald-100 text-emerald-950 border border-emerald-300'
                    : 'bg-emerald-50/80 text-emerald-800 hover:bg-emerald-100'
                }`}
              >
                <Store className="w-3.5 h-3.5 text-emerald-700" />
                <span>Vendor Dashboard</span>
              </button>
            )}

            {/* Admin Dashboard Tab - ONLY APPEARS FOR ADMINS */}
            {isAdmin && (
              <button
                onClick={() => handleNavClick('admin-portal')}
                className={`px-3 py-1.5 rounded-xl font-bold flex items-center gap-1.5 transition-all text-xs ${
                  activeTab === 'admin-portal' || activeTab === 'admin'
                    ? 'bg-amber-100 text-amber-950 border border-amber-300'
                    : 'bg-amber-50 text-amber-900 hover:bg-amber-100'
                }`}
              >
                <ShieldCheck className="w-3.5 h-3.5 text-amber-600" />
                <span>Admin Dashboard</span>
              </button>
            )}
          </div>
        </nav>
      </div>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-slate-200 bg-white px-4 py-4 space-y-3">
          <div className="relative mb-3">
            <input
              type="text"
              placeholder="Search products or businesses in Ikorodu..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleNavClick('marketplace');
              }}
              className="w-full pl-3 pr-10 py-2 text-xs border border-slate-200 rounded-xl bg-slate-50"
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
            className="block w-full text-left py-2 font-semibold text-slate-800 text-xs border-b border-slate-100"
          >
            Home
          </button>
          <button
            onClick={() => handleNavClick('marketplace')}
            className="block w-full text-left py-2 font-semibold text-amber-700 text-xs border-b border-slate-100"
          >
            Product Marketplace
          </button>
          <button
            onClick={() => handleNavClick('directory')}
            className="block w-full text-left py-2 font-semibold text-emerald-800 text-xs border-b border-slate-100"
          >
            Business Directory
          </button>
          <button
            onClick={() => handleNavClick('categories')}
            className="block w-full text-left py-2 font-semibold text-slate-800 text-xs border-b border-slate-100"
          >
            Categories
          </button>
          <button
            onClick={() => handleNavClick('promotions-pricing')}
            className="block w-full text-left py-2 font-semibold text-slate-800 text-xs border-b border-slate-100"
          >
            Promotions & Pricing
          </button>

          {/* Vendor Dashboard Mobile Link - ONLY for logged in vendors */}
          {isVendor && (
            <button
              onClick={() => handleNavClick('vendor-portal')}
              className="block w-full text-left py-2 font-semibold text-emerald-800 text-xs border-b border-slate-100"
            >
              Vendor Dashboard
            </button>
          )}

          {/* Admin Dashboard Mobile Link - ONLY for logged in admins */}
          {isAdmin && (
            <button
              onClick={() => handleNavClick('admin-portal')}
              className="block w-full text-left py-2 font-semibold text-amber-800 text-xs border-b border-slate-100"
            >
              Admin Dashboard
            </button>
          )}

          {!currentUser ? (
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                openAuthModal();
              }}
              className="w-full py-2.5 bg-slate-100 border border-slate-300 text-slate-800 text-xs font-bold rounded-xl flex items-center justify-center gap-2"
            >
              <LogIn className="w-4 h-4 text-emerald-700" />
              <span>Sign In</span>
            </button>
          ) : (
            <button
              onClick={handleSignOut}
              className="w-full py-2.5 bg-red-50 text-red-700 text-xs font-bold rounded-xl flex items-center justify-center gap-2 border border-red-200"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign Out ({currentUser.firstName})</span>
            </button>
          )}

          {!isVendor && (
            <button
              onClick={() => handleNavClick('register-vendor')}
              className="w-full py-2.5 bg-emerald-800 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-2 shadow-sm"
            >
              <PlusCircle className="w-4 h-4 text-amber-300" />
              Register Business
            </button>
          )}
        </div>
      )}

      {/* Auth Modal Component */}
      <AuthModal isOpen={isAuthModalOpen} onClose={closeAuthModal} />
    </header>
  );
};
