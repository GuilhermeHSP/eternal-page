'use client';

import { Suspense, useEffect, useState, useMemo } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  Eye,
  Edit3,
  CreditCard,
  Lock,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
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
      style: (draft.config?.style as TributeConfig['style']) || undefined,
      counter: (draft.config?.counter as TributeConfig['counter']) || undefined,
      reasons: (draft.config?.reasons as string[]) || undefined,
    };
  }, [draft]);

  // Get package info
  const selectedPackage = (draft?.packageType as PackageType) || 'basic';
  const packageInfo = PACKAGES[selectedPackage];

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
      {/* Preview Mode Header */}
      <div className="fixed top-0 left-0 right-0 z-[9999] bg-gradient-to-r from-amber-500 to-orange-500 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 bg-white/20 rounded-full px-4 py-1.5">
                <Eye className="h-4 w-4 text-white" />
                <span className="text-white font-medium text-sm">
                  Modo Preview — Revise sua Eternal Page
                </span>
              </div>
              <div className="flex items-center gap-1 bg-black/20 rounded-full px-3 py-1.5">
                <Lock className="h-3 w-3 text-white/80" />
                <span className="text-white/80 text-xs">Protegido</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="pt-20 pb-8">
        {/* Preview with watermark */}
        <div className="relative">
          <WatermarkOverlay />
          {tributeConfig && (
            <TributeViewer config={tributeConfig} slug={draft.slug || draft.id} showShare={false} showBackButton={false} />
          )}
        </div>

        {/* Action Buttons Section */}
        <div className="max-w-2xl mx-auto px-4 mt-8">
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-rose-500 to-pink-500 p-6 text-center">
              <h2 className="text-2xl font-serif font-medium text-white mb-2">
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
                  Editar Página
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
                      Finalização da Compra
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
