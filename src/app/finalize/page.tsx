'use client';

import { Suspense, useEffect, useState, useMemo } from 'react';
import { QrCard } from '@/components/tribute/qr-card';
import { useSearchParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  CheckCircle,
  Heart,
  Copy,
  ExternalLink,
  Share2,
  Sparkles,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PACKAGES, PackageType, formatPrice } from '@/lib/packages';

function FinalizeContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [finalizing, setFinalizing] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [slug, setSlug] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [recipient, setRecipient] = useState<string | undefined>();
  const [origin, setOrigin] = useState('');
  useEffect(() => setOrigin(window.location.origin), []);

  const draftId = searchParams.get('draft_id');
  const packageType = (searchParams.get('package') || 'plus') as PackageType;

  const pkg = useMemo(() => {
    return PACKAGES[packageType] || PACKAGES.plus;
  }, [packageType]);

  useEffect(() => {
    async function finalizeTribute() {
      if (!draftId) {
        setError('Missing draft information');
        setFinalizing(false);
        return;
      }

      try {
        const response = await fetch('/api/finalize', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            draftId,
            packageType,
          }),
        });

        if (response.ok) {
          const data = await response.json();
          setSlug(data.slug);
          // The name goes on the printable QR card
          fetch(`/api/draft?id=${draftId}`)
            .then((r) => (r.ok ? r.json() : null))
            .then((d) => d?.recipient && setRecipient(d.recipient))
            .catch(() => {});
        } else {
          const data = await response.json();
          setError(data.error || 'Failed to finalize tribute');
        }
      } catch (err) {
        console.error('Finalization error:', err);
        setError('Failed to finalize tribute');
      } finally {
        setFinalizing(false);
      }
    }

    finalizeTribute();
  }, [draftId, packageType]);

  const handleCopyLink = () => {
    const url = `${window.location.origin}/${slug}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleViewPage = () => {
    window.open(`/${slug}`, '_blank');
  };

  const handleShareWhatsApp = () => {
    const url = `${window.location.origin}/${slug}`;
    const text = `Confira esta linda página de homenagem que criei! ❤️`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text + ' ' + url)}`, '_blank');
  };

  if (finalizing) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-white via-green-50/30 to-white px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center max-w-md"
        >
          <div className="w-20 h-20 border-4 border-green-500 border-t-transparent rounded-full animate-spin mx-auto mb-6" />
          <h2 className="text-2xl font-serif font-medium text-gray-800 mb-2">
            Finalizando sua Eternal Page...
          </h2>
          <p className="text-gray-500">
            Por favor, aguarde enquanto criamos sua página permanente
          </p>
        </motion.div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-white via-red-50/30 to-white px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center max-w-md"
        >
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h2 className="text-2xl font-serif font-medium text-gray-800 mb-2">
            Algo deu errado
          </h2>
          <p className="text-gray-500 mb-6">{error}</p>
          <Button onClick={() => router.push('/')} variant="outline">
            Voltar para o início
          </Button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-white via-green-50/30 to-white px-4 py-12">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-lg w-full"
      >
        {/* Success card */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          {/* Success header */}
          <div className="bg-gradient-to-r from-green-500 to-emerald-500 p-8 text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring' }}
              className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-4"
            >
              <CheckCircle className="h-10 w-10 text-green-500" />
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <h1 className="text-2xl font-serif font-medium text-white mb-2">
                Pagamento Confirmado!
              </h1>
              <p className="text-white/80">
                Sua Eternal Page está pronta para compartilhar
              </p>
            </motion.div>
          </div>

          {/* Package info */}
          <div className="px-6 pt-6">
            <div className="bg-gray-50 rounded-xl p-4 mb-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-rose-100 rounded-full flex items-center justify-center">
                    <Heart className="h-5 w-5 text-rose-500" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800">{pkg.displayName}</p>
                    <p className="text-sm text-gray-500">Pacote Eternal Page</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-gray-800">{formatPrice(pkg.price)}</p>
                  <p className="text-xs text-gray-400">pagamento único</p>
                </div>
              </div>
            </div>
          </div>

          {/* Link section */}
          <div className="px-6 pb-6">
            <div className="bg-gray-50 rounded-xl p-4 mb-6">
              <p className="text-xs text-gray-400 mb-2 uppercase tracking-wide font-medium">
                Link da sua Eternal Page
              </p>
              <div className="flex items-center gap-2">
                <div className="flex-1 bg-white rounded-lg border border-gray-200 px-3 py-2 overflow-hidden">
                  <p className="text-sm text-gray-600 truncate font-mono">
                    {typeof window !== 'undefined' ? window.location.origin : ''}/{slug}
                  </p>
                </div>
                <Button
                  size="icon"
                  variant="outline"
                  onClick={handleCopyLink}
                  className="shrink-0"
                >
                  {copied ? (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>

            {/* Action buttons */}
            <div className="space-y-3">
              <Button
                className="w-full gap-2 bg-rose-500 hover:bg-rose-600 text-white"
                size="lg"
                onClick={handleViewPage}
              >
                <ExternalLink className="h-5 w-5" />
                Ver sua Eternal Page
              </Button>

              <Button
                variant="outline"
                className="w-full gap-2"
                size="lg"
                onClick={handleShareWhatsApp}
              >
                <Share2 className="h-5 w-5" />
                Compartilhar no WhatsApp
              </Button>
            </div>

            {slug && origin && (
              <div className="mt-6">
                <QrCard url={origin + "/" + slug} recipient={recipient} />
              </div>
            )}

            {/* Tips */}
            <div className="mt-6 pt-6 border-t border-gray-100">
              <div className="flex items-start gap-3 text-left">
                <Sparkles className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-gray-800">Dica</p>
                  <p className="text-xs text-gray-500">
                    Salve este link! É nele que sua Eternal Page fica disponível durante o período do seu pacote.
                    Compartilhe com amigos e família.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-6">
          <Button
            variant="ghost"
            onClick={() => router.push('/')}
            className="text-gray-500"
          >
            Criar outra Eternal Page
          </Button>
        </div>
      </motion.div>
    </div>
  );
}

export default function FinalizePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-white via-green-50/30 to-white px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center max-w-md"
        >
          <div className="w-20 h-20 border-4 border-green-500 border-t-transparent rounded-full animate-spin mx-auto mb-6" />
          <h2 className="text-2xl font-serif font-medium text-gray-800 mb-2">
            Carregando...
          </h2>
        </motion.div>
      </div>
    }>
      <FinalizeContent />
    </Suspense>
  );
}
