// Sends e-mail through Resend's REST API (https://resend.com/docs/api-reference/emails/send-email).
// Needs RESEND_API_KEY in .env; the sender defaults to pedidos@eternalpage.com.br.
// Without a key (local development), the e-mail is printed to the server log instead.

import { SUPPORT_EMAIL } from '@/lib/site';

export interface EmailAttachment {
  filename: string;
  content: string; // base64
}

export interface SendEmailInput {
  to: string;
  subject: string;
  html: string;
  text: string;
  attachments?: EmailAttachment[];
}

export type SendEmailResult = { sent: true; id?: string } | { sent: false; reason: string };

export async function sendEmail(input: SendEmailInput): Promise<SendEmailResult> {
  const key = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM || 'EternalPage <pedidos@eternalpage.com.br>';

  if (!key) {
    console.log(`[email] RESEND_API_KEY not set; would send to ${input.to}: ${input.subject}\n${input.text}`);
    return { sent: false, reason: 'RESEND_API_KEY not set' };
  }

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      from,
      to: [input.to],
      reply_to: SUPPORT_EMAIL,
      subject: input.subject,
      html: input.html,
      text: input.text,
      ...(input.attachments?.length ? { attachments: input.attachments } : {}),
    }),
  });

  if (!res.ok) {
    const body = await res.text().catch(() => '');
    console.error(`[email] Resend error ${res.status}: ${body.slice(0, 300)}`);
    return { sent: false, reason: `Resend ${res.status}` };
  }
  const data = (await res.json().catch(() => ({}))) as { id?: string };
  return { sent: true, id: data.id };
}

export function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export interface DeliveryEmailData {
  siteUrl: string;
  tributeUrl: string;
  qrImageUrl: string;
  recipient: string;
  packageName: string;
  expiresAt: Date | null;
}

const ROSE = '#f43f5e';

function formatDate(d: Date): string {
  return d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric', timeZone: 'America/Sao_Paulo' });
}

// The e-mail the buyer gets once Mercado Pago approves the payment: the link, the QR code
// (also attached as an image to print) and how long the page stays online.
export function deliveryEmail(d: DeliveryEmailData): { subject: string; html: string; text: string } {
  const name = escapeHtml(d.recipient);
  const link = escapeHtml(d.tributeUrl);
  const validity = d.expiresAt
    ? `Plano ${escapeHtml(d.packageName)}: a página fica no ar até ${formatDate(d.expiresAt)}.`
    : `Plano ${escapeHtml(d.packageName)}: a página fica no ar para sempre.`;

  const subject = `Sua homenagem para ${d.recipient} está pronta 💌`;

  const html = `<!doctype html>
<html lang="pt-BR">
<body style="margin:0;padding:0;background:#fff5f6;font-family:Arial,Helvetica,sans-serif;color:#374151">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#fff5f6;padding:32px 12px">
    <tr><td align="center">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;background:#ffffff;border-radius:16px;overflow:hidden">
        <tr><td align="center" style="padding:28px 24px 8px">
          <img src="${escapeHtml(d.siteUrl)}/brand/eternalpage-logo-fundo-branco.png" width="220" alt="EternalPage" style="display:block;width:220px;max-width:100%;height:auto;border:0">
        </td></tr>
        <tr><td align="center" style="padding:8px 28px 0">
          <p style="margin:0;font-size:12px;letter-spacing:3px;text-transform:uppercase;color:#9ca3af">Pagamento confirmado</p>
          <h1 style="margin:10px 0 0;font-size:24px;line-height:1.3;color:#111827;font-weight:normal">Sua homenagem para <span style="color:${ROSE}">${name}</span> está pronta</h1>
        </td></tr>
        <tr><td align="center" style="padding:24px 28px 8px">
          <a href="${link}" style="display:inline-block;background:${ROSE};color:#ffffff;text-decoration:none;font-weight:bold;font-size:16px;padding:14px 28px;border-radius:999px">Abrir a homenagem</a>
          <p style="margin:14px 0 0;font-size:13px;color:#6b7280;word-break:break-all">${link}</p>
        </td></tr>
        <tr><td align="center" style="padding:20px 28px 4px">
          <img src="${escapeHtml(d.qrImageUrl)}" width="180" height="180" alt="QR code da homenagem" style="display:block;width:180px;height:180px;border:0">
          <p style="margin:10px 0 0;font-size:13px;color:#6b7280">Aponte a câmera do celular para abrir.<br>O QR code também vai em anexo para você imprimir.</p>
        </td></tr>
        <tr><td style="padding:20px 28px 4px">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#fff1f3;border-radius:12px">
            <tr><td style="padding:14px 16px;font-size:14px;line-height:1.6;color:#374151">
              <strong>Como presentear</strong><br>
              Envie o link pelo WhatsApp, ou imprima o QR code e entregue junto com um presente.<br>
              ${validity}
            </td></tr>
          </table>
        </td></tr>
        <tr><td align="center" style="padding:22px 28px 28px;font-size:12px;color:#9ca3af;line-height:1.6">
          Guarde este e-mail: é com este link que você acessa a homenagem.<br>
          Dúvidas? Responda este e-mail ou escreva para <a href="mailto:${SUPPORT_EMAIL}" style="color:${ROSE}">${SUPPORT_EMAIL}</a>.
        </td></tr>
      </table>
      <p style="margin:16px 0 0;font-size:11px;color:#9ca3af">EternalPage · eternalpage.com.br</p>
    </td></tr>
  </table>
</body>
</html>`;

  const text = [
    `Pagamento confirmado!`,
    ``,
    `Sua homenagem para ${d.recipient} está pronta:`,
    d.tributeUrl,
    ``,
    d.expiresAt
      ? `Plano ${d.packageName}: a página fica no ar até ${formatDate(d.expiresAt)}.`
      : `Plano ${d.packageName}: a página fica no ar para sempre.`,
    ``,
    `O QR code vai em anexo para você imprimir.`,
    `Dúvidas? Escreva para ${SUPPORT_EMAIL}.`,
  ].join('\n');

  return { subject, html, text };
}

// Only what finance needs to book the sale: no buyer or tribute data.
export interface SaleNotificationData {
  packageName: string;
  amount: number;
  coupon: boolean;
  paymentId: string | null;
  paidAt: Date;
}

function formatMoney(n: number): string {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(n);
}

function formatDateTime(d: Date): string {
  return d.toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short', timeZone: 'America/Sao_Paulo' });
}

// Internal notice to the finance inbox for each completed sale (see notifySaleOnce in
// lib/fulfillment.ts).
export function saleNotificationEmail(d: SaleNotificationData): { subject: string; html: string; text: string } {
  const amount = formatMoney(d.amount);
  const subject = d.coupon
    ? `Homenagem liberada com cupom: ${d.packageName} (${amount})`
    : `Nova venda: ${d.packageName}, ${amount}`;

  const rows: [string, string][] = [
    ['Plano', d.packageName],
    ['Valor pago', amount],
    ['Cupom', d.coupon ? 'Sim, cupom de teste (sem cobrança)' : 'Não'],
    ['Data e hora', `${formatDateTime(d.paidAt)} (horário de Brasília)`],
    ['Pagamento Mercado Pago', d.paymentId || '(sem id)'],
  ];

  const htmlRows = rows
    .map(([k, v]) => `<tr><td style="padding:8px 12px;border-bottom:1px solid #f3f4f6;color:#6b7280;white-space:nowrap;vertical-align:top">${escapeHtml(k)}</td><td style="padding:8px 12px;border-bottom:1px solid #f3f4f6;color:#111827;word-break:break-all">${escapeHtml(v)}</td></tr>`)
    .join('\n');

  const html = `<!doctype html>
<html lang="pt-BR">
<body style="margin:0;padding:24px 12px;background:#f9fafb;font-family:Arial,Helvetica,sans-serif;color:#374151">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;margin:0 auto;background:#ffffff;border-radius:12px;overflow:hidden">
    <tr><td style="padding:20px 24px 8px">
      <p style="margin:0;font-size:12px;letter-spacing:2px;text-transform:uppercase;color:#9ca3af">${d.coupon ? 'Liberada com cupom' : 'Venda concluída'}</p>
      <h1 style="margin:6px 0 0;font-size:22px;color:#111827;font-weight:normal">${escapeHtml(d.packageName)} · <strong>${escapeHtml(amount)}</strong></h1>
    </td></tr>
    <tr><td style="padding:12px 12px 20px">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="font-size:14px;line-height:1.5">
${htmlRows}
      </table>
    </td></tr>
  </table>
  <p style="margin:12px 0 0;text-align:center;font-size:11px;color:#9ca3af">Aviso automático do site EternalPage</p>
</body>
</html>`;

  const text = [
    d.coupon ? 'Homenagem liberada com cupom' : 'Venda concluída',
    '',
    ...rows.map(([k, v]) => `${k}: ${v}`),
  ].join('\n');

  return { subject, html, text };
}
