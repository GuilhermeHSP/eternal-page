'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { CONSENT_KEY, GA_ID, setAnalyticsConsent } from '@/lib/analytics';

// Pages where the buyer browses and pays. A tribute page (/{slug}) is a gift being opened, so the
// banner never shows there; analytics on it stays in cookieless mode unless the visitor accepted before.
const SHOW_ON = ['/', '/preview', '/finalize', '/previa-ao-vivo', '/contato', '/termos', '/privacidade', '/cookies'];

export function ConsentBanner() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    // Not inside the phone mockups on the home, which embed the site in an iframe.
    if (!GA_ID || window.self !== window.top) return;
    try {
      if (!localStorage.getItem(CONSENT_KEY)) setOpen(true);
    } catch {}
  }, []);

  if (!open || !SHOW_ON.includes(pathname)) return null;

  const answer = (granted: boolean) => {
    setAnalyticsConsent(granted);
    setOpen(false);
  };

  return (
    <div className="fixed inset-x-0 bottom-0 z-[9998] p-3 sm:p-4 pointer-events-none">
      <div className="pointer-events-auto mx-auto max-w-xl rounded-2xl border border-rose-100 bg-white/95 backdrop-blur shadow-xl px-4 py-3 sm:flex sm:items-center sm:gap-4">
        <p className="text-xs leading-relaxed text-gray-600 sm:flex-1">
          Usamos cookies de análise do Google para entender como o site é usado e melhorá-lo. Nada de publicidade.{' '}
          <a href="/cookies" className="underline text-rose-600">Saiba mais</a>
        </p>
        <div className="mt-2 flex gap-2 sm:mt-0 shrink-0">
          <button type="button" onClick={() => answer(false)} className="h-9 px-4 rounded-full text-sm text-gray-600 hover:bg-gray-100">
            Recusar
          </button>
          <button type="button" onClick={() => answer(true)} className="h-9 px-4 rounded-full bg-rose-500 text-white text-sm font-semibold">
            Aceitar
          </button>
        </div>
      </div>
    </div>
  );
}
