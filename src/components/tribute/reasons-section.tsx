'use client';

import { useRef, useState } from 'react';
import { motion, useInView } from 'framer-motion';
import { Heart } from 'lucide-react';

interface ReasonsSectionProps {
  reasons: string[];
  accentColor: string;
}

// "Motivos para te amar": a deck of cards, each hiding one reason until it is tapped.
export function ReasonsSection({ reasons, accentColor }: ReasonsSectionProps) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-80px' });
  const [open, setOpen] = useState<Set<number>>(new Set());
  const list = reasons.map((r) => r.trim()).filter(Boolean);
  if (!list.length) return null;

  const toggle = (i: number) =>
    setOpen((prev) => {
      const next = new Set(prev);
      if (next.has(i)) next.delete(i);
      else next.add(i);
      return next;
    });

  return (
    <section ref={ref} className="py-20 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 text-gray-500 mb-3">
            <Heart className="h-5 w-5" style={{ color: accentColor }} />
            <span className="font-title text-sm tracking-[0.18em] uppercase">
              {list.length} {list.length === 1 ? 'motivo' : 'motivos'}
            </span>
          </div>
          <h2 className="font-script text-5xl md:text-6xl leading-tight text-gray-800">Motivos para te amar</h2>
          <p className="mt-3 font-title text-sm text-gray-500">Toque em cada cartão para descobrir</p>
        </div>

        <ul className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {list.map((reason, i) => {
            const flipped = open.has(i);
            return (
              <motion.li
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.5, delay: (i % 6) * 0.07 }}
                style={{ perspective: 900 }}
              >
                <button
                  type="button"
                  onClick={() => toggle(i)}
                  aria-pressed={flipped}
                  aria-label={flipped ? reason : `Motivo ${i + 1}: toque para ver`}
                  className="relative block w-full aspect-[4/5] text-center"
                >
                  <motion.span
                    className="absolute inset-0 block"
                    style={{ transformStyle: 'preserve-3d' }}
                    animate={{ rotateY: flipped ? 180 : 0 }}
                    transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                  >
                    {/* front */}
                    <span
                      className="absolute inset-0 rounded-2xl flex flex-col items-center justify-center gap-3 text-white"
                      style={{
                        backfaceVisibility: 'hidden',
                        backgroundColor: accentColor,
                        boxShadow: '0 12px 28px -14px rgba(0,0,0,0.35)',
                      }}
                    >
                      <Heart className="h-8 w-8 text-white/90" fill="currentColor" />
                      <span className="font-title text-xs uppercase tracking-[0.25em] text-white/85">Motivo</span>
                      <span className="font-script text-5xl leading-none">{i + 1}</span>
                    </span>
                    {/* back */}
                    <span
                      className="absolute inset-0 rounded-2xl flex items-center justify-center p-5 bg-[#fffdf8]"
                      style={{
                        backfaceVisibility: 'hidden',
                        transform: 'rotateY(180deg)',
                        boxShadow: '0 12px 28px -14px rgba(60,40,30,0.3)',
                      }}
                    >
                      <span className="font-title font-light text-base md:text-lg leading-snug text-gray-700">{reason}</span>
                    </span>
                  </motion.span>
                </button>
              </motion.li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
