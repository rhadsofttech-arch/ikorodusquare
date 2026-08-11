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
      features: row.features || [],
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
      features: vendor.features || [],
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
    if (updates.businessName !== undefined) snakeUpdates.business_name = updates.businessName;
    if (updates.slug !== undefined) snakeUpdates.slug = updates.slug;
    if (updates.category !== undefined) snakeUpdates.category = updates.category;
    if (updates.subcategory !== undefined) snakeUpdates.subcategory = updates.subcategory;
    if (updates.description !== undefined) snakeUpdates.description = updates.description;
    if (updates.address !== undefined) snakeUpdates.address = updates.address;
    if (updates.area !== undefined) snakeUpdates.area = updates.area;
    if (updates.phone !== undefined) snakeUpdates.phone = updates.phone;
    if (updates.whatsapp !== undefined) snakeUpdates.whatsapp = updates.whatsapp;
    if (updates.website !== undefined) snakeUpdates.website = updates.website;
    if (updates.instagram !== undefined) snakeUpdates.instagram = updates.instagram;
    if (updates.facebook !== undefined) snakeUpdates.facebook = updates.facebook;
    if (updates.tiktok !== undefined) snakeUpdates.tiktok = updates.tiktok;
    if (updates.yearsInBusiness !== undefined) snakeUpdates.years_in_business = updates.yearsInBusiness;
    if (updates.logoUrl !== undefined) snakeUpdates.logo_url = updates.logoUrl;
    if (updates.coverImageUrl !== undefined) snakeUpdates.cover_image_url = updates.coverImageUrl;
    if (updates.galleryUrls !== undefined) snakeUpdates.gallery_urls = updates.galleryUrls;
    if (updates.ownerName !== undefined) snakeUpdates.owner_name = updates.ownerName;
    if (updates.ownerEmail !== undefined) snakeUpdates.owner_email = updates.ownerEmail;
    if (updates.ownerPhone !== undefined) snakeUpdates.owner_phone = updates.ownerPhone;
    if (updates.businessHours !== undefined) snakeUpdates.business_hours = updates.businessHours;
    if (updates.deliveryAreas !== undefined) snakeUpdates.delivery_areas = updates.deliveryAreas;
    if (updates.status !== undefined) snakeUpdates.status = updates.status;
    if (updates.isVerified !== undefined) snakeUpdates.is_verified = updates.isVerified;
    if (updates.isFeatured !== undefined) snakeUpdates.is_featured = updates.isFeatured;
    if (updates.isPremium !== undefined) snakeUpdates.is_premium = updates.isPremium;
    if (updates.features !== undefined) snakeUpdates.features = updates.features;
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

export async function uploadFileToSupabaseStorage(
  bucketName: string,
  filePath: string,
  file: File
): Promise<string | null> {
  if (!isSupabaseConfigured()) return null;
  try {
    let { data, error } = await supabase.storage.from(bucketName).upload(filePath, file, {
      upsert: true,
    });
    if (error) {
      if (error.message?.toLowerCase().includes('not found') || error.message?.toLowerCase().includes('bucket')) {
        try {
          await supabase.storage.createBucket(bucketName, { public: true });
          const retry = await supabase.storage.from(bucketName).upload(filePath, file, { upsert: true });
          if (!retry.error && retry.data) {
            data = retry.data;
            error = null;
          }
        } catch (bErr) {
          console.warn(`Error creating bucket ${bucketName}:`, bErr);
        }
      }
    }
    if (error || !data) {
      console.warn('Supabase storage upload error:', error?.message);
      return null;
    }
    const { data: publicUrlData } = supabase.storage.from(bucketName).getPublicUrl(data.path);
    return publicUrlData.publicUrl;
  } catch (err) {
    console.error('Error uploading file to Supabase storage:', err);
    return null;
  }
}

export async function uploadProductImageToSupabase(
  file: File,
  vendorId: string
): Promise<{ url: string | null; error: string | null }> {
  if (!isSupabaseConfigured()) {
    return { url: null, error: 'Supabase storage is not configured.' };
  }

  const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  if (!validTypes.includes(file.type.toLowerCase())) {
    return { url: null, error: `Invalid image format (${file.type}). Allowed formats: JPG, JPEG, PNG, WEBP.` };
  }

  const maxSizeInBytes = 10 * 1024 * 1024; // 10MB
  if (file.size > maxSizeInBytes) {
    return { url: null, error: `File "${file.name}" exceeds 10MB limit.` };
  }

  const ext = file.name.split('.').pop() || 'jpg';
  const cleanVendorId = vendorId.replace(/[^a-zA-Z0-9_-]/g, '_');
  const filePath = `${cleanVendorId}/prod_${Date.now()}_${Math.random().toString(36).substring(2, 7)}.${ext}`;
  const bucketName = 'product-images';

  try {
    let { data, error } = await supabase.storage.from(bucketName).upload(filePath, file, {
      cacheControl: '3600',
      upsert: true,
    });

    if (error) {
      if (error.message?.toLowerCase().includes('not found') || error.message?.toLowerCase().includes('bucket')) {
        try {
          await supabase.storage.createBucket(bucketName, { public: true });
          const retry = await supabase.storage.from(bucketName).upload(filePath, file, {
            cacheControl: '3600',
            upsert: true,
          });
          if (!retry.error && retry.data) {
            data = retry.data;
            error = null;
          }
        } catch (createErr) {
          console.warn('Could not auto-create product-images bucket:', createErr);
        }
      }
    }

    if (error || !data) {
      // Fallback attempt to 'public' bucket
      const fallbackPath = `products/${cleanVendorId}_${Date.now()}.${ext}`;
      const fallbackUpload = await supabase.storage.from('public').upload(fallbackPath, file, { upsert: true });
      if (!fallbackUpload.error && fallbackUpload.data) {
        const { data: pubUrl } = supabase.storage.from('public').getPublicUrl(fallbackUpload.data.path);
        return { url: pubUrl.publicUrl, error: null };
      }

      console.warn('Supabase product image upload error:', error?.message);
      return { url: null, error: error?.message || 'Storage upload failed' };
    }

    const { data: publicUrlData } = supabase.storage.from(bucketName).getPublicUrl(data.path);
    return { url: publicUrlData.publicUrl, error: null };
  } catch (err: any) {
    console.error('Error in uploadProductImageToSupabase:', err);
    return { url: null, error: err.message || 'Unexpected upload error' };
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
      productId: row.product_id || undefined,
      productName: row.product_name || undefined,
      categoryId: row.category_id || undefined,
      categoryName: row.category_name || undefined,
      promoType: row.promo_type as any,
      promoTitle: row.promo_title,
      amountNaira: Number(row.amount_naira || 0),
      durationWeeks: Number(row.duration_weeks || 2),
      bankName: row.bank_name || 'First City Monument Bank (FCMB)',
      accountName: row.account_name || 'Rhadsoft Tech - IkoroduSquare',
      accountNumber: row.account_number || '9474918014',
      proofUrl: row.proof_url || '',
      proofFileName: row.proof_file_name || 'payment_receipt.pdf',
      txnRef: row.txn_ref || `TXN-${row.id}`,
      notes: row.notes,
      status: row.status as any,
      paymentStatus: row.payment_status as any,
      assignmentStatus: row.assignment_status as any,
      adminNote: row.admin_note,
      requestedAt: row.requested_at,
      approvedAt: row.approved_at,
      startDate: row.start_date || row.approved_at,
      expiresAt: row.expires_at || row.expiry_date,
      assignedSlot: row.assigned_slot as any,
      assignedTargetId: row.assigned_target_id || row.product_id || row.vendor_id,
      assignedCategory: row.assigned_category || row.category_name,
      bannerHeading: row.banner_heading || row.title,
      bannerSubtext: row.banner_subtext || row.subtitle,
      bannerImageUrl: row.banner_image_url || row.image_url,
      ctaText: row.cta_text || 'Visit Store',
      ctaUrl: row.cta_url,
      assignedBy: row.assigned_by,
      assignedAt: row.assigned_at,
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
      product_id: promo.productId || null,
      product_name: promo.productName || null,
      category_id: promo.categoryId || null,
      category_name: promo.categoryName || null,
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
      payment_status: promo.paymentStatus || null,
      assignment_status: promo.assignmentStatus || null,
      admin_note: promo.adminNote,
      requested_at: promo.requestedAt,
      approved_at: promo.approvedAt,
      start_date: promo.startDate,
      expires_at: promo.expiresAt,
      assigned_slot: promo.assignedSlot,
      assigned_target_id: promo.assignedTargetId,
      assigned_category: promo.assignedCategory,
      banner_heading: promo.bannerHeading,
      banner_subtext: promo.bannerSubtext,
      banner_image_url: promo.bannerImageUrl,
      cta_text: promo.ctaText,
      cta_url: promo.ctaUrl,
      assigned_by: promo.assignedBy,
      assigned_at: promo.assignedAt,
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

export async function updateProfileInSupabase(
  userId: string,
  updates: {
    firstName?: string;
    lastName?: string;
    phone?: string;
    area?: string;
    role?: 'customer' | 'vendor' | 'admin';
  }
): Promise<boolean> {
  if (!isSupabaseConfigured()) return false;
  try {
    const row: any = {};
    if (updates.firstName !== undefined) row.first_name = updates.firstName;
    if (updates.lastName !== undefined) row.last_name = updates.lastName;
    if (updates.phone !== undefined) row.phone = updates.phone;
    if (updates.area !== undefined) row.area = updates.area;
    if (updates.role !== undefined) row.role = updates.role;

    const { error } = await supabase.from('profiles').update(row).eq('id', userId);
    return !error;
  } catch (err) {
    console.error('Error updating profile in Supabase:', err);
    return false;
  }
}

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

  // If email confirmation is disabled on Supabase, attempt immediate sign-in to guarantee active session
  if (!data.session) {
    try {
      const signInRes = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (signInRes.data?.session) {
        return signInRes.data;
      }
    } catch (e) {
      // Auto sign-in fallback ignored if confirmation is strictly required
    }
  }

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
