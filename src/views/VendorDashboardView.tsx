import React, { useState, useEffect } from 'react';
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
  ArrowLeft,
  Star,
  Zap,
  Camera,
  Globe,
  Instagram,
  Facebook,
  X,
  FileText,
  Check,
  Image as ImageIcon,
  User,
  MapPin,
  Building2,
  Save,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { MANUAL_PAYMENT_INFO, PROMOTION_OPTIONS, IKORODU_AREAS } from '../data/mockData';
import { Product, PromoType, BusinessHours, IkoroduArea } from '../types';
import { uploadFileToSupabaseStorage } from '../lib/supabaseDb';

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
    updateVendorProfile,
    categories,
    setActiveTab,
    setSelectedVendorId,
    currentUser,
  } = useApp();

  const [vendorTab, setVendorTab] = useState<'overview' | 'products' | 'profile' | 'enquiries' | 'reviews' | 'promotions' | 'qrcode'>('overview');

  // Strict Vendor Access Guard
  if (!currentUser || currentUser.role !== 'vendor') {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-6 text-center space-y-4">
        <div className="w-16 h-16 rounded-2xl bg-emerald-100 text-emerald-950 flex items-center justify-center mx-auto shadow-sm">
          <Store className="w-8 h-8 text-emerald-800" />
        </div>
        <h2 className="text-2xl font-black font-display text-emerald-950">
          Vendor Access Required
        </h2>
        <p className="text-xs text-slate-600 max-w-md mx-auto leading-relaxed">
          You must be logged in with an authenticated vendor account to access the Vendor Management Dashboard.
        </p>
        <div className="flex items-center justify-center gap-3 pt-2">
          <button
            onClick={() => setActiveTab('home')}
            className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-xl transition-all"
          >
            Return to Home
          </button>
          <button
            onClick={() => setActiveTab('register-vendor')}
            className="px-5 py-2.5 bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-xs rounded-xl shadow-sm transition-all"
          >
            Register a Business
          </button>
        </div>
      </div>
    );
  }

  // Product Add Modal
  const [addProductModalOpen, setAddProductModalOpen] = useState(false);
  const [newProdName, setNewProdName] = useState('');
  const [newProdPrice, setNewProdPrice] = useState<number>(5000);
  const [newProdCategory, setNewProdCategory] = useState('Fashion & Apparel');
  const [newProdDesc, setNewProdDesc] = useState('');
  const [newProdImage, setNewProdImage] = useState('https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?auto=format&fit=crop&q=80&w=800');

  // Manual Promotion Real Receipt State
  const [selectedPromoOption, setSelectedPromoOption] = useState(PROMOTION_OPTIONS[1]);
  const [proofFileUploaded, setProofFileUploaded] = useState(false);
  const [proofFileName, setProofFileName] = useState('');
  const [proofFileUrl, setProofFileUrl] = useState('');
  const [isUploadingReceipt, setIsUploadingReceipt] = useState(false);
  const [txnRef, setTxnRef] = useState('');
  const [promoNotes, setPromoNotes] = useState('');
  const [promoSuccessMsg, setPromoSuccessMsg] = useState(false);

  // Active vendor (match currentUser vendor strictly without falling back to other users' stores)
  const userVendor = vendors.find(
    (v) =>
      (currentUser?.email && v.ownerEmail?.toLowerCase() === currentUser.email.toLowerCase()) ||
      (currentUser?.id && v.userId === currentUser.id) ||
      (currentUser?.id && v.id === currentUser.id)
  );

  const vendor = userVendor || {
    id: currentUser?.id ? `v-${currentUser.id}` : `v-guest-${Date.now()}`,
    userId: currentUser?.id,
    businessName: currentUser?.firstName ? `${currentUser.firstName}'s Store` : 'My Store',
    slug: (currentUser?.firstName || 'my-store').toLowerCase().replace(/\s+/g, '-'),
    category: 'General Services',
    subcategory: 'General',
    description: 'Welcome to our verified storefront in Ikorodu.',
    address: 'Ikorodu, Lagos State',
    area: (currentUser?.area as any) || 'Sabo',
    lga: 'Ikorodu',
    state: 'Lagos State',
    country: 'Nigeria',
    phone: currentUser?.phone || '',
    whatsapp: currentUser?.phone ? currentUser.phone.replace(/\D/g, '') : '',
    yearsInBusiness: 1,
    logoUrl: 'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?auto=format&fit=crop&q=80&w=300',
    coverImageUrl: 'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?auto=format&fit=crop&q=80&w=1200',
    galleryUrls: [],
    ownerName: currentUser?.firstName ? `${currentUser.firstName} ${currentUser.lastName || ''}`.trim() : 'Store Owner',
    ownerEmail: currentUser?.email || '',
    ownerPhone: currentUser?.phone || '',
    status: 'approved' as const,
    isVerified: true,
    isFeatured: false,
    isPremium: false,
    rating: 5.0,
    reviewCount: 0,
    businessHours: [
      { day: 'Monday', openTime: '08:00', closeTime: '18:00', isClosed: false },
      { day: 'Tuesday', openTime: '08:00', closeTime: '18:00', isClosed: false },
      { day: 'Wednesday', openTime: '08:00', closeTime: '18:00', isClosed: false },
      { day: 'Thursday', openTime: '08:00', closeTime: '18:00', isClosed: false },
      { day: 'Friday', openTime: '08:00', closeTime: '18:00', isClosed: false },
      { day: 'Saturday', openTime: '09:00', closeTime: '17:00', isClosed: false },
      { day: 'Sunday', openTime: '00:00', closeTime: '00:00', isClosed: true },
    ],
    deliveryAreas: ['Sabo', 'Garage', 'Agric'],
    viewsCount: 0,
    whatsappClicks: 0,
    phoneClicks: 0,
    createdAt: new Date().toISOString(),
  };

  // Vendor Profile Edit State
  const [profileData, setProfileData] = useState({
    businessName: vendor.businessName || '',
    category: vendor.category || 'General Services',
    subcategory: vendor.subcategory || '',
    description: vendor.description || '',
    address: vendor.address || '',
    area: vendor.area || 'Sabo',
    phone: vendor.phone || '',
    whatsapp: vendor.whatsapp || '',
    website: vendor.website || '',
    instagram: vendor.instagram || '',
    facebook: vendor.facebook || '',
    tiktok: vendor.tiktok || '',
    yearsInBusiness: vendor.yearsInBusiness || 1,
    logoUrl: vendor.logoUrl || '',
    coverImageUrl: vendor.coverImageUrl || '',
    ownerName: vendor.ownerName || '',
    ownerEmail: vendor.ownerEmail || '',
    ownerPhone: vendor.ownerPhone || '',
  });

  const [profileHours, setProfileHours] = useState<BusinessHours[]>(vendor.businessHours || []);
  const [profileGallery, setProfileGallery] = useState<string[]>(vendor.galleryUrls || []);
  const [profileDeliveryAreas, setProfileDeliveryAreas] = useState<string[]>(vendor.deliveryAreas || []);
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  useEffect(() => {
    setProfileData({
      businessName: vendor.businessName || '',
      category: vendor.category || 'General Services',
      subcategory: vendor.subcategory || '',
      description: vendor.description || '',
      address: vendor.address || '',
      area: vendor.area || 'Sabo',
      phone: vendor.phone || '',
      whatsapp: vendor.whatsapp || '',
      website: vendor.website || '',
      instagram: vendor.instagram || '',
      facebook: vendor.facebook || '',
      tiktok: vendor.tiktok || '',
      yearsInBusiness: vendor.yearsInBusiness || 1,
      logoUrl: vendor.logoUrl || '',
      coverImageUrl: vendor.coverImageUrl || '',
      ownerName: vendor.ownerName || '',
      ownerEmail: vendor.ownerEmail || '',
      ownerPhone: vendor.ownerPhone || '',
    });
    setProfileHours(vendor.businessHours || []);
    setProfileGallery(vendor.galleryUrls || []);
    setProfileDeliveryAreas(vendor.deliveryAreas || []);
  }, [vendor.id, vendor.businessName, vendor.ownerEmail]);
  const [profileSaveSuccess, setProfileSaveSuccess] = useState(false);

  useEffect(() => {
    if (vendor) {
      setProfileData({
        businessName: vendor.businessName || '',
        category: vendor.category || 'Fashion & Apparel',
        subcategory: vendor.subcategory || '',
        description: vendor.description || '',
        address: vendor.address || '',
        area: vendor.area || 'Sabo',
        phone: vendor.phone || '',
        whatsapp: vendor.whatsapp || '',
        website: vendor.website || '',
        instagram: vendor.instagram || '',
        facebook: vendor.facebook || '',
        tiktok: vendor.tiktok || '',
        yearsInBusiness: vendor.yearsInBusiness || 1,
        logoUrl: vendor.logoUrl || '',
        coverImageUrl: vendor.coverImageUrl || '',
        ownerName: vendor.ownerName || '',
        ownerEmail: vendor.ownerEmail || '',
        ownerPhone: vendor.ownerPhone || '',
      });
      if (vendor.businessHours) setProfileHours(vendor.businessHours);
      if (vendor.galleryUrls) setProfileGallery(vendor.galleryUrls);
      if (vendor.deliveryAreas) setProfileDeliveryAreas(vendor.deliveryAreas);
    }
  }, [vendor]);
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

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = await uploadFileToSupabaseStorage('vendor-logos', `logo-${vendor.id}-${Date.now()}.${file.name.split('.').pop()}`, file);
    if (url) {
      setProfileData((prev) => ({ ...prev, logoUrl: url }));
    } else {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileData((prev) => ({ ...prev, logoUrl: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = await uploadFileToSupabaseStorage('vendor-covers', `cover-${vendor.id}-${Date.now()}.${file.name.split('.').pop()}`, file);
    if (url) {
      setProfileData((prev) => ({ ...prev, coverImageUrl: url }));
    } else {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileData((prev) => ({ ...prev, coverImageUrl: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleGalleryUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const url = await uploadFileToSupabaseStorage('vendor-gallery', `gal-${vendor.id}-${Date.now()}-${i}.${file.name.split('.').pop()}`, file);
      if (url) {
        setProfileGallery((prev) => [...prev, url]);
      } else {
        const reader = new FileReader();
        reader.onloadend = () => {
          setProfileGallery((prev) => [...prev, reader.result as string]);
        };
        reader.readAsDataURL(file);
      }
    }
  };

  const handleReceiptFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploadingReceipt(true);
    setProofFileName(file.name);
    
    const url = await uploadFileToSupabaseStorage('promotion-receipts', `receipt-${vendor.id}-${Date.now()}.${file.name.split('.').pop()}`, file);
    if (url) {
      setProofFileUrl(url);
      setProofFileUploaded(true);
    } else {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProofFileUrl(reader.result as string);
        setProofFileUploaded(true);
      };
      reader.readAsDataURL(file);
    }
    setIsUploadingReceipt(false);
  };

  const handleSaveProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingProfile(true);
    updateVendorProfile(vendor.id, {
      ...profileData,
      businessHours: profileHours,
      galleryUrls: profileGallery,
      deliveryAreas: profileDeliveryAreas,
    });
    setIsSavingProfile(false);
    setProfileSaveSuccess(true);
    setTimeout(() => setProfileSaveSuccess(false), 3000);
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
      proofUrl: proofFileUrl || 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&q=80&w=800',
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
      setProofFileUrl('');
      setProofFileName('');
    }, 2500);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Bar with Back to Marketplace Button */}
      <div className="flex items-center justify-between bg-emerald-950 p-4 sm:p-5 rounded-2xl text-white shadow-md border border-emerald-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-400 text-emerald-950 flex items-center justify-center font-black">
            <Store className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-sm sm:text-base font-black font-display text-amber-300">
              Vendor Control Dashboard
            </h2>
            <p className="text-[11px] text-emerald-200">
              Manage Products • Respond to Customer Enquiries • Submit FCMB Promotion Receipts
            </p>
          </div>
        </div>

        <button
          onClick={() => setActiveTab('home')}
          className="px-4 py-2 bg-amber-400 hover:bg-amber-300 text-emerald-950 font-extrabold text-xs rounded-xl shadow transition-all flex items-center gap-2 border border-amber-300"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Marketplace</span>
        </button>
      </div>

      {/* Header Store Status Bento Banner */}
      <div className="bg-white/90 backdrop-blur-md rounded-3xl border border-slate-200/90 p-6 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition-all duration-300 hover:scale-[1.02] hover:shadow-md">
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
          onClick={() => setVendorTab('profile')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 ${
            vendorTab === 'profile'
              ? 'bg-emerald-950 text-amber-300 shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200/80'
          }`}
        >
          <Edit className="w-3.5 h-3.5 text-amber-400" />
          <span>Edit Business Profile</span>
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
          <div className="lg:col-span-8 bg-white/90 backdrop-blur-md rounded-3xl p-6 border border-slate-200/90 shadow-xs hover:shadow-md transition-all duration-300 hover:scale-[1.02] space-y-4">
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
          <div className="lg:col-span-4 bg-gradient-to-br from-emerald-950 via-emerald-900 to-teal-950 text-white rounded-3xl p-6 shadow-xs border border-emerald-800/80 backdrop-blur-md flex flex-col justify-between hover:shadow-md transition-all duration-300 hover:scale-[1.02]">
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
          <div className="lg:col-span-6 bg-white/90 backdrop-blur-md rounded-3xl p-6 border border-slate-200/90 shadow-xs hover:shadow-md transition-all duration-300 hover:scale-[1.02] flex flex-col justify-between space-y-4">
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
          <div className="lg:col-span-6 bg-white/90 backdrop-blur-md rounded-3xl p-6 border border-slate-200/90 shadow-xs hover:shadow-md transition-all duration-300 hover:scale-[1.02] flex flex-col justify-between space-y-4">
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

      {/* 2b. Edit Business Profile */}
      {vendorTab === 'profile' && (
        <form onSubmit={handleSaveProfileSubmit} className="space-y-6">
          {/* Top Banner & Alert */}
          <div className="bg-white/95 backdrop-blur-md p-6 rounded-3xl border border-slate-200/90 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-black text-slate-900 font-display flex items-center gap-2">
                <Building2 className="w-5 h-5 text-emerald-700" />
                Edit Business Profile
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Manage your storefront details, logo, cover image, operating hours, and social channels. All changes save directly to Supabase.
              </p>
            </div>

            <button
              type="submit"
              disabled={isSavingProfile}
              className="px-6 py-3 bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-bold rounded-2xl shadow-md transition-all flex items-center gap-2 shrink-0 disabled:opacity-50"
            >
              <Save className="w-4 h-4 text-amber-300" />
              <span>{isSavingProfile ? 'Saving Changes...' : 'Save Profile Changes'}</span>
            </button>
          </div>

          {profileSaveSuccess && (
            <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-950 font-bold text-xs rounded-2xl flex items-center gap-2 animate-in fade-in">
              <CheckCircle2 className="w-5 h-5 text-emerald-700" />
              <span>Business profile updated successfully in database! Your storefront is live with updated details.</span>
            </div>
          )}

          {/* Branding Section (Logo & Cover Image Upload) */}
          <div className="p-6 bg-white/95 backdrop-blur-md rounded-3xl border border-slate-200/90 shadow-xs space-y-6">
            <h4 className="text-xs font-extrabold uppercase tracking-wider text-emerald-900 flex items-center gap-2 border-b border-slate-100 pb-3">
              <Camera className="w-4 h-4 text-amber-500" />
              Storefront Branding Assets
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Logo Upload */}
              <div className="space-y-3">
                <label className="block text-xs font-bold text-slate-700">Business Logo</label>
                <div className="flex items-center gap-4">
                  <div className="relative w-20 h-20 rounded-2xl border border-slate-200 overflow-hidden bg-slate-50 shrink-0">
                    {profileData.logoUrl ? (
                      <img src={profileData.logoUrl} alt="Logo preview" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-400">
                        <ImageIcon className="w-8 h-8" />
                      </div>
                    )}
                  </div>
                  <div className="space-y-2 flex-1">
                    <label className="inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-200 rounded-xl text-xs font-bold cursor-pointer transition-all">
                      <Upload className="w-4 h-4 text-emerald-700" />
                      <span>Upload Logo</span>
                      <input type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" />
                    </label>
                    <p className="text-[11px] text-slate-500">Square PNG, JPG, or WEBP. Max 5MB.</p>
                  </div>
                </div>
              </div>

              {/* Cover Image Upload */}
              <div className="space-y-3">
                <label className="block text-xs font-bold text-slate-700">Cover Banner Image</label>
                <div className="space-y-2">
                  <div className="relative w-full h-24 rounded-2xl border border-slate-200 overflow-hidden bg-slate-50">
                    {profileData.coverImageUrl ? (
                      <img src={profileData.coverImageUrl} alt="Cover preview" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-400">
                        <ImageIcon className="w-8 h-8" />
                      </div>
                    )}
                  </div>
                  <label className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-200 rounded-xl text-xs font-bold cursor-pointer transition-all">
                    <Upload className="w-4 h-4 text-emerald-700" />
                    <span>Upload Cover Image</span>
                    <input type="file" accept="image/*" onChange={handleCoverUpload} className="hidden" />
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Business Core Information */}
          <div className="p-6 bg-white/95 backdrop-blur-md rounded-3xl border border-slate-200/90 shadow-xs space-y-4">
            <h4 className="text-xs font-extrabold uppercase tracking-wider text-emerald-900 flex items-center gap-2 border-b border-slate-100 pb-3">
              <Store className="w-4 h-4 text-amber-500" />
              Core Business Details
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Business Name *</label>
                <input
                  type="text"
                  required
                  value={profileData.businessName}
                  onChange={(e) => setProfileData({ ...profileData, businessName: e.target.value })}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Business Category *</label>
                <select
                  value={profileData.category}
                  onChange={(e) => setProfileData({ ...profileData, category: e.target.value })}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900"
                >
                  {categories.map((c) => (
                    <option key={c.id} value={c.name}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Subcategory (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. Men's Fashion, Phones & Accessories..."
                  value={profileData.subcategory}
                  onChange={(e) => setProfileData({ ...profileData, subcategory: e.target.value })}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Years in Business</label>
                <input
                  type="number"
                  min="0"
                  value={profileData.yearsInBusiness}
                  onChange={(e) => setProfileData({ ...profileData, yearsInBusiness: parseInt(e.target.value) || 1 })}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Business Description *</label>
              <textarea
                rows={4}
                required
                value={profileData.description}
                onChange={(e) => setProfileData({ ...profileData, description: e.target.value })}
                placeholder="Describe your products, quality guarantees, delivery terms..."
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs leading-relaxed"
              />
            </div>
          </div>

          {/* Owner & Contact Information */}
          <div className="p-6 bg-white/95 backdrop-blur-md rounded-3xl border border-slate-200/90 shadow-xs space-y-4">
            <h4 className="text-xs font-extrabold uppercase tracking-wider text-emerald-900 flex items-center gap-2 border-b border-slate-100 pb-3">
              <User className="w-4 h-4 text-amber-500" />
              Owner & Contact Channels
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Owner Name *</label>
                <input
                  type="text"
                  required
                  value={profileData.ownerName}
                  onChange={(e) => setProfileData({ ...profileData, ownerName: e.target.value })}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Owner Email *</label>
                <input
                  type="email"
                  required
                  value={profileData.ownerEmail}
                  onChange={(e) => setProfileData({ ...profileData, ownerEmail: e.target.value })}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Owner Phone *</label>
                <input
                  type="text"
                  required
                  value={profileData.ownerPhone}
                  onChange={(e) => setProfileData({ ...profileData, ownerPhone: e.target.value })}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Store Phone Number *</label>
                <input
                  type="text"
                  required
                  value={profileData.phone}
                  onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">WhatsApp Number (e.g. 2348012345678) *</label>
                <input
                  type="text"
                  required
                  value={profileData.whatsapp}
                  onChange={(e) => setProfileData({ ...profileData, whatsapp: e.target.value })}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-bold text-emerald-900"
                />
              </div>
            </div>
          </div>

          {/* Location & Operating Hours */}
          <div className="p-6 bg-white/95 backdrop-blur-md rounded-3xl border border-slate-200/90 shadow-xs space-y-6">
            <h4 className="text-xs font-extrabold uppercase tracking-wider text-emerald-900 flex items-center gap-2 border-b border-slate-100 pb-3">
              <MapPin className="w-4 h-4 text-amber-500" />
              Address & Operating Hours
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Street Address *</label>
                <input
                  type="text"
                  required
                  value={profileData.address}
                  onChange={(e) => setProfileData({ ...profileData, address: e.target.value })}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Ikorodu Area *</label>
                <select
                  value={profileData.area}
                  onChange={(e) => setProfileData({ ...profileData, area: e.target.value as IkoroduArea })}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900"
                >
                  {IKORODU_AREAS.map((area) => (
                    <option key={area} value={area}>
                      {area}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Business Hours Matrix */}
            <div className="space-y-3">
              <label className="block text-xs font-bold text-slate-700">Operating Hours</label>
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2">
                {profileHours.map((h, idx) => (
                  <div key={h.day} className="flex items-center justify-between gap-4 text-xs">
                    <span className="w-24 font-bold text-slate-800">{h.day}</span>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={h.isClosed}
                        onChange={(e) => {
                          const updated = [...profileHours];
                          updated[idx].isClosed = e.target.checked;
                          setProfileHours(updated);
                        }}
                        className="rounded text-emerald-700 focus:ring-emerald-500"
                      />
                      <span className="text-[11px] text-slate-500">Closed</span>
                    </label>
                    {!h.isClosed ? (
                      <div className="flex items-center gap-2">
                        <input
                          type="time"
                          value={h.openTime}
                          onChange={(e) => {
                            const updated = [...profileHours];
                            updated[idx].openTime = e.target.value;
                            setProfileHours(updated);
                          }}
                          className="p-1.5 bg-white border border-slate-200 rounded-lg text-xs font-mono font-bold"
                        />
                        <span className="text-slate-400">to</span>
                        <input
                          type="time"
                          value={h.closeTime}
                          onChange={(e) => {
                            const updated = [...profileHours];
                            updated[idx].closeTime = e.target.value;
                            setProfileHours(updated);
                          }}
                          className="p-1.5 bg-white border border-slate-200 rounded-lg text-xs font-mono font-bold"
                        />
                      </div>
                    ) : (
                      <span className="text-xs text-red-500 font-bold italic">Closed All Day</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Social Links & Website */}
          <div className="p-6 bg-white/95 backdrop-blur-md rounded-3xl border border-slate-200/90 shadow-xs space-y-4">
            <h4 className="text-xs font-extrabold uppercase tracking-wider text-emerald-900 flex items-center gap-2 border-b border-slate-100 pb-3">
              <Globe className="w-4 h-4 text-amber-500" />
              Website & Social Profiles
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                  <Globe className="w-3.5 h-3.5 text-slate-500" /> Website URL
                </label>
                <input
                  type="url"
                  placeholder="https://yourbusiness.com"
                  value={profileData.website}
                  onChange={(e) => setProfileData({ ...profileData, website: e.target.value })}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                  <Instagram className="w-3.5 h-3.5 text-pink-600" /> Instagram Handle / Link
                </label>
                <input
                  type="text"
                  placeholder="https://instagram.com/yourhandle"
                  value={profileData.instagram}
                  onChange={(e) => setProfileData({ ...profileData, instagram: e.target.value })}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                  <Facebook className="w-3.5 h-3.5 text-blue-600" /> Facebook Page Link
                </label>
                <input
                  type="text"
                  placeholder="https://facebook.com/yourpage"
                  value={profileData.facebook}
                  onChange={(e) => setProfileData({ ...profileData, facebook: e.target.value })}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-slate-900" /> TikTok Profile Link
                </label>
                <input
                  type="text"
                  placeholder="https://tiktok.com/@yourprofile"
                  value={profileData.tiktok}
                  onChange={(e) => setProfileData({ ...profileData, tiktok: e.target.value })}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                />
              </div>
            </div>
          </div>

          {/* Gallery Images Manager */}
          <div className="p-6 bg-white/95 backdrop-blur-md rounded-3xl border border-slate-200/90 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h4 className="text-xs font-extrabold uppercase tracking-wider text-emerald-900 flex items-center gap-2">
                <ImageIcon className="w-4 h-4 text-amber-500" />
                Storefront Gallery Photos ({profileGallery.length})
              </h4>

              <label className="px-3 py-1.5 bg-emerald-800 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer hover:bg-emerald-900 transition-colors">
                <Plus className="w-3.5 h-3.5" />
                <span>Add Photos</span>
                <input type="file" accept="image/*" multiple onChange={handleGalleryUpload} className="hidden" />
              </label>
            </div>

            {profileGallery.length === 0 ? (
              <p className="text-xs text-slate-400 italic py-4 text-center">
                No gallery photos added yet. Click "Add Photos" to upload images of your shop or work.
              </p>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3">
                {profileGallery.map((imgUrl, i) => (
                  <div key={i} className="relative group rounded-xl overflow-hidden border border-slate-200 h-24 bg-slate-100">
                    <img src={imgUrl} alt={`Gallery photo ${i}`} className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => setProfileGallery(profileGallery.filter((_, idx) => idx !== i))}
                      className="absolute top-1 right-1 bg-red-600 text-white p-1 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity shadow-sm"
                      title="Delete photo"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Bottom Save Action Bar */}
          <div className="flex items-center justify-end gap-4 bg-white/90 p-4 rounded-2xl border border-slate-200">
            <button
              type="submit"
              disabled={isSavingProfile}
              className="px-8 py-3.5 bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-bold rounded-2xl shadow-md transition-all flex items-center gap-2 disabled:opacity-50"
            >
              <Save className="w-4 h-4 text-amber-300" />
              <span>{isSavingProfile ? 'Saving Changes...' : 'Save Profile Changes'}</span>
            </button>
          </div>
        </form>
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
                    {/* Real Receipt File Dropzone */}
                    <div className="p-4 border-2 border-dashed border-emerald-300 bg-emerald-50/50 rounded-2xl text-center space-y-2 relative cursor-pointer hover:bg-emerald-100/50 transition-all">
                      <input
                        type="file"
                        accept=".jpg,.jpeg,.png,.pdf"
                        onChange={handleReceiptFileSelect}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                      />
                      <Upload className="w-8 h-8 text-emerald-700 mx-auto" />
                      <div className="text-xs font-bold text-emerald-950">
                        {isUploadingReceipt ? (
                          <span className="text-emerald-700 animate-pulse">Uploading file to Supabase...</span>
                        ) : proofFileUploaded ? (
                          <span className="text-emerald-900 flex items-center justify-center gap-1">
                            <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Attached: {proofFileName}
                          </span>
                        ) : (
                          'Click or drag & drop bank transfer receipt (JPG, PNG, PDF)'
                        )}
                      </div>
                      <p className="text-[10px] text-slate-500">
                        File will be uploaded to Supabase Storage and reviewed by Admin.
                      </p>
                      {proofFileUrl && (
                        <div className="mt-2 p-2 bg-white rounded-xl border border-slate-200 inline-block">
                          {proofFileName.endsWith('.pdf') ? (
                            <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
                              <FileText className="w-4 h-4 text-red-600" /> PDF Document Ready
                            </div>
                          ) : (
                            <img src={proofFileUrl} alt="Receipt preview" className="h-16 rounded-lg object-contain mx-auto" />
                          )}
                        </div>
                      )}
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
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 border border-slate-200 max-h-[90vh] overflow-y-auto">
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
