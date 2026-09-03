import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { Vendor, Product, IkoroduArea } from '../types';
import {
  calculateDistanceKm,
  formatDistance,
  getEntityCoordinates,
  GeoCoordinate,
} from '../utils/ikoroduLocations';

export interface SearchVendorResult {
  id: string;
  businessName: string;
  slug: string;
  category: string;
  subcategory: string;
  description: string;
  area: IkoroduArea;
  address?: string;
  logoUrl: string;
  isVerified: boolean;
  isFeatured: boolean;
  isPremium: boolean;
  rating: number;
  reviewCount: number;
  distanceKm?: number;
  distanceLabel?: string;
  relevanceScore: number;
}

export interface SearchProductResult {
  id: string;
  vendorId: string;
  vendorName: string;
  vendorArea: IkoroduArea;
  name: string;
  slug: string;
  description: string;
  price: number;
  salePrice?: number;
  category: string;
  subcategory?: string;
  tags?: string[];
  imageUrl: string;
  isFeatured: boolean;
  distanceKm?: number;
  distanceLabel?: string;
  relevanceScore: number;
}

export interface SearchResultsPayload {
  vendors: SearchVendorResult[];
  products: SearchProductResult[];
  totalMatches: number;
  query: string;
  isNearMeActive: boolean;
  userLocation: GeoCoordinate | null;
  radiusKm: number;
}

export interface SearchOptions {
  query: string;
  selectedArea?: IkoroduArea | 'All';
  isNearMeActive?: boolean;
  userLocation?: GeoCoordinate | null;
  radiusKm?: number;
  cachedVendors?: Vendor[];
  cachedProducts?: Product[];
  signal?: AbortSignal;
}

// Synonyms and semantic expansions for local Ikorodu marketplace searches
const SEARCH_EXPANSIONS: Record<string, string[]> = {
  cake: ['bakery', 'baker', 'pastry', 'catering', 'confectionery', 'cupcake', 'snacks'],
  bakery: ['cake', 'bread', 'pastry', 'meatpie', 'shawarma', 'doughnut'],
  bread: ['bakery', 'butter bread', 'sliced bread'],
  solar: ['inverter', 'battery', 'panel', 'renewable', 'energy', 'generator', 'power', 'installation'],
  inverter: ['solar', 'battery', 'panel', 'backup', 'power'],
  phone: ['mobile', 'smartphone', 'iphone', 'samsung', 'gadget', 'screen', 'charger', 'accessories', 'repair'],
  fashion: ['clothing', 'tailor', 'boutique', 'fabric', 'lace', 'ankara', 'dress', 'wear', 'shoes', 'sewing'],
  tailor: ['fashion', 'designer', 'seamstress', 'alteration', 'sewing', 'suit', 'agbada'],
  plumber: ['plumbing', 'pipe', 'leak', 'drainage', 'borehole', 'water', 'tank', 'fitting', 'tap'],
  food: ['restaurant', 'canteen', 'kitchen', 'eatery', 'groceries', 'soup', 'rice', 'shawarma', 'delivery'],
  car: ['automobile', 'mechanic', 'auto', 'spare parts', 'tyre', 'battery', 'oil'],
  hair: ['salon', 'barber', 'braids', 'wig', 'weave', 'dreadlocks', 'beauty'],
  beauty: ['salon', 'makeup', 'skincare', 'spa', 'nails', 'pedicure', 'manicure'],
};

/**
 * Calculates a multi-factor relevance score for an entity based on search query.
 */
function calculateRelevance(
  name: string,
  category: string,
  subcategory: string,
  description: string,
  tags: string[],
  area: string,
  isVerified: boolean,
  isFeatured: boolean,
  rating: number,
  reviewCount: number,
  tokens: string[],
  expandedTokens: string[],
  normalizedRawQuery: string
): number {
  let score = 0;
  const nameNorm = (name || '').toLowerCase();
  const catNorm = (category || '').toLowerCase();
  const subNorm = (subcategory || '').toLowerCase();
  const descNorm = (description || '').toLowerCase();
  const areaNorm = (area || '').toLowerCase();
  const tagsNorm = tags.map((t) => t.toLowerCase());

  // 1. Exact full query match on Name
  if (nameNorm === normalizedRawQuery) {
    score += 150;
  } else if (nameNorm.startsWith(normalizedRawQuery)) {
    score += 90;
  } else if (nameNorm.includes(normalizedRawQuery)) {
    score += 65;
  }

  // 2. Tokenized matching
  for (const token of tokens) {
    if (!token) continue;

    // Direct token hits in Name
    if (nameNorm === token) {
      score += 60;
    } else if (nameNorm.startsWith(token + ' ') || nameNorm.includes(' ' + token + ' ')) {
      score += 45;
    } else if (nameNorm.includes(token)) {
      score += 30;
    }

    // Category / Subcategory hits
    if (catNorm === token) {
      score += 40;
    } else if (catNorm.includes(token)) {
      score += 25;
    }

    if (subNorm && subNorm.includes(token)) {
      score += 30;
    }

    // Tags hits
    if (tagsNorm.some((t) => t === token)) {
      score += 35;
    } else if (tagsNorm.some((t) => t.includes(token))) {
      score += 20;
    }

    // Description hits
    if (descNorm.includes(token)) {
      score += 15;
    }

    // Area match
    if (areaNorm.includes(token)) {
      score += 20;
    }
  }

  // 3. Semantic expansions (e.g. "solar" -> matches "inverter")
  for (const exp of expandedTokens) {
    if (nameNorm.includes(exp)) score += 25;
    if (catNorm.includes(exp) || subNorm.includes(exp)) score += 20;
    if (tagsNorm.some((t) => t.includes(exp))) score += 18;
    if (descNorm.includes(exp)) score += 10;
  }

  // 4. Quality & Trust boosts
  if (isVerified) score += 15;
  if (isFeatured) score += 10;
  if (rating > 0) score += Math.min(10, Math.round(rating * 2));
  if (reviewCount > 0) score += Math.min(5, reviewCount);

  return score;
}

/**
 * Performs server-side Supabase smart search when configured,
 * selecting ONLY public fields (strictly avoiding SELECT * and private documents).
 */
async function searchSupabaseServer(
  tokens: string[],
  selectedArea?: string,
  signal?: AbortSignal
): Promise<{ vendors: any[]; products: any[] } | null> {
  if (!isSupabaseConfigured()) return null;

  try {
    // Only request public non-sensitive columns
    const vendorFields =
      'id, business_name, slug, category, subcategory, description, area, address, logo_url, is_verified, is_featured, is_premium, rating, review_count, status';

    let vendorQuery = supabase
      .from('vendors')
      .select(vendorFields)
      .eq('status', 'approved');

    if (selectedArea && selectedArea !== 'All') {
      vendorQuery = vendorQuery.eq('area', selectedArea);
    }

    if (tokens.length > 0) {
      const orConditions: string[] = [];
      for (const t of tokens.slice(0, 3)) {
        orConditions.push(
          `business_name.ilike.%${t}%,category.ilike.%${t}%,subcategory.ilike.%${t}%,description.ilike.%${t}%,area.ilike.%${t}%`
        );
      }
      vendorQuery = vendorQuery.or(orConditions.join(','));
    }
    vendorQuery = vendorQuery.limit(30);

    // Products query
    const productFields =
      'id, vendor_id, vendor_name, vendor_area, name, slug, description, price, sale_price, category, subcategory, tags, images, is_featured, status';

    let productQuery = supabase
      .from('products')
      .select(productFields)
      .eq('status', 'approved');

    if (selectedArea && selectedArea !== 'All') {
      productQuery = productQuery.eq('vendor_area', selectedArea);
    }

    if (tokens.length > 0) {
      const orConditions: string[] = [];
      for (const t of tokens.slice(0, 3)) {
        orConditions.push(
          `name.ilike.%${t}%,category.ilike.%${t}%,subcategory.ilike.%${t}%,description.ilike.%${t}%,vendor_name.ilike.%${t}%,vendor_area.ilike.%${t}%`
        );
      }
      productQuery = productQuery.or(orConditions.join(','));
    }
    productQuery = productQuery.limit(30);

    const [vRes, pRes] = await Promise.all([
      signal ? (vendorQuery as any).abortSignal(signal) : vendorQuery,
      signal ? (productQuery as any).abortSignal(signal) : productQuery,
    ]);

    if (vRes.error || pRes.error) {
      console.warn('Supabase search queries returned error, using fallback:', vRes.error || pRes.error);
      return null;
    }

    return {
      vendors: vRes.data || [],
      products: pRes.data || [],
    };
  } catch (err: any) {
    if (err?.name === 'AbortError') throw err;
    console.warn('Error executing server search, falling back:', err);
    return null;
  }
}

/**
 * Main Smart Search Engine
 * Combines full-text/keyword matching, intelligent ranking, and GPS distance scoring.
 */
export async function executeGlobalSearch(options: SearchOptions): Promise<SearchResultsPayload> {
  const rawQuery = (options.query || '').trim();
  const normalizedRawQuery = rawQuery.toLowerCase();
  const isNearMeActive = Boolean(options.isNearMeActive && options.userLocation);
  const radiusKm = options.radiusKm || 5;
  const userLoc = options.userLocation || null;

  // Split into tokens
  const tokens = normalizedRawQuery
    .split(/[\s,+/_-]+/)
    .map((t) => t.trim())
    .filter((t) => t.length > 1);

  // Expand tokens with semantic domain synonyms
  const expandedTokens: string[] = [];
  for (const t of tokens) {
    if (SEARCH_EXPANSIONS[t]) {
      expandedTokens.push(...SEARCH_EXPANSIONS[t]);
    }
  }

  // Attempt server-side fetch if Supabase is active
  let remoteData: { vendors: any[]; products: any[] } | null = null;
  if (isSupabaseConfigured() && (tokens.length > 0 || options.selectedArea !== 'All')) {
    remoteData = await searchSupabaseServer(tokens, options.selectedArea, options.signal);
  }

  // Source candidates: prioritize server results or fallback to cached application memory
  let candidateVendors: any[] = [];
  let candidateProducts: any[] = [];

  if (remoteData) {
    candidateVendors = remoteData.vendors;
    candidateProducts = remoteData.products;
  } else {
    candidateVendors = (options.cachedVendors || []).filter((v) => v.status === 'approved');
    candidateProducts = (options.cachedProducts || []).filter((p) => p.status === 'approved');
  }

  // Filter & Score Vendors
  const scoredVendors: SearchVendorResult[] = [];

  for (const v of candidateVendors) {
    // Area filter if explicitly set
    if (options.selectedArea && options.selectedArea !== 'All' && v.area !== options.selectedArea) {
      continue;
    }

    // Distance calculation for Near Me
    let distanceKm: number | undefined;
    let distanceLabel: string | undefined;

    if (userLoc) {
      const vendorCoords = getEntityCoordinates(v.area, v.latitude, v.longitude);
      distanceKm = calculateDistanceKm(
        userLoc.latitude,
        userLoc.longitude,
        vendorCoords.latitude,
        vendorCoords.longitude
      );
      distanceLabel = formatDistance(distanceKm);

      // If Near Me is active and item exceeds radius limit, exclude it
      if (isNearMeActive && distanceKm > radiusKm) {
        continue;
      }
    }

    const businessName = v.business_name || v.businessName || '';
    const category = v.category || '';
    const subcategory = v.subcategory || '';
    const description = v.description || '';
    const area = v.area || '';
    const isVerified = Boolean(v.is_verified ?? v.isVerified);
    const isFeatured = Boolean(v.is_featured ?? v.isFeatured);
    const isPremium = Boolean(v.is_premium ?? v.isPremium);
    const rating = Number(v.rating) || 0;
    const reviewCount = Number(v.review_count ?? v.reviewCount) || 0;

    let score = 0;
    if (tokens.length === 0) {
      // Near Me only (no search text): base score on ratings & verification
      score = isNearMeActive ? 50 + (isVerified ? 20 : 0) + rating : 10;
    } else {
      score = calculateRelevance(
        businessName,
        category,
        subcategory,
        description,
        [],
        area,
        isVerified,
        isFeatured,
        rating,
        reviewCount,
        tokens,
        expandedTokens,
        normalizedRawQuery
      );
    }

    // Must have matching score if query is present
    if (tokens.length > 0 && score <= 5) {
      continue;
    }

    scoredVendors.push({
      id: v.id,
      businessName,
      slug: v.slug || v.id,
      category,
      subcategory,
      description,
      area: area as IkoroduArea,
      address: v.address || '',
      logoUrl: v.logo_url || v.logoUrl || 'https://images.unsplash.com/photo-1556740738-b6a63e27c4df?w=150',
      isVerified,
      isFeatured,
      isPremium,
      rating,
      reviewCount,
      distanceKm,
      distanceLabel,
      relevanceScore: score,
    });
  }

  // Filter & Score Products
  const scoredProducts: SearchProductResult[] = [];

  for (const p of candidateProducts) {
    const vendorArea = p.vendor_area || p.vendorArea || '';

    // Area filter if explicitly set
    if (options.selectedArea && options.selectedArea !== 'All' && vendorArea !== options.selectedArea) {
      continue;
    }

    let distanceKm: number | undefined;
    let distanceLabel: string | undefined;

    if (userLoc) {
      const productCoords = getEntityCoordinates(vendorArea);
      distanceKm = calculateDistanceKm(
        userLoc.latitude,
        userLoc.longitude,
        productCoords.latitude,
        productCoords.longitude
      );
      distanceLabel = formatDistance(distanceKm);

      if (isNearMeActive && distanceKm > radiusKm) {
        continue;
      }
    }

    const name = p.name || '';
    const category = p.category || '';
    const subcategory = p.subcategory || '';
    const description = p.description || '';
    const tags = Array.isArray(p.tags) ? p.tags : [];
    const isFeatured = Boolean(p.is_featured ?? p.isFeatured);

    let score = 0;
    if (tokens.length === 0) {
      score = isNearMeActive ? 40 + (isFeatured ? 10 : 0) : 10;
    } else {
      score = calculateRelevance(
        name,
        category,
        subcategory,
        description,
        tags,
        vendorArea,
        false,
        isFeatured,
        0,
        0,
        tokens,
        expandedTokens,
        normalizedRawQuery
      );
    }

    if (tokens.length > 0 && score <= 5) {
      continue;
    }

    const images = Array.isArray(p.images) ? p.images : [];
    const imageUrl =
      images[0] ||
      p.image_url ||
      'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=150';

    scoredProducts.push({
      id: p.id,
      vendorId: p.vendor_id || p.vendorId,
      vendorName: p.vendor_name || p.vendorName || 'Verified Vendor',
      vendorArea: vendorArea as IkoroduArea,
      name,
      slug: p.slug || p.id,
      description,
      price: Number(p.price) || 0,
      salePrice: p.sale_price ? Number(p.sale_price) : undefined,
      category,
      subcategory,
      tags,
      imageUrl,
      isFeatured,
      distanceKm,
      distanceLabel,
      relevanceScore: score,
    });
  }

  // Sort logic:
  // If Near Me is active: sort primarily by nearest distance first, then relevance score
  // If Near Me is off: sort primarily by highest relevance score
  if (isNearMeActive) {
    scoredVendors.sort((a, b) => {
      const distA = a.distanceKm ?? 9999;
      const distB = b.distanceKm ?? 9999;
      if (Math.abs(distA - distB) > 0.3) {
        return distA - distB;
      }
      return b.relevanceScore - a.relevanceScore;
    });

    scoredProducts.sort((a, b) => {
      const distA = a.distanceKm ?? 9999;
      const distB = b.distanceKm ?? 9999;
      if (Math.abs(distA - distB) > 0.3) {
        return distA - distB;
      }
      return b.relevanceScore - a.relevanceScore;
    });
  } else {
    scoredVendors.sort((a, b) => b.relevanceScore - a.relevanceScore);
    scoredProducts.sort((a, b) => b.relevanceScore - a.relevanceScore);
  }

  return {
    vendors: scoredVendors.slice(0, 15),
    products: scoredProducts.slice(0, 20),
    totalMatches: scoredVendors.length + scoredProducts.length,
    query: rawQuery,
    isNearMeActive,
    userLocation: userLoc,
    radiusKm,
  };
}
