'use client';

import { useId } from 'react';

// The EternalPage mark: a heart drawn in one stroke whose line runs on into the name,
// as if written by hand, with the name in the same script as the tribute pages.
//
// When `animated` is on (default) the mark is written once, like a single pen stroke:
// the heart is traced, the line runs straight on into the "E" and the ink keeps flowing
// through the name at the same speed, ending in a flourish that grows out of the last letter's exit stroke.
// Timings follow the measured lengths (heart ≈ 207 units, name 68→266, tail ≈ 34) so the
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
  const tailMaskId = `ep-logo-tail-${uid}`;

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
            animation: ep-logo-draw .38s cubic-bezier(.2,.4,.5,1) 2.02s both;
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
        <mask id={tailMaskId} maskUnits="userSpaceOnUse" x="0" y="0" width="300" height="76">
          <path
            className="ep-tail"
            pathLength={1}
            fill="none"
            stroke="#fff"
            strokeWidth="5"
            d="M267.35 47 C269.2 43 278 32.6 297 32.8"
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
      </g>
      {/* The flourish: the exit stroke of the last "e" carried on, rising and tapering like
          a brush. It is a filled shape revealed by a stroke drawn along its centre line. */}
      <path mask={`url(#${tailMaskId})`} fill="currentColor" d="M267.7 47.2 L268.0 46.7 L268.4 46.2 L268.9 45.6 L269.4 44.9 L270.0 44.3 L270.7 43.6 L271.4 42.9 L272.2 42.1 L273.1 41.3 L274.0 40.6 L275.1 39.8 L276.2 39.0 L277.4 38.3 L278.7 37.5 L280.1 36.8 L281.5 36.1 L283.1 35.5 L284.8 34.9 L286.5 34.4 L288.4 33.9 L290.4 33.5 L292.5 33.2 L294.7 33.0 L297.0 32.9 L297.0 32.7 L294.7 32.6 L292.4 32.7 L290.3 32.8 L288.3 33.1 L286.3 33.4 L284.5 33.8 L282.7 34.3 L281.0 34.9 L279.5 35.5 L278.0 36.2 L276.6 36.9 L275.3 37.6 L274.1 38.4 L273.0 39.2 L272.0 40.1 L271.1 40.9 L270.2 41.7 L269.5 42.6 L268.9 43.4 L268.3 44.1 L267.9 44.9 L267.5 45.6 L267.2 46.3 L267.0 46.8Z" />
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
