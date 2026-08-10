import React from 'react';
import {
  CheckCircle2,
  ShieldCheck,
  Sparkles,
  Award,
  Building2,
  Zap,
} from 'lucide-react';
import { VendorFeature } from '../types';

interface VendorFeatureBadgeProps {
  feature: VendorFeature;
  size?: 'sm' | 'md';
  className?: string;
}

export const VendorFeatureBadge: React.FC<VendorFeatureBadgeProps> = ({
  feature,
  size = 'sm',
  className = '',
}) => {
  const iconSize = size === 'sm' ? 'w-3 h-3' : 'w-3.5 h-3.5';
  const padding = size === 'sm' ? 'px-2 py-0.5 text-[10px]' : 'px-2.5 py-1 text-xs';

  switch (feature) {
    case 'Verified Business':
      return (
        <span
          className={`inline-flex items-center gap-1 font-bold rounded-full bg-emerald-600 text-white shadow-xs ${padding} ${className}`}
        >
          <CheckCircle2 className={`${iconSize} text-amber-300`} /> Verified Business
        </span>
      );
    case 'Trusted Vendor':
      return (
        <span
          className={`inline-flex items-center gap-1 font-bold rounded-full bg-indigo-600 text-white shadow-xs ${padding} ${className}`}
        >
          <ShieldCheck className={`${iconSize} text-indigo-200`} /> Trusted Vendor
        </span>
      );
    case 'Premium Vendor':
      return (
        <span
          className={`inline-flex items-center gap-1 font-bold rounded-full bg-amber-400 text-emerald-950 shadow-xs ${padding} ${className}`}
        >
          <Sparkles className={`${iconSize} text-emerald-950`} /> Premium Vendor
        </span>
      );
    case 'Featured Vendor':
      return (
        <span
          className={`inline-flex items-center gap-1 font-bold rounded-full bg-purple-600 text-white shadow-xs ${padding} ${className}`}
        >
          <Award className={`${iconSize} text-purple-200`} /> Featured Vendor
        </span>
      );
    case 'Official Service Provider':
      return (
        <span
          className={`inline-flex items-center gap-1 font-bold rounded-full bg-teal-700 text-white shadow-xs ${padding} ${className}`}
        >
          <Building2 className={`${iconSize} text-teal-200`} /> Official Provider
        </span>
      );
    case 'Fast Response':
      return (
        <span
          className={`inline-flex items-center gap-1 font-bold rounded-full bg-rose-600 text-white shadow-xs ${padding} ${className}`}
        >
          <Zap className={`${iconSize} text-rose-200`} /> Fast Response
        </span>
      );
    default:
      return (
        <span
          className={`inline-flex items-center gap-1 font-bold rounded-full bg-slate-700 text-white shadow-xs ${padding} ${className}`}
        >
          {feature}
        </span>
      );
  }
};

export const ALL_VENDOR_FEATURES: VendorFeature[] = [
  'Verified Business',
  'Trusted Vendor',
  'Premium Vendor',
  'Featured Vendor',
  'Official Service Provider',
  'Fast Response',
];
