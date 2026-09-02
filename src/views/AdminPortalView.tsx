import React, { useState } from 'react';
import {
  ShieldCheck,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Building2,
  CreditCard,
  Eye,
  FileText,
  Search,
  Filter,
  Sparkles,
  TrendingUp,
  DollarSign,
  UserCheck,
  Ban,
  Clock,
  ExternalLink,
  ArrowLeft,
  Trash2,
  RefreshCw,
  Calendar,
  Layers,
  Image as ImageIcon,
  MessageSquare,
  Phone,
  Store,
  Star,
  X,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { MANUAL_PAYMENT_INFO } from '../data/mockData';
import { PromotionRequest, VerificationRequest, Vendor, VendorFeature } from '../types';
import { VendorFeatureBadge } from '../components/VendorFeatureBadge';
import { useSEO } from '../hooks/useSEO';

export const AdminPortalView: React.FC = () => {
  useSEO({
    title: 'Admin Portal | IkoroduSquare',
    robots: 'noindex, nofollow',
  });
  const {
    vendors,
    products,
    promotionRequests,
    verificationRequests,
    enquiries,
    reviews,
    isLoadingData,
    refreshData,
    approveVendor,
    rejectVendor,
    suspendVendor,
    reactivateVendor,
    deleteVendorPermanently,
    toggleVerifyVendor,
    toggleFeatureVendor,
    toggleVendorFeature,
    updateVendorFeatures,
    approvePromotionRequest,
    createDirectPromotionAssignment,
    rejectPromotionRequest,
    removeActivePromotion,
    approveVerificationRequest,
    rejectVerificationRequest,
    approveReview,
    rejectReview,
    deleteReview,
    auditLogs,
    setActiveTab,
    setSelectedVendorId,
    navigateToVendor,
    setSelectedProductId,
    setSelectedCategory,
    categories,
  } = useApp();

  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleManualRefresh = async () => {
    setIsRefreshing(true);
    try {
      await refreshData();
    } finally {
      setIsRefreshing(false);
    }
  };

  const [adminTab, setAdminTab] = useState<'pending-vendors' | 'verification-requests' | 'promotions-queue' | 'all-vendors' | 'review-moderation' | 'audit-logs'>('pending-vendors');
  const [reviewStatusFilter, setReviewStatusFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('pending');
  const [verifStatusFilter, setVerifStatusFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('pending');
  const [rejectVerifModalReq, setRejectVerifModalReq] = useState<VerificationRequest | null>(null);
  const [rejectVerifNote, setRejectVerifNote] = useState('');

  // Directory Merchants Filters & Search
  const [vendorSearch, setVendorSearch] = useState('');
  const [vendorStatusFilter, setVendorStatusFilter] = useState<'all' | 'pending' | 'approved' | 'suspended' | 'rejected'>('all');
  const [vendorCategoryFilter, setVendorCategoryFilter] = useState<string>('All');
  const [selectedVendorDetail, setSelectedVendorDetail] = useState<Vendor | null>(null);
  const [vendorToDelete, setVendorToDelete] = useState<Vendor | null>(null);

  // Promotion Approval Modal State
  const [assignSlotModalReq, setAssignSlotModalReq] = useState<PromotionRequest | null>(null);
  const [assignedSlot, setAssignedSlot] = useState<'homepage_banner' | 'featured_product' | 'sponsored_vendor' | 'category_top'>('sponsored_vendor');
  const [assignedTargetId, setAssignedTargetId] = useState<string>('');
  const [bannerImageUrl, setBannerImageUrl] = useState<string>('');
  const [bannerHeading, setBannerHeading] = useState<string>('');
  const [bannerSubtext, setBannerSubtext] = useState<string>('');
  const [customStartDate, setCustomStartDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [customDurationWeeks, setCustomDurationWeeks] = useState<number>(2);

  // Direct Placement Creator Modal State
  const [directPlacementModalOpen, setDirectPlacementModalOpen] = useState(false);
  const [directVendorId, setDirectVendorId] = useState('');
  const [directSlot, setDirectSlot] = useState<'homepage_banner' | 'featured_product' | 'featured_vendor' | 'sponsored_vendor' | 'category_top'>('featured_vendor');
  const [directTargetId, setDirectTargetId] = useState('');
  const [directStartDate, setDirectStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [directDurationWeeks, setDirectDurationWeeks] = useState(4);
  const [directBannerHeading, setDirectBannerHeading] = useState('');
  const [directBannerSubtext, setDirectBannerSubtext] = useState('');
  const [directBannerImageUrl, setDirectBannerImageUrl] = useState('');
  const [directAdminNote, setDirectAdminNote] = useState('');

  // Proof Screenshot Modal
  const [previewProofUrl, setPreviewProofUrl] = useState<string | null>(null);

  const pendingVendors = vendors.filter((v) => v.status === 'pending');
  const pendingPromos = promotionRequests.filter((pr) => pr.status === 'pending');
  const pendingVerifications = verificationRequests.filter((vr) => vr.status === 'pending');
  const pendingReviews = reviews.filter((r) => r.status === 'pending');

  const now = new Date();
  const activePromos = promotionRequests.filter((pr) => {
    if (pr.status !== 'approved') return false;
    if (!pr.expiresAt) return true;
    return new Date(pr.expiresAt) > now;
  });

  const expiredPromos = promotionRequests.filter((pr) => {
    if (pr.status === 'rejected') return true;
    if (pr.status === 'approved' && pr.expiresAt && new Date(pr.expiresAt) <= now) return true;
    return false;
  });

  const approvedVerificationsCount = verificationRequests.filter((vr) => vr.status === 'approved').length;

  const totalRevenueNaira =
    promotionRequests
      .filter((pr) => pr.status === 'approved')
      .reduce((sum, pr) => sum + pr.amountNaira, 0) +
    approvedVerificationsCount * 3000;

  // Filtered Vendors List
  const filteredVendors = vendors.filter((v) => {
    const matchesSearch =
      v.businessName.toLowerCase().includes(vendorSearch.toLowerCase()) ||
      v.ownerName.toLowerCase().includes(vendorSearch.toLowerCase()) ||
      v.ownerEmail.toLowerCase().includes(vendorSearch.toLowerCase()) ||
      v.area.toLowerCase().includes(vendorSearch.toLowerCase());

    const matchesStatus = vendorStatusFilter === 'all' || v.status === vendorStatusFilter;
    const matchesCategory = vendorCategoryFilter === 'All' || v.category === vendorCategoryFilter;

    return matchesSearch && matchesStatus && matchesCategory;
  });

  const openApproveSlotModal = (req: PromotionRequest) => {
    setAssignSlotModalReq(req);
    const defaultSlot =
      req.promoType === 'homepage_banner'
        ? 'homepage_banner'
        : req.promoType === 'featured_product'
        ? 'featured_product'
        : req.promoType === 'sponsored_vendor'
        ? 'sponsored_vendor'
        : req.promoType === 'category_top'
        ? 'category_top'
        : 'sponsored_vendor';

    setAssignedSlot(defaultSlot);
    setAssignedTargetId(req.vendorId);
    setBannerImageUrl('https://images.unsplash.com/photo-1555421689-491a97ff2040?auto=format&fit=crop&q=80&w=1200');
    setBannerHeading(`Featured SME Spotlight: ${req.vendorName}`);
    setBannerSubtext('Shop verified local products & authentic services directly in Ikorodu.');
    setCustomStartDate(new Date().toISOString().split('T')[0]);
    setCustomDurationWeeks(req.durationWeeks || 2);
  };

  const checkSlotLimit = (slot: string, categoryName?: string): { allowed: boolean; message: string } => {
    const active = promotionRequests.filter((pr) => {
      if (pr.status !== 'approved' && pr.status !== 'active') return false;
      const expires = pr.expiresAt ? new Date(pr.expiresAt) : null;
      return !expires || expires > new Date();
    });

    if (slot === 'homepage_banner') {
      const count = active.filter((pr) => pr.assignedSlot === 'homepage_banner').length;
      if (count >= 1) {
        return { allowed: false, message: 'Slot Limit Reached: Only 1 active Homepage Banner is allowed. Expire or remove the current active banner before placing a new one.' };
      }
    } else if (slot === 'sponsored_vendor') {
      const count = active.filter((pr) => pr.assignedSlot === 'sponsored_vendor').length;
      if (count >= 3) {
        return { allowed: false, message: 'Slot Limit Reached: Maximum 3 active Sponsored Vendors allowed. Expire or remove an active sponsored vendor first.' };
      }
    } else if (slot === 'featured_product') {
      const count = active.filter((pr) => pr.assignedSlot === 'featured_product').length;
      if (count >= 4) {
        return { allowed: false, message: 'Slot Limit Reached: Maximum 4 active Featured Products allowed. Expire or remove an active featured product first.' };
      }
    } else if (slot === 'category_top') {
      const cat = categoryName || 'All';
      const count = active.filter((pr) => pr.assignedSlot === 'category_top' && (pr.assignedCategory === cat || pr.categoryName === cat)).length;
      if (count >= 2) {
        return { allowed: false, message: `Slot Limit Reached: Maximum 2 active Category Top Spots allowed for category "${cat}".` };
      }
    }
    return { allowed: true, message: '' };
  };

  const handleDirectPlacementSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const targetVendor = vendors.find((v) => v.id === directVendorId);
    if (!targetVendor) return;

    const limitCheck = checkSlotLimit(directSlot, targetVendor.category);
    if (!limitCheck.allowed) {
      alert(limitCheck.message);
      return;
    }

    const payload = {
      vendorId: targetVendor.id,
      vendorName: targetVendor.businessName,
      assignedSlot: directSlot,
      assignedTargetId: directTargetId || targetVendor.id,
      startDate: directStartDate,
      durationWeeks: directDurationWeeks,
      bannerHeading: directBannerHeading || `Featured SME Spotlight: ${targetVendor.businessName}`,
      bannerSubtext: directBannerSubtext || 'Shop verified local deals & authentic products in Ikorodu.',
      bannerImageUrl: directBannerImageUrl || targetVendor.coverImageUrl || targetVendor.logoUrl,
      adminNote: directAdminNote || 'Direct placement assigned by Admin.',
    };

    console.log('[PROMOTION ASSIGNMENT CREATED]', payload);
    createDirectPromotionAssignment(payload);

    setDirectPlacementModalOpen(false);
    setDirectVendorId('');
    setDirectBannerHeading('');
    setDirectBannerSubtext('');
    setDirectBannerImageUrl('');
    setDirectAdminNote('');
  };

  const handleConfirmSlotApproval = (e: React.FormEvent) => {
    e.preventDefault();
    if (!assignSlotModalReq) return;

    const limitCheck = checkSlotLimit(assignedSlot, assignSlotModalReq.categoryName);
    if (!limitCheck.allowed) {
      alert(limitCheck.message);
      return;
    }

    const start = new Date(customStartDate);
    const expires = new Date(start.getTime() + customDurationWeeks * 7 * 24 * 60 * 60 * 1000);

    const approvalData = {
      assignedSlot,
      assignedTargetId: assignedTargetId || assignSlotModalReq.vendorId,
      startDate: start.toISOString(),
      expiresAt: expires.toISOString(),
      bannerImageUrl: assignedSlot === 'homepage_banner' ? bannerImageUrl : undefined,
      bannerHeading: assignedSlot === 'homepage_banner' ? bannerHeading : undefined,
      bannerSubtext: assignedSlot === 'homepage_banner' ? bannerSubtext : undefined,
    };

    console.log('[PROMOTION ASSIGNMENT CREATED - APPROVED QUEUE]', approvalData);

    approvePromotionRequest(
      assignSlotModalReq.id,
      'FCMB Bank Transfer verified by Administrator.',
      approvalData
    );

    setAssignSlotModalReq(null);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Bar with Back to Marketplace Button */}
      <div className="flex items-center justify-between bg-emerald-950 p-4 sm:p-5 rounded-2xl text-white shadow-md border border-amber-400/20">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-400 text-emerald-950 flex items-center justify-center font-black">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-sm sm:text-base font-black font-display text-amber-300">
              IkoroduSquare Administration Portal
            </h2>
            <p className="text-[11px] text-emerald-200">
              Full Governance • Vendor Verification • Manual FCMB Reconciliation • Promotion Slots
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleManualRefresh}
            disabled={isRefreshing || isLoadingData}
            className="px-3.5 py-2 bg-emerald-900 hover:bg-emerald-800 text-amber-300 font-bold text-xs rounded-xl shadow transition-all flex items-center gap-1.5 border border-amber-400/30 disabled:opacity-50"
            title="Reload all live records directly from Supabase"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing || isLoadingData ? 'animate-spin' : ''}`} />
            <span>{isRefreshing || isLoadingData ? 'Syncing...' : 'Sync Database'}</span>
          </button>

          <button
            onClick={() => setActiveTab('home')}
            className="px-4 py-2 bg-amber-400 hover:bg-amber-300 text-emerald-950 font-extrabold text-xs rounded-xl shadow transition-all flex items-center gap-2 border border-amber-300"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Marketplace</span>
          </button>
        </div>
      </div>

      {/* Admin Header & System Stats */}
      <div className="bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 text-emerald-950 p-6 sm:p-8 rounded-3xl shadow-lg">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1">
            <span className="px-2.5 py-0.5 bg-emerald-950 text-amber-300 font-extrabold text-[10px] uppercase tracking-wider rounded-full">
              Platform Governance
            </span>
            <h1 className="text-2xl sm:text-3xl font-black font-display">
              Management & Control Center
            </h1>
            <p className="text-xs text-emerald-950 font-semibold">
              Approve local vendor storefronts, manage promotion placements, and monitor platform engagement.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="bg-white/90 backdrop-blur-md p-3 rounded-2xl border border-amber-300 shadow-sm text-center">
              <span className="text-[10px] font-bold text-gray-500 block uppercase">Manual Revenue</span>
              <strong className="text-lg font-black text-emerald-950 font-mono">
                ₦{totalRevenueNaira.toLocaleString()}
              </strong>
            </div>
            <div className="bg-emerald-950 text-white p-3 rounded-2xl shadow-sm text-center">
              <span className="text-[10px] font-bold text-emerald-300 block uppercase">Active Promos</span>
              <strong className="text-lg font-black text-amber-300 font-mono">
                {activePromos.length} Placed
              </strong>
            </div>
            <div className="bg-emerald-900 text-white p-3 rounded-2xl shadow-sm text-center">
              <span className="text-[10px] font-bold text-emerald-300 block uppercase">Queue Action</span>
              <strong className="text-lg font-black text-amber-300 font-mono">
                {pendingVendors.length + pendingPromos.length} Pending
              </strong>
            </div>
          </div>
        </div>
      </div>

      {/* Admin Navigation Sub-Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-gray-200">
        <button
          onClick={() => setAdminTab('pending-vendors')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-2 ${
            adminTab === 'pending-vendors'
              ? 'bg-emerald-950 text-amber-300 shadow-sm'
              : 'bg-white text-gray-600 hover:bg-gray-100'
          }`}
        >
          <Building2 className="w-4 h-4 text-amber-400" />
          <span>Vendor Approvals ({pendingVendors.length})</span>
          {pendingVendors.length > 0 && (
            <span className="w-5 h-5 bg-red-500 text-white rounded-full text-[10px] font-bold flex items-center justify-center">
              {pendingVendors.length}
            </span>
          )}
        </button>

        <button
          onClick={() => setAdminTab('verification-requests')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-2 ${
            adminTab === 'verification-requests'
              ? 'bg-emerald-950 text-amber-300 shadow-sm'
              : 'bg-white text-gray-600 hover:bg-gray-100'
          }`}
        >
          <ShieldCheck className="w-4 h-4 text-amber-400" />
          <span>Verification Requests ({pendingVerifications.length})</span>
          {pendingVerifications.length > 0 && (
            <span className="w-5 h-5 bg-red-500 text-white rounded-full text-[10px] font-bold flex items-center justify-center">
              {pendingVerifications.length}
            </span>
          )}
        </button>

        <button
          onClick={() => setAdminTab('promotions-queue')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-2 ${
            adminTab === 'promotions-queue'
              ? 'bg-emerald-950 text-amber-300 shadow-sm'
              : 'bg-white text-gray-600 hover:bg-gray-100'
          }`}
        >
          <CreditCard className="w-4 h-4 text-emerald-400" />
          <span>Promotion Slots & Payments ({pendingPromos.length})</span>
          {pendingPromos.length > 0 && (
            <span className="w-5 h-5 bg-red-500 text-white rounded-full text-[10px] font-bold flex items-center justify-center">
              {pendingPromos.length}
            </span>
          )}
        </button>

        <button
          onClick={() => setAdminTab('all-vendors')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-2 ${
            adminTab === 'all-vendors' ? 'bg-emerald-950 text-amber-300 shadow-sm' : 'bg-white text-gray-600 hover:bg-gray-100'
          }`}
        >
          <Store className="w-4 h-4 text-amber-400" />
          <span>Directory Merchants ({vendors.length})</span>
        </button>

        <button
          onClick={() => setAdminTab('review-moderation')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-2 ${
            adminTab === 'review-moderation' ? 'bg-emerald-950 text-amber-300 shadow-sm' : 'bg-white text-gray-600 hover:bg-gray-100'
          }`}
        >
          <MessageSquare className="w-4 h-4 text-amber-400" />
          <span>Review Moderation ({pendingReviews.length})</span>
          {pendingReviews.length > 0 && (
            <span className="w-5 h-5 bg-amber-500 text-emerald-950 rounded-full text-[10px] font-bold flex items-center justify-center">
              {pendingReviews.length}
            </span>
          )}
        </button>

        <button
          onClick={() => setAdminTab('audit-logs')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-2 ${
            adminTab === 'audit-logs' ? 'bg-emerald-950 text-amber-300 shadow-sm' : 'bg-white text-gray-600 hover:bg-gray-100'
          }`}
        >
          <FileText className="w-4 h-4 text-emerald-400" />
          <span>System Audit Logs</span>
        </button>
      </div>

      {/* TAB 1: Pending Vendor Approvals Queue */}
      {adminTab === 'pending-vendors' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-black text-emerald-950 font-display">
              Pending Vendor Registrations Queue
            </h3>
            <span className="text-xs text-gray-500">
              Review CAC documents & owner details before publishing to IkoroduSquare.
            </span>
          </div>

          {pendingVendors.length === 0 ? (
            <div className="bg-white p-12 rounded-3xl text-center border border-gray-200 space-y-2">
              <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto" />
              <h4 className="text-base font-bold text-emerald-950">Approval Queue is Clear!</h4>
              <p className="text-xs text-gray-500">All registered SME vendors have been reviewed.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {pendingVendors.map((vendor) => (
                <div
                  key={vendor.id}
                  className="bg-white p-6 rounded-3xl border border-gray-150 shadow-sm space-y-4"
                >
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <img
                        src={vendor.logoUrl}
                        alt={vendor.businessName}
                        className="w-16 h-16 rounded-2xl object-cover border border-gray-200"
                      />
                      <div>
                        <h4 className="text-lg font-black text-emerald-950 font-display">
                          {vendor.businessName}
                        </h4>
                        <p className="text-xs text-emerald-800 font-bold">
                          Category: {vendor.category} • {vendor.area}, Ikorodu
                        </p>
                        <p className="text-xs text-gray-500">
                          Owner: {vendor.ownerName} ({vendor.ownerEmail})
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 flex-wrap">
                      <button
                        onClick={() => approveVendor(vendor.id)}
                        className="px-4 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl shadow flex items-center gap-1.5"
                      >
                        <CheckCircle2 className="w-4 h-4 text-amber-300" />
                        <span>Approve</span>
                      </button>

                      <button
                        onClick={() => {
                          approveVendor(vendor.id);
                          if (!vendor.isVerified) {
                            toggleVerifyVendor(vendor.id);
                          }
                        }}
                        className="px-4 py-2.5 bg-emerald-900 hover:bg-black text-amber-300 font-bold text-xs rounded-xl shadow flex items-center gap-1.5 border border-amber-400/40"
                        title="Approve business and assign verified badge immediately"
                      >
                        <ShieldCheck className="w-4 h-4 text-amber-400" />
                        <span>Approve & Verify</span>
                      </button>

                      <button
                        onClick={() => rejectVendor(vendor.id, 'Incomplete verification details')}
                        className="px-4 py-2.5 bg-red-100 hover:bg-red-200 text-red-700 font-bold text-xs rounded-xl flex items-center gap-1.5"
                      >
                        <XCircle className="w-4 h-4" />
                        <span>Reject</span>
                      </button>
                    </div>
                  </div>

                  <div className="p-4 bg-gray-50 rounded-2xl border text-xs text-gray-700 space-y-2">
                    <p>
                      <strong>Address:</strong> {vendor.address}
                    </p>
                    <p>
                      <strong>Description:</strong> {vendor.description}
                    </p>
                    <p>
                      <strong>WhatsApp:</strong> +{vendor.whatsapp} | <strong>Phone:</strong> {vendor.phone}
                    </p>
                    <div className="pt-2 border-t flex flex-wrap items-center gap-3">
                      <span>
                        <strong>CAC Certificate:</strong>{' '}
                        {vendor.cacCertificateUrl ? (
                          <a
                            href={vendor.cacCertificateUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-emerald-700 font-bold underline inline-flex items-center gap-1"
                          >
                            <span>View Attached Document</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        ) : (
                          <span className="text-gray-400">Not provided</span>
                        )}
                      </span>

                      <span>
                        <strong>NIN Identification:</strong>{' '}
                        {vendor.ninDocumentUrl ? (
                          <a
                            href={vendor.ninDocumentUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-emerald-700 font-bold underline inline-flex items-center gap-1"
                          >
                            <span>View NIN Document</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        ) : (
                          <span className="text-gray-400">Not provided</span>
                        )}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB: Paid Vendor Verification Requests (₦3,000) */}
      {adminTab === 'verification-requests' && (
        <div className="space-y-6">
          <div className="p-4 bg-emerald-950 text-emerald-100 rounded-2xl text-xs space-y-1">
            <div className="flex items-center gap-2 text-amber-300 font-bold">
              <ShieldCheck className="w-4 h-4" />
              <span>₦3,000 Paid Merchant Verification Audit & Approval</span>
            </div>
            <p>
              Match incoming ₦3,000 bank transfers to <strong>{MANUAL_PAYMENT_INFO.bankName}</strong> ({MANUAL_PAYMENT_INFO.accountName} - <strong className="font-mono text-amber-300">{MANUAL_PAYMENT_INFO.accountNumber}</strong>). Approving a request marks the vendor as <strong>Verified Business</strong> across IkoroduSquare without affecting search rankings or advertising.
            </p>
          </div>

          {/* Status Filter Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 sm:p-5 rounded-3xl border border-gray-150 shadow-xs">
            <div>
              <h3 className="text-base font-black text-emerald-950 font-display flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-700" />
                <span>Verification Requests Queue</span>
              </h3>
              <p className="text-xs text-gray-500 mt-0.5">
                Review payment proofs, confirm bank transaction sessions, and activate official merchant badges.
              </p>
            </div>

            <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-xl shrink-0 overflow-x-auto">
              {(['pending', 'approved', 'rejected', 'all'] as const).map((st) => {
                const count =
                  st === 'all'
                    ? verificationRequests.length
                    : verificationRequests.filter((vr) => vr.status === st).length;
                return (
                  <button
                    key={st}
                    onClick={() => setVerifStatusFilter(st)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold capitalize transition-all whitespace-nowrap ${
                      verifStatusFilter === st
                        ? 'bg-emerald-950 text-amber-300 shadow-xs'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    {st} ({count})
                  </button>
                );
              })}
            </div>
          </div>

          {/* List of Verification Requests */}
          {(() => {
            const filteredVerifs = verificationRequests.filter((vr) => {
              if (verifStatusFilter === 'all') return true;
              return vr.status === verifStatusFilter;
            });

            if (filteredVerifs.length === 0) {
              return (
                <div className="bg-white p-12 rounded-3xl border border-gray-150 text-center space-y-3">
                  <ShieldCheck className="w-12 h-12 text-gray-300 mx-auto" />
                  <h4 className="text-sm font-bold text-gray-700">No {verifStatusFilter} verification requests</h4>
                  <p className="text-xs text-gray-500">
                    {verifStatusFilter === 'pending'
                      ? 'All submitted verification payments have been reviewed and resolved.'
                      : 'No verification records matching this filter.'}
                  </p>
                </div>
              );
            }

            return (
              <div className="space-y-4">
                {filteredVerifs.map((req) => {
                  const targetVendor = vendors.find((v) => v.id === req.vendorId);
                  return (
                    <div
                      key={req.id}
                      className="bg-white p-5 sm:p-6 rounded-3xl border border-gray-150 shadow-xs space-y-4"
                    >
                      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="px-2.5 py-0.5 bg-emerald-100 text-emerald-900 font-bold text-xs rounded-full border border-emerald-300">
                              Verification Payment
                            </span>
                            <span className="font-mono font-black text-lg text-emerald-950">
                              ₦{req.amountNaira.toLocaleString()}
                            </span>
                            <span
                              className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                                req.status === 'approved'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : req.status === 'pending'
                                  ? 'bg-amber-100 text-amber-900 animate-pulse'
                                  : 'bg-red-100 text-red-800'
                              }`}
                            >
                              {req.status}
                            </span>
                          </div>

                          <h4 className="text-base font-extrabold text-emerald-950">
                            {req.vendorName || targetVendor?.businessName || 'Unknown Vendor'}
                          </h4>

                          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-500">
                            <span>
                              Txn Ref: <strong className="font-mono text-emerald-950">{req.txnRef}</strong>
                            </span>
                            <span>
                              Bank: <strong>{req.bankName}</strong> ({req.accountNumber})
                            </span>
                            <span>
                              Submitted: <strong>{new Date(req.requestedAt).toLocaleString()}</strong>
                            </span>
                            {targetVendor && (
                              <span>
                                Current Status:{' '}
                                <strong className={targetVendor.isVerified ? 'text-emerald-700' : 'text-slate-600'}>
                                  {targetVendor.isVerified ? 'Verified' : 'Unverified'}
                                </strong>
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-2">
                          <button
                            onClick={() => setPreviewProofUrl(req.proofUrl)}
                            className="px-3.5 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold text-xs rounded-xl flex items-center gap-1.5 transition-colors"
                          >
                            <FileText className="w-4 h-4 text-emerald-700" />
                            <span>View Receipt</span>
                          </button>

                          {req.status === 'pending' && (
                            <>
                              <button
                                onClick={() => approveVerificationRequest(req.id)}
                                className="px-4 py-2 bg-emerald-800 hover:bg-emerald-900 text-amber-300 font-bold text-xs rounded-xl shadow-xs flex items-center gap-1.5 transition-all cursor-pointer"
                              >
                                <CheckCircle2 className="w-4 h-4 text-amber-300" />
                                <span>Approve Verification</span>
                              </button>

                              <button
                                onClick={() => {
                                  setRejectVerifModalReq(req);
                                  setRejectVerifNote('');
                                }}
                                className="px-3.5 py-2 bg-red-100 hover:bg-red-200 text-red-700 font-bold text-xs rounded-xl transition-colors cursor-pointer"
                              >
                                Reject
                              </button>
                            </>
                          )}

                          {req.status === 'approved' && (
                            <span className="text-xs font-bold text-emerald-700 flex items-center gap-1">
                              <CheckCircle2 className="w-4 h-4" />
                              Approved {req.reviewedAt ? new Date(req.reviewedAt).toLocaleDateString() : ''}
                            </span>
                          )}

                          {req.status === 'rejected' && (
                            <button
                              onClick={() => {
                                setRejectVerifModalReq(req);
                                setRejectVerifNote(req.adminNote || '');
                              }}
                              className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-xs rounded-xl"
                            >
                              Edit Note / Re-Review
                            </button>
                          )}
                        </div>
                      </div>

                      {req.adminNote && (
                        <div className="text-xs bg-gray-50 p-3 rounded-2xl border border-gray-200 text-gray-700">
                          <strong>Admin Note:</strong> {req.adminNote}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            );
          })()}
        </div>
      )}

      {/* TAB 2: Promotion Slots & Manual FCMB Reconciliation */}
      {adminTab === 'promotions-queue' && (
        <div className="space-y-6">
          <div className="p-4 bg-emerald-950 text-emerald-100 rounded-2xl text-xs space-y-1">
            <div className="flex items-center gap-2 text-amber-300 font-bold">
              <ShieldCheck className="w-4 h-4" />
              <span>FCMB Bank Account Statement Reconciliation</span>
            </div>
            <p>
              Verify incoming bank transfers sent to <strong>{MANUAL_PAYMENT_INFO.bankName}</strong> ({MANUAL_PAYMENT_INFO.accountName} - <strong className="font-mono text-amber-300">{MANUAL_PAYMENT_INFO.accountNumber}</strong>). Match transaction reference & amount before assigning promo slots.
            </p>
          </div>

          {/* Pending Payment Requests */}
          <div className="space-y-4">
            <h3 className="text-base font-black text-emerald-950 font-display flex items-center justify-between">
              <span>Pending Manual Payment Requests ({pendingPromos.length})</span>
            </h3>

            {pendingPromos.length === 0 ? (
              <div className="bg-white p-8 rounded-3xl text-center border border-gray-200 space-y-1">
                <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto" />
                <h4 className="text-sm font-bold text-emerald-950">No Pending Payments</h4>
                <p className="text-xs text-gray-500">All uploaded bank receipts have been verified and assigned.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {pendingPromos.map((req) => (
                  <div
                    key={req.id}
                    className="bg-white p-6 rounded-3xl border border-gray-150 shadow-sm space-y-4"
                  >
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="px-2.5 py-0.5 bg-amber-400 text-emerald-950 font-bold text-xs rounded-full">
                            {req.promoTitle}
                          </span>
                          <span className="font-mono font-black text-lg text-emerald-950">
                            ₦{req.amountNaira.toLocaleString()}
                          </span>
                        </div>
                        <h4 className="text-sm font-extrabold text-emerald-950 mt-1">
                          Merchant: {req.vendorName}
                        </h4>
                        <p className="text-xs text-gray-500 font-mono">
                          Txn Ref: <strong>{req.txnRef}</strong> • Requested Duration: {req.durationWeeks} Weeks
                        </p>
                      </div>

                      <div className="flex flex-wrap items-center gap-2">
                        <button
                          onClick={() => setPreviewProofUrl(req.proofUrl)}
                          className="px-3.5 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold text-xs rounded-xl flex items-center gap-1"
                        >
                          <FileText className="w-4 h-4 text-emerald-700" />
                          <span>View Receipt</span>
                        </button>

                        <button
                          onClick={() => openApproveSlotModal(req)}
                          className="px-5 py-2.5 bg-emerald-800 hover:bg-emerald-900 text-amber-300 font-bold text-xs rounded-xl shadow flex items-center gap-1.5"
                        >
                          <CheckCircle2 className="w-4 h-4 text-amber-300" />
                          <span>Assign Slot & Approve</span>
                        </button>

                        <button
                          onClick={() => rejectPromotionRequest(req.id, 'Invalid bank transaction reference.')}
                          className="px-4 py-2.5 bg-red-100 hover:bg-red-200 text-red-700 font-bold text-xs rounded-xl"
                        >
                          Reject
                        </button>
                      </div>
                    </div>

                    {req.notes && (
                      <p className="text-xs text-gray-600 bg-gray-50 p-3 rounded-xl border">
                        <strong>Vendor Note:</strong> {req.notes}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Active Assigned Promotions Table */}
          <div className="space-y-4 pt-4 border-t border-gray-200">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-base font-black text-emerald-950 font-display flex items-center gap-2">
                  <span>Active Admin-Assigned Promotions ({activePromos.length})</span>
                </h3>
                <p className="text-xs text-gray-500">Live on Homepage, Banners, Featured Vendors & Search results</p>
              </div>

              <button
                onClick={() => setDirectPlacementModalOpen(true)}
                className="px-4 py-2.5 bg-emerald-800 hover:bg-emerald-900 text-amber-300 font-extrabold text-xs rounded-2xl shadow transition-all flex items-center gap-2"
              >
                <Sparkles className="w-4 h-4 text-amber-300" />
                <span>+ Assign Vendor / Product Spot</span>
              </button>
            </div>

            {activePromos.length === 0 ? (
              <div className="bg-white p-8 rounded-3xl text-center border border-gray-200 space-y-1">
                <Layers className="w-10 h-10 text-gray-400 mx-auto" />
                <h4 className="text-sm font-bold text-gray-800">No Active Promotions Currently Placed</h4>
                <p className="text-xs text-gray-500">Approve pending requests above to feature vendor products and banners on the homepage.</p>
              </div>
            ) : (
              <div className="bg-white rounded-3xl border border-gray-150 overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                  <thead className="bg-gray-50 border-b border-gray-200 text-gray-600 font-bold uppercase">
                    <tr>
                      <th className="p-4">Vendor & Target</th>
                      <th className="p-4">Assigned Slot</th>
                      <th className="p-4">Duration & Expiry</th>
                      <th className="p-4">Status</th>
                      <th className="p-4">Amount</th>
                      <th className="p-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {activePromos.map((promo) => (
                      <tr key={promo.id} className="hover:bg-gray-50 transition-colors">
                        <td className="p-4">
                          <strong className="font-bold text-emerald-950 block">{promo.vendorName}</strong>
                          {promo.assignedTargetId && (
                            <span className="text-[10px] text-emerald-700 font-semibold block">Target ID: {promo.assignedTargetId}</span>
                          )}
                          <span className="text-[10px] text-gray-500 font-mono">Ref: {promo.txnRef}</span>
                        </td>
                        <td className="p-4">
                          <span className="px-2.5 py-1 bg-amber-100 text-amber-900 font-extrabold text-[10px] rounded-lg border border-amber-300 uppercase tracking-wider">
                            {promo.assignedSlot || promo.promoType}
                          </span>
                          {promo.assignedCategory && (
                            <span className="text-[10px] text-gray-500 block font-medium mt-1">Cat: {promo.assignedCategory}</span>
                          )}
                        </td>
                        <td className="p-4 text-gray-700">
                          <div className="flex items-center gap-1 font-mono text-[11px]">
                            <Calendar className="w-3.5 h-3.5 text-emerald-700" />
                            <span>
                              {promo.startDate ? new Date(promo.startDate).toLocaleDateString() : 'Active'} →{' '}
                              {promo.expiresAt ? new Date(promo.expiresAt).toLocaleDateString() : 'N/A'}
                            </span>
                          </div>
                        </td>
                        <td className="p-4">
                          <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-bold rounded-md uppercase tracking-wide">
                            🟢 ACTIVE
                          </span>
                        </td>
                        <td className="p-4 font-mono font-bold text-emerald-900">
                          ₦{promo.amountNaira.toLocaleString()}
                        </td>
                        <td className="p-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => {
                                const slot = promo.assignedSlot || promo.promoType;
                                if (slot === 'homepage_banner' || slot === 'sponsored_vendor') {
                                  setActiveTab('home');
                                } else if (slot === 'featured_product') {
                                  if (promo.assignedTargetId) {
                                    setSelectedProductId(promo.assignedTargetId);
                                    setActiveTab('product-details');
                                  } else {
                                    setActiveTab('home');
                                  }
                                } else if (slot === 'category_top') {
                                  if (promo.assignedCategory) {
                                    setSelectedCategory(promo.assignedCategory);
                                  }
                                  setActiveTab('directory');
                                } else {
                                  setActiveTab('home');
                                }
                              }}
                              className="px-3 py-1.5 bg-emerald-950 hover:bg-black text-amber-300 font-bold text-[11px] rounded-lg shadow-xs transition-all flex items-center gap-1"
                              title="View active promotional spot live on public homepage or directory"
                            >
                              <Eye className="w-3.5 h-3.5 text-amber-400" />
                              <span>View Placement</span>
                            </button>

                            <button
                              onClick={() => removeActivePromotion(promo.id)}
                              className="px-3 py-1.5 bg-red-100 hover:bg-red-200 text-red-700 font-bold text-[11px] rounded-lg transition-all flex items-center gap-1"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              <span>Remove</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
          </div>

          {/* Expired / Past Promotions History */}
          {expiredPromos.length > 0 && (
            <div className="space-y-4 pt-4 border-t border-gray-200">
              <h3 className="text-sm font-bold text-gray-600 uppercase tracking-wider">
                Expired & Rejected History ({expiredPromos.length})
              </h3>
              <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden text-xs">
                <div className="p-3 bg-gray-50 border-b font-bold text-gray-500 flex justify-between">
                  <span>Merchant</span>
                  <span>Promo Type</span>
                  <span>Status</span>
                </div>
                <div className="divide-y divide-gray-100">
                  {expiredPromos.map((p) => (
                    <div key={p.id} className="p-3 flex justify-between items-center text-gray-600">
                      <div>
                        <strong>{p.vendorName}</strong>
                        <span className="text-[10px] text-gray-400 block font-mono">₦{p.amountNaira.toLocaleString()}</span>
                      </div>
                      <span className="text-[11px]">{p.promoTitle}</span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${p.status === 'approved' ? 'bg-gray-100 text-gray-600' : 'bg-red-100 text-red-700'}`}>
                        {p.status === 'approved' ? 'Expired' : 'Rejected'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 3: All Directory Merchants Management */}
      {adminTab === 'all-vendors' && (
        <div className="space-y-4">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <h3 className="text-base font-black text-emerald-950 font-display">
                Registered Directory Storefronts ({vendors.length})
              </h3>
              <p className="text-xs text-gray-500">
                Filter, inspect metrics, approve, suspend, reactivate, or permanently delete local business profiles.
              </p>
            </div>

            {/* Controls: Search & Filters */}
            <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
              {/* Search Box */}
              <div className="relative flex-1 md:w-56">
                <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={vendorSearch}
                  onChange={(e) => setVendorSearch(e.target.value)}
                  placeholder="Search vendor name or email..."
                  className="w-full pl-9 pr-3 py-2 text-xs border border-gray-200 rounded-xl focus:outline-none focus:border-emerald-600"
                />
              </div>

              {/* Status Filter */}
              <select
                value={vendorStatusFilter}
                onChange={(e: any) => setVendorStatusFilter(e.target.value)}
                className="py-2 px-3 text-xs border border-gray-200 rounded-xl focus:outline-none focus:border-emerald-600 bg-white font-bold"
              >
                <option value="all">All Statuses</option>
                <option value="approved">Approved</option>
                <option value="pending">Pending</option>
                <option value="suspended">Suspended</option>
                <option value="rejected">Rejected</option>
              </select>

              {/* Category Filter */}
              <select
                value={vendorCategoryFilter}
                onChange={(e) => setVendorCategoryFilter(e.target.value)}
                className="py-2 px-3 text-xs border border-gray-200 rounded-xl focus:outline-none focus:border-emerald-600 bg-white font-bold"
              >
                <option value="All">All Categories</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.name}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="bg-white rounded-3xl border border-gray-150 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-gray-50 border-b border-gray-200 text-gray-600 font-bold uppercase">
                  <tr>
                    <th className="p-4">Storefront</th>
                    <th className="p-4">Owner Info</th>
                    <th className="p-4">Area & Category</th>
                    <th className="p-4">Status</th>
                    <th className="p-4">Engagement Stats</th>
                    <th className="p-4 text-right">Management Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredVendors.map((v) => {
                    const vendorProds = products.filter((p) => p.vendorId === v.id);
                    const vendorEnqs = enquiries.filter((e) => e.vendorId === v.id);
                    const vendorRevs = reviews.filter((r) => r.vendorId === v.id);

                    return (
                      <tr key={v.id} className="hover:bg-gray-50/80 transition-colors">
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <img src={v.logoUrl} alt={v.businessName} className="w-10 h-10 rounded-xl object-cover border" />
                            <div>
                              <strong className="font-bold text-emerald-950 block">{v.businessName}</strong>
                              <div className="flex items-center gap-1 mt-0.5">
                                {v.isVerified && <span className="px-1.5 py-0.2 bg-emerald-600 text-white text-[9px] font-bold rounded">Verified</span>}
                                {v.isFeatured && <span className="px-1.5 py-0.2 bg-amber-400 text-emerald-950 text-[9px] font-bold rounded">Featured</span>}
                              </div>
                            </div>
                          </div>
                        </td>

                        <td className="p-4">
                          <span className="font-semibold text-gray-800 block">{v.ownerName}</span>
                          <span className="text-[10px] text-gray-500 font-mono">{v.ownerEmail}</span>
                        </td>

                        <td className="p-4">
                          <strong className="text-emerald-800 block font-bold">{v.area}</strong>
                          <span className="text-[10px] text-gray-500">{v.category}</span>
                        </td>

                        <td className="p-4">
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                              v.status === 'approved'
                                ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                                : v.status === 'pending'
                                ? 'bg-amber-100 text-amber-900 border border-amber-200'
                                : v.status === 'suspended'
                                ? 'bg-orange-100 text-orange-800 border border-orange-200'
                                : 'bg-red-100 text-red-800 border border-red-200'
                            }`}
                          >
                            {v.status}
                          </span>
                        </td>

                        <td className="p-4">
                          <div className="flex items-center gap-3 text-[11px] text-gray-600">
                            <span title="Products Listed" className="font-mono font-bold text-emerald-900">
                              {vendorProds.length} Prods
                            </span>
                            <span title="Enquiries" className="font-mono text-gray-500">
                              {vendorEnqs.length} Enq
                            </span>
                            <span title="WhatsApp Clicks" className="font-mono text-emerald-700">
                              {v.whatsappClicks || 0} WA
                            </span>
                          </div>
                        </td>

                        <td className="p-4 text-right">
                          <div className="flex items-center justify-end gap-1.5 flex-wrap">
                            <button
                              onClick={() => toggleVerifyVendor(v.id)}
                              className={`px-2.5 py-1 font-bold text-[10px] rounded-lg flex items-center gap-1 transition-colors ${
                                v.isVerified
                                  ? 'bg-emerald-700 hover:bg-emerald-800 text-white'
                                  : 'bg-amber-100 hover:bg-amber-200 text-amber-900 border border-amber-300'
                              }`}
                              title={v.isVerified ? 'Remove Verified Status' : 'Assign Verified Status'}
                            >
                              <ShieldCheck className="w-3 h-3" />
                              <span>{v.isVerified ? 'Verified' : 'Assign Verified'}</span>
                            </button>

                            <button
                              onClick={() => setSelectedVendorDetail(v)}
                              className="px-2.5 py-1 bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold text-[10px] rounded-lg flex items-center gap-1"
                              title="Inspect Details"
                            >
                              <Eye className="w-3 h-3 text-emerald-700" />
                              <span>Details</span>
                            </button>

                            {v.status === 'pending' && (
                              <button
                                onClick={() => approveVendor(v.id)}
                                className="px-2.5 py-1 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-[10px] rounded-lg"
                              >
                                Approve
                              </button>
                            )}

                            {v.status === 'approved' && (
                              <button
                                onClick={() => suspendVendor(v.id)}
                                className="px-2.5 py-1 bg-orange-100 hover:bg-orange-200 text-orange-800 font-bold text-[10px] rounded-lg"
                              >
                                Suspend
                              </button>
                            )}

                            {(v.status === 'suspended' || v.status === 'rejected') && (
                              <button
                                onClick={() => reactivateVendor(v.id)}
                                className="px-2.5 py-1 bg-emerald-100 hover:bg-emerald-200 text-emerald-800 font-bold text-[10px] rounded-lg flex items-center gap-1"
                              >
                                <RefreshCw className="w-3 h-3" />
                                <span>Reactivate</span>
                              </button>
                            )}

                            <button
                              onClick={() => setVendorToDelete(v)}
                              className="px-2.5 py-1 bg-red-100 hover:bg-red-200 text-red-700 font-bold text-[10px] rounded-lg flex items-center gap-1"
                              title="Delete Vendor Permanently"
                            >
                              <Trash2 className="w-3 h-3" />
                              <span>Delete</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: Customer Review Moderation Queue */}
      {adminTab === 'review-moderation' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-3xl border border-gray-150 shadow-sm">
            <div>
              <h3 className="text-base font-black text-emerald-950 font-display flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-amber-500" />
                Customer Review & Feedback Moderation
              </h3>
              <p className="text-xs text-gray-500 mt-0.5">
                Review ratings and feedback submitted by local residents before approving them for public display on vendor storefronts.
              </p>
            </div>

            {/* Status Filter Tabs */}
            <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-xl shrink-0">
              {(['pending', 'approved', 'rejected', 'all'] as const).map((st) => (
                <button
                  key={st}
                  onClick={() => setReviewStatusFilter(st)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold capitalize transition-all ${
                    reviewStatusFilter === st
                      ? 'bg-emerald-950 text-amber-300 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  {st} {st === 'pending' ? `(${pendingReviews.length})` : ''}
                </button>
              ))}
            </div>
          </div>

          {/* List of Reviews */}
          {(() => {
            const filteredReviews = reviews.filter((r) => {
              if (reviewStatusFilter === 'all') return true;
              if (reviewStatusFilter === 'pending') return r.status === 'pending';
              if (reviewStatusFilter === 'approved') return r.status === 'approved' || !r.status;
              if (reviewStatusFilter === 'rejected') return r.status === 'rejected';
              return true;
            });

            if (filteredReviews.length === 0) {
              return (
                <div className="bg-white p-12 rounded-3xl border border-gray-150 text-center space-y-3">
                  <MessageSquare className="w-12 h-12 text-gray-300 mx-auto" />
                  <h4 className="text-sm font-bold text-gray-700">No {reviewStatusFilter} reviews found</h4>
                  <p className="text-xs text-gray-500">
                    {reviewStatusFilter === 'pending'
                      ? 'Great job! There are currently no customer reviews waiting in the moderation queue.'
                      : 'No customer feedback matches the selected filter.'}
                  </p>
                </div>
              );
            }

            return (
              <div className="space-y-4">
                {filteredReviews.map((rev) => {
                  const targetVendor = vendors.find((v) => v.id === rev.vendorId);
                  const isPending = rev.status === 'pending';
                  const isApproved = rev.status === 'approved' || !rev.status;
                  const isRejected = rev.status === 'rejected';

                  return (
                    <div
                      key={rev.id}
                      className={`bg-white p-6 rounded-3xl border shadow-sm transition-all space-y-4 ${
                        isPending ? 'border-amber-300 bg-amber-50/20' : 'border-gray-150'
                      }`}
                    >
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-gray-100 pb-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-950 font-black flex items-center justify-center text-sm border border-emerald-200">
                            {rev.customerName.slice(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <h4 className="text-sm font-bold text-emerald-950">{rev.customerName}</h4>
                              <span className="text-[10px] text-gray-400 font-mono">
                                ({new Date(rev.createdAt).toLocaleString()})
                              </span>
                              {isPending && (
                                <span className="px-2.5 py-0.5 bg-amber-100 text-amber-900 border border-amber-300 rounded-full text-[10px] font-black flex items-center gap-1">
                                  <Clock className="w-3 h-3 text-amber-700" /> Awaiting Admin Approval
                                </span>
                              )}
                              {isApproved && (
                                <span className="px-2.5 py-0.5 bg-emerald-100 text-emerald-900 border border-emerald-300 rounded-full text-[10px] font-black flex items-center gap-1">
                                  <CheckCircle2 className="w-3 h-3 text-emerald-700" /> Approved & Live
                                </span>
                              )}
                              {isRejected && (
                                <span className="px-2.5 py-0.5 bg-red-100 text-red-900 border border-red-300 rounded-full text-[10px] font-black flex items-center gap-1">
                                  <XCircle className="w-3 h-3 text-red-700" /> Rejected
                                </span>
                              )}
                            </div>
                            {targetVendor ? (
                              <p className="text-xs text-gray-500 mt-0.5 flex items-center gap-1">
                                Target Vendor Storefront:{' '}
                                <button
                                  type="button"
                                  onClick={() => {
                                    navigateToVendor(targetVendor);
                                  }}
                                  className="font-bold text-emerald-800 hover:underline flex items-center gap-0.5"
                                >
                                  {targetVendor.businessName} ({targetVendor.area})
                                  <ExternalLink className="w-3 h-3" />
                                </button>
                              </p>
                            ) : (
                              <p className="text-xs text-gray-400">Target Vendor ID: {rev.vendorId}</p>
                            )}
                          </div>
                        </div>

                        {/* Star Rating Display */}
                        <div className="flex items-center gap-1 bg-amber-50 px-3 py-1.5 rounded-xl border border-amber-200">
                          <span className="text-xs font-black text-amber-950 mr-1 font-mono">{rev.rating}.0</span>
                          <div className="flex text-amber-400">
                            {[1, 2, 3, 4, 5].map((s) => (
                              <Star
                                key={s}
                                className={`w-4 h-4 ${s <= rev.rating ? 'fill-amber-400 text-amber-400' : 'text-gray-300'}`}
                              />
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Comment body */}
                      <div className="p-4 bg-gray-50 rounded-2xl border border-gray-150">
                        <p className="text-xs text-gray-800 leading-relaxed italic">
                          "{rev.comment}"
                        </p>
                      </div>

                      {/* Action buttons */}
                      <div className="flex items-center justify-between flex-wrap gap-2 pt-1">
                        <span className="text-[10px] text-gray-400 font-mono">Review ID: {rev.id}</span>

                        <div className="flex items-center gap-2">
                          {!isApproved && (
                            <button
                              onClick={() => approveReview(rev.id)}
                              className="px-4 py-2 bg-emerald-800 hover:bg-emerald-900 text-amber-300 font-bold text-xs rounded-xl shadow-sm flex items-center gap-1.5 transition-colors"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" /> Approve & Publish Live
                            </button>
                          )}

                          {!isRejected && (
                            <button
                              onClick={() => rejectReview(rev.id)}
                              className="px-4 py-2 bg-amber-100 hover:bg-amber-200 text-amber-950 font-bold text-xs rounded-xl border border-amber-300 flex items-center gap-1.5 transition-colors"
                            >
                              <XCircle className="w-3.5 h-3.5 text-amber-700" /> Reject Review
                            </button>
                          )}

                          <button
                            onClick={() => deleteReview(rev.id)}
                            className="px-3 py-2 bg-gray-100 hover:bg-red-50 text-gray-600 hover:text-red-700 font-bold text-xs rounded-xl border border-gray-200 flex items-center gap-1.5 transition-colors"
                            title="Delete permanently"
                          >
                            <Trash2 className="w-3.5 h-3.5" /> Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            );
          })()}
        </div>
      )}

      {/* TAB 5: System Audit Logs */}
      {adminTab === 'audit-logs' && (
        <div className="space-y-4">
          <h3 className="text-base font-black text-emerald-950 font-display">
            System Audit & Security Logs
          </h3>

          <div className="bg-white rounded-3xl border border-gray-150 p-4 space-y-2">
            {auditLogs.map((log) => (
              <div key={log.id} className="p-3 bg-gray-50 rounded-xl border flex items-center justify-between text-xs">
                <div>
                  <strong className="font-bold text-emerald-900">{log.action}</strong>
                  <p className="text-gray-600">{log.details}</p>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-gray-400 block font-mono">
                    {new Date(log.timestamp).toLocaleString()}
                  </span>
                  <span className="text-[10px] text-emerald-700 font-semibold">{log.performedBy}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* MODAL 1: Slot Assignment Modal */}
      {assignSlotModalReq && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-5 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="text-base font-black text-emerald-950 font-display flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-amber-500" />
                <span>Configure Promotion Placement Slot</span>
              </h3>
              <button
                onClick={() => setAssignSlotModalReq(null)}
                className="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-100 transition-colors"
                aria-label="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleConfirmSlotApproval} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-gray-700 mb-1">
                  Target Merchant / Vendor
                </label>
                <div className="p-3 bg-gray-50 rounded-xl border font-bold text-emerald-950">
                  {assignSlotModalReq.vendorName} (Ref: {assignSlotModalReq.txnRef})
                </div>
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">
                  Assign Promotion Slot Type
                </label>
                <select
                  value={assignedSlot}
                  onChange={(e: any) => setAssignedSlot(e.target.value)}
                  className="w-full p-2.5 border rounded-xl font-bold bg-white focus:outline-none focus:border-emerald-600"
                >
                  <option value="homepage_banner">Homepage Main Hero Banner Slot</option>
                  <option value="featured_product">Featured Products Grid Slot</option>
                  <option value="sponsored_vendor">Sponsored Vendor Directory Slot</option>
                  <option value="category_top">Category Top Placement Spot</option>
                </select>
              </div>

              {assignedSlot === 'homepage_banner' && (
                <div className="space-y-3 p-3 bg-amber-50 border border-amber-200 rounded-xl">
                  <div>
                    <label className="block font-bold text-amber-950 mb-0.5">Banner Heading</label>
                    <input
                      type="text"
                      value={bannerHeading}
                      onChange={(e) => setBannerHeading(e.target.value)}
                      className="w-full p-2 border rounded-lg bg-white"
                      required
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-amber-950 mb-0.5">Banner Subtext</label>
                    <input
                      type="text"
                      value={bannerSubtext}
                      onChange={(e) => setBannerSubtext(e.target.value)}
                      className="w-full p-2 border rounded-lg bg-white"
                      required
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-amber-950 mb-0.5">Banner Background Image URL</label>
                    <input
                      type="url"
                      value={bannerImageUrl}
                      onChange={(e) => setBannerImageUrl(e.target.value)}
                      className="w-full p-2 border rounded-lg bg-white"
                      required
                    />
                  </div>
                </div>
              )}

              {assignedSlot === 'featured_product' && (
                <div>
                  <label className="block font-bold text-gray-700 mb-1">
                    Select Specific Product to Feature
                  </label>
                  <select
                    value={assignedTargetId}
                    onChange={(e) => setAssignedTargetId(e.target.value)}
                    className="w-full p-2.5 border rounded-xl bg-white font-semibold"
                  >
                    {products
                      .filter((p) => p.vendorId === assignSlotModalReq.vendorId)
                      .map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name} (₦{p.price.toLocaleString()})
                        </option>
                      ))}
                  </select>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Start Date</label>
                  <input
                    type="date"
                    value={customStartDate}
                    onChange={(e) => setCustomStartDate(e.target.value)}
                    className="w-full p-2.5 border rounded-xl bg-white"
                    required
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1">Duration (Weeks)</label>
                  <input
                    type="number"
                    min={1}
                    max={52}
                    value={customDurationWeeks}
                    onChange={(e) => setCustomDurationWeeks(Number(e.target.value))}
                    className="w-full p-2.5 border rounded-xl bg-white"
                    required
                  />
                </div>
              </div>

              <div className="pt-3 border-t flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setAssignSlotModalReq(null)}
                  className="px-4 py-2 bg-gray-100 text-gray-700 font-bold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-800 text-amber-300 font-bold rounded-xl shadow"
                >
                  Approve & Launch Promotion
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: Vendor Details Drawer/Modal */}
      {selectedVendorDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 space-y-4 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b pb-3">
              <div className="flex items-center gap-3">
                <img
                  src={selectedVendorDetail.logoUrl}
                  alt={selectedVendorDetail.businessName}
                  className="w-12 h-12 rounded-2xl object-cover border"
                />
                <div>
                  <h3 className="text-base font-black text-emerald-950 font-display">
                    {selectedVendorDetail.businessName}
                  </h3>
                  <span className="text-xs text-gray-500 font-mono">
                    Owner: {selectedVendorDetail.ownerName} ({selectedVendorDetail.ownerEmail})
                  </span>
                </div>
              </div>
              <button
                onClick={() => setSelectedVendorDetail(null)}
                className="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-100 transition-colors"
                aria-label="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs text-gray-700">
              <div className="grid grid-cols-2 gap-2 bg-gray-50 p-3 rounded-2xl">
                <div>
                  <strong>Location Area:</strong> {selectedVendorDetail.area}, Ikorodu
                </div>
                <div>
                  <strong>Category:</strong> {selectedVendorDetail.category}
                </div>
                <div>
                  <strong>WhatsApp:</strong> +{selectedVendorDetail.whatsapp}
                </div>
                <div>
                  <strong>Phone:</strong> {selectedVendorDetail.phone}
                </div>
              </div>

              <div>
                <strong>Full Address:</strong> {selectedVendorDetail.address}
              </div>

              <div>
                <strong>Business Description:</strong> {selectedVendorDetail.description}
              </div>

              <div className="pt-2 border-t space-y-2">
                <h4 className="font-bold text-emerald-950">Verification Documents</h4>
                <div className="flex flex-wrap gap-3">
                  {selectedVendorDetail.cacCertificateUrl ? (
                    <a
                      href={selectedVendorDetail.cacCertificateUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1.5 bg-emerald-50 text-emerald-800 font-bold rounded-lg border border-emerald-200 inline-flex items-center gap-1"
                    >
                      <span>CAC Certificate</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  ) : (
                    <span className="text-gray-400">No CAC Uploaded</span>
                  )}

                  {selectedVendorDetail.ninDocumentUrl ? (
                    <a
                      href={selectedVendorDetail.ninDocumentUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1.5 bg-emerald-50 text-emerald-800 font-bold rounded-lg border border-emerald-200 inline-flex items-center gap-1"
                    >
                      <span>NIN Document</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  ) : (
                    <span className="text-gray-400">No NIN Uploaded</span>
                  )}
                </div>
              </div>

              <div className="pt-2 border-t">
                <div className="flex items-center justify-between p-3.5 bg-emerald-50/90 rounded-2xl border border-emerald-200/80">
                  <div className="flex items-center gap-2.5">
                    <ShieldCheck className={`w-5 h-5 shrink-0 ${selectedVendorDetail.isVerified ? 'text-emerald-700' : 'text-gray-400'}`} />
                    <div>
                      <span className="font-bold text-xs text-emerald-950 block">
                        Verified Status: {selectedVendorDetail.isVerified ? 'VERIFIED STOREFRONT ✓' : 'UNVERIFIED'}
                      </span>
                      <span className="text-[10px] text-gray-600">
                        {selectedVendorDetail.isVerified
                          ? 'Displays green verified trust badge to customers.'
                          : 'Assign verified status badge to boost buyer trust and visibility.'}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      toggleVerifyVendor(selectedVendorDetail.id);
                      setSelectedVendorDetail({
                        ...selectedVendorDetail,
                        isVerified: !selectedVendorDetail.isVerified,
                      });
                    }}
                    className={`px-3 py-1.5 font-bold text-xs rounded-xl shadow-sm transition-colors shrink-0 ${
                      selectedVendorDetail.isVerified
                        ? 'bg-red-100 hover:bg-red-200 text-red-700'
                        : 'bg-emerald-700 hover:bg-emerald-800 text-white'
                    }`}
                  >
                    {selectedVendorDetail.isVerified ? 'Remove Verified' : 'Assign Verified'}
                  </button>
                </div>
              </div>

              {/* Vendor Features & Accreditations Management */}
              <div className="pt-3 border-t space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-black text-emerald-950 text-xs flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-amber-500" />
                      <span>Admin-Assigned Features & Badges</span>
                    </h4>
                    <p className="text-[11px] text-gray-500">
                      Assign or remove official badges to highlight vendor trust, speed, or status on storefront and directory.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {(
                    [
                      'Verified Business',
                      'Trusted Vendor',
                      'Premium Vendor',
                      'Featured Vendor',
                      'Official Service Provider',
                      'Fast Response',
                    ] as VendorFeature[]
                  ).map((feat) => {
                    const currentFeatures = selectedVendorDetail.features || [];
                    const isAssigned = currentFeatures.includes(feat);

                    return (
                      <div
                        key={feat}
                        className={`p-2.5 rounded-2xl border transition-all flex items-center justify-between gap-2 ${
                          isAssigned
                            ? 'bg-emerald-50/60 border-emerald-300'
                            : 'bg-gray-50/70 border-gray-200'
                        }`}
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <VendorFeatureBadge feature={feat} size="sm" />
                        </div>

                        <button
                          type="button"
                          onClick={() => {
                            toggleVendorFeature(selectedVendorDetail.id, feat);
                            const updated = isAssigned
                              ? currentFeatures.filter((f) => f !== feat)
                              : [...currentFeatures, feat];
                            setSelectedVendorDetail({
                              ...selectedVendorDetail,
                              features: updated,
                            });
                          }}
                          className={`px-2.5 py-1 text-[10px] font-bold rounded-lg transition-all shrink-0 ${
                            isAssigned
                              ? 'bg-emerald-700 text-white hover:bg-red-600'
                              : 'bg-white text-gray-700 border border-gray-300 hover:bg-emerald-50 hover:text-emerald-800'
                          }`}
                        >
                          {isAssigned ? 'Assigned ✓' : '+ Assign'}
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="pt-2 border-t">
                <h4 className="font-bold text-emerald-950 mb-2">Analytics & Engagement</h4>
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="p-2 bg-gray-50 rounded-xl border">
                    <span className="block text-[10px] text-gray-500">Products</span>
                    <strong className="font-mono text-sm text-emerald-900">
                      {products.filter((p) => p.vendorId === selectedVendorDetail.id).length}
                    </strong>
                  </div>
                  <div className="p-2 bg-gray-50 rounded-xl border">
                    <span className="block text-[10px] text-gray-500">Enquiries</span>
                    <strong className="font-mono text-sm text-emerald-900">
                      {enquiries.filter((e) => e.vendorId === selectedVendorDetail.id).length}
                    </strong>
                  </div>
                  <div className="p-2 bg-gray-50 rounded-xl border">
                    <span className="block text-[10px] text-gray-500">WhatsApp Clicks</span>
                    <strong className="font-mono text-sm text-emerald-900">
                      {selectedVendorDetail.whatsappClicks || 0}
                    </strong>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t flex justify-end">
              <button
                onClick={() => setSelectedVendorDetail(null)}
                className="px-5 py-2 bg-emerald-950 text-white font-bold text-xs rounded-xl"
              >
                Close Details
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: Delete Vendor Confirmation Modal */}
      {vendorToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-red-200 text-center">
            <div className="w-12 h-12 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>
            <h3 className="text-base font-black text-slate-900">
              Permanently Delete Vendor?
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Are you sure you want to permanently delete <strong>"{vendorToDelete.businessName}"</strong>? This will remove the vendor storefront, all listed products, promotion requests, reviews, and enquiries.
            </p>
            <p className="text-[11px] text-red-600 font-bold bg-red-50 p-2 rounded-xl border border-red-200">
              This action cannot be undone. System audit log will record this deletion.
            </p>
            <div className="flex justify-center gap-3 pt-2">
              <button
                onClick={() => setVendorToDelete(null)}
                className="px-4 py-2 bg-slate-100 text-slate-700 font-bold text-xs rounded-xl"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  deleteVendorPermanently(vendorToDelete.id);
                  setVendorToDelete(null);
                }}
                className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-xl shadow"
              >
                Confirm Permanent Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3b: Direct Promotion Assignment Creator Modal */}
      {directPlacementModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-5 shadow-2xl border border-emerald-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="text-base font-black text-emerald-950 font-display flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-amber-500" />
                <span>Assign Direct Promotion Placement</span>
              </h3>
              <button
                onClick={() => setDirectPlacementModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-100 transition-colors"
                aria-label="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleDirectPlacementSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-gray-700 mb-1">Select Vendor / Merchant *</label>
                <select
                  required
                  value={directVendorId}
                  onChange={(e) => {
                    setDirectVendorId(e.target.value);
                    const v = vendors.find((v) => v.id === e.target.value);
                    if (v) {
                      setDirectBannerHeading(`Special Spotlight: ${v.businessName}`);
                      setDirectBannerSubtext(`Shop verified products & services from ${v.businessName} in Ikorodu.`);
                      setDirectBannerImageUrl(v.coverImageUrl || v.logoUrl);
                    }
                  }}
                  className="w-full p-2.5 border rounded-xl font-bold bg-white focus:outline-none focus:border-emerald-600"
                >
                  <option value="">-- Choose Vendor Storefront --</option>
                  {vendors
                    .filter((v) => v.status === 'approved')
                    .map((v) => (
                      <option key={v.id} value={v.id}>
                        {v.businessName} ({v.ownerName} • {v.area})
                      </option>
                    ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Target Promotion Slot *</label>
                <select
                  value={directSlot}
                  onChange={(e: any) => setDirectSlot(e.target.value)}
                  className="w-full p-2.5 border rounded-xl font-bold bg-white focus:outline-none focus:border-emerald-600"
                >
                  <option value="homepage_banner">Homepage Main Hero Banner Slot</option>
                  <option value="featured_vendor">Featured Vendors Carousel Spot</option>
                  <option value="sponsored_vendor">Sponsored Vendor Directory Badge</option>
                  <option value="category_top">Category Top Placement Spot</option>
                  <option value="featured_product">Featured Product Spotlight Grid</option>
                </select>
              </div>

              {directSlot === 'featured_product' && directVendorId && (
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Select Target Product *</label>
                  <select
                    value={directTargetId}
                    onChange={(e) => setDirectTargetId(e.target.value)}
                    className="w-full p-2.5 border rounded-xl bg-white"
                  >
                    <option value="">-- Feature Entire Vendor or Specific Product --</option>
                    {products
                      .filter((p) => p.vendorId === directVendorId)
                      .map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name} (₦{p.price.toLocaleString()})
                        </option>
                      ))}
                  </select>
                </div>
              )}

              {directSlot === 'homepage_banner' && (
                <div className="space-y-3 p-3 bg-amber-50 border border-amber-200 rounded-xl">
                  <div>
                    <label className="block font-bold text-amber-950 mb-0.5">Banner Heading Title</label>
                    <input
                      type="text"
                      value={directBannerHeading}
                      onChange={(e) => setDirectBannerHeading(e.target.value)}
                      className="w-full p-2 border rounded-lg bg-white"
                      placeholder="e.g. Premium Fashion & Accessories Hub"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-amber-950 mb-0.5">Banner Subtext</label>
                    <input
                      type="text"
                      value={directBannerSubtext}
                      onChange={(e) => setDirectBannerSubtext(e.target.value)}
                      className="w-full p-2 border rounded-lg bg-white"
                      placeholder="e.g. 100% Authentic Quality Guaranteed in Ikorodu"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-amber-950 mb-0.5">Banner Image URL</label>
                    <input
                      type="url"
                      value={directBannerImageUrl}
                      onChange={(e) => setDirectBannerImageUrl(e.target.value)}
                      className="w-full p-2 border rounded-lg bg-white font-mono text-[11px]"
                      placeholder="https://..."
                    />
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Start Date *</label>
                  <input
                    type="date"
                    value={directStartDate}
                    onChange={(e) => setDirectStartDate(e.target.value)}
                    className="w-full p-2.5 border rounded-xl bg-white"
                    required
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1">Duration (Weeks) *</label>
                  <input
                    type="number"
                    min={1}
                    max={52}
                    value={directDurationWeeks}
                    onChange={(e) => setDirectDurationWeeks(Number(e.target.value))}
                    className="w-full p-2.5 border rounded-xl bg-white"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Admin Internal Note (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. Complimentary 1-month promo granted by Admin..."
                  value={directAdminNote}
                  onChange={(e) => setDirectAdminNote(e.target.value)}
                  className="w-full p-2.5 border rounded-xl bg-white"
                />
              </div>

              <div className="pt-3 border-t flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setDirectPlacementModalOpen(false)}
                  className="px-4 py-2 bg-gray-100 text-gray-700 font-bold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!directVendorId}
                  className="px-5 py-2 bg-emerald-800 hover:bg-emerald-900 text-amber-300 font-bold rounded-xl shadow disabled:opacity-50"
                >
                  Create & Launch Placement
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 4: Payment Receipt Proof Preview & Download Modal */}
      {previewProofUrl && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-4 text-center border border-slate-200 shadow-2xl">
            <div className="flex items-center justify-between border-b pb-3 text-left">
              <div>
                <h3 className="text-base font-black text-emerald-950 font-display flex items-center gap-2">
                  <FileText className="w-5 h-5 text-emerald-700" />
                  Bank Transfer Payment Receipt Proof
                </h3>
                <p className="text-[11px] text-slate-500">
                  Uploaded file stored in Supabase Storage. Verify bank transaction details carefully.
                </p>
              </div>
              <button
                onClick={() => setPreviewProofUrl(null)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 transition-colors"
                aria-label="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="min-h-48 max-h-80 rounded-2xl overflow-hidden bg-slate-50 border border-slate-200 flex items-center justify-center p-2">
              {previewProofUrl.endsWith('.pdf') || previewProofUrl.includes('application/pdf') ? (
                <div className="space-y-3 py-6">
                  <FileText className="w-16 h-16 text-red-600 mx-auto animate-bounce" />
                  <p className="text-xs font-bold text-slate-800">PDF Bank Receipt Document</p>
                  <p className="text-[11px] text-slate-500">PDF documents cannot be rendered in image inline view.</p>
                </div>
              ) : (
                <img src={previewProofUrl} alt="Bank Receipt Proof" className="w-full max-h-72 object-contain rounded-xl" />
              )}
            </div>

            <div className="flex items-center justify-between gap-3 pt-2">
              <a
                href={previewProofUrl}
                target="_blank"
                rel="noopener noreferrer"
                download
                className="px-5 py-2.5 bg-emerald-800 hover:bg-emerald-900 text-amber-300 font-bold text-xs rounded-xl shadow flex items-center gap-1.5"
              >
                <ExternalLink className="w-4 h-4" />
                <span>Download / Open Original File</span>
              </a>

              <button
                onClick={() => setPreviewProofUrl(null)}
                className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-xl"
              >
                Close Window
              </button>
            </div>
          </div>
        </div>
      )}
      {/* MODAL 5: Verification Request Rejection Modal */}
      {rejectVerifModalReq && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 text-left border border-slate-200 shadow-2xl">
            <div className="flex items-center justify-between border-b pb-3">
              <div>
                <h3 className="text-base font-black text-emerald-950 font-display flex items-center gap-2">
                  <XCircle className="w-5 h-5 text-red-600" />
                  Reject Verification Request
                </h3>
                <p className="text-xs text-slate-500">
                  Provide a clear reason for the merchant (e.g. invalid receipt, mismatched amount).
                </p>
              </div>
              <button
                onClick={() => setRejectVerifModalReq(null)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 transition-colors"
                aria-label="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3">
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 text-xs">
                <span className="text-slate-500 font-bold block">Merchant</span>
                <p className="font-bold text-emerald-950 text-sm">{rejectVerifModalReq.vendorName}</p>
                <span className="text-slate-500 text-[11px] font-mono">Ref: {rejectVerifModalReq.txnRef}</span>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Reason for Rejection <span className="text-red-500">*</span>
                </label>
                <textarea
                  rows={3}
                  required
                  placeholder="e.g. Transaction session reference not found on FCMB bank account statement. Please verify and resubmit."
                  value={rejectVerifNote}
                  onChange={(e) => setRejectVerifNote(e.target.value)}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:ring-2 focus:ring-red-500 outline-hidden"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t">
              <button
                type="button"
                onClick={() => setRejectVerifModalReq(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  rejectVerificationRequest(
                    rejectVerifModalReq.id,
                    rejectVerifNote.trim() || 'Payment transaction reference could not be verified.'
                  );
                  setRejectVerifModalReq(null);
                }}
                className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors"
              >
                Confirm Rejection
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
