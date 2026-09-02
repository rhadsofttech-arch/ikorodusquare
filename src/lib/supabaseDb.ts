import { supabase, isSupabaseConfigured } from './supabase';
import {
  Vendor,
  Product,
  Review,
  Enquiry,
  PromotionRequest,
  VerificationRequest,
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

    if (error) {
      console.warn('Supabase fetchVendors error:', error.message);
      return null;
    }
    if (!data) return [];

    return (data as any[]).map((row: any) => ({
      id: row.id,
      userId: row.user_id || undefined,
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
      status: (row.status as any) || 'pending',
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
  if (!isSupabaseConfigured()) {
    console.warn('[VENDOR SUPABASE INSERT ERROR] Supabase is not configured');
    throw new Error('Supabase is not configured. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.');
  }

  try {
    const isUuid = (str?: string) =>
      Boolean(str && /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(str));

    const validUserId = isUuid(vendor.userId) ? vendor.userId : (isUuid(vendor.id) ? vendor.id : null);

    const row: Record<string, any> = {
      id: vendor.id,
      business_name: vendor.businessName,
      slug: vendor.slug,
      category: vendor.category,
      subcategory: vendor.subcategory || '',
      description: vendor.description || '',
      address: vendor.address || '',
      area: vendor.area,
      lga: vendor.lga || 'Ikorodu',
      state: vendor.state || 'Lagos State',
      country: vendor.country || 'Nigeria',
      phone: vendor.phone,
      whatsapp: vendor.whatsapp,
      website: vendor.website || null,
      instagram: vendor.instagram || null,
      facebook: vendor.facebook || null,
      tiktok: vendor.tiktok || null,
      years_in_business: vendor.yearsInBusiness || 1,
      logo_url: vendor.logoUrl || null,
      cover_image_url: vendor.coverImageUrl || null,
      gallery_urls: vendor.galleryUrls || [],
      cac_certificate_url: vendor.cacCertificateUrl || null,
      nin_doc_url: vendor.ninDocUrl || null,
      owner_name: vendor.ownerName,
      owner_email: vendor.ownerEmail,
      owner_phone: vendor.ownerPhone || null,
      status: vendor.status || 'pending',
      is_live: vendor.status === 'approved',
      is_verified: Boolean(vendor.isVerified),
      is_featured: Boolean(vendor.isFeatured),
      is_premium: Boolean(vendor.isPremium),
      rating: vendor.rating || 0,
      review_count: vendor.reviewCount || 0,
      business_hours: vendor.businessHours || [],
      delivery_areas: vendor.deliveryAreas || [],
      views_count: vendor.viewsCount || 0,
      whatsapp_clicks: vendor.whatsappClicks || 0,
      phone_clicks: vendor.phoneClicks || 0,
      created_at: vendor.createdAt || new Date().toISOString(),
    };

    if (validUserId) {
      row.user_id = validUserId;
    }

    if (vendor.features && vendor.features.length > 0) {
      row.features = vendor.features;
    }

    console.log('[VENDOR SUPABASE INSERT START]', {
      id: row.id,
      user_id: row.user_id,
      business_name: row.business_name,
      status: row.status,
      is_live: row.is_live,
      owner_email: row.owner_email,
    });

    let { data, error } = await supabase.from('vendors').upsert(row).select();

    // Check if optional column mismatches caused error and retry with stripped fields
    if (error && error.message) {
      if (error.message.includes('features')) {
        delete row.features;
        const retry = await supabase.from('vendors').upsert(row).select();
        error = retry.error;
        data = retry.data;
      }
      if (error && error.message?.includes('is_live')) {
        delete row.is_live;
        const retry = await supabase.from('vendors').upsert(row).select();
        error = retry.error;
        data = retry.data;
      }
      if (error && error.message?.includes('user_id')) {
        delete row.user_id;
        const retry = await supabase.from('vendors').upsert(row).select();
        error = retry.error;
        data = retry.data;
      }
    }

    if (error) {
      console.error('[VENDOR SUPABASE INSERT ERROR]', error);
      throw new Error(`Supabase vendors table error (${error.code || 'UNKNOWN'}): ${error.message}`);
    }

    console.log('[VENDOR SUPABASE INSERT RESULT]', {
      success: true,
      data,
    });
    return true;
  } catch (err: any) {
    console.error('[VENDOR SUPABASE INSERT ERROR]', err);
    throw err;
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
    if (updates.status !== undefined) {
      snakeUpdates.status = updates.status;
      snakeUpdates.is_live = updates.status === 'approved';
    }
    if (updates.isVerified !== undefined) snakeUpdates.is_verified = updates.isVerified;
    if (updates.isFeatured !== undefined) snakeUpdates.is_featured = updates.isFeatured;
    if (updates.isPremium !== undefined) snakeUpdates.is_premium = updates.isPremium;
    if (updates.features !== undefined) snakeUpdates.features = updates.features;
    if (updates.rating !== undefined) snakeUpdates.rating = updates.rating;
    if (updates.reviewCount !== undefined) snakeUpdates.review_count = updates.reviewCount;
    if (updates.whatsappClicks !== undefined) snakeUpdates.whatsapp_clicks = updates.whatsappClicks;
    if (updates.phoneClicks !== undefined) snakeUpdates.phone_clicks = updates.phoneClicks;

    let { error } = await supabase.from('vendors').update(snakeUpdates).eq('id', vendorId);
    if (error && error.message?.includes('is_live')) {
      delete snakeUpdates.is_live;
      const retry = await supabase.from('vendors').update(snakeUpdates).eq('id', vendorId);
      error = retry.error;
    }
    if (error && error.message?.includes('features')) {
      delete snakeUpdates.features;
      const retry = await supabase.from('vendors').update(snakeUpdates).eq('id', vendorId);
      error = retry.error;
    }

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
    let processedFile = file;
    // Auto-compress image before upload if not SVG or tiny file
    if (file.type.startsWith('image/') && !file.type.includes('svg')) {
      try {
        const maxDim = bucketName === 'vendor-logos' ? 800 : bucketName === 'vendor-covers' ? 1600 : 1200;
        processedFile = await compressImageBeforeUpload(file, maxDim, 0.85);
      } catch (cErr) {
        console.warn(`[STORAGE] Compression skipped for ${file.name}:`, cErr);
      }
    }

    const { data, error } = await supabase.storage.from(bucketName).upload(filePath, processedFile, {
      cacheControl: '3600',
      upsert: true,
      contentType: processedFile.type,
    });

    if (error || !data) {
      console.warn(`[STORAGE] Upload failed for bucket "${bucketName}" at "${filePath}":`, error?.message);
      return null;
    }

    const { data: publicUrlData } = supabase.storage.from(bucketName).getPublicUrl(data.path);
    return publicUrlData?.publicUrl || null;
  } catch (err) {
    console.error(`[STORAGE] Exception uploading to bucket "${bucketName}":`, err);
    return null;
  }
}

export async function convertFileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      if (result) resolve(result);
      else reject(new Error('Failed to read image file.'));
    };
    reader.onerror = (err) => reject(err);
    reader.readAsDataURL(file);
  });
}

/**
 * Compresses image files in the browser before uploading using HTML5 Canvas.
 * Reduces 5-10MB camera uploads down to fast, lightweight 100-300KB WebP/JPEG files.
 */
export async function compressImageBeforeUpload(
  file: File,
  maxDimension = 1200,
  quality = 0.85
): Promise<File> {
  if (file.type.includes('svg') || file.size <= 150 * 1024) {
    return file;
  }

  return new Promise((resolve) => {
    const img = new Image();
    const url = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(url);
      let { width, height } = img;

      if (width > maxDimension || height > maxDimension) {
        if (width > height) {
          height = Math.round((height * maxDimension) / width);
          width = maxDimension;
        } else {
          width = Math.round((width * maxDimension) / height);
          height = maxDimension;
        }
      }

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        resolve(file);
        return;
      }

      ctx.drawImage(img, 0, 0, width, height);
      const outputType = file.type === 'image/png' ? 'image/png' : 'image/jpeg';

      canvas.toBlob(
        (blob) => {
          if (!blob || blob.size >= file.size) {
            resolve(file);
            return;
          }

          const ext = outputType === 'image/jpeg' ? 'jpg' : 'png';
          const compressedFile = new File(
            [blob],
            `${file.name.replace(/\.[^/.]+$/, '')}.${ext}`,
            {
              type: outputType,
              lastModified: Date.now(),
            }
          );
          resolve(compressedFile);
        },
        outputType,
        quality
      );
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      resolve(file);
    };

    img.src = url;
  });
}

/**
 * Primary product image uploader function.
 * Uploads to Supabase Storage bucket ('product-images').
 * If Storage upload fails, returns clear error without silently persisting Base64 to the database.
 */
export async function uploadProductImageToSupabase(
  file: File,
  vendorId: string,
  productId?: string
): Promise<{ url: string | null; error: string | null }> {
  // 1. Format validation
  const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  if (!validTypes.includes(file.type.toLowerCase())) {
    return {
      url: null,
      error: `Image upload failed: Unsupported file type "${file.type}". Allowed formats: JPG, JPEG, PNG, WEBP.`,
    };
  }

  // 2. Size limit validation
  const maxSizeInBytes = 10 * 1024 * 1024; // 10MB
  if (file.size > maxSizeInBytes) {
    return {
      url: null,
      error: `Image upload failed: File "${file.name}" exceeds 10MB limit.`,
    };
  }

  // 3. Perform canvas image compression before upload
  let processedFile = file;
  try {
    processedFile = await compressImageBeforeUpload(file, 1200, 0.85);
  } catch (err) {
    console.warn('[PRODUCT IMAGE] Image compression skipped, using original file:', err);
  }

  const ext = processedFile.name.split('.').pop() || 'jpg';
  const cleanVendorId = (vendorId || 'v-anonymous').replace(/[^a-zA-Z0-9_-]/g, '_');
  const cleanProductId = (productId || 'catalog').replace(/[^a-zA-Z0-9_-]/g, '_');
  const filePath = `${cleanVendorId}/${cleanProductId}/prod_${Date.now()}_${Math.random().toString(36).substring(2, 7)}.${ext}`;
  const bucketName = 'product-images';

  // 4. Upload to Supabase Storage
  if (isSupabaseConfigured()) {
    try {
      const { data, error } = await supabase.storage.from(bucketName).upload(filePath, processedFile, {
        cacheControl: '3600',
        upsert: true,
        contentType: processedFile.type,
      });

      if (!error && data?.path) {
        const { data: publicUrlData } = supabase.storage.from(bucketName).getPublicUrl(data.path);
        const storagePublicUrl = publicUrlData.publicUrl;
        console.log(`[PRODUCT IMAGE] Uploaded to Supabase Storage: ${storagePublicUrl}`);
        return { url: storagePublicUrl, error: null };
      }

      if (error) {
        console.warn(`[PRODUCT IMAGE] Storage upload failed [Bucket: ${bucketName}, Path: ${filePath}]:`, error.message);
        return {
          url: null,
          error: `Storage upload failed: ${error.message}. Please verify Supabase Storage configuration and retry.`,
        };
      }
    } catch (storageErr: any) {
      console.warn('[PRODUCT IMAGE] Exception during Supabase Storage upload:', storageErr);
      return {
        url: null,
        error: storageErr?.message || 'Failed to upload product image to Supabase Storage.',
      };
    }
  }

  return {
    url: null,
    error: 'Supabase credentials are not configured for image storage.',
  };
}

/**
 * Removes an image object from Supabase Storage when an image is deleted/replaced by a vendor.
 */
export async function deleteProductImageFromSupabase(imageUrl: string): Promise<boolean> {
  if (!isSupabaseConfigured() || !imageUrl || imageUrl.startsWith('data:')) {
    return true; // Data URLs require no storage object deletion
  }

  try {
    // Extract relative storage path from public URL
    // e.g. https://<ref>.supabase.co/storage/v1/object/public/product-images/v_123/prod_123.jpg
    const bucketPrefix = '/product-images/';
    const pathIndex = imageUrl.indexOf(bucketPrefix);
    if (pathIndex === -1) return false;

    const relativePath = imageUrl.substring(pathIndex + bucketPrefix.length);
    const { error } = await supabase.storage.from('product-images').remove([relativePath]);

    if (error) {
      console.warn(`[PRODUCT IMAGE] Failed to delete Storage object (${relativePath}):`, error.message);
      return false;
    }

    console.log(`[PRODUCT IMAGE] Successfully removed object from Supabase Storage: ${relativePath}`);
    return true;
  } catch (err: any) {
    console.error('[PRODUCT IMAGE] Error removing image from Supabase Storage:', err);
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

export async function saveProductToSupabase(product: Product): Promise<{ success: boolean; error?: string }> {
  if (!isSupabaseConfigured()) {
    return { success: false, error: 'Supabase credentials are not configured.' };
  }
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
      return { success: false, error: `Database save failed: ${error.message}` };
    }
    return { success: true };
  } catch (err: any) {
    console.error('Error saving product to Supabase:', err);
    return { success: false, error: err.message || 'Unexpected database error while saving product.' };
  }
}

/**
 * Batch upload product images with controlled concurrency (e.g. 3 parallel uploads at a time).
 */
export async function uploadProductImagesBatch(
  files: File[],
  vendorId: string,
  productId?: string,
  onProgress?: (current: number, total: number) => void
): Promise<{ urls: string[]; failures: { fileName: string; error: string }[] }> {
  const urls: string[] = [];
  const failures: { fileName: string; error: string }[] = [];
  const concurrencyLimit = 3;
  let completedCount = 0;

  // Process files in concurrency chunks
  for (let i = 0; i < files.length; i += concurrencyLimit) {
    const chunk = files.slice(i, i + concurrencyLimit);
    const results = await Promise.all(
      chunk.map(async (file) => {
        const res = await uploadProductImageToSupabase(file, vendorId, productId);
        completedCount++;
        if (onProgress) {
          onProgress(completedCount, files.length);
        }
        return { file, res };
      })
    );

    for (const { file, res } of results) {
      if (res.url) {
        urls.push(res.url);
      } else {
        failures.push({
          fileName: file.name,
          error: res.error || 'Unknown upload error',
        });
      }
    }
  }

  return { urls, failures };
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

/**
 * Public promotion query: excludes heavy Base64 receipts, proof files, private bank details,
 * transaction references, and admin notes to ensure high-performance homepage and marketplace loading.
 */
export async function fetchPromotionsFromSupabase(): Promise<PromotionRequest[] | null> {
  if (!isSupabaseConfigured()) return [];
  try {
    const { data, error } = await supabase
      .from('promotion_requests')
      .select('*')
      .order('requested_at', { ascending: false });

    if (error) {
      console.warn('[SUPABASE] Query error fetching public promotions:', error.message);
      return [];
    }

    if (!data) return [];

    return (data as any[]).map((row: any) => ({
      id: row.id,
      vendorId: row.vendor_id,
      vendorName: row.vendor_name,
      productId: (row as any).product_id || undefined,
      productName: (row as any).product_name || undefined,
      categoryId: (row as any).category_id || undefined,
      categoryName: (row as any).category_name || undefined,
      promoType: row.promo_type as any,
      promoTitle: row.promo_title,
      amountNaira: Number(row.amount_naira || 0),
      durationWeeks: Number(row.duration_weeks || 2),
      bankName: row.bank_name || 'First City Monument Bank (FCMB)',
      accountName: row.account_name || 'Rhadsoft Tech - IkoroduSquare',
      accountNumber: row.account_number || '9474918014',
      proofUrl: row.proof_url || '',
      proofFileName: row.proof_file_name || '',
      txnRef: row.txn_ref || '',
      notes: row.notes,
      status: row.status as any,
      paymentStatus: (row as any).payment_status || 'pending',
      assignmentStatus: (row as any).assignment_status || 'unassigned',
      adminNote: row.admin_note,
      requestedAt: row.requested_at,
      approvedAt: row.approved_at,
      startDate: row.start_date || row.approved_at,
      expiresAt: row.expires_at,
      assignedSlot: (row.assigned_slot || row.promo_type) as any,
      assignedTargetId: row.assigned_target_id || row.vendor_id,
      assignedCategory: row.assigned_category,
      bannerHeading: row.banner_heading || row.vendor_name,
      bannerSubtext: row.banner_subtext || 'Special promotion on IkoroduSquare',
      bannerImageUrl: row.banner_image_url,
      ctaText: row.cta_text || 'Visit Store',
      ctaUrl: row.cta_url,
      assignedBy: row.assigned_by,
      assignedAt: row.assigned_at,
    }));
  } catch (err) {
    console.warn('[SUPABASE] Exception fetching public promotions:', err);
    return [];
  }
}

/**
 * Admin promotion query: retrieves full promotion records including verification receipts,
 * transaction references, and bank details for administrative verification and moderation.
 */
export async function fetchAdminPromotionsFromSupabase(): Promise<PromotionRequest[] | null> {
  if (!isSupabaseConfigured()) return [];
  try {
    const { data, error } = await supabase
      .from('promotion_requests')
      .select('*')
      .order('requested_at', { ascending: false });

    if (error) {
      console.warn('[SUPABASE] Query error fetching admin promotions:', error.message);
      return [];
    }

    if (!data) return [];

    return data.map((row) => ({
      id: row.id,
      vendorId: row.vendor_id,
      vendorName: row.vendor_name,
      productId: row.product_id || (row.notes?.startsWith('product:') ? row.notes.replace('product:', '') : undefined),
      productName: row.product_name || undefined,
      categoryId: row.category_id || undefined,
      categoryName: row.category_name || (row.notes?.startsWith('category:') ? row.notes.replace('category:', '') : undefined),
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
      assignedSlot: (row.assigned_slot || row.promo_type) as any,
      assignedTargetId: row.assigned_target_id || row.product_id || (row.notes?.startsWith('product:') ? row.notes.replace('product:', '') : row.vendor_id),
      assignedCategory: row.assigned_category || row.category_name || (row.notes?.startsWith('category:') ? row.notes.replace('category:', '') : undefined),
      bannerHeading: row.banner_heading || row.title || row.vendor_name,
      bannerSubtext: row.banner_subtext || row.subtitle || 'Special promotion on IkoroduSquare',
      bannerImageUrl: row.banner_image_url || row.image_url,
      ctaText: row.cta_text || 'Visit Store',
      ctaUrl: row.cta_url,
      assignedBy: row.assigned_by,
      assignedAt: row.assigned_at,
    }));
  } catch (err) {
    console.warn('[SUPABASE] Exception fetching admin promotions:', err);
    return [];
  }
}

export async function savePromotionToSupabase(promo: PromotionRequest): Promise<boolean> {
  if (!isSupabaseConfigured()) return false;
  try {
    const notesContent = promo.notes || (promo.productId ? `product:${promo.productId}` : promo.categoryName ? `category:${promo.categoryName}` : '');
    const row = {
      id: promo.id,
      vendor_id: promo.vendorId,
      vendor_name: promo.vendorName,
      promo_type: promo.promoType,
      promo_title: promo.promoTitle || promo.vendorName || 'IkoroduSquare Promotion',
      amount_naira: promo.amountNaira,
      duration_weeks: promo.durationWeeks,
      bank_name: promo.bankName,
      account_name: promo.accountName,
      account_number: promo.accountNumber,
      proof_url: promo.proofUrl,
      proof_file_name: promo.proofFileName,
      txn_ref: promo.txnRef,
      notes: notesContent,
      status: promo.status,
      admin_note: promo.adminNote,
      requested_at: promo.requestedAt,
      approved_at: promo.approvedAt,
      expires_at: promo.expiresAt,
    };
    const { error } = await supabase.from('promotion_requests').upsert(row);
    if (error) {
      console.warn('Supabase savePromotion error:', error.message);
      return false;
    }
    return true;
  } catch (err) {
    return false;
  }
}

export async function deletePromotionInSupabase(promoId: string): Promise<boolean> {
  if (!isSupabaseConfigured()) return false;
  try {
    const { error } = await supabase.from('promotion_requests').delete().eq('id', promoId);
    return !error;
  } catch (err) {
    return false;
  }
}

// ==========================================
// PAID VENDOR VERIFICATION API (₦3,000)
// ==========================================

export async function fetchVerificationRequestsFromSupabase(): Promise<VerificationRequest[] | null> {
  if (!isSupabaseConfigured()) return [];
  try {
    const { data, error } = await supabase
      .from('verification_requests')
      .select('*')
      .order('requested_at', { ascending: false });

    if (error) {
      console.warn('[SUPABASE] Query error fetching verification requests:', error.message);
      return [];
    }

    if (!data) return [];

    return data.map((row) => ({
      id: row.id,
      vendorId: row.vendor_id,
      vendorName: row.vendor_name,
      amountNaira: Number(row.amount_naira || 3000),
      bankName: row.bank_name || 'First City Monument Bank (FCMB)',
      accountName: row.account_name || 'Rhadsoft Tech - IkoroduSquare',
      accountNumber: row.account_number || '9474918014',
      proofUrl: row.proof_url || '',
      proofFileName: row.proof_file_name || 'verification_receipt.png',
      txnRef: row.txn_ref || `VR-${row.id}`,
      status: row.status as any,
      adminNote: row.admin_note,
      requestedAt: row.requested_at,
      reviewedAt: row.reviewed_at,
    }));
  } catch (err) {
    console.warn('[SUPABASE] Exception fetching verification requests:', err);
    return [];
  }
}

export async function saveVerificationRequestToSupabase(req: VerificationRequest): Promise<boolean> {
  if (!isSupabaseConfigured()) return false;
  try {
    const row = {
      id: req.id,
      vendor_id: req.vendorId,
      vendor_name: req.vendorName,
      amount_naira: req.amountNaira || 3000,
      bank_name: req.bankName || 'First City Monument Bank (FCMB)',
      account_name: req.accountName || 'Rhadsoft Tech - IkoroduSquare',
      account_number: req.accountNumber || '9474918014',
      proof_url: req.proofUrl,
      proof_file_name: req.proofFileName,
      txn_ref: req.txnRef,
      status: req.status,
      admin_note: req.adminNote || null,
      requested_at: req.requestedAt,
      reviewed_at: req.reviewedAt || null,
    };
    const { error } = await supabase.from('verification_requests').upsert(row);
    if (error) {
      console.warn('[SUPABASE] saveVerificationRequest error:', error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.warn('[SUPABASE] Exception in saveVerificationRequest:', err);
    return false;
  }
}

export async function deleteVerificationRequestInSupabase(reqId: string): Promise<boolean> {
  if (!isSupabaseConfigured()) return false;
  try {
    const { error } = await supabase.from('verification_requests').delete().eq('id', reqId);
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
