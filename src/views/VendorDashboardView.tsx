import React, { useState } from 'react';
import {
  Store,
  ShoppingBag,
  TrendingUp,
  Eye,
  MessageSquare,
  Phone,
  Plus,
  Edit,
  Trash2,
  CheckCircle2,
  Clock,
  QrCode,
  ShieldCheck,
  CreditCard,
  Upload,
  AlertCircle,
  Sparkles,
  Search,
  ChevronRight,
  ArrowRight,
  Star,
  Zap,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { MANUAL_PAYMENT_INFO, PROMOTION_OPTIONS } from '../data/mockData';
import { Product, PromoType } from '../types';

export const VendorDashboardView: React.FC = () => {
  const {
    vendors,
    products,
    reviews,
    enquiries,
    promotionRequests,
    addProduct,
    deleteProduct,
    replyReview,
    replyEnquiry,
    submitPromotionRequest,
    categories,
    setActiveTab,
    setSelectedVendorId,
  } = useApp();

  const [vendorTab, setVendorTab] = useState<'overview' | 'products' | 'enquiries' | 'reviews' | 'promotions' | 'qrcode'>('overview');

  // Product Add Modal
  const [addProductModalOpen, setAddProductModalOpen] = useState(false);
  const [newProdName, setNewProdName] = useState('');
  const [newProdPrice, setNewProdPrice] = useState<number>(5000);
  const [newProdCategory, setNewProdCategory] = useState('Fashion & Apparel');
  const [newProdDesc, setNewProdDesc] = useState('');
  const [newProdImage, setNewProdImage] = useState('https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?auto=format&fit=crop&q=80&w=800');

  // Manual Promotion Upload State
  const [selectedPromoOption, setSelectedPromoOption] = useState(PROMOTION_OPTIONS[1]);
  const [proofFileUploaded, setProofFileUploaded] = useState(false);
  const [proofFileName, setProofFileName] = useState('');
  const [txnRef, setTxnRef] = useState('');
  const [promoNotes, setPromoNotes] = useState('');
  const [promoSuccessMsg, setPromoSuccessMsg] = useState(false);

  // Active vendor (default to Sparkle Electronics or first vendor)
  const vendor = vendors.find((v) => v.id === 'v-3') || vendors[0];
  const vendorProducts = products.filter((p) => p.vendorId === vendor.id);
  const vendorEnquiries = enquiries.filter((e) => e.vendorId === vendor.id);
  const vendorReviews = reviews.filter((r) => r.vendorId === vendor.id);
  const vendorPromos = promotionRequests.filter((pr) => pr.vendorId === vendor.id);

  const pendingEnquiries = vendorEnquiries.filter((e) => e.status === 'new');
  const activePromo = vendorPromos.find((p) => p.status === 'approved');

  const handleAddProductSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProdName.trim()) return;

    addProduct({
      vendorId: vendor.id,
      vendorName: vendor.businessName,
      vendorArea: vendor.area,
      name: newProdName,
      price: newProdPrice,
      category: newProdCategory,
      description: newProdDesc,
      images: [newProdImage],
    });

    setAddProductModalOpen(false);
    setNewProdName('');
  };

  const handlePromotionUploadSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!txnRef.trim() || !proofFileUploaded) return;

    submitPromotionRequest({
      vendorId: vendor.id,
      vendorName: vendor.businessName,
      promoType: selectedPromoOption.id,
      promoTitle: selectedPromoOption.title,
      amountNaira: selectedPromoOption.priceNaira,
      durationWeeks: selectedPromoOption.durationWeeks,
      bankName: MANUAL_PAYMENT_INFO.bankName,
      accountName: MANUAL_PAYMENT_INFO.accountName,
      accountNumber: MANUAL_PAYMENT_INFO.accountNumber,
      proofUrl: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&q=80&w=800',
      proofFileName: proofFileName || 'FCMB_Payment_Receipt.png',
      txnRef: txnRef.trim(),
      notes: promoNotes,
    });

    setPromoSuccessMsg(true);
    setTimeout(() => {
      setPromoSuccessMsg(false);
      setTxnRef('');
      setPromoNotes('');
      setProofFileUploaded(false);
    }, 2500);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header Store Status Bento Banner */}
      <div className="bg-white/95 backdrop-blur-md rounded-3xl border border-slate-200/90 p-6 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition-all hover:shadow-md">
        <div className="flex items-center gap-4">
          <img
            src={vendor.logoUrl}
            alt={vendor.businessName}
            className="w-14 h-14 rounded-2xl object-cover border border-slate-200 shadow-xs"
          />
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-black text-slate-900 font-display">
                {vendor.businessName}
              </h1>
              {vendor.status === 'approved' ? (
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Live & Approved
                </span>
              ) : (
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-900 flex items-center gap-1 animate-pulse">
                  <AlertCircle className="w-3 h-3 text-amber-600" /> Pending Admin Verification
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500">{vendor.category} • {vendor.area}, Ikorodu</p>
          </div>
        </div>

        <button
          onClick={() => {
            setSelectedVendorId(vendor.id);
            setActiveTab('vendor-details');
          }}
          className="px-4 py-2 bg-emerald-100 hover:bg-emerald-200 text-emerald-950 font-bold text-xs rounded-xl transition-colors"
        >
          View Public Storefront
        </button>
      </div>

      {/* Bento Navigation Bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-slate-200">
        <button
          onClick={() => setVendorTab('overview')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
            vendorTab === 'overview'
              ? 'bg-emerald-950 text-amber-300 shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200/80'
          }`}
        >
          Overview Bento
        </button>
        <button
          onClick={() => setVendorTab('products')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 ${
            vendorTab === 'products'
              ? 'bg-emerald-950 text-amber-300 shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200/80'
          }`}
        >
          <ShoppingBag className="w-3.5 h-3.5" />
          <span>Products & Services ({vendorProducts.length})</span>
        </button>
        <button
          onClick={() => setVendorTab('enquiries')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 ${
            vendorTab === 'enquiries'
              ? 'bg-emerald-950 text-amber-300 shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200/80'
          }`}
        >
          <MessageSquare className="w-3.5 h-3.5" />
          <span>Enquiries ({vendorEnquiries.length})</span>
          {pendingEnquiries.length > 0 && (
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
          )}
        </button>
        <button
          onClick={() => setVendorTab('reviews')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
            vendorTab === 'reviews'
              ? 'bg-emerald-950 text-amber-300 shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200/80'
          }`}
        >
          Reviews ({vendorReviews.length})
        </button>
        <button
          onClick={() => setVendorTab('promotions')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 ${
            vendorTab === 'promotions'
              ? 'bg-amber-400 text-emerald-950 shadow-xs'
              : 'bg-emerald-50 text-emerald-900 border border-emerald-200/90'
          }`}
        >
          <CreditCard className="w-3.5 h-3.5" />
          <span>Promotions & FCMB Transfer</span>
        </button>
        <button
          onClick={() => setVendorTab('qrcode')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 ${
            vendorTab === 'qrcode'
              ? 'bg-emerald-950 text-amber-300 shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200/80'
          }`}
        >
          <QrCode className="w-3.5 h-3.5" />
          <span>Business QR Code</span>
        </button>
      </div>

      {/* 1. Bento Grid Structure for Vendor Dashboard Overview */}
      {vendorTab === 'overview' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-5">
          {/* Card 1: Key Analytics Stat Tiles (lg:col-span-8) */}
          <div className="lg:col-span-8 bg-white/95 backdrop-blur-md rounded-3xl p-6 border border-slate-200/90 shadow-xs hover:shadow-md transition-all duration-300 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-emerald-700" />
                <h3 className="text-base font-black text-slate-900 font-display">
                  Storefront Performance Metrics
                </h3>
              </div>
              <span className="text-[11px] font-bold text-slate-400">Real-time Analytics</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-1 hover:-translate-y-0.5 transition-transform">
                <span className="text-[10px] font-extrabold text-slate-500 uppercase">Profile Views</span>
                <p className="text-2xl font-black text-emerald-950 font-mono">{vendor.viewsCount}</p>
                <span className="text-[10px] text-emerald-600 font-bold flex items-center gap-0.5">
                  <TrendingUp className="w-3 h-3" /> +14% this month
                </span>
              </div>

              <div className="p-4 bg-emerald-50/70 rounded-2xl border border-emerald-100 space-y-1 hover:-translate-y-0.5 transition-transform">
                <span className="text-[10px] font-extrabold text-emerald-800 uppercase">WhatsApp Leads</span>
                <p className="text-2xl font-black text-emerald-700 font-mono">{vendor.whatsappClicks}</p>
                <span className="text-[10px] text-emerald-700 font-bold">Direct Buyers</span>
              </div>

              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-1 hover:-translate-y-0.5 transition-transform">
                <span className="text-[10px] font-extrabold text-slate-500 uppercase">Phone Calls</span>
                <p className="text-2xl font-black text-slate-900 font-mono">{vendor.phoneClicks}</p>
                <span className="text-[10px] text-slate-500 font-medium">Inquiries</span>
              </div>

              <div className="p-4 bg-amber-50 rounded-2xl border border-amber-200/60 space-y-1 hover:-translate-y-0.5 transition-transform">
                <span className="text-[10px] font-extrabold text-amber-900 uppercase">Customer Rating</span>
                <p className="text-2xl font-black text-amber-600 font-mono">{vendor.rating} ★</p>
                <span className="text-[10px] text-amber-800 font-medium">{vendor.reviewCount} reviews</span>
              </div>
            </div>
          </div>

          {/* Card 2: Pending Enquiries & Customer Leads Bento Tile (lg:col-span-4) */}
          <div className="lg:col-span-4 bg-gradient-to-br from-emerald-950 via-emerald-900 to-teal-950 text-white rounded-3xl p-6 shadow-xs border border-emerald-800/80 flex flex-col justify-between hover:shadow-md transition-all duration-300">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-amber-400" />
                  <h4 className="text-xs font-black uppercase text-amber-400 tracking-wider">
                    Customer Enquiries
                  </h4>
                </div>
                <span className="px-2 py-0.5 bg-emerald-800 text-amber-300 text-[10px] font-bold rounded-full">
                  {pendingEnquiries.length} New
                </span>
              </div>

              {pendingEnquiries.length > 0 ? (
                <div className="p-3 bg-emerald-900/80 border border-emerald-700/60 rounded-2xl space-y-1.5">
                  <span className="text-[11px] font-bold text-white block">
                    {pendingEnquiries[0].customerName}
                  </span>
                  <p className="text-[11px] text-emerald-200 line-clamp-2">
                    "{pendingEnquiries[0].message}"
                  </p>
                </div>
              ) : (
                <p className="text-xs text-emerald-200/80">
                  All customer messages have been answered! Great responsiveness.
                </p>
              )}
            </div>

            <button
              onClick={() => setVendorTab('enquiries')}
              className="mt-4 w-full py-2.5 bg-amber-400 hover:bg-amber-500 text-emerald-950 font-black text-xs rounded-xl transition-all shadow-xs flex items-center justify-center gap-1.5"
            >
              <span>View Enquiries Inbox</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Card 3: Active Promotions & FCMB Transfer Bento Tile (lg:col-span-6) */}
          <div className="lg:col-span-6 bg-white/95 backdrop-blur-md rounded-3xl p-6 border border-slate-200/90 shadow-xs hover:shadow-md transition-all duration-300 flex flex-col justify-between space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-amber-500" />
                  <h3 className="text-base font-black text-slate-900 font-display">
                    Promotions & Sponsored Placement
                  </h3>
                </div>
                <span className="px-2.5 py-0.5 bg-amber-100 text-amber-900 text-[10px] font-bold rounded-full">
                  Boost Sales
                </span>
              </div>

              {activePromo ? (
                <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-emerald-950">{activePromo.promoTitle}</span>
                    <p className="text-[11px] text-emerald-700">Ref: {activePromo.txnRef}</p>
                  </div>
                  <span className="px-2.5 py-1 bg-emerald-600 text-white text-[10px] font-black rounded-full">
                    ACTIVE
                  </span>
                </div>
              ) : (
                <div className="p-4 bg-slate-50 border border-slate-200/80 rounded-2xl space-y-1">
                  <span className="text-xs font-bold text-slate-800">No active promotion running</span>
                  <p className="text-[11px] text-slate-500">
                    Activate a Sponsored Slot or Homepage Banner starting at ₦1,500 via manual FCMB bank transfer.
                  </p>
                </div>
              )}
            </div>

            <button
              onClick={() => setVendorTab('promotions')}
              className="w-full py-2.5 bg-emerald-800 hover:bg-emerald-900 text-amber-300 font-black text-xs rounded-xl transition-all flex items-center justify-center gap-1.5 shadow-xs"
            >
              <CreditCard className="w-3.5 h-3.5" />
              <span>Promote Store / Upload Receipt</span>
            </button>
          </div>

          {/* Card 4: Product Catalog Summary Bento Tile (lg:col-span-6) */}
          <div className="lg:col-span-6 bg-white/95 backdrop-blur-md rounded-3xl p-6 border border-slate-200/90 shadow-xs hover:shadow-md transition-all duration-300 flex flex-col justify-between space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ShoppingBag className="w-5 h-5 text-emerald-700" />
                  <h3 className="text-base font-black text-slate-900 font-display">
                    Inventory & Product Catalog
                  </h3>
                </div>
                <span className="text-xs font-bold text-slate-500 font-mono">
                  {vendorProducts.length} Items Listed
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
                  <span className="text-[10px] text-slate-500 font-bold block uppercase">Live Products</span>
                  <strong className="text-base font-black text-slate-900">{vendorProducts.length}</strong>
                </div>
                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
                  <span className="text-[10px] text-slate-500 font-bold block uppercase">Verified Status</span>
                  <strong className="text-xs font-bold text-emerald-700">100% Verified</strong>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setAddProductModalOpen(true)}
                className="flex-1 py-2.5 bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-1 shadow-xs"
              >
                <Plus className="w-4 h-4" /> Add Item
              </button>
              <button
                onClick={() => setVendorTab('products')}
                className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-xl transition-all"
              >
                Manage All
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2. Product Manager */}
      {vendorTab === 'products' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-black text-slate-900 font-display">
              Manage Products & Services
            </h3>
            <button
              onClick={() => setAddProductModalOpen(true)}
              className="px-4 py-2 bg-emerald-800 text-amber-300 font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-xs hover:bg-emerald-900"
            >
              <Plus className="w-4 h-4" /> Add New Item
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {vendorProducts.map((p) => (
              <div
                key={p.id}
                className="bg-white/95 backdrop-blur-md p-4 rounded-2xl border border-slate-200/90 flex items-center gap-4 shadow-xs hover:shadow-md transition-all duration-300"
              >
                <img src={p.images[0]} alt={p.name} className="w-16 h-16 rounded-xl object-cover shrink-0" />
                <div className="flex-1 min-w-0 space-y-0.5">
                  <h4 className="text-xs font-bold text-slate-900 truncate">{p.name}</h4>
                  <p className="text-xs font-black text-emerald-900 font-mono">₦{p.price.toLocaleString()}</p>
                  <span className="text-[10px] text-slate-400">Stock: {p.stock}</span>
                </div>
                <button
                  onClick={() => deleteProduct(p.id)}
                  className="p-2 text-red-500 hover:bg-red-50 rounded-xl transition-colors"
                  title="Delete Product"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 3. Enquiries Inbox */}
      {vendorTab === 'enquiries' && (
        <div className="space-y-4">
          <h3 className="text-base font-black text-slate-900 font-display">
            Customer Inquiries Inbox ({vendorEnquiries.length})
          </h3>
          <div className="space-y-3">
            {vendorEnquiries.map((e) => (
              <div key={e.id} className="p-5 bg-white/95 backdrop-blur-md rounded-2xl border border-slate-200/90 shadow-xs space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-xs text-slate-900">{e.customerName}</span>
                    <span className="text-[10px] text-slate-400">({e.customerPhone})</span>
                  </div>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${e.status === 'replied' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-900'}`}>
                    {e.status.toUpperCase()}
                  </span>
                </div>
                <p className="text-xs text-slate-700 bg-slate-50 p-3 rounded-xl border border-slate-100">"{e.message}"</p>
                {e.replyText && (
                  <div className="p-3 bg-emerald-50 text-emerald-900 rounded-xl border border-emerald-100 text-xs">
                    <strong className="block text-[10px] text-emerald-700">Your Reply:</strong>
                    {e.replyText}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 4. Reviews */}
      {vendorTab === 'reviews' && (
        <div className="space-y-4">
          <h3 className="text-base font-black text-slate-900 font-display">
            Customer Reviews ({vendorReviews.length})
          </h3>
          <div className="space-y-3">
            {vendorReviews.map((r) => (
              <div key={r.id} className="p-5 bg-white/95 backdrop-blur-md rounded-2xl border border-slate-200/90 shadow-xs space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-slate-900">{r.customerName}</span>
                  <div className="flex items-center text-amber-500 text-xs font-bold">
                    <Star className="w-3.5 h-3.5 fill-amber-400 mr-1" />
                    <span>{r.rating} / 5</span>
                  </div>
                </div>
                <p className="text-xs text-slate-600">"{r.comment}"</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 5. Manual Bank Transfer Advertising & Promotions */}
      {vendorTab === 'promotions' && (
        <div className="space-y-6">
          <div className="bg-gradient-to-r from-emerald-950 to-teal-900 text-white p-6 rounded-3xl shadow-lg space-y-2">
            <span className="text-amber-400 font-extrabold text-xs uppercase tracking-widest">
              Manual FCMB Bank Transfer Workflow
            </span>
            <h2 className="text-2xl font-black font-display">Promote Storefront & Boost Sales</h2>
            <p className="text-xs text-emerald-100 max-w-xl">
              Pay via bank transfer directly to FCMB account 9474918014, upload receipt proof below, and your promotion will be activated upon admin review!
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Left: Package Selector */}
            <div className="lg:col-span-5 space-y-3">
              <h3 className="text-xs font-bold uppercase text-slate-500">1. Select Promotion Package</h3>
              {PROMOTION_OPTIONS.map((opt) => (
                <div
                  key={opt.id}
                  onClick={() => setSelectedPromoOption(opt)}
                  className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                    selectedPromoOption.id === opt.id
                      ? 'border-emerald-600 bg-emerald-50/70 shadow-md ring-2 ring-emerald-500/20'
                      : 'border-slate-200 bg-white hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="font-extrabold text-xs text-emerald-950">{opt.title}</h4>
                    <span className="font-mono font-black text-xs text-emerald-900 bg-white px-2 py-0.5 rounded border">
                      ₦{opt.priceNaira.toLocaleString()} / {opt.durationLabel}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-600">{opt.description}</p>
                </div>
              ))}
            </div>

            {/* Right: Bank Account Details & Proof Upload Form */}
            <div className="lg:col-span-7 space-y-6">
              {/* Bank Details Card */}
              <div className="p-5 bg-amber-400/10 border border-amber-400/40 rounded-3xl space-y-2">
                <div className="flex items-center gap-2 font-bold text-amber-900 text-xs">
                  <CreditCard className="w-4 h-4 text-emerald-800" />
                  <span>Manual Bank Transfer Payment Details</span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs text-emerald-950 pt-1">
                  <div>
                    <span className="text-[10px] text-slate-500 block">Bank Name</span>
                    <strong className="font-bold">{MANUAL_PAYMENT_INFO.bankName}</strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 block">Account Name</span>
                    <strong className="font-bold">{MANUAL_PAYMENT_INFO.accountName}</strong>
                  </div>
                  <div className="col-span-2 pt-1 border-t border-amber-300/40">
                    <span className="text-[10px] text-slate-500 block">Account Number</span>
                    <strong className="text-lg font-mono font-black text-emerald-950 tracking-widest">
                      {MANUAL_PAYMENT_INFO.accountNumber}
                    </strong>
                  </div>
                </div>
              </div>

              {/* Upload Form */}
              <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-xs space-y-4">
                <h3 className="text-xs font-bold uppercase text-slate-500">
                  2. Upload Payment Proof ({selectedPromoOption.title} - ₦{selectedPromoOption.priceNaira.toLocaleString()})
                </h3>

                {promoSuccessMsg ? (
                  <div className="p-4 bg-emerald-50 text-emerald-900 font-bold text-xs rounded-2xl flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-emerald-700" />
                    <span>Proof of payment uploaded! Admin is reviewing your transfer now.</span>
                  </div>
                ) : (
                  <form onSubmit={handlePromotionUploadSubmit} className="space-y-4">
                    {/* Simulated Dropzone */}
                    <div className="p-4 border-2 border-dashed border-emerald-300 bg-emerald-50/50 rounded-2xl text-center space-y-2">
                      <Upload className="w-8 h-8 text-emerald-700 mx-auto" />
                      <div className="text-xs font-bold text-emerald-950">
                        {proofFileUploaded
                          ? `Uploaded: ${proofFileName}`
                          : 'Click to upload bank transfer screenshot / receipt PDF'}
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setProofFileUploaded(true);
                          setProofFileName(`FCMB_Receipt_${selectedPromoOption.priceNaira}Naira.png`);
                        }}
                        className="px-3 py-1.5 bg-emerald-700 text-white font-bold text-xs rounded-lg shadow-xs"
                      >
                        Simulate Receipt Upload
                      </button>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Transaction Reference / Session ID *</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. FCMB-20260804-984210"
                        value={txnRef}
                        onChange={(e) => setTxnRef(e.target.value)}
                        className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-bold text-emerald-950"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Additional Notes (Optional)</label>
                      <input
                        type="text"
                        placeholder="Paid via FCMB Mobile App at 10:30am..."
                        value={promoNotes}
                        onChange={(e) => setPromoNotes(e.target.value)}
                        className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={!proofFileUploaded}
                      className={`w-full py-3 text-xs font-bold rounded-xl shadow-xs transition-all ${
                        proofFileUploaded
                          ? 'bg-amber-400 text-emerald-950 hover:bg-amber-500'
                          : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                      }`}
                    >
                      Submit Payment Proof for Admin Verification
                    </button>
                  </form>
                )}
              </div>

              {/* Submitted Requests History */}
              <div className="space-y-3">
                <h3 className="text-xs font-bold uppercase text-slate-500">Your Promotion Requests History</h3>
                {vendorPromos.map((pr) => (
                  <div key={pr.id} className="p-4 bg-white rounded-2xl border border-slate-200/90 flex items-center justify-between text-xs shadow-xs">
                    <div>
                      <span className="font-bold text-emerald-950">{pr.promoTitle}</span>
                      <p className="text-[11px] text-slate-500">Txn: {pr.txnRef}</p>
                    </div>
                    <span
                      className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                        pr.status === 'approved'
                          ? 'bg-emerald-100 text-emerald-800'
                          : pr.status === 'pending'
                          ? 'bg-amber-100 text-amber-900 animate-pulse'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {pr.status.toUpperCase()}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 6. Business QR Code */}
      {vendorTab === 'qrcode' && (
        <div className="bg-white p-8 rounded-3xl border border-slate-200/90 text-center space-y-4 max-w-md mx-auto shadow-xs">
          <h3 className="text-lg font-black text-emerald-950 font-display">
            Storefront QR Code
          </h3>
          <p className="text-xs text-slate-600">
            Print this QR code for your shop banner or business cards in Sabo! Customers scanning it open your IkoroduSquare storefront directly.
          </p>

          <div className="p-6 bg-emerald-950 rounded-3xl inline-block border-4 border-amber-400 shadow-xl">
            <QrCode className="w-44 h-44 text-amber-300 mx-auto" />
            <span className="text-white font-mono font-bold text-xs block mt-2">
              ikorodusquare.ng/s/{vendor.slug}
            </span>
          </div>
        </div>
      )}

      {/* Add Product Modal */}
      {addProductModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 border border-slate-200">
            <h3 className="text-lg font-black text-emerald-950 font-display">
              Add New Product / Service
            </h3>

            <form onSubmit={handleAddProductSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Product Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Fresh Butter Bread 1kg"
                  value={newProdName}
                  onChange={(e) => setNewProdName(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border rounded-xl font-bold text-emerald-950"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Price in Naira (₦) *</label>
                <input
                  type="number"
                  required
                  value={newProdPrice}
                  onChange={(e) => setNewProdPrice(Number(e.target.value))}
                  className="w-full p-2.5 bg-slate-50 border rounded-xl font-mono font-bold text-emerald-950"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Category</label>
                <select
                  value={newProdCategory}
                  onChange={(e) => setNewProdCategory(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border rounded-xl font-bold"
                >
                  {categories.map((c) => (
                    <option key={c.id} value={c.name}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Description</label>
                <textarea
                  rows={3}
                  value={newProdDesc}
                  onChange={(e) => setNewProdDesc(e.target.value)}
                  placeholder="Details, ingredients, or warranty specifications..."
                  className="w-full p-2.5 bg-slate-50 border rounded-xl"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setAddProductModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 font-bold text-slate-700 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-800 text-white font-bold rounded-xl hover:bg-emerald-900 shadow-xs"
                >
                  Publish Product
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
