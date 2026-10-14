'use client';

import type { ReactNode } from 'react';
import { Heart } from 'lucide-react';

interface SiteHeaderProps {
  // Links to sections of the home page; shown on wide screens.
  nav?: Array<{ href: string; label: string }>;
  // Right-hand action (a button, a status badge...).
  action?: ReactNode;
}

// The same header on every screen: filled heart, EternalPage in Josefin, white bar.
export function SiteHeader({ nav, action }: SiteHeaderProps) {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-md border-b border-gray-100">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between gap-4">
        <a href="/" className="flex items-center gap-2 shrink-0">
          <Heart className="h-6 w-6 text-rose-500" fill="currentColor" />
          <span className="font-title text-xl font-semibold tracking-wide text-gray-800">EternalPage</span>
        </a>
        {nav && nav.length > 0 && (
          <nav className="hidden md:flex items-center gap-8 text-sm text-gray-600">
            {nav.map((item) => (
              <a key={item.href} href={item.href} className="hover:text-rose-500">
                {item.label}
              </a>
            ))}
          </nav>
        )}
        {action ?? <span />}
      </div>
    </header>
  );
}
