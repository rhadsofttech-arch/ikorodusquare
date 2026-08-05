import React, { useState } from 'react';
import {
  Search,
  Store,
  ShoppingBag,
  ShieldCheck,
  Star,
  MapPin,
  CheckCircle2,
  ArrowRight,
  TrendingUp,
  Sparkles,
  Award,
  PhoneCall,
  MessageSquare,
  Building2,
  PlusCircle,
  Clock,
  Briefcase,
  Zap,
  HelpCircle,
  ChevronDown,
  ChevronUp,
  X,
  CreditCard,
  Check,
  ExternalLink,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { IkoroduArea, PromotionOption } from '../types';
import { PROMOTION_OPTIONS, MANUAL_PAYMENT_INFO } from '../data/mockData';

export const HomeView: React.FC = () => {
  const {
    vendors,
    products,
    categories,
    searchQuery,
    setSearchQuery,
    selectedArea,
    setSelectedArea,
    setActiveTab,
    setSelectedVendorId,
    setSelectedProductId,
    trackVendorWhatsAppClick,
    toggleWishlist,
    wishlist,
  } = useApp();

  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [selectedPromoForModal, setSelectedPromoForModal] = useState<PromotionOption>(PROMOTION_OPTIONS[1]);

  const approvedVendors = vendors.filter((v) => v.status === 'approved');
  const featuredVendors = approvedVendors.filter((v) => v.isFeatured || v.isVerified);
  const featuredProducts = products.filter((p) => p.status === 'approved');

  const ikoroduAreas: IkoroduArea[] = [
    'Sabo',
    'Garage',
    'Agric',
    'Ebute',
    'Ayetoro',
    'Igbogbo',
    'Imota',
  ];

  const handleVendorClick = (id: string) => {
    setSelectedVendorId(id);
    setActiveTab('vendor-details');
  };

  const handleProductClick = (id: string) => {
    setSelectedProductId(id);
    setActiveTab('product-details');
  };

  const openPaymentModal = (promo: PromotionOption) => {
    setSelectedPromoForModal(promo);
    setPaymentModalOpen(true);
  };

  const faqs = [
    {
      question: 'How do I list my business on IkoroduSquare?',
      answer:
        'Registration is 100% free and takes under 3 minutes. Click "Register Business" on the top bar, fill in your business name, address in Sabo, Agric, or Garage, upload your CAC certificate (if available), and publish your product listings.',
    },
    {
      question: 'How does the FCMB bank transfer payment verification work for promotional plans?',
      answer:
        'Select your desired promotional package, send the payment via bank transfer to our official FCMB account (Account Name: Rhadsoft Tech, Account No: 9474918014), and click the "Message Admin via WhatsApp" button in the payment modal. Admin will verify your receipt and instantly activate your banner or sponsored slot.',
    },
    {
      question: 'Are there buyer commissions or extra fees when ordering via WhatsApp?',
      answer:
        'No! IkoroduSquare charges ₦0 commission on purchases. Buyers connect directly with verified SME vendors in Ikorodu via WhatsApp or phone call to discuss pricing, delivery, or in-person pickup.',
    },
  ];

  return (
    <div className="space-y-12 pb-12">
      {/* 1. Bento Grid Hero Layout */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Main Hero Bento Card (8 cols) */}
        <div className="lg:col-span-8 relative bg-gradient-to-br from-emerald-950 via-emerald-900 to-teal-950 text-white rounded-3xl p-6 sm:p-10 md:p-12 overflow-hidden shadow-lg border border-emerald-800/50 flex flex-col justify-between group">
          <div className="absolute top-0 right-0 w-96 h-96 bg-amber-400/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-teal-400/10 rounded-full blur-3xl -ml-20 -mb-20 pointer-events-none" />

          <div className="relative z-10 space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 bg-emerald-900/90 border border-emerald-700/80 rounded-full text-xs font-bold text-amber-300 shadow-xs backdrop-blur-md">
              <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
              <span>Ikorodu's #1 Digital Business Directory & Marketplace</span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-black font-display tracking-tight text-white leading-tight">
              Discover Local Businesses. <br />
              <span className="text-amber-400 underline decoration-amber-500/40 underline-offset-8">
                Connect & Shop Local.
              </span>
            </h1>

            <p className="text-xs sm:text-sm text-emerald-100/90 leading-relaxed max-w-2xl font-normal">
              Explore verified SMEs in Sabo, Agric, Garage, Ebute, Ayetoro, and Igbogbo. Compare prices, browse artisan products, and contact vendors directly on WhatsApp.
            </p>

            {/* Bento Search Box */}
            <div className="p-3 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 shadow-xl space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-2">
                <div className="sm:col-span-4 bg-white rounded-xl px-3 py-2 flex items-center gap-2 text-emerald-950 shadow-xs">
                  <MapPin className="w-4 h-4 text-emerald-700 shrink-0" />
                  <select
                    value={selectedArea}
                    onChange={(e) => setSelectedArea(e.target.value as any)}
                    className="w-full bg-transparent text-xs font-bold focus:outline-none cursor-pointer"
                  >
                    <option value="All">All Ikorodu Areas</option>
                    {ikoroduAreas.map((a) => (
                      <option key={a} value={a}>
                        {a}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="sm:col-span-8 bg-white rounded-xl px-3 py-2 flex items-center gap-2 text-emerald-950 shadow-xs">
                  <Search className="w-4 h-4 text-slate-400 shrink-0" />
                  <input
                    type="text"
                    placeholder="What are you looking for? (e.g., Bread, Phones, Lace, Solar)..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') setActiveTab('directory');
                    }}
                    className="w-full bg-transparent text-xs font-medium focus:outline-none placeholder-slate-400"
                  />
                  <button
                    onClick={() => setActiveTab('directory')}
                    className="px-4 py-2 bg-amber-400 hover:bg-amber-500 text-emerald-950 font-black text-xs rounded-lg transition-all shrink-0 shadow-xs"
                  >
                    Search
                  </button>
                </div>
              </div>

              {/* Popular Tag Pills */}
              <div className="flex items-center gap-2 text-xs text-emerald-200 overflow-x-auto pt-1">
                <span className="text-[11px] font-bold text-amber-300 whitespace-nowrap">Popular:</span>
                {['Butter Bread', 'Swiss Lace', 'iPhone 15', 'Solar Installation', 'Farm Fresh Eggs', 'Royal Sofa'].map((tag) => (
                  <button
                    key={tag}
                    onClick={() => {
                      setSearchQuery(tag);
                      setActiveTab('directory');
                    }}
                    className="px-2.5 py-1 bg-emerald-900/80 hover:bg-emerald-800 text-emerald-100 rounded-lg text-[11px] font-medium border border-emerald-700/60 whitespace-nowrap transition-colors"
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Side Bento Metric Tiles (4 cols) */}
        <div className="lg:col-span-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-4">
          <div className="p-6 bg-white/95 backdrop-blur-md rounded-3xl border border-slate-200/90 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 space-y-3 relative overflow-hidden group">
            <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
              <Building2 className="w-5 h-5 text-emerald-700" />
            </div>
            <div>
              <span className="text-3xl font-black text-slate-900 font-mono tracking-tight">150+</span>
              <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mt-0.5">Verified Vendors</h4>
              <p className="text-xs text-slate-500 mt-1">CAC registered storefronts across Sabo, Agric & Garage.</p>
            </div>
          </div>

          <div className="p-6 bg-gradient-to-br from-amber-400 to-amber-500 text-emerald-950 rounded-3xl shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 space-y-3 relative overflow-hidden group">
            <div className="w-10 h-10 rounded-2xl bg-emerald-950 text-amber-300 flex items-center justify-center font-bold">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <span className="text-3xl font-black font-mono tracking-tight">₦0 Fee</span>
              <h4 className="text-xs font-bold text-emerald-950 uppercase tracking-wider mt-0.5">Direct WhatsApp Sales</h4>
              <p className="text-xs text-emerald-900/90 font-medium mt-1">Zero buyer commission. Connect straight to vendor phones.</p>
            </div>
          </div>

          <div className="p-6 bg-white/95 backdrop-blur-md rounded-3xl border border-slate-200/90 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 space-y-3 hidden lg:block">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider">Fast Verification</span>
              <span className="text-[10px] font-bold px-2.5 py-0.5 bg-emerald-100 text-emerald-800 rounded-full">FCMB Verified</span>
            </div>
            <p className="text-xs text-slate-600 font-medium leading-relaxed">
              List your business in under 3 minutes & activate sponsored spots starting at ₦1,500.
            </p>
          </div>
        </div>
      </section>

      {/* 2. Business Categories Bento Grid Section */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-black text-slate-900 font-display">
              Browse Business Categories
            </h2>
            <p className="text-xs text-slate-500">Find specialized goods and services across Ikorodu</p>
          </div>
          <button
            onClick={() => setActiveTab('categories')}
            className="text-xs font-bold text-emerald-700 hover:text-emerald-900 flex items-center gap-1"
          >
            <span>All Categories</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {categories.map((cat, idx) => {
            const isFeaturedCard = idx === 0 || idx === 1;
            return (
              <div
                key={cat.id}
                onClick={() => {
                  setSearchQuery(cat.name);
                  setActiveTab('directory');
                }}
                className={`p-6 rounded-3xl border transition-all duration-300 cursor-pointer group hover:-translate-y-1 hover:shadow-xl flex flex-col justify-between ${
                  isFeaturedCard
                    ? 'bg-gradient-to-br from-emerald-950 via-emerald-900 to-teal-950 text-white border-emerald-800/80'
                    : 'bg-white/90 backdrop-blur-md text-slate-900 border-slate-200/90 hover:border-emerald-500/50 shadow-xs'
                }`}
              >
                <div>
                  <div
                    className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-4 transition-transform group-hover:scale-110 ${
                      isFeaturedCard
                        ? 'bg-amber-400 text-emerald-950 shadow-md'
                        : 'bg-emerald-50 text-emerald-700 group-hover:bg-emerald-800 group-hover:text-amber-300'
                    }`}
                  >
                    <Briefcase className="w-6 h-6" />
                  </div>
                  <h3
                    className={`text-base font-black tracking-tight ${
                      isFeaturedCard ? 'text-white' : 'text-slate-900 group-hover:text-emerald-700'
                    }`}
                  >
                    {cat.name}
                  </h3>
                  <p
                    className={`text-xs mt-1.5 line-clamp-2 leading-relaxed ${
                      isFeaturedCard ? 'text-emerald-200/90' : 'text-slate-500'
                    }`}
                  >
                    {cat.description}
                  </p>
                </div>

                <div className="pt-4 mt-2 flex items-center justify-between border-t border-slate-100/10 text-xs font-bold">
                  <span className={isFeaturedCard ? 'text-amber-300' : 'text-emerald-700'}>
                    Explore Storefronts
                  </span>
                  <ArrowRight
                    className={`w-4 h-4 transition-transform group-hover:translate-x-1 ${
                      isFeaturedCard ? 'text-amber-300' : 'text-emerald-700'
                    }`}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 3. Featured Verified Vendors Bento Cards */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-700" />
              <h2 className="text-xl font-black text-slate-900 font-display">
                Featured & Verified Storefronts
              </h2>
            </div>
            <p className="text-xs text-slate-500">Top-rated businesses ready to serve you in Ikorodu</p>
          </div>
          <button
            onClick={() => setActiveTab('directory')}
            className="text-xs font-bold text-emerald-700 hover:text-emerald-900 flex items-center gap-1"
          >
            <span>Explore Directory</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {featuredVendors.slice(0, 6).map((vendor) => (
            <div
              key={vendor.id}
              className="bg-white/95 backdrop-blur-md rounded-3xl border border-slate-200/90 overflow-hidden shadow-xs hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between group"
            >
              <div>
                {/* Cover & Badges */}
                <div className="relative h-44 overflow-hidden bg-slate-100">
                  <img
                    src={vendor.coverImageUrl}
                    alt={vendor.businessName}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

                  <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
                    {vendor.isVerified && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black bg-emerald-600 text-white shadow-xs">
                        <CheckCircle2 className="w-3 h-3 text-amber-300" /> Verified
                      </span>
                    )}
                    {vendor.isPremium && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black bg-amber-400 text-emerald-950 shadow-xs">
                        <Sparkles className="w-3 h-3" /> Premium
                      </span>
                    )}
                  </div>

                  <span className="absolute bottom-3 right-3 px-2.5 py-1 bg-black/60 backdrop-blur-md text-white text-[10px] font-bold rounded-xl flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-amber-400" /> {vendor.area}
                  </span>
                </div>

                {/* Body Content */}
                <div className="p-5 space-y-3">
                  <div className="flex items-start gap-3">
                    <img
                      src={vendor.logoUrl}
                      alt={vendor.businessName}
                      className="w-12 h-12 rounded-2xl object-cover border-2 border-white shadow-md -mt-8 relative z-10 bg-white"
                    />
                    <div className="flex-1 min-w-0">
                      <h3
                        onClick={() => handleVendorClick(vendor.id)}
                        className="font-black text-base text-slate-900 hover:text-emerald-700 cursor-pointer transition-colors truncate font-display"
                      >
                        {vendor.businessName}
                      </h3>
                      <p className="text-xs text-emerald-800 font-bold">{vendor.category}</p>
                    </div>
                  </div>

                  <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed font-normal">
                    {vendor.description}
                  </p>

                  <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-100">
                    <div className="flex items-center gap-1 text-amber-500 font-bold">
                      <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                      <span>{vendor.rating > 0 ? vendor.rating : 'New'}</span>
                      <span className="text-slate-400 font-normal">
                        ({vendor.reviewCount} reviews)
                      </span>
                    </div>

                    <span className="text-[11px] text-slate-500 font-medium">
                      {vendor.yearsInBusiness} yrs in business
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="p-4 bg-slate-50/90 border-t border-slate-100 flex items-center gap-2">
                <button
                  onClick={() => handleVendorClick(vendor.id)}
                  className="flex-1 py-2 text-xs font-bold text-emerald-950 bg-emerald-100/80 hover:bg-emerald-200/80 rounded-xl transition-colors text-center"
                >
                  View Storefront
                </button>
                <a
                  href={`https://wa.me/${vendor.whatsapp}?text=Hi%20${encodeURIComponent(
                    vendor.businessName
                  )},%20I%20found%20your%20store%20on%20IkoroduSquare.`}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => trackVendorWhatsAppClick(vendor.id)}
                  className="px-3.5 py-2 bg-emerald-800 hover:bg-emerald-900 text-white rounded-xl text-xs font-bold flex items-center gap-1 transition-colors shadow-xs"
                >
                  <MessageSquare className="w-3.5 h-3.5 text-amber-300" />
                  <span>WhatsApp</span>
                </a>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 4. Product Marketplace Highlights Bento Section */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-amber-500" />
              <h2 className="text-xl font-black text-slate-900 font-display">
                Local Products & Artisan Goods
              </h2>
            </div>
            <p className="text-xs text-slate-500">Buy directly from local vendors in Ikorodu</p>
          </div>
          <button
            onClick={() => setActiveTab('marketplace')}
            className="text-xs font-bold text-emerald-700 hover:text-emerald-900 flex items-center gap-1"
          >
            <span>Explore Marketplace</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {featuredProducts.slice(0, 8).map((product) => {
            const isSaved = wishlist.includes(product.id);
            return (
              <div
                key={product.id}
                className="bg-white/95 backdrop-blur-md rounded-3xl border border-slate-200/90 overflow-hidden shadow-xs hover:shadow-lg hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between group"
              >
                <div>
                  <div
                    className="relative h-44 bg-slate-100 overflow-hidden cursor-pointer"
                    onClick={() => handleProductClick(product.id)}
                  >
                    <img
                      src={product.images[0]}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleWishlist(product.id);
                      }}
                      className={`absolute top-2 right-2 p-1.5 rounded-full backdrop-blur-md transition-colors ${
                        isSaved
                          ? 'bg-amber-400 text-emerald-950'
                          : 'bg-white/80 text-slate-700 hover:text-red-500'
                      }`}
                    >
                      <Star className={`w-4 h-4 ${isSaved ? 'fill-emerald-950' : ''}`} />
                    </button>
                    <span className="absolute bottom-2 left-2 px-2 py-0.5 bg-black/60 backdrop-blur-md text-white text-[10px] font-bold rounded-lg">
                      {product.vendorArea}
                    </span>
                  </div>

                  <div className="p-3.5 space-y-1.5">
                    <span className="text-[10px] font-extrabold uppercase text-emerald-700 tracking-wider">
                      {product.category}
                    </span>
                    <h4
                      onClick={() => handleProductClick(product.id)}
                      className="text-xs font-bold text-slate-900 line-clamp-2 hover:text-emerald-700 cursor-pointer transition-colors"
                    >
                      {product.name}
                    </h4>

                    <p className="text-[11px] text-slate-500 truncate">By {product.vendorName}</p>

                    <div className="pt-1 flex items-baseline gap-2">
                      <span className="text-sm font-black text-emerald-950 font-mono">
                        ₦{product.price.toLocaleString()}
                      </span>
                      {product.salePrice && (
                        <span className="text-[10px] text-slate-400 line-through font-mono">
                          ₦{product.salePrice.toLocaleString()}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="p-3.5 pt-0">
                  <button
                    onClick={() => handleProductClick(product.id)}
                    className="w-full py-2 bg-emerald-800 hover:bg-emerald-900 text-white rounded-xl text-xs font-bold transition-colors shadow-xs"
                  >
                    View Details
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 5. Promotional Plans Bento Grid Section */}
      <section className="space-y-6">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-100 text-amber-900 text-xs font-bold rounded-full border border-amber-300">
            <Zap className="w-3.5 h-3.5 text-amber-600" /> Vendor Advertising & Promotions
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 font-display">
            Accelerate Business Growth in Ikorodu
          </h2>
          <p className="text-xs sm:text-sm text-slate-600">
            Choose a promotional plan below to boost your storefront, gain priority search placement, and get direct WhatsApp customer inquiries.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {PROMOTION_OPTIONS.map((option, idx) => {
            const isPopular = option.id === 'sponsored_vendor';
            return (
              <div
                key={option.id}
                className={`rounded-3xl p-6 border transition-all duration-300 flex flex-col justify-between hover:-translate-y-1 hover:shadow-xl relative ${
                  isPopular
                    ? 'bg-gradient-to-br from-emerald-950 via-emerald-900 to-teal-950 text-white border-amber-400/60 ring-2 ring-amber-400/30'
                    : 'bg-white/95 backdrop-blur-md text-slate-900 border-slate-200/90 shadow-xs'
                }`}
              >
                {isPopular && (
                  <span className="absolute -top-3 right-6 px-3 py-1 bg-amber-400 text-emerald-950 text-[10px] font-black uppercase tracking-wider rounded-full shadow-sm">
                    Most Popular
                  </span>
                )}

                <div className="space-y-4">
                  <div>
                    <h3 className={`text-lg font-black font-display ${isPopular ? 'text-white' : 'text-slate-900'}`}>
                      {option.title}
                    </h3>
                    <p className={`text-xs mt-1 ${isPopular ? 'text-emerald-200/90' : 'text-slate-500'}`}>
                      {option.description}
                    </p>
                  </div>

                  <div className="py-2 border-y border-slate-100/20">
                    <span className={`text-3xl font-black font-mono ${isPopular ? 'text-amber-400' : 'text-emerald-950'}`}>
                      ₦{option.priceNaira.toLocaleString()}
                    </span>
                    <span className={`text-xs ml-1 font-semibold ${isPopular ? 'text-emerald-200' : 'text-slate-500'}`}>
                      / {option.durationLabel}
                    </span>
                  </div>

                  <ul className="space-y-2 text-xs">
                    {option.features.map((feat, fIdx) => (
                      <li key={fIdx} className="flex items-center gap-2">
                        <Check className={`w-4 h-4 shrink-0 ${isPopular ? 'text-amber-400' : 'text-emerald-600'}`} />
                        <span className={isPopular ? 'text-emerald-100' : 'text-slate-700'}>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="pt-6 mt-4">
                  <button
                    onClick={() => openPaymentModal(option)}
                    className={`w-full py-3 px-4 rounded-xl text-xs font-black transition-all shadow-sm flex items-center justify-center gap-2 ${
                      isPopular
                        ? 'bg-amber-400 hover:bg-amber-500 text-emerald-950 shadow-md'
                        : 'bg-emerald-800 hover:bg-emerald-900 text-white'
                    }`}
                  >
                    <CreditCard className="w-4 h-4" />
                    <span>Pay for {option.title}</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 6. FAQ Section (3 FAQs) */}
      <section className="space-y-6">
        <div className="text-center max-w-xl mx-auto space-y-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-100 text-emerald-900 text-xs font-bold rounded-full">
            <HelpCircle className="w-3.5 h-3.5 text-emerald-700" /> Frequently Asked Questions
          </div>
          <h2 className="text-2xl font-black text-slate-900 font-display">
            Everything You Need to Know
          </h2>
          <p className="text-xs text-slate-500">
            Quick answers about listing your store and activating promotions on IkoroduSquare.
          </p>
        </div>

        <div className="max-w-3xl mx-auto space-y-3">
          {faqs.map((faq, index) => {
            const isOpen = openFaqIndex === index;
            return (
              <div
                key={index}
                className="bg-white/95 backdrop-blur-md rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden transition-all"
              >
                <button
                  onClick={() => setOpenFaqIndex(isOpen ? null : index)}
                  className="w-full p-5 text-left flex items-center justify-between gap-4 font-bold text-sm text-slate-900 hover:text-emerald-800 transition-colors"
                >
                  <span className="font-display">{faq.question}</span>
                  {isOpen ? (
                    <ChevronUp className="w-5 h-5 text-emerald-700 shrink-0" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-slate-400 shrink-0" />
                  )}
                </button>
                {isOpen && (
                  <div className="px-5 pb-5 pt-0 text-xs text-slate-600 leading-relaxed border-t border-slate-100/60 pt-3">
                    {faq.answer}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* 7. Promotional Plan Payment Pop-up Modal */}
      {paymentModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-5 border border-slate-200 relative overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-amber-400 text-emerald-950 flex items-center justify-center font-bold">
                  <CreditCard className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900 font-display leading-tight">
                    Promotional Payment Modal
                  </h3>
                  <p className="text-[11px] text-slate-500">Official FCMB Bank Transfer Verification</p>
                </div>
              </div>
              <button
                onClick={() => setPaymentModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Plan Selector */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700">Selected Promotional Package:</label>
              <select
                value={selectedPromoForModal.id}
                onChange={(e) => {
                  const p = PROMOTION_OPTIONS.find((opt) => opt.id === e.target.value);
                  if (p) setSelectedPromoForModal(p);
                }}
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
              >
                {PROMOTION_OPTIONS.map((opt) => (
                  <option key={opt.id} value={opt.id}>
                    {opt.title} — ₦{opt.priceNaira.toLocaleString()} ({opt.durationLabel})
                  </option>
                ))}
              </select>
            </div>

            {/* Selected Package Highlight Box */}
            <div className="p-4 bg-emerald-950 text-white rounded-2xl space-y-2 border border-emerald-800">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-amber-300">{selectedPromoForModal.title}</span>
                <span className="font-mono font-black text-amber-400 text-sm">
                  ₦{selectedPromoForModal.priceNaira.toLocaleString()}
                </span>
              </div>
              <p className="text-[11px] text-emerald-200/90 leading-relaxed">
                {selectedPromoForModal.description}
              </p>
            </div>

            {/* FCMB Bank Transfer Details Box */}
            <div className="p-4 bg-amber-50 border border-amber-300/80 rounded-2xl space-y-2 text-xs">
              <div className="flex items-center gap-1.5 font-bold text-amber-950">
                <ShieldCheck className="w-4 h-4 text-emerald-700 shrink-0" />
                <span>Bank Account Payment Information</span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-slate-900 pt-1">
                <div>
                  <span className="text-[10px] text-slate-500 block">Bank Name</span>
                  <strong className="font-bold text-slate-900">{MANUAL_PAYMENT_INFO.bankName}</strong>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 block">Account Name</span>
                  <strong className="font-bold text-slate-900">{MANUAL_PAYMENT_INFO.accountName}</strong>
                </div>
                <div className="col-span-2 pt-2 border-t border-amber-200">
                  <span className="text-[10px] text-slate-500 block">Account Number</span>
                  <strong className="text-xl font-mono font-black text-emerald-950 tracking-widest">
                    {MANUAL_PAYMENT_INFO.accountNumber}
                  </strong>
                </div>
              </div>
            </div>

            {/* Step-by-Step Instructions */}
            <div className="space-y-1.5 text-xs text-slate-600">
              <span className="font-bold text-slate-900">How to Complete Payment:</span>
              <ol className="list-decimal list-inside space-y-1 text-[11px]">
                <li>Transfer ₦{selectedPromoForModal.priceNaira.toLocaleString()} to the FCMB account above.</li>
                <li>Keep your transfer screenshot or Session Reference Number.</li>
                <li>Click the button below to message admin on WhatsApp to notify us!</li>
              </ol>
            </div>

            {/* Direct Admin WhatsApp Button */}
            <div className="pt-2">
              <a
                href={`https://wa.me/2348156655091?text=${encodeURIComponent(
                  `Hello Admin, I have made a bank transfer payment for the "${selectedPromoForModal.title}" package (₦${selectedPromoForModal.priceNaira.toLocaleString()}) on IkoroduSquare. Kindly verify and activate my promotion.`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-3.5 bg-emerald-700 hover:bg-emerald-800 text-white font-black text-xs rounded-2xl transition-all shadow-md flex items-center justify-center gap-2"
              >
                <MessageSquare className="w-4 h-4 text-amber-300" />
                <span>Message Admin via WhatsApp (08156655091)</span>
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
