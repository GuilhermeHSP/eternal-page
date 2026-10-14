'use client';

import { PhotoConfig } from '@/types/tribute';

interface PhotoGalleryProps {
  photos: PhotoConfig[];
  accentColor: string;
  groundColor: string;
}

// Each photo is a print with its label strip attached beneath it.
export function PhotoGallery({ photos, accentColor, groundColor }: PhotoGalleryProps) {
  if (!photos || photos.length === 0) return null;

  return (
    <section className="px-4 md:px-8 pb-[clamp(88px,11vw,176px)]">
      <div className="mx-auto max-w-[1376px]">
        <h2 className="text-step-head" style={{ color: accentColor }} data-reveal>
          Nossos momentos
        </h2>
        <ul className="mt-10 grid grid-cols-2 md:grid-cols-3 gap-x-2 md:gap-x-3 gap-y-5 md:gap-y-7">
          {photos.map((photo, index) => {
            const dark = index % 2 === 0;
            return (
              <li key={photo.id} data-reveal style={{ '--i': index % 3 } as React.CSSProperties}>
                <figure className="group">
                  <div className="aspect-[4/5] overflow-hidden" style={{ backgroundColor: groundColor }}>
                    <img
                      src={photo.url}
                      alt={photo.caption || `Foto ${index + 1}`}
                      loading="lazy"
                      className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]"
                    />
                  </div>
                  {photo.caption && (
                    <figcaption
                      className="min-h-[64px] p-3 text-step-small font-medium"
                      style={{
                        backgroundColor: dark ? accentColor : '#ffffff80',
                        color: dark ? groundColor : accentColor,
                      }}
                    >
                      {photo.caption}
                    </figcaption>
                  )}
                </figure>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}

interface PhotoCarouselProps {
  photos: PhotoConfig[];
  accentColor: string;
  groundColor: string;
}

// A row of large prints that scrolls sideways, for the livelier templates.
export function PhotoCarousel({ photos, accentColor, groundColor }: PhotoCarouselProps) {
  if (!photos || photos.length === 0) return null;

  return (
    <section className="pb-[clamp(88px,11vw,176px)] overflow-hidden">
      <div className="mx-auto max-w-[1376px] px-4 md:px-8">
        <h2 className="text-step-head" style={{ color: accentColor }} data-reveal>
          Nossos momentos
        </h2>
      </div>
      <ul className="mt-10 flex gap-3 overflow-x-auto snap-x snap-mandatory px-4 md:px-8 pb-2 scrollbar-hide">
        {photos.map((photo, index) => (
          <li key={photo.id} className="snap-start shrink-0 w-[78vw] md:w-[36vw] max-w-[560px]">
            <figure>
              <div className="aspect-[4/5] overflow-hidden" style={{ backgroundColor: groundColor }}>
                <img
                  src={photo.url}
                  alt={photo.caption || `Foto ${index + 1}`}
                  loading="lazy"
                  className="w-full h-full object-cover"
                />
              </div>
              {photo.caption && (
                <figcaption className="p-3 text-step-small font-medium" style={{ backgroundColor: accentColor, color: groundColor }}>
                  {photo.caption}
                </figcaption>
              )}
            </figure>
          </li>
        ))}
      </ul>
    </section>
  );
}
