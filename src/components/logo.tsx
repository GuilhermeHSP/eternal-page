'use client';

import { useId } from 'react';

// The EternalPage mark: a heart drawn in one stroke whose line runs on into the name,
// as if written by hand, with the name in the same script as the tribute pages.
//
// When `animated` is on (default) the mark is written once, like a single pen stroke:
// the heart is traced, the line runs straight on into the "E" and the ink keeps flowing
// through the name at the same speed, ending in the flourish after the last letter.
// Timings follow the measured lengths (heart ≈ 207 units, name 68→266, tail ≈ 36) so the
// pen never stops or changes pace between parts. Reduced-motion users see it static.
export function Logo({
  className = 'h-10',
  title = 'EternalPage',
  animated = true,
}: {
  className?: string;
  title?: string;
  animated?: boolean;
}) {
  const uid = useId().replace(/[^a-zA-Z0-9_-]/g, '');
  const maskId = `ep-logo-ink-${uid}`;
  const gradId = `ep-logo-grad-${uid}`;

  return (
    <svg
      viewBox="0 0 300 76"
      className={`${className} text-rose-500 ${animated ? 'ep-logo-anim' : ''}`}
      role="img"
      aria-label={title}
    >
      {animated && (
        <style>{`
          .ep-logo-anim .ep-heart {
            stroke-dasharray: 1;
            animation: ep-logo-draw 1s cubic-bezier(.5,0,.8,.8) both;
          }
          .ep-logo-anim .ep-ink {
            transform: translateX(0);
            animation: ep-logo-ink 1.08s linear 1s both;
          }
          .ep-logo-anim .ep-tail {
            stroke-dasharray: 1;
            animation: ep-logo-draw .36s cubic-bezier(.2,.4,.5,1) 2.01s both;
          }
          @keyframes ep-logo-draw {
            from { stroke-dashoffset: 1; opacity: 0; }
            1% { opacity: 1; }
            to { stroke-dashoffset: 0; opacity: 1; }
          }
          @keyframes ep-logo-ink { to { transform: translateX(216px); } }
          @media (prefers-reduced-motion: reduce) {
            .ep-logo-anim .ep-heart, .ep-logo-anim .ep-tail { animation: none; }
            .ep-logo-anim .ep-ink { animation: none; transform: translateX(216px); }
          }
        `}</style>
      )}
      <defs>
        {/* Ink front with a soft edge: solid behind, fading over the last ~14 units. */}
        <linearGradient id={gradId}>
          <stop offset="0" stopColor="#fff" />
          <stop offset="0.94" stopColor="#fff" />
          <stop offset="1" stopColor="#fff" stopOpacity="0" />
        </linearGradient>
        <mask id={maskId} maskUnits="userSpaceOnUse" x="0" y="0" width="300" height="76">
          {/* Front starts at x=64, where the heart line meets the "E", and moves to x=280. */}
          <rect
            className="ep-ink"
            x={animated ? -176 : 40}
            y="0"
            width="240"
            height="76"
            fill={`url(#${gradId})`}
          />
        </mask>
      </defs>
      <g fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
        {/* Heart: starts at the open end of the right side, over both lobes, down to the tip,
            then the same line sweeps up into the first letter of the name. */}
        <path
          className="ep-heart"
          pathLength={1}
          strokeWidth="3.4"
          d="M43 49 C53 41 59 31 58 21 C57 10 47 5 39 9 C35 11 32 15 31 19 C30 15 27 11 23 9 C15 5 5 10 4 21 C3 33 13 45 30 59 C38 65 52 64 61 59 C66 56 69 53 71 49"
        />
        {/* The tail leaving the last letter */}
        <path className="ep-tail" pathLength={1} strokeWidth="2.6" d="M263 47 C268 55 280 58 296 52" />
      </g>
      <text
        x="68"
        y="52"
        className="font-script"
        fontSize="46"
        fill="currentColor"
        mask={`url(#${maskId})`}
        style={{ fontFamily: "'Great Vibes', cursive" }}
      >
        EternalPage
      </text>
    </svg>
  );
}
