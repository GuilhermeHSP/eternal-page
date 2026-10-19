'use client';

import { useEffect, useRef, useState } from 'react';
import { Lock, Mail, ShieldCheck, Sparkles, Ticket, X } from 'lucide-react';
import { PACKAGES, formatPrice, type PackageConfig, type PackageType } from '@/lib/packages';
import { planItem, track } from '@/lib/analytics';

interface CheckoutDialogProps {
  open: boolean;
  onClose: () => void;
  draftId: string;
  recipient: string;
  pkg: PackageConfig;
  // Switches the draft's plan; resolves to an error message, or null when it worked.
  onChangePackage?: (packageType: PackageType) => Promise<string | null>;
}

const UPGRADE_PRICE = PACKAGES.premium.price - PACKAGES.basic.price;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

// Asks for the e-mail that receives the link and opens the Mercado Pago
// payment page. Shown above the preview's pink bar, so it is a plain overlay with a high z-index.
export function CheckoutDialog({ open, onClose, draftId, recipient, pkg, onChangePackage }: CheckoutDialogProps) {
  const [switching, setSwitching] = useState(false);
  const [email, setEmail] = useState('');
  const [coupon, setCoupon] = useState('');
  const [showCoupon, setShowCoupon] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const emailRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) return;
    track('begin_checkout', { currency: 'BRL', value: pkg.price, items: [planItem(pkg.id, pkg.name, pkg.price)] });
  }, [open]);

  useEffect(() => {
    if (!open) return;
    try {
      const saved = localStorage.getItem('ep_buyer_email');
      if (saved) setEmail(saved);
    } catch {}
    const linkCoupon = new URLSearchParams(window.location.search).get('cupom');
    if (linkCoupon !== null) {
      setShowCoupon(true);
      if (linkCoupon) setCoupon(linkCoupon);
    }
    const t = setTimeout(() => emailRef.current?.focus(), 50);
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && !sending && onClose();
    window.addEventListener('keydown', onKey);
    return () => {
      clearTimeout(t);
      window.removeEventListener('keydown', onKey);
    };
  }, [open, onClose, sending]);

  if (!open) return null;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const clean = email.trim();
    if (!EMAIL_RE.test(clean)) {
      setError('Confira o seu e-mail: é para ele que enviamos o link da homenagem.');
      emailRef.current?.focus();
      return;
    }
    setError(null);
    setSending(true);
    try {
      localStorage.setItem('ep_buyer_email', clean);
    } catch {}
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ draftId, email: clean, coupon: coupon.trim() || undefined }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.url) {
        setError(data.error || 'Não foi possível abrir o pagamento. Tente de novo.');
        setSending(false);
        return;
      }
      window.location.href = data.url;
    } catch {
      setError('Sem conexão. Confira a internet e tente de novo.');
      setSending(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[10000] flex items-end sm:items-center justify-center bg-black/50 p-0 sm:p-4" role="dialog" aria-modal="true" aria-labelledby="checkout-title">
      <div className="w-full sm:max-w-md bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden">
        <div className="relative px-6 pt-6 pb-4 text-center border-b border-rose-100">
          <button
            type="button"
            onClick={onClose}
            disabled={sending}
            aria-label="Fechar"
            className="absolute right-4 top-4 h-9 w-9 rounded-full inline-flex items-center justify-center text-gray-400 hover:bg-gray-100"
          >
            <X className="h-5 w-5" />
          </button>
          <p className="text-[11px] tracking-[0.25em] uppercase text-gray-400">Finalizar homenagem para</p>
          <h2 id="checkout-title" className="font-script text-4xl text-rose-500 mt-1" style={{ fontFamily: "'Great Vibes', cursive" }}>
            {recipient}
          </h2>
          <div className="mt-3 inline-flex items-center gap-2 rounded-full bg-rose-50 px-4 py-1.5 text-sm text-gray-700">
            Plano <strong>{pkg.name}</strong> · <strong className="text-rose-600">{formatPrice(pkg.price)}</strong>
          </div>
        </div>

        {/* The plan was chosen in the creator; a Básico buyer is only offered the step up, which
            needs no editing (everything on a Básico page fits Completo). */}
        {onChangePackage && pkg.id === 'basic' && (
          <div className="mx-6 mt-5 flex items-center gap-3 rounded-2xl border border-rose-200 bg-rose-50/60 px-4 py-3">
            <Sparkles className="h-5 w-5 shrink-0 text-rose-500" />
            <p className="flex-1 text-xs leading-snug text-gray-700">
              <strong className="block text-sm text-gray-900">Completo por + {formatPrice(UPGRADE_PRICE)}</strong>
              Envelope surpresa, música, sua voz e no ar para sempre.
            </p>
            <button
              type="button"
              disabled={sending || switching}
              onClick={async () => {
                setSwitching(true);
                setError(null);
                const err = await onChangePackage('premium');
                setSwitching(false);
                if (err) setError(err);
              }}
              className="shrink-0 h-9 px-4 rounded-full bg-rose-500 text-white text-sm font-semibold inline-flex items-center gap-1.5 disabled:opacity-70"
            >
              {switching && <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />}
              Trocar
            </button>
          </div>
        )}

        <form onSubmit={submit} className="px-6 pt-5 pb-6 space-y-4" noValidate>
          <div>
            <label htmlFor="checkout-email" className="flex items-center gap-1.5 text-sm font-medium text-gray-800">
              <Mail className="h-4 w-4 text-rose-500" /> Seu e-mail
            </label>
            <p className="text-xs text-gray-500 mt-0.5">Enviamos o link e o QR code da homenagem para ele.</p>
            <input
              ref={emailRef}
              id="checkout-email"
              type="email"
              inputMode="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="voce@email.com"
              className={`mt-2 w-full h-12 rounded-xl border px-4 text-base outline-none focus:ring-2 focus:ring-rose-200 ${error ? 'border-red-400' : 'border-gray-200 focus:border-rose-400'}`}
            />
          </div>

          {/* The coupon field only shows for links that carry ?cupom=, so buyers aren't sent off
              hunting for codes that don't exist. */}
          {showCoupon ? (
            <div>
              <label htmlFor="checkout-coupon" className="flex items-center gap-1.5 text-sm font-medium text-gray-800">
                <Ticket className="h-4 w-4 text-rose-500" /> Cupom
              </label>
              <input
                id="checkout-coupon"
                type="text"
                autoComplete="off"
                autoCapitalize="characters"
                value={coupon}
                onChange={(e) => setCoupon(e.target.value)}
                className="mt-2 w-full h-12 rounded-xl border border-gray-200 px-4 text-base uppercase outline-none focus:border-rose-400 focus:ring-2 focus:ring-rose-200"
              />
            </div>
          ) : null}

          {error && <p className="text-sm text-red-600">{error}</p>}

          {/* On phones the bank step often opens the Mercado Pago app; say so before it happens. */}
          <div className="flex gap-3 rounded-2xl border border-sky-100 bg-sky-50 px-4 py-3 text-left">
            <ShieldCheck className="h-5 w-5 shrink-0 text-sky-600 mt-0.5" />
            <div className="text-xs leading-relaxed text-gray-700">
              <p className="font-semibold text-gray-900">O pagamento é feito no Mercado Pago</p>
              <p className="mt-0.5">
                Ao tocar em pagar, você vai para a página oficial do <strong>Mercado Pago</strong>. No celular, pode
                aparecer o aviso <strong>&ldquo;Abrir no app Mercado Pago?&rdquo;</strong>: pode aceitar, é o nosso
                pagamento. Se preferir, continue pelo navegador. Depois do pagamento você volta para cá.
              </p>
            </div>
          </div>

          <button
            type="submit"
            disabled={sending || switching}
            className="w-full h-12 rounded-full bg-rose-500 hover:bg-rose-600 text-white font-semibold inline-flex items-center justify-center gap-2 disabled:opacity-70"
          >
            {sending ? (
              <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <Lock className="h-4 w-4" />
            )}
            {coupon.trim()
              ? sending ? 'Publicando...' : 'Usar cupom e publicar'
              : sending ? 'Abrindo o Mercado Pago...' : `Pagar ${formatPrice(pkg.price)} no Mercado Pago`}
          </button>
          <p className="text-center text-xs text-gray-500">
            Pagamento seguro pelo Mercado Pago · Pix ou cartão
            <br />
            <span className="font-medium text-gray-600">Garantia de 7 dias:</span> se mudar de ideia, devolvemos 100%.
          </p>
          <p className="text-center text-[11px] leading-relaxed text-gray-400">
            Ao continuar, você concorda com os{' '}
            <a href="/termos" target="_blank" rel="noopener noreferrer" className="underline underline-offset-2 hover:text-rose-600">Termos de Uso</a>{' '}
            e a{' '}
            <a href="/privacidade" target="_blank" rel="noopener noreferrer" className="underline underline-offset-2 hover:text-rose-600">Política de Privacidade</a>.
          </p>
        </form>
      </div>
    </div>
  );
}
