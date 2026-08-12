export type UserRole = 'guest' | 'customer' | 'vendor' | 'admin';

export type IkoroduArea = 
  | 'Sabo'
  | 'Garage'
  | 'Agric'
  | 'Ebute'
  | 'Ayetoro'
  | 'Igbogbo'
  | 'Imota'
  | 'Ijede'
  | 'Ipakodo'
  | 'Offin'
  | 'Ota-Ona'
  | 'Ita-Elewa'
  | 'Aga'
  | 'Isawo'
  | 'Odogunyan'
  | 'Maya'
  | 'Adamo'
  | 'Gberigbe'
  | 'Maya-Itaoluwo'
  | 'Ibeshe'
  | 'Agura'
  | 'Egbin'
  | 'Oreta'
  | 'Bayeku'
  | 'Owutu'
  | 'Ogijo'
  | 'Ladega'
  | 'Benson'
  | 'Solebo'
  | 'Isiu'
  | 'Agbowa'
  | 'Itoikin'
  | 'Itamaga'
  | 'Parafa'
  | 'Grammar School'
  | 'Gbaga'
  | 'Mowokekere'
  | 'Radio'
  | 'Araromi'
  | 'Eyita';

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  role: UserRole;
  area: IkoroduArea;
  avatarUrl?: string;
  isVerified: boolean;
  createdAt: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  iconName: string;
  description: string;
  subcategories: string[];
  vendorCount?: number;
}

export interface BusinessHours {
  day: 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday' | 'Sunday';
  openTime: string; // e.g. "08:00"
  closeTime: string; // e.g. "18:00"
  isClosed: boolean;
}

export type VendorFeature =
  | 'Verified Business'
  | 'Trusted Vendor'
  | 'Premium Vendor'
  | 'Featured Vendor'
  | 'Official Service Provider'
  | 'Fast Response';

export interface Vendor {
  id: string;
  userId?: string;
  businessName: string;
  slug: string;
  category: string;
  subcategory: string;
  description: string;
  address: string;
  area: IkoroduArea;
  lga: string;
  state: string;
  country: string;
  phone: string;
  whatsapp: string;
  website?: string;
  instagram?: string;
  facebook?: string;
  tiktok?: string;
  yearsInBusiness: number;
  logoUrl: string;
  coverImageUrl: string;
  galleryUrls: string[];
  cacCertificateUrl?: string;
  ninDocUrl?: string;
  ninDocumentUrl?: string;
  ownerName: string;
  ownerEmail: string;
  ownerPhone: string;
  status: 'pending' | 'approved' | 'rejected' | 'suspended';
  isVerified: boolean;
  isFeatured: boolean;
  isSponsored?: boolean;
  homepageBanner?: boolean;
  categoryTopSpot?: boolean;
  isPremium: boolean;
  features?: VendorFeature[];
  rating: number;
  reviewCount: number;
  businessHours: BusinessHours[];
  deliveryAreas: string[];
  viewsCount: number;
  whatsappClicks: number;
  phoneClicks: number;
  createdAt: string;
}

export interface Product {
  id: string;
  vendorId: string;
  vendorName: string;
  vendorArea: IkoroduArea;
  type: 'product' | 'service';
  name: string;
  slug: string;
  description: string;
  price: number;
  salePrice?: number;
  sku: string;
  stock: number;
  category: string;
  subcategory: string;
  brand?: string;
  tags: string[];
  condition: 'New' | 'Used - Like New' | 'Refurbished' | 'N/A';
  availability: 'In Stock' | 'Out of Stock' | 'On Order';
  deliveryOptions: string[];
  images: string[];
  isFeatured: boolean;
  status: 'pending' | 'approved' | 'rejected';
  viewsCount: number;
  rating?: number;
  reviewCount?: number;
  createdAt: string;
}

export interface Review {
  id: string;
  vendorId: string;
  customerId: string;
  customerName: string;
  customerAvatar?: string;
  rating: number;
  comment: string;
  status?: 'pending' | 'approved' | 'rejected';
  vendorReply?: string;
  vendorRepliedAt?: string;
  createdAt: string;
}

export interface Enquiry {
  id: string;
  vendorId: string;
  vendorName: string;
  customerId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  message: string;
  status: 'new' | 'replied';
  replyText?: string;
  repliedAt?: string;
  createdAt: string;
}

export type PromoType = 
  | 'featured_product'
  | 'sponsored_vendor'
  | 'category_top'
  | 'homepage_banner'
  | 'store_setup';

export interface PromotionOption {
  id: PromoType;
  title: string;
  priceNaira: number;
  durationLabel: string;
  durationWeeks: number;
  description: string;
  features: string[];
}

export type PromotionSlot = 'homepage_banner' | 'featured_product' | 'sponsored_vendor' | 'category_top';

export interface PromotionRequest {
  id: string;
  vendorId: string;
  vendorName: string;
  productId?: string;
  productName?: string;
  categoryId?: string;
  categoryName?: string;
  promoType: PromoType;
  promoTitle: string;
  amountNaira: number;
  durationWeeks: number;
  bankName: string; // FCMB
  accountName: string; // Rhadsoft Tech
  accountNumber: string; // 9474918014
  proofUrl: string; // Proof of payment preview URL or base64
  proofFileName: string;
  txnRef: string;
  notes?: string;
  status: 'pending' | 'paid' | 'pending_assignment' | 'active' | 'approved' | 'expired' | 'cancelled' | 'rejected' | 'request_proof';
  paymentStatus?: 'pending_verification' | 'verified' | 'rejected';
  assignmentStatus?: 'pending_assignment' | 'assigned' | 'expired' | 'unassigned';
  adminNote?: string;
  requestedAt: string;
  approvedAt?: string;
  startDate?: string;
  expiresAt?: string;
  assignedSlot?: 'homepage_banner' | 'featured_product' | 'sponsored_vendor' | 'category_top';
  assignedTargetId?: string;
  assignedCategory?: string;
  bannerImageUrl?: string;
  bannerHeading?: string;
  bannerSubtext?: string;
  ctaText?: string;
  ctaUrl?: string;
  assignedBy?: string;
  assignedAt?: string;
}

export interface NotificationItem {
  id: string;
  userId: string;
  targetRole?: UserRole;
  title: string;
  message: string;
  type: 'vendor_approval' | 'product_approval' | 'promotion' | 'enquiry' | 'review' | 'system';
  isRead: boolean;
  createdAt: string;
}

export interface BannerAd {
  id: string;
  title: string;
  imageUrl: string;
  linkUrl: string;
  position: 'homepage_hero' | 'sidebar' | 'category_header';
  active: boolean;
}

export interface AuditLog {
  id: string;
  action: string;
  performedBy: string;
  role: string;
  details: string;
  timestamp: string;
}
