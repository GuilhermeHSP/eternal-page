'use client';

import { useEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';
import { CONSENT_KEY, GA_ID, setAnalyticsConsent } from '@/lib/analytics';

// Pages where the buyer browses and pays. A tribute page (/{slug}) is a gift being opened, so the
// banner never shows there; analytics on it stays in cookieless mode unless the visitor accepted before.
const SHOW_ON = ['/', '/preview', '/finalize', '/previa-ao-vivo', '/contato', '/termos', '/privacidade', '/cookies'];

// A slim bar at the very bottom. While it is open its height is published as --consent-h, so the
// bars pinned to the bottom (the home's "Criar" button, the creator's actions) sit right above it.
export function ConsentBanner() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const barRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Not inside the phone mockups on the home, which embed the site in an iframe.
    if (!GA_ID || window.self !== window.top) return;
    try {
      if (!localStorage.getItem(CONSENT_KEY)) setOpen(true);
    } catch {}
  }, []);

  const visible = open && SHOW_ON.includes(pathname);

  useEffect(() => {
    const root = document.documentElement;
    const bar = barRef.current;
    if (!visible || !bar) {
      root.style.removeProperty('--consent-h');
      return;
    }
    const sync = () => root.style.setProperty('--consent-h', `${bar.offsetHeight}px`);
    sync();
    const ro = new ResizeObserver(sync);
    ro.observe(bar);
    return () => {
      ro.disconnect();
      root.style.removeProperty('--consent-h');
    };
  }, [visible]);

  if (!visible) return null;

  const answer = (granted: boolean) => {
    setAnalyticsConsent(granted);
    setOpen(false);
  };

  return (
    <div
      ref={barRef}
      role="region"
      aria-label="Aviso de cookies"
      className="fixed inset-x-0 bottom-0 z-[9998] border-t border-gray-200 bg-white/95 backdrop-blur pb-[env(safe-area-inset-bottom)]"
    >
      <div className="mx-auto flex max-w-3xl items-center gap-3 px-4 py-2">
        <p className="flex-1 text-[11px] leading-snug text-gray-500 sm:text-xs">
          Usamos cookies de análise para melhorar o site.{' '}
          <a href="/cookies" className="underline text-gray-700">Saiba mais</a>
        </p>
        <button type="button" onClick={() => answer(false)} className="h-8 shrink-0 px-2 text-xs text-gray-500 hover:text-gray-800">
          Recusar
        </button>
        <button type="button" onClick={() => answer(true)} className="h-8 shrink-0 rounded-full bg-rose-500 px-4 text-xs font-semibold text-white">
          Aceitar
        </button>
      </div>
    </div>
  );
}
