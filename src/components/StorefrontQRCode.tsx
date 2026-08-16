import React, { useEffect, useState, useRef } from 'react';
import QRCode from 'qrcode';
import {
  Download,
  Printer,
  Copy,
  Check,
  ExternalLink,
  Store,
  ShieldCheck,
  Sparkles,
  QrCode as QrIcon,
  Info,
} from 'lucide-react';
import { Vendor } from '../types';

interface StorefrontQRCodeProps {
  vendor: Vendor;
}

export const StorefrontQRCode: React.FC<StorefrontQRCodeProps> = ({ vendor }) => {
  const [pngDataUrl, setPngDataUrl] = useState<string>('');
  const [svgDataUrl, setSvgDataUrl] = useState<string>('');
  const [copied, setCopied] = useState(false);
  const [isGenerating, setIsGenerating] = useState(true);
  const printRef = useRef<HTMLDivElement>(null);

  // Canonical storefront URL as specified
  const canonicalStorefrontUrl = `https://www.ikorodusquare.com.ng/store/${vendor.slug}`;

  useEffect(() => {
    let isMounted = true;
    setIsGenerating(true);

    async function generateCodes() {
      try {
        // Generate high-resolution standards-compliant PNG (800px) with high-contrast dark modules on pure white
        const png = await QRCode.toDataURL(canonicalStorefrontUrl, {
          errorCorrectionLevel: 'M',
          type: 'image/png',
          width: 800,
          margin: 4, // Strict quiet zone required by camera scanners
          color: {
            dark: '#000000',
            light: '#FFFFFF',
          },
        });

        // Generate vector SVG
        const svgString = await QRCode.toString(canonicalStorefrontUrl, {
          type: 'svg',
          errorCorrectionLevel: 'M',
          margin: 4,
          color: {
            dark: '#000000',
            light: '#FFFFFF',
          },
        });

        const svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
        const svgUrl = URL.createObjectURL(svgBlob);

        if (isMounted) {
          setPngDataUrl(png);
          setSvgDataUrl(svgUrl);
          setIsGenerating(false);
        }
      } catch (err) {
        console.error('[QRCode] Failed to generate standards-compliant QR code:', err);
        if (isMounted) {
          setIsGenerating(false);
        }
      }
    }

    generateCodes();

    return () => {
      isMounted = false;
      if (svgDataUrl) {
        URL.revokeObjectURL(svgDataUrl);
      }
    };
  }, [canonicalStorefrontUrl]);

  const handleCopy = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(canonicalStorefrontUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const handleDownloadPng = () => {
    if (!pngDataUrl) return;
    const a = document.createElement('a');
    a.href = pngDataUrl;
    a.download = `${vendor.slug || 'vendor'}-storefront-qrcode.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleDownloadSvg = () => {
    if (!svgDataUrl) return;
    const a = document.createElement('a');
    a.href = svgDataUrl;
    a.download = `${vendor.slug || 'vendor'}-storefront-qrcode.svg`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      {/* Printable Counter Flyer Card */}
      <div
        ref={printRef}
        className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm text-center space-y-6 relative overflow-hidden"
      >
        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-900 border border-emerald-200 rounded-full text-xs font-bold">
            <QrIcon className="w-3.5 h-3.5 text-emerald-700" />
            <span>Official Storefront QR Code</span>
          </div>

          <h3 className="text-xl sm:text-2xl font-black text-emerald-950 font-display">
            {vendor.businessName}
          </h3>

          <p className="text-xs text-slate-500 max-w-md mx-auto">
            Scan with any smartphone camera to browse our verified products and order directly via WhatsApp on IkoroduSquare.
          </p>
        </div>

        {/* Machine-Readable QR Container */}
        <div className="inline-block p-4 sm:p-5 bg-white rounded-2xl border-2 border-slate-900 shadow-md">
          {isGenerating ? (
            <div className="w-56 h-56 sm:w-64 sm:h-64 flex items-center justify-center bg-slate-50 rounded-xl">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-900" />
            </div>
          ) : pngDataUrl ? (
            <img
              src={pngDataUrl}
              alt={`Scan QR Code to visit ${vendor.businessName} Storefront`}
              className="w-56 h-56 sm:w-64 sm:h-64 object-contain mx-auto block"
            />
          ) : (
            <div className="w-56 h-56 flex items-center justify-center text-xs text-red-500">
              Error generating QR code
            </div>
          )}

          {/* Sub-label under QR */}
          <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-center gap-1.5 text-slate-600">
            <Store className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
            <span className="text-[11px] font-mono font-bold text-slate-800 truncate max-w-[240px]">
              ikorodusquare.com.ng/store/{vendor.slug}
            </span>
          </div>
        </div>

        {/* Store Highlights Badge */}
        <div className="flex flex-wrap items-center justify-center gap-2 pt-1 text-xs text-slate-600">
          <span className="px-2.5 py-1 bg-slate-100 rounded-lg font-medium">
            {vendor.category}
          </span>
          <span className="px-2.5 py-1 bg-emerald-50 text-emerald-800 rounded-lg font-bold">
            {vendor.area}, Ikorodu
          </span>
          {vendor.isVerified && (
            <span className="px-2.5 py-1 bg-amber-50 text-amber-900 rounded-lg font-bold flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
              Verified Merchant
            </span>
          )}
        </div>

        {/* Action Controls */}
        <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center justify-center gap-3">
          <button
            type="button"
            onClick={handleDownloadPng}
            disabled={!pngDataUrl}
            className="px-4 py-2.5 bg-emerald-950 hover:bg-emerald-900 active:bg-emerald-950 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-xs transition-all cursor-pointer disabled:opacity-50"
          >
            <Download className="w-4 h-4 text-amber-300" />
            <span>Download High-Res PNG</span>
          </button>

          <button
            type="button"
            onClick={handleDownloadSvg}
            disabled={!svgDataUrl}
            className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 active:bg-slate-300 text-slate-800 border border-slate-200 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer disabled:opacity-50"
          >
            <Download className="w-4 h-4 text-slate-600" />
            <span>Download Vector SVG</span>
          </button>

          <button
            type="button"
            onClick={handlePrint}
            className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer"
          >
            <Printer className="w-4 h-4 text-slate-600" />
            <span>Print Counter Flyer</span>
          </button>
        </div>

        {/* Link Copy & Direct Storefront Test */}
        <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200/80 flex flex-col sm:flex-row items-center justify-between gap-3 text-left">
          <div className="min-w-0 flex-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
              Direct Storefront URL
            </span>
            <span className="text-xs font-mono font-bold text-slate-800 truncate block">
              {canonicalStorefrontUrl}
            </span>
          </div>

          <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto">
            <button
              type="button"
              onClick={handleCopy}
              className="flex-1 sm:flex-none px-3 py-1.5 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-2xs"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="text-emerald-700">Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-slate-500" />
                  <span>Copy Link</span>
                </>
              )}
            </button>

            <a
              href={`/store/${vendor.slug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 sm:flex-none px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-2xs"
            >
              <span>Test Store</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      </div>

      {/* Printing & Usage Tips Card */}
      <div className="bg-emerald-950 text-white p-5 sm:p-6 rounded-3xl space-y-3">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-amber-300" />
          <h4 className="text-sm font-black font-display text-white">
            Where to use your IkoroduSquare QR Code
          </h4>
        </div>
        <ul className="text-xs text-emerald-100/90 space-y-2 leading-relaxed">
          <li className="flex items-start gap-2">
            <span className="text-amber-300 font-bold">•</span>
            <span><strong>Shop Front & Window:</strong> Print and stick on your shop entrance in Sabo, Ebute, or Agric for walk-by customers.</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-amber-300 font-bold">•</span>
            <span><strong>Packaging & Bags:</strong> Print on order receipts, packaging labels, and shopping bags so repeat buyers can reorder directly.</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-amber-300 font-bold">•</span>
            <span><strong>Business Cards & Flyers:</strong> Include the high-resolution vector SVG on printed marketing materials across Lagos.</span>
          </li>
        </ul>
      </div>
    </div>
  );
};
