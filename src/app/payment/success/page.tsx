'use client';

import { Suspense, useMemo } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { CheckCircle, Heart, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PACKAGES, PackageType, PackageLimits } from '@/lib/packages';

function PaymentSuccessContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  // Use useMemo to derive values from searchParams
  const paymentData = useMemo(() => {
    const pkg = searchParams.get('package') as PackageType;
    const paymentId = searchParams.get('payment_id');

    if (pkg && PACKAGES[pkg]) {
      // Store payment info in sessionStorage for the editor
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('eternalpage_payment', JSON.stringify({
          paymentId,
          packageType: pkg,
          limits: PACKAGES[pkg].limits,
          paidAt: new Date().toISOString(),
        }));
      }
      
      return {
        packageType: pkg,
        limits: PACKAGES[pkg].limits,
      };
    }
    return null;
  }, [searchParams]);

  const handleContinue = () => {
    router.push('/?create=true');
  };

  if (!paymentData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-white via-green-50/30 to-white">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <p className="text-gray-500">Verificando pagamento...</p>
        </motion.div>
      </div>
    );
  }

  const { packageType, limits } = paymentData;
  const pkg = PACKAGES[packageType];

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-white via-green-50/30 to-white px-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-md w-full"
      >
        <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
          {/* Success icon */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring' }}
            className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6"
          >
            <CheckCircle className="h-10 w-10 text-green-500" />
          </motion.div>

          {/* Title */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <h1 className="text-2xl font-serif font-medium text-gray-900 mb-2">
              Pagamento Confirmado!
            </h1>
            <p className="text-gray-500 mb-6">
              Sua <strong>{pkg.name}</strong> está pronta para ser criada.
            </p>
          </motion.div>

          {/* Package details */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-gray-50 rounded-xl p-4 mb-6 text-left"
          >
            <h3 className="text-sm font-semibold text-gray-700 mb-3">
              Seu pacote inclui:
            </h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li className="flex items-center gap-2">
                <Heart className="h-4 w-4 text-rose-500" />
                Hero Image personalizada
              </li>
              <li className="flex items-center gap-2">
                <Heart className="h-4 w-4 text-rose-500" />
                Até {limits.momentsPhotos} fotos em Moments
              </li>
              <li className="flex items-center gap-2">
                <Heart className="h-4 w-4 text-rose-500" />
                Até {limits.timelineMoments} Special Moments
              </li>
              {limits.timelineImages && (
                <li className="flex items-center gap-2">
                  <Heart className="h-4 w-4 text-rose-500" />
                  Imagens na Timeline
                </li>
              )}
              {limits.music && (
                <li className="flex items-center gap-2">
                  <Heart className="h-4 w-4 text-rose-500" />
                  Música personalizada
                </li>
              )}
            </ul>
          </motion.div>

          {/* CTA */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <Button
              size="lg"
              onClick={handleContinue}
              className="w-full gap-2 bg-rose-500 hover:bg-rose-600 text-white"
            >
              <Heart className="h-5 w-5" />
              Criar minha Eternal Page
              <ArrowRight className="h-4 w-4" />
            </Button>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}

export default function PaymentSuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-white via-green-50/30 to-white">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <div className="w-12 h-12 border-4 border-green-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Verificando pagamento...</p>
        </motion.div>
      </div>
    }>
      <PaymentSuccessContent />
    </Suspense>
  );
}
