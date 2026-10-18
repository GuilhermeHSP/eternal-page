'use client';

import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { Camera } from 'lucide-react';
import { PhotoConfig } from '@/types/tribute';

interface PhotoGalleryProps {
  photos: PhotoConfig[];
  accentColor: string;
}

export function PhotoGallery({ photos, accentColor }: PhotoGalleryProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(containerRef, { once: true, margin: '-100px' });

  if (!photos || photos.length === 0) return null;

  return (
    <section ref={containerRef} className="py-16 px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={isInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.6 }}
        className="max-w-4xl mx-auto"
      >
        {/* Section header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 text-gray-500 mb-3">
            <Camera className="h-5 w-5" style={{ color: accentColor }} />
            <span className="font-title text-sm tracking-[0.18em] uppercase">
              Memórias
            </span>
          </div>
          <h2 className="font-script text-5xl md:text-6xl leading-tight text-gray-800">
            Momentos guardados
          </h2>
        </div>

        {/* Polaroid gallery */}
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-x-4 gap-y-7 sm:gap-8 md:gap-6">
          {photos.map((photo, index) => (
            <PolaroidPhoto
              key={photo.id}
              photo={photo}
              index={index}
              accentColor={accentColor}
              isInView={isInView}
            />
          ))}
        </div>
      </motion.div>
    </section>
  );
}

interface PolaroidPhotoProps {
  photo: PhotoConfig;
  index: number;
  accentColor: string;
  isInView: boolean;
}

function PolaroidPhoto({ photo, index, accentColor, isInView }: PolaroidPhotoProps) {
  // Calculate random rotation for scattered effect
  const rotations = [-4, 3, -2, 4, -3, 2, 4, -3, 3, -2];
  const rotation = rotations[index % rotations.length];

  return (
    <motion.div
      initial={{ opacity: 0, y: 40, rotate: 0 }}
      animate={isInView ? { 
        opacity: 1, 
        y: 0, 
        rotate: rotation,
      } : {}}
      transition={{ 
        duration: 0.6, 
        delay: index * 0.1,
        ease: 'easeOut' 
      }}
      whileHover={{ 
        scale: 1.05, 
        rotate: 0, 
        y: -8,
        transition: { duration: 0.2 } 
      }}
      className="relative cursor-pointer group"
    >
      {/* Polaroid frame */}
      <div 
        className="bg-white p-2 pb-9 sm:p-3 sm:pb-12 rounded-sm shadow-lg transition-shadow duration-300 group-hover:shadow-xl"
        style={{
          boxShadow: `0 4px 20px rgba(0, 0, 0, 0.1), 0 0 0 1px rgba(0, 0, 0, 0.03)`,
        }}
      >
        {/* Photo */}
        <div className="relative aspect-square overflow-hidden bg-gray-100">
          <img
            src={photo.url}
            alt={photo.caption || 'Foto de lembrança'}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            loading="lazy"
            decoding="async"
            onError={(e) => {
              // A broken photo shows the soft background instead of the browser's broken-image icon.
              e.currentTarget.style.visibility = 'hidden';
            }}
          />
          
          {/* Vintage overlay effect */}
          <div 
            className="absolute inset-0 opacity-10 pointer-events-none"
            style={{
              background: 'linear-gradient(135deg, rgba(0,0,0,0.1) 0%, transparent 50%, rgba(255,255,255,0.1) 100%)',
            }}
          />
        </div>

        {/* Caption area */}
        <div className="absolute bottom-1.5 left-2 right-2 sm:bottom-2 sm:left-3 sm:right-3">
          {photo.caption ? (
            <p 
              className="font-script text-center text-gray-700 truncate text-base sm:text-xl"
              style={{ lineHeight: 1.2 }}
            >
              {photo.caption}
            </p>
          ) : (
            <div className="h-4 flex items-center justify-center">
              <div className="w-8 h-0.5 bg-gray-200 rounded" />
            </div>
          )}
        </div>
      </div>

      {/* Tape decoration */}
      <div
        className="absolute -top-3 left-1/2 -translate-x-1/2 w-16 h-6 bg-yellow-100/80 rounded-sm"
        style={{
          transform: `translateX(-50%) rotate(${rotations[index % rotations.length] * 0.5}deg)`,
          boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
        }}
      />

      {/* Accent color strip */}
      <motion.div
        className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-0 h-1 rounded-full"
        style={{ backgroundColor: accentColor }}
        whileHover={{ width: '80%' }}
        transition={{ duration: 0.2 }}
      />
    </motion.div>
  );
}

// Carousel variant for premium templates
interface PhotoCarouselProps {
  photos: PhotoConfig[];
  accentColor: string;
}

export function PhotoCarousel({ photos, accentColor }: PhotoCarouselProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(containerRef, { once: true, margin: '-100px' });

  if (!photos || photos.length === 0) return null;

  return (
    <section ref={containerRef} className="py-16 px-4 overflow-hidden">
      <motion.div
        initial={{ opacity: 0 }}
        animate={isInView ? { opacity: 1 } : {}}
        transition={{ duration: 0.6 }}
        className="max-w-6xl mx-auto"
      >
        {/* Section header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 text-gray-500 mb-3">
            <Camera className="h-5 w-5" style={{ color: accentColor }} />
            <span className="font-title text-sm tracking-[0.18em] uppercase">
              Galeria
            </span>
          </div>
          <h2 className="font-script text-5xl md:text-6xl leading-tight text-gray-800">
            Nossa jornada juntos
          </h2>
        </div>

        {/* Horizontal scrolling gallery */}
        <motion.div
          className="flex gap-6 overflow-x-auto pb-4 -mx-4 px-4 scrollbar-hide"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {photos.map((photo, index) => (
            <motion.div
              key={photo.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={isInView ? { opacity: 1, scale: 1 } : {}}
              transition={{ duration: 0.4, delay: index * 0.05 }}
              className="flex-shrink-0 w-64 md:w-80"
            >
              <div className="relative aspect-[4/3] rounded-2xl overflow-hidden shadow-lg group">
                <img
                  src={photo.url}
                  alt={photo.caption || 'Foto de lembrança'}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  loading="lazy"
                  decoding="async"
                  onError={(e) => {
                    // A broken photo shows the soft background instead of the browser's broken-image icon.
                    e.currentTarget.style.visibility = 'hidden';
                  }}
                />
                {/* Gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                
                {/* Caption */}
                {photo.caption && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    whileHover={{ opacity: 1, y: 0 }}
                    className="absolute bottom-0 left-0 right-0 p-4"
                  >
                    <p className="text-white text-sm md:text-base font-medium">
                      {photo.caption}
                    </p>
                  </motion.div>
                )}
              </div>
            </motion.div>
          ))}
        </motion.div>
      </motion.div>
    </section>
  );
}
