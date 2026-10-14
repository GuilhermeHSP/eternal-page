'use client';

// Marks an unpublished tribute: a repeated "prévia" pattern over the page and one plain
// label pinned at the top, so the page can be checked but not passed off as finished.
export function WatermarkOverlay() {
  return (
    <div className="fixed inset-0 z-[9998] pointer-events-none overflow-hidden" aria-hidden="true">
      <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg" className="absolute inset-0 opacity-[0.12]">
        <defs>
          <pattern id="watermark" x="0" y="0" width="240" height="120" patternUnits="userSpaceOnUse">
            <text
              x="20"
              y="64"
              fontFamily="Switzer, system-ui, sans-serif"
              fontWeight="600"
              fontSize="22"
              fill="#7d0c14"
              transform="rotate(-15 120 60)"
            >
              prévia · não publicada
            </text>
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#watermark)" />
      </svg>
    </div>
  );
}
