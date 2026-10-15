// Who can see a tribute at its public address.
// Only tributes that were paid for are published; Básico pages stop showing after their year.

export interface TributeAccessFields {
  isPublished: boolean;
  expiresAt: Date | null;
}

export type TributeVisibility = 'live' | 'unpublished' | 'expired';

export function tributeVisibility(t: TributeAccessFields, now: Date = new Date()): TributeVisibility {
  if (!t.isPublished) return 'unpublished';
  if (t.expiresAt && t.expiresAt.getTime() <= now.getTime()) return 'expired';
  return 'live';
}

export function isTributeLive(t: TributeAccessFields, now: Date = new Date()): boolean {
  return tributeVisibility(t, now) === 'live';
}

// Básico stays online for one year from the payment; Completo has no end date.
export function expiryForPackage(packageType: string | null | undefined, paidAt: Date): Date | null {
  if (packageType === 'basic') {
    const d = new Date(paidAt);
    d.setFullYear(d.getFullYear() + 1);
    return d;
  }
  return null;
}
