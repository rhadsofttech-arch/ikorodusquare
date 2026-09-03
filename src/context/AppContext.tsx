import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  UserRole,
  User,
  Vendor,
  Product,
  Category,
  Review,
  Enquiry,
  PromotionRequest,
  VerificationRequest,
  NotificationItem,
  AuditLog,
  IkoroduArea,
  PromoType,
  PromotionSlot,
  VendorFeature,
} from '../types';
import {
  CATEGORIES,
  MANUAL_PAYMENT_INFO,
} from '../data/mockData';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import {
  fetchVendorsFromSupabase,
  saveVendorToSupabase,
  updateVendorInSupabase,
  deleteVendorFromSupabase,
  fetchProductsFromSupabase,
  saveProductToSupabase,
  deleteProductFromSupabase,
  deleteProductImageFromSupabase,
  fetchReviewsFromSupabase,
  saveReviewToSupabase,
  deleteReviewFromSupabase,
  fetchEnquiriesFromSupabase,
  saveEnquiryToSupabase,
  fetchPromotionsFromSupabase,
  savePromotionToSupabase,
  fetchVerificationRequestsFromSupabase,
  saveVerificationRequestToSupabase,
  deleteVerificationRequestInSupabase,
  fetchNotificationsFromSupabase,
  saveNotificationToSupabase,
  fetchAuditLogsFromSupabase,
  saveAuditLogToSupabase,
  fetchProfileFromSupabase,
  createProfileInSupabase,
  updateProfileInSupabase,
  supabaseSignUp,
  supabaseSignIn,
  supabaseSignOut,
} from '../lib/supabaseDb';

interface AppContextType {
  // Supabase status
  isSupabaseConnected: boolean;
  refreshData: () => Promise<void>;
  refreshCriticalData: () => Promise<void>;

  // Role & Auth
  currentRole: UserRole;
  setRole: (role: UserRole) => void;
  currentUser: User | null;
  setCurrentUser: (user: User | null) => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  
  // Data State
  isLoadingData: boolean;
  isCriticalDataLoading: boolean;
  isSecondaryDataLoading: boolean;
  criticalDataError: string | null;
  vendors: Vendor[];
  products: Product[];
  categories: Category[];
  reviews: Review[];
  enquiries: Enquiry[];
  promotionRequests: PromotionRequest[];
  verificationRequests: VerificationRequest[];
  notifications: NotificationItem[];
  auditLogs: AuditLog[];
  wishlist: string[]; // Product IDs
  followingVendors: string[]; // Vendor IDs

  // Filter & Search
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  selectedCategory: string;
  setSelectedCategory: (cat: string) => void;
  selectedArea: IkoroduArea | 'All';
  setSelectedArea: (area: IkoroduArea | 'All') => void;

  // Near Me & Geolocation
  isNearMeActive: boolean;
  setIsNearMeActive: (active: boolean) => void;
  userLocation: { latitude: number; longitude: number } | null;
  locationStatus: 'idle' | 'prompting' | 'active' | 'denied' | 'unavailable';
  locationError: string | null;
  nearMeRadiusKm: number;
  setNearMeRadiusKm: (radius: number) => void;
  requestNearMe: () => Promise<boolean>;
  disableNearMe: () => void;

  // Actions
  addVendorRegistration: (vendorData: Partial<Vendor>) => Promise<Vendor>;
  updateVendorProfile: (vendorId: string, updatedData: Partial<Vendor>) => Promise<void>;
  registerCustomer: (customerData: {
    id?: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    area: IkoroduArea;
  }) => User;
  approveVendor: (vendorId: string) => Promise<void>;
  rejectVendor: (vendorId: string, reason?: string) => Promise<void>;
  suspendVendor: (vendorId: string) => Promise<void>;
  reactivateVendor: (vendorId: string) => Promise<void>;
  deleteVendorPermanently: (vendorId: string) => Promise<void>;
  toggleVerifyVendor: (vendorId: string) => void;
  toggleFeatureVendor: (vendorId: string) => void;
  toggleVendorFeature: (vendorId: string, feature: VendorFeature) => void;
  updateVendorFeatures: (vendorId: string, features: VendorFeature[]) => void;

  addProduct: (productData: Partial<Product>) => Promise<Product>;
  updateProduct: (productId: string, productData: Partial<Product>) => Promise<void>;
  deleteProduct: (productId: string) => void;
  approveProduct: (productId: string) => void;
  trackWhatsAppClick: (vendorId: string) => void;

  addReview: (reviewData: Omit<Review, 'id' | 'createdAt'>) => void;
  approveReview: (reviewId: string) => void;
  rejectReview: (reviewId: string) => void;
  deleteReview: (reviewId: string) => void;
  replyReview: (reviewId: string, replyText: string) => void;

  sendEnquiry: (enquiryData: Omit<Enquiry, 'id' | 'createdAt' | 'status'>) => void;
  replyEnquiry: (enquiryId: string, replyText: string) => void;

  submitPromotionRequest: (data: Omit<PromotionRequest, 'id' | 'status' | 'requestedAt'>) => PromotionRequest;
  approvePromotionRequest: (
    requestId: string,
    adminNote?: string,
    slotConfig?: {
      assignedSlot?: 'homepage_banner' | 'featured_product' | 'featured_vendor' | 'sponsored_vendor' | 'category_top';
      startDate?: string;
      expiresAt?: string;
      assignedTargetId?: string;
      bannerImageUrl?: string;
      bannerHeading?: string;
      bannerSubtext?: string;
    }
  ) => void;
  createDirectPromotionAssignment: (assignmentData: {
    vendorId: string;
    vendorName: string;
    assignedSlot: 'homepage_banner' | 'featured_product' | 'featured_vendor' | 'sponsored_vendor' | 'category_top';
    assignedTargetId?: string;
    startDate: string;
    durationWeeks: number;
    amountNaira?: number;
    bannerHeading?: string;
    bannerSubtext?: string;
    bannerImageUrl?: string;
    adminNote?: string;
  }) => void;
  rejectPromotionRequest: (requestId: string, adminNote?: string) => void;
  removeActivePromotion: (requestId: string) => void;

  // Paid Vendor Verification Actions (₦3,000)
  submitVerificationRequest: (data: Omit<VerificationRequest, 'id' | 'status' | 'requestedAt'>) => VerificationRequest;
  approveVerificationRequest: (requestId: string, adminNote?: string) => void;
  rejectVerificationRequest: (requestId: string, adminNote?: string) => void;

  toggleWishlist: (productId: string) => void;
  toggleFollowVendor: (vendorId: string) => void;
  
  markNotificationRead: (id: string) => void;
  
  // Selected detail view helper state
  selectedVendorId: string | null;
  setSelectedVendorId: (id: string | null) => void;
  selectedVendorSlug: string | null;
  setSelectedVendorSlug: (slug: string | null) => void;
  navigateToVendor: (vendorOrIdOrSlug: Vendor | string) => void;
  selectedProductId: string | null;
  setSelectedProductId: (id: string | null) => void;

  // Track engagement clicks
  trackVendorWhatsAppClick: (vendorId: string) => void;
  trackVendorPhoneClick: (vendorId: string) => void;

  // Auth Modal state
  isAuthModalOpen: boolean;
  openAuthModal: () => void;
  closeAuthModal: () => void;

  // Supabase Auth Methods
  signInWithSupabase: (e: string, p: string) => Promise<any>;
  signUpWithSupabase: (e: string, p: string, data: Partial<User>, autoNavigate?: boolean) => Promise<any>;
  signOutSupabase: () => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const LOCAL_STORAGE_KEY = 'ikorodu_square_state_v1';

const cleanupObsoleteLocalStorageKeys = () => {
  if (typeof window === 'undefined') return;
  const keysToRemove = [
    `${LOCAL_STORAGE_KEY}_promotions`,
    `${LOCAL_STORAGE_KEY}_products`,
    `${LOCAL_STORAGE_KEY}_vendors`,
    `${LOCAL_STORAGE_KEY}_reviews`,
    `${LOCAL_STORAGE_KEY}_enquiries`,
    `${LOCAL_STORAGE_KEY}_notifications`,
    'ikorodu_square_state_v1_promotions',
    'ikorodu_square_state_v1_products',
    'ikorodu_square_state_v1_vendors',
    'ikorodu_square_state_v1_reviews',
    'ikorodu_square_state_v1_enquiries',
    'ikorodu_square_state_v1_notifications',
  ];
  keysToRemove.forEach((key) => {
    try {
      if (localStorage.getItem(key) !== null) {
        localStorage.removeItem(key);
        console.log(`[Storage Cleanup] Purged obsolete key from localStorage: ${key}`);
      }
    } catch (e) {
      console.warn(`[Storage Cleanup] Error removing key ${key}:`, e);
    }
  });
};

// Execute initial cleanup on load
cleanupObsoleteLocalStorageKeys();

const safeSetLocalStorage = (key: string, value: any) => {
  try {
    const serialized = JSON.stringify(value);
    localStorage.setItem(key, serialized);
  } catch (err) {
    console.warn(`[LocalStorage] QuotaExceededError or write failed for "${key}":`, err);
  }
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const isSupabaseConnected = isSupabaseConfigured();

  // Default user is Guest until signed in
  const [currentRole, setRoleState] = useState<UserRole>('guest');
  const [activeTab, setActiveTabState] = useState<string>('home');
  const [selectedVendorId, setSelectedVendorIdState] = useState<string | null>(null);
  const [selectedVendorSlug, setSelectedVendorSlug] = useState<string | null>(null);
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);

  const [currentUser, setCurrentUser] = useState<User | null>(null);

  // Auth Modal State (single source of truth)
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const openAuthModal = () => setIsAuthModalOpen(true);
  const closeAuthModal = () => setIsAuthModalOpen(false);

  // State - Pure real database states, initialized to empty arrays
  const [isLoadingData, setIsLoadingData] = useState<boolean>(true);
  const [isCriticalDataLoading, setIsCriticalDataLoading] = useState<boolean>(true);
  const [isSecondaryDataLoading, setIsSecondaryDataLoading] = useState<boolean>(true);
  const [criticalDataError, setCriticalDataError] = useState<string | null>(null);

  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [enquiries, setEnquiries] = useState<Enquiry[]>([]);
  const [promotionRequests, setPromotionRequests] = useState<PromotionRequest[]>([]);
  const [verificationRequests, setVerificationRequests] = useState<VerificationRequest[]>([]);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [followingVendors, setFollowingVendors] = useState<string[]>([]);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedArea, setSelectedArea] = useState<IkoroduArea | 'All'>('All');

  // Near Me & Location States
  const [isNearMeActive, setIsNearMeActive] = useState(false);
  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [locationStatus, setLocationStatus] = useState<'idle' | 'prompting' | 'active' | 'denied' | 'unavailable'>('idle');
  const [locationError, setLocationError] = useState<string | null>(null);
  const [nearMeRadiusKm, setNearMeRadiusKm] = useState<number>(5);

  const requestNearMe = useCallback(async (): Promise<boolean> => {
    if (typeof window === 'undefined' || !('geolocation' in navigator)) {
      setLocationStatus('unavailable');
      setLocationError('Geolocation is not supported by your browser.');
      setIsNearMeActive(false);
      return false;
    }

    setLocationStatus('prompting');
    setLocationError(null);

    return new Promise<boolean>((resolve) => {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const coords = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          };
          setUserLocation(coords);
          setLocationStatus('active');
          setLocationError(null);
          setIsNearMeActive(true);
          resolve(true);
        },
        (error) => {
          if (error.code === error.PERMISSION_DENIED) {
            setLocationStatus('denied');
            setLocationError('Location access was denied. You can still search IkoroduSquare normally.');
          } else {
            setLocationStatus('unavailable');
            setLocationError('Location unavailable or request timed out. You can continue searching normally.');
          }
          setIsNearMeActive(false);
          resolve(false);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 60000,
        }
      );
    });
  }, []);

  const disableNearMe = useCallback(() => {
    setIsNearMeActive(false);
  }, []);

  // Tier 1: Critical Public Catalog (Vendors, Products, Promotions)
  const fetchCriticalPublicData = useCallback(async () => {
    if (!isSupabaseConfigured()) {
      setIsCriticalDataLoading(false);
      setIsLoadingData(false);
      return;
    }
    setIsCriticalDataLoading(true);
    setIsLoadingData(true);
    setCriticalDataError(null);
    try {
      const [sbVendors, sbProducts, sbPromos] = await Promise.all([
        fetchVendorsFromSupabase(),
        fetchProductsFromSupabase(),
        fetchPromotionsFromSupabase(),
      ]);

      if (sbVendors !== null) setVendors(sbVendors);
      if (sbProducts !== null) setProducts(sbProducts);
      if (sbPromos !== null) setPromotionRequests(sbPromos);
      setCriticalDataError(null);
    } catch (err: any) {
      console.error('Error fetching critical public data (vendors, products, promotions):', err);
      setCriticalDataError(err?.message || 'Failed to load business directory and products. Please check your internet connection.');
    } finally {
      setIsCriticalDataLoading(false);
      setIsLoadingData(false);
    }
  }, []);

  // Tier 2: Secondary / Background Data (Reviews, Enquiries, Verifications, Notifications, Audit Logs)
  const fetchSecondaryData = useCallback(async () => {
    if (!isSupabaseConfigured()) {
      setIsSecondaryDataLoading(false);
      return;
    }
    setIsSecondaryDataLoading(true);
    try {
      const results = await Promise.allSettled([
        fetchReviewsFromSupabase(),
        fetchEnquiriesFromSupabase(),
        fetchVerificationRequestsFromSupabase(),
        fetchNotificationsFromSupabase(),
        fetchAuditLogsFromSupabase(),
      ]);

      const [resReviews, resEnquiries, resVerifs, resNotifs, resLogs] = results;
      if (resReviews.status === 'fulfilled' && resReviews.value !== null) {
        const fetchedReviews = resReviews.value;
        setReviews(fetchedReviews);
        // Automatically reconcile vendor rating and reviewCount with real database reviews
        setVendors((prevVendors) =>
          prevVendors.map((v) => {
            const applicable = fetchedReviews.filter(
              (r) => r.vendorId === v.id && (r.status === 'approved' || !r.status || r.status === 'pending')
            );
            const count = applicable.length;
            const avg = count > 0 ? Number((applicable.reduce((acc, r) => acc + (Number(r.rating) || 0), 0) / count).toFixed(1)) : 0;
            if (v.rating !== avg || v.reviewCount !== count) {
              return { ...v, rating: avg, reviewCount: count };
            }
            return v;
          })
        );
      }
      if (resEnquiries.status === 'fulfilled' && resEnquiries.value !== null) setEnquiries(resEnquiries.value);
      if (resVerifs.status === 'fulfilled' && resVerifs.value !== null) setVerificationRequests(resVerifs.value);
      if (resNotifs.status === 'fulfilled' && resNotifs.value !== null) setNotifications(resNotifs.value);
      if (resLogs.status === 'fulfilled' && resLogs.value !== null) setAuditLogs(resLogs.value);
    } catch (err) {
      console.warn('Non-blocking secondary background data refresh encountered an error:', err);
    } finally {
      setIsSecondaryDataLoading(false);
    }
  }, []);

  // Combined Refresh (runs both concurrently without blocking critical public UI)
  const refreshData = useCallback(async () => {
    await Promise.allSettled([
      fetchCriticalPublicData(),
      fetchSecondaryData(),
    ]);
  }, [fetchCriticalPublicData, fetchSecondaryData]);

  const refreshCriticalData = useCallback(async () => {
    await fetchCriticalPublicData();
  }, [fetchCriticalPublicData]);

  const setSelectedVendorId = (id: string | null) => {
    setSelectedVendorIdState(id);
    if (id) {
      const matched = vendors.find((v) => v.id === id);
      if (matched && matched.slug) {
        setSelectedVendorSlug(matched.slug);
      } else {
        setSelectedVendorSlug(id);
      }
    } else {
      setSelectedVendorSlug(null);
    }
  };

  const navigateToVendor = (vendorOrIdOrSlug: Vendor | string) => {
    let targetVendor: Vendor | undefined;
    let targetSlug = '';
    let targetId: string | null = null;

    if (typeof vendorOrIdOrSlug === 'object' && vendorOrIdOrSlug) {
      targetVendor = vendorOrIdOrSlug;
      targetId = targetVendor.id;
      targetSlug = targetVendor.slug || targetVendor.id;
    } else if (typeof vendorOrIdOrSlug === 'string' && vendorOrIdOrSlug.trim()) {
      const query = vendorOrIdOrSlug.trim();
      targetVendor = vendors.find(
        (v) => v.id === query || (v.slug && v.slug.toLowerCase() === query.toLowerCase())
      );
      if (targetVendor) {
        targetId = targetVendor.id;
        targetSlug = targetVendor.slug || targetVendor.id;
      } else {
        targetSlug = query;
      }
    }

    if (targetId) {
      setSelectedVendorIdState(targetId);
    }
    if (targetSlug) {
      setSelectedVendorSlug(targetSlug);
    }
    setActiveTabState('vendor-details');

    const urlPath = targetSlug ? `/store/${targetSlug}` : '/directory';
    if (window.location.pathname !== urlPath) {
      window.history.pushState({}, '', urlPath);
    }

    // Scroll to top immediately & on next animation frame
    window.scrollTo(0, 0);
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
    requestAnimationFrame(() => {
      window.scrollTo(0, 0);
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
    });
  };

  // Initial URL Route Sync & Popstate listener
  const handlePopState = useCallback(() => {
    const path = window.location.pathname;
    const p = path.toLowerCase();

    if (p.startsWith('/store/')) {
      const slug = decodeURIComponent(path.substring(7)).trim();
      if (slug) {
        setActiveTabState('vendor-details');
        setSelectedVendorSlug(slug);
        const matched = vendors.find(
          (v) => (v.slug && v.slug.toLowerCase() === slug.toLowerCase()) || v.id === slug
        );
        if (matched) {
          setSelectedVendorIdState(matched.id);
        } else {
          setSelectedVendorIdState(null);
        }
      }
    } else if (p === '/admin') {
      setSelectedVendorSlug(null);
      setSelectedVendorIdState(null);
      if (currentUser && currentUser.role === 'admin') {
        setActiveTabState('admin-portal');
      } else {
        setActiveTabState('home');
        if (window.location.pathname !== '/') window.history.replaceState({}, '', '/');
      }
    } else if (p === '/vendor-portal' || p === '/vendor') {
      setSelectedVendorSlug(null);
      setSelectedVendorIdState(null);
      if (currentUser && currentUser.role === 'vendor') {
        setActiveTabState('vendor-portal');
      } else {
        setActiveTabState('home');
        if (window.location.pathname !== '/') window.history.replaceState({}, '', '/');
      }
    } else if (p === '/customer-portal' || p === '/customer') {
      setSelectedVendorSlug(null);
      setSelectedVendorIdState(null);
      if (currentUser) {
        setActiveTabState('customer-portal');
      } else {
        setActiveTabState('home');
        if (window.location.pathname !== '/') window.history.replaceState({}, '', '/');
      }
    } else if (p === '/marketplace') {
      setSelectedVendorSlug(null);
      setSelectedVendorIdState(null);
      setActiveTabState('marketplace');
    } else if (p === '/directory') {
      setSelectedVendorSlug(null);
      setSelectedVendorIdState(null);
      setActiveTabState('directory');
    } else if (p === '/categories') {
      setSelectedVendorSlug(null);
      setSelectedVendorIdState(null);
      setActiveTabState('categories');
    } else if (p === '/promotions') {
      setSelectedVendorSlug(null);
      setSelectedVendorIdState(null);
      setActiveTabState('promotions');
    } else if (p === '/register') {
      setSelectedVendorSlug(null);
      setSelectedVendorIdState(null);
      setActiveTabState('register-vendor');
    } else {
      setSelectedVendorSlug(null);
      setSelectedVendorIdState(null);
      setActiveTabState('home');
    }

    // Scroll to top on browser back/forward
    window.scrollTo(0, 0);
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  }, [currentUser, vendors]);

  // Set manual scroll restoration to prevent browser overriding programmatic scroll on route change
  useEffect(() => {
    if (typeof window !== 'undefined' && 'scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual';
    }
  }, []);

  // Sync selected vendor from URL when vendors list updates
  useEffect(() => {
    if (typeof window !== 'undefined' && window.location.pathname.toLowerCase().startsWith('/store/')) {
      const slug = decodeURIComponent(window.location.pathname.substring(7)).trim();
      if (slug) {
        const matched = vendors.find(
          (v) => (v.slug && v.slug.toLowerCase() === slug.toLowerCase()) || v.id === slug
        );
        if (matched) {
          setSelectedVendorIdState(matched.id);
          setSelectedVendorSlug(matched.slug || slug);
        }
      }
    }
  }, [vendors]);

  useEffect(() => {
    handlePopState();
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [handlePopState]);

  const setActiveTab = (tab: string, replace: boolean = false) => {
    let targetTab = tab;
    let shouldReplace = replace;

    // Enforce Route Protection
    if (targetTab === 'vendor-portal' || targetTab === 'vendor') {
      if (!currentUser || currentUser.role !== 'vendor') {
        targetTab = 'home';
        shouldReplace = true;
      }
    } else if (targetTab === 'admin-portal' || targetTab === 'admin') {
      if (!currentUser || currentUser.role !== 'admin') {
        targetTab = 'home';
        shouldReplace = true;
      }
    } else if (targetTab === 'customer-portal') {
      if (!currentUser) {
        targetTab = 'home';
        shouldReplace = true;
      }
    }

    setActiveTabState(targetTab);

    let urlPath = '/';
    if (targetTab === 'vendor-details') {
      let slugToUse = selectedVendorSlug;
      if (selectedVendorId) {
        const v = vendors.find((item) => item.id === selectedVendorId);
        if (v && v.slug) slugToUse = v.slug;
      }
      urlPath = slugToUse ? `/store/${slugToUse}` : '/directory';
    } else if (targetTab === 'admin-portal' || targetTab === 'admin') {
      urlPath = '/admin';
      setSelectedVendorSlug(null);
      setSelectedVendorIdState(null);
    } else if (targetTab === 'marketplace') {
      urlPath = '/marketplace';
      setSelectedVendorSlug(null);
      setSelectedVendorIdState(null);
    } else if (targetTab === 'directory') {
      urlPath = '/directory';
      setSelectedVendorSlug(null);
      setSelectedVendorIdState(null);
    } else if (targetTab === 'categories') {
      urlPath = '/categories';
      setSelectedVendorSlug(null);
      setSelectedVendorIdState(null);
    } else if (targetTab === 'promotions' || targetTab === 'promotions-pricing') {
      urlPath = '/promotions';
      setSelectedVendorSlug(null);
      setSelectedVendorIdState(null);
    } else if (targetTab === 'vendor-portal') {
      urlPath = '/vendor-portal';
      setSelectedVendorSlug(null);
      setSelectedVendorIdState(null);
    } else if (targetTab === 'register-vendor' || targetTab === 'vendor-register') {
      urlPath = '/register';
      setSelectedVendorSlug(null);
      setSelectedVendorIdState(null);
    } else if (targetTab === 'customer-portal') {
      urlPath = '/customer-portal';
      setSelectedVendorSlug(null);
      setSelectedVendorIdState(null);
    } else if (targetTab === 'home') {
      urlPath = '/';
      setSelectedVendorSlug(null);
      setSelectedVendorIdState(null);
    }

    if (window.location.pathname !== urlPath) {
      if (shouldReplace) {
        window.history.replaceState({}, '', urlPath);
      } else {
        window.history.pushState({}, '', urlPath);
      }
    }

    // Scroll to top on tab change
    window.scrollTo(0, 0);
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
    requestAnimationFrame(() => {
      window.scrollTo(0, 0);
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
    });
  };

  // Synchronize authenticated user state with Supabase session and public.profiles
  const syncSessionUser = async (session: any) => {
    if (!session?.user) {
      setCurrentUser(null);
      setRoleState('guest');
      return null;
    }
    const u = session.user;
    let profile = await fetchProfileFromSupabase(u.id);
    if (!profile) {
      const meta = u.user_metadata || {};
      await createProfileInSupabase({
        id: u.id,
        email: u.email || '',
        role: (meta.role as any) || 'customer',
        firstName: meta.firstName || '',
        lastName: meta.lastName || '',
        phone: meta.phone || '',
        area: meta.area || 'Sabo',
      });
      profile = await fetchProfileFromSupabase(u.id);
    }
    const meta = u.user_metadata || {};
    const role = (profile?.role || (meta.role as UserRole)) || 'customer';
    const userObj: User = {
      id: u.id,
      email: profile?.email || u.email || '',
      firstName: profile?.first_name || meta.firstName || 'User',
      lastName: profile?.last_name || meta.lastName || '',
      phone: profile?.phone || meta.phone || '',
      role: role,
      area: profile?.area || meta.area || 'Sabo',
      isVerified: true,
      createdAt: u.created_at || new Date().toISOString(),
    };
    setCurrentUser(userObj);
    setRoleState(role);
    setIsAuthModalOpen(false);
    return userObj;
  };

  // Supabase Initial Load & Auth Sync
  useEffect(() => {
    let isMounted = true;
    if (!isSupabaseConfigured()) {
      const timer = setTimeout(() => {
        if (isMounted) {
          setIsCriticalDataLoading(false);
          setIsLoadingData(false);
          setIsSecondaryDataLoading(false);
        }
      }, 500);
      return () => {
        isMounted = false;
        clearTimeout(timer);
      };
    }

    // 1. Tier 1: Fire critical public data load immediately (fastest path to show homepage & catalog)
    fetchCriticalPublicData();

    // 2. Tier 2: Concurrently fire secondary background data without blocking public catalog
    fetchSecondaryData();

    // 3. Auth: Concurrently check session without blocking public catalog
    (async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();
        if (isMounted && session) {
          await syncSessionUser(session);
        }
      } catch (err) {
        console.error('Session sync error on mount:', err);
      }
    })();

    // Listen to Supabase Auth Changes
    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_OUT' || !session) {
        setCurrentUser(null);
        setRoleState('guest');
        setSelectedVendorId(null);
        setSelectedProductId(null);
        setIsAuthModalOpen(false);
        localStorage.removeItem(`${LOCAL_STORAGE_KEY}_user`);
        localStorage.removeItem(`${LOCAL_STORAGE_KEY}_profile`);
        localStorage.removeItem(`${LOCAL_STORAGE_KEY}_vendor`);
        localStorage.removeItem(`${LOCAL_STORAGE_KEY}_role`);
        sessionStorage.clear();
        setActiveTabState('home');
        if (window.location.pathname !== '/') {
          window.history.replaceState({}, '', '/');
        }
      } else {
        await syncSessionUser(session);
        setIsAuthModalOpen(false);
      }
    });

    return () => {
      authListener?.subscription?.unsubscribe();
    };
  }, [fetchCriticalPublicData, fetchSecondaryData]);

  // Route protection effect: automatically redirect if protected tab is active without valid user
  useEffect(() => {
    if (activeTab === 'vendor-portal' && (!currentUser || currentUser.role !== 'vendor')) {
      setActiveTab('home', true);
    } else if ((activeTab === 'admin-portal' || activeTab === 'admin') && (!currentUser || currentUser.role !== 'admin')) {
      setActiveTab('home', true);
    } else if (activeTab === 'customer-portal' && !currentUser) {
      setActiveTab('home', true);
    }
  }, [currentUser, activeTab]);

  // Set Role handler (synchronizes with authenticated user profile without mock defaults)
  const setRole = (role: UserRole) => {
    if (role === 'guest') {
      signOutSupabase();
      return;
    }
    setRoleState(role);
    if (currentUser) {
      const updatedUser = { ...currentUser, role };
      setCurrentUser(updatedUser);
      updateProfileInSupabase(currentUser.id, { role });
    }
  };

  // Vendor actions
  const addVendorRegistration = async (vendorData: Partial<Vendor>): Promise<Vendor> => {
    const newVendor: Vendor = {
      id: vendorData.id || `v-${Date.now()}`,
      userId: vendorData.userId || (currentUser?.id || undefined),
      businessName: vendorData.businessName || 'New Business',
      slug: (vendorData.businessName || 'new-business').toLowerCase().replace(/\s+/g, '-'),
      category: vendorData.category || 'General Services',
      subcategory: vendorData.subcategory || 'General',
      description: vendorData.description || '',
      address: vendorData.address || 'Ikorodu, Lagos',
      area: vendorData.area || 'Sabo',
      lga: 'Ikorodu',
      state: 'Lagos State',
      country: 'Nigeria',
      phone: vendorData.phone || '',
      whatsapp: vendorData.whatsapp || '',
      website: vendorData.website,
      instagram: vendorData.instagram,
      facebook: vendorData.facebook,
      tiktok: vendorData.tiktok,
      yearsInBusiness: vendorData.yearsInBusiness || 1,
      logoUrl: vendorData.logoUrl || 'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?auto=format&fit=crop&q=80&w=300',
      coverImageUrl: vendorData.coverImageUrl || 'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?auto=format&fit=crop&q=80&w=1200',
      galleryUrls: vendorData.galleryUrls || [],
      cacCertificateUrl: vendorData.cacCertificateUrl,
      ninDocUrl: vendorData.ninDocUrl,
      ownerName: vendorData.ownerName || 'Owner Name',
      ownerEmail: vendorData.ownerEmail || 'owner@example.com',
      ownerPhone: vendorData.ownerPhone || '',
      status: 'pending', // Pending approval!
      isVerified: false,
      isFeatured: false,
      isPremium: false,
      rating: 0,
      reviewCount: 0,
      businessHours: vendorData.businessHours || [
        { day: 'Monday', openTime: '08:00', closeTime: '18:00', isClosed: false },
        { day: 'Tuesday', openTime: '08:00', closeTime: '18:00', isClosed: false },
        { day: 'Wednesday', openTime: '08:00', closeTime: '18:00', isClosed: false },
        { day: 'Thursday', openTime: '08:00', closeTime: '18:00', isClosed: false },
        { day: 'Friday', openTime: '08:00', closeTime: '18:00', isClosed: false },
        { day: 'Saturday', openTime: '09:00', closeTime: '17:00', isClosed: false },
        { day: 'Sunday', openTime: '00:00', closeTime: '00:00', isClosed: true },
      ],
      deliveryAreas: vendorData.deliveryAreas || ['Sabo', 'Garage', 'Agric'],
      viewsCount: 1,
      whatsappClicks: 0,
      phoneClicks: 0,
      createdAt: new Date().toISOString(),
    };

    console.log('[VENDOR OBJECT CREATED]', {
      id: newVendor.id,
      userId: newVendor.userId,
      businessName: newVendor.businessName,
      status: newVendor.status,
    });

    await saveVendorToSupabase(newVendor);
    setVendors((prev) => [newVendor, ...prev.filter((v) => v.id !== newVendor.id)]);

    // Add admin notification
    const newNotif: NotificationItem = {
      id: `n-${Date.now()}`,
      userId: 'admin',
      targetRole: 'admin',
      title: 'New Vendor Registration Submitted',
      message: `${newVendor.businessName} (${newVendor.area}) is awaiting approval.`,
      type: 'vendor_approval',
      isRead: false,
      createdAt: new Date().toISOString(),
    };
    setNotifications((prev) => [newNotif, ...prev]);
    saveNotificationToSupabase(newNotif);

    // Audit log
    const log: AuditLog = {
      id: `log-${Date.now()}`,
      action: 'VENDOR_REGISTERED',
      performedBy: newVendor.ownerName,
      role: 'vendor',
      details: `Registered ${newVendor.businessName} in ${newVendor.area}`,
      timestamp: new Date().toISOString(),
    };
    setAuditLogs((prev) => [log, ...prev]);
    saveAuditLogToSupabase(log);

    return newVendor;
  };

  const registerCustomer = (customerData: {
    id?: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    area: IkoroduArea;
  }): User => {
    const newUser: User = {
      id: customerData.id || `usr-${Date.now()}`,
      email: customerData.email,
      firstName: customerData.firstName,
      lastName: customerData.lastName,
      phone: customerData.phone,
      role: 'customer',
      area: customerData.area,
      isVerified: true,
      createdAt: new Date().toISOString(),
    };
    setCurrentUser(newUser);
    setRole('customer');

    // Add notification
    const notif: NotificationItem = {
      id: `notif-${Date.now()}`,
      userId: newUser.id,
      targetRole: 'customer',
      title: 'Welcome to IkoroduSquare!',
      message: `Hi ${customerData.firstName}, your customer account is active. Discover local businesses and shop products.`,
      type: 'system',
      isRead: false,
      createdAt: new Date().toISOString(),
    };
    setNotifications((prev) => [notif, ...prev]);
    saveNotificationToSupabase(notif);

    // Audit log
    const log: AuditLog = {
      id: `log-${Date.now()}`,
      action: 'CUSTOMER_REGISTERED',
      performedBy: `${customerData.firstName} ${customerData.lastName}`,
      role: 'customer',
      details: `Registered customer account (${customerData.email}) in ${customerData.area}`,
      timestamp: new Date().toISOString(),
    };
    setAuditLogs((prev) => [log, ...prev]);
    saveAuditLogToSupabase(log);

    return newUser;
  };

  const approveVendor = async (vendorId: string) => {
    setVendors((prev) =>
      prev.map((v) => (v.id === vendorId ? { ...v, status: 'approved' } : v))
    );
    await updateVendorInSupabase(vendorId, { status: 'approved' });

    // Refresh vendors to ensure exact DB sync
    const fresh = await fetchVendorsFromSupabase();
    if (fresh !== null) setVendors(fresh);

    // Add audit
    const log: AuditLog = {
      id: `log-${Date.now()}`,
      action: 'VENDOR_APPROVED',
      performedBy: 'Admin',
      role: 'admin',
      details: `Approved vendor ID: ${vendorId}`,
      timestamp: new Date().toISOString(),
    };
    setAuditLogs((prev) => [log, ...prev]);
    saveAuditLogToSupabase(log);
  };

  const updateVendorProfile = async (vendorId: string, updatedData: Partial<Vendor>) => {
    setVendors((prev) =>
      prev.map((v) => (v.id === vendorId ? { ...v, ...updatedData } : v))
    );
    await updateVendorInSupabase(vendorId, updatedData);

    // Sync currentUser profile if this vendor belongs to currentUser
    if (
      currentUser &&
      (currentUser.id === vendorId ||
        (updatedData.ownerEmail && currentUser.email.toLowerCase() === updatedData.ownerEmail.toLowerCase()))
    ) {
      let fName = currentUser.firstName;
      let lName = currentUser.lastName;
      if (updatedData.ownerName) {
        const parts = updatedData.ownerName.trim().split(' ');
        fName = parts[0] || fName;
        lName = parts.slice(1).join(' ') || lName;
      }
      const updatedUser: User = {
        ...currentUser,
        firstName: fName,
        lastName: lName,
        phone: updatedData.ownerPhone || currentUser.phone,
        area: updatedData.area || currentUser.area,
      };
      setCurrentUser(updatedUser);
      updateProfileInSupabase(currentUser.id, {
        firstName: fName,
        lastName: lName,
        phone: updatedUser.phone,
        area: updatedUser.area,
      });
    }

    const log: AuditLog = {
      id: `log-${Date.now()}`,
      action: 'VENDOR_PROFILE_UPDATED',
      performedBy: updatedData.businessName || updatedData.ownerName || 'Vendor',
      role: 'vendor',
      details: `Updated vendor profile details for vendor ID: ${vendorId}`,
      timestamp: new Date().toISOString(),
    };
    setAuditLogs((prev) => [log, ...prev]);
    saveAuditLogToSupabase(log);
  };

  const rejectVendor = async (vendorId: string, reason?: string) => {
    setVendors((prev) =>
      prev.map((v) => (v.id === vendorId ? { ...v, status: 'rejected' } : v))
    );
    await updateVendorInSupabase(vendorId, { status: 'rejected' });

    const fresh = await fetchVendorsFromSupabase();
    if (fresh !== null) setVendors(fresh);

    const log: AuditLog = {
      id: `log-${Date.now()}`,
      action: 'VENDOR_REJECTED',
      performedBy: 'Admin',
      role: 'admin',
      details: `Rejected vendor ID: ${vendorId}. Reason: ${reason || 'N/A'}`,
      timestamp: new Date().toISOString(),
    };
    setAuditLogs((prev) => [log, ...prev]);
    saveAuditLogToSupabase(log);
  };

  const suspendVendor = async (vendorId: string) => {
    setVendors((prev) =>
      prev.map((v) => (v.id === vendorId ? { ...v, status: 'suspended' } : v))
    );
    await updateVendorInSupabase(vendorId, { status: 'suspended' });
  };

  const reactivateVendor = async (vendorId: string) => {
    setVendors((prev) =>
      prev.map((v) => (v.id === vendorId ? { ...v, status: 'approved' } : v))
    );
    await updateVendorInSupabase(vendorId, { status: 'approved' });

    const log: AuditLog = {
      id: `log-${Date.now()}`,
      action: 'VENDOR_REACTIVATED',
      performedBy: 'Admin',
      role: 'admin',
      details: `Reactivated vendor ID: ${vendorId}`,
      timestamp: new Date().toISOString(),
    };
    setAuditLogs((prev) => [log, ...prev]);
    saveAuditLogToSupabase(log);
  };

  const deleteVendorPermanently = async (vendorId: string) => {
    const targetVendor = vendors.find((v) => v.id === vendorId);
    const vendorName = targetVendor ? targetVendor.businessName : vendorId;

    setVendors((prev) => prev.filter((v) => v.id !== vendorId));
    setProducts((prev) => prev.filter((p) => p.vendorId !== vendorId));
    setPromotionRequests((prev) => prev.filter((pr) => pr.vendorId !== vendorId));
    setReviews((prev) => prev.filter((r) => r.vendorId !== vendorId));
    setEnquiries((prev) => prev.filter((e) => e.vendorId !== vendorId));

    await deleteVendorFromSupabase(vendorId);

    const log: AuditLog = {
      id: `log-${Date.now()}`,
      action: 'VENDOR_PERMANENTLY_DELETED',
      performedBy: 'Admin',
      role: 'admin',
      details: `Permanently deleted vendor "${vendorName}" (ID: ${vendorId}) and associated products, promotions, reviews, and enquiries.`,
      timestamp: new Date().toISOString(),
    };
    setAuditLogs((prev) => [log, ...prev]);
    saveAuditLogToSupabase(log);
  };

  const toggleVerifyVendor = (vendorId: string) => {
    const target = vendors.find((v) => v.id === vendorId);
    if (!target) return;
    const nextVal = !target.isVerified;
    setVendors((prev) =>
      prev.map((v) => (v.id === vendorId ? { ...v, isVerified: nextVal } : v))
    );
    updateVendorInSupabase(vendorId, { isVerified: nextVal });
  };

  const toggleFeatureVendor = (vendorId: string) => {
    const target = vendors.find((v) => v.id === vendorId);
    if (!target) return;
    const nextVal = !target.isFeatured;
    setVendors((prev) =>
      prev.map((v) => (v.id === vendorId ? { ...v, isFeatured: nextVal } : v))
    );
    updateVendorInSupabase(vendorId, { isFeatured: nextVal });
  };

  const updateVendorFeatures = (vendorId: string, features: VendorFeature[]) => {
    const target = vendors.find((v) => v.id === vendorId);
    if (!target) return;

    const isVerified = features.includes('Verified Business');
    const isPremium = features.includes('Premium Vendor');
    const isFeatured = features.includes('Featured Vendor');

    setVendors((prev) =>
      prev.map((v) =>
        v.id === vendorId
          ? {
              ...v,
              features,
              isVerified,
              isPremium,
              isFeatured,
            }
          : v
      )
    );

    updateVendorInSupabase(vendorId, {
      features,
      isVerified,
      isPremium,
      isFeatured,
    });

    const log: AuditLog = {
      id: `log-${Date.now()}`,
      timestamp: new Date().toISOString(),
      performedBy: currentUser ? `${currentUser.firstName} (${currentUser.role})` : 'System Admin',
      role: 'admin',
      action: 'UPDATE_VENDOR_FEATURES',
      details: `Updated features for ${target.businessName}: [${features.join(', ')}]`,
    };
    setAuditLogs((prev) => [log, ...prev]);
    saveAuditLogToSupabase(log);
  };

  const toggleVendorFeature = (vendorId: string, feature: VendorFeature) => {
    const target = vendors.find((v) => v.id === vendorId);
    if (!target) return;
    const currentFeatures = target.features || [];
    const hasFeature = currentFeatures.includes(feature);
    const updatedFeatures = hasFeature
      ? currentFeatures.filter((f) => f !== feature)
      : [...currentFeatures, feature];
    updateVendorFeatures(vendorId, updatedFeatures);
  };

  // Product Actions
  const addProduct = async (productData: Partial<Product>): Promise<Product> => {
    const newProduct: Product = {
      id: `p-${Date.now()}`,
      vendorId: productData.vendorId || 'v-3',
      vendorName: productData.vendorName || 'Sparkle Electronics & Gadgets Sabo',
      vendorArea: productData.vendorArea || 'Sabo',
      type: productData.type || 'product',
      name: productData.name || 'New Item',
      slug: (productData.name || 'new-item').toLowerCase().replace(/\s+/g, '-'),
      description: productData.description || '',
      price: typeof productData.price === 'number' ? productData.price : Number(productData.price) || 0,
      salePrice: productData.salePrice !== undefined && (productData.salePrice as any) !== '' ? Number(productData.salePrice) : undefined,
      sku: productData.sku || `SKU-${Date.now().toString().slice(-6)}`,
      stock: typeof productData.stock === 'number' ? productData.stock : Number(productData.stock) || 10,
      category: productData.category || 'General',
      subcategory: productData.subcategory || 'General',
      brand: productData.brand,
      tags: productData.tags || [],
      condition: productData.condition || 'New',
      availability: 'In Stock',
      deliveryOptions: productData.deliveryOptions || ['Rider Delivery', 'Store Pick-up'],
      images: Array.isArray(productData.images) && productData.images.length > 0
        ? productData.images
        : ['https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?auto=format&fit=crop&q=80&w=800'],
      isFeatured: false,
      status: 'approved', // Auto-approved for verified vendor
      viewsCount: 0,
      createdAt: new Date().toISOString(),
    };

    const dbRes = await saveProductToSupabase(newProduct);
    if (!dbRes.success) {
      console.warn('[ADD PRODUCT] Supabase save returned error:', dbRes.error);
      // Even if DB save fails due to transient connection, local optimistic update still allowed or throw if requested
    }

    setProducts((prev) => [newProduct, ...prev]);
    return newProduct;
  };

  const updateProduct = async (productId: string, productData: Partial<Product>): Promise<void> => {
    const target = products.find((p) => p.id === productId);
    if (!target) return;

    const updated: Product = {
      ...target,
      ...productData,
      price: productData.price !== undefined ? Number(productData.price) : target.price,
      salePrice: productData.salePrice !== undefined && (productData.salePrice as any) !== '' ? Number(productData.salePrice) : target.salePrice,
      images: Array.isArray(productData.images) ? productData.images : target.images,
    };

    const dbRes = await saveProductToSupabase(updated);
    if (!dbRes.success) {
      console.warn('[UPDATE PRODUCT] Supabase save returned error:', dbRes.error);
    }

    setProducts((prev) => prev.map((p) => (p.id === productId ? updated : p)));
  };

  const deleteProduct = (productId: string) => {
    const p = products.find((item) => item.id === productId);
    if (p && p.images && p.images.length > 0) {
      p.images.forEach((imgUrl) => {
        deleteProductImageFromSupabase(imgUrl).catch((err) =>
          console.warn('[PRODUCT DELETION] Error deleting product image from storage:', err)
        );
      });
    }
    setProducts((prev) => prev.filter((p) => p.id !== productId));
    deleteProductFromSupabase(productId);
  };

  const approveProduct = (productId: string) => {
    setProducts((prev) =>
      prev.map((p) => {
        if (p.id === productId) {
          const updated = { ...p, status: 'approved' as const };
          saveProductToSupabase(updated);
          return updated;
        }
        return p;
      })
    );
  };

  const trackWhatsAppClick = (vendorId: string) => {
    setVendors((prev) =>
      prev.map((v) => {
        if (v.id === vendorId) {
          const newClicks = (v.whatsappClicks || 0) + 1;
          updateVendorInSupabase(v.id, { whatsappClicks: newClicks });
          return { ...v, whatsappClicks: newClicks };
        }
        return v;
      })
    );
  };

  // Review Actions
  const computeVendorReviewStats = (vendorId: string, allReviews: Review[]) => {
    const applicable = allReviews.filter(
      (r) => r.vendorId === vendorId && (r.status === 'approved' || !r.status || r.status === 'pending')
    );
    const count = applicable.length;
    if (count === 0) {
      return { rating: 0, reviewCount: 0 };
    }
    const sum = applicable.reduce((acc, r) => acc + (Number(r.rating) || 0), 0);
    const avg = Number((sum / count).toFixed(1));
    return { rating: avg, reviewCount: count };
  };

  const recalculateVendorRating = (vendorId: string, extraReview?: Review) => {
    let currentReviews = reviews.filter((r) => r.vendorId === vendorId && (r.status === 'approved' || !r.status || r.status === 'pending'));
    if (extraReview && !currentReviews.some((r) => r.id === extraReview.id)) {
      currentReviews = [extraReview, ...currentReviews];
    }

    const count = currentReviews.length;
    const totalRating = currentReviews.reduce((sum, r) => sum + (Number(r.rating) || 0), 0);
    const avgRating = count > 0 ? Number((totalRating / count).toFixed(1)) : 0;

    setVendors((prev) =>
      prev.map((v) => {
        if (v.id === vendorId) {
          const updated = { ...v, rating: avgRating, reviewCount: count };
          updateVendorInSupabase(v.id, { rating: avgRating, reviewCount: count });
          return updated;
        }
        return v;
      })
    );
  };

  const addReview = (reviewData: Omit<Review, 'id' | 'createdAt'>) => {
    const targetVendor = vendors.find((v) => v.id === reviewData.vendorId);
    const vendorName = targetVendor ? targetVendor.businessName : 'Vendor';

    const newReview: Review = {
      ...reviewData,
      id: `r-${Date.now()}`,
      status: reviewData.status || 'approved', // Approved & live immediately across storefront, homepage & admin
      createdAt: new Date().toISOString(),
    };

    // 1. Immediately update reviews state
    const nextReviews = [newReview, ...reviews.filter((r) => r.id !== newReview.id)];
    setReviews(nextReviews);

    // 2. Persist to Supabase
    saveReviewToSupabase(newReview);

    // 3. Immediately update vendor reviewCount and rating
    const stats = computeVendorReviewStats(reviewData.vendorId, nextReviews);
    setVendors((prev) =>
      prev.map((v) => {
        if (v.id === reviewData.vendorId) {
          return { ...v, rating: stats.rating, reviewCount: stats.reviewCount };
        }
        return v;
      })
    );

    // 4. Persist updated vendor stats to Supabase vendors table
    updateVendorInSupabase(reviewData.vendorId, {
      rating: stats.rating,
      reviewCount: stats.reviewCount,
    });

    // 5. Create notification for admin
    const notif: NotificationItem = {
      id: `n-${Date.now()}`,
      userId: 'admin',
      targetRole: 'admin',
      title: 'New Customer Review Submitted',
      message: `${reviewData.customerName} submitted a ${reviewData.rating}-star review for "${vendorName}".`,
      type: 'review',
      isRead: false,
      createdAt: new Date().toISOString(),
    };
    setNotifications((prev) => [notif, ...prev]);
    saveNotificationToSupabase(notif);
  };

  const approveReview = (reviewId: string) => {
    let targetVendorId = '';
    let ratingStars = 5;
    let reviewerName = '';

    const nextReviews = reviews.map((r) => {
      if (r.id === reviewId) {
        targetVendorId = r.vendorId;
        ratingStars = r.rating;
        reviewerName = r.customerName;
        const updated = { ...r, status: 'approved' as const };
        saveReviewToSupabase(updated);
        return updated;
      }
      return r;
    });
    setReviews(nextReviews);

    if (targetVendorId) {
      const stats = computeVendorReviewStats(targetVendorId, nextReviews);
      setVendors((prev) =>
        prev.map((v) => {
          if (v.id === targetVendorId) {
            return { ...v, rating: stats.rating, reviewCount: stats.reviewCount };
          }
          return v;
        })
      );
      updateVendorInSupabase(targetVendorId, {
        rating: stats.rating,
        reviewCount: stats.reviewCount,
      });

      const targetVendor = vendors.find((v) => v.id === targetVendorId);
      const vendorName = targetVendor ? targetVendor.businessName : 'your store';

      // Notification for vendor
      const notif: NotificationItem = {
        id: `n-${Date.now()}`,
        userId: targetVendorId,
        title: 'New Storefront Review Approved',
        message: `A ${ratingStars}-star review from ${reviewerName} has been approved and is live on your storefront.`,
        type: 'review',
        isRead: false,
        createdAt: new Date().toISOString(),
      };
      setNotifications((prev) => [notif, ...prev]);
      saveNotificationToSupabase(notif);

      // Audit Log
      const log: AuditLog = {
        id: `log-${Date.now()}`,
        action: 'REVIEW_APPROVED',
        performedBy: 'Admin',
        role: 'admin',
        details: `Approved ${ratingStars}-star review by ${reviewerName} for vendor "${vendorName}"`,
        timestamp: new Date().toISOString(),
      };
      setAuditLogs((prev) => [log, ...prev]);
      saveAuditLogToSupabase(log);
    }
  };

  const rejectReview = (reviewId: string) => {
    let targetVendorId = '';
    let reviewerName = '';

    const nextReviews = reviews.map((r) => {
      if (r.id === reviewId) {
        targetVendorId = r.vendorId;
        reviewerName = r.customerName;
        const updated = { ...r, status: 'rejected' as const };
        saveReviewToSupabase(updated);
        return updated;
      }
      return r;
    });
    setReviews(nextReviews);

    if (targetVendorId) {
      const stats = computeVendorReviewStats(targetVendorId, nextReviews);
      setVendors((prev) =>
        prev.map((v) => {
          if (v.id === targetVendorId) {
            return { ...v, rating: stats.rating, reviewCount: stats.reviewCount };
          }
          return v;
        })
      );
      updateVendorInSupabase(targetVendorId, {
        rating: stats.rating,
        reviewCount: stats.reviewCount,
      });
    }

    const log: AuditLog = {
      id: `log-${Date.now()}`,
      action: 'REVIEW_REJECTED',
      performedBy: 'Admin',
      role: 'admin',
      details: `Rejected review by ${reviewerName} for vendor ID ${targetVendorId}`,
      timestamp: new Date().toISOString(),
    };
    setAuditLogs((prev) => [log, ...prev]);
    saveAuditLogToSupabase(log);
  };

  const deleteReview = (reviewId: string) => {
    const target = reviews.find((r) => r.id === reviewId);
    const vendorId = target?.vendorId;
    const nextReviews = reviews.filter((r) => r.id !== reviewId);
    setReviews(nextReviews);
    deleteReviewFromSupabase(reviewId);

    if (vendorId) {
      const stats = computeVendorReviewStats(vendorId, nextReviews);
      setVendors((prev) =>
        prev.map((v) => {
          if (v.id === vendorId) {
            return { ...v, rating: stats.rating, reviewCount: stats.reviewCount };
          }
          return v;
        })
      );
      updateVendorInSupabase(vendorId, {
        rating: stats.rating,
        reviewCount: stats.reviewCount,
      });
    }
  };

  const replyReview = (reviewId: string, replyText: string) => {
    setReviews((prev) =>
      prev.map((r) => {
        if (r.id === reviewId) {
          const updated = { ...r, vendorReply: replyText, vendorRepliedAt: new Date().toISOString() };
          saveReviewToSupabase(updated);
          return updated;
        }
        return r;
      })
    );
  };

  // Enquiry Actions
  const sendEnquiry = (enquiryData: Omit<Enquiry, 'id' | 'createdAt' | 'status'>) => {
    const newEnquiry: Enquiry = {
      ...enquiryData,
      id: `e-${Date.now()}`,
      status: 'new',
      createdAt: new Date().toISOString(),
    };
    setEnquiries((prev) => [newEnquiry, ...prev]);
    saveEnquiryToSupabase(newEnquiry);

    // Notify vendor
    const newNotif: NotificationItem = {
      id: `n-${Date.now()}`,
      userId: enquiryData.vendorId,
      targetRole: 'vendor',
      title: 'New Customer Enquiry Received',
      message: `${enquiryData.customerName} sent an enquiry regarding your products.`,
      type: 'enquiry',
      isRead: false,
      createdAt: new Date().toISOString(),
    };
    setNotifications((prev) => [newNotif, ...prev]);
    saveNotificationToSupabase(newNotif);
  };

  const replyEnquiry = (enquiryId: string, replyText: string) => {
    setEnquiries((prev) =>
      prev.map((e) => {
        if (e.id === enquiryId) {
          const updated = {
            ...e,
            status: 'replied' as const,
            replyText,
            repliedAt: new Date().toISOString(),
          };
          saveEnquiryToSupabase(updated);
          return updated;
        }
        return e;
      })
    );
  };

  // Manual Promotion Actions
  const submitPromotionRequest = (
    data: Omit<PromotionRequest, 'id' | 'status' | 'requestedAt'>
  ): PromotionRequest => {
    const newReq: PromotionRequest = {
      ...data,
      id: `pr-${Date.now()}`,
      status: 'pending',
      requestedAt: new Date().toISOString(),
    };
    setPromotionRequests((prev) => [newReq, ...prev]);
    savePromotionToSupabase(newReq);

    // Notify Admin
    const notif: NotificationItem = {
      id: `n-${Date.now()}`,
      userId: 'admin',
      targetRole: 'admin',
      title: 'New Manual Bank Transfer Payment Uploaded',
      message: `${data.vendorName} uploaded proof of payment (₦${data.amountNaira.toLocaleString()}) for ${data.promoTitle}.`,
      type: 'promotion',
      isRead: false,
      createdAt: new Date().toISOString(),
    };
    setNotifications((prev) => [notif, ...prev]);
    saveNotificationToSupabase(notif);

    return newReq;
  };

  const approvePromotionRequest = (
    requestId: string,
    adminNote?: string,
    slotConfig?: {
      assignedSlot?: 'homepage_banner' | 'featured_product' | 'sponsored_vendor' | 'category_top';
      startDate?: string;
      expiresAt?: string;
      assignedTargetId?: string;
      bannerImageUrl?: string;
      bannerHeading?: string;
      bannerSubtext?: string;
    }
  ) => {
    const now = new Date();
    setPromotionRequests((prev) =>
      prev.map((req) => {
        if (req.id === requestId) {
          const start = slotConfig?.startDate ? new Date(slotConfig.startDate) : now;
          const expires = slotConfig?.expiresAt
            ? new Date(slotConfig.expiresAt)
            : new Date(start.getTime() + req.durationWeeks * 7 * 24 * 60 * 60 * 1000);

          const defaultSlot =
            slotConfig?.assignedSlot ||
            (req.promoType === 'homepage_banner'
              ? 'homepage_banner'
              : req.promoType === 'featured_product'
              ? 'featured_product'
              : req.promoType === 'sponsored_vendor'
              ? 'sponsored_vendor'
              : req.promoType === 'category_top'
              ? 'category_top'
              : 'sponsored_vendor');

          const updated: PromotionRequest = {
            ...req,
            status: 'approved' as const,
            adminNote: adminNote || 'Verified FCMB Bank Transfer.',
            approvedAt: now.toISOString(),
            startDate: start.toISOString(),
            expiresAt: expires.toISOString(),
            assignedSlot: defaultSlot,
            assignedTargetId: slotConfig?.assignedTargetId || req.vendorId,
            bannerImageUrl: slotConfig?.bannerImageUrl,
            bannerHeading: slotConfig?.bannerHeading,
            bannerSubtext: slotConfig?.bannerSubtext,
          };
          savePromotionToSupabase(updated);
          return updated;
        }
        return req;
      })
    );

    const targetReq = promotionRequests.find((r) => r.id === requestId);
    if (targetReq) {
      if (
        slotConfig?.assignedSlot === 'sponsored_vendor' ||
        targetReq.promoType === 'sponsored_vendor' ||
        targetReq.promoType === 'category_top'
      ) {
        setVendors((prev) =>
          prev.map((v) => {
            if (v.id === targetReq.vendorId) {
              updateVendorInSupabase(v.id, { isFeatured: true });
              return { ...v, isFeatured: true };
            }
            return v;
          })
        );
      } else if ((targetReq.promoType as string) === 'premium_subscription') {
        setVendors((prev) =>
          prev.map((v) => {
            if (v.id === targetReq.vendorId) {
              updateVendorInSupabase(v.id, { isPremium: true, isVerified: true });
              return { ...v, isPremium: true, isVerified: true };
            }
            return v;
          })
        );
      }
    }

    const log: AuditLog = {
      id: `log-${Date.now()}`,
      action: 'PROMOTION_APPROVED',
      performedBy: 'Admin',
      role: 'admin',
      details: `Approved promotion ID ${requestId} (Slot: ${slotConfig?.assignedSlot || 'default'})`,
      timestamp: new Date().toISOString(),
    };
    setAuditLogs((prev) => [log, ...prev]);
    saveAuditLogToSupabase(log);
  };

  const createDirectPromotionAssignment = (assignmentData: {
    vendorId: string;
    vendorName: string;
    assignedSlot: PromotionSlot;
    assignedTargetId?: string;
    startDate: string;
    durationWeeks: number;
    amountNaira?: number;
    bannerHeading?: string;
    bannerSubtext?: string;
    bannerImageUrl?: string;
    adminNote?: string;
  }) => {
    const start = new Date(assignmentData.startDate);
    const expires = new Date(start.getTime() + assignmentData.durationWeeks * 7 * 24 * 60 * 60 * 1000);
    const nowStr = new Date().toISOString();

    const newReq: PromotionRequest = {
      id: `pr-${Date.now()}`,
      vendorId: assignmentData.vendorId,
      vendorName: assignmentData.vendorName,
      promoType: assignmentData.assignedSlot as PromoType,
      promoTitle: `Admin Placement: ${assignmentData.assignedSlot.replace(/_/g, ' ').toUpperCase()}`,
      amountNaira: assignmentData.amountNaira || 0,
      durationWeeks: assignmentData.durationWeeks,
      bankName: MANUAL_PAYMENT_INFO.bankName,
      accountName: MANUAL_PAYMENT_INFO.accountName,
      accountNumber: MANUAL_PAYMENT_INFO.accountNumber,
      proofUrl: '',
      proofFileName: 'Direct Admin Assignment',
      txnRef: `ADMIN-ASSIGN-${Date.now().toString().slice(-6)}`,
      status: 'approved',
      adminNote: assignmentData.adminNote || 'Assigned directly by Admin.',
      requestedAt: nowStr,
      approvedAt: nowStr,
      startDate: start.toISOString(),
      expiresAt: expires.toISOString(),
      assignedSlot: assignmentData.assignedSlot,
      assignedTargetId: assignmentData.assignedTargetId || assignmentData.vendorId,
      bannerHeading: assignmentData.bannerHeading,
      bannerSubtext: assignmentData.bannerSubtext,
      bannerImageUrl: assignmentData.bannerImageUrl,
    };

    setPromotionRequests((prev) => [newReq, ...prev]);
    savePromotionToSupabase(newReq);

    const log: AuditLog = {
      id: `log-${Date.now()}`,
      action: 'ADMIN_PROMOTION_ASSIGNMENT_CREATED',
      performedBy: 'Admin',
      role: 'admin',
      details: `Assigned slot "${assignmentData.assignedSlot}" to vendor/product "${assignmentData.vendorName}" until ${expires.toLocaleDateString()}`,
      timestamp: nowStr,
    };
    setAuditLogs((prev) => [log, ...prev]);
    saveAuditLogToSupabase(log);
  };

  const rejectPromotionRequest = (requestId: string, adminNote?: string) => {
    setPromotionRequests((prev) =>
      prev.map((req) => {
        if (req.id === requestId) {
          const updated = {
            ...req,
            status: 'rejected' as const,
            adminNote: adminNote || 'Payment verification failed.',
          };
          savePromotionToSupabase(updated);
          return updated;
        }
        return req;
      })
    );
  };

  const removeActivePromotion = (requestId: string) => {
    setPromotionRequests((prev) =>
      prev.map((req) => {
        if (req.id === requestId) {
          const updated = {
            ...req,
            status: 'rejected' as const,
            adminNote: 'Promotion removed by Administrator before expiration.',
            expiresAt: new Date().toISOString(),
          };
          savePromotionToSupabase(updated);
          return updated;
        }
        return req;
      })
    );

    const log: AuditLog = {
      id: `log-${Date.now()}`,
      action: 'PROMOTION_REMOVED',
      performedBy: 'Admin',
      role: 'admin',
      details: `Admin removed active promotion ID: ${requestId}`,
      timestamp: new Date().toISOString(),
    };
    setAuditLogs((prev) => [log, ...prev]);
    saveAuditLogToSupabase(log);
  };

  // ==========================================
  // PAID VENDOR VERIFICATION ACTIONS (₦3,000)
  // ==========================================

  const submitVerificationRequest = (
    data: Omit<VerificationRequest, 'id' | 'status' | 'requestedAt'>
  ): VerificationRequest => {
    const newReq: VerificationRequest = {
      ...data,
      id: `vr-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      amountNaira: 3000,
      bankName: data.bankName || MANUAL_PAYMENT_INFO.bankName,
      accountName: data.accountName || MANUAL_PAYMENT_INFO.accountName,
      accountNumber: data.accountNumber || MANUAL_PAYMENT_INFO.accountNumber,
      status: 'pending',
      requestedAt: new Date().toISOString(),
    };

    setVerificationRequests((prev) => [newReq, ...prev]);
    saveVerificationRequestToSupabase(newReq);

    // Notify Admin
    const notif: NotificationItem = {
      id: `n-${Date.now()}`,
      userId: 'admin',
      targetRole: 'admin',
      title: 'New ₦3,000 Vendor Verification Request',
      message: `${data.vendorName} submitted ₦3,000 payment proof (Ref: ${data.txnRef}) for store verification.`,
      type: 'vendor_approval',
      isRead: false,
      createdAt: new Date().toISOString(),
    };
    setNotifications((prev) => [notif, ...prev]);
    saveNotificationToSupabase(notif);

    // Audit Log
    const log: AuditLog = {
      id: `log-${Date.now()}`,
      action: 'VERIFICATION_REQUEST_SUBMITTED',
      performedBy: data.vendorName,
      role: 'vendor',
      details: `Submitted ₦3,000 verification request (Ref: ${data.txnRef}, File: ${data.proofFileName})`,
      timestamp: new Date().toISOString(),
    };
    setAuditLogs((prev) => [log, ...prev]);
    saveAuditLogToSupabase(log);

    return newReq;
  };

  const approveVerificationRequest = (requestId: string, adminNote?: string) => {
    const targetReq = verificationRequests.find((r) => r.id === requestId);
    if (!targetReq) return;

    const nowStr = new Date().toISOString();

    // 1. Check if vendor is unverified; if unverified, invoke existing toggleVerifyVendor
    const targetVendor = vendors.find((v) => v.id === targetReq.vendorId);
    if (targetVendor && !targetVendor.isVerified) {
      toggleVerifyVendor(targetVendor.id);
    }

    // 2. Update the verification request status to 'approved'
    const updatedReq: VerificationRequest = {
      ...targetReq,
      status: 'approved',
      adminNote: adminNote || '₦3,000 FCMB bank transfer verified by Administrator.',
      reviewedAt: nowStr,
    };

    setVerificationRequests((prev) =>
      prev.map((r) => (r.id === requestId ? updatedReq : r))
    );
    saveVerificationRequestToSupabase(updatedReq);

    // 3. Notify the Vendor
    const notif: NotificationItem = {
      id: `n-${Date.now()}`,
      userId: targetReq.vendorId,
      targetRole: 'vendor',
      title: 'Storefront Verification Approved! 🎉',
      message: `Congratulations! Your ₦3,000 verification payment was approved. The official Verified Business badge is now active on your storefront and listings.`,
      type: 'vendor_approval',
      isRead: false,
      createdAt: nowStr,
    };
    setNotifications((prev) => [notif, ...prev]);
    saveNotificationToSupabase(notif);

    // 4. Audit Log
    const log: AuditLog = {
      id: `log-${Date.now()}`,
      action: 'VERIFICATION_REQUEST_APPROVED',
      performedBy: 'Admin',
      role: 'admin',
      details: `Approved ₦3,000 verification request for "${targetReq.vendorName}" (Vendor ID: ${targetReq.vendorId}, Ref: ${targetReq.txnRef})`,
      timestamp: nowStr,
    };
    setAuditLogs((prev) => [log, ...prev]);
    saveAuditLogToSupabase(log);
  };

  const rejectVerificationRequest = (requestId: string, adminNote?: string) => {
    const targetReq = verificationRequests.find((r) => r.id === requestId);
    if (!targetReq) return;

    const nowStr = new Date().toISOString();

    // NOTE: vendors.is_verified is NOT altered upon rejection.
    const updatedReq: VerificationRequest = {
      ...targetReq,
      status: 'rejected',
      adminNote: adminNote || 'Payment verification could not be confirmed. Please check transaction details and re-submit.',
      reviewedAt: nowStr,
    };

    setVerificationRequests((prev) =>
      prev.map((r) => (r.id === requestId ? updatedReq : r))
    );
    saveVerificationRequestToSupabase(updatedReq);

    // Notify the Vendor
    const notif: NotificationItem = {
      id: `n-${Date.now()}`,
      userId: targetReq.vendorId,
      targetRole: 'vendor',
      title: 'Verification Request Update',
      message: `Your verification payment could not be verified: ${updatedReq.adminNote}. You may submit a new receipt in your Vendor Dashboard.`,
      type: 'vendor_approval',
      isRead: false,
      createdAt: nowStr,
    };
    setNotifications((prev) => [notif, ...prev]);
    saveNotificationToSupabase(notif);

    // Audit Log
    const log: AuditLog = {
      id: `log-${Date.now()}`,
      action: 'VERIFICATION_REQUEST_REJECTED',
      performedBy: 'Admin',
      role: 'admin',
      details: `Rejected verification request for "${targetReq.vendorName}" (Reason: ${updatedReq.adminNote})`,
      timestamp: nowStr,
    };
    setAuditLogs((prev) => [log, ...prev]);
    saveAuditLogToSupabase(log);
  };


  // Engagement tracking
  const trackVendorWhatsAppClick = (vendorId: string) => {
    setVendors((prev) =>
      prev.map((v) => {
        if (v.id === vendorId) {
          const clicks = v.whatsappClicks + 1;
          updateVendorInSupabase(vendorId, { whatsappClicks: clicks });
          return { ...v, whatsappClicks: clicks };
        }
        return v;
      })
    );
  };

  const trackVendorPhoneClick = (vendorId: string) => {
    setVendors((prev) =>
      prev.map((v) => {
        if (v.id === vendorId) {
          const clicks = v.phoneClicks + 1;
          updateVendorInSupabase(vendorId, { phoneClicks: clicks });
          return { ...v, phoneClicks: clicks };
        }
        return v;
      })
    );
  };

  // Wishlist & Follow
  const toggleWishlist = (productId: string) => {
    setWishlist((prev) =>
      prev.includes(productId) ? prev.filter((id) => id !== productId) : [...prev, productId]
    );
  };

  const toggleFollowVendor = (vendorId: string) => {
    setFollowingVendors((prev) =>
      prev.includes(vendorId) ? prev.filter((id) => id !== vendorId) : [...prev, vendorId]
    );
  };

  const markNotificationRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => {
        if (n.id === id) {
          saveNotificationToSupabase({ ...n, isRead: true });
          return { ...n, isRead: true };
        }
        return n;
      })
    );
  };

  // Supabase Auth Methods
  const signInWithSupabase = async (email: string, pass: string) => {
    const data = await supabaseSignIn(email, pass);
    setIsAuthModalOpen(false);
    if (data?.user) {
      const userObj = await syncSessionUser(data.session || { user: data.user });
      const role = userObj?.role || 'customer';
      if (role === 'vendor') {
        setActiveTab('vendor-portal');
      } else if (role === 'admin') {
        setActiveTab('admin-portal');
      } else {
        setActiveTab('customer-portal');
      }
    }
    return data;
  };

  const signUpWithSupabase = async (
    email: string,
    pass: string,
    data: Partial<User>,
    autoNavigate = true
  ) => {
    const res = await supabaseSignUp(email, pass, data);
    setIsAuthModalOpen(false);
    const authUser = res?.user || res?.session?.user;
    if (authUser) {
      const userObj = await syncSessionUser(res.session || { user: authUser });
      const role = userObj?.role || data.role || 'customer';
      if (autoNavigate) {
        if (role === 'vendor') {
          setActiveTab('vendor-portal');
        } else if (role === 'admin') {
          setActiveTab('admin-portal');
        } else {
          setActiveTab('customer-portal');
        }
      }
    }
    return res;
  };

  const signOutSupabase = async () => {
    try {
      await supabaseSignOut();
    } catch (err) {
      console.error('Error signing out of Supabase:', err);
    }
    // Immediately clear every authentication-related state
    setCurrentUser(null);
    setRoleState('guest');
    setSelectedVendorId(null);
    setSelectedProductId(null);
    setIsAuthModalOpen(false);

    // Remove any related localStorage/sessionStorage values
    localStorage.removeItem(`${LOCAL_STORAGE_KEY}_user`);
    localStorage.removeItem(`${LOCAL_STORAGE_KEY}_profile`);
    localStorage.removeItem(`${LOCAL_STORAGE_KEY}_vendor`);
    localStorage.removeItem(`${LOCAL_STORAGE_KEY}_role`);
    sessionStorage.clear();

    // Redirect to home and replace history URL
    setActiveTabState('home');
    if (window.location.pathname !== '/') {
      window.history.replaceState({}, '', '/');
    }
  };

  return (
    <AppContext.Provider
      value={{
        isSupabaseConnected,
        refreshData,
        refreshCriticalData,
        currentRole,
        setRole,
        currentUser,
        setCurrentUser,
        activeTab,
        setActiveTab,
        isLoadingData,
        isCriticalDataLoading,
        isSecondaryDataLoading,
        criticalDataError,
        vendors,
        products,
        categories: CATEGORIES,
        reviews,
        enquiries,
        promotionRequests,
        verificationRequests,
        notifications,
        auditLogs,
        wishlist,
        followingVendors,
        searchQuery,
        setSearchQuery,
        selectedCategory,
        setSelectedCategory,
        selectedArea,
        setSelectedArea,
        isNearMeActive,
        setIsNearMeActive,
        userLocation,
        locationStatus,
        locationError,
        nearMeRadiusKm,
        setNearMeRadiusKm,
        requestNearMe,
        disableNearMe,
        addVendorRegistration,
        updateVendorProfile,
        registerCustomer,
        approveVendor,
        rejectVendor,
        suspendVendor,
        reactivateVendor,
        deleteVendorPermanently,
        toggleVerifyVendor,
        toggleFeatureVendor,
        toggleVendorFeature,
        updateVendorFeatures,
        addProduct,
        updateProduct,
        deleteProduct,
        approveProduct,
        trackWhatsAppClick,
        addReview,
        approveReview,
        rejectReview,
        deleteReview,
        replyReview,
        sendEnquiry,
        replyEnquiry,
        submitPromotionRequest,
        approvePromotionRequest,
        createDirectPromotionAssignment,
        rejectPromotionRequest,
        removeActivePromotion,
        submitVerificationRequest,
        approveVerificationRequest,
        rejectVerificationRequest,
        toggleWishlist,
        toggleFollowVendor,
        markNotificationRead,
        selectedVendorId,
        setSelectedVendorId,
        selectedVendorSlug,
        setSelectedVendorSlug,
        navigateToVendor,
        selectedProductId,
        setSelectedProductId,
        trackVendorWhatsAppClick,
        trackVendorPhoneClick,
        isAuthModalOpen,
        openAuthModal,
        closeAuthModal,
        signInWithSupabase,
        signUpWithSupabase,
        signOutSupabase,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within an AppProvider');
  return context;
};
