'use client';

import { useRef } from 'react';
import { motion, useInView, useScroll, useTransform } from 'framer-motion';
import { Calendar, Clock } from 'lucide-react';
import { TimelineItemConfig } from '@/types/tribute';

interface TimelineProps {
  items: TimelineItemConfig[];
  accentColor: string;
}

export function Timeline({ items, accentColor }: TimelineProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(containerRef, { once: true, margin: '-100px' });
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start end', 'end start'],
  });

  const lineHeight = useTransform(scrollYProgress, [0, 1], ['0%', '100%']);

  if (!items || items.length === 0) return null;

  // Sort by order
  const sortedItems = [...items].sort((a, b) => a.order - b.order);

  return (
    <section ref={containerRef} className="py-16 px-4 relative overflow-hidden">

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={isInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.6 }}
        className="max-w-3xl mx-auto relative"
      >
        {/* Section header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 text-gray-500 mb-3">
            <Clock className="h-5 w-5" style={{ color: accentColor }} />
            <span className="font-title text-sm tracking-[0.18em] uppercase">
              Nossa história
            </span>
          </div>
          <h2 className="font-script text-5xl md:text-6xl leading-tight text-gray-800">
            Ao longo dos anos
          </h2>
        </div>

        {/* Timeline line */}
        <div className="absolute left-8 md:left-1/2 top-32 bottom-8 w-0.5 bg-gray-100">
          <motion.div
            className="absolute top-0 left-0 right-0 origin-top"
            style={{ 
              height: lineHeight,
              backgroundColor: accentColor,
            }}
          />
        </div>

        {/* Timeline items */}
        <div className="space-y-12">
          {sortedItems.map((item, index) => (
            <TimelineItem
              key={item.id}
              item={item}
              index={index}
              accentColor={accentColor}
              isLeft={index % 2 === 0}
              isInView={isInView}
            />
          ))}
        </div>
      </motion.div>
    </section>
  );
}

interface TimelineItemProps {
  item: TimelineItemConfig;
  index: number;
  accentColor: string;
  isLeft: boolean;
  isInView: boolean;
}

function TimelineItem({ item, index, accentColor, isLeft, isInView }: TimelineItemProps) {
  const itemRef = useRef<HTMLDivElement>(null);
  const itemInView = useInView(itemRef, { once: true, margin: '-50px' });

  return (
    <motion.div
      ref={itemRef}
      initial={{ opacity: 0, x: isLeft ? -30 : 30 }}
      animate={itemInView ? { opacity: 1, x: 0 } : {}}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className={`relative flex items-center ${
        isLeft ? 'md:flex-row' : 'md:flex-row-reverse'
      } flex-row`}
    >
      {/* Timeline dot */}
      <motion.div
        initial={{ scale: 0 }}
        animate={itemInView ? { scale: 1 } : {}}
        transition={{ duration: 0.3, delay: index * 0.1 + 0.2 }}
        className="absolute left-8 md:left-1/2 -translate-x-1/2 w-4 h-4 rounded-full border-4 border-white shadow-md z-10"
        style={{ backgroundColor: accentColor }}
      />

      {/* Content */}
      <div className={`w-full md:w-5/12 pl-20 md:pl-0 ${isLeft ? 'md:pr-12' : 'md:pl-12'}`}>
        <motion.div
          whileHover={{ y: -4, transition: { duration: 0.2 } }}
          className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-50 group"
        >
          {/* Image */}
          {item.imageUrl && (
            <div className="relative aspect-video overflow-hidden">
              <img
                src={item.imageUrl}
                alt={item.title}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div 
                className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent"
              />
            </div>
          )}

          {/* Text content */}
          <div className="p-5">
            {/* Year badge */}
            {item.year && (
              <div 
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold mb-3"
                style={{ 
                  backgroundColor: `${accentColor}15`,
                  color: accentColor,
                }}
              >
                <Calendar className="h-3 w-3" />
                {item.year}
              </div>
            )}

            {/* Title */}
            <h3 className="font-title text-lg font-semibold text-gray-800 mb-2">
              {item.title}
            </h3>

            {/* Description */}
            {item.description && (
              <p className="text-gray-600 text-sm leading-relaxed">
                {item.description}
              </p>
            )}
          </div>

          {/* Accent line */}
          <motion.div
            className="h-1"
            style={{ backgroundColor: accentColor }}
            initial={{ scaleX: 0 }}
            animate={itemInView ? { scaleX: 1 } : {}}
            transition={{ duration: 0.5, delay: index * 0.1 + 0.3 }}
          />
        </motion.div>
      </div>
    </motion.div>
  );
}
