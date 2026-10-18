import type { NextRequest } from 'next/server';
import { timingSafeEqual } from 'crypto';

// Admin requests carry ADMIN_PASSWORD in the x-admin-key header.
export function isAdmin(request: NextRequest): boolean {
  const expected = process.env.ADMIN_PASSWORD;
  const given = request.headers.get('x-admin-key') || '';
  if (!expected || !given) return false;
  const a = Buffer.from(expected);
  const b = Buffer.from(given);
  return a.length === b.length && timingSafeEqual(a, b);
}
