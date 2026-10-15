import { createHmac, timingSafeEqual } from 'crypto';

// Mercado Pago Checkout Pro, called over its REST API (no SDK needed).
// Credentials come from .env: MP_ACCESS_TOKEN (secret) and, optionally, MP_WEBHOOK_SECRET.

const API = 'https://api.mercadopago.com';

export function mpConfigured(): boolean {
  return !!process.env.MP_ACCESS_TOKEN;
}

function authHeaders(): Record<string, string> {
  return {
    Authorization: `Bearer ${process.env.MP_ACCESS_TOKEN}`,
    'Content-Type': 'application/json',
  };
}

export interface PreferenceInput {
  tributeId: string;
  itemId: string;
  title: string;
  description: string;
  price: number;
  payerEmail: string;
  successUrl: string;
  failureUrl: string;
  pendingUrl: string;
  // Mercado Pago only calls public https addresses, so this is left out on localhost.
  notificationUrl?: string;
}

export interface Preference {
  id: string;
  init_point: string;
  sandbox_init_point?: string;
}

export async function createPreference(input: PreferenceInput): Promise<Preference> {
  const isHttps = input.successUrl.startsWith('https://');
  const body = {
    items: [
      {
        id: input.itemId,
        title: input.title,
        description: input.description,
        category_id: 'services',
        quantity: 1,
        currency_id: 'BRL',
        unit_price: Math.round(input.price * 100) / 100,
      },
    ],
    payer: { email: input.payerEmail },
    external_reference: input.tributeId,
    back_urls: {
      success: input.successUrl,
      failure: input.failureUrl,
      pending: input.pendingUrl,
    },
    // Sends the buyer straight back to the site after an approved payment (needs an https site).
    ...(isHttps ? { auto_return: 'approved' } : {}),
    ...(input.notificationUrl ? { notification_url: input.notificationUrl } : {}),
    statement_descriptor: 'ETERNALPAGE',
    metadata: { tribute_id: input.tributeId },
  };

  const res = await fetch(`${API}/checkout/preferences`, {
    method: 'POST',
    headers: { ...authHeaders(), 'X-Idempotency-Key': `pref-${input.tributeId}-${Date.now()}` },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`Mercado Pago preference failed (${res.status}): ${text.slice(0, 500)}`);
  }
  return (await res.json()) as Preference;
}

// The parts of a payment we use. See /v1/payments/{id}.
export interface MpPayment {
  id: number | string;
  status: string; // approved, pending, in_process, rejected, cancelled, refunded, charged_back
  status_detail?: string;
  external_reference?: string | null;
  transaction_amount?: number;
  currency_id?: string;
  payer?: { email?: string | null };
  date_approved?: string | null;
}

export async function getPayment(paymentId: string): Promise<MpPayment | null> {
  if (!/^\d+$/.test(paymentId)) return null;
  const res = await fetch(`${API}/v1/payments/${paymentId}`, { headers: authHeaders(), cache: 'no-store' });
  if (res.status === 404) return null;
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`Mercado Pago payment lookup failed (${res.status}): ${text.slice(0, 300)}`);
  }
  return (await res.json()) as MpPayment;
}

// Most recent payment made for a tribute (external_reference = tribute id), preferring an
// approved one. Used when the buyer closes the Mercado Pago page without coming back.
export async function findPaymentForTribute(tributeId: string): Promise<MpPayment | null> {
  const qs = new URLSearchParams({
    external_reference: tributeId,
    sort: 'date_created',
    criteria: 'desc',
    limit: '10',
  });
  const res = await fetch(`${API}/v1/payments/search?${qs}`, { headers: authHeaders(), cache: 'no-store' });
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`Mercado Pago payment search failed (${res.status}): ${text.slice(0, 300)}`);
  }
  const data = (await res.json()) as { results?: MpPayment[] };
  const results = (data.results || []).filter((p) => p.external_reference === tributeId);
  return results.find((p) => p.status === 'approved') || results[0] || null;
}

// Checks the x-signature header Mercado Pago sends with webhook notifications:
// "ts=<timestamp>,v1=<hmac>", where hmac = HMAC-SHA256(secret, "id:<data.id>;request-id:<x-request-id>;ts:<ts>;").
// Returns null when no secret is configured (nothing to check).
export function verifyWebhookSignature(params: {
  signature: string | null;
  requestId: string | null;
  dataId: string;
  secret: string | undefined;
}): boolean | null {
  const { signature, requestId, dataId, secret } = params;
  if (!secret) return null;
  if (!signature) return false;

  let ts = '';
  let v1 = '';
  for (const part of signature.split(',')) {
    const [k, v] = part.split('=').map((s) => s.trim());
    if (k === 'ts') ts = v;
    if (k === 'v1') v1 = v;
  }
  if (!ts || !v1) return false;

  const id = /^[a-z0-9]+$/i.test(dataId) ? dataId.toLowerCase() : dataId;
  let manifest = `id:${id};`;
  if (requestId) manifest += `request-id:${requestId};`;
  manifest += `ts:${ts};`;

  const expected = createHmac('sha256', secret).update(manifest).digest('hex');
  try {
    return timingSafeEqual(Buffer.from(expected, 'hex'), Buffer.from(v1, 'hex'));
  } catch {
    return false;
  }
}
