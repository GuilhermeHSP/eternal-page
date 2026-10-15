// Public address of the site, used in payment return links, the payment webhook and e-mails.
// Set NEXT_PUBLIC_BASE_URL in .env (https://eternalpage.com.br in production).
export function siteUrl(): string {
  return (process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000').replace(/\/+$/, '');
}

export function isHttpsSite(): boolean {
  return siteUrl().startsWith('https://');
}

export const SUPPORT_EMAIL = 'contato@eternalpage.com.br';
