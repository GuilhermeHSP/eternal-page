'use client';

import { motion } from 'framer-motion';

export function WatermarkOverlay() {
  return (
    <div className="fixed inset-0 z-[9998] pointer-events-none overflow-hidden">
      {/* Diagonal watermark pattern */}
      <div className="absolute inset-0 opacity-10">
        <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="watermark" x="0" y="0" width="200" height="100" patternUnits="userSpaceOnUse">
              <text
                x="10"
                y="50"
                fontFamily="Georgia, serif"
                fontSize="14"
                fill="#e11d48"
                transform="rotate(-15 100 50)"
                opacity="0.8"
              >
                PREVIEW
              </text>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#watermark)" />
        </svg>
      </div>

      {/* Center watermark badge */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.5, duration: 0.5 }}
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
      >
        <div className="bg-amber-500/90 backdrop-blur-sm text-white px-6 py-3 rounded-full shadow-lg flex items-center gap-2">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
          </svg>
          <span className="font-medium tracking-wide">MODO PREVIEW</span>
        </div>
      </motion.div>

      {/* Corner badges */}
      <div className="absolute top-24 right-4">
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.7 }}
          className="bg-black/50 backdrop-blur-sm text-white text-xs px-3 py-1.5 rounded-full"
        >
          Não publicado
        </motion.div>
      </div>
    </div>
  );
}
