'use client';

import { useEffect, useState } from 'react';
import { TributeViewer } from '@/components/tribute/tribute-viewer';
import type { TributeConfig } from '@/types/tribute';

// Rendered inside the creator's phone frame (an iframe at phone width, so the page's own
// breakpoints apply). The creator sends the current form as { config, focus } by postMessage.
export default function LivePreviewFrame() {
  const [config, setConfig] = useState<TributeConfig | null>(null);
  const [focus, setFocus] = useState<string>('hero');

  useEffect(() => {
    const onMessage = (event: MessageEvent) => {
      if (event.origin !== window.location.origin) return;
      const data = event.data as { type?: string; config?: TributeConfig; focus?: string };
      if (data?.type !== 'eternalpage-preview' || !data.config) return;
      setConfig(data.config);
      if (data.focus) setFocus(data.focus);
    };
    window.addEventListener('message', onMessage);
    window.parent?.postMessage({ type: 'eternalpage-preview-ready' }, window.location.origin);
    return () => window.removeEventListener('message', onMessage);
  }, []);

  useEffect(() => {
    if (!config) return;
    const target = document.querySelector<HTMLElement>(`[data-preview="${focus}"]`);
    const top = focus === 'hero' || !target ? 0 : Math.max(target.getBoundingClientRect().top + window.scrollY - 24, 0);
    window.scrollTo({ top, behavior: 'smooth' });
  }, [focus, config]);

  if (!config) return <div className="min-h-screen bg-white" />;

  return (
    <>
      <style>{'html{scrollbar-width:none}html::-webkit-scrollbar{display:none}'}</style>
      <TributeViewer config={config} slug="previa" live={false} showIntro={false} />
    </>
  );
}
