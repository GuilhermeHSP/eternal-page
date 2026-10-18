'use client';

import { useEffect, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { Heart } from 'lucide-react';

interface EnvelopeIntroProps {
  recipient: string;
  accentColor: string;
  backgroundColor: string;
}

// The tribute starts as a sealed envelope addressed to the recipient. Tapping it opens the
// flap, slides the card up, reveals the page and starts the music (a tap is what browsers
// require before playing sound).
export function EnvelopeIntro({ recipient, accentColor, backgroundColor }: EnvelopeIntroProps) {
  const reduceMotion = useReducedMotion();
  const [phase, setPhase] = useState<'closed' | 'opening' | 'done'>('closed');

  // Keep the page from scrolling under the envelope.
  useEffect(() => {
    if (phase === 'done') return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previous;
    };
  }, [phase]);

  const open = () => {
    if (phase !== 'closed') return;
    window.dispatchEvent(new Event('eternalpage:open'));
    setPhase('opening');
    window.setTimeout(() => setPhase('done'), reduceMotion ? 200 : 1700);
  };

  return (
    <AnimatePresence>
      {phase !== 'done' && (
        <motion.div
          key="envelope"
          className="fixed inset-0 z-[100] flex flex-col items-center justify-center px-6 cursor-pointer select-none"
          style={{ backgroundColor }}
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: reduceMotion ? 0.2 : 0.8 } }}
          onClick={open}
          role="button"
          tabIndex={0}
          aria-label={`Abrir a homenagem para ${recipient}`}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              open();
            }
          }}
        >
          <div
            className="absolute inset-0 pointer-events-none"
            style={{ background: `radial-gradient(60% 50% at 50% 45%, ${accentColor}22 0%, transparent 70%)` }}
            aria-hidden="true"
          />

          <motion.p
            className="relative font-title text-xs uppercase tracking-[0.3em] text-gray-500"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: phase === 'opening' ? 0 : 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            Uma surpresa para
          </motion.p>
          <motion.p
            className="relative font-script text-6xl md:text-7xl text-gray-800 mt-2 mb-10 text-center leading-tight"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: phase === 'opening' ? 0 : 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            {recipient}
          </motion.p>

          {/* The envelope */}
          <motion.div
            className="relative w-[280px] h-[180px] md:w-[340px] md:h-[220px]"
            style={{ perspective: 900 }}
            initial={{ opacity: 0, y: 24, scale: 0.96 }}
            animate={
              phase === 'opening'
                ? { opacity: 1, y: 40, scale: 1 }
                : reduceMotion
                  ? { opacity: 1, y: 0, scale: 1 }
                  : { opacity: 1, y: [0, -6, 0], scale: 1 }
            }
            transition={
              phase === 'opening'
                ? { duration: 0.8, delay: 0.5 }
                : {
                    // Only the float loops: fading in and scaling up happen once (looping them
                    // made the envelope fade out and back in every few seconds).
                    duration: 0.6,
                    delay: 0.3,
                    y: { duration: 3, repeat: reduceMotion ? 0 : Infinity, ease: 'easeInOut', delay: 0.3 },
                  }
            }
          >
            {/* back: the inside of the envelope, darker so the card and the flap stand out.
                Only the bottom corners are rounded so the open flap meets it with no gaps. */}
            <div className="absolute inset-0 rounded-b-md" style={{ backgroundColor: shade(accentColor, -0.4) }} />

            {/* card that slides out */}
            <motion.div
              className="absolute left-4 right-4 top-3 bottom-3 rounded-sm bg-[#fffdf8] flex items-center justify-center"
              style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.08)', zIndex: 1 }}
              initial={{ y: 0 }}
              animate={phase === 'opening' && !reduceMotion ? { y: -110 } : { y: 0 }}
              transition={{ duration: 0.8, delay: 0.45, ease: [0.22, 1, 0.36, 1] }}
            >
              <span className="font-script text-3xl" style={{ color: accentColor }}>
                Com amor
              </span>
            </motion.div>

            {/* front pocket */}
            <div
              className="absolute inset-0 rounded-b-md"
              style={{
                backgroundColor: accentColor,
                clipPath: 'polygon(0 0, 50% 58%, 100% 0, 100% 100%, 0 100%)',
                boxShadow: '0 20px 40px -16px rgba(0,0,0,0.35)',
                zIndex: 2,
              }}
            />
            <div
              className="absolute inset-0 rounded-b-md pointer-events-none"
              style={{
                background: 'linear-gradient(to top, rgba(0,0,0,0.12), transparent 60%)',
                clipPath: 'polygon(0 0, 50% 58%, 100% 0, 100% 100%, 0 100%)',
                zIndex: 2,
              }}
            />

            {/* flap: above the card while closed, behind it once open. It has two faces: the
                outside, and the darker inside that shows once it has flipped up. */}
            <motion.div
              className="absolute left-0 right-0 top-0 h-[58%] origin-top"
              style={{ transformStyle: 'preserve-3d', zIndex: phase === 'opening' ? 0 : 3 }}
              initial={{ rotateX: 0 }}
              animate={phase === 'opening' && !reduceMotion ? { rotateX: 180 } : { rotateX: 0 }}
              transition={{ duration: 0.5, ease: 'easeInOut' }}
            >
              <div
                className="absolute inset-0"
                style={{
                  backgroundColor: shade(accentColor, 0.06),
                  clipPath: 'polygon(0 0, 100% 0, 50% 100%)',
                  backfaceVisibility: 'hidden',
                }}
              />
              <div
                className="absolute inset-0"
                style={{
                  backgroundColor: shade(accentColor, -0.3),
                  clipPath: 'polygon(0 100%, 100% 100%, 50% 0)',
                  backfaceVisibility: 'hidden',
                  transform: 'rotateX(180deg)',
                }}
              />
            </motion.div>

            {/* wax seal */}
            <motion.div
              className="absolute left-1/2 top-[58%] -translate-x-1/2 -translate-y-1/2 w-14 h-14 rounded-full flex items-center justify-center z-[4]"
              style={{
                backgroundColor: shade(accentColor, -0.18),
                boxShadow: 'inset 0 -3px 6px rgba(0,0,0,0.25), inset 0 2px 4px rgba(255,255,255,0.25), 0 4px 10px rgba(0,0,0,0.25)',
              }}
              animate={phase === 'opening' ? { scale: 0, opacity: 0 } : { scale: 1, opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              <Heart className="h-6 w-6 text-white/90" fill="currentColor" />
            </motion.div>
          </motion.div>

          <motion.p
            className="relative mt-12 font-title text-sm uppercase tracking-[0.25em]"
            style={{ color: accentColor }}
            initial={{ opacity: 0 }}
            animate={phase === 'opening' ? { opacity: 0 } : { opacity: [0.5, 1, 0.5] }}
            transition={phase === 'opening' ? { duration: 0.3 } : { duration: 2.2, repeat: Infinity }}
          >
            Toque para abrir
          </motion.p>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// Lighten (amount > 0) or darken (amount < 0) a hex colour.
function shade(hex: string, amount: number): string {
  const m = /^#?([0-9a-f]{6})$/i.exec(hex);
  if (!m) return hex;
  const n = parseInt(m[1], 16);
  const channels = [(n >> 16) & 255, (n >> 8) & 255, n & 255].map((c) =>
    Math.round(amount >= 0 ? c + (255 - c) * amount : c * (1 + amount))
  );
  return `#${channels.map((c) => c.toString(16).padStart(2, '0')).join('')}`;
}
