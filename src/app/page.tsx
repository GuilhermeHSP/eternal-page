'use client';

import { useState, Suspense } from 'react';
import { motion } from 'framer-motion';
import { useSearchParams } from 'next/navigation';
import { Heart } from 'lucide-react';
import { TributeCreator } from '@/components/tribute/tribute-creator';
import { LandingPage, type StartOptions } from '@/components/landing/landing-page';

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
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <a href="/" className="flex items-center gap-2">
            <Heart className="h-6 w-6 text-rose-500" />
            <span className="font-serif text-xl font-semibold text-gray-800">EternalPage</span>
          </a>
        </div>
      </header>

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
