'use client';

import { useEffect, useMemo } from 'react';
import Link from 'next/link';
import { TributeConfig, TemplateStyleConfig } from '@/types/tribute';
import { templates, getTemplate } from '@/lib/templates';
import { HeroSection, Stripe } from './hero-section';
import { MusicPlayer } from './music-player';
import { MessageSection, ClosingMessage } from './message-section';
import { PhotoGallery, PhotoCarousel } from './photo-gallery';
import { Timeline } from './timeline';
import { ShareSection } from './share-section';
import { RevealObserver } from '@/components/reveal-observer';

interface TributeViewerProps {
  config: TributeConfig;
  slug: string;
  showShare?: boolean;
  showBackButton?: boolean;
}

export function TributeViewer({ config, slug, showShare = true, showBackButton = true }: TributeViewerProps) {
  // Template style with the tribute's own overrides
  const templateStyle = useMemo<TemplateStyleConfig>(() => {
    const baseTemplate = getTemplate(config.template) || templates.romantic;
    if (!config.style) return baseTemplate;
    return {
      ...baseTemplate,
      ...config.style,
      backgroundAnimation: {
        ...baseTemplate.backgroundAnimation,
        ...config.style.backgroundAnimation,
      },
    };
  }, [config]);

  const accent = templateStyle.accentColor;
  const ground = templateStyle.backgroundColor;

  useEffect(() => {
    document.documentElement.style.setProperty('--accent-color', accent);
    return () => {
      document.documentElement.style.removeProperty('--accent-color');
    };
  }, [accent]);

  const hasTimeline = config.timeline && config.timeline.length > 0;
  const hasGallery = config.gallery && config.gallery.length > 0;
  const hasMessage = !!config.message?.text;
  const hasClosing = !!config.closingMessage;

  return (
    <div className="min-h-[100svh]" style={{ backgroundColor: ground, color: '#1d1b1a' }}>
      <main>
        <HeroSection
          title={config.title}
          recipient={config.recipient}
          config={config.hero}
          accentColor={accent}
          groundColor={ground}
          authorName={hasMessage ? undefined : config.authorName}
        />

        {hasMessage && (
          <MessageSection config={config.message!} accentColor={accent} authorName={config.authorName} />
        )}

        {hasGallery && (
          <div className={hasMessage ? '' : 'pt-[clamp(88px,11vw,176px)]'}>
            {templateStyle.layoutVariant === 'modern' ? (
              <PhotoCarousel photos={config.gallery!} accentColor={accent} groundColor={ground} />
            ) : (
              <PhotoGallery photos={config.gallery!} accentColor={accent} groundColor={ground} />
            )}
          </div>
        )}

        {hasTimeline && <Timeline items={config.timeline!} accentColor={accent} groundColor={ground} />}

        {hasClosing && <ClosingMessage message={config.closingMessage!} accentColor={accent} groundColor={ground} />}

        {showShare && <ShareSection slug={slug} title={config.title} accentColor={accent} groundColor={ground} />}
      </main>

      <footer style={{ backgroundColor: accent, color: ground }}>
        <Stripe accent={ground} ground={accent} className="h-2" />
        <div className="mx-auto max-w-[1376px] px-4 md:px-8 py-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-step-small">
          <p>
            Uma página feita com{' '}
            <Link href="/" className="font-semibold underline underline-offset-4">
              EternalPage
            </Link>
          </p>
          {showBackButton && (
            <Link
              href="/"
              className="press h-11 px-4 inline-flex items-center self-start sm:self-auto font-medium"
              style={{ backgroundColor: ground, color: accent }}
            >
              Criar uma para alguém
            </Link>
          )}
        </div>
      </footer>

      {config.music?.url && <MusicPlayer config={config.music} accentColor={accent} />}
      <RevealObserver />
    </div>
  );
}
