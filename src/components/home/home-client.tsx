'use client';

import { useEffect, useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import { motion } from 'framer-motion';
import { LandingPage, type StartOptions } from '@/components/landing/landing-page';
import { SiteHeader } from '@/components/site-header';
import { clearSnapshot, loadSnapshot, type CreatorSnapshot } from '@/lib/draft-store';

// The creator is only downloaded once the visitor starts, so the landing stays light.
const TributeCreator = dynamic(
  () => import('@/components/tribute/tribute-creator').then((m) => m.TributeCreator),
  {
    ssr: false,
    loading: () => <Spinner />,
  }
);

function Spinner() {
  return (
    <div className="flex justify-center py-24">
      <div className="w-12 h-12 border-4 border-rose-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );
}

type CreatorState = StartOptions & { resume?: CreatorSnapshot | null };

// Edit mode comes back from the preview page as ?edit=<draftId>; ?etapa=<n> is a step of the
// creator (a reload or the browser's back/forward). Either opens the creator straight away,
// with the copy of the tribute this browser kept (lib/draft-store) when there is one.
export function HomeClient({ editDraftId, reopening }: { editDraftId: string | null; reopening: boolean }) {
  const [creator, setCreator] = useState<CreatorState | null>(null);
  const [checking, setChecking] = useState(reopening);
  // An unfinished tribute, offered on the landing.
  const [saved, setSaved] = useState<CreatorSnapshot | null>(null);
  const creatorOpen = useRef(false);
  useEffect(() => {
    creatorOpen.current = !!creator;
  }, [creator]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const edit = params.get('edit') || editDraftId;
    loadSnapshot().then((snap) => {
      if (edit) setCreator({ resume: snap?.draftId === edit ? snap : null });
      else if (params.has('etapa')) setCreator({ resume: snap });
      else if (snap?.values.recipient) setSaved(snap);
      setChecking(false);
    });

    // Back from the creator's first step returns to the landing; forward reopens the creator.
    const onPop = () => {
      const p = new URLSearchParams(window.location.search);
      if (!p.has('etapa') && !p.has('edit')) {
        setCreator(null);
        loadSnapshot().then((s) => setSaved(s?.values.recipient ? s : null));
      } else if (!creatorOpen.current) {
        loadSnapshot().then((s) => setCreator({ resume: s }));
      }
    };
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, [editDraftId]);

  const open = (state: CreatorState, step = 0) => {
    window.history.pushState(window.history.state, '', `/?etapa=${step}`);
    setCreator(state);
    window.scrollTo({ top: 0 });
  };

  const start = (options: StartOptions) => open(options);

  const resume = () => {
    if (!saved) return;
    if (saved.previewed && saved.draftId) {
      window.location.href = `/preview?id=${encodeURIComponent(saved.draftId)}`;
      return;
    }
    open({ resume: saved }, saved.step);
  };

  const discard = () => {
    void clearSnapshot();
    setSaved(null);
  };

  if (checking) {
    return (
      <div className="min-h-screen pt-16">
        <SiteHeader />
        <Spinner />
      </div>
    );
  }

  if (!creator) {
    return (
      <LandingPage
        onStart={start}
        resume={
          saved
            ? { recipient: saved.values.recipient || '', previewed: saved.previewed && !!saved.draftId, onResume: resume, onDiscard: discard }
            : undefined
        }
      />
    );
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
            editDraftId={editDraftId ?? new URLSearchParams(window.location.search).get('edit')}
            initialRecipient={creator.recipient}
            initialTemplateId={creator.templateId}
            initialPackage={creator.packageType}
            resume={creator.resume}
          />
        </motion.div>
      </main>
    </div>
  );
}
