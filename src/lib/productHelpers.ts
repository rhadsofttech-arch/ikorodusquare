import { Product } from '../types';

export const DEFAULT_PRODUCT_IMAGE =
  'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?auto=format&fit=crop&q=80&w=800';

/**
 * Safely extracts a product cover image or specific gallery image with fallback.
 */
export function getProductCoverImage(
  product?: Partial<Product> | null,
  index = 0,
  fallback = DEFAULT_PRODUCT_IMAGE
): string {
  if (!product) return fallback;
  if (Array.isArray(product.images) && product.images.length > index) {
    const img = product.images[index];
    if (typeof img === 'string' && img.trim().length > 0) {
      return img;
    }
  }
  if (Array.isArray(product.images) && product.images.length > 0) {
    const firstImg = product.images[0];
    if (typeof firstImg === 'string' && firstImg.trim().length > 0) {
      return firstImg;
    }
  }
  return fallback;
}

/**
 * Safely formats prices in Naira without throwing TypeError on null/undefined/NaN.
 */
export function safeFormatPrice(price?: number | string | null): string {
  if (price === undefined || price === null || price === '') return '0';
  const num = typeof price === 'number' ? price : Number(price);
  if (isNaN(num)) return '0';
  return num.toLocaleString('en-NG');
}

/**
 * Validates product record before saving.
 */
export function validateProductData(product: Partial<Product>): { isValid: boolean; error?: string } {
  if (!product.name || !product.name.trim()) {
    return { isValid: false, error: 'Product title is required.' };
  }
  const priceNum = Number(product.price);
  if (isNaN(priceNum) || priceNum <= 0) {
    return { isValid: false, error: 'Product price must be a valid positive amount in Naira.' };
  }
  if (!Array.isArray(product.images) || product.images.length === 0) {
    return { isValid: false, error: 'Please upload at least 1 product image.' };
  }
  return { isValid: true };
}
