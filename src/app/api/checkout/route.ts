import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getPackage, type PackageType } from '@/lib/packages';
import { createPreference, mpConfigured } from '@/lib/mercadopago';
import { normalisePackage } from '@/lib/fulfillment';
import { isHttpsSite, siteUrl } from '@/lib/site';

// Starts the payment of a draft: saves the buyer's e-mail (and WhatsApp, for later) and
// returns the Mercado Pago page to send the buyer to. The price always comes from the server.

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export async function POST(request: NextRequest) {
  let body: { draftId?: unknown; email?: unknown; phone?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Pedido inválido.' }, { status: 400 });
  }

  const draftId = typeof body.draftId === 'string' ? body.draftId : '';
  const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : '';
  const phone = typeof body.phone === 'string' ? body.phone.replace(/[^\d+]/g, '').slice(0, 20) : '';

  if (!draftId) return NextResponse.json({ error: 'Homenagem não encontrada.' }, { status: 400 });
  if (!EMAIL_RE.test(email) || email.length > 120) {
    return NextResponse.json({ error: 'Confira o seu e-mail.' }, { status: 400 });
  }

  const tribute = await db.tribute.findUnique({ where: { id: draftId } });
  if (!tribute) return NextResponse.json({ error: 'Homenagem não encontrada.' }, { status: 404 });

  const thanksUrl = `${siteUrl()}/finalize?draft_id=${encodeURIComponent(tribute.id)}`;

  // Already paid: nothing to charge, go straight to the link.
  if (tribute.isPublished && tribute.paidAt) {
    return NextResponse.json({ url: thanksUrl, alreadyPaid: true });
  }

  const pkg = getPackage(normalisePackage(tribute.packageType) as PackageType);

  await db.tribute.update({
    where: { id: tribute.id },
    data: { buyerEmail: email, buyerPhone: phone || null },
  });

  if (!mpConfigured()) {
    // Local development without Mercado Pago credentials: a pretend payment.
    if (process.env.NODE_ENV !== 'production') {
      return NextResponse.json({ url: `/api/checkout/mock?draft_id=${encodeURIComponent(tribute.id)}`, mock: true });
    }
    console.error('[checkout] MP_ACCESS_TOKEN is not set');
    return NextResponse.json({ error: 'Pagamento indisponível no momento. Tente de novo em instantes.' }, { status: 503 });
  }

  try {
    const pref = await createPreference({
      tributeId: tribute.id,
      itemId: `eternalpage-${pkg.id}`,
      title: `EternalPage ${pkg.name} – homenagem para ${tribute.recipient}`.slice(0, 250),
      description: pkg.description,
      price: pkg.price,
      payerEmail: email,
      successUrl: thanksUrl,
      pendingUrl: thanksUrl,
      failureUrl: thanksUrl,
      notificationUrl: isHttpsSite() ? `${siteUrl()}/api/mercadopago/webhook` : undefined,
    });

    await db.tribute.update({ where: { id: tribute.id }, data: { checkoutPreferenceId: pref.id } });
    return NextResponse.json({ url: pref.init_point });
  } catch (e) {
    console.error('[checkout]', e);
    return NextResponse.json({ error: 'Não foi possível abrir o pagamento. Tente de novo.' }, { status: 502 });
  }
}
