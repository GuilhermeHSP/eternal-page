import { NextRequest, NextResponse } from 'next/server';
import { getPayment, mpConfigured, verifyWebhookSignature } from '@/lib/mercadopago';
import { handlePayment } from '@/lib/fulfillment';

// Mercado Pago calls this address when a payment changes (set as notification_url on each
// checkout, and optionally under Suas integrações > Webhooks). The notification itself is never
// trusted: the payment is always looked up again in Mercado Pago with our access token, and only
// an approved payment of the right amount for an existing tribute publishes it.

export async function POST(request: NextRequest) {
  if (!mpConfigured()) return NextResponse.json({ ok: true });

  const url = request.nextUrl;
  let body: { type?: string; topic?: string; action?: string; data?: { id?: string | number } } = {};
  try {
    body = await request.json();
  } catch {
    // Older IPN-style notifications carry everything in the query string.
  }

  const type = body.type || body.topic || url.searchParams.get('type') || url.searchParams.get('topic') || '';
  const dataId = String(url.searchParams.get('data.id') || body.data?.id || url.searchParams.get('id') || '');

  if (type !== 'payment' || !dataId) {
    return NextResponse.json({ ok: true });
  }

  const signatureOk = verifyWebhookSignature({
    signature: request.headers.get('x-signature'),
    requestId: request.headers.get('x-request-id'),
    dataId,
    secret: process.env.MP_WEBHOOK_SECRET,
  });
  if (signatureOk === false) {
    // Not fatal: the payment is fetched from Mercado Pago below anyway.
    console.warn(`[webhook] signature mismatch for payment ${dataId}`);
  }

  try {
    const payment = await getPayment(dataId);
    if (payment) {
      const result = await handlePayment(payment);
      console.log(`[webhook] payment ${dataId}: ${result.outcome}`);
    }
  } catch (e) {
    // Answer 500 so Mercado Pago tries again later.
    console.error('[webhook]', e);
    return NextResponse.json({ error: 'retry' }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
