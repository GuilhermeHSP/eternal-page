'use client';

import { motion } from 'framer-motion';
import { BackgroundAnimationConfig } from '@/types/tribute';

interface BackgroundAnimationsProps {
  config: BackgroundAnimationConfig;
}

// Seeded random number generator for consistent SSR/client values
function seededRandom(seed: number): number {
  const x = Math.sin(seed * 9999) * 10000;
  return x - Math.floor(x);
}

export function BackgroundAnimations({ config }: BackgroundAnimationsProps) {
  const { type, intensity = 'medium', color = '#fda4af' } = config;

  const particleCount = (() => {
    switch (intensity) {
      case 'low': return 15;
      case 'medium': return 30;
      case 'high': return 50;
      default: return 30;
    }
  })();

  if (type === 'none') return null;

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0" aria-hidden="true" suppressHydrationWarning>
      {type === 'hearts' && (
        <FloatingHearts count={particleCount} color={color} />
      )}
      {type === 'particles' && (
        <FloatingParticles count={particleCount} color={color} />
      )}
      {type === 'petals' && (
        <FallingPetals count={particleCount} color={color} />
      )}
      {type === 'sparkles' && (
        <Sparkles count={particleCount} color={color} />
      )}
      {type === 'stars' && (
        <TwinklingStars count={particleCount} color={color} />
      )}
    </div>
  );
}

function FloatingHearts({ count, color }: { count: number; color: string }) {
  const hearts = Array.from({ length: count }, (_, i) => ({
    id: i,
    x: seededRandom(i * 1.1) * 100,
    delay: seededRandom(i * 2.2) * 5,
    duration: 10 + seededRandom(i * 3.3) * 10,
    size: 12 + seededRandom(i * 4.4) * 16,
  }));

  return (
    <>
      {hearts.map((heart) => (
        <motion.div
          key={heart.id}
          className="absolute"
          style={{
            left: `${heart.x}%`,
            bottom: -50,
            fontSize: heart.size,
            color,
          }}
          initial={{ y: 0, opacity: 0, scale: 0.5 }}
          animate={{
            y: [0, -1000],
            opacity: [0, 0.7, 0.7, 0],
            scale: [0.5, 1, 1, 0.5],
            rotate: [0, 15, -15, 0],
          }}
          transition={{
            duration: heart.duration,
            repeat: Infinity,
            delay: heart.delay,
            ease: 'linear',
          }}
        >
          ❤️
        </motion.div>
      ))}
    </>
  );
}

function FloatingParticles({ count, color }: { count: number; color: string }) {
  const particles = Array.from({ length: count }, (_, i) => ({
    id: i,
    x: seededRandom(i * 5.5) * 100,
    y: seededRandom(i * 6.6) * 100,
    size: 2 + seededRandom(i * 7.7) * 4,
    delay: seededRandom(i * 8.8) * 3,
  }));

  return (
    <>
      {particles.map((particle) => (
        <motion.div
          key={particle.id}
          className="absolute rounded-full"
          style={{
            left: `${particle.x}%`,
            top: `${particle.y}%`,
            width: particle.size,
            height: particle.size,
            backgroundColor: color,
          }}
          animate={{
            y: [0, -30, 0],
            opacity: [0.3, 0.8, 0.3],
          }}
          transition={{
            duration: 3 + seededRandom(particle.id * 9.9) * 2,
            repeat: Infinity,
            delay: particle.delay,
            ease: 'easeInOut',
          }}
        />
      ))}
    </>
  );
}

function FallingPetals({ count, color }: { count: number; color: string }) {
  const petals = Array.from({ length: count }, (_, i) => ({
    id: i,
    x: seededRandom(i * 10.1) * 100,
    delay: seededRandom(i * 11.11) * 8,
    duration: 12 + seededRandom(i * 12.12) * 8,
    size: 10 + seededRandom(i * 13.13) * 10,
  }));

  return (
    <>
      {petals.map((petal) => (
        <motion.div
          key={petal.id}
          className="absolute"
          style={{
            left: `${petal.x}%`,
            top: -30,
            width: petal.size,
            height: petal.size * 0.6,
            backgroundColor: color,
            borderRadius: '50% 0 50% 0',
            transform: 'rotate(45deg)',
          }}
          initial={{ y: 0, x: 0, rotate: 45, opacity: 0 }}
          animate={{
            y: [0, 1000],
            x: [0, 100, -50, 50, 0],
            rotate: [45, 180, 315, 450],
            opacity: [0, 0.8, 0.8, 0],
          }}
          transition={{
            duration: petal.duration,
            repeat: Infinity,
            delay: petal.delay,
            ease: 'linear',
          }}
        />
      ))}
    </>
  );
}

function Sparkles({ count, color }: { count: number; color: string }) {
  const sparkles = Array.from({ length: count }, (_, i) => ({
    id: i,
    x: seededRandom(i * 14.14) * 100,
    y: seededRandom(i * 15.15) * 100,
    size: 4 + seededRandom(i * 16.16) * 6,
    delay: seededRandom(i * 17.17) * 2,
  }));

  return (
    <>
      {sparkles.map((sparkle) => (
        <motion.div
          key={sparkle.id}
          className="absolute"
          style={{
            left: `${sparkle.x}%`,
            top: `${sparkle.y}%`,
            width: sparkle.size,
            height: sparkle.size,
            backgroundColor: color,
            clipPath: 'polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)',
          }}
          animate={{
            scale: [0, 1, 0],
            opacity: [0, 1, 0],
            rotate: [0, 180, 360],
          }}
          transition={{
            duration: 2 + seededRandom(sparkle.id * 18.18),
            repeat: Infinity,
            delay: sparkle.delay,
            ease: 'easeInOut',
          }}
        />
      ))}
    </>
  );
}

function TwinklingStars({ count, color }: { count: number; color: string }) {
  const stars = Array.from({ length: count }, (_, i) => ({
    id: i,
    x: seededRandom(i * 19.19) * 100,
    y: seededRandom(i * 20.2) * 100,
    size: 2 + seededRandom(i * 21.21) * 3,
    delay: seededRandom(i * 22.22) * 3,
  }));

  return (
    <>
      {stars.map((star) => (
        <motion.div
          key={star.id}
          className="absolute rounded-full"
          style={{
            left: `${star.x}%`,
            top: `${star.y}%`,
            width: star.size,
            height: star.size,
            backgroundColor: color,
            boxShadow: `0 0 ${star.size * 2}px ${color}`,
          }}
          animate={{
            opacity: [0.2, 1, 0.2],
            scale: [0.8, 1.2, 0.8],
          }}
          transition={{
            duration: 2 + seededRandom(star.id * 23.23) * 2,
            repeat: Infinity,
            delay: star.delay,
            ease: 'easeInOut',
          }}
        />
      ))}
    </>
  );
}

// Check for reduced motion preference - returns false for SSR, actual value on client
export function useReducedMotion(): boolean {
  // Default to false for SSR, actual check happens in useEffect
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}
