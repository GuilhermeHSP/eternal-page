'use client';

import { Fragment, type ReactNode } from 'react';
import { MessageConfig } from '@/types/tribute';

interface MessageSectionProps {
  config: MessageConfig;
  accentColor: string;
  authorName?: string;
}

// Highlights are rendered as React nodes, never as HTML, so a message can't inject markup.
// Text between **double asterisks** is highlighted too.
function highlight(text: string, phrases: string[], accentColor: string): ReactNode {
  const bold = text.split(/\*\*(.+?)\*\*/g);
  if (bold.length > 1) {
    return bold.map((part, i) =>
      i % 2 === 1 ? (
        <span key={i} className="font-semibold" style={{ color: accentColor }}>
          {part}
        </span>
      ) : (
        <Fragment key={i}>{highlightPhrases(part, phrases, accentColor)}</Fragment>
      )
    );
  }
  return highlightPhrases(text, phrases, accentColor);
}

function highlightPhrases(text: string, phrases: string[], accentColor: string): ReactNode {
  const wanted = phrases.map((p) => p.trim()).filter(Boolean);
  if (!wanted.length) return text;

  const escaped = wanted.map((p) => p.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
  const parts = text.split(new RegExp(`(${escaped.join('|')})`, 'gi'));
  const lower = wanted.map((p) => p.toLowerCase());

  return parts.map((part, i) =>
    lower.includes(part.toLowerCase()) ? (
      <span key={i} className="font-semibold" style={{ color: accentColor }}>
        {part}
      </span>
    ) : (
      <Fragment key={i}>{part}</Fragment>
    )
  );
}

export function MessageSection({ config, accentColor, authorName }: MessageSectionProps) {
  const { text, highlightPhrases = [] } = config;
  const paragraphs = text.split(/\n{2,}/).filter((p) => p.trim());

  return (
    <section className="px-4 md:px-8 py-[clamp(88px,11vw,176px)]">
      <div className="mx-auto max-w-[1376px] grid md:grid-cols-12 gap-8 md:gap-6">
        <h2 className="md:col-span-3 text-step-head" style={{ color: accentColor }} data-reveal>
          A mensagem
        </h2>
        <div className="md:col-start-5 md:col-span-7 space-y-6 text-step-lead" style={{ color: '#1d1b1a' }}>
          {paragraphs.map((p, i) => (
            <p key={i} className="max-w-[48ch] whitespace-pre-line" data-reveal style={{ '--i': i } as React.CSSProperties}>
              {highlight(p, highlightPhrases, accentColor)}
            </p>
          ))}
          {authorName && (
            <p className="pt-2 text-step-body font-medium" style={{ color: accentColor }} data-reveal>
              {authorName}
            </p>
          )}
        </div>
      </div>
    </section>
  );
}

interface ClosingMessageProps {
  message: string;
  accentColor: string;
  groundColor: string;
}

export function ClosingMessage({ message, accentColor, groundColor }: ClosingMessageProps) {
  return (
    <section
      className="px-4 md:px-8 py-[clamp(88px,11vw,176px)]"
      style={{ backgroundColor: accentColor, color: groundColor }}
    >
      <div className="mx-auto max-w-[1376px]">
        <blockquote
          className="max-w-[34ch] text-[clamp(1.5rem,2.6vw,2.25rem)] font-medium leading-[1.25] tracking-[-0.02em]"
          data-reveal
        >
          <p className="whitespace-pre-line">{message}</p>
        </blockquote>
      </div>
    </section>
  );
}
