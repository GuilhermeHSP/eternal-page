'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

// Reveals [data-reveal] elements once as they enter the viewport. Render it as the last child
// of a page's client tree (not in the root layout): its effect then runs only after that tree
// has hydrated, so the classes it adds never race React's hydration. Content is only hidden
// while the `js` class is on <html>, so nothing stays invisible if scripting fails.
export function RevealObserver() {
  const pathname = usePathname();

  useEffect(() => {
    const seen = new WeakSet<Element>();
    const show = (el: Element) => el.classList.add('is-in');

    if (!('IntersectionObserver' in window)) {
      document.querySelectorAll('[data-reveal]').forEach(show);
      return;
    }

    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          show(entry.target);
          io.unobserve(entry.target);
        }
      },
      { rootMargin: '0px 0px -10% 0px', threshold: 0.05 }
    );

    const scan = () => {
      document.querySelectorAll('[data-reveal]:not(.is-in)').forEach((el) => {
        if (seen.has(el)) return;
        seen.add(el);
        io.observe(el);
      });
    };

    scan();
    // Content rendered later (steps, loaded drafts) gets picked up too.
    const mo = new MutationObserver(scan);
    mo.observe(document.body, { childList: true, subtree: true });

    // Safety net: anything on screen that the observer missed is shown.
    const timer = window.setTimeout(() => {
      document.querySelectorAll('[data-reveal]:not(.is-in)').forEach((el) => {
        const r = el.getBoundingClientRect();
        if (r.top < window.innerHeight && r.bottom > 0) show(el);
      });
    }, 2500);

    return () => {
      io.disconnect();
      mo.disconnect();
      window.clearTimeout(timer);
    };
  }, [pathname]);

  return null;
}
