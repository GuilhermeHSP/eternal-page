'use client';

import { useRef } from 'react';
import { motion, useScroll, useTransform, useInView } from 'framer-motion';
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

  const hasImage = config?.image;
  const gradientColor = config?.gradient || accentColor;

  return (
    <section 
      ref={containerRef}
      className="relative min-h-[85vh] flex items-center justify-center overflow-hidden"
    >
      {/* Background */}
      {hasImage ? (
        <motion.div
          style={{ y }}
          className="absolute inset-0"
        >
          <img
            src={config.image}
            alt=""
            className="w-full h-full object-cover"
          />
          {/* Overlay */}
          <div 
            className="absolute inset-0"
            style={{
              background: `linear-gradient(to bottom, rgba(0,0,0,0.3) 0%, rgba(0,0,0,0.5) 100%)`,
            }}
          />
          {config.overlay !== false && (
            <div 
              className="absolute inset-0 opacity-30"
              style={{
                background: `linear-gradient(135deg, ${gradientColor}40 0%, transparent 50%, ${gradientColor}20 100%)`,
              }}
            />
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
            A tribute for
          </span>
        </motion.div>

        {/* Recipient name */}
        <motion.h2
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-xl md:text-2xl font-medium mb-4 tracking-wide"
          style={{ 
            color: hasImage ? 'rgba(255,255,255,0.85)' : `${accentColor}`,
          }}
        >
          {recipient}
        </motion.h2>

        {/* Main title */}
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-4xl md:text-6xl lg:text-7xl font-serif font-medium leading-tight mb-8"
          style={{ color: hasImage ? '#fff' : '#1f2937' }}
        >
          {title}
        </motion.h1>

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

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
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
              Scroll
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
      </motion.div>
    </section>
  );
}
