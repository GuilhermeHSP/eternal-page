'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, useScroll, useTransform, useInView, useReducedMotion } from 'framer-motion';
import { HeroConfig } from '@/types/tribute';

interface HeroSectionProps {
  title: string;
  recipient: string;
  config?: HeroConfig;
  accentColor: string;
}

export function HeroSection({ title, recipient, config, accentColor }: HeroSectionProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(contentRef, { once: true });
  
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end start'],
  });

  const y = useTransform(scrollYProgress, [0, 1], ['0%', '30%']);
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);
  const scale = useTransform(scrollYProgress, [0, 0.5], [1, 0.95]);

  const reduceMotion = useReducedMotion();
  const hasImage = config?.image;
  // A portrait photo stretched over a wide screen is cropped down to a close-up of the faces, so
  // from md up it is shown whole, over a blurred copy of itself. Phones keep the full-bleed crop.
  const imgRef = useRef<HTMLImageElement>(null);
  const [portrait, setPortrait] = useState(false);
  const measure = (img: HTMLImageElement | null) => {
    if (img?.naturalWidth) setPortrait(img.naturalHeight > img.naturalWidth);
  };
  useEffect(() => measure(imgRef.current), [config?.image]);
  const gradientColor = config?.gradient || accentColor;

  return (
    <section 
      ref={containerRef}
      className={`relative min-h-[85vh] flex justify-center overflow-hidden ${
        hasImage ? 'items-end pt-24 pb-28 md:pb-32' : 'items-center py-24'
      }`}
    >
      {/* Background */}
      {hasImage ? (
        <motion.div
          style={{ y }}
          className="absolute inset-0"
        >
          {portrait && (
            <img
              src={config.image}
              alt=""
              aria-hidden
              className="hidden md:block absolute inset-0 w-full h-full object-cover scale-110 blur-2xl"
            />
          )}
          {/* Slow push-in, like the opening shot of a film */}
          <motion.img
            ref={imgRef}
            src={config.image}
            alt=""
            onLoad={(e) => measure(e.currentTarget)}
            className={`relative w-full h-full object-cover object-[center_30%] ${portrait ? 'md:object-contain' : ''}`}
            fetchPriority="high"
            decoding="async"
            initial={{ scale: 1 }}
            animate={reduceMotion ? { scale: 1 } : { scale: 1.12 }}
            transition={{ duration: 20, ease: 'easeOut' }}
          />
          {/* Darken from the bottom up only, so the face stays clear and the text reads */}
          <div
            className="absolute inset-0"
            style={{
              background:
                'linear-gradient(to top, rgba(0,0,0,0.78) 0%, rgba(0,0,0,0.45) 32%, rgba(0,0,0,0.12) 62%, rgba(0,0,0,0.05) 100%)',
            }}
          />
          {/* A light veil in the template's colour gives each template its own mood */}
          {config.overlay !== false && (
            <>
              <div
                className="absolute inset-0"
                style={{ backgroundColor: gradientColor, opacity: 0.35, mixBlendMode: 'soft-light' }}
              />
              <div
                className="absolute inset-0"
                style={{ background: `linear-gradient(to top, ${gradientColor}55 0%, transparent 55%)` }}
              />
            </>
          )}
        </motion.div>
      ) : (
        <div className="absolute inset-0">
          {/* Gradient background */}
          <div 
            className="absolute inset-0"
            style={{
              background: `linear-gradient(135deg, ${accentColor}08 0%, ${accentColor}03 50%, transparent 100%)`,
            }}
          />
          
          {/* Decorative circles */}
          <motion.div
            animate={{
              scale: [1, 1.1, 1],
              opacity: [0.3, 0.4, 0.3],
            }}
            transition={{ duration: 4, repeat: Infinity }}
            className="absolute -top-20 -right-20 w-96 h-96 rounded-full blur-3xl"
            style={{ backgroundColor: `${accentColor}20` }}
          />
          <motion.div
            animate={{
              scale: [1.1, 1, 1.1],
              opacity: [0.2, 0.3, 0.2],
            }}
            transition={{ duration: 5, repeat: Infinity }}
            className="absolute -bottom-32 -left-32 w-[500px] h-[500px] rounded-full blur-3xl"
            style={{ backgroundColor: `${accentColor}15` }}
          />
        </div>
      )}

      {/* Content */}
      <motion.div
        ref={contentRef}
        style={{ opacity, scale }}
        className="relative z-10 text-center px-4 max-w-3xl mx-auto"
      >
        {/* For badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="mb-6"
        >
          <span
            className="inline-block px-5 py-2 rounded-full text-sm font-medium tracking-wide uppercase"
            style={{
              backgroundColor: hasImage ? 'rgba(255,255,255,0.2)' : `${accentColor}12`,
              color: hasImage ? 'rgba(255,255,255,0.9)' : accentColor,
              backdropFilter: hasImage ? 'blur(10px)' : 'none',
            }}
          >
            Uma homenagem para
          </span>
        </motion.div>

        {/* Recipient name, large and handwritten like an invitation */}
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="font-script text-6xl md:text-8xl lg:text-9xl leading-[1.05] mb-5 px-2"
          style={{
            color: hasImage ? '#fff' : accentColor,
            textShadow: hasImage ? '0 2px 24px rgba(0,0,0,0.35)' : undefined,
          }}
        >
          {recipient}
        </motion.h1>

        {/* Main title, light and spaced underneath */}
        <motion.p
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="font-title font-light uppercase text-xl md:text-3xl tracking-[0.14em] leading-snug mb-8 mx-auto max-w-[24ch] [text-wrap:balance]"
          style={{
            color: hasImage ? 'rgba(255,255,255,0.92)' : '#1f2937',
            textShadow: hasImage ? '0 2px 16px rgba(0,0,0,0.35)' : undefined,
          }}
        >
          {title}
        </motion.p>

        {/* Decorative line */}
        <motion.div
          initial={{ scaleX: 0 }}
          animate={isInView ? { scaleX: 1 } : {}}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="flex justify-center"
        >
          <div 
            className="h-1 w-24 rounded-full"
            style={{ backgroundColor: hasImage ? 'rgba(255,255,255,0.6)' : accentColor }}
          />
        </motion.div>

      </motion.div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={isInView ? { opacity: 1 } : {}}
        transition={{ duration: 0.6, delay: 0.8 }}
        className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10"
      >
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className="flex flex-col items-center gap-2"
        >
          <span 
            className="text-xs tracking-wider uppercase"
            style={{ color: hasImage ? 'rgba(255,255,255,0.6)' : '#9ca3af' }}
          >
            Role
          </span>
          <div 
            className="w-5 h-8 rounded-full border-2 flex justify-center pt-1.5"
            style={{ 
              borderColor: hasImage ? 'rgba(255,255,255,0.4)' : '#d1d5db',
            }}
          >
            <motion.div
              animate={{ y: [0, 8, 0] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="w-1 h-2 rounded-full"
              style={{ backgroundColor: hasImage ? 'rgba(255,255,255,0.6)' : accentColor }}
            />
          </div>
        </motion.div>
      </motion.div>
    </section>
  );
}
