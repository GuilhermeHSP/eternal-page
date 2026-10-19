'use client';

import { Suspense, useEffect, useState, useMemo } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  Eye,
  Edit3,
  CreditCard,
  Lock,
  Sparkles,
  Check,
  Music,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { TributeViewer } from '@/components/tribute/tribute-viewer';
import { WatermarkOverlay } from '@/components/preview/watermark-overlay';
import { CheckoutDialog } from '@/components/checkout/checkout-dialog';
import { PACKAGES, PackageType, formatPrice } from '@/lib/packages';
import { TributeConfig } from '@/types/tribute';
import { planItem, track } from '@/lib/analytics';

interface DraftData {
  id: string;
  slug?: string;
  title: string;
  recipient: string;
  message?: string;
  heroImage?: string;
  musicUrl?: string;
  templateId: string;
  packageType?: string;
  closingMessage?: string;
  photos: Array<{ id?: string; url: string; caption?: string; order?: number }>;
  timeline: Array<{ id?: string; title: string; description?: string; year?: string; imageUrl?: string; order?: number }>;
  config?: Record<string, unknown>;
  isPaid?: boolean;
}

function PreviewContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [draft, setDraft] = useState<DraftData | null>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [upgrading, setUpgrading] = useState(false);
  const [upgraded, setUpgraded] = useState(false);
  const [upgradeError, setUpgradeError] = useState<string | null>(null);

  const draftId = searchParams.get('id');

  // Load draft data
  useEffect(() => {
    async function loadDraft() {
      if (!draftId) {
        router.push('/');
        return;
      }

      try {
        const response = await fetch(`/api/draft?id=${draftId}`);
        if (response.ok) {
          const data = await response.json();
          setDraft(data);
        } else {
          router.push('/');
        }
      } catch (error) {
        console.error('Error loading draft:', error);
        router.push('/');
      } finally {
        setLoading(false);
      }
    }

    loadDraft();
  }, [draftId, router]);

  // One preview view per draft opened (not again when the plan is switched).
  const draftLoadedId = draft?.id;
  useEffect(() => {
    if (!draftLoadedId || !draft || draft.isPaid) return;
    const pkg = PACKAGES[(draft.packageType as PackageType) || 'basic'] || PACKAGES.basic;
    track('view_item', { currency: 'BRL', value: pkg.price, items: [planItem(pkg.id, pkg.name, pkg.price)] });
  }, [draftLoadedId]);

  // Protection measures
  useEffect(() => {
    const blockContextMenu = (e: MouseEvent) => e.preventDefault();
    const blockKeys = (e: KeyboardEvent) => {
      if (e.key === 'PrintScreen') {
        navigator.clipboard.writeText('');
        e.preventDefault();
      }
      if (e.key === 'F12' || (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'J')) || (e.ctrlKey && e.key === 'U') || (e.ctrlKey && e.key === 's')) {
        e.preventDefault();
      }
    };

    document.addEventListener('contextmenu', blockContextMenu);
    document.addEventListener('keydown', blockKeys);

    return () => {
      document.removeEventListener('contextmenu', blockContextMenu);
      document.removeEventListener('keydown', blockKeys);
    };
  }, []);

  const handleEditPage = () => {
    router.push(`/?edit=${draftId}`);
  };

  // Switches the plan here or in the checkout, then reloads the page so the preview shows it
  // (Completo opens with the envelope). Returns an error message, or null when it worked.
  const changePackage = async (packageType: PackageType): Promise<string | null> => {
    if (!draft) return null;
    try {
      const res = await fetch('/api/draft/package', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ draftId: draft.id, packageType }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) return data.error || 'Não foi possível trocar o plano. Tente de novo.';
      const fresh = await fetch(`/api/draft?id=${draft.id}`);
      if (fresh.ok) setDraft(await fresh.json());
      return null;
    } catch {
      return 'Sem conexão. Confira a internet e tente de novo.';
    }
  };

  const upgrade = async () => {
    setUpgrading(true);
    setUpgradeError(null);
    const err = await changePackage('premium');
    setUpgrading(false);
    if (err) setUpgradeError(err);
    // The envelope opening shows right away, over the page, so the person sees what they got.
    else setUpgraded(true);
  };

  // Asks for the e-mail and goes to Mercado Pago; an already paid page goes to its link.
  const handleConfirmAndPay = () => {
    if (!draft) return;
    if (draft.isPaid) {
      setProcessing(true);
      router.push(`/finalize?draft_id=${draft.id}`);
      return;
    }
    setCheckoutOpen(true);
  };

  // Construct TributeConfig from draft data
  const tributeConfig = useMemo<TributeConfig | null>(() => {
    if (!draft) return null;

    return {
      title: draft.title,
      recipient: draft.recipient,
      template: draft.templateId,
      hero: draft.heroImage ? { image: draft.heroImage, overlay: true } : undefined,
      music: draft.musicUrl ? {
        url: draft.musicUrl,
        autoplay: false,
        title: (draft.config?.musicTitle as string) || undefined,
      } : undefined,
      message: draft.message ? {
        text: draft.message,
        typingAnimation: false,
      } : undefined,
      gallery: draft.photos?.map((p, i) => ({
        id: p.id || `photo-${i}`,
        url: p.url,
        caption: p.caption,
        order: p.order ?? i,
      })) || [],
      timeline: draft.timeline?.map((t, i) => ({
        id: t.id || `timeline-${i}`,
        title: t.title,
        description: t.description,
        year: t.year,
        imageUrl: t.imageUrl,
        order: t.order ?? i,
      })) || [],
      closingMessage: draft.closingMessage,
      style: (draft.config?.style as TributeConfig['style']) || undefined,
      counter: (draft.config?.counter as TributeConfig['counter']) || undefined,
      reasons: (draft.config?.reasons as string[]) || undefined,
      voiceMessage: (draft.config?.voiceMessage as string) || undefined,
      guestbook: draft.config?.guestbook === true,
      authorName: (draft.config?.authorName as string) || undefined,
      envelope: draft.config?.envelope === false ? false : undefined,
    };
  }, [draft]);

  // Get package info
  const selectedPackage = (draft?.packageType as PackageType) || 'basic';
  const packageInfo = PACKAGES[selectedPackage];
  const upgradePrice = PACKAGES.premium.price - PACKAGES.basic.price;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center"
        >
          <div className="w-12 h-12 border-4 border-rose-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Carregando preview...</p>
        </motion.div>
      </div>
    );
  }

  if (!draft) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <p className="text-gray-600">Rascunho não encontrado</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <CheckoutDialog
        open={checkoutOpen}
        onClose={() => setCheckoutOpen(false)}
        draftId={draft.id}
        recipient={draft.recipient}
        pkg={packageInfo}
        onChangePackage={changePackage}
      />
      {/* Preview Mode Header */}
      <div className="fixed top-0 left-0 right-0 z-[9999] bg-rose-500">
        <div className="max-w-7xl mx-auto px-4 py-3">
          {/* Buying is always one tap away, on phones too, instead of only at the end of the page */}
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0">
              <div className="flex items-center gap-1.5 bg-white/20 rounded-full px-3 py-1.5 min-w-0">
                <Eye className="h-4 w-4 shrink-0 text-white" />
                <span className="text-white font-medium text-sm truncate">
                  Prévia<span className="hidden sm:inline">: a marca d'água sai quando você publica</span>
                </span>
              </div>
              <div className="hidden md:flex items-center gap-1 bg-black/20 rounded-full px-3 py-1.5">
                <Lock className="h-3 w-3 text-white/80" />
                <span className="text-white/80 text-xs">Ainda não publicada</span>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={handleEditPage}
                aria-label="Editar página"
                className="h-9 px-3 rounded-full border border-white/50 text-white text-sm font-medium inline-flex items-center gap-1.5 hover:bg-white/10"
              >
                <Edit3 className="h-4 w-4" />
                <span className="hidden sm:inline">Editar</span>
              </button>
              <button
                type="button"
                onClick={handleConfirmAndPay}
                disabled={processing}
                className="h-9 px-4 rounded-full bg-white text-rose-600 text-sm font-semibold inline-flex items-center gap-1.5 shadow-sm hover:bg-rose-50 disabled:opacity-70"
              >
                {processing ? (
                  <span className="w-4 h-4 border-2 border-rose-500 border-t-transparent rounded-full animate-spin" />
                ) : (
                  <CreditCard className="h-4 w-4" />
                )}
                {draft.isPaid ? 'Ver link' : `Finalizar · ${formatPrice(packageInfo.price)}`}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className={`pt-20 ${tributeConfig?.music?.url ? 'pb-28' : 'pb-8'}`}>
        {/* Preview with watermark */}
        <div className="relative">
          <WatermarkOverlay />
          {tributeConfig && (
            <TributeViewer config={tributeConfig} slug={draft.slug || draft.id} live={false} showIntro={packageInfo.limits.envelope && tributeConfig.envelope !== false} />
          )}
        </div>

        {/* Action Buttons Section */}
        <div className="max-w-2xl mx-auto px-4 mt-8 space-y-6">
          {/* Upsell while the person is looking at their own page: what Completo adds, unlocked
              here without going back to the editor. */}
          {!draft.isPaid && selectedPackage === 'basic' && (
            <div className="bg-white rounded-2xl shadow-xl ring-1 ring-rose-200 p-6">
              <p className="text-xs uppercase tracking-[0.2em] text-rose-500 font-semibold">Deixe a página completa</p>
              <h2 className="mt-1 text-2xl font-title font-semibold text-gray-900">
                Mais emoção por + {formatPrice(upgradePrice)}
              </h2>
              <ul className="mt-4 space-y-2 text-gray-700">
                {[
                  'Abertura com envelope surpresa',
                  'Música de fundo',
                  'Mensagem com a sua voz',
                  `Até ${PACKAGES.premium.limits.momentsPhotos} fotos e momentos com foto`,
                  'No ar para sempre (o Básico fica 1 ano)',
                ].map((item) => (
                  <li key={item} className="flex items-center gap-2.5">
                    <span className="shrink-0 w-7 h-7 rounded-full bg-rose-50 text-rose-500 inline-flex items-center justify-center">
                      <Lock className="h-3.5 w-3.5" />
                    </span>
                    {item}
                  </li>
                ))}
              </ul>
              {upgradeError && <p className="mt-4 text-sm text-red-600">{upgradeError}</p>}
              <Button
                size="lg"
                onClick={upgrade}
                disabled={upgrading}
                className="mt-5 w-full gap-2 bg-rose-500 hover:bg-rose-600 text-white"
              >
                {upgrading ? (
                  <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Sparkles className="h-5 w-5" />
                )}
                Liberar por + {formatPrice(upgradePrice)}
              </Button>
              <p className="mt-2 text-center text-xs text-gray-500">
                Pagamento único de {formatPrice(PACKAGES.premium.price)} no total. Nada é cobrado agora.
              </p>
            </div>
          )}

          {upgraded && selectedPackage !== 'basic' && !draft.isPaid && (
            <div className="bg-white rounded-2xl shadow-xl ring-1 ring-rose-200 p-6 text-center">
              <span className="mx-auto w-10 h-10 rounded-full bg-rose-500 text-white inline-flex items-center justify-center">
                <Check className="h-5 w-5" />
              </span>
              <h2 className="mt-3 text-xl font-title font-semibold text-gray-900">Pronto, a página agora é Completa</h2>
              <p className="mt-1 text-gray-600">Ela já abre com o envelope surpresa. Quer colocar a música de vocês e a sua voz?</p>
              <Button
                variant="outline"
                size="lg"
                onClick={() => router.push(`/?edit=${draft.id}&etapa=6`)}
                className="mt-4 gap-2 border-rose-200 text-rose-600"
              >
                <Music className="h-5 w-5" />
                Adicionar música e voz
              </Button>
            </div>
          )}

          <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-rose-500 to-rose-500 p-6 text-center">
              <h2 className="text-2xl font-title font-semibold text-white mb-2">
                Gostou da sua página?
              </h2>
              <p className="text-white/80">
                Plano selecionado: <strong>{packageInfo.displayName}</strong> — {formatPrice(packageInfo.price)}
              </p>
            </div>

            {/* Action Buttons */}
            <div className="p-6">
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button
                  variant="outline"
                  size="lg"
                  onClick={handleEditPage}
                  className="gap-2"
                >
                  <Edit3 className="h-5 w-5" />
                  Editar página
                </Button>
                <Button
                  size="lg"
                  onClick={handleConfirmAndPay}
                  disabled={processing}
                  className="gap-2 bg-rose-500 hover:bg-rose-600 text-white px-8"
                >
                  {processing ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Processando...
                    </>
                  ) : (
                    <>
                      <CreditCard className="h-5 w-5" />
                      Finalizar compra
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function PreviewPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center"
        >
          <div className="w-12 h-12 border-4 border-rose-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Carregando preview...</p>
        </motion.div>
      </div>
    }>
      <PreviewContent />
    </Suspense>
  );
}
