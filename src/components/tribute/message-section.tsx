'use client';

import { Fragment, useRef, useState, useEffect, type ReactNode } from 'react';
import { motion, useInView } from 'framer-motion';
import { Heart, Quote } from 'lucide-react';
import { MessageConfig } from '@/types/tribute';

interface MessageSectionProps {
  config: MessageConfig;
  accentColor: string;
  authorName?: string;
}

export function MessageSection({ config, accentColor, authorName }: MessageSectionProps) {
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
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden">
        <div 
          className="absolute top-0 left-1/4 w-64 h-64 rounded-full opacity-20 blur-3xl"
          style={{ backgroundColor: `${accentColor}20` }}
        />
        <div 
          className="absolute bottom-0 right-1/4 w-96 h-96 rounded-full opacity-10 blur-3xl"
          style={{ backgroundColor: accentColor }}
        />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={isInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.8 }}
        className="max-w-2xl mx-auto relative"
      >
        {/* Quote icon */}
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={isInView ? { scale: 1, rotate: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="flex justify-center mb-8"
        >
          <div 
            className="p-4 rounded-full"
            style={{ backgroundColor: `${accentColor}10` }}
          >
            <Quote 
              className="h-8 w-8"
              style={{ color: accentColor }}
            />
          </div>
        </motion.div>

        {/* Message card */}
        <motion.div
          initial={{ scale: 0.95 }}
          animate={isInView ? { scale: 1 } : {}}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="relative bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-8 md:p-12 border border-white/50"
        >
          {/* Decorative corners */}
          <div className="absolute top-4 left-4 w-8 h-8 border-l-2 border-t-2 rounded-tl-lg opacity-30" style={{ borderColor: accentColor }} />
          <div className="absolute top-4 right-4 w-8 h-8 border-r-2 border-t-2 rounded-tr-lg opacity-30" style={{ borderColor: accentColor }} />
          <div className="absolute bottom-4 left-4 w-8 h-8 border-l-2 border-b-2 rounded-bl-lg opacity-30" style={{ borderColor: accentColor }} />
          <div className="absolute bottom-4 right-4 w-8 h-8 border-r-2 border-b-2 rounded-br-lg opacity-30" style={{ borderColor: accentColor }} />

          {/* Message text */}
          <div className="relative text-center">
            <p className="text-lg md:text-xl leading-relaxed text-gray-700 font-serif whitespace-pre-line">
              {renderHighlightedText(displayText, highlightPhrases, accentColor)}
            </p>

            {/* Typing cursor */}
            {isTyping && (
              <motion.span
                animate={{ opacity: [1, 0] }}
                transition={{ duration: 0.5, repeat: Infinity }}
                className="inline-block w-0.5 h-6 ml-1 align-middle"
                style={{ backgroundColor: accentColor }}
              />
            )}
          </div>

          {/* Signature */}
          {(authorName || !typingAnimation || !isTyping) && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={!isTyping || !typingAnimation ? { opacity: 1 } : {}}
              transition={{ duration: 0.5 }}
              className="mt-8 pt-6 border-t border-gray-100 text-center"
            >
              <div className="flex items-center justify-center gap-2 text-gray-500">
                <Heart 
                  className="h-4 w-4"
                  style={{ color: accentColor }}
                />
                {authorName && (
                  <span className="text-sm font-medium">
                    {/^com /i.test(authorName) ? null : 'Com amor, '}
                    <span style={{ color: accentColor }}>{authorName}</span>
                  </span>
                )}
              </div>
            </motion.div>
          )}
        </motion.div>
      </motion.div>
    </section>
  );
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

// Closing message variant
interface ClosingMessageProps {
  message: string;
  accentColor: string;
}

export function ClosingMessage({ message, accentColor }: ClosingMessageProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(containerRef, { once: true, margin: '-50px' });

  return (
    <section ref={containerRef} className="py-16 px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={isInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.6 }}
        className="max-w-xl mx-auto text-center"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={isInView ? { scale: 1 } : {}}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mb-6"
        >
          <Heart 
            className="h-12 w-12 mx-auto animate-pulse"
            style={{ color: accentColor }}
          />
        </motion.div>

        <p className="text-xl md:text-2xl font-serif text-gray-700 leading-relaxed">
          {message}
        </p>
      </motion.div>
    </section>
  );
}
