import React, { useState } from 'react';
import {
  MessageSquare,
  ShieldCheck,
  Truck,
  MapPin,
  Star,
  CheckCircle2,
  ArrowLeft,
  Store,
  Share2,
  Heart,
  Package,
  Layers,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { WhatsAppChatButton } from '../components/WhatsAppChatButton';

export const ProductDetailsView: React.FC = () => {
  const {
    products,
    vendors,
    selectedProductId,
    setActiveTab,
    setSelectedVendorId,
    trackVendorWhatsAppClick,
    wishlist,
    toggleWishlist,
  } = useApp();

  const product = products.find((p) => p.id === selectedProductId) || products[0];
  const vendor = vendors.find((v) => v.id === product.vendorId) || vendors[0];

  const [activeImageIdx, setActiveImageIdx] = useState(0);

  const isSaved = wishlist.includes(product.id);

  const handleVendorClick = () => {
    setSelectedVendorId(vendor.id);
    setActiveTab('vendor-details');
  };

  const whatsappMessage = encodeURIComponent(
    `Hi ${vendor.businessName}, I found your listing "${product.name}" (₦${product.price.toLocaleString()}) on IkoroduSquare. Is it currently in stock for delivery in ${product.vendorArea}?`
  );

  return (
    <div className="space-y-6 pb-12">
      {/* Back Button */}
      <button
        onClick={() => setActiveTab('marketplace')}
        className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-800 hover:text-emerald-950 transition-colors bg-white px-3 py-1.5 rounded-xl border border-gray-200 shadow-sm"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Product Marketplace
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: Product Images Gallery */}
        <div className="lg:col-span-6 space-y-4">
          <div className="bg-white rounded-3xl border border-gray-150 p-4 shadow-sm overflow-hidden">
            <div className="relative h-80 sm:h-96 rounded-2xl overflow-hidden bg-gray-100">
              <img
                src={product.images[activeImageIdx] || product.images[0]}
                alt={product.name}
                className="w-full h-full object-cover"
              />
              <button
                onClick={() => toggleWishlist(product.id)}
                className={`absolute top-4 right-4 p-2.5 rounded-full backdrop-blur-md transition-colors ${
                  isSaved ? 'bg-amber-400 text-emerald-950' : 'bg-white/80 text-gray-700 hover:text-red-500'
                }`}
              >
                <Star className={`w-5 h-5 ${isSaved ? 'fill-emerald-950' : ''}`} />
              </button>
            </div>

            {/* Thumbnail selector */}
            {product.images.length > 1 && (
              <div className="flex gap-2 pt-4 overflow-x-auto">
                {product.images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImageIdx(idx)}
                    className={`w-16 h-16 rounded-xl overflow-hidden border-2 transition-all ${
                      activeImageIdx === idx ? 'border-emerald-600 scale-105' : 'border-gray-200 opacity-70'
                    }`}
                  >
                    <img src={img} alt="Thumbnail" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right: Product Info & Buyer Actions */}
        <div className="lg:col-span-6 space-y-6">
          <div className="bg-white rounded-3xl border border-gray-150 p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between text-xs">
              <span className="px-3 py-1 bg-emerald-50 text-emerald-800 font-bold rounded-full border border-emerald-200">
                {product.category}
              </span>
              <span className="text-gray-400 font-mono">SKU: {product.sku}</span>
            </div>

            <h1 className="text-xl sm:text-2xl font-black text-emerald-950 font-display">
              {product.name}
            </h1>

            {/* Price Row */}
            <div className="flex items-baseline gap-3 p-4 bg-emerald-50/70 border border-emerald-200/80 rounded-2xl">
              <span className="text-2xl sm:text-3xl font-black text-emerald-950 font-mono">
                ₦{product.price.toLocaleString()}
              </span>
              {product.salePrice && (
                <span className="text-sm text-gray-400 line-through font-mono">
                  ₦{product.salePrice.toLocaleString()}
                </span>
              )}
              <span className="ml-auto text-xs font-bold text-emerald-700 bg-white px-2.5 py-1 rounded-lg shadow-xs">
                {product.availability} ({product.stock} available)
              </span>
            </div>

            {/* Description */}
            <div className="space-y-1">
              <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500">Item Description</h3>
              <p className="text-xs text-gray-700 leading-relaxed whitespace-pre-line">
                {product.description}
              </p>
            </div>

            {/* Condition & Tags */}
            <div className="flex flex-wrap items-center gap-2 pt-2 text-xs">
              <span className="px-2.5 py-1 bg-gray-100 text-gray-700 font-semibold rounded-lg">
                Condition: {product.condition}
              </span>
              {product.tags?.map((t) => (
                <span key={t} className="px-2.5 py-1 bg-amber-50 text-amber-900 font-semibold rounded-lg border border-amber-200">
                  #{t}
                </span>
              ))}
            </div>

            {/* WhatsApp Buyer CTA */}
            <div className="pt-4 border-t border-gray-100 space-y-2">
              <WhatsAppChatButton
                whatsappNumber={vendor.whatsapp}
                businessName={vendor.businessName}
                type="product"
                productTitle={product.name}
                productPrice={product.price}
                vendorId={vendor.id}
                variant="primary"
                className="w-full py-3.5 text-xs sm:text-sm"
                label={`Direct WhatsApp Chat (${vendor.businessName})`}
              />
              <p className="text-[11px] text-gray-500 text-center">
                Direct buyer-to-seller communication. No middleman markup!
              </p>
            </div>
          </div>

          {/* Vendor Details Card */}
          <div className="bg-white rounded-3xl border border-gray-150 p-5 shadow-sm space-y-3">
            <h3 className="text-xs font-bold uppercase text-gray-500">Sold By Verified Merchant</h3>

            <div className="flex items-center gap-4">
              <img
                src={vendor.logoUrl}
                alt={vendor.businessName}
                className="w-14 h-14 rounded-2xl object-cover border border-gray-200"
              />
              <div className="flex-1 min-w-0 space-y-0.5">
                <h4
                  onClick={handleVendorClick}
                  className="font-black text-sm text-emerald-950 hover:text-emerald-700 cursor-pointer"
                >
                  {vendor.businessName}
                </h4>
                <p className="text-xs text-gray-600 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                  <span>{vendor.address} ({vendor.area})</span>
                </p>
                <div className="flex items-center gap-1 text-amber-500 text-xs font-bold pt-0.5">
                  <Star className="w-3.5 h-3.5 fill-amber-400" />
                  <span>{vendor.rating > 0 ? vendor.rating : 'New'}</span>
                  <span className="text-gray-400 font-normal">({vendor.reviewCount} Reviews)</span>
                </div>
              </div>
            </div>

            <button
              onClick={handleVendorClick}
              className="w-full py-2 bg-emerald-50 text-emerald-950 font-bold text-xs rounded-xl hover:bg-emerald-100 transition-colors flex items-center justify-center gap-1.5"
            >
              <Store className="w-4 h-4 text-emerald-700" />
              <span>Visit Vendor Storefront</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
