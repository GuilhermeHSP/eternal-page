'use client';

import { useState, Suspense } from 'react';
import { motion } from 'framer-motion';
import { useSearchParams } from 'next/navigation';
import { TributeCreator } from '@/components/tribute/tribute-creator';
import { LandingPage, type StartOptions } from '@/components/landing/landing-page';
import { SiteHeader } from '@/components/site-header';

function HomePageContent() {
  const searchParams = useSearchParams();

  // Edit mode comes back from the preview page as ?edit=<draftId>
  const editDraftId = searchParams.get('edit');
  const isEditMode = !!editDraftId;

  // Show creator automatically if in edit mode
  const [creator, setCreator] = useState<StartOptions | null>(isEditMode ? {} : null);

  const start = (options: StartOptions) => {
    setCreator(options);
    window.scrollTo({ top: 0 });
  };

  if (!creator) {
    return <LandingPage onStart={start} />;
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-white via-rose-50/30 to-white">
      {/* Header */}
      <SiteHeader
        action={
          <a href="/" className="text-sm text-gray-500 hover:text-rose-500">
            Voltar ao início
          </a>
        }
      />

      <main className="flex-1 pt-16">
        <motion.div
          key="creator"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="py-12 px-4"
        >
          <TributeCreator
            editDraftId={editDraftId}
            initialRecipient={creator.recipient}
            initialTemplateId={creator.templateId}
            initialPackage={creator.packageType}
          />
        </motion.div>
      </main>
    </div>
  );
}

export default function HomePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-white via-rose-50/30 to-white">
          <div className="w-12 h-12 border-4 border-rose-500 border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <HomePageContent />
    </Suspense>
  );
}
