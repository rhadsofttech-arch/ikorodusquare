import React from 'react';
import {
  Shirt,
  Smartphone,
  UtensilsCrossed,
  Sparkles,
  Activity,
  Car,
  Armchair,
  Home,
  Hammer,
  Wheat,
  GraduationCap,
  Briefcase,
  Truck,
  PartyPopper,
  Zap,
  Wrench,
  ShoppingBag,
  Hotel,
  Building2,
  HelpCircle,
  LucideProps,
} from 'lucide-react';

export const CATEGORY_ICON_MAP: Record<string, React.FC<LucideProps>> = {
  Shirt,
  Smartphone,
  UtensilsCrossed,
  Sparkles,
  Activity,
  Car,
  Armchair,
  Home,
  Hammer,
  Wheat,
  GraduationCap,
  Briefcase,
  Truck,
  PartyPopper,
  Zap,
  Wrench,
  ShoppingBag,
  Hotel,
  Building2,
};

export function getCategoryIcon(iconName: string, className?: string) {
  const IconComponent = CATEGORY_ICON_MAP[iconName] || Building2;
  return <IconComponent className={className || 'w-5 h-5'} />;
}
