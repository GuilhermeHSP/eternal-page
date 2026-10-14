'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { Eye, X } from 'lucide-react';
import { TributeConfig } from '@/types/tribute';

export type PreviewSection = 'hero' | 'message' | 'counter' | 'voice' | 'reasons' | 'gallery' | 'guestbook' | 'timeline' | 'closing';

interface LivePreviewProps {
  config: TributeConfig;
  focus: PreviewSection;
  accentColor: string;
}

// The real tribute page in a phone frame, so the person sees what each field builds while
// typing. It's an iframe at phone width (the page's own phone layout applies), scaled down,
// fed the current form by postMessage, and it scrolls to the section being edited.
const PAGE_WIDTH = 390;

export function PhoneFrame({ config, focus, width }: { config: TributeConfig; focus: string; width: number }) {
  const frameRef = useRef<HTMLIFrameElement>(null);
  const [ready, setReady] = useState(false);
  const scale = width / PAGE_WIDTH;
  const height = Math.round(width * 2.05);

  const send = useCallback(() => {
    frameRef.current?.contentWindow?.postMessage(
      { type: 'eternalpage-preview', config, focus },
      window.location.origin
    );
  }, [config, focus]);

  useEffect(() => {
    const onMessage = (event: MessageEvent) => {
      if (event.origin !== window.location.origin) return;
      if (event.source !== frameRef.current?.contentWindow) return;
      if ((event.data as { type?: string })?.type === 'eternalpage-preview-ready') setReady(true);
    };
    window.addEventListener('message', onMessage);
    return () => window.removeEventListener('message', onMessage);
  }, []);

  useEffect(() => {
    if (ready) send();
  }, [ready, send]);

  return (
    <div
      className="relative mx-auto rounded-[2.4rem] bg-gray-900 p-2.5 shadow-2xl"
      style={{ width: width + 20, height: height + 20 }}
    >
      <div className="relative overflow-hidden rounded-[1.9rem] bg-white" style={{ width, height }}>
        <iframe
          ref={frameRef}
          src="/previa-ao-vivo"
          // The frame may finish loading before this page listens for its "ready" message,
          // so the load event also counts as ready.
          onLoad={() => setReady(true)}
          title="Prévia ao vivo da homenagem"
          className="absolute top-0 left-0 border-0"
          style={{
            width: PAGE_WIDTH,
            height: height / scale,
            transform: `scale(${scale})`,
            transformOrigin: 'top left',
          }}
        />
      </div>
      <div className="absolute top-4 left-1/2 -translate-x-1/2 h-5 w-24 rounded-full bg-gray-900" aria-hidden="true" />
    </div>
  );
}

export function LivePreview({ config, focus, accentColor }: LivePreviewProps) {
  const [open, setOpen] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);

  // Only one frame is mounted at a time: beside the form on wide screens, in an overlay on phones.
  useEffect(() => {
    const mq = window.matchMedia('(min-width: 1024px)');
    const update = () => setIsDesktop(mq.matches);
    update();
    mq.addEventListener('change', update);
    return () => mq.removeEventListener('change', update);
  }, []);

  if (isDesktop) {
    return (
      <aside className="sticky top-24" aria-label="Prévia ao vivo">
        <p className="mb-3 text-center text-xs font-medium uppercase tracking-[0.2em] text-gray-500">
          Prévia ao vivo
        </p>
        <PhoneFrame config={config} focus={focus} width={300} />
        <p className="mt-3 text-center text-xs text-gray-400">Assim a pessoa vai ver no celular</p>
      </aside>
    );
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="fixed right-4 bottom-24 z-40 inline-flex items-center gap-2 h-11 px-4 rounded-full text-white text-sm font-medium shadow-lg"
        style={{ backgroundColor: accentColor }}
      >
        <Eye className="h-4 w-4" />
        Ver prévia
      </button>
      {open && (
        <div
          className="fixed inset-0 z-[60] bg-black/70 flex flex-col items-center justify-center p-4"
          role="dialog"
          aria-label="Prévia ao vivo"
        >
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="mb-3 inline-flex items-center gap-1.5 h-9 px-3 rounded-full bg-white text-gray-800 text-sm font-medium"
          >
            <X className="h-4 w-4" />
            Fechar prévia
          </button>
          <PhoneFrame
            config={config}
            focus={focus}
            width={Math.min(300, window.innerWidth - 60, Math.round((window.innerHeight - 120) / 2.05))}
          />
        </div>
      )}
    </>
  );
}
