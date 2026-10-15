import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { mpConfigured } from '@/lib/mercadopago';
import { handlePayment, priceFor } from '@/lib/fulfillment';

// Pretend payment for local development, used only when Mercado Pago credentials are missing.
// It never runs in production or when MP_ACCESS_TOKEN is set.
export async function GET(request: NextRequest) {
  if (process.env.NODE_ENV === 'production' || mpConfigured()) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  const draftId = request.nextUrl.searchParams.get('draft_id') || '';
  const tribute = await db.tribute.findUnique({ where: { id: draftId } });
  if (!tribute) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  await handlePayment({
    id: `MOCK-${Date.now()}`,
    status: 'approved',
    external_reference: tribute.id,
    transaction_amount: priceFor(tribute.packageType),
    currency_id: 'BRL',
    date_approved: new Date().toISOString(),
  });

  return NextResponse.redirect(new URL(`/finalize?draft_id=${encodeURIComponent(tribute.id)}`, request.url));
}
