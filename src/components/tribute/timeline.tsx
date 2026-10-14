'use client';

import { TimelineItemConfig } from '@/types/tribute';

interface TimelineProps {
  items: TimelineItemConfig[];
  accentColor: string;
  groundColor: string;
}

// The story set like an itinerary: the year large on the left, what happened on the right.
export function Timeline({ items, accentColor, groundColor }: TimelineProps) {
  if (!items || items.length === 0) return null;

  const sortedItems = [...items].sort((a, b) => a.order - b.order);

  return (
    <section
      className="px-4 md:px-8 py-[clamp(88px,11vw,176px)]"
      style={{ backgroundColor: '#ffffff59' }}
    >
      <div className="mx-auto max-w-[1376px] grid md:grid-cols-12 gap-8 md:gap-6">
        <h2 className="md:col-span-3 text-step-head" style={{ color: accentColor }} data-reveal>
          Nossa história
        </h2>
        <ol className="md:col-start-5 md:col-span-8 space-y-12 md:space-y-16">
          {sortedItems.map((item, index) => (
            <li
              key={item.id}
              className="grid grid-cols-[5.5rem_1fr] md:grid-cols-[9rem_1fr] gap-x-5 md:gap-x-8"
              data-reveal
              style={{ '--i': index % 3 } as React.CSSProperties}
            >
              <p
                className="text-step-lead md:text-[clamp(1.75rem,2.6vw,2.5rem)] font-semibold tracking-[-0.04em] leading-none tabular-nums"
                style={{ color: accentColor }}
              >
                {item.year || '—'}
              </p>
              <div>
                <h3 className="text-step-lead" style={{ color: '#1d1b1a' }}>
                  {item.title}
                </h3>
                {item.description && (
                  <p className="mt-3 max-w-[52ch] text-step-body" style={{ color: '#1d1b1a' }}>
                    {item.description}
                  </p>
                )}
                {item.imageUrl && (
                  <div className="mt-5 aspect-[3/2] max-w-[560px] overflow-hidden" style={{ backgroundColor: groundColor }}>
                    <img src={item.imageUrl} alt={item.title} loading="lazy" className="w-full h-full object-cover" />
                  </div>
                )}
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
