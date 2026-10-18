'use client';

// A light diagonal "PRÉVIA" pattern over the whole page. It marks the page as unpublished
// without covering the name, the title or the letter; the pink bar on top says the rest.
export function WatermarkOverlay() {
  return (
    <div className="fixed inset-0 z-[9998] pointer-events-none overflow-hidden" aria-hidden="true">
      <div className="absolute inset-0 opacity-[0.12]">
        <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="watermark" x="0" y="0" width="220" height="110" patternUnits="userSpaceOnUse">
              <text
                x="10"
                y="55"
                fontFamily="'Josefin Sans', sans-serif"
                fontSize="13"
                letterSpacing="3"
                fill="#e11d48"
                transform="rotate(-15 110 55)"
              >
                PRÉVIA · ETERNALPAGE
              </text>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#watermark)" />
        </svg>
      </div>
    </div>
  );
}
