'use client';

import { HeroConfig } from '@/types/tribute';

interface HeroSectionProps {
  title: string;
  recipient: string;
  config?: HeroConfig;
  accentColor: string;
  groundColor: string;
  authorName?: string;
}

// The first screen of a tribute is the card the recipient opens: a striped band in the
// template's ink, who it is for, the title, and the opening photograph beside it.
export function HeroSection({ title, recipient, config, accentColor, groundColor, authorName }: HeroSectionProps) {
  const image = config?.image;

  return (
    <section className="p-3" style={{ backgroundColor: accentColor }}>
      <div className={`grid gap-3 min-h-[calc(100svh-24px)] ${image ? 'lg:grid-cols-2' : ''}`}>
        {image && (
          <div className="lg:order-2 min-w-0 h-[46svh] lg:h-auto overflow-hidden">
            <img src={image} alt={`Foto de ${recipient}`} className="w-full h-full object-cover drift" />
          </div>
        )}

        <div
          className="lg:order-1 min-w-0 relative z-10 -mt-6 lg:mt-0 flex flex-col"
          style={{ backgroundColor: groundColor, color: accentColor }}
        >
          <Stripe accent={accentColor} ground={groundColor} />
          <div className="flex-1 flex flex-col justify-center items-center text-center px-5 md:px-12 py-12">
            <p className="text-step-lead font-medium" data-reveal>
              Para {recipient}
            </p>
            <h1
              className={`mt-6 max-w-[16ch] ${titleSize(title)}`}
              data-reveal
              style={{ '--i': 1 } as React.CSSProperties}
            >
              {title}
            </h1>
            {authorName && (
              <p className="mt-8 text-step-body" style={{ color: '#55504c' }} data-reveal>
                Com carinho, {authorName}
              </p>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

function titleSize(title: string): string {
  if (!title) return 'text-[clamp(2.5rem,5vw,5rem)]';
  if (title.length <= 22) return 'text-[clamp(2.5rem,5vw,5rem)]';
  if (title.length <= 40) return 'text-[clamp(2.25rem,4vw,4rem)]';
  return 'text-[clamp(2rem,3vw,3rem)]';
}

export function Stripe({ accent, ground, className = 'h-10 md:h-14' }: { accent: string; ground: string; className?: string }) {
  return (
    <div className={`flex w-full min-w-0 overflow-hidden ${className}`} aria-hidden="true">
      {Array.from({ length: 80 }).map((_, i) => (
        <span key={i} className="shrink-0 w-7" style={{ backgroundColor: i % 2 === 0 ? accent : ground }} />
      ))}
    </div>
  );
}
