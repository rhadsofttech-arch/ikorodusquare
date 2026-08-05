import React, { useState } from 'react';
import {
  Heart,
  Store,
  MessageSquare,
  Star,
  ShoppingBag,
  ArrowRight,
  Trash2,
  CheckCircle2,
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export const CustomerPortalView: React.FC = () => {
  const {
    wishlist,
    toggleWishlist,
    products,
    vendors,
    followingVendors,
    toggleFollowVendor,
    enquiries,
    reviews,
    currentUser,
    setActiveTab,
    setSelectedProductId,
    setSelectedVendorId,
  } = useApp();

  const [activeTabSub, setActiveTabSub] = useState<'wishlist' | 'following' | 'enquiries'>('wishlist');

  const savedProducts = products.filter((p) => wishlist.includes(p.id));
  const followedVendorObjs = vendors.filter((v) => followingVendors.includes(v.id));

  return (
    <div className="space-y-6 pb-12">
      {/* Portal Header */}
      <div className="bg-white rounded-3xl border border-gray-150 p-6 shadow-sm flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-emerald-100 text-emerald-900 font-black text-xl flex items-center justify-center">
            {currentUser?.firstName?.slice(0, 1) || 'C'}
          </div>
          <div>
            <h1 className="text-xl font-black text-emerald-950 font-display">
              Welcome, {currentUser?.firstName || 'Customer'}!
            </h1>
            <p className="text-xs text-gray-500">Manage your saved items, followed vendors & enquiries</p>
          </div>
        </div>

        <span className="px-3 py-1 bg-emerald-50 text-emerald-800 font-bold text-xs rounded-xl border border-emerald-200">
          Customer Account
        </span>
      </div>

      {/* Sub Tabs */}
      <div className="flex items-center gap-2 border-b border-gray-200 pb-2">
        <button
          onClick={() => setActiveTabSub('wishlist')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
            activeTabSub === 'wishlist' ? 'bg-emerald-950 text-amber-300' : 'bg-white text-gray-600 hover:bg-gray-100'
          }`}
        >
          <Heart className="w-3.5 h-3.5 text-amber-400" />
          <span>Saved Wishlist ({savedProducts.length})</span>
        </button>

        <button
          onClick={() => setActiveTabSub('following')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
            activeTabSub === 'following' ? 'bg-emerald-950 text-amber-300' : 'bg-white text-gray-600 hover:bg-gray-100'
          }`}
        >
          <Store className="w-3.5 h-3.5" />
          <span>Followed Vendors ({followedVendorObjs.length})</span>
        </button>

        <button
          onClick={() => setActiveTabSub('enquiries')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
            activeTabSub === 'enquiries' ? 'bg-emerald-950 text-amber-300' : 'bg-white text-gray-600 hover:bg-gray-100'
          }`}
        >
          <MessageSquare className="w-3.5 h-3.5" />
          <span>My Enquiries ({enquiries.length})</span>
        </button>
      </div>

      {/* TAB 1: Wishlist */}
      {activeTabSub === 'wishlist' && (
        <div className="space-y-4">
          {savedProducts.length === 0 ? (
            <div className="bg-white p-12 rounded-3xl text-center border border-gray-200 space-y-2">
              <Heart className="w-12 h-12 text-gray-300 mx-auto" />
              <h3 className="text-base font-bold text-emerald-950">Your Wishlist is Empty</h3>
              <p className="text-xs text-gray-500">Save your favorite artisan products while browsing.</p>
              <button
                onClick={() => setActiveTab('marketplace')}
                className="px-4 py-2 bg-emerald-800 text-white font-bold text-xs rounded-xl"
              >
                Browse Marketplace
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {savedProducts.map((p) => (
                <div key={p.id} className="bg-white rounded-2xl border border-gray-150 p-3 space-y-2 shadow-sm">
                  <img src={p.images[0]} alt={p.name} className="w-full h-36 rounded-xl object-cover" />
                  <h4 className="text-xs font-bold text-emerald-950 truncate">{p.name}</h4>
                  <span className="text-sm font-black text-emerald-900 font-mono">₦{p.price.toLocaleString()}</span>
                  <div className="flex gap-2 pt-1">
                    <button
                      onClick={() => {
                        setSelectedProductId(p.id);
                        setActiveTab('product-details');
                      }}
                      className="flex-1 py-1.5 bg-emerald-800 text-white rounded-lg text-xs font-bold"
                    >
                      View
                    </button>
                    <button
                      onClick={() => toggleWishlist(p.id)}
                      className="p-1.5 bg-red-50 text-red-600 rounded-lg"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: Followed Vendors */}
      {activeTabSub === 'following' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {followedVendorObjs.map((v) => (
              <div key={v.id} className="bg-white p-4 rounded-2xl border border-gray-150 flex items-center justify-between shadow-sm">
                <div className="flex items-center gap-3">
                  <img src={v.logoUrl} alt={v.businessName} className="w-12 h-12 rounded-xl object-cover" />
                  <div>
                    <h4 className="font-bold text-xs text-emerald-950">{v.businessName}</h4>
                    <span className="text-[10px] text-emerald-700">{v.area}, Ikorodu</span>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setSelectedVendorId(v.id);
                    setActiveTab('vendor-details');
                  }}
                  className="px-3 py-1.5 bg-emerald-100 text-emerald-950 font-bold text-xs rounded-lg"
                >
                  Visit Store
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: Enquiries */}
      {activeTabSub === 'enquiries' && (
        <div className="space-y-4">
          {enquiries.map((e) => (
            <div key={e.id} className="bg-white p-5 rounded-2xl border border-gray-150 space-y-2 text-xs shadow-sm">
              <div className="flex items-center justify-between">
                <strong className="font-bold text-emerald-950">To: {e.vendorName}</strong>
                <span className="text-gray-400">{new Date(e.createdAt).toLocaleDateString()}</span>
              </div>
              <p className="text-gray-700 bg-gray-50 p-2.5 rounded-xl border">"{e.message}"</p>
              {e.replyText && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl space-y-1">
                  <strong className="text-emerald-900 font-bold">Vendor Reply:</strong>
                  <p className="text-emerald-950">{e.replyText}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
