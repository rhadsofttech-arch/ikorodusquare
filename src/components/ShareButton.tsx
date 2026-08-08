import React, { useState } from 'react';
import { Share2, Check, Copy, MessageSquare, ExternalLink, X } from 'lucide-react';

interface ShareButtonProps {
  title: string;
  text: string;
  url?: string;
  variant?: 'primary' | 'secondary' | 'outline' | 'icon';
  className?: string;
  label?: string;
  badge?: string;
}

export const ShareButton: React.FC<ShareButtonProps> = ({
  title,
  text,
  url,
  variant = 'outline',
  className = '',
  label = 'Share',
  badge,
}) => {
  const [modalOpen, setModalOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const shareUrl = url || (typeof window !== 'undefined' ? window.location.href : '');

  const handleShare = async (e: React.MouseEvent) => {
    e.stopPropagation();

    // Try native Web Share API first
    if (navigator.share) {
      try {
        await navigator.share({
          title,
          text,
          url: shareUrl,
        });
        return;
      } catch (err) {
        // Fallback to custom modal if share was cancelled or denied
        if ((err as Error).name !== 'AbortError') {
          console.log('Web Share failed, opening share modal fallback', err);
        } else {
          return;
        }
      }
    }

    // If Web Share API is not available or failed, open fallback modal
    setModalOpen(true);
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch (err) {
      // Fallback copy method
      const input = document.createElement('input');
      input.value = shareUrl;
      document.body.appendChild(input);
      input.select();
      document.execCommand('copy');
      document.body.removeChild(input);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const encodedText = encodeURIComponent(`${title}\n${text}\n${shareUrl}`);
  const whatsappShareUrl = `https://api.whatsapp.com/send?text=${encodedText}`;
  const facebookShareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`;
  const twitterShareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(`${title} - ${text}`)}&url=${encodeURIComponent(shareUrl)}`;

  let buttonClasses = '';
  switch (variant) {
    case 'primary':
      buttonClasses =
        'bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-xl shadow-xs hover:shadow-sm active:scale-95 transition-all';
      break;
    case 'secondary':
      buttonClasses =
        'bg-amber-400 hover:bg-amber-500 text-emerald-950 font-bold rounded-xl shadow-xs active:scale-95 transition-all';
      break;
    case 'icon':
      buttonClasses =
        'p-2.5 bg-white/90 hover:bg-white text-gray-700 hover:text-emerald-800 rounded-full shadow-md backdrop-blur-md transition-all active:scale-95';
      break;
    case 'outline':
    default:
      buttonClasses =
        'bg-white hover:bg-emerald-50 text-emerald-900 border border-emerald-200/80 font-bold rounded-xl shadow-2xs hover:border-emerald-400 transition-all active:scale-95';
      break;
  }

  return (
    <>
      <button
        onClick={handleShare}
        className={`inline-flex items-center justify-center gap-2 cursor-pointer ${buttonClasses} ${className}`}
        title={`Share ${title}`}
        type="button"
      >
        <Share2 className={variant === 'icon' ? 'w-5 h-5' : 'w-4 h-4 text-emerald-600'} />
        {variant !== 'icon' && <span>{label}</span>}
        {badge && (
          <span className="text-[10px] bg-amber-100 text-amber-900 px-1.5 py-0.5 rounded-md font-extrabold uppercase">
            {badge}
          </span>
        )}
      </button>

      {/* Share Fallback Modal */}
      {modalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200"
          onClick={() => setModalOpen(false)}
        >
          <div
            className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-5 border border-emerald-100 transform transition-all"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center">
                  <Share2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-emerald-950 font-display">Share with Friends</h3>
                  <p className="text-[11px] text-gray-500 font-medium">Spread the word about local Ikorodu businesses</p>
                </div>
              </div>
              <button
                onClick={() => setModalOpen(false)}
                className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-500 flex items-center justify-center font-bold text-sm transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Content Summary Card */}
            <div className="p-3.5 bg-emerald-50/70 rounded-2xl border border-emerald-200/80 space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800">Previewing Share</span>
              <p className="font-bold text-xs text-emerald-950 line-clamp-1">{title}</p>
              <p className="text-[11px] text-gray-600 line-clamp-2">{text}</p>
            </div>

            {/* Quick Share Options */}
            <div className="space-y-2.5">
              <span className="text-xs font-bold text-gray-700 block">Choose platform:</span>

              <a
                href={whatsappShareUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between p-3.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-bold text-xs shadow-sm transition-colors group"
              >
                <div className="flex items-center gap-2.5">
                  <MessageSquare className="w-5 h-5 text-amber-300" />
                  <span>Share via WhatsApp</span>
                </div>
                <ExternalLink className="w-4 h-4 text-emerald-200 group-hover:translate-x-0.5 transition-transform" />
              </a>

              <div className="grid grid-cols-2 gap-2">
                <a
                  href={facebookShareUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 p-3 bg-blue-50 hover:bg-blue-100 text-blue-900 rounded-2xl font-bold text-xs border border-blue-200 transition-colors"
                >
                  <span>Facebook</span>
                  <ExternalLink className="w-3.5 h-3.5 text-blue-600" />
                </a>

                <a
                  href={twitterShareUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 p-3 bg-slate-100 hover:bg-slate-200 text-slate-900 rounded-2xl font-bold text-xs border border-slate-200 transition-colors"
                >
                  <span>X / Twitter</span>
                  <ExternalLink className="w-3.5 h-3.5 text-slate-600" />
                </a>
              </div>
            </div>

            {/* Copy Direct Link Section */}
            <div className="pt-2 border-t space-y-2">
              <span className="text-xs font-bold text-gray-700 block">Direct Link:</span>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={shareUrl}
                  className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-600 font-mono focus:outline-none select-all"
                />
                <button
                  type="button"
                  onClick={handleCopyLink}
                  className={`px-4 py-2.5 font-bold text-xs rounded-xl flex items-center gap-1.5 shrink-0 transition-all shadow-xs ${
                    copied
                      ? 'bg-emerald-700 text-white'
                      : 'bg-emerald-800 hover:bg-emerald-900 text-white'
                  }`}
                >
                  {copied ? (
                    <>
                      <Check className="w-4 h-4 text-amber-300" />
                      <span>Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      <span>Copy</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            <div className="pt-1 text-center">
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="text-xs text-gray-500 hover:text-gray-700 font-semibold underline"
              >
                Close Window
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
