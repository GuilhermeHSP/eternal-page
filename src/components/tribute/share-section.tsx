'use client';

import { useEffect, useState } from 'react';

interface ShareSectionProps {
  slug: string;
  title: string;
  accentColor: string;
  groundColor: string;
}

export function ShareSection({ slug, title, accentColor, groundColor }: ShareSectionProps) {
  const [copied, setCopied] = useState(false);
  // The full address is only known in the browser; set it after hydration so server and
  // client render the same markup first.
  const [shareUrl, setShareUrl] = useState(`/${slug}`);
  useEffect(() => {
    setShareUrl(`${window.location.origin}/${slug}`);
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
    if (navigator.share) {
      try {
        await navigator.share({ title, url: shareUrl });
      } catch {
        // cancelled
      }
    } else {
      handleCopy();
    }
  };

  const whatsappHref = `https://wa.me/?text=${encodeURIComponent(`${title}\n${shareUrl}`)}`;
  const facebookHref = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`;

  const button = 'press h-12 px-5 inline-flex items-center text-step-body font-medium';

  return (
    <section className="px-4 md:px-8 py-[clamp(72px,9vw,144px)]">
      <div className="mx-auto max-w-[1376px] grid md:grid-cols-12 gap-8 md:gap-6">
        <h2 className="md:col-span-3 text-step-head" style={{ color: accentColor }} data-reveal>
          Envie a página
        </h2>
        <div className="md:col-start-5 md:col-span-7" data-reveal style={{ '--i': 1 } as React.CSSProperties}>
          <label htmlFor="share-url" className="block text-step-small mb-2" style={{ color: '#55504c' }}>
            Endereço desta homenagem
          </label>
          <div className="flex flex-col sm:flex-row gap-1">
            <input
              id="share-url"
              type="text"
              value={shareUrl}
              readOnly
              onFocus={(e) => e.currentTarget.select()}
              className="flex-1 min-w-0 h-12 px-4 bg-white/60 text-step-body outline-none tabular-nums"
              style={{ color: '#1d1b1a' }}
            />
            <button type="button" onClick={handleCopy} className={button} style={{ backgroundColor: accentColor, color: groundColor }}>
              {copied ? 'Copiado' : 'Copiar link'}
            </button>
          </div>
          <div className="mt-3 flex flex-wrap gap-1">
            <a href={whatsappHref} target="_blank" rel="noreferrer" className={`${button} bg-white/60`} style={{ color: accentColor }}>
              WhatsApp
            </a>
            <a href={facebookHref} target="_blank" rel="noreferrer" className={`${button} bg-white/60`} style={{ color: accentColor }}>
              Facebook
            </a>
            <button type="button" onClick={handleNativeShare} className={`${button} bg-white/60`} style={{ color: accentColor }}>
              Outros apps
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
