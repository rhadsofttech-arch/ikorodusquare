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
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Review } from '../types';

export const BusinessDetailsView: React.FC = () => {
  const {
    vendors,
    products,
    reviews,
    selectedVendorId,
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

  // Review form state
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [reviewSubmitted, setReviewSubmitted] = useState(false);

  const vendor = vendors.find((v) => v.id === selectedVendorId) || vendors[0];
  const vendorProducts = products.filter((p) => p.vendorId === vendor.id && p.status === 'approved');
  const vendorReviews = reviews.filter((r) => r.vendorId === vendor.id);

  const isFollowing = followingVendors.includes(vendor.id);

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

    addReview({
      vendorId: vendor.id,
      customerId: currentUser?.id || 'c-101',
      customerName: currentUser ? `${currentUser.firstName} ${currentUser.lastName}` : 'Customer',
      rating: reviewRating,
      comment: reviewComment,
    });

    setReviewSubmitted(true);
    setReviewComment('');
    setTimeout(() => setReviewSubmitted(false), 2000);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Back Button */}
      <button
        onClick={() => setActiveTab('directory')}
        className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-800 hover:text-emerald-950 transition-colors bg-white px-3 py-1.5 rounded-xl border border-gray-200 shadow-sm"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Business Directory
      </button>

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
          <div className="absolute top-4 left-4 flex items-center gap-2">
            {vendor.isVerified && (
              <span className="px-3 py-1 bg-emerald-600 text-white font-bold text-xs rounded-full shadow flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-amber-300" /> Verified Store
              </span>
            )}
            {vendor.isPremium && (
              <span className="px-3 py-1 bg-amber-400 text-emerald-950 font-bold text-xs rounded-full shadow flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5" /> Premium Merchant
              </span>
            )}
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
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <a
                href={`https://wa.me/${vendor.whatsapp}?text=Hi%20${encodeURIComponent(
                  vendor.businessName
                )},%20I%20am%20contacting%20you%20from%20IkoroduSquare.`}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => trackVendorWhatsAppClick(vendor.id)}
                className="flex-1 sm:flex-none px-4 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-md transition-colors"
              >
                <MessageSquare className="w-4 h-4 text-amber-300" />
                <span>WhatsApp Vendor</span>
              </a>

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
                  onClick={() => {
                    setSelectedProductId(product.id);
                    setActiveTab('product-details');
                  }}
                  className="bg-white rounded-2xl border border-gray-150 overflow-hidden shadow-sm hover:shadow-lg transition-all cursor-pointer group"
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
            <div className="bg-white p-6 rounded-3xl border border-gray-150 shadow-sm text-center space-y-2">
              <span className="text-4xl font-black text-emerald-950 font-mono">
                {vendor.rating > 0 ? vendor.rating : 'N/A'}
              </span>
              <div className="flex justify-center text-amber-400">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star key={s} className="w-5 h-5 fill-amber-400" />
                ))}
              </div>
              <p className="text-xs text-gray-500">Based on {vendorReviews.length} verified customer reviews</p>
            </div>

            {/* Write a Review Form */}
            <div className="md:col-span-2 bg-white p-6 rounded-3xl border border-gray-150 shadow-sm space-y-4">
              <h3 className="text-sm font-black text-emerald-950 font-display">
                Leave a Customer Review
              </h3>

              {reviewSubmitted ? (
                <div className="p-3 bg-emerald-50 text-emerald-900 font-bold text-xs rounded-xl flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                  <span>Review submitted successfully! Thank you.</span>
                </div>
              ) : (
                <form onSubmit={handleReviewSubmit} className="space-y-3">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Star Rating</label>
                    <div className="flex gap-1 text-amber-400">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setReviewRating(star)}
                          className="p-1 hover:scale-110 transition-transform"
                        >
                          <Star className={`w-6 h-6 ${star <= reviewRating ? 'fill-amber-400' : 'text-gray-300'}`} />
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Your Comment / Experience</label>
                    <textarea
                      rows={3}
                      value={reviewComment}
                      onChange={(e) => setReviewComment(e.target.value)}
                      placeholder="Write your honest review of their products, service, or delivery speed in Ikorodu..."
                      className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                    />
                  </div>

                  <button
                    type="submit"
                    className="px-5 py-2.5 bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-xs rounded-xl transition-colors shadow-sm"
                  >
                    Post Review
                  </button>
                </form>
              )}
            </div>
          </div>

          {/* List of Reviews */}
          <div className="space-y-4">
            {vendorReviews.map((rev) => (
              <div key={rev.id} className="bg-white p-5 rounded-2xl border border-gray-150 shadow-sm space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-900 font-bold flex items-center justify-center text-xs">
                      {rev.customerName.slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <h5 className="text-xs font-bold text-emerald-950">{rev.customerName}</h5>
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

                <p className="text-xs text-gray-700">{rev.comment}</p>

                {rev.vendorReply && (
                  <div className="p-3 bg-emerald-50/80 border border-emerald-200 rounded-xl mt-2 text-xs text-emerald-950 space-y-1">
                    <span className="font-bold text-[11px] text-emerald-900 block">
                      Vendor Response ({vendor.businessName}):
                    </span>
                    <p>{rev.vendorReply}</p>
                  </div>
                )}
              </div>
            ))}
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
    </div>
  );
};
