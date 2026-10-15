import { NextResponse } from 'next/server';

// Retired: tributes used to be published here without any payment check.
// Publishing now happens only after Mercado Pago approves the payment (lib/fulfillment.ts).
// This file can be deleted.
export async function POST() {
  return NextResponse.json({ error: 'Gone' }, { status: 410 });
}
