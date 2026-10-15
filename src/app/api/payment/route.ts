import { NextResponse } from 'next/server';

// Retired mock payment. The real checkout is /api/checkout (Mercado Pago) and its
// notifications arrive at /api/mercadopago/webhook. This file can be deleted.
export async function POST() {
  return NextResponse.json({ error: 'Gone' }, { status: 410 });
}

export async function PUT() {
  return NextResponse.json({ error: 'Gone' }, { status: 410 });
}
