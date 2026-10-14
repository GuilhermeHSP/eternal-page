'use client';

import { useEffect, useState } from 'react';
import { Check, Copy, Share2, MessageCircle, Facebook } from 'lucide-react';

interface ShareSectionProps {
  slug: string;
  title: string;
  accentColor: string;
}

// A single card: WhatsApp first (how most people send it), then copy link and other apps.
export function ShareSection({ slug, title, accentColor }: ShareSectionProps) {
  const [copied, setCopied] = useState(false);
  const [canNativeShare, setCanNativeShare] = useState(false);
  // The full address is only known in the browser; set it after hydration so server and
  // client render the same markup first.
  const [shareUrl, setShareUrl] = useState(`/${slug}`);
  useEffect(() => {
    setShareUrl(`${window.location.origin}/${slug}`);
    setCanNativeShare(typeof navigator.share === 'function');
  }, [slug]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleNativeShare = async () => {
    try {
      await navigator.share({ title, url: shareUrl });
    } catch {
      // cancelled
    }
  };

  const whatsappHref = `https://wa.me/?text=${encodeURIComponent(`${title}\n${shareUrl}`)}`;
  const facebookHref = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`;
  const displayUrl = shareUrl.replace(/^https?:\/\//, '');

  const secondary =
    'flex-1 inline-flex items-center justify-center gap-2 h-11 rounded-xl text-sm font-medium bg-white ring-1 ring-black/5 hover:ring-black/10 transition-colors';

  return (
    <section className="px-4 py-20">
      <div
        className="max-w-md mx-auto rounded-3xl bg-white/80 p-7 md:p-9 text-center"
        style={{ boxShadow: '0 1px 2px rgba(60,40,30,0.05), 0 20px 48px -20px rgba(60,40,30,0.25)' }}
      >
        <p className="font-title text-xs uppercase tracking-[0.25em] text-gray-500">Compartilhe</p>
        <h3 className="font-script text-4xl md:text-5xl text-gray-800 mt-2">Envie com carinho</h3>
        <p className="mt-3 text-sm text-gray-500">Mande esta página para quem você ama.</p>

        <a
          href={whatsappHref}
          target="_blank"
          rel="noreferrer"
          className="mt-7 w-full inline-flex items-center justify-center gap-2 h-12 rounded-xl text-white font-medium transition-transform active:scale-[0.98]"
          style={{ backgroundColor: accentColor }}
        >
          <MessageCircle className="h-5 w-5" />
          Enviar pelo WhatsApp
        </a>

        <div className="mt-3 flex gap-2">
          <button type="button" onClick={handleCopy} className={secondary} style={{ color: accentColor }}>
            {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            {copied ? 'Copiado' : 'Copiar link'}
          </button>
          {canNativeShare ? (
            <button type="button" onClick={handleNativeShare} className={secondary} style={{ color: accentColor }}>
              <Share2 className="h-4 w-4" />
              Outros apps
            </button>
          ) : (
            <a href={facebookHref} target="_blank" rel="noreferrer" className={secondary} style={{ color: accentColor }}>
              <Facebook className="h-4 w-4" />
              Facebook
            </a>
          )}
        </div>

        <p className="mt-5 text-xs text-gray-400 truncate" title={shareUrl}>
          {displayUrl}
        </p>
      </div>
    </section>
  );
}
