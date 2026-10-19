import { SUPPORT_EMAIL } from '@/lib/site';

// Who runs EternalPage, shown in the footer and in the legal pages (Termos, Privacidade, Cookies).
//
// PREENCHER: fill in the empty fields before going live. While a field is empty, the footer
// leaves its line out and the legal pages fall back to the brand name, so nothing shows a
// placeholder to visitors.
export const COMPANY = {
  brand: 'EternalPage',
  // Razão social, e.g. 'ETERNALPAGE TECNOLOGIA LTDA'.
  legalName: '63.694.979 VITOR VIEIRA DOS SANTOS',
  // e.g. '00.000.000/0001-00'.
  cnpj: '63.694.979/0001-65',
  // City and state, e.g. 'São Paulo/SP'.
  city: 'Joinville/SC',
  // Full address of the registered office, shown only in the Privacy Policy.
  address: '',
  // Data protection officer (encarregado, LGPD art. 41). Defaults to the support e-mail.
  dpoName: '',
  dpoEmail: SUPPORT_EMAIL,
  email: SUPPORT_EMAIL,
  // Full profile URLs; leave empty to hide the icon.
  instagram: '',
  tiktok: '',
  // Courts for disputes (foro), e.g. 'São Paulo/SP'. Consumers can always sue at home (CDC art. 101).
  forum: '',
};

// Date shown at the top of every legal page. Change it whenever a text changes.
export const LEGAL_UPDATED_AT = '19 de outubro de 2026';

// "EternalPage (RAZÃO SOCIAL LTDA, CNPJ 00.000.000/0001-00)" or just "EternalPage" while unset.
export function companyIdentity(): string {
  const parts = [COMPANY.legalName, COMPANY.cnpj && `CNPJ ${COMPANY.cnpj}`].filter(Boolean);
  return parts.length ? `${COMPANY.brand} (${parts.join(', ')})` : COMPANY.brand;
}

export const LEGAL_LINKS = [
  { href: '/termos', label: 'Termos de Uso' },
  { href: '/privacidade', label: 'Política de Privacidade' },
  { href: '/cookies', label: 'Política de Cookies' },
];
