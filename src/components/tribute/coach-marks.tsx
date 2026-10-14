'use client';

import { useCallback, useEffect, useState } from 'react';

export interface CoachMark {
  // Elements marked data-tour="<target>"; the first one visible on screen is highlighted.
  target: string;
  title: string;
  text: string;
}

interface CoachMarksProps {
  marks: CoachMark[];
  onDone: () => void;
}

const PAD = 8;

function findTarget(target: string): HTMLElement | null {
  const els = Array.from(document.querySelectorAll<HTMLElement>(`[data-tour="${target}"]`));
  return (
    els.find((el) => {
      const r = el.getBoundingClientRect();
      return r.width > 0 && r.height > 0 && r.bottom > 0 && r.top < window.innerHeight;
    }) ??
    els.find((el) => el.getBoundingClientRect().width > 0) ??
    null
  );
}

// A short guided tour: the screen goes dark except for one button at a time, with a card
// explaining it. Tapping "Próximo"/"Entendi" moves on; "Pular" ends it.
export function CoachMarks({ marks, onDone }: CoachMarksProps) {
  const [index, setIndex] = useState(0);
  const [rect, setRect] = useState<DOMRect | null>(null);
  const mark = marks[index];

  const measure = useCallback(() => {
    const el = mark ? findTarget(mark.target) : null;
    setRect(el ? el.getBoundingClientRect() : null);
  }, [mark]);

  useEffect(() => {
    if (!mark) return;
    const el = findTarget(mark.target);
    if (el) {
      const r = el.getBoundingClientRect();
      if (r.top < 0 || r.bottom > window.innerHeight) el.scrollIntoView({ block: 'center' });
    }
    // Let layout settle (a button may still be animating in) before measuring.
    const t = window.setTimeout(measure, 120);
    window.addEventListener('resize', measure);
    window.addEventListener('scroll', measure, { passive: true });
    return () => {
      window.clearTimeout(t);
      window.removeEventListener('resize', measure);
      window.removeEventListener('scroll', measure);
    };
  }, [mark, measure]);

  if (!mark) return null;
  const last = index === marks.length - 1;
  const next = () => (last ? onDone() : setIndex((i) => i + 1));

  // The card goes above the button when the button is in the lower half of the screen.
  const below = rect ? rect.top + rect.height / 2 < window.innerHeight / 2 : true;
  const cardStyle: React.CSSProperties = rect
    ? below
      ? { top: rect.bottom + PAD + 14 }
      : { bottom: window.innerHeight - rect.top + PAD + 14 }
    : { top: '40%' };

  return (
    <div className="fixed inset-0 z-[70]" role="dialog" aria-modal="true" aria-label={mark.title}>
      {/* Click-catcher behind the spotlight */}
      <div className="absolute inset-0" onClick={next} />

      {rect ? (
        <div
          className="pointer-events-none absolute rounded-full ring-2 ring-white transition-all duration-300"
          style={{
            top: rect.top - PAD,
            left: rect.left - PAD,
            width: rect.width + PAD * 2,
            height: rect.height + PAD * 2,
            boxShadow: '0 0 0 9999px rgba(17, 24, 39, 0.86)',
          }}
        />
      ) : (
        <div className="pointer-events-none absolute inset-0 bg-gray-900/85" />
      )}

      <div className="absolute left-4 right-4 mx-auto max-w-sm rounded-2xl bg-white p-5 shadow-2xl" style={cardStyle}>
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-rose-500">
          Dica {index + 1} de {marks.length}
        </p>
        <h3 className="mt-1 font-title text-lg font-semibold text-gray-900">{mark.title}</h3>
        <p className="mt-1 text-sm text-gray-600">{mark.text}</p>
        <div className="mt-4 flex items-center justify-between">
          <button type="button" onClick={onDone} className="text-sm text-gray-400 hover:text-gray-600">
            Pular
          </button>
          <button
            type="button"
            onClick={next}
            className="h-10 px-5 rounded-full bg-rose-500 text-white text-sm font-semibold hover:bg-rose-600"
          >
            {last ? 'Entendi' : 'Próxima dica'}
          </button>
        </div>
      </div>
    </div>
  );
}
