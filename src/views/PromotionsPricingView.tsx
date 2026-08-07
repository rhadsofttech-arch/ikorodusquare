import React from 'react';
import {
  CreditCard,
  ShieldCheck,
  Zap,
  CheckCircle2,
  Sparkles,
  Award,
  ArrowRight,
  Phone,
  Mail,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { MANUAL_PAYMENT_INFO, PROMOTION_OPTIONS } from '../data/mockData';

export const PromotionsPricingView: React.FC = () => {
  const { setActiveTab, setRole } = useApp();

  return (
    <div className="space-y-8 pb-12">
      {/* Header Banner */}
      <div className="bg-gradient-to-br from-emerald-950 via-emerald-900 to-teal-950 text-white rounded-3xl p-6 sm:p-10 text-center space-y-4 shadow-xl">
        <span className="px-3 py-1 bg-amber-400 text-emerald-950 font-extrabold text-xs uppercase tracking-widest rounded-full">
          Vendor Advertising Rates & Plans
        </span>
        <h1 className="text-3xl sm:text-5xl font-black font-display">
          Promote Your Storefront on IkoroduSquare
        </h1>
        <p className="text-xs sm:text-sm text-emerald-100 max-w-2xl mx-auto leading-relaxed">
          Boost your local business visibility, feature your top items, and gain direct WhatsApp customer leads across Sabo, Agric, Garage, Ebute, Ayetoro, and Igbogbo.
        </p>
      </div>

      {/* Manual FCMB Bank Transfer Reference Card */}
      <div className="bg-amber-400 text-emerald-950 p-6 sm:p-8 rounded-3xl shadow-lg relative overflow-hidden space-y-4">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2 font-black text-xs uppercase tracking-wider bg-emerald-950 text-amber-300 px-3 py-1 rounded-full w-fit">
              <ShieldCheck className="w-4 h-4" /> Official Payment Bank Account
            </div>
            <h2 className="text-xl sm:text-2xl font-black font-display">
              Manual Bank Transfer Verification
            </h2>
            <p className="text-xs text-emerald-900 font-medium max-w-lg">
              IkoroduSquare uses direct bank transfers verified by our administrative team. Once paid, upload your transfer receipt on your vendor dashboard.
            </p>
          </div>

          {/* Account Details Box */}
          <div className="bg-emerald-950 text-white p-5 rounded-2xl border-2 border-emerald-900 shadow-xl space-y-2 w-full md:w-auto shrink-0">
            <p className="text-xs text-emerald-300">
              Bank: <strong className="text-white">{MANUAL_PAYMENT_INFO.bankName}</strong>
            </p>
            <p className="text-xs text-emerald-300">
              Account Name: <strong className="text-white">{MANUAL_PAYMENT_INFO.accountName}</strong>
            </p>
            <p className="text-xs text-emerald-300">
              Account Number:{' '}
              <strong className="text-xl font-mono font-black text-amber-300 block">
                {MANUAL_PAYMENT_INFO.accountNumber}
              </strong>
            </p>
          </div>
        </div>
      </div>

      {/* Pricing Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {PROMOTION_OPTIONS.map((opt) => (
          <div
            key={opt.id}
            className="bg-white rounded-3xl border border-gray-150 p-6 shadow-sm hover:shadow-xl transition-all flex flex-col justify-between space-y-4 group"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase font-extrabold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg">
                  {opt.durationLabel}
                </span>
                <Sparkles className="w-5 h-5 text-amber-400" />
              </div>

              <h3 className="text-lg font-black text-emerald-950 font-display">
                {opt.title}
              </h3>

              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-black text-emerald-950 font-mono">
                  ₦{opt.priceNaira.toLocaleString()}
                </span>
                <span className="text-xs text-gray-500">/ {opt.durationLabel}</span>
              </div>

              <p className="text-xs text-gray-600 leading-relaxed">{opt.description}</p>

              <div className="pt-2 space-y-2 text-xs text-gray-700">
                {opt.features.map((feat, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>{feat}</span>
                  </div>
                ))}
              </div>
            </div>

            <button
              onClick={() => {
                setActiveTab('vendor-portal');
              }}
              className="w-full py-3 bg-emerald-800 hover:bg-emerald-900 text-amber-300 font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-2 shadow"
            >
              <span>Purchase via FCMB Transfer</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
