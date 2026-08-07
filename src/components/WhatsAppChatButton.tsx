import React from 'react';
import { MessageSquare } from 'lucide-react';
import { useApp } from '../context/AppContext';

export interface WhatsAppChatButtonProps {
  whatsappNumber?: string;
  businessName: string;
  type: 'business' | 'product';
  productTitle?: string;
  productPrice?: number;
  vendorId?: string;
  variant?: 'primary' | 'secondary' | 'outline' | 'compact' | 'icon-only' | 'full';
  className?: string;
  label?: string;
}

export function formatWhatsAppNumber(phone?: string): string {
  if (!phone) return '2348000000000';
  let cleaned = phone.replace(/\D/g, '');
  if (cleaned.startsWith('0')) {
    cleaned = '234' + cleaned.substring(1);
  }
  return cleaned;
}

export function buildWhatsAppMessage(opts: {
  type: 'business' | 'product';
  businessName: string;
  productTitle?: string;
  productPrice?: number;
}): string {
  if (opts.type === 'product' && opts.productTitle) {
    const priceText = opts.productPrice ? ` (₦${opts.productPrice.toLocaleString()})` : '';
    return `Hi ${opts.businessName}, I saw "${opts.productTitle}"${priceText} on IkoroduSquare and I would like to chat with you directly to inquire/purchase.`;
  }
  return `Hi ${opts.businessName}, I found your business on IkoroduSquare and would like to chat with you directly regarding your products and services.`;
}

export const WhatsAppChatButton: React.FC<WhatsAppChatButtonProps> = ({
  whatsappNumber,
  businessName,
  type,
  productTitle,
  productPrice,
  vendorId,
  variant = 'primary',
  className = '',
  label,
}) => {
  const { trackWhatsAppClick } = useApp();

  const formattedPhone = formatWhatsAppNumber(whatsappNumber);
  const message = buildWhatsAppMessage({
    type,
    businessName: businessName || 'Vendor',
    productTitle,
    productPrice,
  });

  const whatsappUrl = `https://wa.me/${formattedPhone}?text=${encodeURIComponent(message)}`;

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (vendorId) {
      trackWhatsAppClick(vendorId);
    }
  };

  const displayLabel =
    label ||
    (type === 'product'
      ? 'Direct WhatsApp Chat'
      : 'Direct WhatsApp Chat');

  // Variant styling
  let baseStyle =
    'inline-flex items-center justify-center font-bold transition-all shadow-sm rounded-xl cursor-pointer active:scale-95 select-none';

  let variantStyle = '';

  switch (variant) {
    case 'primary':
      variantStyle =
        'bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white px-3.5 py-2 text-xs gap-1.5';
      break;
    case 'secondary':
      variantStyle =
        'bg-emerald-100 hover:bg-emerald-200 text-emerald-950 px-3.5 py-2 text-xs gap-1.5 border border-emerald-300/60';
      break;
    case 'outline':
      variantStyle =
        'bg-white hover:bg-emerald-50 text-emerald-800 border border-emerald-600 px-3 py-1.5 text-xs gap-1.5';
      break;
    case 'compact':
      variantStyle =
        'bg-emerald-600 hover:bg-emerald-700 text-white px-2.5 py-1.5 text-[11px] gap-1 rounded-lg';
      break;
    case 'icon-only':
      variantStyle =
        'bg-emerald-600 hover:bg-emerald-700 text-white p-2 rounded-xl';
      break;
    case 'full':
      variantStyle =
        'w-full bg-emerald-600 hover:bg-emerald-700 text-white py-3 px-4 text-sm gap-2 rounded-xl shadow-md';
      break;
  }

  return (
    <a
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      onClick={handleClick}
      className={`${baseStyle} ${variantStyle} ${className}`}
      title={`Direct WhatsApp Chat with ${businessName}`}
    >
      <MessageSquare className="w-4 h-4 text-amber-300 shrink-0" />
      {variant !== 'icon-only' && <span>{displayLabel}</span>}
    </a>
  );
};
