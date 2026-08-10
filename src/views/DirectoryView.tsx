import React, { useState } from 'react';
import {
  Search,
  MapPin,
  Filter,
  Star,
  CheckCircle2,
  Sparkles,
  Phone,
  MessageSquare,
  Building2,
  SlidersHorizontal,
  Grid,
  List,
  Clock,
  ArrowRight,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { IkoroduArea } from '../types';
import { IKORODU_AREAS } from '../data/mockData';
import { WhatsAppChatButton } from '../components/WhatsAppChatButton';
import { VendorSkeletonCard } from '../components/VendorSkeletonCard';
import { VendorFeatureBadge } from '../components/VendorFeatureBadge';
import { useSEO } from '../hooks/useSEO';
import { Vendor, VendorFeature } from '../types';

export const DirectoryView: React.FC = () => {
  const {
    vendors,
    categories,
    isLoadingData,
    searchQuery,
    setSearchQuery,
    selectedCategory,
    setSelectedCategory,
    selectedArea,
    setSelectedArea,
    setActiveTab,
    setSelectedVendorId,
    trackVendorWhatsAppClick,
    trackVendorPhoneClick,
  } = useApp();

  const [selectedSubcategory, setSelectedSubcategory] = useState<string>('');
  const [onlyVerified, setOnlyVerified] = useState<boolean>(false);
  const [onlyFeatured, setOnlyFeatured] = useState<boolean>(false);

  useSEO({
    title: selectedCategory !== 'All' 
      ? `${selectedCategory} Businesses in Ikorodu, Lagos` 
      : 'Ikorodu Business Directory & Local Vendors',
    description: `Browse verified ${selectedCategory !== 'All' ? selectedCategory : 'local'} businesses, stores, and service providers across Sabo, Ebute, Agric, and Ikorodu Central, Lagos State.`,
    keywords: `Ikorodu business directory, ${selectedCategory} Ikorodu, Sabo shops, Ebute businesses, local vendors Ikorodu`,
  });
  const [minRating, setMinRating] = useState<number>(0);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const ikoroduAreas: (IkoroduArea | 'All')[] = ['All', ...IKORODU_AREAS];

  // Filter approved vendors
  const approvedVendors = vendors.filter((v) => v.status === 'approved');

  const filteredVendors = approvedVendors.filter((v) => {
    // Area filter
    if (selectedArea !== 'All' && v.area !== selectedArea) return false;

    // Category filter
    if (selectedCategory && v.category !== selectedCategory) return false;

    // Subcategory filter
    if (selectedSubcategory && v.subcategory !== selectedSubcategory) return false;

    // Verified filter
    if (onlyVerified && !v.isVerified) return false;

    // Featured filter
    if (onlyFeatured && !v.isFeatured) return false;

    // Rating filter
    if (minRating > 0 && v.rating < minRating) return false;

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = v.businessName.toLowerCase().includes(q);
      const matchCat = v.category.toLowerCase().includes(q);
      const matchSub = v.subcategory.toLowerCase().includes(q);
      const matchDesc = v.description.toLowerCase().includes(q);
      const matchArea = v.area.toLowerCase().includes(q);
      return matchName || matchCat || matchSub || matchDesc || matchArea;
    }

    return true;
  });

  const handleVendorClick = (id: string) => {
    setSelectedVendorId(id);
    setActiveTab('vendor-details');
  };

  const selectedCategoryObj = categories.find((c) => c.name === selectedCategory);

  return (
    <div className="space-y-6 pb-12">
      {/* Directory Page Header */}
      <div className="bg-gradient-to-r from-emerald-900 to-teal-900 text-white rounded-3xl p-6 sm:p-8 shadow-lg">
        <div className="max-w-3xl space-y-2">
          <span className="text-amber-400 font-extrabold text-xs uppercase tracking-widest">
            Ikorodu Directory & Storefronts
          </span>
          <h1 className="text-2xl sm:text-4xl font-black font-display">
            Find Trusted Local Businesses
          </h1>
          <p className="text-xs sm:text-sm text-emerald-100/90">
            Search verified artisans, stores, bakeries, mechanics, solar technicians, and service providers in Ikorodu, Lagos.
          </p>
        </div>
      </div>

      {/* Main Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-gray-150 shadow-sm space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
          {/* Search Text */}
          <div className="md:col-span-5 relative">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Search vendor name, service, or keyword..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium text-emerald-950 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
            />
          </div>

          {/* Area Filter */}
          <div className="md:col-span-3 flex items-center bg-gray-50 border border-gray-200 rounded-xl px-3">
            <MapPin className="w-4 h-4 text-emerald-600 shrink-0 mr-2" />
            <select
              value={selectedArea}
              onChange={(e) => setSelectedArea(e.target.value as any)}
              className="w-full bg-transparent text-xs font-bold text-emerald-950 py-2 focus:outline-none cursor-pointer"
            >
              {ikoroduAreas.map((area) => (
                <option key={area} value={area}>
                  {area === 'All' ? 'All Ikorodu Areas' : area}
                </option>
              ))}
            </select>
          </div>

          {/* Category Filter */}
          <div className="md:col-span-4 flex items-center bg-gray-50 border border-gray-200 rounded-xl px-3">
            <Filter className="w-4 h-4 text-emerald-600 shrink-0 mr-2" />
            <select
              value={selectedCategory}
              onChange={(e) => {
                setSelectedCategory(e.target.value);
                setSelectedSubcategory('');
              }}
              className="w-full bg-transparent text-xs font-bold text-emerald-950 py-2 focus:outline-none cursor-pointer"
            >
              <option value="">All Categories</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.name}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Subcategory & Quick Badges */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-gray-100 text-xs">
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setOnlyVerified(!onlyVerified)}
              className={`px-3 py-1.5 rounded-xl font-bold flex items-center gap-1 transition-colors ${
                onlyVerified
                  ? 'bg-emerald-700 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5 text-amber-300" />
              <span>Verified Only</span>
            </button>

            <button
              onClick={() => setOnlyFeatured(!onlyFeatured)}
              className={`px-3 py-1.5 rounded-xl font-bold flex items-center gap-1 transition-colors ${
                onlyFeatured
                  ? 'bg-amber-400 text-emerald-950'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Featured Only</span>
            </button>

            {selectedCategoryObj && selectedCategoryObj.subcategories.length > 0 && (
              <select
                value={selectedSubcategory}
                onChange={(e) => setSelectedSubcategory(e.target.value)}
                className="px-3 py-1.5 bg-emerald-50 border border-emerald-200 text-emerald-950 font-bold rounded-xl text-xs focus:outline-none"
              >
                <option value="">All {selectedCategoryObj.name} Subcategories</option>
                {selectedCategoryObj.subcategories.map((sub) => (
                  <option key={sub} value={sub}>
                    {sub}
                  </option>
                ))}
              </select>
            )}
          </div>

          <div className="flex items-center gap-2">
            <span className="text-gray-500 font-medium">
              Showing <strong>{filteredVendors.length}</strong> businesses
            </span>
            <div className="flex items-center bg-gray-100 p-0.5 rounded-lg border border-gray-200">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded-md ${viewMode === 'grid' ? 'bg-white shadow text-emerald-800' : 'text-gray-500'}`}
              >
                <Grid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-1.5 rounded-md ${viewMode === 'list' ? 'bg-white shadow text-emerald-800' : 'text-gray-500'}`}
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Directory Grid View / Skeleton Loading */}
      {isLoadingData ? (
        viewMode === 'grid' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, idx) => (
              <VendorSkeletonCard key={idx} viewMode="grid" />
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, idx) => (
              <VendorSkeletonCard key={idx} viewMode="list" />
            ))}
          </div>
        )
      ) : filteredVendors.length === 0 ? (
        <div className="bg-white p-12 rounded-3xl text-center border border-gray-200 space-y-3">
          <Building2 className="w-12 h-12 text-gray-300 mx-auto" />
          <h3 className="text-lg font-bold text-emerald-950">No Businesses Found</h3>
          <p className="text-xs text-gray-500 max-w-sm mx-auto">
            Try adjusting your search keywords, area filter, or clearing subcategories.
          </p>
          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedCategory('');
              setSelectedArea('All');
              setOnlyVerified(false);
              setOnlyFeatured(false);
            }}
            className="px-4 py-2 bg-emerald-800 text-white rounded-xl text-xs font-bold"
          >
            Reset Filters
          </button>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredVendors.map((vendor) => {
            const features = (vendor.features && vendor.features.length > 0)
              ? vendor.features
              : [
                  ...(vendor.isVerified ? ['Verified Business' as VendorFeature] : []),
                  ...(vendor.isPremium ? ['Premium Vendor' as VendorFeature] : []),
                  ...(vendor.isFeatured ? ['Featured Vendor' as VendorFeature] : []),
                ];

            return (
              <div
                key={vendor.id}
                className="bg-white rounded-3xl border border-gray-150 overflow-hidden shadow-sm hover:shadow-xl transition-all flex flex-col justify-between group"
              >
                <div>
                  <div className="relative h-44 overflow-hidden bg-gray-100">
                    <img
                      src={vendor.coverImageUrl}
                      alt={vendor.businessName}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

                    <div className="absolute top-3 left-3 flex flex-wrap gap-1 max-w-[80%]">
                      {features.slice(0, 3).map((feat) => (
                        <VendorFeatureBadge key={feat} feature={feat} size="sm" />
                      ))}
                      {features.length > 3 && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-900/80 text-white backdrop-blur-xs">
                          +{features.length - 3} more
                        </span>
                      )}
                    </div>

                    <span className="absolute bottom-3 right-3 px-2 py-1 bg-black/60 backdrop-blur-md text-white text-[10px] font-semibold rounded-lg flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-amber-400" /> {vendor.area}
                    </span>
                  </div>

                  <div className="p-5 space-y-3">
                    <div className="flex items-start gap-3">
                      <img
                        src={vendor.logoUrl}
                        alt={vendor.businessName}
                        className="w-12 h-12 rounded-2xl object-cover border-2 border-white shadow-md -mt-8 relative z-10 bg-white"
                      />
                      <div className="flex-1 min-w-0">
                        <h3
                          onClick={() => handleVendorClick(vendor.id)}
                          className="font-black text-base text-emerald-950 hover:text-emerald-700 cursor-pointer transition-colors truncate font-display"
                        >
                          {vendor.businessName}
                        </h3>
                        <p className="text-xs text-emerald-800 font-medium">
                          {vendor.category} • {vendor.subcategory}
                        </p>
                      </div>
                    </div>

                    <p className="text-xs text-gray-600 line-clamp-2 leading-relaxed">
                      {vendor.description}
                    </p>

                    <div className="flex items-center justify-between text-xs pt-2 border-t border-gray-100">
                      <div className="flex items-center gap-1 text-amber-500 font-bold">
                        <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                        <span>{vendor.rating > 0 ? vendor.rating : 'New'}</span>
                        <span className="text-gray-400 font-normal">({vendor.reviewCount})</span>
                      </div>

                      <span className="text-[11px] text-gray-500">{vendor.yearsInBusiness} yrs in business</span>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-gray-50/80 border-t border-gray-100 flex items-center gap-2">
                  <button
                    onClick={() => handleVendorClick(vendor.id)}
                    className="flex-1 py-2 text-xs font-bold text-emerald-950 bg-emerald-100 hover:bg-emerald-200 rounded-xl transition-colors text-center"
                  >
                    View Storefront
                  </button>
                  <WhatsAppChatButton
                    whatsappNumber={vendor.whatsapp}
                    businessName={vendor.businessName}
                    type="business"
                    vendorId={vendor.id}
                    variant="primary"
                    label="Direct WhatsApp Chat"
                  />
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Directory List View */
        <div className="space-y-4">
          {filteredVendors.map((vendor) => {
            const features = (vendor.features && vendor.features.length > 0)
              ? vendor.features
              : [
                  ...(vendor.isVerified ? ['Verified Business' as VendorFeature] : []),
                  ...(vendor.isPremium ? ['Premium Vendor' as VendorFeature] : []),
                  ...(vendor.isFeatured ? ['Featured Vendor' as VendorFeature] : []),
                ];

            return (
              <div
                key={vendor.id}
                className="bg-white rounded-3xl border border-gray-150 p-4 sm:p-5 flex flex-col sm:flex-row items-center gap-4 shadow-sm hover:shadow-lg transition-all"
              >
                <img
                  src={vendor.logoUrl}
                  alt={vendor.businessName}
                  className="w-20 h-20 rounded-2xl object-cover border border-gray-200 shrink-0"
                />
                <div className="flex-1 min-w-0 space-y-1.5 text-center sm:text-left">
                  <div className="flex items-center justify-center sm:justify-start gap-2 flex-wrap">
                    <h3
                      onClick={() => handleVendorClick(vendor.id)}
                      className="font-black text-lg text-emerald-950 hover:text-emerald-700 cursor-pointer font-display"
                    >
                      {vendor.businessName}
                    </h3>
                    <div className="flex items-center gap-1 flex-wrap">
                      {features.slice(0, 3).map((feat) => (
                        <VendorFeatureBadge key={feat} feature={feat} size="sm" />
                      ))}
                    </div>
                  </div>

                  <p className="text-xs text-emerald-800 font-bold">
                    {vendor.category} • <span className="text-gray-500 font-normal">{vendor.area}, Ikorodu</span>
                  </p>
                  <p className="text-xs text-gray-600 line-clamp-2">{vendor.description}</p>
                </div>

                <div className="flex flex-col sm:items-end gap-2 shrink-0 w-full sm:w-auto">
                  <div className="flex items-center gap-1 text-amber-500 font-bold justify-center">
                    <Star className="w-4 h-4 fill-amber-400" />
                    <span>{vendor.rating > 0 ? vendor.rating : 'New'}</span>
                    <span className="text-gray-400 font-normal">({vendor.reviewCount} reviews)</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleVendorClick(vendor.id)}
                      className="px-4 py-2 bg-emerald-100 text-emerald-950 font-bold text-xs rounded-xl hover:bg-emerald-200"
                    >
                      View Store
                    </button>
                    <WhatsAppChatButton
                      whatsappNumber={vendor.whatsapp}
                      businessName={vendor.businessName}
                      type="business"
                      vendorId={vendor.id}
                      variant="primary"
                      label="Direct WhatsApp Chat"
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
