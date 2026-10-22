import QRCode from 'qrcode';
import { db } from '@/lib/db';
import { getPackage, type PackageType } from '@/lib/packages';
import { expiryForPackage } from '@/lib/tribute-access';
import { deliveryEmail, saleNotificationEmail, sendEmail } from '@/lib/email';
import { siteUrl } from '@/lib/site';
import type { MpPayment } from '@/lib/mercadopago';

// What happens after Mercado Pago reports on a payment. Called by the webhook and by the
// "obrigado" page when the buyer comes back, so it must be safe to run more than once.

export type FulfillResult =
  | { outcome: 'published'; tributeId: string }
  | { outcome: 'already-published'; tributeId: string }
  | { outcome: 'not-approved'; tributeId: string; status: string }
  | { outcome: 'ignored'; reason: string };

// Package of a draft, normalised: the old "plus" counts as Completo.
export function normalisePackage(p: string | null | undefined): 'basic' | 'premium' {
  return p === 'basic' ? 'basic' : 'premium';
}

export function priceFor(p: string | null | undefined): number {
  return getPackage(normalisePackage(p) as PackageType).price;
}

// Highest package the amount pays for, or null if it pays for none.
export function packageForAmount(amount: number): 'basic' | 'premium' | null {
  if (amount + 0.01 >= priceFor('premium')) return 'premium';
  if (amount + 0.01 >= priceFor('basic')) return 'basic';
  return null;
}

export async function handlePayment(payment: MpPayment): Promise<FulfillResult> {
  const tributeId = payment.external_reference;
  if (!tributeId) return { outcome: 'ignored', reason: 'payment without external_reference' };

  const tribute = await db.tribute.findUnique({ where: { id: tributeId } });
  if (!tribute) return { outcome: 'ignored', reason: `no tribute ${tributeId}` };

  const paymentId = String(payment.id);

  if (payment.status !== 'approved') {
    // Keep the latest status for the "obrigado" page, unless the tribute is already paid.
    if (!tribute.isPublished) {
      await db.tribute.update({
        where: { id: tribute.id },
        data: { paymentId, paymentStatus: payment.status },
      });
    }
    return { outcome: 'not-approved', tributeId: tribute.id, status: payment.status };
  }

  // The package comes from the amount actually paid (the buyer may have switched plans in the
  // editor after opening the payment page). Less than the Básico price publishes nothing.
  const paid = Number(payment.transaction_amount ?? 0);
  if (payment.currency_id && payment.currency_id !== 'BRL') {
    return { outcome: 'ignored', reason: `currency ${payment.currency_id}` };
  }
  const pkg = packageForAmount(paid);
  if (!pkg) {
    console.error(`[payment] ${paymentId} paid ${paid}, below any package price, for tribute ${tribute.id}`);
    return { outcome: 'ignored', reason: 'amount below package price' };
  }

  if (tribute.isPublished && tribute.paidAt) {
    await sendDeliveryEmailOnce(tribute.id);
    await notifySaleOnce(tribute.id);
    return { outcome: 'already-published', tributeId: tribute.id };
  }

  const paidAt = payment.date_approved ? new Date(payment.date_approved) : new Date();
  await db.tribute.update({
    where: { id: tribute.id },
    data: {
      isPublished: true,
      isPremium: pkg === 'premium',
      packageType: pkg,
      paidPackage: pkg,
      paymentId,
      paymentStatus: 'approved',
      paidAmount: paid,
      paidAt,
      expiresAt: expiryForPackage(pkg, paidAt),
      buyerEmail: tribute.buyerEmail || payment.payer?.email || null,
    },
  });

  await sendDeliveryEmailOnce(tribute.id);
  await notifySaleOnce(tribute.id);
  return { outcome: 'published', tributeId: tribute.id };
}

// Publishes a draft with the test coupon (see lib/coupon.ts): no payment, amount zero.
export async function publishWithCoupon(tributeId: string): Promise<FulfillResult> {
  const tribute = await db.tribute.findUnique({ where: { id: tributeId } });
  if (!tribute) return { outcome: 'ignored', reason: `no tribute ${tributeId}` };
  if (tribute.isPublished && tribute.paidAt) {
    await sendDeliveryEmailOnce(tribute.id);
    await notifySaleOnce(tribute.id);
    return { outcome: 'already-published', tributeId: tribute.id };
  }

  const pkg = normalisePackage(tribute.packageType);
  const paidAt = new Date();
  await db.tribute.update({
    where: { id: tribute.id },
    data: {
      isPublished: true,
      isPremium: pkg === 'premium',
      packageType: pkg,
      paidPackage: pkg,
      paymentId: `CUPOM-${paidAt.getTime()}`,
      paymentStatus: 'approved',
      paidAmount: 0,
      paidAt,
      expiresAt: expiryForPackage(pkg, paidAt),
    },
  });

  await sendDeliveryEmailOnce(tribute.id);
  await notifySaleOnce(tribute.id);
  return { outcome: 'published', tributeId: tribute.id };
}

// Sends the link + QR e-mail at most once per tribute (the webhook and the return page can
// both arrive at the same time, so the "sent" mark is claimed before sending).
export async function sendDeliveryEmailOnce(tributeId: string): Promise<boolean> {
  const tribute = await db.tribute.findUnique({ where: { id: tributeId } });
  if (!tribute || !tribute.isPublished || !tribute.buyerEmail || tribute.deliveryEmailSentAt) return false;

  const claim = await db.tribute.updateMany({
    where: { id: tributeId, deliveryEmailSentAt: null },
    data: { deliveryEmailSentAt: new Date() },
  });
  if (claim.count !== 1) return false;

  const base = siteUrl();
  const tributeUrl = `${base}/${tribute.slug}`;
  const pkg = getPackage(normalisePackage(tribute.paidPackage || tribute.packageType) as PackageType);
  const mail = deliveryEmail({
    siteUrl: base,
    tributeUrl,
    qrImageUrl: `${base}/api/qr/${encodeURIComponent(tribute.slug)}`,
    recipient: tribute.recipient,
    packageName: pkg.name,
    expiresAt: tribute.expiresAt,
  });

  let attachments: { filename: string; content: string }[] = [];
  try {
    const png = await QRCode.toBuffer(tributeUrl, { width: 800, margin: 2, errorCorrectionLevel: 'M' });
    attachments = [{ filename: 'qrcode-homenagem.png', content: png.toString('base64') }];
  } catch (e) {
    console.error('[email] QR attachment failed', e);
  }

  const result = await sendEmail({ to: tribute.buyerEmail, ...mail, attachments });
  if (!result.sent) {
    // Release the claim so a later webhook retry or page visit can try again.
    await db.tribute.update({ where: { id: tributeId }, data: { deliveryEmailSentAt: null } });
    return false;
  }
  return true;
}

export const DEFAULT_FINANCE_EMAIL = 'financeiro@eternalpage.com.br';

// Sales older than this are not announced: keeps tributes paid before this notice existed
// from being reported when their webhook is retried or their "obrigado" page is reopened.
const NOTIFY_WINDOW_MS = 3 * 24 * 60 * 60 * 1000;

// E-mails the finance inbox (FINANCE_EMAIL, default financeiro@eternalpage.com.br) once per
// paid tribute. Same claim-then-send pattern as the delivery e-mail; a failure never blocks
// the sale, it only releases the claim so the next webhook retry or page visit tries again.
export async function notifySaleOnce(tributeId: string): Promise<boolean> {
  try {
    const to = (process.env.FINANCE_EMAIL || DEFAULT_FINANCE_EMAIL).trim();
    const tribute = await db.tribute.findUnique({ where: { id: tributeId } });
    if (!to || !tribute || !tribute.isPublished || !tribute.paidAt || tribute.saleNotifiedAt) return false;
    if (Date.now() - tribute.paidAt.getTime() > NOTIFY_WINDOW_MS) return false;

    const claim = await db.tribute.updateMany({
      where: { id: tributeId, saleNotifiedAt: null },
      data: { saleNotifiedAt: new Date() },
    });
    if (claim.count !== 1) return false;

    const pkg = getPackage(normalisePackage(tribute.paidPackage || tribute.packageType) as PackageType);
    const mail = saleNotificationEmail({
      packageName: pkg.name,
      amount: tribute.paidAmount ?? 0,
      coupon: !!tribute.paymentId?.startsWith('CUPOM-'),
      paymentId: tribute.paymentId,
      paidAt: tribute.paidAt,
    });

    const result = await sendEmail({ to, ...mail });
    if (!result.sent) {
      await db.tribute.update({ where: { id: tributeId }, data: { saleNotifiedAt: null } });
      return false;
    }
    return true;
  } catch (e) {
    console.error('[sale-notice]', e);
    return false;
  }
}
