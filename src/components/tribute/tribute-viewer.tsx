'use client';

import { useEffect, useMemo } from 'react';
import dynamic from 'next/dynamic';
import { TributeConfig, TemplateStyleConfig } from '@/types/tribute';
import { templates, getTemplate } from '@/lib/templates';
import { HeroSection } from './hero-section';
import { MusicPlayer } from './music-player';
import { MessageSection, ClosingMessage } from './message-section';
import { PhotoGallery } from './photo-gallery';
import { Timeline } from './timeline';
import { EnvelopeIntro } from './envelope-intro';
import { CounterSection } from './counter-section';
import { ReasonsSection } from './reasons-section';
import { VoiceMessageSection } from './voice-message-section';
import { GuestbookSection } from './guestbook-section';
import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

// Dynamic import to skip SSR for animations (avoids hydration mismatch)
const BackgroundAnimations = dynamic(
  () => import('./background-animations').then((mod) => mod.BackgroundAnimations),
  { ssr: false }
);

interface TributeViewerProps {
  config: TributeConfig;
  slug: string;
  // The published page: the guestbook takes real messages. Off in previews.
  live?: boolean;
  showBackButton?: boolean;
  showIntro?: boolean;
}

export function TributeViewer({ config, slug, live = true, showBackButton = true, showIntro = true }: TributeViewerProps) {
  // Get template style with overrides
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

  // Apply custom styles
  useEffect(() => {
    document.documentElement.style.setProperty('--accent-color', templateStyle.accentColor);
    document.documentElement.style.setProperty('--heading-font', templateStyle.headingFont);
    document.documentElement.style.setProperty('--body-font', templateStyle.bodyFont);
  }, [templateStyle]);

  const hasTimeline = config.timeline && config.timeline.length > 0;
  const hasGallery = config.gallery && config.gallery.length > 0;
  const hasMessage = config.message?.text;
  const hasClosing = config.closingMessage;

  return (
    <div 
      className="min-h-screen relative"
      style={{
        backgroundColor: templateStyle.backgroundColor,
        fontFamily: templateStyle.bodyFont,
      }}
    >
      {/* One soft, fixed glow in the template's colour behind the whole page, so the
          background stays continuous from section to section */}
      <div
        className="fixed inset-0 pointer-events-none z-0"
        aria-hidden="true"
        style={{
          background: `radial-gradient(60% 50% at 15% 20%, ${templateStyle.accentColor}14 0%, transparent 70%), radial-gradient(55% 45% at 85% 80%, ${templateStyle.accentColor}10 0%, transparent 70%)`,
        }}
      />

      {showIntro && (
        <EnvelopeIntro
          recipient={config.recipient}
          accentColor={templateStyle.accentColor}
          backgroundColor={templateStyle.backgroundColor}
        />
      )}

      {/* Background animations - client only */}
      <BackgroundAnimations config={templateStyle.backgroundAnimation} />

      {/* Fixed back button */}
      {showBackButton && (
        <Link href="/">
          <Button
            variant="ghost"
            size="sm"
            className="fixed top-4 left-4 z-50 gap-2 bg-white/80 backdrop-blur-sm hover:bg-white"
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="hidden sm:inline">Crie a sua</span>
          </Button>
        </Link>
      )}

      {/* Main content */}
      <main className="relative z-10">
        {/* Hero Section */}
        <div data-preview="hero">
          <HeroSection
          title={config.title}
          recipient={config.recipient}
          config={config.hero}
          accentColor={templateStyle.accentColor}
        />
        </div>

        {/* Main Message */}
        <div data-preview="message">
          {hasMessage && (
          <MessageSection
            config={config.message!}
            accentColor={templateStyle.accentColor}
            authorName={config.authorName}
            recipient={config.recipient}
          />
        )}
        </div>

        {/* Time together */}
        <div data-preview="counter">
          {config.counter?.date && (
            <CounterSection config={config.counter} accentColor={templateStyle.accentColor} />
          )}
        </div>

        {/* Voice message */}
        <div data-preview="voice">
          {config.voiceMessage && (
            <VoiceMessageSection url={config.voiceMessage} accentColor={templateStyle.accentColor} authorName={config.authorName} />
          )}
        </div>

        {/* Reasons to love */}
        <div data-preview="reasons">
          {config.reasons && config.reasons.length > 0 && (
            <ReasonsSection reasons={config.reasons} accentColor={templateStyle.accentColor} />
          )}
        </div>

        {/* Photo Gallery */}
        <div data-preview="gallery">
          {hasGallery && (
            <PhotoGallery photos={config.gallery!} accentColor={templateStyle.accentColor} />
          )}
        </div>

        {/* Timeline */}
        <div data-preview="timeline">
          {hasTimeline && (
          <Timeline
            items={config.timeline!}
            accentColor={templateStyle.accentColor}
          />
        )}
        </div>

        {/* Message wall */}
        <div data-preview="guestbook">
          {config.guestbook && (
            <GuestbookSection
              slug={slug}
              accentColor={templateStyle.accentColor}
              recipient={config.recipient}
              live={live && slug !== 'previa'}
            />
          )}
        </div>

        {/* Closing Message */}
        <div data-preview="closing">
          {hasClosing && (
          <ClosingMessage
            message={config.closingMessage!}
            accentColor={templateStyle.accentColor}
            image={config.hero?.image || config.gallery?.[config.gallery.length - 1]?.url}
            recipient={config.recipient}
            authorName={config.authorName}
          />
        )}
        </div>

        {/* Sharing is for the giver (finalize page and WhatsApp), never on the page the person receives. */}

        {/* Footer */}
        <footer className={`${config.music?.url ? 'pb-28' : 'pb-12'} pt-4 px-4`}>
          <p className="text-center font-title text-xs uppercase tracking-[0.2em] text-gray-400">
            Feito com{' '}
            <Link href="/" className="hover:underline" style={{ color: templateStyle.accentColor }}>
              EternalPage
            </Link>
          </p>
        </footer>
      </main>

      {/* Music Player */}
      {config.music?.url && (
        <MusicPlayer
          config={config.music}
          accentColor={templateStyle.accentColor}
        />
      )}
    </div>
  );
}
