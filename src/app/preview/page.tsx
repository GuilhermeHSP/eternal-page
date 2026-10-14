'use client';

import { Suspense, useEffect, useState, useMemo } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  Eye,
  Edit3,
  CreditCard,
} from 'lucide-react';
import { TributeViewer } from '@/components/tribute/tribute-viewer';
import { WatermarkOverlay } from '@/components/preview/watermark-overlay';
import { PACKAGES, PackageType, formatPrice } from '@/lib/packages';
import { TributeConfig } from '@/types/tribute';

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
}

function PreviewContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [draft, setDraft] = useState<DraftData | null>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);

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
    const handleVisibilityChange = () => {
      document.body.style.filter = document.hidden ? 'blur(15px)' : 'none';
    };

    document.addEventListener('contextmenu', blockContextMenu);
    document.addEventListener('keydown', blockKeys);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('contextmenu', blockContextMenu);
      document.removeEventListener('keydown', blockKeys);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      document.body.style.filter = 'none';
    };
  }, []);

  const handleEditPage = () => {
    router.push(`/?edit=${draftId}`);
  };

  const handleConfirmAndPay = async () => {
    if (!draft) return;

    setProcessing(true);

    try {
      // Navigate to finalize with the selected package from draft
      const pkgType = draft.packageType || 'basic';
      router.push(`/finalize?draft_id=${draft.id}&package=${pkgType}`);
    } catch (error) {
      console.error('Payment error:', error);
      setProcessing(false);
    }
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
    };
  }, [draft]);

  // Get package info
  const selectedPackage = (draft?.packageType as PackageType) || 'basic';
  const packageInfo = PACKAGES[selectedPackage];

  if (loading) {
    return (
      <div className="min-h-[100svh] flex items-center justify-center bg-tone">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center"
        >
          <div className="w-12 h-12 border-4 border-ink border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-soft">Carregando preview...</p>
        </motion.div>
      </div>
    );
  }

  if (!draft) {
    return (
      <div className="min-h-[100svh] flex items-center justify-center bg-tone">
        <p className="text-soft">Rascunho não encontrado</p>
      </div>
    );
  }

  return (
    <div className="min-h-[100svh] bg-tone">
      {/* Preview Mode Header */}
      <div className="fixed top-0 left-0 right-0 z-[9999] bg-ink">
        <div className="max-w-[1376px] mx-auto px-4 md:px-8 py-3 flex items-center justify-between flex-wrap gap-3">
          <p className="flex items-center gap-2 text-paper text-step-small font-medium">
            <Eye className="h-4 w-4" />
            Prévia, ainda não publicada
          </p>
          <div className="flex gap-1">
            <button
              type="button"
              onClick={handleEditPage}
              className="press h-10 px-4 bg-deep text-paper text-step-small font-medium hover:bg-soft"
            >
              Editar
            </button>
            <button
              type="button"
              onClick={handleConfirmAndPay}
              disabled={processing}
              className="press h-10 px-4 bg-paper text-ink text-step-small font-medium hover:bg-tone disabled:opacity-60"
            >
              Publicar por {formatPrice(packageInfo.price)}
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="pt-16">
        {/* Preview with watermark */}
        <div className="relative">
          <WatermarkOverlay />
          {tributeConfig && (
            <TributeViewer config={tributeConfig} slug={draft.slug || draft.id} showShare={false} showBackButton={false} />
          )}
        </div>

        {/* Action Buttons Section */}
        <div className="bg-ink text-paper px-4 md:px-8 py-[clamp(72px,9vw,144px)]">
          <div className="max-w-[1376px] mx-auto grid md:grid-cols-12 gap-8 md:gap-6">
            <div className="md:col-span-6">
              <h2 className="text-step-head">Gostou da página?</h2>
              <p className="mt-4 text-step-body">
                Pacote {packageInfo.displayName}, {formatPrice(packageInfo.price)} em pagamento único. Ao publicar,
                a marca d’água sai e você recebe o link para enviar.
              </p>
            </div>
            <div className="md:col-start-8 md:col-span-5 self-end">
              <div className="flex flex-col sm:flex-row gap-1">
                <button
                  type="button"
                  onClick={handleEditPage}
                  className="press h-14 px-6 inline-flex items-center justify-center gap-2 bg-deep text-paper text-step-body font-medium hover:bg-soft"
                >
                  <Edit3 className="h-5 w-5" />
                  Editar página
                </button>
                <button
                  type="button"
                  onClick={handleConfirmAndPay}
                  disabled={processing}
                  className="press h-14 px-6 inline-flex items-center justify-center gap-2 bg-paper text-ink text-step-body font-medium hover:bg-tone disabled:opacity-60"
                >
                  {processing ? (
                    <>
                      <span className="w-5 h-5 border-2 border-ink border-t-transparent rounded-full animate-spin" />
                      Processando
                    </>
                  ) : (
                    <>
                      <CreditCard className="h-5 w-5" />
                      Publicar a página
                    </>
                  )}
                </button>
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
      <div className="min-h-[100svh] flex items-center justify-center bg-tone">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center"
        >
          <div className="w-12 h-12 border-4 border-ink border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-soft">Carregando preview...</p>
        </motion.div>
      </div>
    }>
      <PreviewContent />
    </Suspense>
  );
}
