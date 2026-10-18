import { timingSafeEqual } from 'crypto';

// Test coupon: publishes a tribute for free, without going through Mercado Pago. It only
// exists when TEST_COUPON_CODE is set (at least 8 characters), so it never leaks into sales
// by accident: leave the variable empty on the live site to turn it off.

const MIN_LENGTH = 8;

export function normaliseCoupon(code: unknown): string {
  return typeof code === 'string' ? code.trim().toUpperCase().slice(0, 64) : '';
}

export function isTestCoupon(code: string): boolean {
  const secret = normaliseCoupon(process.env.TEST_COUPON_CODE);
  if (secret.length < MIN_LENGTH || !code) return false;
  const a = Buffer.from(code);
  const b = Buffer.from(secret);
  return a.length === b.length && timingSafeEqual(a, b);
}
