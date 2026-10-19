// Google Analytics 4. Set NEXT_PUBLIC_GA_ID (G-XXXXXXXXXX) in the environment before building;
// without it nothing is loaded and track() does nothing.
const RAW_GA_ID = (process.env.NEXT_PUBLIC_GA_ID || '').trim();
export const GA_ID = /^G-[A-Z0-9]+$/.test(RAW_GA_ID) ? RAW_GA_ID : '';

// Where the visitor's answer to the cookie banner is kept: 'granted' or 'denied'.
export const CONSENT_KEY = 'ep_analytics_consent';

type Gtag = (...args: unknown[]) => void;

declare global {
  interface Window {
    gtag?: Gtag;
    dataLayer?: unknown[];
  }
}

export function track(event: string, params: Record<string, unknown> = {}) {
  if (!GA_ID || typeof window === 'undefined' || !window.gtag) return;
  window.gtag('event', event, params);
}

export function setAnalyticsConsent(granted: boolean) {
  try {
    localStorage.setItem(CONSENT_KEY, granted ? 'granted' : 'denied');
  } catch {}
  window.gtag?.('consent', 'update', { analytics_storage: granted ? 'granted' : 'denied' });
}

// GA4 e-commerce item for a plan, used by the preview, checkout and purchase events.
export function planItem(id: string, name: string, price: number) {
  return { item_id: id, item_name: `Homenagem ${name}`, item_category: 'Homenagem', price, quantity: 1 };
}

// Runs in <head> before anything else, so events sent while gtag.js is still loading are queued
// and the consent default applies to them. Analytics cookies stay off until the visitor accepts;
// ads storage is always denied.
export function gaInitScript(id: string) {
  return `window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}window.gtag=gtag;
var c=null;try{c=localStorage.getItem('${CONSENT_KEY}')}catch(e){}
gtag('consent','default',{analytics_storage:c==='granted'?'granted':'denied',ad_storage:'denied',ad_user_data:'denied',ad_personalization:'denied'});
gtag('js',new Date());gtag('config','${id}');`;
}
