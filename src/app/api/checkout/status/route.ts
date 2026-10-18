import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { findPaymentForTribute, getPayment, mpConfigured } from '@/lib/mercadopago';
import { handlePayment, normalisePackage, sendDeliveryEmailOnce } from '@/lib/fulfillment';

// Polled by the "obrigado" page (/finalize). When the buyer comes back from Mercado Pago with
// a payment_id, the payment is checked right here, so the page works even before (or without)
// the webhook arriving, e.g. on localhost.

export type CheckoutStatus = 'paid' | 'pending' | 'rejected' | 'unpaid';

const PENDING = new Set(['pending', 'in_process', 'authorized', 'in_mediation']);

// The buyer already knows their e-mail; show only enough to recognise it ("g***@gmail.com").
function maskEmail(email: string | null): string | null {
  if (!email) return null;
  const [user, domain] = email.split('@');
  if (!domain) return null;
  return `${user.slice(0, 1)}***@${domain}`;
}

export async function GET(request: NextRequest) {
  const draftId = request.nextUrl.searchParams.get('draft_id') || '';
  const paymentId = request.nextUrl.searchParams.get('payment_id') || '';

  let tribute = await db.tribute.findUnique({ where: { id: draftId } });
  if (!tribute) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  // Not paid yet as far as we know: ask Mercado Pago (by the payment id the buyer came back
  // with or, failing that, by searching payments made for this tribute).
  if (!tribute.isPublished && tribute.buyerEmail && mpConfigured()) {
    try {
      const payment = paymentId && /^\d+$/.test(paymentId)
        ? await getPayment(paymentId)
        : await findPaymentForTribute(tribute.id);
      if (payment && payment.external_reference === tribute.id) {
        await handlePayment(payment);
        tribute = await db.tribute.findUnique({ where: { id: draftId } });
        if (!tribute) return NextResponse.json({ error: 'Not found' }, { status: 404 });
      }
    } catch (e) {
      console.error('[checkout/status]', e);
    }
  }

  // A previous e-mail attempt may have failed (e.g. Resend not configured yet); try again.
  if (tribute.isPublished && tribute.paidAt && !tribute.deliveryEmailSentAt) {
    sendDeliveryEmailOnce(tribute.id).catch((e) => console.error('[checkout/status] email', e));
  }

  let status: CheckoutStatus = 'unpaid';
  if (tribute.isPublished && tribute.paidAt) status = 'paid';
  else if (tribute.paymentStatus && PENDING.has(tribute.paymentStatus)) status = 'pending';
  else if (tribute.paymentStatus === 'rejected' || tribute.paymentStatus === 'cancelled') status = 'rejected';

  return NextResponse.json({
    status,
    slug: status === 'paid' ? tribute.slug : null,
    recipient: tribute.recipient,
    packageType: normalisePackage(tribute.paidPackage || tribute.packageType),
    expiresAt: tribute.expiresAt,
    email: maskEmail(tribute.buyerEmail),
    emailSent: !!tribute.deliveryEmailSentAt,
  });
}
