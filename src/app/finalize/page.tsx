'use client';

import { SiteHeader } from '@/components/site-header';
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

type CheckoutStatus = 'paid' | 'pending' | 'rejected' | 'unpaid';

interface StatusResponse {
  status: CheckoutStatus;
  slug: string | null;
  recipient?: string;
  packageType?: PackageType;
  expiresAt?: string | null;
  email?: string | null;
  emailSent?: boolean;
}

// "Obrigado" page. Mercado Pago sends the buyer back here (with payment_id) after paying;
// the page asks the server for the payment result, waiting a little for Pix confirmations.
function FinalizeContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [info, setInfo] = useState<StatusResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [gaveUp, setGaveUp] = useState(false);
  const [searchedEnough, setSearchedEnough] = useState(false);
  const [copied, setCopied] = useState(false);
  const [origin, setOrigin] = useState('');
  useEffect(() => setOrigin(window.location.origin), []);

  const draftId = searchParams.get('draft_id') || searchParams.get('external_reference');
  const paymentId = searchParams.get('payment_id') || searchParams.get('collection_id');

  useEffect(() => {
    if (!draftId) {
      setError('Não encontramos esta homenagem.');
      return;
    }
    let stopped = false;
    let tries = 0;
    let timer: ReturnType<typeof setTimeout> | undefined;

    const check = async () => {
      tries += 1;
      try {
        const qs = new URLSearchParams({ draft_id: draftId });
        if (paymentId && paymentId !== 'null') qs.set('payment_id', paymentId);
        const res = await fetch(`/api/checkout/status?${qs}`, { cache: 'no-store' });
        if (res.status === 404) {
          setError('Não encontramos esta homenagem.');
          return;
        }
        const data = (await res.json()) as StatusResponse;
        if (stopped) return;
        setInfo(data);
        // Pix and some cards take a few seconds to be confirmed: keep asking for ~3 minutes.
        const waiting = data.status === 'pending' || (data.status === 'unpaid' && ((!!paymentId && paymentId !== 'null') || tries < 10));
        if (waiting) {
          if (tries < 60) timer = setTimeout(check, 3000);
          else setGaveUp(true);
        } else if (data.status === 'unpaid') {
          setSearchedEnough(true);
        }
      } catch {
        if (!stopped && tries < 60) timer = setTimeout(check, 4000);
      }
    };
    check();
    return () => {
      stopped = true;
      if (timer) clearTimeout(timer);
    };
  }, [draftId, paymentId]);

  const slug = info?.status === 'paid' ? info.slug : null;
  const recipient = info?.recipient;
  const pkg = useMemo(() => PACKAGES[(info?.packageType as PackageType) || 'premium'] || PACKAGES.premium, [info?.packageType]);
  const hasPayment = !!paymentId && paymentId !== 'null';
  const finalizing = !error && (!info || info.status === 'pending' || (info.status === 'unpaid' && (hasPayment ? !gaveUp : !searchedEnough)));

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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-white via-rose-50/30 to-white pt-24 px-4">
        <SiteHeader />
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center max-w-md"
        >
          <div className="w-20 h-20 border-4 border-rose-500 border-t-transparent rounded-full animate-spin mx-auto mb-6" />
          <h2 className="text-2xl font-title font-semibold text-gray-800 mb-2">
            Confirmando seu pagamento...
          </h2>
          <p className="text-gray-500">
            {info?.status === 'pending'
              ? 'O Mercado Pago ainda está processando. No Pix, isso leva só alguns segundos. Pode deixar esta página aberta.'
              : 'Aguarde um instante enquanto publicamos sua homenagem.'}
          </p>
        </motion.div>
      </div>
    );
  }

  if (!error && info && (info.status === 'rejected' || (info.status === 'unpaid' && (hasPayment ? gaveUp : searchedEnough)))) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-white via-rose-50/30 to-white pt-24 px-4">
        <SiteHeader />
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center max-w-md">
          <h2 className="text-2xl font-title font-semibold text-gray-800 mb-2">
            {info.status === 'rejected' ? 'O pagamento não foi aprovado' : 'Ainda não recebemos o pagamento'}
          </h2>
          <p className="text-gray-500 mb-6">
            {info.status === 'rejected'
              ? 'Nenhum valor foi cobrado. Você pode tentar de novo com outro cartão ou pelo Pix.'
              : 'Se você já pagou, aguarde alguns minutos: assim que o Mercado Pago confirmar, enviamos o link para o seu e-mail.'}
          </p>
          <div className="flex flex-col gap-3">
            <Button onClick={() => router.push(`/preview?id=${draftId}`)} className="bg-rose-500 hover:bg-rose-600 text-white">
              Voltar e tentar de novo
            </Button>
            <Button onClick={() => window.location.reload()} variant="outline">
              Verificar novamente
            </Button>
          </div>
        </motion.div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-white via-rose-50/30 to-white pt-24 px-4">
        <SiteHeader />
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
          <h2 className="text-2xl font-title font-semibold text-gray-800 mb-2">
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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-white via-rose-50/30 to-white pt-24 px-4 py-12">
      <SiteHeader />
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-lg w-full"
      >
        {/* Success card */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          {/* Success header */}
          <div className="bg-rose-500 p-8 text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring' }}
              className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-4"
            >
              <CheckCircle className="h-10 w-10 text-rose-500" />
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <h1 className="text-2xl font-title font-semibold text-white mb-2">
                Pagamento Confirmado!
              </h1>
              <p className="text-white/80">
                Sua homenagem está no ar
                {info?.email && info.emailSent ? <><br />Também enviamos o link para <strong>{info.email}</strong>.<br /><span className="text-sm text-gray-500">Não chegou? Confira as pastas Spam e Promoções.</span></> : null}
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
                    <CheckCircle className="h-4 w-4 text-rose-500" />
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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-white via-rose-50/30 to-white pt-24 px-4">
        <SiteHeader />
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center max-w-md"
        >
          <div className="w-20 h-20 border-4 border-rose-500 border-t-transparent rounded-full animate-spin mx-auto mb-6" />
          <h2 className="text-2xl font-title font-semibold text-gray-800 mb-2">
            Carregando...
          </h2>
        </motion.div>
      </div>
    }>
      <FinalizeContent />
    </Suspense>
  );
}
