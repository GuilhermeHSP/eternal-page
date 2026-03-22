'use client';

import { useEffect, useMemo } from 'react';
import dynamic from 'next/dynamic';
import { TributeConfig, TemplateStyleConfig } from '@/types/tribute';
import { templates, getTemplate } from '@/lib/templates';
import { HeroSection } from './hero-section';
import { MusicPlayer } from './music-player';
import { MessageSection, ClosingMessage } from './message-section';
import { PhotoGallery, PhotoCarousel } from './photo-gallery';
import { Timeline } from './timeline';
import { ShareSection } from './share-section';
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
  showShare?: boolean;
  showBackButton?: boolean;
}

export function TributeViewer({ config, slug, showShare = true, showBackButton = true }: TributeViewerProps) {
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
            <span className="hidden sm:inline">Create Your Own</span>
          </Button>
        </Link>
      )}

      {/* Main content */}
      <main className="relative z-10">
        {/* Hero Section */}
        <HeroSection
          title={config.title}
          recipient={config.recipient}
          config={config.hero}
          accentColor={templateStyle.accentColor}
        />

        {/* Main Message */}
        {hasMessage && (
          <MessageSection
            config={config.message!}
            accentColor={templateStyle.accentColor}
            authorName={config.authorName}
          />
        )}

        {/* Photo Gallery */}
        {hasGallery && (
          templateStyle.layoutVariant === 'modern' ? (
            <PhotoCarousel
              photos={config.gallery!}
              accentColor={templateStyle.accentColor}
            />
          ) : (
            <PhotoGallery
              photos={config.gallery!}
              accentColor={templateStyle.accentColor}
            />
          )
        )}

        {/* Timeline */}
        {hasTimeline && (
          <Timeline
            items={config.timeline!}
            accentColor={templateStyle.accentColor}
          />
        )}

        {/* Closing Message */}
        {hasClosing && (
          <ClosingMessage
            message={config.closingMessage!}
            accentColor={templateStyle.accentColor}
          />
        )}

        {/* Share Section */}
        {showShare && (
          <ShareSection
            slug={slug}
            title={config.title}
            accentColor={templateStyle.accentColor}
          />
        )}

        {/* Footer */}
        <footer className="py-8 px-4 border-t border-gray-100 bg-white/50 backdrop-blur-sm">
          <div className="max-w-md mx-auto text-center">
            <p className="text-gray-500 text-sm">
              Created with{' '}
              <Link 
                href="/"
                className="font-semibold hover:underline"
                style={{ color: templateStyle.accentColor }}
              >
                EternalPage
              </Link>
            </p>
            <p className="text-gray-400 text-xs mt-2">
              Create beautiful tribute pages for your loved ones
            </p>
          </div>
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
