// The EternalPage mark: a heart drawn in one stroke whose line runs on into the name,
// as if written by hand, with the name in the same script as the tribute pages.
export function Logo({ className = 'h-10', title = 'EternalPage' }: { className?: string; title?: string }) {
  return (
    <svg viewBox="0 0 300 76" className={className} role="img" aria-label={title}>
      <g fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" className="text-rose-500">
        {/* Heart: starts at the open end of the right side, over both lobes, down to the tip,
            then the same line sweeps up into the first letter of the name. */}
        <path
          strokeWidth="3.4"
          d="M43 49 C53 41 59 31 58 21 C57 10 47 5 39 9 C35 11 32 15 31 19 C30 15 27 11 23 9 C15 5 5 10 4 21 C3 33 13 45 30 59 C38 65 52 64 61 59 C66 56 69 53 71 49"
        />
        {/* The tail leaving the last letter */}
        <path strokeWidth="2.6" d="M263 47 C268 55 280 58 296 52" />
      </g>
      <text
        x="68"
        y="52"
        className="font-script"
        fontSize="46"
        fill="currentColor"
        style={{ fontFamily: "'Great Vibes', cursive" }}
      >
        EternalPage
      </text>
    </svg>
  );
}
