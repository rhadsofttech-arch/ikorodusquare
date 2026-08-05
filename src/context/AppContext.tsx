import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  UserRole,
  User,
  Vendor,
  Product,
  Category,
  Review,
  Enquiry,
  PromotionRequest,
  NotificationItem,
  AuditLog,
  IkoroduArea,
  PromoType,
} from '../types';
import {
  INITIAL_VENDORS,
  INITIAL_PRODUCTS,
  INITIAL_REVIEWS,
  INITIAL_ENQUIRIES,
  INITIAL_PROMOTION_REQUESTS,
  INITIAL_NOTIFICATIONS,
  INITIAL_AUDIT_LOGS,
  CATEGORIES,
} from '../data/mockData';

interface AppContextType {
  // Role & Auth
  currentRole: UserRole;
  setRole: (role: UserRole) => void;
  currentUser: User | null;
  setCurrentUser: (user: User | null) => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  
  // Data State
  vendors: Vendor[];
  products: Product[];
  categories: Category[];
  reviews: Review[];
  enquiries: Enquiry[];
  promotionRequests: PromotionRequest[];
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

  // Actions
  addVendorRegistration: (vendorData: Partial<Vendor>) => Vendor;
  registerCustomer: (customerData: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    area: IkoroduArea;
  }) => User;
  approveVendor: (vendorId: string) => void;
  rejectVendor: (vendorId: string, reason?: string) => void;
  suspendVendor: (vendorId: string) => void;
  toggleVerifyVendor: (vendorId: string) => void;
  toggleFeatureVendor: (vendorId: string) => void;

  addProduct: (productData: Partial<Product>) => Product;
  updateProduct: (productId: string, productData: Partial<Product>) => void;
  deleteProduct: (productId: string) => void;
  approveProduct: (productId: string) => void;

  addReview: (reviewData: Omit<Review, 'id' | 'createdAt'>) => void;
  replyReview: (reviewId: string, replyText: string) => void;

  sendEnquiry: (enquiryData: Omit<Enquiry, 'id' | 'createdAt' | 'status'>) => void;
  replyEnquiry: (enquiryId: string, replyText: string) => void;

  submitPromotionRequest: (data: Omit<PromotionRequest, 'id' | 'status' | 'requestedAt'>) => PromotionRequest;
  approvePromotionRequest: (requestId: string, adminNote?: string) => void;
  rejectPromotionRequest: (requestId: string, adminNote?: string) => void;

  toggleWishlist: (productId: string) => void;
  toggleFollowVendor: (vendorId: string) => void;
  
  markNotificationRead: (id: string) => void;
  
  // Selected detail view helper state
  selectedVendorId: string | null;
  setSelectedVendorId: (id: string | null) => void;
  selectedProductId: string | null;
  setSelectedProductId: (id: string | null) => void;

  // Track engagement clicks
  trackVendorWhatsAppClick: (vendorId: string) => void;
  trackVendorPhoneClick: (vendorId: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const LOCAL_STORAGE_KEY = 'ikorodu_square_state_v1';

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Default user is Guest or Customer
  const [currentRole, setRoleState] = useState<UserRole>('guest');
  const [activeTab, setActiveTab] = useState<string>('home');
  const [selectedVendorId, setSelectedVendorId] = useState<string | null>(null);
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);

  const [currentUser, setCurrentUser] = useState<User | null>({
    id: 'c-101',
    email: 'bisi.ogundimu@gmail.com',
    firstName: 'Bisi',
    lastName: 'Ogundimu',
    phone: '+234 803 999 1111',
    role: 'customer',
    area: 'Agric',
    isVerified: true,
    createdAt: new Date().toISOString(),
  });

  // State
  const [vendors, setVendors] = useState<Vendor[]>(() => {
    const saved = localStorage.getItem(`${LOCAL_STORAGE_KEY}_vendors`);
    return saved ? JSON.parse(saved) : INITIAL_VENDORS;
  });

  const [products, setProducts] = useState<Product[]>(() => {
    const saved = localStorage.getItem(`${LOCAL_STORAGE_KEY}_products`);
    return saved ? JSON.parse(saved) : INITIAL_PRODUCTS;
  });

  const [reviews, setReviews] = useState<Review[]>(() => {
    const saved = localStorage.getItem(`${LOCAL_STORAGE_KEY}_reviews`);
    return saved ? JSON.parse(saved) : INITIAL_REVIEWS;
  });

  const [enquiries, setEnquiries] = useState<Enquiry[]>(() => {
    const saved = localStorage.getItem(`${LOCAL_STORAGE_KEY}_enquiries`);
    return saved ? JSON.parse(saved) : INITIAL_ENQUIRIES;
  });

  const [promotionRequests, setPromotionRequests] = useState<PromotionRequest[]>(() => {
    const saved = localStorage.getItem(`${LOCAL_STORAGE_KEY}_promotions`);
    return saved ? JSON.parse(saved) : INITIAL_PROMOTION_REQUESTS;
  });

  const [notifications, setNotifications] = useState<NotificationItem[]>(() => {
    const saved = localStorage.getItem(`${LOCAL_STORAGE_KEY}_notifications`);
    return saved ? JSON.parse(saved) : INITIAL_NOTIFICATIONS;
  });

  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(INITIAL_AUDIT_LOGS);
  const [wishlist, setWishlist] = useState<string[]>(['p-1', 'p-4']);
  const [followingVendors, setFollowingVendors] = useState<string[]>(['v-1', 'v-3']);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedArea, setSelectedArea] = useState<IkoroduArea | 'All'>('All');

  // Persistence Effects
  useEffect(() => {
    localStorage.setItem(`${LOCAL_STORAGE_KEY}_vendors`, JSON.stringify(vendors));
  }, [vendors]);

  useEffect(() => {
    localStorage.setItem(`${LOCAL_STORAGE_KEY}_products`, JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    localStorage.setItem(`${LOCAL_STORAGE_KEY}_reviews`, JSON.stringify(reviews));
  }, [reviews]);

  useEffect(() => {
    localStorage.setItem(`${LOCAL_STORAGE_KEY}_enquiries`, JSON.stringify(enquiries));
  }, [enquiries]);

  useEffect(() => {
    localStorage.setItem(`${LOCAL_STORAGE_KEY}_promotions`, JSON.stringify(promotionRequests));
  }, [promotionRequests]);

  useEffect(() => {
    localStorage.setItem(`${LOCAL_STORAGE_KEY}_notifications`, JSON.stringify(notifications));
  }, [notifications]);

  // Set Role handler
  const setRole = (role: UserRole) => {
    setRoleState(role);
    if (role === 'admin') {
      setCurrentUser({
        id: 'admin-01',
        email: 'admin@ikorodusquare.ng',
        firstName: 'System',
        lastName: 'Admin',
        phone: '+234 800 000 0000',
        role: 'admin',
        area: 'Sabo',
        isVerified: true,
        createdAt: new Date().toISOString(),
      });
    } else if (role === 'vendor') {
      setCurrentUser({
        id: 'v-3-user',
        email: 'emeka@sparklegadgets.ng',
        firstName: 'Emeka',
        lastName: 'Nwosu',
        phone: '+234 701 889 9000',
        role: 'vendor',
        area: 'Sabo',
        isVerified: true,
        createdAt: new Date().toISOString(),
      });
    } else if (role === 'customer') {
      setCurrentUser({
        id: 'c-101',
        email: 'bisi.ogundimu@gmail.com',
        firstName: 'Bisi',
        lastName: 'Ogundimu',
        phone: '+234 803 999 1111',
        role: 'customer',
        area: 'Agric',
        isVerified: true,
        createdAt: new Date().toISOString(),
      });
    } else {
      setCurrentUser(null);
    }
  };

  // Vendor actions
  const addVendorRegistration = (vendorData: Partial<Vendor>): Vendor => {
    const newVendor: Vendor = {
      id: `v-${Date.now()}`,
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

    setVendors((prev) => [newVendor, ...prev]);

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

    // Audit log
    setAuditLogs((prev) => [
      {
        id: `log-${Date.now()}`,
        action: 'VENDOR_REGISTERED',
        performedBy: newVendor.ownerName,
        role: 'vendor',
        details: `Registered ${newVendor.businessName} in ${newVendor.area}`,
        timestamp: new Date().toISOString(),
      },
      ...prev,
    ]);

    return newVendor;
  };

  const registerCustomer = (customerData: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    area: IkoroduArea;
  }): User => {
    const newUser: User = {
      id: `usr-${Date.now()}`,
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
    setNotifications((prev) => [
      {
        id: `notif-${Date.now()}`,
        userId: newUser.id,
        targetRole: 'customer',
        title: 'Welcome to IkoroduSquare!',
        message: `Hi ${customerData.firstName}, your customer account is active. Discover local businesses and shop products.`,
        type: 'system',
        isRead: false,
        createdAt: new Date().toISOString(),
      },
      ...prev,
    ]);

    // Audit log
    setAuditLogs((prev) => [
      {
        id: `log-${Date.now()}`,
        action: 'CUSTOMER_REGISTERED',
        performedBy: `${customerData.firstName} ${customerData.lastName}`,
        role: 'customer',
        details: `Registered customer account (${customerData.email}) in ${customerData.area}`,
        timestamp: new Date().toISOString(),
      },
      ...prev,
    ]);

    return newUser;
  };

  const approveVendor = (vendorId: string) => {
    setVendors((prev) =>
      prev.map((v) => (v.id === vendorId ? { ...v, status: 'approved', isVerified: true } : v))
    );
    // Add audit
    setAuditLogs((prev) => [
      {
        id: `log-${Date.now()}`,
        action: 'VENDOR_APPROVED',
        performedBy: 'Admin',
        role: 'admin',
        details: `Approved vendor ID: ${vendorId}`,
        timestamp: new Date().toISOString(),
      },
      ...prev,
    ]);
  };

  const rejectVendor = (vendorId: string, reason?: string) => {
    setVendors((prev) =>
      prev.map((v) => (v.id === vendorId ? { ...v, status: 'rejected' } : v))
    );
    setAuditLogs((prev) => [
      {
        id: `log-${Date.now()}`,
        action: 'VENDOR_REJECTED',
        performedBy: 'Admin',
        role: 'admin',
        details: `Rejected vendor ID: ${vendorId}. Reason: ${reason || 'N/A'}`,
        timestamp: new Date().toISOString(),
      },
      ...prev,
    ]);
  };

  const suspendVendor = (vendorId: string) => {
    setVendors((prev) =>
      prev.map((v) => (v.id === vendorId ? { ...v, status: 'suspended' } : v))
    );
  };

  const toggleVerifyVendor = (vendorId: string) => {
    setVendors((prev) =>
      prev.map((v) => (v.id === vendorId ? { ...v, isVerified: !v.isVerified } : v))
    );
  };

  const toggleFeatureVendor = (vendorId: string) => {
    setVendors((prev) =>
      prev.map((v) => (v.id === vendorId ? { ...v, isFeatured: !v.isFeatured } : v))
    );
  };

  // Product Actions
  const addProduct = (productData: Partial<Product>): Product => {
    const newProduct: Product = {
      id: `p-${Date.now()}`,
      vendorId: productData.vendorId || 'v-3',
      vendorName: productData.vendorName || 'Sparkle Electronics & Gadgets Sabo',
      vendorArea: productData.vendorArea || 'Sabo',
      type: productData.type || 'product',
      name: productData.name || 'New Item',
      slug: (productData.name || 'new-item').toLowerCase().replace(/\s+/g, '-'),
      description: productData.description || '',
      price: productData.price || 0,
      salePrice: productData.salePrice,
      sku: productData.sku || `SKU-${Date.now().toString().slice(-6)}`,
      stock: productData.stock || 10,
      category: productData.category || 'General',
      subcategory: productData.subcategory || 'General',
      brand: productData.brand,
      tags: productData.tags || [],
      condition: productData.condition || 'New',
      availability: 'In Stock',
      deliveryOptions: productData.deliveryOptions || ['Rider Delivery', 'Store Pick-up'],
      images: productData.images || ['https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?auto=format&fit=crop&q=80&w=800'],
      isFeatured: false,
      status: 'approved', // Auto-approved for verified vendor
      viewsCount: 0,
      createdAt: new Date().toISOString(),
    };

    setProducts((prev) => [newProduct, ...prev]);
    return newProduct;
  };

  const updateProduct = (productId: string, productData: Partial<Product>) => {
    setProducts((prev) =>
      prev.map((p) => (p.id === productId ? { ...p, ...productData } : p))
    );
  };

  const deleteProduct = (productId: string) => {
    setProducts((prev) => prev.filter((p) => p.id !== productId));
  };

  const approveProduct = (productId: string) => {
    setProducts((prev) =>
      prev.map((p) => (p.id === productId ? { ...p, status: 'approved' } : p))
    );
  };

  // Review Actions
  const addReview = (reviewData: Omit<Review, 'id' | 'createdAt'>) => {
    const newReview: Review = {
      ...reviewData,
      id: `r-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    setReviews((prev) => [newReview, ...prev]);

    // Recalculate vendor rating
    const vendorReviews = [...reviews.filter((r) => r.vendorId === reviewData.vendorId), newReview];
    const totalRating = vendorReviews.reduce((sum, r) => sum + r.rating, 0);
    const avgRating = Number((totalRating / vendorReviews.length).toFixed(1));

    setVendors((prev) =>
      prev.map((v) =>
        v.id === reviewData.vendorId
          ? { ...v, rating: avgRating, reviewCount: vendorReviews.length }
          : v
      )
    );
  };

  const replyReview = (reviewId: string, replyText: string) => {
    setReviews((prev) =>
      prev.map((r) =>
        r.id === reviewId
          ? { ...r, vendorReply: replyText, vendorRepliedAt: new Date().toISOString() }
          : r
      )
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
  };

  const replyEnquiry = (enquiryId: string, replyText: string) => {
    setEnquiries((prev) =>
      prev.map((e) =>
        e.id === enquiryId
          ? { ...e, status: 'replied', replyText, repliedAt: new Date().toISOString() }
          : e
      )
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

    return newReq;
  };

  const approvePromotionRequest = (requestId: string, adminNote?: string) => {
    const now = new Date();
    setPromotionRequests((prev) =>
      prev.map((req) => {
        if (req.id === requestId) {
          const expires = new Date();
          expires.setDate(now.getDate() + req.durationWeeks * 7);
          return {
            ...req,
            status: 'approved',
            adminNote: adminNote || 'Verified FCMB Bank Transfer.',
            approvedAt: now.toISOString(),
            expiresAt: expires.toISOString(),
          };
        }
        return req;
      })
    );

    // Update vendor feature state depending on promo type
    const targetReq = promotionRequests.find((r) => r.id === requestId);
    if (targetReq) {
      if (targetReq.promoType === 'sponsored_vendor' || targetReq.promoType === 'category_top') {
        setVendors((prev) =>
          prev.map((v) => (v.id === targetReq.vendorId ? { ...v, isFeatured: true } : v))
        );
      } else if (targetReq.promoType === 'premium_subscription') {
        setVendors((prev) =>
          prev.map((v) => (v.id === targetReq.vendorId ? { ...v, isPremium: true, isVerified: true } : v))
        );
      }
    }

    setAuditLogs((prev) => [
      {
        id: `log-${Date.now()}`,
        action: 'PROMOTION_APPROVED',
        performedBy: 'Admin',
        role: 'admin',
        details: `Approved promotion ID ${requestId}`,
        timestamp: new Date().toISOString(),
      },
      ...prev,
    ]);
  };

  const rejectPromotionRequest = (requestId: string, adminNote?: string) => {
    setPromotionRequests((prev) =>
      prev.map((req) =>
        req.id === requestId
          ? { ...req, status: 'rejected', adminNote: adminNote || 'Payment verification failed.' }
          : req
      )
    );
  };

  // Engagement tracking
  const trackVendorWhatsAppClick = (vendorId: string) => {
    setVendors((prev) =>
      prev.map((v) => (v.id === vendorId ? { ...v, whatsappClicks: v.whatsappClicks + 1 } : v))
    );
  };

  const trackVendorPhoneClick = (vendorId: string) => {
    setVendors((prev) =>
      prev.map((v) => (v.id === vendorId ? { ...v, phoneClicks: v.phoneClicks + 1 } : v))
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
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
    );
  };

  return (
    <AppContext.Provider
      value={{
        currentRole,
        setRole,
        currentUser,
        setCurrentUser,
        activeTab,
        setActiveTab,
        vendors,
        products,
        categories: CATEGORIES,
        reviews,
        enquiries,
        promotionRequests,
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
        addVendorRegistration,
        registerCustomer,
        approveVendor,
        rejectVendor,
        suspendVendor,
        toggleVerifyVendor,
        toggleFeatureVendor,
        addProduct,
        updateProduct,
        deleteProduct,
        approveProduct,
        addReview,
        replyReview,
        sendEnquiry,
        replyEnquiry,
        submitPromotionRequest,
        approvePromotionRequest,
        rejectPromotionRequest,
        toggleWishlist,
        toggleFollowVendor,
        markNotificationRead,
        selectedVendorId,
        setSelectedVendorId,
        selectedProductId,
        setSelectedProductId,
        trackVendorWhatsAppClick,
        trackVendorPhoneClick,
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
