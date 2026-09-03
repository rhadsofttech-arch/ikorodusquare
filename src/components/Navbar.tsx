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
  Navigation,
  Loader2,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { IkoroduArea, UserRole } from '../types';
import { AuthModal } from './AuthModal';
import { useSmartSearch } from '../hooks/useSmartSearch';
import { SmartSearchDropdown } from './SmartSearchDropdown';

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
    products,
    promotionRequests,
    setSelectedVendorId,
    setSelectedProductId,
    isAuthModalOpen,
    openAuthModal,
    closeAuthModal,
  } = useApp();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const [notifDropdownOpen, setNotifDropdownOpen] = useState(false);
  const [accountMenuOpen, setAccountMenuOpen] = useState(false);
  const [isSearchFocused, setIsSearchFocused] = useState(false);

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
    setMobileSearchOpen(false);
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

  const userRoleNotifs = notifications.filter((n) => {
    // Admin notifications MUST ONLY appear if current user is admin
    if (n.targetRole === 'admin') {
      return currentUser?.role === 'admin';
    }
    // Vendor notifications MUST ONLY appear if current user is vendor and matches
    if (n.targetRole === 'vendor') {
      if (currentUser?.role !== 'vendor') return false;
      if (n.userId && n.userId !== 'all' && n.userId !== 'vendor') {
        return n.userId === currentUser.id || (loggedVendor && n.userId === loggedVendor.id);
      }
      return true;
    }
    // Customer notifications
    if (n.targetRole === 'customer') {
      if (!currentUser) return false;
      if (n.userId && n.userId !== 'all' && n.userId !== 'customer') {
        return n.userId === currentUser.id;
      }
      return true;
    }
    // Target userId specific match
    if (n.userId && n.userId !== 'all') {
      if (!currentUser) return false;
      return n.userId === currentUser.id || (loggedVendor && n.userId === loggedVendor.id);
    }
    // Public/general system notifications
    return true;
  });

  const unreadNotifs = userRoleNotifs.filter((n) => !n.isRead);

  const handleNavClick = (tab: string) => {
    setActiveTab(tab);
    setSelectedVendorId(null);
    setSelectedProductId(null);
    setMobileMenuOpen(false);
    setMobileSearchOpen(false);
    setIsSearchFocused(false);
  };

  // Real-time smart search engine hook
  const {
    results: searchResults,
    isLoading: isSearchLoading,
    isDropdownOpen,
    setIsDropdownOpen,
    isNearMeActive,
    toggleNearMe,
    locationStatus,
    locationError,
    nearMeRadiusKm,
    setNearMeRadiusKm,
  } = useSmartSearch();

  const handleSelectVendor = (vendorId: string, _slug?: string) => {
    setSelectedVendorId(vendorId);
    setActiveTab('vendor-details');
    setIsSearchFocused(false);
    setIsDropdownOpen(false);
    setMobileSearchOpen(false);
    setMobileMenuOpen(false);
  };

  const handleSelectProduct = (productId: string) => {
    setSelectedProductId(productId);
    setActiveTab('product-details');
    setIsSearchFocused(false);
    setIsDropdownOpen(false);
    setMobileSearchOpen(false);
    setMobileMenuOpen(false);
  };

  const handleSearchSubmit = () => {
    setActiveTab('marketplace');
    setIsSearchFocused(false);
    setIsDropdownOpen(false);
    setMobileSearchOpen(false);
    setMobileMenuOpen(false);
  };

  const isDropdownVisible = (isSearchFocused || isDropdownOpen) && (searchQuery.trim().length > 0 || isNearMeActive);

  const renderSearchDropdown = () => (
    <SmartSearchDropdown
      isOpen={isDropdownVisible}
      isLoading={isSearchLoading}
      query={searchQuery}
      results={searchResults}
      isNearMeActive={isNearMeActive}
      nearMeRadiusKm={nearMeRadiusKm}
      setNearMeRadiusKm={setNearMeRadiusKm}
      locationStatus={locationStatus}
      locationError={locationError}
      onSelectVendor={handleSelectVendor}
      onSelectProduct={handleSelectProduct}
      onViewAllMarketplace={() => {
        setActiveTab('marketplace');
        setIsSearchFocused(false);
        setIsDropdownOpen(false);
        setMobileSearchOpen(false);
        setMobileMenuOpen(false);
      }}
      onViewAllDirectory={() => {
        setActiveTab('directory');
        setIsSearchFocused(false);
        setIsDropdownOpen(false);
        setMobileSearchOpen(false);
        setMobileMenuOpen(false);
      }}
      onClose={() => {
        setIsSearchFocused(false);
        setIsDropdownOpen(false);
      }}
    />
  );

  return (
    <>
      {/* Click outside backdrop for closing search dropdown */}
      {isDropdownVisible && (
        <div
          className="fixed inset-0 z-30 bg-black/10 backdrop-blur-[1px]"
          onClick={() => {
            setIsSearchFocused(false);
            setIsDropdownOpen(false);
          }}
        />
      )}

      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/90 shadow-xs">
        {/* Main Header Row */}
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-2.5 sm:py-3.5">
          <div className="flex items-center justify-between gap-2 sm:gap-4 min-h-[44px]">
            {/* Logo */}
            <a
              href="/"
              onClick={(e) => {
                e.preventDefault();
                handleNavClick('home');
              }}
              className="flex items-center gap-2 sm:gap-3 cursor-pointer group shrink-0 min-w-0"
            >
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl bg-gradient-to-tr from-emerald-800 via-emerald-700 to-teal-600 flex items-center justify-center text-white shadow-sm border border-emerald-600/30 group-hover:scale-105 transition-transform shrink-0">
                <Building2 className="w-4 h-4 sm:w-5 sm:h-5 text-amber-300" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1">
                  <span className="text-base sm:text-xl font-black tracking-tight text-emerald-950 font-display truncate">
                    Ikorodu<span className="text-amber-500">Square</span>
                  </span>
                  <span className="text-[8px] sm:text-[10px] bg-emerald-100/90 text-emerald-900 px-1.5 py-0.2 rounded-full font-extrabold border border-emerald-300/60 shrink-0">
                    NG
                  </span>
                </div>
                <p className="hidden sm:block text-[10px] text-emerald-800 font-semibold leading-none">
                  Local Business Directory & Marketplace
                </p>
              </div>
            </a>

            {/* Search Bar (Desktop Real-time Search Input) */}
            <div className="hidden md:flex items-center flex-1 max-w-lg mx-4 relative z-50">
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
                  placeholder="Search products, services, or businesses..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setIsSearchFocused(true);
                    setIsDropdownOpen(true);
                  }}
                  onFocus={() => {
                    setIsSearchFocused(true);
                    setIsDropdownOpen(true);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleSearchSubmit();
                    if (e.key === 'Escape') {
                      setIsSearchFocused(false);
                      setIsDropdownOpen(false);
                    }
                  }}
                  className="w-full pl-3 pr-2 py-1.5 text-xs text-emerald-950 placeholder-slate-400 bg-transparent focus:outline-none font-medium"
                />

                {/* Near Me Toggle Button (Desktop) */}
                <button
                  type="button"
                  onClick={() => {
                    toggleNearMe();
                    setIsDropdownOpen(true);
                  }}
                  title={
                    isNearMeActive
                      ? `Near Me active (${nearMeRadiusKm}km) - Click to turn off`
                      : 'Sort and filter by businesses closest to you'
                  }
                  className={`mr-1 px-2.5 py-1 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shrink-0 ${
                    isNearMeActive
                      ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs'
                      : locationStatus === 'prompting'
                      ? 'bg-amber-100 text-amber-900 animate-pulse'
                      : 'bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 hover:border-emerald-600/40'
                  }`}
                >
                  <Navigation
                    className={`w-3.5 h-3.5 ${
                      isNearMeActive ? 'fill-white text-white' : 'text-emerald-600'
                    }`}
                  />
                  <span className="whitespace-nowrap">
                    {locationStatus === 'prompting'
                      ? 'Locating...'
                      : isNearMeActive
                      ? `Near Me (${nearMeRadiusKm}km)`
                      : 'Near Me'}
                  </span>
                  {isNearMeActive && <span className="w-1.5 h-1.5 rounded-full bg-amber-300 animate-pulse" />}
                </button>

                <button
                  type="button"
                  onClick={handleSearchSubmit}
                  className="px-3 py-1.5 bg-emerald-800 hover:bg-emerald-900 text-white rounded-xl transition-colors text-xs font-bold flex items-center gap-1 shadow-xs shrink-0"
                  aria-label="Submit search"
                >
                  <Search className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Real-time Search Results Dropdown (Desktop) */}
              {renderSearchDropdown()}
            </div>

            {/* Actions & Register Button */}
            <div className="flex items-center gap-1 sm:gap-2.5 md:gap-3 shrink-0">
              {/* Mobile Quick Search Button Toggle (Mobile Only) */}
              <button
                type="button"
                onClick={() => {
                  setMobileSearchOpen(!mobileSearchOpen);
                  if (mobileMenuOpen) setMobileMenuOpen(false);
                }}
                className="md:hidden p-2 text-slate-700 hover:text-emerald-800 hover:bg-emerald-50 rounded-xl transition-colors active:scale-95"
                title="Quick Search"
                aria-label="Search businesses and products"
              >
                <Search className="w-5 h-5 text-emerald-900" />
              </button>

              {/* Notifications Dropdown (Both Mobile & Desktop) */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setNotifDropdownOpen(!notifDropdownOpen)}
                  className="relative p-2 sm:p-2.5 text-slate-600 hover:text-emerald-800 hover:bg-emerald-50 rounded-xl transition-colors active:scale-95"
                  title="Notifications"
                  aria-label="Notifications"
                >
                  <Bell className="w-5 h-5 text-slate-700" />
                  {unreadNotifs.length > 0 && (
                    <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white font-bold text-[10px] rounded-full flex items-center justify-center animate-pulse">
                      {unreadNotifs.length}
                    </span>
                  )}
                </button>

                {notifDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-72 sm:w-80 bg-white border border-slate-200 rounded-2xl shadow-xl z-50 p-3">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-2 mb-2">
                      <span className="text-xs font-bold text-emerald-950">Notifications</span>
                      <span className="text-[10px] text-slate-500">{userRoleNotifs.length} Total</span>
                    </div>
                    <div className="max-h-64 overflow-y-auto space-y-2">
                      {userRoleNotifs.length === 0 ? (
                        <p className="text-xs text-slate-500 py-4 text-center">No notifications yet.</p>
                      ) : (
                        userRoleNotifs.map((n) => (
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

              {/* Desktop-Only: Authentication / Account Menu */}
              {currentUser ? (
                <div className="hidden md:block relative">
                  <button
                    type="button"
                    onClick={() => setAccountMenuOpen(!accountMenuOpen)}
                    className="px-2.5 sm:px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold flex items-center gap-1.5 sm:gap-2 border border-slate-200 transition-all shadow-2xs"
                  >
                    <User className="w-4 h-4 text-emerald-700" />
                    <span className="hidden sm:inline max-w-[120px] truncate font-display">
                      {isVendor ? vendorDisplayName : currentUser.firstName}
                    </span>
                    <span className="text-[9px] sm:text-[10px] bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded-md font-extrabold uppercase">
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
                            type="button"
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
                            type="button"
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
                          type="button"
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
                          type="button"
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
                          type="button"
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
                  type="button"
                  onClick={() => openAuthModal()}
                  className="hidden md:flex items-center gap-1.5 px-3 py-2 border border-slate-300 hover:border-emerald-600 text-slate-800 hover:text-emerald-950 text-xs font-bold rounded-xl transition-all hover:bg-slate-50"
                >
                  <LogIn className="w-3.5 h-3.5 text-emerald-700" />
                  <span>Sign In</span>
                </button>
              )}

              {/* Desktop-Only: Register Business CTA - HIDDEN WHEN LOGGED IN AS VENDOR */}
              {!isVendor && (
                <a
                  href="/register-vendor"
                  onClick={(e) => {
                    e.preventDefault();
                    handleNavClick('register-vendor');
                  }}
                  className="hidden md:flex items-center gap-1.5 px-3 sm:px-4 py-2 bg-gradient-to-r from-emerald-800 to-teal-700 hover:from-emerald-900 hover:to-teal-800 text-white text-xs font-bold rounded-xl shadow-xs transition-all hover:shadow-md"
                >
                  <PlusCircle className="w-4 h-4 text-amber-300" />
                  <span className="hidden sm:inline">Register Business</span>
                  <span className="sm:hidden">Register</span>
                </a>
              )}

              {/* Mobile/Tablet Hamburger Toggle */}
              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(!mobileMenuOpen);
                  if (mobileSearchOpen) setMobileSearchOpen(false);
                }}
                className="lg:hidden p-2 text-slate-700 hover:text-emerald-900 hover:bg-emerald-50 rounded-xl transition-colors active:scale-95 ml-0.5"
                title="Open Navigation Menu"
                aria-label="Toggle navigation menu"
              >
                {mobileMenuOpen ? <X className="w-5 h-5 text-emerald-900" /> : <Menu className="w-5 h-5 text-slate-800" />}
              </button>
            </div>
          </div>

          {/* Mobile Instant Real-time Search Row (Expanded on mobile click) */}
          {mobileSearchOpen && (
            <div className="md:hidden mt-3 relative z-50 animate-in slide-in-from-top-2 duration-150">
              <div className="relative w-full flex items-center bg-slate-100 border border-emerald-600/50 rounded-2xl p-1 shadow-sm">
                <div className="relative border-r border-slate-200 pr-1 pl-1 py-1 flex items-center gap-1 text-[11px] text-slate-700 font-medium shrink-0">
                  <MapPin className="w-3 h-3 text-emerald-600 shrink-0" />
                  <select
                    value={selectedArea}
                    onChange={(e) => setSelectedArea(e.target.value as any)}
                    className="bg-transparent border-none text-[11px] font-bold text-emerald-950 focus:outline-none cursor-pointer pr-1"
                  >
                    {ikoroduAreas.map((area) => (
                      <option key={area} value={area}>
                        {area === 'All' ? 'All' : area}
                      </option>
                    ))}
                  </select>
                </div>

                <input
                  type="text"
                  placeholder="Search stores or items in Ikorodu..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setIsSearchFocused(true);
                    setIsDropdownOpen(true);
                  }}
                  onFocus={() => {
                    setIsSearchFocused(true);
                    setIsDropdownOpen(true);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleSearchSubmit();
                  }}
                  autoFocus
                  className="w-full pl-2 pr-8 py-1.5 text-xs text-emerald-950 placeholder-slate-400 bg-transparent focus:outline-none font-medium"
                />
                <button
                  type="button"
                  onClick={() => {
                    setMobileSearchOpen(false);
                    setIsSearchFocused(false);
                    setIsDropdownOpen(false);
                  }}
                  className="absolute right-2 text-slate-400 hover:text-slate-600"
                  aria-label="Close mobile search"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Mobile Near Me Action Row */}
              <div className="flex items-center justify-between mt-1.5 px-1">
                <button
                  type="button"
                  onClick={() => {
                    toggleNearMe();
                    setIsDropdownOpen(true);
                  }}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-bold flex items-center gap-1.5 transition-all ${
                    isNearMeActive
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : locationStatus === 'prompting'
                      ? 'bg-amber-100 text-amber-900 animate-pulse'
                      : 'bg-white text-slate-700 border border-slate-200'
                  }`}
                >
                  <Navigation className={`w-3 h-3 ${isNearMeActive ? 'fill-white text-white' : 'text-emerald-600'}`} />
                  <span>
                    {locationStatus === 'prompting'
                      ? 'Locating...'
                      : isNearMeActive
                      ? `Near Me (${nearMeRadiusKm}km active)`
                      : 'Near Me'}
                  </span>
                  {isNearMeActive && <span className="w-1.5 h-1.5 rounded-full bg-amber-300 animate-pulse" />}
                </button>

                {isNearMeActive && (
                  <button
                    type="button"
                    onClick={toggleNearMe}
                    className="text-[10px] text-slate-500 hover:text-slate-700 underline font-semibold"
                  >
                    Turn off
                  </button>
                )}
              </div>

              {/* Mobile Real-Time Search Results Dropdown */}
              {renderSearchDropdown()}
            </div>
          )}

          {/* Secondary Nav Links (Desktop) */}
          <nav className="hidden lg:flex items-center justify-between border-t border-slate-100 mt-2.5 pt-2 text-xs font-medium text-slate-700">
            <div className="flex items-center gap-7">
              <a
                href="/"
                onClick={(e) => {
                  e.preventDefault();
                  handleNavClick('home');
                }}
                className={`hover:text-emerald-700 pb-1 border-b-2 transition-all ${
                  activeTab === 'home'
                    ? 'border-emerald-700 text-emerald-950 font-bold'
                    : 'border-transparent text-slate-600'
                }`}
              >
                Home
              </a>
              <a
                href="/marketplace"
                onClick={(e) => {
                  e.preventDefault();
                  handleNavClick('marketplace');
                }}
                className={`flex items-center gap-1.5 hover:text-emerald-700 pb-1 border-b-2 transition-all ${
                  activeTab === 'marketplace'
                    ? 'border-emerald-700 text-emerald-950 font-bold'
                    : 'border-transparent text-slate-600'
                }`}
              >
                <ShoppingBag className="w-3.5 h-3.5 text-amber-500" />
                Product Marketplace
              </a>
              <a
                href="/directory"
                onClick={(e) => {
                  e.preventDefault();
                  handleNavClick('directory');
                }}
                className={`flex items-center gap-1.5 hover:text-emerald-700 pb-1 border-b-2 transition-all ${
                  activeTab === 'directory'
                    ? 'border-emerald-700 text-emerald-950 font-bold'
                    : 'border-transparent text-slate-600'
                }`}
              >
                <Store className="w-3.5 h-3.5 text-emerald-600" />
                Business Directory
              </a>
              <a
                href="/promotions-pricing"
                onClick={(e) => {
                  e.preventDefault();
                  handleNavClick('promotions-pricing');
                }}
                className={`flex items-center gap-1.5 hover:text-emerald-700 pb-1 border-b-2 transition-all ${
                  activeTab === 'promotions-pricing' || activeTab === 'promotions'
                    ? 'border-emerald-700 text-emerald-950 font-bold'
                    : 'border-transparent text-slate-600'
                }`}
              >
                <CreditCard className="w-3.5 h-3.5 text-emerald-600" />
                Promotions & Pricing
              </a>
            </div>

            <div className="flex items-center gap-3">
              {/* Vendor Dashboard Tab - ONLY APPEARS FOR VENDORS */}
              {isVendor && (
                <button
                  type="button"
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
                  type="button"
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

        {/* Mobile Menu Overlay / Drawer */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-slate-200 bg-white/98 backdrop-blur-xl px-4 py-4 space-y-4 shadow-xl animate-in slide-in-from-top-2 duration-200 max-h-[85vh] overflow-y-auto">
            {/* User Profile / Auth Status Header in Mobile Drawer */}
            {currentUser ? (
              <div className="p-3.5 bg-gradient-to-r from-emerald-50 to-teal-50/80 rounded-2xl border border-emerald-100/90 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-emerald-800 text-white flex items-center justify-center font-bold font-display shadow-xs shrink-0">
                    {isVendor ? (
                      <Store className="w-5 h-5 text-amber-300" />
                    ) : (
                      <User className="w-5 h-5 text-emerald-100" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="font-extrabold text-sm text-slate-900 truncate">
                      {isVendor ? vendorDisplayName : `${currentUser.firstName} ${currentUser.lastName || ''}`.trim()}
                    </p>
                    <p className="text-[11px] text-slate-500 truncate">{currentUser.email}</p>
                  </div>
                </div>
                <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-md bg-emerald-200/70 text-emerald-900 border border-emerald-300/80 shrink-0">
                  {currentUser.role}
                </span>
              </div>
            ) : (
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between gap-2">
                <div>
                  <p className="font-bold text-xs text-slate-900">Welcome to IkoroduSquare</p>
                  <p className="text-[11px] text-slate-500">Sign in to manage orders, wishlist & stores</p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    openAuthModal();
                  }}
                  className="px-3.5 py-1.5 bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-xs rounded-xl shadow-xs transition-colors shrink-0 flex items-center gap-1.5"
                >
                  <LogIn className="w-3.5 h-3.5 text-amber-300" />
                  <span>Sign In</span>
                </button>
              </div>
            )}

            {/* Realtime Search Input in Mobile Menu */}
            <div className="relative z-50">
              <div className="relative flex items-center border border-slate-200 rounded-2xl bg-slate-100/90 focus-within:border-emerald-600 focus-within:bg-white focus-within:ring-2 focus-within:ring-emerald-500/20 transition-all p-1">
                {/* Area filter */}
                <div className="relative border-r border-slate-200 pr-1.5 pl-1.5 py-1 flex items-center gap-1 text-[11px] text-slate-700 font-medium shrink-0">
                  <MapPin className="w-3 h-3 text-emerald-600 shrink-0" />
                  <select
                    value={selectedArea}
                    onChange={(e) => setSelectedArea(e.target.value as any)}
                    className="bg-transparent border-none text-[11px] font-bold text-emerald-950 focus:outline-none cursor-pointer pr-1"
                  >
                    {ikoroduAreas.map((area) => (
                      <option key={area} value={area}>
                        {area === 'All' ? 'All' : area}
                      </option>
                    ))}
                  </select>
                </div>

                <input
                  type="text"
                  placeholder="Instant search businesses or products..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setIsSearchFocused(true);
                    setIsDropdownOpen(true);
                  }}
                  onFocus={() => {
                    setIsSearchFocused(true);
                    setIsDropdownOpen(true);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleSearchSubmit();
                  }}
                  className="w-full pl-2 pr-7 py-1.5 text-xs text-emerald-950 placeholder-slate-400 bg-transparent focus:outline-none font-medium"
                />
                <button
                  type="button"
                  onClick={handleSearchSubmit}
                  className="p-1 text-emerald-700 hover:text-emerald-900"
                  aria-label="Search"
                >
                  <Search className="w-4 h-4" />
                </button>
              </div>

              {/* Mobile Drawer Near Me Toggle */}
              <div className="flex items-center justify-between mt-1.5 px-1">
                <button
                  type="button"
                  onClick={() => {
                    toggleNearMe();
                    setIsDropdownOpen(true);
                  }}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-bold flex items-center gap-1.5 transition-all ${
                    isNearMeActive
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : locationStatus === 'prompting'
                      ? 'bg-amber-100 text-amber-900 animate-pulse'
                      : 'bg-white text-slate-700 border border-slate-200'
                  }`}
                >
                  <Navigation className={`w-3 h-3 ${isNearMeActive ? 'fill-white text-white' : 'text-emerald-600'}`} />
                  <span>
                    {locationStatus === 'prompting'
                      ? 'Locating...'
                      : isNearMeActive
                      ? `Near Me (${nearMeRadiusKm}km active)`
                      : 'Near Me'}
                  </span>
                  {isNearMeActive && <span className="w-1.5 h-1.5 rounded-full bg-amber-300 animate-pulse" />}
                </button>

                {isNearMeActive && (
                  <button
                    type="button"
                    onClick={toggleNearMe}
                    className="text-[10px] text-slate-500 hover:text-slate-700 underline font-semibold"
                  >
                    Turn off
                  </button>
                )}
              </div>

              {/* Render Search Dropdown inside Mobile Menu if focused */}
              {renderSearchDropdown()}
            </div>

            {/* Navigation Links Group */}
            <div className="space-y-1 pt-1">
              <div className="px-2 py-1 text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                Explore Marketplace
              </div>

              <button
                type="button"
                onClick={() => handleNavClick('home')}
                className={`w-full flex items-center justify-between p-2.5 rounded-xl font-bold text-xs transition-colors ${
                  activeTab === 'home'
                    ? 'bg-emerald-50 text-emerald-950 border border-emerald-200/80 font-extrabold'
                    : 'text-slate-800 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Building2 className="w-4 h-4 text-emerald-700" />
                  <span>Home</span>
                </div>
              </button>

              <button
                type="button"
                onClick={() => handleNavClick('marketplace')}
                className={`w-full flex items-center justify-between p-2.5 rounded-xl font-bold text-xs transition-colors ${
                  activeTab === 'marketplace'
                    ? 'bg-emerald-50 text-emerald-950 border border-emerald-200/80 font-extrabold'
                    : 'text-slate-800 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <ShoppingBag className="w-4 h-4 text-amber-500" />
                  <span>Product Marketplace</span>
                </div>
                <span className="text-[10px] bg-amber-100 text-amber-900 font-extrabold px-2 py-0.5 rounded-full">
                  Shop
                </span>
              </button>

              <button
                type="button"
                onClick={() => handleNavClick('directory')}
                className={`w-full flex items-center justify-between p-2.5 rounded-xl font-bold text-xs transition-colors ${
                  activeTab === 'directory'
                    ? 'bg-emerald-50 text-emerald-950 border border-emerald-200/80 font-extrabold'
                    : 'text-slate-800 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Store className="w-4 h-4 text-emerald-600" />
                  <span>Business Directory</span>
                </div>
                <span className="text-[10px] bg-emerald-100 text-emerald-900 font-extrabold px-2 py-0.5 rounded-full">
                  Vendors
                </span>
              </button>

              <button
                type="button"
                onClick={() => handleNavClick('promotions-pricing')}
                className={`w-full flex items-center justify-between p-2.5 rounded-xl font-bold text-xs transition-colors ${
                  activeTab === 'promotions-pricing' || activeTab === 'promotions'
                    ? 'bg-emerald-50 text-emerald-950 border border-emerald-200/80 font-extrabold'
                    : 'text-slate-800 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <CreditCard className="w-4 h-4 text-teal-600" />
                  <span>Promotions & Pricing</span>
                </div>
              </button>
            </div>

            {/* Authenticated Portals & Roles Group */}
            {currentUser && (
              <div className="space-y-1 pt-2 border-t border-slate-100">
                <div className="px-2 py-1 text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                  Account & Portals
                </div>

                {isVendor && (
                  <button
                    type="button"
                    onClick={() => handleNavClick('vendor-portal')}
                    className={`w-full flex items-center justify-between p-2.5 rounded-xl font-bold text-xs transition-colors ${
                      activeTab === 'vendor-portal'
                        ? 'bg-emerald-100 text-emerald-950 border border-emerald-300 font-extrabold'
                        : 'text-emerald-900 bg-emerald-50/70 hover:bg-emerald-100/70'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Store className="w-4 h-4 text-emerald-700" />
                      <span>Vendor Dashboard</span>
                    </div>
                    <span className="text-[10px] bg-emerald-200/80 text-emerald-900 font-extrabold px-2 py-0.5 rounded-full">
                      Manage Store
                    </span>
                  </button>
                )}

                {currentUser.role === 'customer' && (
                  <button
                    type="button"
                    onClick={() => handleNavClick('customer-portal')}
                    className={`w-full flex items-center justify-between p-2.5 rounded-xl font-bold text-xs transition-colors ${
                      activeTab === 'customer-portal'
                        ? 'bg-emerald-100 text-emerald-950 border border-emerald-300 font-extrabold'
                        : 'text-slate-800 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <User className="w-4 h-4 text-emerald-700" />
                      <span>Customer Portal</span>
                    </div>
                  </button>
                )}

                {isAdmin && (
                  <button
                    type="button"
                    onClick={() => handleNavClick('admin-portal')}
                    className={`w-full flex items-center justify-between p-2.5 rounded-xl font-bold text-xs transition-colors ${
                      activeTab === 'admin-portal' || activeTab === 'admin'
                        ? 'bg-amber-100 text-amber-950 border border-amber-300 font-extrabold'
                        : 'text-amber-900 bg-amber-50/70 hover:bg-amber-100/70'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <ShieldCheck className="w-4 h-4 text-amber-600" />
                      <span>Admin Portal</span>
                    </div>
                    <span className="text-[10px] bg-amber-200/80 text-amber-950 font-extrabold px-2 py-0.5 rounded-full">
                      Administrator
                    </span>
                  </button>
                )}
              </div>
            )}

            {/* Action CTA & Sign Out */}
            <div className="pt-2 border-t border-slate-100 space-y-2">
              {!isVendor && (
                <button
                  type="button"
                  onClick={() => handleNavClick('register-vendor')}
                  className="w-full py-2.5 bg-gradient-to-r from-emerald-800 to-teal-700 hover:from-emerald-900 hover:to-teal-800 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-2 shadow-xs"
                >
                  <PlusCircle className="w-4 h-4 text-amber-300" />
                  <span>List / Register Your Business</span>
                </button>
              )}

              {currentUser ? (
                <button
                  type="button"
                  onClick={handleSignOut}
                  className="w-full py-2 bg-red-50 hover:bg-red-100 text-red-700 text-xs font-bold rounded-xl flex items-center justify-center gap-2 border border-red-200/80 transition-colors"
                >
                  <LogOut className="w-4 h-4 text-red-600" />
                  <span>Sign Out</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    openAuthModal();
                  }}
                  className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 border border-slate-300 text-slate-800 text-xs font-bold rounded-xl flex items-center justify-center gap-2 transition-colors"
                >
                  <LogIn className="w-4 h-4 text-emerald-700" />
                  <span>Sign In to Your Account</span>
                </button>
              )}
            </div>
          </div>
        )}

        {/* Auth Modal Component */}
        <AuthModal isOpen={isAuthModalOpen} onClose={closeAuthModal} />
      </header>
    </>
  );
};
