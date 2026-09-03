import React from 'react';
import {
  ShieldCheck,
  Star,
  MapPin,
  Store,
  ShoppingBag,
  ArrowRight,
  Navigation,
  AlertCircle,
  Loader2,
  X,
  Sliders,
} from 'lucide-react';
import {
  SearchResultsPayload,
  SearchVendorResult,
  SearchProductResult,
} from '../services/searchService';

interface SmartSearchDropdownProps {
  isOpen: boolean;
  isLoading: boolean;
  query: string;
  results: SearchResultsPayload | null;
  isNearMeActive: boolean;
  nearMeRadiusKm: number;
  setNearMeRadiusKm: (radius: number) => void;
  locationStatus: 'idle' | 'prompting' | 'active' | 'denied' | 'unavailable';
  locationError: string | null;
  onSelectVendor: (id: string, slug?: string) => void;
  onSelectProduct: (id: string) => void;
  onViewAllMarketplace: () => void;
  onViewAllDirectory: () => void;
  onClose: () => void;
}

const RADIUS_OPTIONS = [1, 3, 5, 10, 20];

export const SmartSearchDropdown: React.FC<SmartSearchDropdownProps> = ({
  isOpen,
  isLoading,
  query,
  results,
  isNearMeActive,
  nearMeRadiusKm,
  setNearMeRadiusKm,
  locationStatus,
  locationError,
  onSelectVendor,
  onSelectProduct,
  onViewAllMarketplace,
  onViewAllDirectory,
  onClose,
}) => {
  if (!isOpen) return null;

  const cleanQuery = query.trim();
  const vendors: SearchVendorResult[] = results?.vendors || [];
  const products: SearchProductResult[] = results?.products || [];
  const totalCount = vendors.length + products.length;

  return (
    <div
      id="smart-search-dropdown-menu"
      className="absolute left-0 right-0 top-full mt-2 bg-white rounded-2xl shadow-2xl border border-slate-200/90 z-50 overflow-hidden text-xs max-h-[85vh] sm:max-h-[75vh] flex flex-col animate-in fade-in zoom-in-95 duration-150"
    >
      {/* Top Status Bar: Near Me and Radius indicators */}
      {isNearMeActive && (
        <div className="bg-emerald-50/90 border-b border-emerald-100 px-3 py-2 flex flex-wrap items-center justify-between gap-2 shrink-0">
          <div className="flex items-center gap-1.5 text-emerald-900 font-bold text-[11px]">
            <Navigation className="w-3.5 h-3.5 text-emerald-600 animate-pulse fill-emerald-600 shrink-0" />
            <span>Sorted by nearest to you in Ikorodu</span>
          </div>

          <div className="flex items-center gap-1">
            <span className="text-[10px] text-emerald-700 font-semibold mr-1">Radius:</span>
            {RADIUS_OPTIONS.map((r) => (
              <button
                key={r}
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setNearMeRadiusKm(r);
                }}
                className={`px-1.5 py-0.5 rounded-md text-[10px] font-bold transition-colors ${
                  nearMeRadiusKm === r
                    ? 'bg-emerald-700 text-white shadow-xs'
                    : 'bg-white text-emerald-800 hover:bg-emerald-100 border border-emerald-200'
                }`}
              >
                {r}km
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Geolocation Notice (if denied or unavailable) */}
      {locationStatus === 'denied' && (
        <div className="bg-amber-50 border-b border-amber-100 px-3 py-2 text-[11px] text-amber-900 flex items-start gap-2 shrink-0">
          <AlertCircle className="w-3.5 h-3.5 text-amber-600 mt-0.5 shrink-0" />
          <div className="flex-1">
            <span className="font-semibold">Location access was denied.</span> You can still search
            IkoroduSquare normally, or select a community area from the dropdown.
          </div>
        </div>
      )}

      {/* Scrollable Content Container */}
      <div className="overflow-y-auto divide-y divide-slate-100 p-2 space-y-3 flex-1">
        {/* SKELETON / LOADING STATE */}
        {isLoading && (
          <div className="p-4 space-y-3">
            <div className="flex items-center gap-2 text-emerald-700 text-xs font-bold animate-pulse mb-2">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Searching verified Ikorodu businesses and marketplace items...</span>
            </div>

            {/* Skeleton rows */}
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center gap-3 p-2 rounded-xl bg-slate-50/70 animate-pulse">
                <div className="w-10 h-10 bg-slate-200 rounded-xl shrink-0" />
                <div className="flex-1 space-y-1.5">
                  <div className="h-3.5 bg-slate-200 rounded-md w-1/2" />
                  <div className="h-2.5 bg-slate-200 rounded-md w-3/4" />
                </div>
                <div className="w-12 h-4 bg-slate-200 rounded-md" />
              </div>
            ))}
          </div>
        )}

        {/* RESULTS READY */}
        {!isLoading && totalCount > 0 && (
          <>
            {/* BUSINESSES SECTION */}
            {vendors.length > 0 && (
              <div>
                <div className="px-3 py-1.5 font-extrabold text-[10px] text-emerald-900 uppercase tracking-wider bg-emerald-50 rounded-xl mb-1.5 flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <Store className="w-3.5 h-3.5 text-emerald-700" />
                    <span>Businesses & Services ({vendors.length})</span>
                  </div>
                  {isNearMeActive && (
                    <span className="text-[9px] text-emerald-700 font-bold">Within {nearMeRadiusKm}km</span>
                  )}
                </div>

                <div className="space-y-1">
                  {vendors.map((v) => (
                    <div
                      key={v.id}
                      onClick={() => onSelectVendor(v.id, v.slug)}
                      className="flex items-center gap-3 p-2 hover:bg-emerald-50/60 rounded-xl cursor-pointer transition-colors group"
                    >
                      <img
                        src={v.logoUrl}
                        alt={v.businessName}
                        className="w-10 h-10 rounded-xl object-cover border border-slate-200 shrink-0 bg-slate-50"
                        loading="lazy"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-slate-900 group-hover:text-emerald-800 truncate text-xs">
                            {v.businessName}
                          </span>
                          {v.isVerified && (
                            <span title="Verified Business">
                              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                            </span>
                          )}
                          {v.rating > 0 && (
                            <span className="flex items-center text-[10px] text-amber-700 font-bold bg-amber-50 px-1.5 py-0.5 rounded-md">
                              <Star className="w-2.5 h-2.5 text-amber-500 fill-amber-500 mr-0.5" />
                              {v.rating.toFixed(1)}
                            </span>
                          )}
                        </div>

                        <p className="text-[10px] text-slate-500 truncate flex items-center gap-1 mt-0.5">
                          <span className="text-slate-600">{v.category}</span>
                          {v.subcategory && <span>• {v.subcategory}</span>}
                          <span>•</span>
                          <span className="text-emerald-700 font-semibold flex items-center gap-0.5">
                            <MapPin className="w-2.5 h-2.5" /> {v.area}
                          </span>
                        </p>
                      </div>

                      <div className="text-right shrink-0 flex flex-col items-end gap-1">
                        {v.distanceLabel && (
                          <span className="inline-flex items-center gap-1 text-[10px] font-extrabold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-md">
                            <Navigation className="w-2.5 h-2.5 text-emerald-700 fill-emerald-700" />
                            {v.distanceLabel}
                          </span>
                        )}
                        <span className="text-[10px] bg-slate-100 text-slate-700 font-bold px-2 py-0.5 rounded-md group-hover:bg-emerald-700 group-hover:text-white transition-colors">
                          Storefront →
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* PRODUCTS SECTION */}
            {products.length > 0 && (
              <div>
                <div className="px-3 py-1.5 font-extrabold text-[10px] text-amber-950 uppercase tracking-wider bg-amber-50/90 rounded-xl mb-1.5 flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <ShoppingBag className="w-3.5 h-3.5 text-amber-700" />
                    <span>Marketplace Products ({products.length})</span>
                  </div>
                  {isNearMeActive && (
                    <span className="text-[9px] text-amber-800 font-bold">Closest first</span>
                  )}
                </div>

                <div className="space-y-1">
                  {products.map((p) => (
                    <div
                      key={p.id}
                      onClick={() => onSelectProduct(p.id)}
                      className="flex items-center gap-3 p-2 hover:bg-amber-50/50 rounded-xl cursor-pointer transition-colors group"
                    >
                      <img
                        src={p.imageUrl}
                        alt={p.name}
                        className="w-10 h-10 rounded-xl object-cover border border-slate-200 shrink-0 bg-slate-50"
                        loading="lazy"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-slate-900 group-hover:text-emerald-800 truncate text-xs">
                          {p.name}
                        </p>
                        <p className="text-[10px] text-slate-500 truncate mt-0.5">
                          By <span className="font-semibold text-slate-700">{p.vendorName}</span> in{' '}
                          <span className="text-emerald-700 font-semibold">{p.vendorArea}</span>
                        </p>
                      </div>

                      <div className="text-right shrink-0 flex flex-col items-end gap-1">
                        <span className="font-mono font-black text-xs text-emerald-950">
                          ₦{p.price.toLocaleString()}
                        </span>
                        {p.distanceLabel && (
                          <span className="text-[9px] text-slate-500 font-medium flex items-center gap-0.5">
                            <Navigation className="w-2 h-2 text-emerald-600" />
                            {p.distanceLabel}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}

        {/* EMPTY STATE (Only shown when request completed AND zero results) */}
        {!isLoading && totalCount === 0 && (
          <div className="p-6 text-center space-y-3">
            <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mx-auto text-slate-400">
              {isNearMeActive ? <Navigation className="w-6 h-6 text-emerald-600" /> : <Store className="w-6 h-6" />}
            </div>

            <div>
              <p className="font-bold text-slate-800 text-sm">
                {isNearMeActive
                  ? cleanQuery
                    ? `No nearby businesses or products match "${cleanQuery}" within ${nearMeRadiusKm} km.`
                    : `No businesses found near your location within ${nearMeRadiusKm} km.`
                  : `No businesses or products found for "${cleanQuery}".`}
              </p>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                {isNearMeActive
                  ? 'Try expanding your distance radius or search without location filtering to see all Ikorodu listings.'
                  : 'Try checking your spelling, using broader keywords (like "cake", "solar", "tailor"), or searching in All Areas.'}
              </p>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
              {isNearMeActive && nearMeRadiusKm < 20 && (
                <button
                  type="button"
                  onClick={() => setNearMeRadiusKm(20)}
                  className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-900 font-bold text-xs rounded-xl border border-emerald-200 transition-colors"
                >
                  Expand to 20 km
                </button>
              )}
              <button
                type="button"
                onClick={onViewAllDirectory}
                className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-xl transition-colors"
              >
                Browse All Businesses
              </button>
              <button
                type="button"
                onClick={onViewAllMarketplace}
                className="px-3 py-1.5 bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-xs rounded-xl shadow-xs transition-colors"
              >
                Explore Marketplace
              </button>
            </div>
          </div>
        )}
      </div>

      {/* FOOTER ACTIONS */}
      {!isLoading && totalCount > 0 && (
        <div className="p-2.5 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-2 shrink-0">
          <button
            type="button"
            onClick={onViewAllDirectory}
            className="flex-1 py-2 px-3 bg-white hover:bg-slate-100 text-slate-800 font-bold text-xs rounded-xl border border-slate-200 text-center flex items-center justify-center gap-1.5 transition-colors"
          >
            <Store className="w-3.5 h-3.5 text-emerald-700" />
            <span>View All Stores</span>
          </button>
          <button
            type="button"
            onClick={onViewAllMarketplace}
            className="flex-1 py-2 px-3 bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-xs rounded-xl text-center flex items-center justify-center gap-1.5 shadow-xs transition-colors"
          >
            <ShoppingBag className="w-3.5 h-3.5 text-amber-300" />
            <span>Marketplace ({products.length > 0 ? products.length : 'All'})</span>
            <ArrowRight className="w-3 h-3 text-white" />
          </button>
        </div>
      )}
    </div>
  );
};
