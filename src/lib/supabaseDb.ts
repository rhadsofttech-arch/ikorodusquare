import { supabase, isSupabaseConfigured } from './supabase';
import {
  Vendor,
  Product,
  Review,
  Enquiry,
  PromotionRequest,
  NotificationItem,
  AuditLog,
  User,
} from '../types';

// ==========================================
// VENDORS API
// ==========================================

export async function fetchVendorsFromSupabase(): Promise<Vendor[] | null> {
  if (!isSupabaseConfigured()) return null;
  try {
    const { data, error } = await supabase
      .from('vendors')
      .select('*')
      .order('created_at', { ascending: false });

    if (error || !data) return null;

    return data.map((row) => ({
      id: row.id,
      businessName: row.business_name,
      slug: row.slug,
      category: row.category,
      subcategory: row.subcategory || '',
      description: row.description || '',
      address: row.address || '',
      area: row.area,
      lga: row.lga || 'Ikorodu',
      state: row.state || 'Lagos State',
      country: row.country || 'Nigeria',
      phone: row.phone || '',
      whatsapp: row.whatsapp || '',
      website: row.website,
      instagram: row.instagram,
      facebook: row.facebook,
      tiktok: row.tiktok,
      yearsInBusiness: row.years_in_business || 1,
      logoUrl: row.logo_url || '',
      coverImageUrl: row.cover_image_url || '',
      galleryUrls: row.gallery_urls || [],
      cacCertificateUrl: row.cac_certificate_url,
      ninDocUrl: row.nin_doc_url,
      ownerName: row.owner_name,
      ownerEmail: row.owner_email,
      ownerPhone: row.owner_phone || '',
      status: row.status as any,
      isVerified: Boolean(row.is_verified),
      isFeatured: Boolean(row.is_featured),
      isPremium: Boolean(row.is_premium),
      rating: Number(row.rating) || 0,
      reviewCount: Number(row.review_count) || 0,
      businessHours: row.business_hours || [],
      deliveryAreas: row.delivery_areas || [],
      viewsCount: Number(row.views_count) || 0,
      whatsappClicks: Number(row.whatsapp_clicks) || 0,
      phoneClicks: Number(row.phone_clicks) || 0,
      createdAt: row.created_at,
    }));
  } catch (err) {
    console.error('Error in fetchVendorsFromSupabase:', err);
    return null;
  }
}

export async function saveVendorToSupabase(vendor: Vendor): Promise<boolean> {
  if (!isSupabaseConfigured()) return false;
  try {
    const row = {
      id: vendor.id,
      business_name: vendor.businessName,
      slug: vendor.slug,
      category: vendor.category,
      subcategory: vendor.subcategory,
      description: vendor.description,
      address: vendor.address,
      area: vendor.area,
      lga: vendor.lga,
      state: vendor.state,
      country: vendor.country,
      phone: vendor.phone,
      whatsapp: vendor.whatsapp,
      website: vendor.website,
      instagram: vendor.instagram,
      facebook: vendor.facebook,
      tiktok: vendor.tiktok,
      years_in_business: vendor.yearsInBusiness,
      logo_url: vendor.logoUrl,
      cover_image_url: vendor.coverImageUrl,
      gallery_urls: vendor.galleryUrls,
      cac_certificate_url: vendor.cacCertificateUrl,
      nin_doc_url: vendor.ninDocUrl,
      owner_name: vendor.ownerName,
      owner_email: vendor.ownerEmail,
      owner_phone: vendor.ownerPhone,
      status: vendor.status,
      is_verified: vendor.isVerified,
      is_featured: vendor.isFeatured,
      is_premium: vendor.isPremium,
      rating: vendor.rating,
      review_count: vendor.reviewCount,
      business_hours: vendor.businessHours,
      delivery_areas: vendor.deliveryAreas,
      views_count: vendor.viewsCount,
      whatsapp_clicks: vendor.whatsappClicks,
      phone_clicks: vendor.phoneClicks,
      created_at: vendor.createdAt,
    };

    const { error } = await supabase.from('vendors').upsert(row);
    if (error) {
      console.warn('Supabase saveVendor error:', error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.error('Error saving vendor to Supabase:', err);
    return false;
  }
}

export async function updateVendorInSupabase(
  vendorId: string,
  updates: Record<string, any>
): Promise<boolean> {
  if (!isSupabaseConfigured()) return false;
  try {
    const snakeUpdates: Record<string, any> = {};
    if (updates.status !== undefined) snakeUpdates.status = updates.status;
    if (updates.isVerified !== undefined) snakeUpdates.is_verified = updates.isVerified;
    if (updates.isFeatured !== undefined) snakeUpdates.is_featured = updates.isFeatured;
    if (updates.isPremium !== undefined) snakeUpdates.is_premium = updates.isPremium;
    if (updates.rating !== undefined) snakeUpdates.rating = updates.rating;
    if (updates.reviewCount !== undefined) snakeUpdates.review_count = updates.reviewCount;
    if (updates.whatsappClicks !== undefined) snakeUpdates.whatsapp_clicks = updates.whatsappClicks;
    if (updates.phoneClicks !== undefined) snakeUpdates.phone_clicks = updates.phoneClicks;

    const { error } = await supabase.from('vendors').update(snakeUpdates).eq('id', vendorId);
    if (error) {
      console.warn('Supabase updateVendor error:', error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.error('Error updating vendor in Supabase:', err);
    return false;
  }
}

export async function deleteVendorFromSupabase(vendorId: string): Promise<boolean> {
  if (!isSupabaseConfigured()) return false;
  try {
    await supabase.from('products').delete().eq('vendor_id', vendorId);
    await supabase.from('reviews').delete().eq('vendor_id', vendorId);
    await supabase.from('enquiries').delete().eq('vendor_id', vendorId);
    await supabase.from('promotion_requests').delete().eq('vendor_id', vendorId);
    const { error } = await supabase.from('vendors').delete().eq('id', vendorId);
    if (error) {
      console.warn('Supabase deleteVendor error:', error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.error('Error deleting vendor from Supabase:', err);
    return false;
  }
}

// ==========================================
// PRODUCTS API
// ==========================================

export async function fetchProductsFromSupabase(): Promise<Product[] | null> {
  if (!isSupabaseConfigured()) return null;
  try {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false });

    if (error || !data) return null;

    return data.map((row) => ({
      id: row.id,
      vendorId: row.vendor_id,
      vendorName: row.vendor_name,
      vendorArea: row.vendor_area,
      type: row.type as any,
      name: row.name,
      slug: row.slug,
      description: row.description || '',
      price: Number(row.price) || 0,
      salePrice: row.sale_price ? Number(row.sale_price) : undefined,
      sku: row.sku || '',
      stock: Number(row.stock) || 0,
      category: row.category,
      subcategory: row.subcategory || '',
      brand: row.brand,
      tags: row.tags || [],
      condition: row.condition as any,
      availability: row.availability as any,
      deliveryOptions: row.delivery_options || [],
      images: row.images || [],
      isFeatured: Boolean(row.is_featured),
      status: row.status as any,
      viewsCount: Number(row.views_count) || 0,
      createdAt: row.created_at,
    }));
  } catch (err) {
    console.error('Error fetching products from Supabase:', err);
    return null;
  }
}

export async function saveProductToSupabase(product: Product): Promise<boolean> {
  if (!isSupabaseConfigured()) return false;
  try {
    const row = {
      id: product.id,
      vendor_id: product.vendorId,
      vendor_name: product.vendorName,
      vendor_area: product.vendorArea,
      type: product.type,
      name: product.name,
      slug: product.slug,
      description: product.description,
      price: product.price,
      sale_price: product.salePrice,
      sku: product.sku,
      stock: product.stock,
      category: product.category,
      subcategory: product.subcategory,
      brand: product.brand,
      tags: product.tags,
      condition: product.condition,
      availability: product.availability,
      delivery_options: product.deliveryOptions,
      images: product.images,
      is_featured: product.isFeatured,
      status: product.status,
      views_count: product.viewsCount,
      created_at: product.createdAt,
    };

    const { error } = await supabase.from('products').upsert(row);
    if (error) {
      console.warn('Supabase saveProduct error:', error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.error('Error saving product to Supabase:', err);
    return false;
  }
}

export async function deleteProductFromSupabase(productId: string): Promise<boolean> {
  if (!isSupabaseConfigured()) return false;
  try {
    const { error } = await supabase.from('products').delete().eq('id', productId);
    return !error;
  } catch (err) {
    console.error('Error deleting product from Supabase:', err);
    return false;
  }
}

// ==========================================
// REVIEWS API
// ==========================================

export async function fetchReviewsFromSupabase(): Promise<Review[] | null> {
  if (!isSupabaseConfigured()) return null;
  try {
    const { data, error } = await supabase
      .from('reviews')
      .select('*')
      .order('created_at', { ascending: false });

    if (error || !data) return null;

    return data.map((row) => ({
      id: row.id,
      vendorId: row.vendor_id,
      customerId: row.customer_id || 'c-101',
      customerName: row.customer_name || 'Anonymous Buyer',
      customerAvatar: row.customer_avatar,
      rating: Number(row.rating),
      comment: row.comment,
      vendorReply: row.vendor_reply,
      vendorRepliedAt: row.vendor_replied_at,
      createdAt: row.created_at,
    }));
  } catch (err) {
    return null;
  }
}

export async function saveReviewToSupabase(review: Review): Promise<boolean> {
  if (!isSupabaseConfigured()) return false;
  try {
    const row = {
      id: review.id,
      vendor_id: review.vendorId,
      customer_id: review.customerId,
      customer_name: review.customerName,
      customer_avatar: review.customerAvatar,
      rating: review.rating,
      comment: review.comment,
      vendor_reply: review.vendorReply,
      vendor_replied_at: review.vendorRepliedAt,
      created_at: review.createdAt,
    };
    const { error } = await supabase.from('reviews').upsert(row);
    return !error;
  } catch (err) {
    return false;
  }
}

// ==========================================
// ENQUIRIES API
// ==========================================

export async function fetchEnquiriesFromSupabase(): Promise<Enquiry[] | null> {
  if (!isSupabaseConfigured()) return null;
  try {
    const { data, error } = await supabase
      .from('enquiries')
      .select('*')
      .order('created_at', { ascending: false });

    if (error || !data) return null;

    return data.map((row) => ({
      id: row.id,
      vendorId: row.vendor_id,
      vendorName: row.vendor_name || 'Local Vendor',
      customerId: row.customer_id || 'c-101',
      customerName: row.customer_name,
      customerEmail: row.customer_email,
      customerPhone: row.customer_phone || '',
      message: row.message,
      status: row.status as any,
      replyText: row.reply_text,
      repliedAt: row.replied_at,
      createdAt: row.created_at,
    }));
  } catch (err) {
    return null;
  }
}

export async function saveEnquiryToSupabase(enquiry: Enquiry): Promise<boolean> {
  if (!isSupabaseConfigured()) return false;
  try {
    const row = {
      id: enquiry.id,
      vendor_id: enquiry.vendorId,
      vendor_name: enquiry.vendorName,
      customer_id: enquiry.customerId,
      customer_name: enquiry.customerName,
      customer_email: enquiry.customerEmail,
      customer_phone: enquiry.customerPhone,
      message: enquiry.message,
      status: enquiry.status,
      reply_text: enquiry.replyText,
      replied_at: enquiry.repliedAt,
      created_at: enquiry.createdAt,
    };
    const { error } = await supabase.from('enquiries').upsert(row);
    return !error;
  } catch (err) {
    return false;
  }
}

// ==========================================
// PROMOTIONS API
// ==========================================

export async function fetchPromotionsFromSupabase(): Promise<PromotionRequest[] | null> {
  if (!isSupabaseConfigured()) return null;
  try {
    const { data, error } = await supabase
      .from('promotion_requests')
      .select('*')
      .order('requested_at', { ascending: false });

    if (error || !data) return null;

    return data.map((row) => ({
      id: row.id,
      vendorId: row.vendor_id,
      vendorName: row.vendor_name,
      promoType: row.promo_type as any,
      promoTitle: row.promo_title,
      amountNaira: Number(row.amount_naira),
      durationWeeks: Number(row.duration_weeks),
      bankName: row.bank_name || 'First City Monument Bank (FCMB)',
      accountName: row.account_name || 'Rhadsoft Tech - IkoroduSquare',
      accountNumber: row.account_number || '9474918014',
      proofUrl: row.proof_url || '',
      proofFileName: row.proof_file_name || 'payment_receipt.pdf',
      txnRef: row.txn_ref || `TXN-${row.id}`,
      notes: row.notes,
      status: row.status as any,
      adminNote: row.admin_note,
      requestedAt: row.requested_at,
      approvedAt: row.approved_at,
      expiresAt: row.expires_at,
    }));
  } catch (err) {
    return null;
  }
}

export async function savePromotionToSupabase(promo: PromotionRequest): Promise<boolean> {
  if (!isSupabaseConfigured()) return false;
  try {
    const row = {
      id: promo.id,
      vendor_id: promo.vendorId,
      vendor_name: promo.vendorName,
      promo_type: promo.promoType,
      promo_title: promo.promoTitle,
      amount_naira: promo.amountNaira,
      duration_weeks: promo.durationWeeks,
      bank_name: promo.bankName,
      account_name: promo.accountName,
      account_number: promo.accountNumber,
      proof_url: promo.proofUrl,
      proof_file_name: promo.proofFileName,
      txn_ref: promo.txnRef,
      notes: promo.notes,
      status: promo.status,
      admin_note: promo.adminNote,
      requested_at: promo.requestedAt,
      approved_at: promo.approvedAt,
      expires_at: promo.expiresAt,
    };
    const { error } = await supabase.from('promotion_requests').upsert(row);
    return !error;
  } catch (err) {
    return false;
  }
}

// ==========================================
// NOTIFICATIONS & AUDIT LOGS API
// ==========================================

export async function fetchNotificationsFromSupabase(): Promise<NotificationItem[] | null> {
  if (!isSupabaseConfigured()) return null;
  try {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .order('created_at', { ascending: false });

    if (error || !data) return null;

    return data.map((row) => ({
      id: row.id,
      userId: row.user_id,
      targetRole: row.target_role as any,
      title: row.title,
      message: row.message,
      type: row.type as any,
      isRead: Boolean(row.is_read),
      createdAt: row.created_at,
    }));
  } catch (err) {
    return null;
  }
}

export async function saveNotificationToSupabase(notif: NotificationItem): Promise<boolean> {
  if (!isSupabaseConfigured()) return false;
  try {
    const row = {
      id: notif.id,
      user_id: notif.userId,
      target_role: notif.targetRole,
      title: notif.title,
      message: notif.message,
      type: notif.type,
      is_read: notif.isRead,
      created_at: notif.createdAt,
    };
    const { error } = await supabase.from('notifications').upsert(row);
    return !error;
  } catch (err) {
    return false;
  }
}

export async function fetchAuditLogsFromSupabase(): Promise<AuditLog[] | null> {
  if (!isSupabaseConfigured()) return null;
  try {
    const { data, error } = await supabase
      .from('audit_logs')
      .select('*')
      .order('timestamp', { ascending: false });

    if (error || !data) return null;

    return data.map((row) => ({
      id: row.id,
      action: row.action,
      performedBy: row.performed_by,
      role: row.role as any,
      details: row.details,
      timestamp: row.timestamp,
    }));
  } catch (err) {
    return null;
  }
}

export async function saveAuditLogToSupabase(log: AuditLog): Promise<boolean> {
  if (!isSupabaseConfigured()) return false;
  try {
    const row = {
      id: log.id,
      action: log.action,
      performed_by: log.performedBy,
      role: log.role,
      details: log.details,
      timestamp: log.timestamp,
    };
    const { error } = await supabase.from('audit_logs').upsert(row);
    return !error;
  } catch (err) {
    return false;
  }
}

// ==========================================
// AUTH & PROFILES HELPERS (SUPABASE AUTH)
// ==========================================

export async function createProfileInSupabase(profile: {
  id: string;
  email: string;
  role: 'customer' | 'vendor' | 'admin';
  firstName?: string;
  lastName?: string;
  phone?: string;
  area?: string;
}): Promise<boolean> {
  if (!isSupabaseConfigured()) return false;
  try {
    const row = {
      id: profile.id,
      email: profile.email,
      role: profile.role,
      first_name: profile.firstName || '',
      last_name: profile.lastName || '',
      phone: profile.phone || '',
      area: profile.area || 'Sabo',
      created_at: new Date().toISOString(),
    };
    const { error } = await supabase.from('profiles').upsert(row);
    if (error) {
      console.warn('Supabase profile creation error:', error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.error('Error creating profile in Supabase:', err);
    return false;
  }
}

export async function fetchProfileFromSupabase(userId: string) {
  if (!isSupabaseConfigured()) return null;
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle();

    if (error || !data) return null;
    return data;
  } catch (err) {
    console.error('Error fetching profile from Supabase:', err);
    return null;
  }
}

export async function supabaseSignUp(email: string, password: string, userData: Partial<User>) {
  if (!isSupabaseConfigured()) {
    throw new Error('Supabase is not configured yet. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.');
  }
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        firstName: userData.firstName,
        lastName: userData.lastName,
        phone: userData.phone,
        role: userData.role || 'customer',
        area: userData.area || 'Sabo',
      },
    },
  });

  if (error) throw error;
  if (!data.user) {
    throw new Error('Supabase Auth user creation failed.');
  }

  // Create matching record in public.profiles table using user's UUID
  await createProfileInSupabase({
    id: data.user.id,
    email: email,
    role: (userData.role as any) || 'customer',
    firstName: userData.firstName,
    lastName: userData.lastName,
    phone: userData.phone,
    area: userData.area,
  });

  return data;
}

export async function supabaseSignIn(email: string, password: string) {
  if (!isSupabaseConfigured()) {
    throw new Error('Supabase is not configured yet. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.');
  }
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) throw error;
  return data;
}

export async function supabaseSignOut() {
  if (!isSupabaseConfigured()) return;
  await supabase.auth.signOut();
}
