'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import { motion } from 'framer-motion';
import { LandingPage, type StartOptions } from '@/components/landing/landing-page';
import { SiteHeader } from '@/components/site-header';

// The creator is only downloaded once the visitor starts, so the landing stays light.
const TributeCreator = dynamic(
  () => import('@/components/tribute/tribute-creator').then((m) => m.TributeCreator),
  {
    ssr: false,
    loading: () => (
      <div className="flex justify-center py-24">
        <div className="w-12 h-12 border-4 border-rose-500 border-t-transparent rounded-full animate-spin" />
      </div>
    ),
  }
);

// Edit mode comes back from the preview page as ?edit=<draftId>, read on the server.
export function HomeClient({ editDraftId }: { editDraftId: string | null }) {
  // Show creator automatically if in edit mode
  const [creator, setCreator] = useState<StartOptions | null>(editDraftId ? {} : null);

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
