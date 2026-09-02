import React, { useState, useEffect } from 'react';
import { safeFormatPrice, getProductCoverImage } from '../lib/productHelpers';
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
  Loader2,
  Copy,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { MANUAL_PAYMENT_INFO, PROMOTION_OPTIONS, IKORODU_AREAS } from '../data/mockData';
import { Product, PromoType, BusinessHours, IkoroduArea } from '../types';
import { uploadFileToSupabaseStorage } from '../lib/supabaseDb';
import { ProductImageUploader } from '../components/ProductImageUploader';
import { StorefrontQRCode } from '../components/StorefrontQRCode';
import { useSEO } from '../hooks/useSEO';

export const VendorDashboardView: React.FC = () => {
  useSEO({
    title: 'Vendor Dashboard | IkoroduSquare',
    robots: 'noindex, nofollow',
  });
  const {
    vendors,
    products,
    reviews,
    enquiries,
    promotionRequests,
    verificationRequests,
    addProduct,
    updateProduct,
    deleteProduct,
    replyReview,
    replyEnquiry,
    submitPromotionRequest,
    submitVerificationRequest,
    updateVendorProfile,
    categories,
    setActiveTab,
    setSelectedVendorId,
    currentUser,
  } = useApp();

  const [vendorTab, setVendorTab] = useState<'overview' | 'products' | 'profile' | 'enquiries' | 'reviews' | 'promotions' | 'verification' | 'qrcode'>('overview');

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

  // Product Add / Edit Modal
  const [productModalOpen, setProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [prodName, setProdName] = useState('');
  const [prodPrice, setProdPrice] = useState<number>(5000);
  const [prodSalePrice, setProdSalePrice] = useState<number | ''>('');
  const [prodCategory, setProdCategory] = useState('Fashion & Apparel');
  const [prodSubcategory, setProdSubcategory] = useState('');
  const [prodDesc, setProdDesc] = useState('');
  const [prodStock, setProdStock] = useState<number>(10);
  const [prodCondition, setProdCondition] = useState<'New' | 'Used - Like New' | 'Refurbished'>('New');
  const [prodImages, setProdImages] = useState<string[]>([]);
  const [productFormError, setProductFormError] = useState<string | null>(null);
  const [isSubmittingProduct, setIsSubmittingProduct] = useState(false);
  const [isUploadingProductImages, setIsUploadingProductImages] = useState(false);
  const [productSuccessToast, setProductSuccessToast] = useState<string | null>(null);

  // Manual Promotion Real Receipt State
  const [selectedPromoOption, setSelectedPromoOption] = useState(PROMOTION_OPTIONS[1]);
  const [proofFileUploaded, setProofFileUploaded] = useState(false);
  const [proofFileName, setProofFileName] = useState('');
  const [proofFileUrl, setProofFileUrl] = useState('');
  const [isUploadingReceipt, setIsUploadingReceipt] = useState(false);
  const [receiptUploadError, setReceiptUploadError] = useState<string | null>(null);
  const [txnRef, setTxnRef] = useState('');
  const [promoNotes, setPromoNotes] = useState('');
  const [promoSuccessMsg, setPromoSuccessMsg] = useState(false);

  // Logo & Cover & Gallery Upload States
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);
  const [logoUploadError, setLogoUploadError] = useState<string | null>(null);
  const [isUploadingCover, setIsUploadingCover] = useState(false);
  const [coverUploadError, setCoverUploadError] = useState<string | null>(null);
  const [isUploadingGallery, setIsUploadingGallery] = useState(false);
  const [galleryUploadError, setGalleryUploadError] = useState<string | null>(null);

  // Paid Verification State (₦3,000 one-time fee)
  const [verifTxnRef, setVerifTxnRef] = useState('');
  const [verifProofFileUploaded, setVerifProofFileUploaded] = useState(false);
  const [verifProofFileName, setVerifProofFileName] = useState('');
  const [verifProofFileUrl, setVerifProofFileUrl] = useState('');
  const [isUploadingVerifReceipt, setIsUploadingVerifReceipt] = useState(false);
  const [verifSuccessMsg, setVerifSuccessMsg] = useState(false);
  const [verifErrorMsg, setVerifErrorMsg] = useState<string | null>(null);
  const [copiedVerifField, setCopiedVerifField] = useState<string | null>(null);

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
    website: (vendor as any).website || '',
    instagram: (vendor as any).instagram || '',
    facebook: (vendor as any).facebook || '',
    tiktok: (vendor as any).tiktok || '',
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
      website: (vendor as any).website || '',
      instagram: (vendor as any).instagram || '',
      facebook: (vendor as any).facebook || '',
      tiktok: (vendor as any).tiktok || '',
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
        website: (vendor as any).website || '',
        instagram: (vendor as any).instagram || '',
        facebook: (vendor as any).facebook || '',
        tiktok: (vendor as any).tiktok || '',
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

  const handleOpenAddProduct = () => {
    setEditingProduct(null);
    setProdName('');
    setProdPrice(5000);
    setProdSalePrice('');
    setProdCategory('Fashion & Apparel');
    setProdSubcategory('');
    setProdDesc('');
    setProdStock(10);
    setProdCondition('New');
    setProdImages([]);
    setProductFormError(null);
    setProductModalOpen(true);
  };

  const handleOpenEditProduct = (p: Product) => {
    setEditingProduct(p);
    setProdName(p.name);
    setProdPrice(p.price);
    setProdSalePrice(p.salePrice || '');
    setProdCategory(p.category || 'Fashion & Apparel');
    setProdSubcategory(p.subcategory || '');
    setProdDesc(p.description || '');
    setProdStock(p.stock || 0);
    setProdCondition((p.condition as any) || 'New');
    setProdImages(p.images || []);
    setProductFormError(null);
    setProductModalOpen(true);
  };

  const handleSaveProductSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setProductFormError(null);

    if (isUploadingProductImages) {
      setProductFormError('Please wait until all image uploads finish before publishing.');
      return;
    }

    if (!prodName.trim()) {
      setProductFormError('Please enter a product title.');
      return;
    }

    if (!prodPrice || Number(prodPrice) <= 0) {
      setProductFormError('Please enter a valid price in Naira.');
      return;
    }

    if (!Array.isArray(prodImages) || prodImages.length === 0) {
      setProductFormError('Please upload at least 1 photo for your product.');
      return;
    }

    const salePriceNum = prodSalePrice !== '' ? Number(prodSalePrice) : undefined;
    setIsSubmittingProduct(true);

    try {
      if (editingProduct) {
        await updateProduct(editingProduct.id, {
          name: prodName.trim(),
          price: Number(prodPrice),
          salePrice: salePriceNum,
          category: prodCategory,
          subcategory: prodSubcategory.trim(),
          description: prodDesc.trim(),
          stock: prodStock,
          condition: prodCondition,
          images: prodImages,
        });
        setProductSuccessToast(`Product "${prodName.trim()}" updated successfully!`);
      } else {
        await addProduct({
          vendorId: vendor.id,
          vendorName: vendor.businessName,
          vendorArea: vendor.area,
          name: prodName.trim(),
          price: Number(prodPrice),
          salePrice: salePriceNum,
          category: prodCategory,
          subcategory: prodSubcategory.trim(),
          description: prodDesc.trim(),
          stock: prodStock,
          condition: prodCondition,
          images: prodImages,
        });
        setProductSuccessToast(`Product "${prodName.trim()}" published successfully!`);
      }

      setProductModalOpen(false);
      setTimeout(() => setProductSuccessToast(null), 5000);
    } catch (err: any) {
      console.error('[PRODUCT PUBLISH ERROR]', err);
      setProductFormError(err.message || 'Failed to publish product. Please check your network and try again.');
    } finally {
      setIsSubmittingProduct(false);
    }
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploadingLogo(true);
    setLogoUploadError(null);
    try {
      const ext = file.name.split('.').pop() || 'jpg';
      const cleanVendorId = (vendor.id || 'v-anonymous').replace(/[^a-zA-Z0-9_-]/g, '_');
      const filePath = `${cleanVendorId}/logo_${Date.now()}.${ext}`;
      const url = await uploadFileToSupabaseStorage('vendor-logos', filePath, file);
      if (url) {
        setProfileData((prev) => ({ ...prev, logoUrl: url }));
      } else {
        setLogoUploadError('Logo upload failed. Please verify your connection or storage permissions and retry.');
      }
    } catch (err: any) {
      setLogoUploadError(err?.message || 'Failed to upload logo.');
    } finally {
      setIsUploadingLogo(false);
    }
  };

  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploadingCover(true);
    setCoverUploadError(null);
    try {
      const ext = file.name.split('.').pop() || 'jpg';
      const cleanVendorId = (vendor.id || 'v-anonymous').replace(/[^a-zA-Z0-9_-]/g, '_');
      const filePath = `${cleanVendorId}/cover_${Date.now()}.${ext}`;
      const url = await uploadFileToSupabaseStorage('vendor-covers', filePath, file);
      if (url) {
        setProfileData((prev) => ({ ...prev, coverImageUrl: url }));
      } else {
        setCoverUploadError('Cover image upload failed. Please verify your connection or storage permissions and retry.');
      }
    } catch (err: any) {
      setCoverUploadError(err?.message || 'Failed to upload cover image.');
    } finally {
      setIsUploadingCover(false);
    }
  };

  const handleGalleryUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    setIsUploadingGallery(true);
    setGalleryUploadError(null);
    let uploadFailures = 0;
    try {
      const cleanVendorId = (vendor.id || 'v-anonymous').replace(/[^a-zA-Z0-9_-]/g, '_');
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const ext = file.name.split('.').pop() || 'jpg';
        const filePath = `${cleanVendorId}/gallery_${Date.now()}_${i}.${ext}`;
        const url = await uploadFileToSupabaseStorage('vendor-gallery', filePath, file);
        if (url) {
          setProfileGallery((prev) => [...prev, url]);
        } else {
          uploadFailures++;
        }
      }
      if (uploadFailures > 0) {
        setGalleryUploadError(`${uploadFailures} image(s) failed to upload to Storage. Please retry.`);
      }
    } catch (err: any) {
      setGalleryUploadError(err?.message || 'Failed to upload gallery images.');
    } finally {
      setIsUploadingGallery(false);
    }
  };

  const handleReceiptFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploadingReceipt(true);
    setReceiptUploadError(null);
    setProofFileName(file.name);
    try {
      const ext = file.name.split('.').pop() || 'png';
      const cleanVendorId = (vendor.id || 'v-anonymous').replace(/[^a-zA-Z0-9_-]/g, '_');
      const filePath = `${cleanVendorId}/promo_receipt_${Date.now()}.${ext}`;
      const url = await uploadFileToSupabaseStorage('promotion-receipts', filePath, file);
      if (url) {
        setProofFileUrl(url);
        setProofFileUploaded(true);
      } else {
        setProofFileUploaded(false);
        setProofFileUrl('');
        setReceiptUploadError('Failed to upload receipt to Supabase Storage. Please retry.');
      }
    } catch (err: any) {
      setProofFileUploaded(false);
      setReceiptUploadError(err?.message || 'Failed to upload receipt file.');
    } finally {
      setIsUploadingReceipt(false);
    }
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

  const vendorVerifRequest = verificationRequests.find((r) => r.vendorId === vendor.id);

  const handleCopyVerifText = (text: string, fieldName: string) => {
    navigator.clipboard?.writeText(text);
    setCopiedVerifField(fieldName);
    setTimeout(() => setCopiedVerifField(null), 2000);
  };

  const handleVerifReceiptSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploadingVerifReceipt(true);
    setVerifProofFileName(file.name);
    setVerifErrorMsg(null);

    try {
      const ext = file.name.split('.').pop() || 'png';
      const cleanVendorId = (vendor.id || 'v-anonymous').replace(/[^a-zA-Z0-9_-]/g, '_');
      const filePath = `${cleanVendorId}/verif_receipt_${Date.now()}.${ext}`;
      const url = await uploadFileToSupabaseStorage(
        'verification-receipts',
        filePath,
        file
      );
      if (url) {
        setVerifProofFileUrl(url);
        setVerifProofFileUploaded(true);
      } else {
        setVerifProofFileUploaded(false);
        setVerifProofFileUrl('');
        setVerifErrorMsg('Failed to upload receipt to Supabase Storage. Please verify connection and retry.');
      }
    } catch (err: any) {
      setVerifProofFileUploaded(false);
      setVerifErrorMsg(err?.message || 'Failed to upload verification receipt.');
    } finally {
      setIsUploadingVerifReceipt(false);
    }
  };

  const handleVerificationSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setVerifErrorMsg(null);

    if (vendor.status !== 'approved') {
      setVerifErrorMsg('Your business must first be approved before you can apply for verification.');
      return;
    }

    if (!verifTxnRef.trim()) {
      setVerifErrorMsg('Please enter your FCMB transaction reference.');
      return;
    }

    if (!verifProofFileUploaded || !verifProofFileUrl) {
      setVerifErrorMsg('Please upload your ₦3,000 bank transfer payment receipt.');
      return;
    }

    submitVerificationRequest({
      vendorId: vendor.id,
      vendorName: vendor.businessName,
      amountNaira: 3000,
      bankName: MANUAL_PAYMENT_INFO.bankName,
      accountName: MANUAL_PAYMENT_INFO.accountName,
      accountNumber: MANUAL_PAYMENT_INFO.accountNumber,
      proofUrl: verifProofFileUrl,
      proofFileName: verifProofFileName || 'verification_receipt.png',
      txnRef: verifTxnRef.trim(),
    });

    setVerifSuccessMsg(true);
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
          onClick={() => setVendorTab('verification')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 ${
            vendorTab === 'verification'
              ? 'bg-emerald-950 text-amber-300 shadow-xs'
              : vendor.isVerified
              ? 'bg-emerald-50 text-emerald-900 border border-emerald-300'
              : 'bg-amber-50 text-amber-950 border border-amber-300'
          }`}
        >
          <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
          <span>{vendor.isVerified ? 'Verified Business' : 'Get Verified (₦3,000)'}</span>
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
                  <strong className={`text-xs font-bold ${vendor.isVerified ? 'text-emerald-700' : 'text-amber-800'}`}>
                    {vendor.isVerified ? 'Verified Business' : 'Unverified (₦3k)'}
                  </strong>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleOpenAddProduct}
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
              onClick={handleOpenAddProduct}
              className="px-4 py-2 bg-emerald-800 text-amber-300 font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-xs hover:bg-emerald-900"
            >
              <Plus className="w-4 h-4" /> Add New Item
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Success Toast */}
            {productSuccessToast && (
              <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-2xl text-xs flex items-center justify-between gap-3 shadow-sm animate-in fade-in">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                  <span className="font-bold">{productSuccessToast}</span>
                </div>
                <button
                  onClick={() => setProductSuccessToast(null)}
                  className="text-emerald-700 hover:text-emerald-950 font-bold"
                >
                  Dismiss
                </button>
              </div>
            )}

            {vendorProducts.length === 0 ? (
              <div className="col-span-full bg-white p-8 rounded-3xl border border-slate-200 text-center space-y-3">
                <ShoppingBag className="w-10 h-10 text-slate-300 mx-auto" />
                <p className="text-xs font-bold text-slate-700">No products or services listed yet.</p>
                <button
                  onClick={handleOpenAddProduct}
                  className="px-4 py-2 bg-emerald-800 text-white font-bold text-xs rounded-xl shadow-xs"
                >
                  + Add Your First Product
                </button>
              </div>
            ) : (
              vendorProducts.map((p) => (
                <div
                  key={p.id}
                  className="bg-white/95 backdrop-blur-md p-4 rounded-2xl border border-slate-200/90 flex flex-col sm:flex-row items-start sm:items-center gap-4 shadow-xs hover:shadow-md transition-all duration-300"
                >
                  <img
                    src={getProductCoverImage(p)}
                    alt={p.name || 'Product'}
                    className="w-16 h-16 rounded-xl object-cover shrink-0 border border-slate-100"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src =
                        'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?auto=format&fit=crop&q=80&w=800';
                    }}
                  />
                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="text-xs font-bold text-slate-900 truncate">{p.name}</h4>
                      {p.salePrice && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-100 text-red-800">
                          Sale
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 font-mono text-xs">
                      <span className="font-black text-emerald-950">₦{safeFormatPrice(p.price)}</span>
                      {p.salePrice ? (
                        <span className="text-slate-400 line-through text-[11px]">₦{safeFormatPrice(p.salePrice)}</span>
                      ) : null}
                    </div>
                    <p className="text-[10px] text-slate-500">
                      Category: {p.category} • Stock: {p.stock} • {p.images?.length || 0} photo(s)
                    </p>
                  </div>
                  <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                    <button
                      onClick={() => handleOpenEditProduct(p)}
                      className="px-3 py-1.5 bg-emerald-100 hover:bg-emerald-200 text-emerald-950 font-bold text-xs rounded-xl transition-colors flex items-center gap-1"
                      title="Edit Product"
                    >
                      <Edit className="w-3.5 h-3.5" />
                      <span>Edit</span>
                    </button>
                    <button
                      onClick={() => deleteProduct(p.id)}
                      className="p-2 text-red-500 hover:bg-red-50 rounded-xl transition-colors"
                      title="Delete Product"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))
            )}
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
                    {isUploadingLogo ? (
                      <div className="w-full h-full flex flex-col items-center justify-center bg-emerald-50 text-emerald-800 text-[10px] font-bold p-1 text-center">
                        <Loader2 className="w-5 h-5 animate-spin mb-1 text-emerald-700" />
                        <span>Uploading...</span>
                      </div>
                    ) : profileData.logoUrl ? (
                      <img src={profileData.logoUrl} alt="Logo preview" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-400">
                        <ImageIcon className="w-8 h-8" />
                      </div>
                    )}
                  </div>
                  <div className="space-y-2 flex-1">
                    <label className="inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-200 rounded-xl text-xs font-bold cursor-pointer transition-all disabled:opacity-50">
                      {isUploadingLogo ? <Loader2 className="w-4 h-4 animate-spin text-emerald-700" /> : <Upload className="w-4 h-4 text-emerald-700" />}
                      <span>{isUploadingLogo ? 'Uploading to Storage...' : 'Upload Logo'}</span>
                      <input type="file" accept="image/*" disabled={isUploadingLogo} onChange={handleLogoUpload} className="hidden" />
                    </label>
                    <p className="text-[11px] text-slate-500">Square PNG, JPG, or WEBP. Uploads directly to Supabase Storage.</p>
                    {logoUploadError && (
                      <div className="p-2 bg-red-50 border border-red-200 rounded-xl text-[11px] font-bold text-red-700 flex items-center gap-1.5">
                        <AlertCircle className="w-3.5 h-3.5 shrink-0 text-red-600" />
                        <span>{logoUploadError}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Cover Image Upload */}
              <div className="space-y-3">
                <label className="block text-xs font-bold text-slate-700">Cover Banner Image</label>
                <div className="space-y-2">
                  <div className="relative w-full h-24 rounded-2xl border border-slate-200 overflow-hidden bg-slate-50">
                    {isUploadingCover ? (
                      <div className="w-full h-full flex items-center justify-center bg-emerald-50 text-emerald-800 text-xs font-bold gap-2">
                        <Loader2 className="w-5 h-5 animate-spin text-emerald-700" />
                        <span>Uploading cover to Supabase Storage...</span>
                      </div>
                    ) : profileData.coverImageUrl ? (
                      <img src={profileData.coverImageUrl} alt="Cover preview" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-400">
                        <ImageIcon className="w-8 h-8" />
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-3">
                    <label className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-200 rounded-xl text-xs font-bold cursor-pointer transition-all disabled:opacity-50">
                      {isUploadingCover ? <Loader2 className="w-4 h-4 animate-spin text-emerald-700" /> : <Upload className="w-4 h-4 text-emerald-700" />}
                      <span>{isUploadingCover ? 'Uploading...' : 'Upload Cover Image'}</span>
                      <input type="file" accept="image/*" disabled={isUploadingCover} onChange={handleCoverUpload} className="hidden" />
                    </label>
                    <span className="text-[11px] text-slate-500">Wide banner format (1600x600 recommended)</span>
                  </div>
                  {coverUploadError && (
                    <div className="p-2 bg-red-50 border border-red-200 rounded-xl text-[11px] font-bold text-red-700 flex items-center gap-1.5">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0 text-red-600" />
                      <span>{coverUploadError}</span>
                    </div>
                  )}
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
              <div>
                <h4 className="text-xs font-extrabold uppercase tracking-wider text-emerald-900 flex items-center gap-2">
                  <ImageIcon className="w-4 h-4 text-amber-500" />
                  Storefront Gallery Photos ({profileGallery.length})
                </h4>
                <p className="text-[11px] text-slate-500">Uploaded to Supabase Storage (<span className="font-mono text-emerald-800">vendor-gallery</span>)</p>
              </div>

              <label className="px-3 py-1.5 bg-emerald-800 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer hover:bg-emerald-900 transition-colors disabled:opacity-50">
                {isUploadingGallery ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />}
                <span>{isUploadingGallery ? 'Uploading to Storage...' : 'Add Photos'}</span>
                <input type="file" accept="image/*" multiple disabled={isUploadingGallery} onChange={handleGalleryUpload} className="hidden" />
              </label>
            </div>

            {galleryUploadError && (
              <div className="p-2.5 bg-red-50 border border-red-200 rounded-xl text-xs font-bold text-red-700 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
                <span>{galleryUploadError}</span>
              </div>
            )}

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
                    {receiptUploadError && (
                      <div className="p-2.5 bg-red-50 border border-red-200 rounded-xl text-xs font-bold text-red-700 flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
                        <span>{receiptUploadError}</span>
                      </div>
                    )}

                    {/* Real Receipt File Dropzone */}
                    <div className="p-4 border-2 border-dashed border-emerald-300 bg-emerald-50/50 rounded-2xl text-center space-y-2 relative cursor-pointer hover:bg-emerald-100/50 transition-all">
                      <input
                        type="file"
                        accept=".jpg,.jpeg,.png,.pdf"
                        disabled={isUploadingReceipt}
                        onChange={handleReceiptFileSelect}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                      />
                      <Upload className="w-8 h-8 text-emerald-700 mx-auto" />
                      <div className="text-xs font-bold text-emerald-950">
                        {isUploadingReceipt ? (
                          <span className="text-emerald-700 animate-pulse flex items-center justify-center gap-2">
                            <Loader2 className="w-4 h-4 animate-spin text-emerald-700" /> Uploading receipt to Supabase Storage...
                          </span>
                        ) : proofFileUploaded ? (
                          <span className="text-emerald-900 flex items-center justify-center gap-1">
                            <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Attached: {proofFileName}
                          </span>
                        ) : (
                          'Click or drag & drop bank transfer receipt (JPG, PNG, PDF)'
                        )}
                      </div>
                      <p className="text-[10px] text-slate-500">
                        File will be securely uploaded to Supabase Storage (<span className="font-mono text-emerald-800">promotion-receipts</span>) and kept private for Admin review.
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

      {/* 6. Paid Vendor Verification (₦3,000) */}
      {vendorTab === 'verification' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200/80 pb-4">
            <div>
              <h3 className="text-xl font-black text-slate-900 font-display flex items-center gap-2">
                <ShieldCheck className="w-6 h-6 text-emerald-700" />
                <span>Get Verified</span>
              </h3>
              <p className="text-xs text-slate-500">
                Official trust accreditation for legitimate registered merchants across IkoroduSquare.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 bg-emerald-100 text-emerald-900 text-xs font-mono font-bold rounded-full border border-emerald-300">
                ₦3,000 One-Time Fee
              </span>
            </div>
          </div>

          {/* Scenario 1: Vendor is Already Verified */}
          {vendor.isVerified ? (
            <div className="p-6 sm:p-8 bg-gradient-to-br from-emerald-900 via-emerald-950 to-teal-950 text-white rounded-3xl border border-emerald-700/80 shadow-sm space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center shrink-0">
                  <CheckCircle2 className="w-7 h-7 text-emerald-300" />
                </div>
                <div>
                  <h4 className="text-lg font-black text-white font-display flex items-center gap-2">
                    <span>Verified Business</span>
                    <span className="px-2.5 py-0.5 bg-emerald-400/20 text-emerald-300 text-[10px] font-mono font-bold rounded-full border border-emerald-400/30">
                      ACTIVE
                    </span>
                  </h4>
                  <p className="text-xs text-emerald-200/90 font-medium">
                    Your business is already verified.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-xs text-emerald-100">
                <div className="p-3 bg-emerald-900/60 rounded-2xl border border-emerald-700/60 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Verified Business badge active on your storefront</span>
                </div>
                <div className="p-3 bg-emerald-900/60 rounded-2xl border border-emerald-700/60 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Listed in the "Verified Only" directory filter</span>
                </div>
              </div>

              {vendorVerifRequest && (
                <div className="mt-4 pt-4 border-t border-emerald-800/80 text-[11px] text-emerald-300 flex flex-wrap items-center justify-between gap-2">
                  <span>Payment Ref: <strong className="font-mono text-white">{vendorVerifRequest.txnRef}</strong></span>
                  <span>Amount: <strong className="font-mono text-white">₦{vendorVerifRequest.amountNaira.toLocaleString()}</strong></span>
                  <span>Approved: <strong className="text-white">{vendorVerifRequest.reviewedAt ? new Date(vendorVerifRequest.reviewedAt).toLocaleDateString() : 'Active'}</strong></span>
                </div>
              )}
            </div>
          ) : vendor.status !== 'approved' ? (
            /* Scenario 2: Vendor registration is not yet approved/live */
            <div className="p-6 bg-amber-50 rounded-3xl border border-amber-200 text-amber-950 space-y-3">
              <div className="flex items-center gap-3">
                <AlertCircle className="w-6 h-6 text-amber-700 shrink-0" />
                <div>
                  <h4 className="text-sm font-bold text-amber-950">Registration Approval Required</h4>
                  <p className="text-xs text-amber-800">
                    Your business must first be approved before you can apply for verification.
                  </p>
                </div>
              </div>
              <p className="text-xs text-amber-800/90 pl-9">
                Our administrative team is currently reviewing your business registration application. Once your store is approved and published on the directory, you can return here to complete verification.
              </p>
            </div>
          ) : (
            /* Scenario 3: Approved Vendor - Verification Application & Payment */
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Left Column: Benefits & FCMB Transfer Details */}
              <div className="lg:col-span-5 space-y-5">
                {/* Benefits Card */}
                <div className="p-5 bg-white rounded-3xl border border-slate-200/90 shadow-xs space-y-4">
                  <h4 className="text-xs font-black uppercase text-slate-500 tracking-wider">
                    Verification Benefits
                  </h4>
                  <ul className="space-y-2.5 text-xs text-slate-700">
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <span className="font-medium">Verified Business badge on all listings</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <span className="font-medium">Increased customer trust across Ikorodu</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <span className="font-medium">Eligible for the "Verified Only" directory filter</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <span className="font-medium">Verification displayed across the vendor storefront</span>
                    </li>
                  </ul>
                  <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/80 text-[11px] text-slate-500 leading-relaxed">
                    Note: Verification confirms authentic business identity. It does not alter advertisement placement or category ranking.
                  </div>
                </div>

                {/* Bank Account Details */}
                <div className="p-5 bg-emerald-950 text-white rounded-3xl border border-emerald-800 shadow-sm space-y-4">
                  <div className="flex items-center justify-between border-b border-emerald-800 pb-3">
                    <div className="flex items-center gap-2">
                      <CreditCard className="w-4 h-4 text-amber-400" />
                      <span className="text-xs font-black uppercase tracking-wider text-amber-400">
                        Official Bank Transfer
                      </span>
                    </div>
                    <span className="text-xs font-black text-white font-mono">₦3,000</span>
                  </div>

                  <div className="space-y-3 text-xs">
                    <div>
                      <span className="text-[10px] text-emerald-300 font-bold block uppercase">Bank Name</span>
                      <p className="font-bold text-white text-sm">{MANUAL_PAYMENT_INFO.bankName}</p>
                    </div>

                    <div className="p-3 bg-emerald-900/80 rounded-2xl border border-emerald-700/60 flex items-center justify-between">
                      <div>
                        <span className="text-[10px] text-emerald-300 font-bold block uppercase">Account Number</span>
                        <span className="text-base font-black font-mono text-amber-300 tracking-wider">
                          {MANUAL_PAYMENT_INFO.accountNumber}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleCopyVerifText(MANUAL_PAYMENT_INFO.accountNumber, 'accountNumber')}
                        className="px-3 py-1.5 bg-emerald-800 hover:bg-emerald-700 text-amber-300 text-[11px] font-bold rounded-xl transition-all flex items-center gap-1 border border-emerald-600"
                      >
                        <Copy className="w-3.5 h-3.5" />
                        <span>{copiedVerifField === 'accountNumber' ? 'Copied!' : 'Copy'}</span>
                      </button>
                    </div>

                    <div className="p-3 bg-emerald-900/80 rounded-2xl border border-emerald-700/60 flex items-center justify-between">
                      <div>
                        <span className="text-[10px] text-emerald-300 font-bold block uppercase">Account Name</span>
                        <span className="text-xs font-bold text-white">
                          {MANUAL_PAYMENT_INFO.accountName}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleCopyVerifText(MANUAL_PAYMENT_INFO.accountName, 'accountName')}
                        className="px-3 py-1.5 bg-emerald-800 hover:bg-emerald-700 text-amber-300 text-[11px] font-bold rounded-xl transition-all flex items-center gap-1 border border-emerald-600"
                      >
                        <Copy className="w-3.5 h-3.5" />
                        <span>{copiedVerifField === 'accountName' ? 'Copied!' : 'Copy'}</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column: Submission Form & Status */}
              <div className="lg:col-span-7 space-y-5">
                {/* Existing Request Status Alert if already submitted */}
                {vendorVerifRequest && (
                  <div
                    className={`p-5 rounded-3xl border shadow-xs space-y-3 ${
                      vendorVerifRequest.status === 'pending'
                        ? 'bg-amber-50/80 border-amber-200 text-amber-950'
                        : vendorVerifRequest.status === 'approved'
                        ? 'bg-emerald-50 border-emerald-200 text-emerald-950'
                        : 'bg-red-50 border-red-200 text-red-950'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {vendorVerifRequest.status === 'pending' && <Clock className="w-5 h-5 text-amber-600" />}
                        {vendorVerifRequest.status === 'approved' && <CheckCircle2 className="w-5 h-5 text-emerald-600" />}
                        {vendorVerifRequest.status === 'rejected' && <AlertCircle className="w-5 h-5 text-red-600" />}
                        <h4 className="text-sm font-bold">
                          {vendorVerifRequest.status === 'pending' && 'Pending Review'}
                          {vendorVerifRequest.status === 'approved' && 'Verification Approved'}
                          {vendorVerifRequest.status === 'rejected' && 'Verification Payment Rejected'}
                        </h4>
                      </div>
                      <span
                        className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${
                          vendorVerifRequest.status === 'pending'
                            ? 'bg-amber-200 text-amber-900 animate-pulse'
                            : vendorVerifRequest.status === 'approved'
                            ? 'bg-emerald-200 text-emerald-900'
                            : 'bg-red-200 text-red-900'
                        }`}
                      >
                        {vendorVerifRequest.status}
                      </span>
                    </div>

                    {vendorVerifRequest.status === 'pending' && (
                      <div className="text-xs text-amber-900 space-y-2">
                        <p>
                          Our administrative team is reviewing your ₦3,000 transfer proof (Ref: <strong className="font-mono">{vendorVerifRequest.txnRef}</strong>). Once verified, your official badge will activate immediately.
                        </p>
                        <p className="text-[11px] text-amber-800">
                          Submitted on {new Date(vendorVerifRequest.requestedAt).toLocaleString()}
                        </p>
                      </div>
                    )}

                    {vendorVerifRequest.status === 'rejected' && (
                      <div className="text-xs text-red-900 space-y-2">
                        <p>
                          <strong>Reason:</strong> {vendorVerifRequest.adminNote || 'Payment verification could not be confirmed.'}
                        </p>
                        <p className="text-[11px] text-red-700">
                          Please verify your transfer details, ensure your receipt is clear, and submit a new request below.
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {/* Payment Form (Shown if no pending request, or if previous request was rejected) */}
                {(!vendorVerifRequest || vendorVerifRequest.status === 'rejected') && (
                  <div className="p-6 bg-white rounded-3xl border border-slate-200/90 shadow-xs space-y-5">
                    <div>
                      <h4 className="text-sm font-black text-slate-900 font-display">
                        Submit ₦3,000 Verification Payment Proof
                      </h4>
                      <p className="text-xs text-slate-500">
                        Upload your bank transfer receipt and enter your transaction session reference.
                      </p>
                    </div>

                    {verifSuccessMsg ? (
                      <div className="p-5 bg-emerald-50 text-emerald-900 text-xs rounded-2xl border border-emerald-200 space-y-2">
                        <div className="flex items-center gap-2 font-bold text-sm">
                          <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                          <span>Verification request submitted successfully.</span>
                        </div>
                        <p className="text-emerald-800">
                          Our team will review your payment and update your verification status.
                        </p>
                      </div>
                    ) : (
                      <form onSubmit={handleVerificationSubmit} className="space-y-4">
                        {verifErrorMsg && (
                          <div className="p-3 bg-red-50 border border-red-200 text-red-800 rounded-xl text-xs flex items-center gap-2">
                            <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                            <span>{verifErrorMsg}</span>
                          </div>
                        )}

                        {/* Receipt Upload Dropzone */}
                        <div className="p-5 border-2 border-dashed border-emerald-300 bg-emerald-50/40 rounded-2xl text-center space-y-2 relative cursor-pointer hover:bg-emerald-100/40 transition-all">
                          <input
                            type="file"
                            accept=".jpg,.jpeg,.png,.webp,.pdf"
                            onChange={handleVerifReceiptSelect}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                          />
                          <Upload className="w-8 h-8 text-emerald-700 mx-auto" />
                          <div className="text-xs font-bold text-emerald-950">
                            {isUploadingVerifReceipt ? (
                              <span className="text-emerald-700 animate-pulse flex items-center justify-center gap-1.5">
                                <Loader2 className="w-4 h-4 animate-spin" /> Uploading receipt to Supabase...
                              </span>
                            ) : verifProofFileUploaded ? (
                              <span className="text-emerald-900 flex items-center justify-center gap-1">
                                <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Attached: {verifProofFileName}
                              </span>
                            ) : (
                              'Click or drag & drop ₦3,000 transfer receipt (JPG, PNG, PDF)'
                            )}
                          </div>
                          <p className="text-[10px] text-slate-500">
                            File will be uploaded to Supabase Storage (<span className="font-mono text-emerald-900">verification-receipts</span>).
                          </p>
                          {verifProofFileUrl && (
                            <div className="mt-2 p-2 bg-white rounded-xl border border-slate-200 inline-block shadow-xs">
                              {verifProofFileName.endsWith('.pdf') ? (
                                <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
                                  <FileText className="w-4 h-4 text-red-600" /> PDF Receipt Attached
                                </div>
                              ) : (
                                <img src={verifProofFileUrl} alt="Receipt preview" className="h-16 rounded-lg object-contain mx-auto" />
                              )}
                            </div>
                          )}
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">
                            Transaction Reference / Session ID <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            required
                            placeholder="e.g. FCMB-VERIF-984210 or 3000-NIP-12345"
                            value={verifTxnRef}
                            onChange={(e) => setVerifTxnRef(e.target.value)}
                            className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-bold text-emerald-950 focus:ring-2 focus:ring-emerald-500 outline-hidden"
                          />
                        </div>

                        <button
                          type="submit"
                          disabled={!verifProofFileUploaded || isUploadingVerifReceipt}
                          className={`w-full py-3 text-xs font-bold rounded-xl shadow-xs transition-all flex items-center justify-center gap-2 ${
                            verifProofFileUploaded && !isUploadingVerifReceipt
                              ? 'bg-amber-400 text-emerald-950 hover:bg-amber-500 cursor-pointer font-black'
                              : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                          }`}
                        >
                          <ShieldCheck className="w-4 h-4" />
                          <span>Submit Verification Request (₦3,000)</span>
                        </button>
                      </form>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* 7. Business QR Code */}
      {vendorTab === 'qrcode' && (
        <StorefrontQRCode vendor={vendor} />
      )}

      {/* Add / Edit Product Modal */}
      {productModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-xl w-full p-5 sm:p-7 shadow-2xl space-y-5 border border-slate-200 my-auto max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base sm:text-lg font-black text-emerald-950 font-display flex items-center gap-2">
                  <ShoppingBag className="w-5 h-5 text-emerald-800" />
                  <span>{editingProduct ? `Edit "${editingProduct.name}"` : 'Add New Product / Service'}</span>
                </h3>
                <p className="text-[11px] text-slate-500">
                  {editingProduct
                    ? 'Update product details and manage uploaded images.'
                    : 'List a new item for customers in Ikorodu to discover and purchase.'}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setProductModalOpen(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-800 hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {productFormError && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-800 rounded-xl text-xs flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                <span>{productFormError}</span>
              </div>
            )}

            <form onSubmit={handleSaveProductSubmit} className="space-y-4 text-xs">
              {/* Product Title */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Product Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Designer Leather Bag 100% Genuine"
                  value={prodName}
                  onChange={(e) => setProdName(e.target.value)}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-emerald-950 text-xs focus:ring-2 focus:ring-emerald-500 outline-hidden"
                />
              </div>

              {/* Price & Sale Price */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Regular Price (₦) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    placeholder="5000"
                    value={prodPrice || ''}
                    onChange={(e) => setProdPrice(Number(e.target.value))}
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-mono font-bold text-emerald-950 text-xs focus:ring-2 focus:ring-emerald-500 outline-hidden"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Sale Price (₦) <span className="text-slate-400 font-normal">(Optional)</span>
                  </label>
                  <input
                    type="number"
                    min="0"
                    placeholder="e.g. 4500 (Discounted)"
                    value={prodSalePrice}
                    onChange={(e) => setProdSalePrice(e.target.value === '' ? '' : Number(e.target.value))}
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-mono text-xs focus:ring-2 focus:ring-emerald-500 outline-hidden"
                  />
                </div>
              </div>

              {/* Category, Subcategory & Stock */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Category *</label>
                  <select
                    value={prodCategory}
                    onChange={(e) => setProdCategory(e.target.value)}
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800 text-xs focus:ring-2 focus:ring-emerald-500 outline-hidden"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.name}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Subcategory</label>
                  <input
                    type="text"
                    placeholder="e.g. Handbags"
                    value={prodSubcategory}
                    onChange={(e) => setProdSubcategory(e.target.value)}
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 outline-hidden"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Available Stock *</label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={prodStock}
                    onChange={(e) => setProdStock(Number(e.target.value))}
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-mono font-bold text-xs focus:ring-2 focus:ring-emerald-500 outline-hidden"
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">Product Description</label>
                <textarea
                  rows={3}
                  value={prodDesc}
                  onChange={(e) => setProdDesc(e.target.value)}
                  placeholder="Provide specifications, warranty information, color choices, or delivery details..."
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs leading-relaxed focus:ring-2 focus:ring-emerald-500 outline-hidden"
                />
              </div>

              {/* Dedicated Image Uploader */}
              <div className="pt-2 border-t border-slate-100">
                <ProductImageUploader
                  images={prodImages}
                  onChange={setProdImages}
                  vendorId={vendor.id}
                  productId={editingProduct?.id}
                  maxImages={8}
                  onUploadingStateChange={setIsUploadingProductImages}
                />
              </div>

              {/* Bottom Actions */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  disabled={isSubmittingProduct}
                  onClick={() => setProductModalOpen(false)}
                  className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 font-bold text-slate-700 rounded-xl transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingProduct || isUploadingProductImages}
                  className="px-6 py-2.5 bg-emerald-800 text-amber-300 font-extrabold rounded-xl hover:bg-emerald-900 shadow-md transition-all flex items-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmittingProduct ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-amber-400" />
                      <span>Saving Product...</span>
                    </>
                  ) : isUploadingProductImages ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-amber-400" />
                      <span>Uploading Photos...</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 text-amber-400" />
                      <span>{editingProduct ? 'Save Changes' : 'Publish Product'}</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
