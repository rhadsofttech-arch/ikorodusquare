import React, { useState } from 'react';
import {
  MapPin,
  Phone,
  MessageSquare,
  Globe,
  Instagram,
  Facebook,
  Star,
  CheckCircle2,
  Sparkles,
  Clock,
  ShieldCheck,
  Building2,
  Send,
  ShoppingBag,
  Image as ImageIcon,
  Share2,
  Heart,
  Calendar,
  Truck,
  ArrowLeft,
  AlertCircle,
  User,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Review } from '../types';
import { WhatsAppChatButton } from '../components/WhatsAppChatButton';
import { ShareButton } from '../components/ShareButton';
import { VendorFeatureBadge } from '../components/VendorFeatureBadge';
import { VendorFeature } from '../types';
import { useSEO } from '../hooks/useSEO';

export const BusinessDetailsView: React.FC = () => {
  const {
    vendors,
    products,
    reviews,
    selectedVendorId,
    selectedVendorSlug,
    setActiveTab,
    setSelectedProductId,
    addReview,
    sendEnquiry,
    currentUser,
    followingVendors,
    toggleFollowVendor,
    trackVendorWhatsAppClick,
    trackVendorPhoneClick,
  } = useApp();

  const [activeSubTab, setActiveSubTab] = useState<'overview' | 'catalog' | 'gallery' | 'reviews'>('overview');
  const [enquiryModalOpen, setEnquiryModalOpen] = useState(false);
  const [enquiryMessage, setEnquiryMessage] = useState('');
  const [enquirySuccess, setEnquirySuccess] = useState(false);

  // WhatsApp Pre-filled Template Modal state
  const [whatsAppModalOpen, setWhatsAppModalOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<'general' | 'product' | 'delivery' | 'wholesale'>('general');
  const [selectedProductIdForWA, setSelectedProductIdForWA] = useState<string>('');
  const [customWAMessage, setCustomWAMessage] = useState<string>('');

  // Review form state
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewAuthorName, setReviewAuthorName] = useState('');
  const [reviewComment, setReviewComment] = useState('');
  const [reviewSubmitted, setReviewSubmitted] = useState(false);

  // Extract slug from URL if present (e.g. /store/:slug)
  let currentSlugFromUrl = '';
  if (typeof window !== 'undefined' && window.location.pathname.toLowerCase().startsWith('/store/')) {
    currentSlugFromUrl = decodeURIComponent(window.location.pathname.substring(7)).trim();
  }

  const vendor = currentSlugFromUrl
    ? vendors.find((v) => (v.slug && v.slug.toLowerCase() === currentSlugFromUrl.toLowerCase()) || v.id === currentSlugFromUrl)
    : vendors.find((v) => v.id === selectedVendorId || (v.slug && selectedVendorSlug && v.slug.toLowerCase() === selectedVendorSlug.toLowerCase()));

  const vendorProducts = vendor ? products.filter((p) => p.vendorId === vendor.id && p.status === 'approved') : [];
  // Approved reviews or user pending reviews
  const vendorReviews = vendor
    ? reviews.filter((r) => r.vendorId === vendor.id && (r.status === 'approved' || !r.status || r.status === 'pending'))
    : [];

  const isFollowing = vendor ? followingVendors.includes(vendor.id) : false;

  const shareStoreUrl = vendor
    ? `${typeof window !== 'undefined' ? window.location.origin : 'https://www.ikorodusquare.com.ng'}/store/${vendor.slug}`
    : undefined;

  useSEO({
    title: vendor ? `${vendor.businessName} - ${vendor.category} in ${vendor.area}, Ikorodu` : 'Business Storefront Not Found',
    description: vendor ? (vendor.description || `${vendor.businessName} is a verified ${vendor.category} business operating in ${vendor.area}, Ikorodu, Lagos State. Contact them directly on IkoroduSquare.`) : 'Business details on IkoroduSquare.',
    keywords: vendor ? `${vendor.businessName}, ${vendor.category} Ikorodu, ${vendor.area} shops, vendors in ${vendor.area}` : undefined,
    ogImage: vendor?.logoUrl || vendor?.coverImageUrl,
  });

  if (!vendor) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center p-6 bg-white rounded-3xl border border-slate-200 shadow-xs my-6">
        <div className="w-16 h-16 bg-amber-100 text-amber-800 rounded-2xl flex items-center justify-center mb-4">
          <Building2 className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-black text-emerald-950 font-display mb-2">
          Business Storefront Not Found
        </h2>
        <p className="text-sm text-slate-600 max-w-md mb-6 leading-relaxed">
          We couldn't find a business matching this web address in Ikorodu. The vendor may have updated their business name or the URL link might be incorrect.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3">
          <button
            onClick={() => setActiveTab('directory')}
            className="px-5 py-2.5 bg-emerald-800 hover:bg-emerald-900 text-amber-300 font-extrabold text-xs rounded-xl transition-all shadow-xs"
          >
            Explore Business Directory
          </button>
          <button
            onClick={() => setActiveTab('home')}
            className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-all"
          >
            Go to Homepage
          </button>
        </div>
      </div>
    );
  }

  // Determine open/closed status
  const currentDayName = new Date().toLocaleDateString('en-US', { weekday: 'long' });
  const todayHours = vendor.businessHours?.find((h) => h.day === currentDayName);

  const handleEnquirySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!enquiryMessage.trim()) return;

    sendEnquiry({
      vendorId: vendor.id,
      vendorName: vendor.businessName,
      customerId: currentUser?.id || 'guest-101',
      customerName: currentUser ? `${currentUser.firstName} ${currentUser.lastName}` : 'Guest Visitor',
      customerEmail: currentUser?.email || 'visitor@example.com',
      customerPhone: currentUser?.phone || '+234 800 000 0000',
      message: enquiryMessage,
    });

    setEnquirySuccess(true);
    setTimeout(() => {
      setEnquirySuccess(false);
      setEnquiryModalOpen(false);
      setEnquiryMessage('');
    }, 1800);
  };

  const handleReviewSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewComment.trim()) return;

    const authorName = reviewAuthorName.trim() || (currentUser ? `${currentUser.firstName} ${currentUser.lastName}` : 'Ikorodu Resident');

    addReview({
      vendorId: vendor.id,
      customerId: currentUser?.id || `guest-${Date.now()}`,
      customerName: authorName,
      rating: reviewRating,
      comment: reviewComment,
      status: 'pending',
    });

    setReviewSubmitted(true);
    setReviewComment('');
    setReviewAuthorName('');
    setTimeout(() => setReviewSubmitted(false), 5000);
  };

  const getPreFilledWAMessage = () => {
    let base = '';
    const selectedProd = vendorProducts.find((p) => p.id === selectedProductIdForWA);

    switch (selectedTemplate) {
      case 'general':
        base = `Hello ${vendor.businessName}, I saw your store profile on IkoroduSquare. I would like to inquire about your products and services in ${vendor.area}.`;
        break;
      case 'product':
        if (selectedProd) {
          base = `Hello ${vendor.businessName}, I am interested in inquiring about "${selectedProd.name}" (₦${selectedProd.price.toLocaleString()}) listed on IkoroduSquare. Is this item currently available?`;
        } else {
          base = `Hello ${vendor.businessName}, I would like to inquire about product prices and current stock availability at your ${vendor.area} store on IkoroduSquare.`;
        }
        break;
      case 'delivery':
        base = `Hello ${vendor.businessName}, I am located in Ikorodu. Do you offer delivery or dispatch services to my area, and what are your delivery fees?`;
        break;
      case 'wholesale':
        base = `Hello ${vendor.businessName}, I would like to make a bulk/wholesale inquiry for my order. Please share your wholesale catalog or volume discount details.`;
        break;
    }

    if (customWAMessage.trim()) {
      base += `\n\nAdditional Note: ${customWAMessage.trim()}`;
    }
    return base;
  };

  const handleLaunchWhatsApp = () => {
    const message = getPreFilledWAMessage();
    trackVendorWhatsAppClick(vendor.id);
    let cleaned = (vendor.whatsapp || '2348000000000').replace(/\D/g, '');
    if (cleaned.startsWith('0')) {
      cleaned = '234' + cleaned.substring(1);
    }
    const url = `https://wa.me/${cleaned}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
    setWhatsAppModalOpen(false);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Bar: Back Button & Share */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <button
          onClick={() => setActiveTab('directory')}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-800 hover:text-emerald-950 transition-colors bg-white px-3.5 py-2 rounded-xl border border-gray-200 shadow-2xs hover:bg-emerald-50"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Business Directory
        </button>

        <ShareButton
          title={`${vendor.businessName} - Local Store in ${vendor.area}, Ikorodu`}
          text={`Explore products, services, and direct deals from ${vendor.businessName} in ${vendor.area}, Ikorodu on IkoroduSquare!`}
          url={shareStoreUrl}
          variant="outline"
          className="px-3.5 py-2 text-xs"
          label="Share Storefront"
        />
      </div>

      {/* Storefront Hero Card */}
      <div className="bg-white rounded-3xl border border-gray-150 overflow-hidden shadow-sm relative">
        {/* Cover Image */}
        <div className="relative h-48 sm:h-64 bg-emerald-900">
          <img
            src={vendor.coverImageUrl}
            alt={vendor.businessName}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

          {/* Top Floating Badges */}
          <div className="absolute top-4 left-4 flex items-center gap-1.5 flex-wrap max-w-[75%]">
            {((vendor.features && vendor.features.length > 0)
              ? vendor.features
              : [
                  ...(vendor.isVerified ? ['Verified Business' as VendorFeature] : []),
                  ...(vendor.isPremium ? ['Premium Vendor' as VendorFeature] : []),
                  ...(vendor.isFeatured ? ['Featured Vendor' as VendorFeature] : []),
                ]
            ).map((feat) => (
              <VendorFeatureBadge key={feat} feature={feat} size="md" />
            ))}
          </div>

          <div className="absolute top-4 right-4 flex items-center gap-2">
            <button
              onClick={() => toggleFollowVendor(vendor.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 backdrop-blur-md ${
                isFollowing
                  ? 'bg-amber-400 text-emerald-950'
                  : 'bg-white/90 text-gray-800 hover:bg-white'
              }`}
            >
              <Heart className={`w-3.5 h-3.5 ${isFollowing ? 'fill-emerald-950' : ''}`} />
              <span>{isFollowing ? 'Following' : 'Follow Store'}</span>
            </button>
          </div>
        </div>

        {/* Storefront Header Info */}
        <div className="p-6 pt-0 relative space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 -mt-12 sm:-mt-16 relative z-10">
            <div className="flex items-end gap-4">
              <img
                src={vendor.logoUrl}
                alt={vendor.businessName}
                className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl object-cover border-4 border-white shadow-xl bg-white"
              />
              <div className="space-y-1 pb-1">
                <h1 className="text-xl sm:text-3xl font-black text-emerald-950 font-display">
                  {vendor.businessName}
                </h1>
                <p className="text-xs sm:text-sm font-semibold text-emerald-800 flex items-center gap-2">
                  <span>{vendor.category}</span>
                  <span>•</span>
                  <span>{vendor.subcategory}</span>
                </p>
              </div>
            </div>

            {/* Quick Contact Buttons */}
            <div className="flex items-center gap-2 w-full sm:w-auto flex-wrap">
              <button
                onClick={() => setWhatsAppModalOpen(true)}
                className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all"
              >
                <MessageSquare className="w-4 h-4 text-amber-300" />
                <span>Message via WhatsApp</span>
              </button>

              <WhatsAppChatButton
                whatsappNumber={vendor.whatsapp}
                businessName={vendor.businessName}
                type="business"
                vendorId={vendor.id}
                variant="secondary"
                label="Quick Chat"
              />

              <a
                href={`tel:${vendor.phone}`}
                onClick={() => trackVendorPhoneClick(vendor.id)}
                className="px-3 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-xl text-xs font-bold flex items-center justify-center gap-1 transition-colors"
              >
                <Phone className="w-4 h-4 text-emerald-700" />
                <span className="hidden sm:inline">Call Phone</span>
              </a>

              <button
                onClick={() => setEnquiryModalOpen(true)}
                className="px-3.5 py-2.5 bg-amber-400 hover:bg-amber-500 text-emerald-950 rounded-xl text-xs font-bold flex items-center justify-center gap-1 shadow-sm transition-colors"
              >
                <Send className="w-4 h-4" />
                <span className="hidden sm:inline">Send Enquiry</span>
              </button>

              <ShareButton
                title={`${vendor.businessName} - Local Store in ${vendor.area}, Ikorodu`}
                text={`Check out ${vendor.businessName} in ${vendor.area}, Ikorodu on IkoroduSquare!`}
                url={shareStoreUrl}
                variant="outline"
                className="px-3.5 py-2.5 text-xs"
                label="Share"
              />
            </div>
          </div>

          {/* Quick Meta Stats Row */}
          <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-gray-100 text-xs">
            <div className="flex flex-wrap items-center gap-4 text-gray-600">
              <span className="flex items-center gap-1">
                <MapPin className="w-4 h-4 text-emerald-600" />
                <strong className="text-emerald-950">{vendor.address}</strong> ({vendor.area})
              </span>
              <span className="flex items-center gap-1">
                <Clock className="w-4 h-4 text-emerald-600" />
                {todayHours && !todayHours.isClosed ? (
                  <span className="text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                    Open Now ({todayHours.openTime} - {todayHours.closeTime})
                  </span>
                ) : (
                  <span className="text-red-600 font-bold bg-red-50 px-2 py-0.5 rounded-full border border-red-200">
                    Closed Today
                  </span>
                )}
              </span>
              <span className="flex items-center gap-1">
                <Calendar className="w-4 h-4 text-emerald-600" />
                <strong>{vendor.yearsInBusiness} Years</strong> in Business
              </span>
            </div>

            <div className="flex items-center gap-1 text-amber-500 font-bold text-sm">
              <Star className="w-4 h-4 fill-amber-400" />
              <span>{vendor.rating > 0 ? vendor.rating : 'New'}</span>
              <span className="text-gray-400 text-xs font-normal">({vendor.reviewCount} Reviews)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Sub-Tab Navigation Bar */}
      <div className="flex items-center gap-2 border-b border-gray-200 pb-2">
        <button
          onClick={() => setActiveSubTab('overview')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeSubTab === 'overview'
              ? 'bg-emerald-950 text-amber-300 shadow-sm'
              : 'bg-white text-gray-600 hover:bg-gray-100'
          }`}
        >
          Store Overview
        </button>
        <button
          onClick={() => setActiveSubTab('catalog')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
            activeSubTab === 'catalog'
              ? 'bg-emerald-950 text-amber-300 shadow-sm'
              : 'bg-white text-gray-600 hover:bg-gray-100'
          }`}
        >
          <ShoppingBag className="w-3.5 h-3.5" />
          <span>Products & Services ({vendorProducts.length})</span>
        </button>
        <button
          onClick={() => setActiveSubTab('gallery')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
            activeSubTab === 'gallery'
              ? 'bg-emerald-950 text-amber-300 shadow-sm'
              : 'bg-white text-gray-600 hover:bg-gray-100'
          }`}
        >
          <ImageIcon className="w-3.5 h-3.5" />
          <span>Photo Gallery ({vendor.galleryUrls?.length || 0})</span>
        </button>
        <button
          onClick={() => setActiveSubTab('reviews')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
            activeSubTab === 'reviews'
              ? 'bg-emerald-950 text-amber-300 shadow-sm'
              : 'bg-white text-gray-600 hover:bg-gray-100'
          }`}
        >
          <Star className="w-3.5 h-3.5" />
          <span>Reviews & Ratings ({vendorReviews.length})</span>
        </button>
      </div>

      {/* SUB-TAB CONTENTS */}

      {/* 1. Overview */}
      {activeSubTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white p-6 rounded-3xl border border-gray-150 shadow-sm space-y-3">
              <h3 className="text-base font-black text-emerald-950 font-display">
                About {vendor.businessName}
              </h3>
              <p className="text-xs text-gray-700 leading-relaxed whitespace-pre-line">
                {vendor.description}
              </p>
            </div>

            {/* Delivery Areas */}
            <div className="bg-white p-6 rounded-3xl border border-gray-150 shadow-sm space-y-3">
              <div className="flex items-center gap-2">
                <Truck className="w-5 h-5 text-emerald-700" />
                <h3 className="text-base font-black text-emerald-950 font-display">
                  Delivery & Coverage Areas
                </h3>
              </div>
              <p className="text-xs text-gray-600">
                This vendor fulfills orders to the following Ikorodu districts & nearby towns:
              </p>
              <div className="flex flex-wrap gap-2 pt-1">
                {vendor.deliveryAreas?.map((area) => (
                  <span
                    key={area}
                    className="px-3 py-1 bg-emerald-50 text-emerald-900 font-bold text-xs rounded-xl border border-emerald-200"
                  >
                    {area}
                  </span>
                ))}
              </div>
            </div>

            {/* Quick WhatsApp Inquiry Banner Card */}
            <div className="bg-gradient-to-r from-emerald-900 to-emerald-950 p-6 rounded-3xl text-white space-y-3 shadow-md relative overflow-hidden">
              <div className="flex items-center justify-between relative z-10">
                <div className="flex items-center gap-2">
                  <MessageSquare className="w-5 h-5 text-amber-400" />
                  <h3 className="text-base font-black font-display text-white">
                    Direct WhatsApp Inquiry with {vendor.businessName}
                  </h3>
                </div>
                <span className="px-2.5 py-0.5 bg-emerald-600/60 text-amber-300 font-bold text-[10px] rounded-full border border-emerald-500/40">
                  Fast Response
                </span>
              </div>
              <p className="text-xs text-emerald-100 leading-relaxed relative z-10">
                Need quick answers about pricing, stock availability, or delivery to your area in Ikorodu? Use our pre-configured WhatsApp message templates to send an instant structured inquiry.
              </p>
              <div className="pt-2 flex flex-wrap gap-2 relative z-10">
                <button
                  type="button"
                  onClick={() => {
                    setSelectedTemplate('general');
                    setWhatsAppModalOpen(true);
                  }}
                  className="px-3.5 py-2 bg-emerald-700/80 hover:bg-emerald-600 text-white rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all border border-emerald-500/30"
                >
                  🛍️ Store Inquiry
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedTemplate('product');
                    setWhatsAppModalOpen(true);
                  }}
                  className="px-3.5 py-2 bg-emerald-700/80 hover:bg-emerald-600 text-white rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all border border-emerald-500/30"
                >
                  📦 Product Availability
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedTemplate('delivery');
                    setWhatsAppModalOpen(true);
                  }}
                  className="px-3.5 py-2 bg-emerald-700/80 hover:bg-emerald-600 text-white rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all border border-emerald-500/30"
                >
                  🚚 Delivery Rates
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedTemplate('wholesale');
                    setWhatsAppModalOpen(true);
                  }}
                  className="px-3.5 py-2 bg-emerald-700/80 hover:bg-emerald-600 text-white rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all border border-emerald-500/30"
                >
                  💼 Wholesale Order
                </button>
              </div>
            </div>
          </div>

          {/* Right Sidebar: Hours & Owner Info */}
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-3xl border border-gray-150 shadow-sm space-y-3">
              <h3 className="text-base font-black text-emerald-950 font-display flex items-center gap-2">
                <Clock className="w-4 h-4 text-emerald-700" />
                Business Hours
              </h3>
              <div className="space-y-2 text-xs">
                {vendor.businessHours?.map((hours) => (
                  <div key={hours.day} className="flex items-center justify-between border-b pb-1 text-gray-600">
                    <span className="font-semibold">{hours.day}</span>
                    {hours.isClosed ? (
                      <span className="text-red-500 font-bold">Closed</span>
                    ) : (
                      <span className="font-mono text-emerald-900 font-bold">
                        {hours.openTime} - {hours.closeTime}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-gray-150 shadow-sm space-y-3 text-xs">
              <h3 className="text-base font-black text-emerald-950 font-display">
                Owner & Contact Info
              </h3>
              <p className="text-gray-600">
                Owner: <strong className="text-emerald-950">{vendor.ownerName}</strong>
              </p>
              <p className="text-gray-600">
                Phone: <strong className="text-emerald-950">{vendor.phone}</strong>
              </p>
              <p className="text-gray-600">
                WhatsApp: <strong className="text-emerald-950">+{vendor.whatsapp}</strong>
              </p>
              {vendor.website && (
                <p className="text-gray-600">
                  Website:{' '}
                  <a href={vendor.website} target="_blank" rel="noreferrer" className="text-emerald-700 font-bold hover:underline">
                    {vendor.website}
                  </a>
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 2. Products Catalog */}
      {activeSubTab === 'catalog' && (
        <div className="space-y-4">
          <h3 className="text-base font-black text-emerald-950 font-display">
            Catalog Items by {vendor.businessName}
          </h3>
          {vendorProducts.length === 0 ? (
            <div className="bg-white p-8 rounded-3xl text-center border border-gray-200">
              <p className="text-xs text-gray-500">No products uploaded yet by this vendor.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {vendorProducts.map((product) => (
                <div
                  key={product.id}
                  className="bg-white rounded-2xl border border-gray-150 overflow-hidden shadow-sm hover:shadow-lg transition-all flex flex-col justify-between group"
                >
                  <div
                    onClick={() => {
                      setSelectedProductId(product.id);
                      setActiveTab('product-details');
                    }}
                    className="cursor-pointer"
                  >
                    <div className="h-40 bg-gray-100 overflow-hidden">
                      <img
                        src={product.images[0]}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
                    </div>
                    <div className="p-3 space-y-1">
                      <h4 className="text-xs font-bold text-emerald-950 line-clamp-2">
                        {product.name}
                      </h4>
                      <span className="text-sm font-black text-emerald-900 font-mono">
                        ₦{product.price.toLocaleString()}
                      </span>
                    </div>
                  </div>
                  <div className="p-3 pt-0">
                    <WhatsAppChatButton
                      whatsappNumber={vendor.whatsapp}
                      businessName={vendor.businessName}
                      type="product"
                      productTitle={product.name}
                      productPrice={product.price}
                      vendorId={vendor.id}
                      variant="primary"
                      className="w-full text-xs"
                      label="Direct WhatsApp Chat"
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 3. Photo Gallery */}
      {activeSubTab === 'gallery' && (
        <div className="space-y-4">
          <h3 className="text-base font-black text-emerald-950 font-display">
            Store Photo Gallery
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {vendor.galleryUrls?.map((img, idx) => (
              <div key={idx} className="h-48 rounded-2xl overflow-hidden bg-gray-100 border shadow-sm">
                <img src={img} alt="Store Gallery" className="w-full h-full object-cover hover:scale-105 transition-transform" />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 4. Reviews */}
      {activeSubTab === 'reviews' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Reviews Summary */}
            <div className="bg-white p-6 rounded-3xl border border-gray-150 shadow-sm text-center space-y-2 flex flex-col justify-center items-center">
              <span className="text-4xl font-black text-emerald-950 font-mono">
                {vendor.rating > 0 ? vendor.rating : 'N/A'}
              </span>
              <div className="flex justify-center text-amber-400">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star
                    key={s}
                    className={`w-5 h-5 ${s <= Math.round(vendor.rating || 5) ? 'fill-amber-400' : 'text-gray-300'}`}
                  />
                ))}
              </div>
              <p className="text-xs text-gray-500">
                Based on {vendorReviews.filter((r) => r.status === 'approved' || !r.status).length} verified approved reviews
              </p>
            </div>

            {/* Write a Review Form */}
            <div className="md:col-span-2 bg-white p-6 rounded-3xl border border-gray-150 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-black text-emerald-950 font-display">
                  Rate & Leave Feedback for {vendor.businessName}
                </h3>
                <span className="text-[10px] text-gray-400 font-medium">Reviews are verified by Admin</span>
              </div>

              {reviewSubmitted ? (
                <div className="p-4 bg-amber-50 border border-amber-200 text-amber-900 text-xs rounded-2xl flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold text-amber-950">Review Submitted for Moderation!</p>
                    <p className="mt-0.5 text-amber-800">
                      Your feedback has been sent to IkoroduSquare admins for verification. Once approved by our team, it will appear publicly on this vendor's storefront.
                    </p>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleReviewSubmit} className="space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">Your Full Name / Alias</label>
                      <input
                        type="text"
                        value={reviewAuthorName}
                        onChange={(e) => setReviewAuthorName(e.target.value)}
                        placeholder={currentUser ? `${currentUser.firstName} ${currentUser.lastName}` : 'e.g. Adebayo from Sabo'}
                        className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">Star Rating</label>
                      <div className="flex gap-1 text-amber-400 py-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            type="button"
                            onClick={() => setReviewRating(star)}
                            className="p-1 hover:scale-110 transition-transform"
                            title={`${star} Star${star > 1 ? 's' : ''}`}
                          >
                            <Star className={`w-6 h-6 ${star <= reviewRating ? 'fill-amber-400 text-amber-400' : 'text-gray-300'}`} />
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Your Comment / Experience</label>
                    <textarea
                      rows={3}
                      value={reviewComment}
                      onChange={(e) => setReviewComment(e.target.value)}
                      placeholder="Share your honest experience with their products, customer service, or delivery in Ikorodu..."
                      required
                      className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                    />
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <p className="text-[10px] text-gray-400">
                      * Submitted comments pass through admin review before public listing.
                    </p>
                    <button
                      type="submit"
                      className="px-5 py-2.5 bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-xs rounded-xl transition-colors shadow-sm flex items-center gap-1.5"
                    >
                      <Send className="w-3.5 h-3.5" /> Submit for Review
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>

          {/* List of Reviews */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold text-emerald-950 uppercase tracking-wider">
              Customer Feedback & Reviews ({vendorReviews.length})
            </h4>

            {vendorReviews.length === 0 ? (
              <div className="bg-white p-8 rounded-3xl border border-gray-200 text-center space-y-2">
                <MessageSquare className="w-8 h-8 text-gray-300 mx-auto" />
                <p className="text-xs text-gray-500 font-medium">No reviews published yet for this vendor.</p>
                <p className="text-[11px] text-gray-400">Be the first customer to share your experience!</p>
              </div>
            ) : (
              vendorReviews.map((rev) => (
                <div key={rev.id} className="bg-white p-5 rounded-2xl border border-gray-150 shadow-sm space-y-2.5">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-900 font-bold flex items-center justify-center text-xs border border-emerald-200">
                        {rev.customerName.slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h5 className="text-xs font-bold text-emerald-950">{rev.customerName}</h5>
                          {rev.status === 'pending' && (
                            <span className="px-2 py-0.5 bg-amber-100 text-amber-900 border border-amber-300 rounded-full text-[10px] font-bold flex items-center gap-1">
                              <Clock className="w-3 h-3 text-amber-700" /> Pending Admin Moderation
                            </span>
                          )}
                        </div>
                        <span className="text-[10px] text-gray-400">
                          {new Date(rev.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    <div className="flex text-amber-400">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star key={s} className={`w-3.5 h-3.5 ${s <= rev.rating ? 'fill-amber-400' : 'text-gray-300'}`} />
                      ))}
                    </div>
                  </div>

                  <p className="text-xs text-gray-700 leading-relaxed">{rev.comment}</p>

                  {rev.vendorReply && (
                    <div className="p-3 bg-emerald-50/80 border border-emerald-200 rounded-xl text-xs text-emerald-950 space-y-1 mt-2">
                      <span className="font-bold text-[11px] text-emerald-900 block">
                        Vendor Response ({vendor.businessName}):
                      </span>
                      <p>{rev.vendorReply}</p>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Enquiry Modal */}
      {enquiryModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <h3 className="text-lg font-black text-emerald-950 font-display">
              Send Direct Enquiry to {vendor.businessName}
            </h3>

            {enquirySuccess ? (
              <div className="p-4 bg-emerald-50 text-emerald-900 font-bold text-xs rounded-2xl flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-700" />
                <span>Enquiry sent to vendor! They will contact you shortly.</span>
              </div>
            ) : (
              <form onSubmit={handleEnquirySubmit} className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Your Enquiry Message</label>
                  <textarea
                    rows={4}
                    value={enquiryMessage}
                    onChange={(e) => setEnquiryMessage(e.target.value)}
                    placeholder="Ask about bulk prices, delivery times, or custom sizes..."
                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setEnquiryModalOpen(false)}
                    className="px-4 py-2 bg-gray-100 text-gray-700 font-bold text-xs rounded-xl"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-emerald-800 text-white font-bold text-xs rounded-xl hover:bg-emerald-900"
                  >
                    Send Message
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Pre-filled WhatsApp Inquiry Modal */}
      {whatsAppModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto border border-emerald-100">
            <div className="flex items-center justify-between border-b pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-emerald-600 text-white flex items-center justify-center">
                  <MessageSquare className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-emerald-950 font-display">
                    Message {vendor.businessName} via WhatsApp
                  </h3>
                  <p className="text-[11px] text-gray-500 font-medium">
                    Select an inquiry template to pre-fill your message
                  </p>
                </div>
              </div>
              <button
                onClick={() => setWhatsAppModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 font-bold text-sm"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4 text-xs">
              {/* Template Selectors */}
              <div>
                <label className="block font-bold text-gray-800 mb-2">
                  Choose Inquiry Template:
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedTemplate('general');
                      setSelectedProductIdForWA('');
                    }}
                    className={`p-3 rounded-2xl border text-left transition-all ${
                      selectedTemplate === 'general'
                        ? 'bg-emerald-50 border-emerald-600 font-bold text-emerald-950 shadow-sm'
                        : 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <span className="block text-xs">🛍️ General Inquiry</span>
                    <span className="text-[10px] text-gray-500 font-normal">Store location & services</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSelectedTemplate('product')}
                    className={`p-3 rounded-2xl border text-left transition-all ${
                      selectedTemplate === 'product'
                        ? 'bg-emerald-50 border-emerald-600 font-bold text-emerald-950 shadow-sm'
                        : 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <span className="block text-xs">📦 Product / Price Quote</span>
                    <span className="text-[10px] text-gray-500 font-normal">Inquire specific items</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setSelectedTemplate('delivery');
                      setSelectedProductIdForWA('');
                    }}
                    className={`p-3 rounded-2xl border text-left transition-all ${
                      selectedTemplate === 'delivery'
                        ? 'bg-emerald-50 border-emerald-600 font-bold text-emerald-950 shadow-sm'
                        : 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <span className="block text-xs">🚚 Delivery & Dispatch</span>
                    <span className="text-[10px] text-gray-500 font-normal">Fees & pickup spots</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setSelectedTemplate('wholesale');
                      setSelectedProductIdForWA('');
                    }}
                    className={`p-3 rounded-2xl border text-left transition-all ${
                      selectedTemplate === 'wholesale'
                        ? 'bg-emerald-50 border-emerald-600 font-bold text-emerald-950 shadow-sm'
                        : 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <span className="block text-xs">💼 Wholesale / Bulk</span>
                    <span className="text-[10px] text-gray-500 font-normal">Volume discounts</span>
                  </button>
                </div>
              </div>

              {/* Product Selector if Product Template */}
              {selectedTemplate === 'product' && vendorProducts.length > 0 && (
                <div className="p-3 bg-amber-50/80 rounded-2xl border border-amber-200/80 space-y-1.5">
                  <label className="block font-bold text-amber-950 text-xs">
                    Select Product from {vendor.businessName}'s Catalog:
                  </label>
                  <select
                    value={selectedProductIdForWA}
                    onChange={(e) => setSelectedProductIdForWA(e.target.value)}
                    className="w-full p-2 bg-white border border-amber-300 rounded-xl text-xs font-bold text-emerald-950 focus:outline-none"
                  >
                    <option value="">-- Any / General Catalog Items --</option>
                    {vendorProducts.map((prod) => (
                      <option key={prod.id} value={prod.id}>
                        {prod.name} - ₦{prod.price.toLocaleString()}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Additional Custom Note Input */}
              <div>
                <label className="block font-bold text-gray-700 mb-1">
                  Add Custom Note or Question (Optional):
                </label>
                <input
                  type="text"
                  value={customWAMessage}
                  onChange={(e) => setCustomWAMessage(e.target.value)}
                  placeholder="e.g. My preferred pickup is Agric. Do you have color blue in stock?"
                  className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                />
              </div>

              {/* Live Preview Box */}
              <div>
                <label className="block font-bold text-gray-700 mb-1">
                  Message Preview (Sent directly to vendor on WhatsApp):
                </label>
                <div className="p-3.5 bg-emerald-950 text-emerald-100 rounded-2xl text-xs font-mono leading-relaxed border border-emerald-800 whitespace-pre-wrap">
                  {getPreFilledWAMessage()}
                </div>
              </div>

              <div className="p-3 bg-gray-50 rounded-2xl border border-gray-200 flex items-center justify-between text-[11px] text-gray-600">
                <span>Vendor WhatsApp Number: <strong>+{vendor.whatsapp}</strong></span>
                <span className="text-emerald-700 font-bold">Direct & Instant</span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t">
              <button
                type="button"
                onClick={() => setWhatsAppModalOpen(false)}
                className="px-4 py-2 bg-gray-100 text-gray-700 font-bold text-xs rounded-xl"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleLaunchWhatsApp}
                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md flex items-center gap-2 active:scale-95 transition-all"
              >
                <MessageSquare className="w-4 h-4 text-amber-300" />
                <span>Launch WhatsApp Chat</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
