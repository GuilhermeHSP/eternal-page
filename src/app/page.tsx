'use client';

import { useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { TributeCreator } from '@/components/tribute/tribute-creator';
import { LandingPage, type StartOptions } from '@/components/landing/landing-page';

function HomePageContent() {
  const searchParams = useSearchParams();

  // Edit mode comes back from the preview page as ?edit=<draftId>
  const editDraftId = searchParams.get('edit');
  const isEditMode = !!editDraftId;

  const [creator, setCreator] = useState<StartOptions | null>(isEditMode ? {} : null);

  const start = (options: StartOptions) => {
    setCreator(options);
    window.scrollTo({ top: 0 });
  };

  if (!creator) {
    return <LandingPage onStart={start} />;
  }

  return (
    <div className="min-h-[100svh] flex flex-col bg-paper text-ink">
      <header className="bg-ink text-paper">
        <div className="max-w-[1376px] mx-auto px-4 md:px-8 h-16 flex items-center justify-between">
          <a href="/" className="text-step-lead font-semibold tracking-[-0.04em]">
            EternalPage
          </a>
          {!isEditMode && (
            <button
              type="button"
              onClick={() => setCreator(null)}
              className="press h-10 px-4 bg-paper text-ink text-step-small font-medium hover:bg-tone"
            >
              Voltar ao início
            </button>
          )}
        </div>
      </header>

      <main className="flex-1 py-12 px-4">
        <TributeCreator
          editDraftId={editDraftId}
          initialRecipient={creator.recipient}
          initialTemplateId={creator.templateId}
        />
      </main>
    </div>
  );
}

export default function HomePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[100svh] flex items-center justify-center bg-paper">
          <div className="w-10 h-10 border-4 border-ink border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <HomePageContent />
    </Suspense>
  );
}
