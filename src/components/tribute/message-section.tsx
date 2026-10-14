'use client';

import { Fragment, useRef, useState, useEffect, type ReactNode } from 'react';
import { motion, useInView } from 'framer-motion';
import { Heart } from 'lucide-react';
import { MessageConfig } from '@/types/tribute';

interface MessageSectionProps {
  config: MessageConfig;
  accentColor: string;
  authorName?: string;
  recipient?: string;
}

export function MessageSection({ config, accentColor, authorName, recipient }: MessageSectionProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(containerRef, { once: true, margin: '-100px' });
  const [displayedText, setDisplayedText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  // A ref, not state: flipping it must not re-run the effect, whose cleanup would stop the typing.
  const hasTypedRef = useRef(false);

  const { text, typingAnimation = false, highlightPhrases = [] } = config;

  useEffect(() => {
    if (!typingAnimation || !isInView || hasTypedRef.current) return;

    setIsTyping(true);
    hasTypedRef.current = true;
    let currentIndex = 0;
    const interval = setInterval(() => {
      if (currentIndex <= text.length) {
        setDisplayedText(text.slice(0, currentIndex));
        currentIndex++;
      } else {
        setIsTyping(false);
        clearInterval(interval);
      }
    }, 30);

    return () => clearInterval(interval);
  }, [isInView, text, typingAnimation]);

  const displayText = typingAnimation ? displayedText : text;

  return (
    <section ref={containerRef} className="py-20 px-4 relative">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={isInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.8 }}
        className="max-w-2xl mx-auto relative"
      >
        {/* The message is a letter: a sheet of writing paper sealed with the template's colour */}
        <motion.article
          initial={{ rotate: 0, y: 12 }}
          animate={isInView ? { rotate: -0.6, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="relative rounded-[6px] px-7 pt-14 pb-10 md:px-14 md:pt-16 md:pb-12"
          style={{
            backgroundColor: '#fffdf8',
            boxShadow:
              '0 1px 2px rgba(60,40,30,0.06), 0 12px 32px -8px rgba(60,40,30,0.18), 0 32px 64px -24px rgba(60,40,30,0.18)',
          }}
        >
          {/* Wax seal */}
          <motion.div
            initial={{ scale: 0, rotate: -30 }}
            animate={isInView ? { scale: 1, rotate: 0 } : {}}
            transition={{ type: 'spring', stiffness: 260, damping: 18, delay: 0.5 }}
            className="absolute -top-7 left-1/2 -translate-x-1/2 w-14 h-14 rounded-full flex items-center justify-center"
            style={{
              backgroundColor: accentColor,
              boxShadow: `0 6px 14px -4px ${accentColor}99, inset 0 -3px 6px rgba(0,0,0,0.18), inset 0 2px 4px rgba(255,255,255,0.25)`,
            }}
            aria-hidden="true"
          >
            <Heart className="h-6 w-6 text-white/90" fill="currentColor" />
          </motion.div>

          {recipient && (
            <p className="font-script text-4xl md:text-5xl text-gray-800 mb-6">{greeting(recipient)}</p>
          )}

          {/* Message text, set on the faint rules of writing paper */}
          <div
            className="relative font-title font-light text-xl md:text-[1.4rem] text-gray-700 whitespace-pre-line"
            style={{
              lineHeight: '2.1rem',
              backgroundImage: `repeating-linear-gradient(to bottom, transparent 0, transparent calc(2.1rem - 1px), ${accentColor}1f calc(2.1rem - 1px), ${accentColor}1f 2.1rem)`,
              backgroundPosition: '0 -0.25rem',
            }}
          >
            {/* The full text, invisible, holds the letter at its final size so it doesn't grow while typing */}
            <p aria-hidden={typingAnimation} className={typingAnimation ? 'invisible' : undefined}>
              {renderHighlightedText(text, highlightPhrases, accentColor)}
            </p>

            {typingAnimation && (
              <p className="absolute inset-0">
                {renderHighlightedText(displayText, highlightPhrases, accentColor)}
                {isTyping && (
                  <motion.span
                    animate={{ opacity: [1, 0] }}
                    transition={{ duration: 0.5, repeat: Infinity }}
                    className="inline-block w-0.5 h-6 ml-1 align-middle"
                    style={{ backgroundColor: accentColor }}
                  />
                )}
              </p>
            )}
          </div>

          {/* Signature */}
          {authorName && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={!isTyping || !typingAnimation ? { opacity: 1 } : {}}
              transition={{ duration: 0.5 }}
              className="mt-10 text-right font-script text-3xl md:text-4xl"
              style={{ color: accentColor }}
            >
              {/^com /i.test(authorName) ? authorName : `Com amor, ${authorName}`}
            </motion.p>
          )}
        </motion.article>
      </motion.div>
    </section>
  );
}

// A neutral salutation: the page can't know whether to write "Querido" or "Querida".
function greeting(name: string): string {
  return `Para ${name},`;
}

// Highlights are rendered as React nodes, never as HTML, so a message can't inject markup.
// Text between **double asterisks** (the tip shown in the creator) is highlighted too.
function renderHighlightedText(content: string, phrases: string[], accentColor: string): ReactNode {
  return content.split(/\*\*(.+?)\*\*/g).map((part, i) =>
    i % 2 === 1 ? (
      <span key={i} style={{ color: accentColor, fontWeight: 600 }}>
        {part}
      </span>
    ) : (
      <Fragment key={i}>{highlightPhrases(part, phrases, accentColor)}</Fragment>
    )
  );
}

function highlightPhrases(text: string, phrases: string[], accentColor: string): ReactNode {
  const wanted = phrases.map((p) => p.trim()).filter(Boolean);
  if (!wanted.length) return text;
  const escaped = wanted.map((p) => p.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
  const lower = wanted.map((p) => p.toLowerCase());
  return text.split(new RegExp(`(${escaped.join('|')})`, 'gi')).map((part, i) =>
    lower.includes(part.toLowerCase()) ? (
      <span key={i} style={{ color: accentColor, fontWeight: 600 }}>
        {part}
      </span>
    ) : (
      <Fragment key={i}>{part}</Fragment>
    )
  );
}

// Closing scene: the page ends the way it opens, on a photo under the template's veil,
// with the closing words handwritten and the recipient's name and author underneath.
interface ClosingMessageProps {
  message: string;
  accentColor: string;
  image?: string;
  recipient?: string;
  authorName?: string;
}

export function ClosingMessage({ message, accentColor, image, recipient, authorName }: ClosingMessageProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(containerRef, { once: true, margin: '-80px' });

  return (
    <section
      ref={containerRef}
      className="relative mt-12 min-h-[80vh] flex items-center justify-center overflow-hidden px-4 py-24"
      style={image ? undefined : { backgroundColor: accentColor }}
    >
      {image && (
        <>
          <motion.img
            src={image}
            alt=""
            className="absolute inset-0 w-full h-full object-cover object-[center_30%]"
            initial={{ scale: 1.08 }}
            animate={isInView ? { scale: 1 } : {}}
            transition={{ duration: 14, ease: 'easeOut' }}
          />
          <div className="absolute inset-0" style={{ background: 'rgba(0,0,0,0.5)' }} />
          <div
            className="absolute inset-0"
            style={{ backgroundColor: accentColor, opacity: 0.35, mixBlendMode: 'soft-light' }}
          />
          <div
            className="absolute inset-0"
            style={{ background: `linear-gradient(to top, ${accentColor}66 0%, transparent 60%)` }}
          />
        </>
      )}

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={isInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.9 }}
        className="relative z-10 max-w-3xl mx-auto text-center text-white"
      >
        <Heart className="h-7 w-7 mx-auto mb-8 text-white/80" fill="currentColor" aria-hidden="true" />
        <p
          className="font-script text-5xl md:text-7xl leading-[1.15] [text-wrap:balance]"
          style={{ textShadow: '0 2px 24px rgba(0,0,0,0.35)' }}
        >
          {message}
        </p>
        {(recipient || authorName) && (
          <div className="mt-10 flex flex-col items-center gap-3">
            <div className="h-px w-16 bg-white/60" />
            <p className="font-title text-sm md:text-base uppercase tracking-[0.25em] text-white/85">
              {authorName && !/^com /i.test(authorName) ? `Com amor, ${authorName}` : authorName || `Para ${recipient}`}
            </p>
          </div>
        )}
      </motion.div>
    </section>
  );
}
