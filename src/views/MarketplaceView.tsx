import React, { useState } from 'react';
import {
  Search,
  ShoppingBag,
  Filter,
  MapPin,
  Star,
  MessageSquare,
  SlidersHorizontal,
  Grid,
  List,
  CheckCircle2,
  Tag,
  ArrowRight,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { IkoroduArea } from '../types';
import { IKORODU_AREAS } from '../data/mockData';
import { WhatsAppChatButton } from '../components/WhatsAppChatButton';
import { ProductSkeletonCard } from '../components/ProductSkeletonCard';
import { useSEO } from '../hooks/useSEO';

export const MarketplaceView: React.FC = () => {
  const {
    products,
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
    setSelectedProductId,
    setSelectedVendorId,
    trackVendorWhatsAppClick,
    wishlist,
    toggleWishlist,
  } = useApp();

  const [selectedCondition, setSelectedCondition] = useState<string>('');
  const [maxPrice, setMaxPrice] = useState<number>(2000000);

  useSEO({
    title: selectedCategory !== 'All' 
      ? `Buy ${selectedCategory} Products in Ikorodu, Lagos` 
      : 'Ikorodu Local Product Marketplace - Buy Direct from Vendors',
    description: `Discover and buy verified ${selectedCategory !== 'All' ? selectedCategory : 'local'} products directly from top rated merchants in Sabo, Ebute, Agric, and Ikorodu Central, Lagos State.`,
    keywords: `Ikorodu marketplace, buy products Ikorodu, ${selectedCategory} products, Sabo market, Lagos online shopping`,
  });
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const ikoroduAreas: (IkoroduArea | 'All')[] = ['All', ...IKORODU_AREAS];

  const approvedProducts = products.filter((p) => p.status === 'approved');

  const filteredProducts = approvedProducts.filter((p) => {
    // Area filter
    if (selectedArea !== 'All' && p.vendorArea !== selectedArea) return false;

    // Category filter
    if (selectedCategory && p.category !== selectedCategory) return false;

    // Condition filter
    if (selectedCondition && p.condition !== selectedCondition) return false;

    // Price filter
    if (p.price > maxPrice) return false;

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = p.name.toLowerCase().includes(q);
      const matchVendor = p.vendorName.toLowerCase().includes(q);
      const matchCat = p.category.toLowerCase().includes(q);
      const matchDesc = p.description.toLowerCase().includes(q);
      return matchName || matchVendor || matchCat || matchDesc;
    }

    return true;
  });

  const handleProductClick = (id: string) => {
    setSelectedProductId(id);
    setActiveTab('product-details');
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Marketplace Header */}
      <div className="bg-gradient-to-r from-teal-900 via-emerald-900 to-emerald-950 text-white rounded-3xl p-6 sm:p-8 shadow-lg">
        <div className="max-w-3xl space-y-2">
          <span className="text-amber-400 font-extrabold text-xs uppercase tracking-widest flex items-center gap-1">
            <ShoppingBag className="w-4 h-4" /> Ikorodu Marketplace
          </span>
          <h1 className="text-2xl sm:text-4xl font-black font-display">
            Browse Products & Local Services
          </h1>
          <p className="text-xs sm:text-sm text-emerald-100/90">
            Buy artisan baked goods, Swiss fabrics, electronics, solar packages, and farm-fresh produce directly from verified sellers.
          </p>
        </div>
      </div>

      {/* Filter Control Bar */}
      <div className="bg-white p-4 rounded-2xl border border-gray-150 shadow-sm space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
          {/* Search Input */}
          <div className="md:col-span-5 relative">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Search items by name, brand or keyword..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium text-emerald-950 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
            />
          </div>

          {/* Area Selector */}
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

          {/* Category Selector */}
          <div className="md:col-span-4 flex items-center bg-gray-50 border border-gray-200 rounded-xl px-3">
            <Filter className="w-4 h-4 text-emerald-600 shrink-0 mr-2" />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
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

        {/* Price Slider & Condition Filters */}
        <div className="flex flex-wrap items-center justify-between gap-4 pt-2 border-t border-gray-100 text-xs">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 bg-gray-50 px-3 py-1.5 rounded-xl border">
              <span className="font-bold text-gray-700">Max Price:</span>
              <input
                type="range"
                min={2000}
                max={2000000}
                step={5000}
                value={maxPrice}
                onChange={(e) => setMaxPrice(Number(e.target.value))}
                className="w-24 accent-emerald-700 cursor-pointer"
              />
              <span className="font-mono font-bold text-emerald-900">
                ₦{maxPrice.toLocaleString()}
              </span>
            </div>

            <select
              value={selectedCondition}
              onChange={(e) => setSelectedCondition(e.target.value)}
              className="px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-xl font-bold text-xs"
            >
              <option value="">All Conditions</option>
              <option value="New">Brand New</option>
              <option value="Used - Like New">UK Used / Like New</option>
              <option value="Refurbished">Refurbished</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-gray-500">
              Found <strong>{filteredProducts.length}</strong> items
            </span>
            <div className="flex items-center bg-gray-100 p-0.5 rounded-lg border">
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

      {/* Grid View / Skeleton Loading */}
      {isLoadingData ? (
        viewMode === 'grid' ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, idx) => (
              <ProductSkeletonCard key={idx} viewMode="grid" />
            ))}
          </div>
        ) : (
          <div className="space-y-3">
            {Array.from({ length: 6 }).map((_, idx) => (
              <ProductSkeletonCard key={idx} viewMode="list" />
            ))}
          </div>
        )
      ) : filteredProducts.length === 0 ? (
        <div className="bg-white p-12 rounded-3xl text-center border border-slate-200/90 space-y-3 shadow-xs">
          <ShoppingBag className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="text-lg font-bold text-slate-900">No Products Matched</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Try increasing max price slider or choosing a different category.
          </p>
          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedCategory('');
              setSelectedArea('All');
              setMaxPrice(2000000);
              setSelectedCondition('');
            }}
            className="px-4 py-2 bg-emerald-800 text-white rounded-xl text-xs font-bold shadow-xs hover:bg-emerald-900"
          >
            Reset Filters
          </button>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredProducts.map((product) => {
            const isSaved = wishlist.includes(product.id);
            const vendor = vendors.find(
              (v) => v.id === product.vendorId || v.businessName === product.vendorName
            );
            return (
              <div
                key={product.id}
                className="bg-white rounded-3xl border border-slate-200/90 overflow-hidden shadow-xs hover:shadow-lg hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between group"
              >
                <div>
                  <div
                    className="relative h-44 bg-slate-100 overflow-hidden cursor-pointer"
                    onClick={() => handleProductClick(product.id)}
                  >
                    <img
                      src={product.images[0]}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleWishlist(product.id);
                      }}
                      className={`absolute top-2 right-2 p-1.5 rounded-full backdrop-blur-md transition-colors ${
                        isSaved ? 'bg-amber-400 text-emerald-950' : 'bg-white/80 text-slate-700 hover:text-red-500'
                      }`}
                    >
                      <Star className={`w-4 h-4 ${isSaved ? 'fill-emerald-950' : ''}`} />
                    </button>
                    <span className="absolute bottom-2 left-2 px-2 py-0.5 bg-black/60 backdrop-blur-md text-white text-[10px] font-bold rounded-lg">
                      {product.vendorArea}
                    </span>
                  </div>

                  <div className="p-3.5 space-y-1.5">
                    <span className="text-[10px] font-extrabold uppercase text-emerald-700 tracking-wider">
                      {product.category}
                    </span>
                    <h4
                      onClick={() => handleProductClick(product.id)}
                      className="text-xs font-bold text-emerald-950 line-clamp-2 hover:text-emerald-700 cursor-pointer transition-colors"
                    >
                      {product.name}
                    </h4>

                    <p
                      onClick={() => {
                        setSelectedVendorId(product.vendorId);
                        setActiveTab('vendor-details');
                      }}
                      className="text-[11px] text-gray-500 truncate hover:text-emerald-800 cursor-pointer font-medium"
                    >
                      By {product.vendorName}
                    </p>

                    <div className="pt-1 flex items-baseline gap-2">
                      <span className="text-sm font-black text-emerald-900 font-mono">
                        ₦{product.price.toLocaleString()}
                      </span>
                      {product.salePrice && (
                        <span className="text-[10px] text-gray-400 line-through font-mono">
                          ₦{product.salePrice.toLocaleString()}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="p-3 pt-0 flex flex-col gap-2">
                  <WhatsAppChatButton
                    whatsappNumber={vendor?.whatsapp}
                    businessName={product.vendorName}
                    type="product"
                    productTitle={product.name}
                    productPrice={product.price}
                    vendorId={product.vendorId}
                    variant="primary"
                    className="w-full text-xs"
                    label="Direct WhatsApp Chat"
                  />
                  <button
                    onClick={() => handleProductClick(product.id)}
                    className="w-full py-1.5 bg-emerald-100 hover:bg-emerald-200 text-emerald-950 rounded-xl text-xs font-bold transition-colors"
                  >
                    View Details
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* List View */
        <div className="space-y-4">
          {filteredProducts.map((product) => {
            const vendor = vendors.find(
              (v) => v.id === product.vendorId || v.businessName === product.vendorName
            );
            return (
              <div
                key={product.id}
                className="bg-white rounded-2xl border border-gray-150 p-4 flex flex-col sm:flex-row items-center gap-4 shadow-sm hover:shadow-md transition-all"
              >
                <img
                  src={product.images[0]}
                  alt={product.name}
                  className="w-24 h-24 rounded-xl object-cover shrink-0 cursor-pointer"
                  onClick={() => handleProductClick(product.id)}
                />
                <div className="flex-1 min-w-0 space-y-1">
                  <span className="text-[10px] uppercase font-bold text-emerald-700">
                    {product.category} • {product.vendorArea}
                  </span>
                  <h4
                    onClick={() => handleProductClick(product.id)}
                    className="text-sm font-bold text-emerald-950 hover:text-emerald-700 cursor-pointer"
                  >
                    {product.name}
                  </h4>
                  <p className="text-xs text-gray-500 line-clamp-1">{product.description}</p>
                  <p className="text-xs text-emerald-800 font-medium">Sold by {product.vendorName}</p>
                </div>

                <div className="flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto gap-2 shrink-0 border-t sm:border-t-0 pt-2 sm:pt-0">
                  <span className="text-base font-black text-emerald-950 font-mono">
                    ₦{product.price.toLocaleString()}
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleProductClick(product.id)}
                      className="px-3 py-2 bg-emerald-100 text-emerald-950 rounded-xl text-xs font-bold hover:bg-emerald-200"
                    >
                      View
                    </button>
                    <WhatsAppChatButton
                      whatsappNumber={vendor?.whatsapp}
                      businessName={product.vendorName}
                      type="product"
                      productTitle={product.name}
                      productPrice={product.price}
                      vendorId={product.vendorId}
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
