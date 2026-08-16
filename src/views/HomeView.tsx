import React, { useState } from 'react';
import { safeFormatPrice, getProductCoverImage } from '../lib/productHelpers';
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
  Compass,
  ThumbsUp,
  Flame,
  BadgeCheck,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { IkoroduArea, PromotionOption } from '../types';
import { PROMOTION_OPTIONS, MANUAL_PAYMENT_INFO, IKORODU_AREAS } from '../data/mockData';
import { IkoroduMapExplorer } from '../components/IkoroduMapExplorer';
import { WhatsAppChatButton } from '../components/WhatsAppChatButton';
import { ProductSkeletonCard } from '../components/ProductSkeletonCard';
import { VendorSkeletonCard } from '../components/VendorSkeletonCard';
import { useSEO } from '../hooks/useSEO';
import { getCategoryIcon } from '../lib/categoryIcons';

export const HomeView: React.FC = () => {
  const {
    vendors,
    products,
    categories,
    reviews,
    promotionRequests,
    searchQuery,
    setSearchQuery,
    selectedArea,
    setSelectedArea,
    setSelectedCategory,
    setActiveTab,
    setSelectedVendorId,
    setSelectedProductId,
    navigateToVendor,
    trackVendorWhatsAppClick,
    toggleWishlist,
    wishlist,
    isLoadingData,
    isCriticalDataLoading,
    criticalDataError,
    refreshCriticalData,
  } = useApp();

  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [selectedPromoForModal, setSelectedPromoForModal] = useState<PromotionOption>(PROMOTION_OPTIONS[1]);
  const [recommendationFilter, setRecommendationFilter] = useState<'all' | 'under50k' | 'topRated' | 'artisan'>('all');
  const [showPredictiveDropdown, setShowPredictiveDropdown] = useState(true);

  useSEO({
    title: 'IkoroduSquare | Local Business Directory & Marketplace in Ikorodu',
    description: 'Discover verified local businesses, products and services across Ikorodu. Shop local, find businesses and connect directly with vendors on IkoroduSquare.',
    keywords: 'Ikorodu businesses, Ikorodu marketplace, Sabo Ikorodu, Ebute Ikorodu, Agric Ikorodu, local vendors Lagos, buy local Ikorodu, Ikorodu business directory',
    ogImage: 'https://www.ikorodusquare.com.ng/og-image.jpg',
    ogType: 'website',
    canonicalUrl: 'https://www.ikorodusquare.com.ng/',
    robots: 'index, follow',
    jsonLd: [
      {
        '@context': 'https://schema.org',
        '@type': 'Organization',
        name: 'IkoroduSquare',
        url: 'https://www.ikorodusquare.com.ng/',
        logo: 'https://www.ikorodusquare.com.ng/og-image.jpg',
        description: 'Local Business Directory & Marketplace in Ikorodu, Lagos State.',
      },
      {
        '@context': 'https://schema.org',
        '@type': 'WebSite',
        name: 'IkoroduSquare',
        url: 'https://www.ikorodusquare.com.ng/',
        potentialAction: {
          '@type': 'SearchAction',
          target: 'https://www.ikorodusquare.com.ng/marketplace?q={search_term_string}',
          'query-input': 'required name=search_term_string',
        },
      },
    ],
  });

  // Filter Active Admin-Approved Promotions (Not Expired)
  const now = new Date();
  const activePromos = promotionRequests.filter((pr) => {
    if (pr.status !== 'approved' && pr.status !== 'active') return false;
    const start = pr.startDate ? new Date(pr.startDate) : (pr.approvedAt ? new Date(pr.approvedAt) : new Date(pr.requestedAt));
    const expires = pr.expiresAt ? new Date(pr.expiresAt) : null;
    if (new Date(start) > now) return false;
    if (expires && new Date(expires) <= now) return false;
    return true;
  });

  console.log('[PROMOTION QUERY] Total promotion requests in context:', promotionRequests.length);
  console.log('[ACTIVE PROMOTIONS] Active promotions count:', activePromos.length, activePromos);

  // 1. Homepage Banner Slot
  const activeBannerPromo = activePromos.find((pr) => pr.assignedSlot === 'homepage_banner');
  if (activeBannerPromo) {
    console.log('[HOMEPAGE BANNER MATCH]', activeBannerPromo);
  }

  // 2. Sponsored Vendor Slot
  const sponsoredPromoRequests = activePromos.filter((pr) => pr.assignedSlot === 'sponsored_vendor');
  const sponsoredVendorIds = sponsoredPromoRequests.map((pr) => pr.assignedTargetId || pr.vendorId);
  const approvedVendors = vendors.filter((v) => v.status === 'approved');
  const activeSponsoredVendors = approvedVendors.filter((v) => sponsoredVendorIds.includes(v.id));
  console.log('[SPONSORED VENDOR MATCH] Active sponsored vendors:', activeSponsoredVendors);

  // 3. Featured Product Slot
  const featuredPromoRequests = activePromos.filter((pr) => pr.assignedSlot === 'featured_product');
  const featuredProductIds = featuredPromoRequests.map((pr) => pr.assignedTargetId || pr.productId || pr.vendorId);
  console.log('[FEATURED PRODUCT MATCH] Active featured product IDs:', featuredProductIds);

  // 4. Category Top Spot
  const categoryTopPromos = activePromos.filter((pr) => pr.assignedSlot === 'category_top');
  const categoryTopVendorIds = categoryTopPromos.map((pr) => pr.assignedTargetId || pr.vendorId);
  console.log('[CATEGORY TOP MATCH] Active category top spot promos:', categoryTopPromos);

  // All approved products sorted so assigned featured products appear FIRST
  const approvedProducts = products.filter((p) => p.status === 'approved');
  const featuredProducts = [...approvedProducts].sort((a, b) => {
    const aFeat = featuredProductIds.includes(a.id);
    const bFeat = featuredProductIds.includes(b.id);
    if (aFeat && !bFeat) return -1;
    if (!aFeat && bFeat) return 1;
    return 0;
  });

  // Sponsored / Verified Vendors list for directory preview
  const sponsoredVendors = approvedVendors.filter(
    (v) => sponsoredVendorIds.includes(v.id) || categoryTopVendorIds.includes(v.id) || v.isFeatured || v.isVerified
  );

  const ikoroduAreas: IkoroduArea[] = IKORODU_AREAS;

  // Predictive Search Autocomplete Logic
  const matchingProducts = searchQuery.trim()
    ? featuredProducts.filter(
        (p) =>
          p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.vendorArea.toLowerCase().includes(searchQuery.toLowerCase())
      ).slice(0, 4)
    : [];

  const matchingVendors = searchQuery.trim()
    ? approvedVendors.filter(
        (v) =>
          v.businessName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          v.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
          v.area.toLowerCase().includes(searchQuery.toLowerCase())
      ).slice(0, 3)
    : [];

  const matchingCategories = searchQuery.trim()
    ? categories.filter((c) => c.name.toLowerCase().includes(searchQuery.toLowerCase())).slice(0, 3)
    : [];

  const hasSearchResults = matchingProducts.length > 0 || matchingVendors.length > 0 || matchingCategories.length > 0;

  // Interactive Area Explorer Districts
  const ikoroduDistricts = [
    {
      id: 'sabo',
      name: 'Sabo Central Market & Commercial Axis',
      areaCode: 'Sabo' as IkoroduArea,
      tag: 'Commercial & Fashion Hub',
      description: 'The heartbeat of commerce in Ikorodu. Known for Swiss lace, baking supplies, computer village, and fresh foodstuffs.',
      landmarks: ['Sabo Market Square', 'Ikorodu Town Hall', 'Ayangburen Palace'],
    },
    {
      id: 'agric',
      name: 'Agric & BRT Bus Terminal Axis',
      areaCode: 'Agric' as IkoroduArea,
      tag: 'Tech, Solar & Transport Hub',
      description: 'Major transit and tech hub. High demand for solar power installations, mobile gadgets, and courier services.',
      landmarks: ['Agric BRT Bus Depot', 'Owutu Road', 'Ikorodu Expressway'],
    },
    {
      id: 'garage',
      name: 'Sagamu Road & Garage Roundabout',
      areaCode: 'Garage' as IkoroduArea,
      tag: 'Hardware & Auto Spare Parts',
      description: 'Key industrial junction specializing in auto repairs, heavy machinery, building hardware, and royal furniture workshops.',
      landmarks: ['Garage Roundabout', 'Sagamu Road', 'Ota-Ona Junction'],
    },
    {
      id: 'ebute',
      name: 'Ebute Jetty & Water Front',
      areaCode: 'Ebute' as IkoroduArea,
      tag: 'Seafood, Marine & Hospitality',
      description: 'Scenic coastal district famous for fresh fish markets, boat transport terminals to Lekki/Victoria Island, and waterfront dining.',
      landmarks: ['Ebute Ferry Terminal', 'Ikorodu Water Front', 'Soliu Road'],
    },
    {
      id: 'ayetoro',
      name: 'Ayetoro & Ita-Elewa District',
      areaCode: 'Ayetoro' as IkoroduArea,
      tag: 'Professional Services & Tailoring',
      description: 'Civic center featuring accounting firms, printing presses, legal chambers, bespoke tailors, and event centers.',
      landmarks: ['Ita-Elewa Roundabout', 'Ayetoro Street', 'Ikorodu General Hospital'],
    },
    {
      id: 'igbogbo',
      name: 'Igbogbo & Bayeku Kingdom',
      areaCode: 'Igbogbo' as IkoroduArea,
      tag: 'Real Estate & Craftsmanship',
      description: 'Rapidly growing residential and industrial zone for block making, poultry farming, interior design, and real estate.',
      landmarks: ['Adeboruwa Palace', 'Bayeku Jetty', 'Igbogbo Stadium'],
    },
    {
      id: 'imota',
      name: 'Imota Agricultural Belt',
      areaCode: 'Imota' as IkoroduArea,
      tag: 'Agro-Processing & Wholesale',
      description: 'Home of the Lagos Rice Mill complex. Major producer of cassava flour, palm oil, fresh farm produce, and wholesale grain.',
      landmarks: ['Imota Rice Mill', 'Imota Market', 'Itokin Road Axis'],
    },
  ];

  // Filtered recommendations
  const recommendedProducts = featuredProducts.filter((p) => {
    if (recommendationFilter === 'under50k') return p.price <= 50000;
    if (recommendationFilter === 'topRated') return p.rating >= 4.8;
    if (recommendationFilter === 'artisan') return p.category.includes('Fashion') || p.category.includes('Furniture') || p.category.includes('Food');
    return true;
  });

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

  // Generate Live Activity Feed items from real database state
  const getRelativeTime = (isoString?: string) => {
    if (!isoString) return 'Recently';
    const time = new Date(isoString).getTime();
    if (isNaN(time)) return 'Recently';
    const diffMs = Date.now() - time;
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} min${diffMins > 1 ? 's' : ''} ago`;
    if (diffHours < 24) return `${diffHours} hr${diffHours > 1 ? 's' : ''} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    return new Date(isoString).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
  };

  const liveActivities: {
    id: string;
    title: string;
    subtitle: string;
    location: string;
    badgeIcon: React.ReactNode;
    badgeLabel: string;
    timeAgo: string;
    timestamp: number;
    onClick: () => void;
  }[] = [];

  // 1. Approved Vendors
  approvedVendors.forEach((v) => {
    const t = new Date(v.createdAt).getTime();
    liveActivities.push({
      id: `act-v-${v.id}`,
      title: `${v.businessName} just joined IkoroduSquare`,
      subtitle: `${v.category} • ${v.subcategory || 'Local Store'}`,
      location: `${v.area}, Ikorodu`,
      badgeIcon: <Store className="w-3 h-3 text-amber-300 shrink-0" />,
      badgeLabel: 'New Business',
      timeAgo: getRelativeTime(v.createdAt),
      timestamp: isNaN(t) ? Date.now() - 3600000 : t,
      onClick: () => {
        setSelectedVendorId(v.id);
        setActiveTab('vendor-details');
      },
    });

    if (v.isVerified) {
      liveActivities.push({
        id: `act-ver-${v.id}`,
        title: `${v.businessName} verified on IkoroduSquare`,
        subtitle: `Official badge granted • ${v.category}`,
        location: `${v.area}, Ikorodu`,
        badgeIcon: <BadgeCheck className="w-3 h-3 text-amber-300 shrink-0" />,
        badgeLabel: 'Verified Store',
        timeAgo: getRelativeTime(v.createdAt),
        timestamp: isNaN(t) ? Date.now() - 7200000 : t + 500,
        onClick: () => {
          setSelectedVendorId(v.id);
          setActiveTab('vendor-details');
        },
      });
    }
  });

  // 2. Approved Products
  products
    .filter((p) => p.status === 'approved')
    .forEach((p) => {
      const t = new Date(p.createdAt).getTime();
      liveActivities.push({
        id: `act-p-${p.id}`,
        title: `New product added by ${p.vendorName}`,
        subtitle: `${p.name} • ₦${p.price.toLocaleString()}`,
        location: `${p.vendorArea}, Ikorodu`,
        badgeIcon: <ShoppingBag className="w-3 h-3 text-amber-300 shrink-0" />,
        badgeLabel: 'New Product',
        timeAgo: getRelativeTime(p.createdAt),
        timestamp: isNaN(t) ? Date.now() - 1800000 : t,
        onClick: () => {
          setSelectedProductId(p.id);
          setActiveTab('product-details');
        },
      });

      if (p.isFeatured) {
        liveActivities.push({
          id: `act-feat-${p.id}`,
          title: `Product is trending: ${p.name}`,
          subtitle: `By ${p.vendorName} • ₦${p.price.toLocaleString()}`,
          location: `${p.vendorArea}, Ikorodu`,
          badgeIcon: <Flame className="w-3 h-3 text-amber-300 shrink-0" />,
          badgeLabel: 'Trending Item',
          timeAgo: getRelativeTime(p.createdAt),
          timestamp: isNaN(t) ? Date.now() - 5400000 : t + 1000,
          onClick: () => {
            setSelectedProductId(p.id);
            setActiveTab('product-details');
          },
        });
      }
    });

  // 3. Approved Reviews
  (reviews || [])
    .filter((r) => r.status === 'approved' || !r.status)
    .forEach((r) => {
      const targetVendor = vendors.find((v) => v.id === r.vendorId);
      if (!targetVendor) return;
      const t = new Date(r.createdAt).getTime();
      liveActivities.push({
        id: `act-r-${r.id}`,
        title: `${targetVendor.businessName} received a new review`,
        subtitle: `Rating: ${r.rating}/5 — "${r.comment.length > 50 ? r.comment.substring(0, 50) + '...' : r.comment}"`,
        location: `${targetVendor.area}, Ikorodu`,
        badgeIcon: <Star className="w-3 h-3 text-amber-300 fill-amber-300 shrink-0" />,
        badgeLabel: 'New Review',
        timeAgo: getRelativeTime(r.createdAt),
        timestamp: isNaN(t) ? Date.now() - 86400000 : t,
        onClick: () => {
          setSelectedVendorId(targetVendor.id);
          setActiveTab('vendor-details');
        },
      });
    });

  liveActivities.sort((a, b) => b.timestamp - a.timestamp);
  const recentLiveActivities = liveActivities.slice(0, 15);

  return (
    <div className="space-y-16 pb-16">
      {/* 1. Sleek & Compact Hero Banner (Full-Width, No Side Cards) */}
      <section className="relative bg-gradient-to-br from-emerald-950 via-emerald-900 to-teal-950 text-white rounded-2xl sm:rounded-3xl p-4 sm:p-8 md:p-9 overflow-hidden shadow-xl border border-emerald-800/50 flex flex-col justify-between backdrop-blur-md w-full max-w-full">
        <div className="absolute top-0 right-0 w-80 h-80 bg-amber-400/10 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-72 h-72 bg-teal-400/10 rounded-full blur-3xl -ml-16 -mb-16 pointer-events-none" />

        <div className="relative z-10 space-y-4 sm:space-y-5 max-w-4xl mx-auto w-full text-center sm:text-left">
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-1.5 sm:gap-2 max-w-full">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-900/90 border border-emerald-700/80 rounded-full text-[11px] sm:text-xs font-bold text-amber-300 shadow-xs backdrop-blur-md max-w-full">
              <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-pulse shrink-0" />
              <span className="truncate">Ikorodu's Digital Market Square</span>
            </div>
            <span className="text-[10px] sm:text-[11px] font-semibold text-emerald-200 bg-emerald-800/60 px-2.5 py-1 rounded-full border border-emerald-700/50 whitespace-nowrap">
              {ikoroduAreas.length} District Communities
            </span>
          </div>

          <h1 className="text-xl sm:text-4xl lg:text-5xl font-black font-display tracking-tight text-white leading-tight break-words">
            Ikorodu’s Hyperlocal Directory & Marketplace
          </h1>

          <p className="text-xs sm:text-sm text-emerald-100/95 leading-relaxed font-normal max-w-3xl">
            Find local businesses, shop authentic products, and connect directly on WhatsApp with verified vendors across all {ikoroduAreas.length} areas of Ikorodu. Zero buyer commission.
          </p>

          {/* Prominent Compact Search Box with Predictive Autocomplete */}
          <div className="relative pt-1 max-w-3xl w-full">
            <div className="p-2 sm:p-2.5 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 shadow-xl space-y-2 w-full">
              <div className="flex flex-col sm:grid sm:grid-cols-12 gap-2 w-full">
                <div className="sm:col-span-4 bg-white rounded-xl px-2.5 py-2 flex items-center gap-2 text-emerald-950 shadow-xs w-full">
                  <MapPin className="w-4 h-4 text-emerald-700 shrink-0" />
                  <select
                    value={selectedArea}
                    onChange={(e) => setSelectedArea(e.target.value as any)}
                    className="w-full bg-transparent text-xs font-bold focus:outline-none cursor-pointer text-slate-900 min-w-0"
                  >
                    <option value="All">All Ikorodu Areas</option>
                    {ikoroduAreas.map((a) => (
                      <option key={a} value={a}>
                        {a}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="sm:col-span-8 bg-white rounded-xl px-2.5 py-1.5 flex items-center gap-1.5 sm:gap-2 text-emerald-950 shadow-xs relative w-full min-w-0">
                  <Search className="w-4 h-4 text-slate-400 shrink-0" />
                  <input
                    type="text"
                    placeholder="Search products, solar, lace, phones, bakery..."
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      setShowPredictiveDropdown(true);
                    }}
                    onFocus={() => setShowPredictiveDropdown(true)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        setShowPredictiveDropdown(false);
                        setActiveTab('marketplace');
                      }
                    }}
                    className="w-full min-w-0 bg-transparent text-xs sm:text-sm font-medium focus:outline-none placeholder-slate-400 py-1"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="p-1 text-slate-400 hover:text-slate-600 rounded-full shrink-0"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                  <button
                    onClick={() => {
                      setShowPredictiveDropdown(false);
                      setActiveTab('marketplace');
                    }}
                    className="px-3 sm:px-4 py-2 bg-amber-400 hover:bg-amber-300 text-emerald-950 font-black text-xs rounded-lg transition-colors shrink-0 shadow-sm whitespace-nowrap"
                  >
                    Search
                  </button>
                </div>
              </div>

              {/* Quick Filter Tag Pills */}
              <div className="flex items-center gap-1.5 text-xs text-emerald-200 overflow-x-auto scrollbar-none pt-0.5 w-full max-w-full pb-1">
                <span className="text-[10px] sm:text-[11px] font-bold text-amber-300 whitespace-nowrap shrink-0">Popular:</span>
                {['Butter Bread', 'Swiss Lace', 'iPhone 15', 'Solar Inverter', 'Farm Fresh Eggs', 'Royal Sofa'].map((tag) => (
                  <button
                    key={tag}
                    onClick={() => {
                      setSearchQuery(tag);
                      setShowPredictiveDropdown(false);
                      setActiveTab('marketplace');
                    }}
                    className="px-2 sm:px-2.5 py-0.5 bg-emerald-900/80 hover:bg-emerald-800 text-emerald-100 rounded-lg text-[10px] sm:text-[11px] font-medium border border-emerald-700/60 whitespace-nowrap transition-colors shrink-0"
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>

            {/* PREDICTIVE SEARCH AUTOCOMPLETE DROPDOWN */}
            {searchQuery.trim() !== '' && showPredictiveDropdown && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white text-slate-900 rounded-2xl shadow-2xl border border-slate-200 overflow-hidden z-50 max-h-96 overflow-y-auto divide-y divide-slate-100 w-full max-w-full">
                {!hasSearchResults ? (
                  <div className="p-4 text-center text-xs text-slate-500">
                    No exact matches found for "<span className="font-bold text-slate-800">{searchQuery}</span>". Try searching in all areas.
                  </div>
                ) : (
                  <>
                    {/* Matching Products */}
                    {matchingProducts.length > 0 && (
                      <div className="p-3 bg-slate-50/50">
                        <div className="flex items-center justify-between text-[10px] font-black uppercase text-slate-400 tracking-wider mb-2 px-1">
                          <span className="flex items-center gap-1"><ShoppingBag className="w-3 h-3 text-emerald-600" /> Matching Products</span>
                          <span>{matchingProducts.length} items</span>
                        </div>
                        <div className="space-y-1">
                          {matchingProducts.map((p) => (
                            <div
                              key={p.id}
                              onClick={() => {
                                setShowPredictiveDropdown(false);
                                handleProductClick(p.id);
                              }}
                              className="flex items-center gap-3 p-2 hover:bg-emerald-50 rounded-xl cursor-pointer transition-colors"
                            >
                              <img src={getProductCoverImage(p)} alt={p.name || 'Product'} className="w-10 h-10 rounded-lg object-cover shrink-0 border border-slate-200" />
                              <div className="flex-1 min-w-0">
                                <h5 className="text-xs font-bold text-slate-900 truncate">{p.name}</h5>
                                <div className="flex items-center gap-2 text-[10px] text-slate-500">
                                  <span>{p.vendorName}</span>
                                  <span>•</span>
                                  <span className="text-emerald-700 font-semibold">{p.vendorArea}</span>
                                </div>
                              </div>
                              <span className="text-xs font-black text-emerald-950 font-mono shrink-0">₦{safeFormatPrice(p.price)}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Matching Businesses */}
                    {matchingVendors.length > 0 && (
                      <div className="p-3">
                        <div className="flex items-center justify-between text-[10px] font-black uppercase text-slate-400 tracking-wider mb-2 px-1">
                          <span className="flex items-center gap-1"><Store className="w-3 h-3 text-amber-500" /> Verified Storefronts</span>
                          <span>{matchingVendors.length} vendors</span>
                        </div>
                        <div className="space-y-1">
                          {matchingVendors.map((v) => (
                            <div
                              key={v.id}
                              onClick={() => {
                                setShowPredictiveDropdown(false);
                                handleVendorClick(v.id);
                              }}
                              className="flex items-center justify-between p-2 hover:bg-amber-50/60 rounded-xl cursor-pointer transition-colors"
                            >
                              <div className="flex items-center gap-2.5 min-w-0">
                                <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center text-xs shrink-0">
                                  {v.businessName.charAt(0)}
                                </div>
                                <div className="truncate">
                                  <div className="flex items-center gap-1">
                                    <h5 className="text-xs font-bold text-slate-900 truncate">{v.businessName}</h5>
                                    {v.isVerified && <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />}
                                  </div>
                                  <p className="text-[10px] text-slate-500 truncate">{v.category} • {v.area}</p>
                                </div>
                              </div>
                              <span className="text-[10px] font-bold px-2 py-0.5 bg-emerald-100 text-emerald-900 rounded-full shrink-0">
                                View Store
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Matching Categories */}
                    {matchingCategories.length > 0 && (
                      <div className="p-3 bg-slate-50/50">
                        <div className="text-[10px] font-black uppercase text-slate-400 tracking-wider mb-2 px-1">
                          Categories
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {matchingCategories.map((c) => (
                            <button
                              key={c.id}
                              onClick={() => {
                                setSearchQuery(c.name);
                                setShowPredictiveDropdown(false);
                                setActiveTab('marketplace');
                              }}
                              className="px-3 py-1 bg-white hover:bg-emerald-100 text-slate-800 hover:text-emerald-950 text-xs font-semibold rounded-lg border border-slate-200 shadow-2xs transition-colors"
                            >
                              {c.name} ({c.vendorCount} stores)
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Bottom Action Footer */}
                    <div
                      className="p-2.5 bg-slate-100 text-center text-xs font-bold text-emerald-800 hover:bg-emerald-100 transition-colors cursor-pointer"
                      onClick={() => {
                        setShowPredictiveDropdown(false);
                        setActiveTab('marketplace');
                      }}
                    >
                      View all marketplace results for "{searchQuery}" →
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* 2. Live on IkoroduSquare - Horizontal Activity Feed */}
      <section className="bg-gradient-to-r from-emerald-950 via-emerald-900 to-teal-950 text-white rounded-2xl sm:rounded-3xl p-5 sm:p-7 shadow-xl overflow-hidden relative border border-emerald-800/60">
        <div className="absolute -top-24 -right-24 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 border-b border-emerald-800/60 pb-3.5">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-400"></span>
                </span>
                <span className="text-[11px] font-black text-amber-300 uppercase tracking-widest font-mono">
                  Live Activity Feed
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-white font-display">
                Live on IkoroduSquare
              </h2>
              <p className="text-xs sm:text-sm text-emerald-200/90 font-medium">
                See what's happening across local businesses right now.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setActiveTab('directory')}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-300 hover:text-amber-200 transition-colors self-start sm:self-auto group"
            >
              <span>View all activity →</span>
            </button>
          </div>

          {/* Horizontally Scrollable Activity Row */}
          {isCriticalDataLoading || isLoadingData ? (
            <div className="flex items-stretch gap-3.5 overflow-x-auto pb-3 pt-1 -mx-1 px-1">
              {Array.from({ length: 4 }).map((_, idx) => (
                <div
                  key={idx}
                  className="w-72 sm:w-80 shrink-0 bg-emerald-900/50 border border-emerald-700/40 rounded-2xl p-4 flex flex-col justify-between space-y-3 animate-pulse"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="h-4 bg-emerald-800/80 rounded-full w-24" />
                      <div className="h-3 bg-emerald-800/60 rounded w-16" />
                    </div>
                    <div className="h-4 bg-emerald-800/80 rounded w-3/4" />
                    <div className="h-3 bg-emerald-800/50 rounded w-full" />
                  </div>
                  <div className="pt-2 border-t border-emerald-800/40 flex justify-between">
                    <div className="h-3 bg-emerald-800/60 rounded w-20" />
                    <div className="h-3 bg-amber-400/60 rounded w-12" />
                  </div>
                </div>
              ))}
            </div>
          ) : recentLiveActivities.length > 0 ? (
            <div className="flex items-stretch gap-3.5 overflow-x-auto pb-3 pt-1 scrollbar-thin scrollbar-thumb-emerald-700 scrollbar-track-emerald-900/50 -mx-1 px-1">
              {recentLiveActivities.map((act) => (
                <div
                  key={act.id}
                  onClick={act.onClick}
                  className="w-72 sm:w-80 shrink-0 bg-emerald-900/70 hover:bg-emerald-800/90 border border-emerald-700/60 rounded-2xl p-4 cursor-pointer transition-all hover:scale-[1.02] hover:shadow-xl flex flex-col justify-between group"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-950/90 border border-emerald-600/50 font-extrabold text-amber-300 text-[10px]">
                        <span>{act.badgeIcon}</span>
                        <span>{act.badgeLabel}</span>
                      </span>
                      <span className="text-[10px] font-mono text-emerald-300/90 font-semibold flex items-center gap-1">
                        <Clock className="w-3 h-3 text-emerald-400 shrink-0" />
                        {act.timeAgo}
                      </span>
                    </div>

                    <div>
                      <h3 className="font-extrabold text-white text-xs sm:text-sm line-clamp-2 group-hover:text-amber-300 transition-colors leading-snug">
                        {act.title}
                      </h3>
                      <p className="text-[11px] text-emerald-200/80 line-clamp-2 mt-1 font-medium">
                        {act.subtitle}
                      </p>
                    </div>
                  </div>

                  <div className="pt-2.5 mt-3 border-t border-emerald-800/60 flex items-center justify-between text-[11px] text-emerald-300 font-semibold">
                    <span className="flex items-center gap-1 truncate max-w-[80%]">
                      <MapPin className="w-3 h-3 text-emerald-400 shrink-0" />
                      <span className="truncate">{act.location}</span>
                    </span>
                    <span className="text-amber-300 group-hover:translate-x-0.5 transition-transform font-black text-[10px] shrink-0">
                      View →
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-8 text-center bg-emerald-900/30 rounded-2xl border border-emerald-800/40 p-6">
              <p className="text-xs text-emerald-200 font-medium">No recent live activity recorded yet.</p>
            </div>
          )}
        </div>
      </section>

      {/* Dynamic Admin-Assigned Homepage Banner Slot */}
      {activeBannerPromo && (
        <section className="relative rounded-3xl overflow-hidden shadow-xl border-2 border-amber-400 bg-emerald-950 text-white p-6 sm:p-8">
          <img
            src={activeBannerPromo.bannerImageUrl || 'https://images.unsplash.com/photo-1555421689-491a97ff2040?auto=format&fit=crop&q=80&w=1200'}
            alt="Promoted Banner"
            className="absolute inset-0 w-full h-full object-cover opacity-30"
          />
          <div className="relative z-10 space-y-3 max-w-2xl">
            <span className="px-3 py-1 bg-amber-400 text-emerald-950 rounded-full font-black text-[10px] uppercase tracking-wider inline-flex items-center gap-1.5 shadow-sm">
              <Sparkles className="w-3 h-3 text-emerald-950 fill-emerald-950" />
              <span>FEATURED HOMEPAGE BANNER</span>
            </span>
            <h2 className="text-xl sm:text-3xl font-black font-display text-white leading-tight">
              {activeBannerPromo.bannerHeading || `Promoted Merchant: ${activeBannerPromo.vendorName}`}
            </h2>
            <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">
              {activeBannerPromo.bannerSubtext || 'Discover verified local deals and premium SME goods directly on IkoroduSquare.'}
            </p>
            <button
              onClick={() => {
                const targetVendor = vendors.find((v) => v.id === activeBannerPromo.vendorId);
                if (targetVendor) {
                  navigateToVendor(targetVendor);
                } else {
                  setActiveTab('marketplace');
                }
              }}
              className="px-6 py-3 bg-amber-400 hover:bg-amber-300 text-emerald-950 font-black text-xs sm:text-sm rounded-xl shadow-lg transition-all inline-flex items-center gap-2 cursor-pointer hover:scale-105 transform"
            >
              <span>{activeBannerPromo.ctaText || 'Visit Promoted Storefront'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </section>
      )}

      {/* DEDICATED SPONSORED VENDORS SECTION */}
      {activeSponsoredVendors.length > 0 && (
        <section className="space-y-4 bg-gradient-to-r from-amber-500/10 via-amber-400/5 to-emerald-950/10 p-5 sm:p-8 rounded-3xl border-2 border-amber-400 shadow-xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <Sparkles className="w-6 h-6 text-amber-500 animate-pulse" />
                <h2 className="text-2xl font-black text-slate-900 font-display">
                  Featured Sponsored Vendors
                </h2>
              </div>
              <p className="text-xs text-slate-600 font-medium mt-0.5">
                Top-tier verified merchants with exclusive homepage spotlight in Ikorodu
              </p>
            </div>
            <span className="px-3 py-1 bg-amber-400 text-emerald-950 text-xs font-black rounded-full uppercase tracking-wider self-start sm:self-auto shadow-xs inline-flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-emerald-950 fill-emerald-950" />
              <span>OFFICIAL SPONSORED SPOTLIGHT</span>
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {activeSponsoredVendors.map((vendor) => (
              <div
                key={vendor.id}
                className="bg-white rounded-3xl border-2 border-amber-400 overflow-hidden shadow-md hover:shadow-xl transition-all flex flex-col justify-between group relative"
              >
                <div className="absolute top-3 left-3 z-20 flex items-center gap-1.5">
                  <span className="px-3 py-1 bg-amber-400 text-emerald-950 font-black text-[11px] rounded-full uppercase tracking-wider shadow-md flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5 text-emerald-950 fill-emerald-950" /> SPONSORED
                  </span>
                  {vendor.isVerified && (
                    <span className="px-2.5 py-1 bg-emerald-700 text-white font-bold text-[10px] rounded-full flex items-center gap-1 shadow-sm">
                      <CheckCircle2 className="w-3 h-3 text-amber-300" /> Verified
                    </span>
                  )}
                </div>

                <div>
                  <div className="relative h-44 overflow-hidden bg-slate-900 cursor-pointer" onClick={() => navigateToVendor(vendor)}>
                    <img
                      src={vendor.coverImageUrl || vendor.logoUrl}
                      alt={vendor.businessName}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                    <span className="absolute bottom-3 right-3 px-2.5 py-1 bg-black/60 backdrop-blur-md text-white text-[10px] font-bold rounded-xl flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-amber-400" /> {vendor.area}
                    </span>
                  </div>

                  <div className="p-5 space-y-3">
                    <div className="flex items-start gap-3">
                      <img
                        src={vendor.logoUrl}
                        alt={vendor.businessName}
                        className="w-14 h-14 rounded-2xl object-cover border-2 border-amber-400 shadow-md -mt-10 relative z-10 bg-white"
                      />
                      <div className="flex-1 min-w-0">
                        <h3
                          onClick={() => navigateToVendor(vendor)}
                          className="font-black text-base sm:text-lg text-slate-900 hover:text-emerald-700 cursor-pointer transition-colors truncate font-display"
                        >
                          {vendor.businessName}
                        </h3>
                        <p className="text-xs text-amber-600 font-extrabold uppercase tracking-wide">
                          {vendor.category}
                        </p>
                      </div>
                    </div>

                    <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed font-normal">
                      {vendor.description}
                    </p>

                    <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-100">
                      <div className="flex items-center gap-1 text-amber-500 font-bold">
                        <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                        <span>{vendor.rating > 0 ? vendor.rating : '5.0'}</span>
                        <span className="text-slate-400 font-normal">({vendor.reviewCount || 1} reviews)</span>
                      </div>
                      <span className="text-[11px] font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md">
                        {vendor.area}, Ikorodu
                      </span>
                    </div>
                  </div>
                </div>

                <div className="p-5 pt-0 flex flex-col sm:flex-row gap-2">
                  <button
                    onClick={() => navigateToVendor(vendor)}
                    className="flex-1 py-2.5 bg-emerald-950 hover:bg-emerald-900 text-amber-300 rounded-xl text-xs font-black transition-colors flex items-center justify-center gap-1.5 shadow-sm"
                  >
                    <span>View Storefront</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                  <WhatsAppChatButton
                    whatsappNumber={vendor.whatsapp}
                    businessName={vendor.businessName}
                    type="business"
                    vendorId={vendor.id}
                    variant="primary"
                    className="flex-1 text-xs"
                    label="WhatsApp Chat"
                  />
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 2. Personalized Recommendations Section */}
      <section className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <ThumbsUp className="w-6 h-6 text-amber-500" />
              <h2 className="text-2xl font-black text-slate-900 font-display">
                Personalized Recommendations For You
              </h2>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Curated local goods based on top-rated SME vendors and popular demand in Ikorodu
            </p>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
            {[
              { id: 'all', label: 'All Recommendations', icon: null },
              { id: 'under50k', label: 'Under ₦50,000', icon: null },
              { id: 'topRated', label: 'Top Rated (4.8+)', icon: Star },
              { id: 'artisan', label: 'Bespoke & Artisan', icon: Sparkles },
            ].map((tab) => {
              const TabIcon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setRecommendationFilter(tab.id as any)}
                  className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-colors whitespace-nowrap inline-flex items-center gap-1.5 ${
                    recommendationFilter === tab.id
                      ? 'bg-emerald-950 text-amber-300 shadow-sm'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {TabIcon && (
                    <TabIcon
                      className={`w-3.5 h-3.5 ${
                        recommendationFilter === tab.id ? 'text-amber-300 fill-amber-300' : 'text-amber-500'
                      }`}
                    />
                  )}
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {isCriticalDataLoading || isLoadingData ? (
          <div className="grid grid-cols-1 min-[360px]:grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-5">
            {Array.from({ length: 4 }).map((_, idx) => (
              <ProductSkeletonCard key={idx} viewMode="grid" />
            ))}
          </div>
        ) : recommendedProducts.length > 0 ? (
          <div className="grid grid-cols-1 min-[360px]:grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-5">
            {recommendedProducts.slice(0, 8).map((product, idx) => {
              const isSaved = wishlist.includes(product.id);
              const isAssignedFeatured = featuredProductIds.includes(product.id);
              const vendor = vendors.find(
                (v) => v.id === product.vendorId || v.businessName === product.vendorName
              );
              const badges = [
                { text: 'Trending in Sabo', icon: Flame },
                { text: 'Fast WhatsApp Reply', icon: Zap },
                { text: 'Verified Artisan', icon: BadgeCheck },
                { text: 'Best Local Price', icon: Sparkles },
              ];
              const badgeItem = badges[idx % badges.length];
              const BadgeIcon = badgeItem.icon;

              return (
                <div
                  key={product.id}
                  className={`bg-white rounded-3xl border ${isAssignedFeatured ? 'border-2 border-amber-400 shadow-md' : 'border-slate-200 shadow-2xs'} overflow-hidden flex flex-col justify-between group`}
                >
                  <div>
                    <div
                      className="relative h-44 bg-slate-100 overflow-hidden cursor-pointer"
                      onClick={() => handleProductClick(product.id)}
                    >
                      <img
                        src={getProductCoverImage(product)}
                        alt={product.name || 'Product'}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src =
                            'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?auto=format&fit=crop&q=80&w=800';
                        }}
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

                      {isAssignedFeatured ? (
                        <span className="absolute top-2 left-2 px-2.5 py-1 bg-amber-400 text-emerald-950 text-[10px] font-black uppercase rounded-lg shadow-md flex items-center gap-1 z-10">
                          <Sparkles className="w-3.5 h-3.5 text-emerald-950 fill-emerald-950" /> FEATURED
                        </span>
                      ) : (
                        <span className="absolute top-2 left-2 px-2 py-0.5 bg-emerald-950/80 text-amber-300 text-[9px] font-black uppercase rounded-md backdrop-blur-md shadow-xs inline-flex items-center gap-1">
                          <BadgeIcon className="w-3 h-3 text-amber-300 shrink-0" />
                          <span>{badgeItem.text}</span>
                        </span>
                      )}

                      <span className="absolute bottom-2 left-2 px-2 py-0.5 bg-black/60 backdrop-blur-md text-white text-[10px] font-bold rounded-lg flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-white shrink-0" />
                        <span>{product.vendorArea}</span>
                      </span>
                    </div>

                    <div className="p-4 space-y-1.5">
                      <span className="text-[10px] font-extrabold uppercase text-emerald-700 tracking-wider">
                        {product.category}
                      </span>
                      <h4
                        onClick={() => handleProductClick(product.id)}
                        className="text-xs sm:text-sm font-bold text-slate-900 line-clamp-2 hover:text-emerald-700 cursor-pointer transition-colors"
                      >
                        {product.name}
                      </h4>

                      <p className="text-[11px] text-slate-500 truncate">By {product.vendorName}</p>

                      <div className="pt-1 flex items-baseline gap-2">
                        <span className="text-base font-black text-emerald-950 font-mono">
                          ₦{safeFormatPrice(product.price)}
                        </span>
                        {product.salePrice ? (
                          <span className="text-[10px] text-slate-400 line-through font-mono">
                            ₦{safeFormatPrice(product.salePrice)}
                          </span>
                        ) : null}
                      </div>
                    </div>
                  </div>

                  <div className="p-4 pt-0 flex flex-col gap-2">
                    <WhatsAppChatButton
                      whatsappNumber={vendor?.whatsapp}
                      businessName={product.vendorName}
                      type="product"
                      productTitle={product.name}
                      productPrice={product.price}
                      vendorId={product.vendorId}
                      variant="primary"
                      className="w-full text-xs"
                      label="Direct WhatsApp Chat"
                    />
                    <button
                      onClick={() => handleProductClick(product.id)}
                      className="w-full py-1.5 bg-emerald-100 hover:bg-emerald-200 text-emerald-950 rounded-xl text-xs font-bold transition-colors"
                    >
                      View Details
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="p-8 text-center bg-white rounded-3xl border border-slate-200 shadow-2xs">
            <p className="text-xs text-slate-500 font-medium">No recommended products found for this filter.</p>
          </div>
        )}
      </section>

      {/* 3. Browse Business Categories (MINIMALIST COMPACT STYLE) */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-black text-slate-900 font-display">
              Browse Business Categories
            </h2>
            <p className="text-xs text-slate-500">Find local stores and essential products across Ikorodu</p>
          </div>
          <a
            href="/categories"
            onClick={(e) => {
              e.preventDefault();
              setActiveTab('categories');
            }}
            className="text-xs font-bold text-emerald-700 hover:text-emerald-900 flex items-center gap-1 cursor-pointer"
          >
            <span>All Categories</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </a>
        </div>

        {/* Minimalist Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {categories.map((cat) => (
            <a
              key={cat.id}
              href={`/directory?category=${encodeURIComponent(cat.name)}`}
              onClick={(e) => {
                e.preventDefault();
                setSelectedCategory(cat.name);
                setActiveTab('directory');
              }}
              className="p-3 bg-white border border-slate-200 rounded-2xl flex items-center gap-2.5 cursor-pointer hover:bg-slate-50 transition-colors shadow-2xs group"
            >
              <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0">
                {getCategoryIcon(cat.slug || cat.id, 'w-4 h-4')}
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="text-xs font-bold text-slate-900 truncate group-hover:text-emerald-800 transition-colors">
                  {cat.name}
                </h3>
                <span className="text-[10px] text-slate-500 font-medium">{cat.vendorCount} stores</span>
              </div>
            </a>
          ))}
        </div>
      </section>

      {/* 4. Trending Local Products & Marketplace Deals */}
      <section className="space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-6 h-6 text-amber-500" />
              <h2 className="text-2xl font-black text-slate-900 font-display">
                Trending Local Products & Marketplace Deals
              </h2>
            </div>
            <p className="text-xs text-slate-500">Buy directly from local vendors in Ikorodu with zero commission</p>
          </div>
          <button
            onClick={() => setActiveTab('marketplace')}
            className="text-xs font-bold text-emerald-700 hover:text-emerald-900 flex items-center gap-1"
          >
            <span>Explore All Products</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {isCriticalDataLoading || isLoadingData ? (
          <div className="grid grid-cols-1 min-[360px]:grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-5">
            {Array.from({ length: 8 }).map((_, idx) => (
              <ProductSkeletonCard key={idx} viewMode="grid" />
            ))}
          </div>
        ) : featuredProducts.length > 0 ? (
          <div className="grid grid-cols-1 min-[360px]:grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-5">
            {featuredProducts.slice(0, 8).map((product) => {
              const isSaved = wishlist.includes(product.id);
              const isAssignedFeatured = featuredProductIds.includes(product.id);
              const vendor = vendors.find(
                (v) => v.id === product.vendorId || v.businessName === product.vendorName
              );
              return (
                <div
                  key={product.id}
                  className={`bg-white rounded-3xl border ${isAssignedFeatured ? 'border-2 border-amber-400 shadow-md' : 'border-slate-200'} overflow-hidden shadow-2xs flex flex-col justify-between group`}
                >
                  <div>
                    <div
                      className="relative h-44 bg-slate-100 overflow-hidden cursor-pointer"
                      onClick={() => handleProductClick(product.id)}
                    >
                      <img
                        src={product.images[0]}
                        alt={product.name}
                        className="w-full h-full object-cover"
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

                      {isAssignedFeatured && (
                        <span className="absolute top-2 left-2 px-2.5 py-1 bg-amber-400 text-emerald-950 text-[10px] font-black uppercase rounded-lg shadow-md flex items-center gap-1 z-10">
                          <Sparkles className="w-3.5 h-3.5 text-emerald-950 fill-emerald-950" /> FEATURED
                        </span>
                      )}

                      <span className="absolute bottom-2 left-2 px-2 py-0.5 bg-black/60 backdrop-blur-md text-white text-[10px] font-bold rounded-lg">
                        {product.vendorArea}
                      </span>
                    </div>

                    <div className="p-4 space-y-1.5">
                      <span className="text-[10px] font-extrabold uppercase text-emerald-700 tracking-wider">
                        {product.category}
                      </span>
                      <h4
                        onClick={() => handleProductClick(product.id)}
                        className="text-xs sm:text-sm font-bold text-slate-900 line-clamp-2 hover:text-emerald-700 cursor-pointer transition-colors"
                      >
                        {product.name}
                      </h4>

                      <p className="text-[11px] text-slate-500 truncate">By {product.vendorName}</p>

                      <div className="pt-1 flex items-baseline gap-2">
                        <span className="text-base font-black text-emerald-950 font-mono">
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

                  <div className="p-4 pt-0 flex flex-col gap-2">
                    <WhatsAppChatButton
                      whatsappNumber={vendor?.whatsapp}
                      businessName={product.vendorName}
                      type="product"
                      productTitle={product.name}
                      productPrice={product.price}
                      vendorId={product.vendorId}
                      variant="primary"
                      className="w-full text-xs"
                      label="Direct WhatsApp Chat"
                    />
                    <button
                      onClick={() => handleProductClick(product.id)}
                      className="w-full py-1.5 bg-emerald-100 hover:bg-emerald-200 text-emerald-950 rounded-xl text-xs font-bold transition-colors"
                    >
                      View Details
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : criticalDataError ? (
          <div className="p-8 text-center bg-white rounded-3xl border border-red-200 shadow-2xs space-y-3">
            <p className="text-xs text-red-600 font-semibold">{criticalDataError}</p>
            <button
              onClick={refreshCriticalData}
              className="px-4 py-2 bg-emerald-800 hover:bg-emerald-900 text-white rounded-xl text-xs font-bold transition-colors"
            >
              Retry Connection
            </button>
          </div>
        ) : (
          <div className="p-8 text-center bg-white rounded-3xl border border-slate-200 shadow-2xs space-y-2">
            <ShoppingBag className="w-10 h-10 text-slate-300 mx-auto" />
            <p className="text-xs text-slate-600 font-medium">No marketplace products listed yet.</p>
          </div>
        )}
      </section>

      {/* 5. Business Directory: Featured & Verified Storefronts */}
      <section className="space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-6 h-6 text-emerald-700" />
              <h2 className="text-2xl font-black text-slate-900 font-display">
                Featured & Verified Business Directory
              </h2>
            </div>
            <p className="text-xs text-slate-500">Top-rated SME storefronts ready to serve you in Ikorodu</p>
          </div>
          <button
            onClick={() => setActiveTab('directory')}
            className="text-xs font-bold text-emerald-700 hover:text-emerald-900 flex items-center gap-1"
          >
            <span>Explore Directory</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {isCriticalDataLoading || isLoadingData ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, idx) => (
              <VendorSkeletonCard key={idx} viewMode="grid" />
            ))}
          </div>
        ) : (sponsoredVendors.length > 0 ? sponsoredVendors : approvedVendors).length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {(sponsoredVendors.length > 0 ? sponsoredVendors : approvedVendors).slice(0, 6).map((vendor) => (
              <div
                key={vendor.id}
                className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-2xs flex flex-col justify-between group"
              >
                <div>
                  {/* Cover & Badges */}
                  <div className="relative h-44 overflow-hidden bg-slate-100">
                    <img
                      src={vendor.coverImageUrl}
                      alt={vendor.businessName}
                      className="w-full h-full object-cover"
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
                <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center gap-2">
                  <button
                    onClick={() => handleVendorClick(vendor.id)}
                    className="flex-1 py-2 text-xs font-bold text-emerald-950 bg-emerald-100/80 hover:bg-emerald-200/80 rounded-xl transition-colors text-center"
                  >
                    View Storefront
                  </button>
                  <WhatsAppChatButton
                    whatsappNumber={vendor.whatsapp}
                    businessName={vendor.businessName}
                    type="business"
                    vendorId={vendor.id}
                    variant="primary"
                    label="Direct WhatsApp Chat"
                  />
                </div>
              </div>
            ))}
          </div>
        ) : criticalDataError ? (
          <div className="p-8 text-center bg-white rounded-3xl border border-red-200 shadow-2xs space-y-3">
            <p className="text-xs text-red-600 font-semibold">{criticalDataError}</p>
            <button
              onClick={refreshCriticalData}
              className="px-4 py-2 bg-emerald-800 hover:bg-emerald-900 text-white rounded-xl text-xs font-bold transition-colors"
            >
              Retry Connection
            </button>
          </div>
        ) : (
          <div className="p-8 text-center bg-white rounded-3xl border border-slate-200 shadow-2xs space-y-3">
            <Building2 className="w-10 h-10 text-slate-300 mx-auto" />
            <p className="text-xs text-slate-600 font-medium">No businesses registered yet. Be the first local store in Ikorodu!</p>
            <button
              onClick={() => setActiveTab('vendor-register')}
              className="px-4 py-2 bg-emerald-800 hover:bg-emerald-900 text-white rounded-xl text-xs font-bold transition-colors"
            >
              Register Your Business
            </button>
          </div>
        )}
      </section>

      {/* 6. Promotional Plans Section (SINGLE ROW MANDATE) */}
      <section className="space-y-6">
        <div className="text-center max-w-2xl mx-auto space-y-1.5">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-100 text-amber-900 text-xs font-bold rounded-full border border-amber-300">
            <Zap className="w-3.5 h-3.5 text-amber-600" /> Vendor Advertising & Growth Plans
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 font-display">
            Accelerate Business Growth in Ikorodu
          </h2>
          <p className="text-xs sm:text-sm text-slate-600">
            Choose a promotional plan below to boost your storefront and get direct WhatsApp customer inquiries.
          </p>
        </div>

        {/* SINGLE ROW GRID ON DESKTOP/TABLET */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {PROMOTION_OPTIONS.map((option) => {
            const isPopular = option.id === 'sponsored_vendor';
            return (
              <div
                key={option.id}
                className={`rounded-3xl p-5 border flex flex-col justify-between relative shadow-2xs ${
                  isPopular
                    ? 'bg-gradient-to-br from-emerald-950 via-emerald-900 to-teal-950 text-white border-amber-400/60 ring-2 ring-amber-400/30'
                    : 'bg-white text-slate-900 border-slate-200'
                }`}
              >
                {isPopular && (
                  <span className="absolute -top-3 right-5 px-2.5 py-0.5 bg-amber-400 text-emerald-950 text-[10px] font-black uppercase tracking-wider rounded-full shadow-2xs">
                    Most Popular
                  </span>
                )}

                <div className="space-y-3">
                  <div>
                    <h3 className={`text-base font-black font-display ${isPopular ? 'text-white' : 'text-slate-900'}`}>
                      {option.title}
                    </h3>
                    <p className={`text-xs mt-0.5 line-clamp-2 ${isPopular ? 'text-emerald-200/90' : 'text-slate-500'}`}>
                      {option.description}
                    </p>
                  </div>

                  <div className="py-2 border-y border-slate-100/20">
                    <span className={`text-2xl font-black font-mono ${isPopular ? 'text-amber-400' : 'text-emerald-950'}`}>
                      ₦{option.priceNaira.toLocaleString()}
                    </span>
                    <span className={`text-xs ml-1 font-semibold ${isPopular ? 'text-emerald-200' : 'text-slate-500'}`}>
                      / {option.durationLabel}
                    </span>
                  </div>

                  <ul className="space-y-1.5 text-xs">
                    {option.features.map((feat, fIdx) => (
                      <li key={fIdx} className="flex items-center gap-2">
                        <Check className={`w-3.5 h-3.5 shrink-0 ${isPopular ? 'text-amber-400' : 'text-emerald-600'}`} />
                        <span className={isPopular ? 'text-emerald-100' : 'text-slate-700'}>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="pt-4 mt-3">
                  <button
                    onClick={() => openPaymentModal(option)}
                    className={`w-full py-2.5 px-3 rounded-xl text-xs font-black transition-colors shadow-2xs flex items-center justify-center gap-2 ${
                      isPopular
                        ? 'bg-amber-400 hover:bg-amber-500 text-emerald-950'
                        : 'bg-emerald-800 hover:bg-emerald-900 text-white'
                    }`}
                  >
                    <CreditCard className="w-3.5 h-3.5" />
                    <span>Select {option.title}</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 7. Interactive Area Explorer (Google Map Style - PLACED AFTER VENDOR ADVERTISING & GROWTH PLANS) */}
      <section>
        <IkoroduMapExplorer
          selectedArea={selectedArea}
          setSelectedArea={setSelectedArea}
          approvedVendors={approvedVendors}
          featuredProducts={featuredProducts}
          handleVendorClick={handleVendorClick}
          handleProductClick={handleProductClick}
          trackVendorWhatsAppClick={trackVendorWhatsAppClick}
          isLoading={isCriticalDataLoading || isLoadingData}
        />
      </section>

      {/* 8. FAQ Section */}
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
                className="bg-white/90 backdrop-blur-md rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden transition-colors"
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
