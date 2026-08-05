import React from 'react';
import { Building2, MapPin, Phone, Mail, ShieldCheck, Heart, ArrowUpRight } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { MANUAL_PAYMENT_INFO } from '../data/mockData';

export const Footer: React.FC = () => {
  const { setActiveTab, setSelectedCategory } = useApp();

  return (
    <footer className="bg-emerald-950 text-emerald-100 pt-12 pb-8 border-t border-emerald-900/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
          {/* Brand & Vision Bento Card */}
          <div className="lg:col-span-2 p-6 bg-emerald-900/40 border border-emerald-800/60 rounded-3xl space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-sm border border-emerald-400/30">
                <Building2 className="w-5 h-5 text-amber-300" />
              </div>
              <div>
                <span className="text-xl font-black text-white font-display tracking-tight">
                  Ikorodu<span className="text-amber-400">Square</span>
                </span>
                <p className="text-[10px] text-emerald-300 font-medium">Discover. Connect. Shop Local.</p>
              </div>
            </div>

            <p className="text-xs text-emerald-200/90 leading-relaxed">
              IkoroduSquare is the premier digital business directory, marketplace, and local commerce platform connecting residents and buyers in Lagos, Nigeria with verified SME vendors.
            </p>

            <div className="pt-2 flex items-center gap-2 text-xs font-semibold text-emerald-300">
              <ShieldCheck className="w-4 h-4 text-amber-400 shrink-0" />
              <span>Verified Local Businesses & Direct WhatsApp Commerce</span>
            </div>
          </div>

          {/* Quick Links Bento Tile */}
          <div className="p-6 bg-emerald-900/30 border border-emerald-800/50 rounded-3xl">
            <h4 className="text-xs font-black uppercase tracking-wider text-amber-400 mb-3">
              Explore Platform
            </h4>
            <ul className="space-y-2.5 text-xs text-emerald-200 font-medium">
              <li>
                <button onClick={() => setActiveTab('directory')} className="hover:text-amber-300 transition-colors">
                  Business Directory
                </button>
              </li>
              <li>
                <button onClick={() => setActiveTab('marketplace')} className="hover:text-amber-300 transition-colors">
                  Product Marketplace
                </button>
              </li>
              <li>
                <button onClick={() => setActiveTab('categories')} className="hover:text-amber-300 transition-colors">
                  Categories List
                </button>
              </li>
              <li>
                <button onClick={() => setActiveTab('promotions-pricing')} className="hover:text-amber-300 transition-colors">
                  Vendor Advertising Rates
                </button>
              </li>
              <li>
                <button onClick={() => setActiveTab('register-vendor')} className="hover:text-amber-300 transition-colors font-bold text-amber-400">
                  Register Your Business
                </button>
              </li>
            </ul>
          </div>

          {/* Top Ikorodu Areas Bento Tile */}
          <div className="p-6 bg-emerald-900/30 border border-emerald-800/50 rounded-3xl">
            <h4 className="text-xs font-black uppercase tracking-wider text-amber-400 mb-3">
              Ikorodu Hubs & Areas
            </h4>
            <ul className="space-y-2 text-xs text-emerald-200 font-medium">
              <li className="flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-emerald-400 shrink-0" /> Sabo Central Market
              </li>
              <li className="flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-emerald-400 shrink-0" /> Sagamu Garage & BRT
              </li>
              <li className="flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-emerald-400 shrink-0" /> Agric Bus Stop
              </li>
              <li className="flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-emerald-400 shrink-0" /> Ebute Jetty & Ipakodo
              </li>
              <li className="flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-emerald-400 shrink-0" /> Ayetoro & Ita-Elewa
              </li>
              <li className="flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-emerald-400 shrink-0" /> Igbogbo & Imota Hub
              </li>
            </ul>
          </div>

          {/* Platform Contacts Bento Tile */}
          <div className="p-6 bg-emerald-900/30 border border-emerald-800/50 rounded-3xl">
            <h4 className="text-xs font-black uppercase tracking-wider text-amber-400 mb-3">
              Support & Inquiries
            </h4>
            <ul className="space-y-2.5 text-xs text-emerald-200 font-medium">
              <li className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span>{MANUAL_PAYMENT_INFO.supportPhone}</span>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span>{MANUAL_PAYMENT_INFO.supportEmail}</span>
              </li>
              <li className="pt-2 text-[11px] text-emerald-400 font-semibold">
                Hours: Mon - Sat (8am - 6pm)
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom copyright */}
        <div className="pt-4 border-t border-emerald-900/60 flex flex-col sm:flex-row items-center justify-between text-[11px] text-emerald-400 gap-2 font-medium">
          <p>© {new Date().getFullYear()} IkoroduSquare. Powered by <strong className="text-amber-400 font-bold">Rhadsoft Tech</strong>. Built for Lagos, Nigeria.</p>
          <div className="flex items-center gap-4">
            <span className="hover:underline cursor-pointer">Privacy Policy</span>
            <span className="hover:underline cursor-pointer">Terms of Service</span>
            <span className="hover:underline cursor-pointer">Sitemap</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
