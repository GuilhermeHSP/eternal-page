import { Heart, Lock, Mail, ShieldCheck, Instagram } from 'lucide-react';
import { Logo } from '@/components/logo';
import { COMPANY, LEGAL_LINKS } from '@/lib/legal';

const PRODUCT_LINKS = [
  { href: '/#como-funciona', label: 'Como funciona' },
  { href: '/para-melhor-mae-demo', label: 'Ver um exemplo' },
  { href: '/#modelos', label: 'Modelos' },
  { href: '/#precos', label: 'Preços' },
];

const HELP_LINKS = [
  { href: '/#duvidas', label: 'Perguntas frequentes' },
  { href: '/contato', label: 'Fale conosco' },
  { href: '/termos#reembolso', label: 'Cancelamento e reembolso' },
];

// The full footer of the site: what EternalPage is, where to go, the legal pages and who runs it.
// `className` adds room at the bottom on phones, where the home page has a fixed button.
export function SiteFooter({ className = '' }: { className?: string }) {
  const year = new Date().getFullYear();
  const companyLine = [COMPANY.legalName, COMPANY.cnpj && `CNPJ ${COMPANY.cnpj}`, COMPANY.city]
    .filter(Boolean)
    .join(' · ');

  return (
    <footer className={`border-t border-rose-100 bg-gradient-to-b from-white to-rose-50/60 px-4 pt-14 pb-8 ${className}`}>
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-2 gap-x-6 gap-y-10 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
          <div className="col-span-2 max-w-sm md:col-span-1">
            <a href="/" aria-label="EternalPage, página inicial" className="inline-block text-gray-800">
              <Logo className="h-12 w-auto" animated={false} />
            </a>
            <p className="mt-4 text-sm leading-relaxed text-gray-600">
              Páginas de homenagem com fotos, música, carta e linha do tempo, para presentear quem você ama com um
              link que fica guardado.
            </p>
            <div className="mt-5 flex items-center gap-3">
              <a
                href={`mailto:${COMPANY.email}`}
                className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-white ring-1 ring-rose-100 text-gray-600 hover:text-rose-500 hover:ring-rose-200"
                aria-label={`Enviar e-mail para ${COMPANY.email}`}
              >
                <Mail className="h-4 w-4" />
              </a>
              {COMPANY.instagram && (
                <a
                  href={COMPANY.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-white ring-1 ring-rose-100 text-gray-600 hover:text-rose-500 hover:ring-rose-200"
                  aria-label="EternalPage no Instagram"
                >
                  <Instagram className="h-4 w-4" />
                </a>
              )}
              {COMPANY.tiktok && (
                <a
                  href={COMPANY.tiktok}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-white ring-1 ring-rose-100 text-gray-600 hover:text-rose-500 hover:ring-rose-200"
                  aria-label="EternalPage no TikTok"
                >
                  <TikTokIcon className="h-4 w-4" />
                </a>
              )}
            </div>
          </div>

          <FooterColumn title="Produto" links={PRODUCT_LINKS} />
          <FooterColumn title="Ajuda" links={HELP_LINKS} />
          <FooterColumn title="Legal" links={LEGAL_LINKS} />
        </div>

        <div className="mt-12 flex flex-col gap-4 border-y border-rose-100 py-5 text-sm text-gray-600 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
            <span className="inline-flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-rose-400" />
              Pagamento seguro pelo Mercado Pago
            </span>
            <span className="inline-flex items-center gap-2">
              <Lock className="h-4 w-4 text-rose-400" />
              Conexão protegida
            </span>
          </div>
          <span className="inline-flex items-center gap-1.5 text-gray-500">
            Feito com <Heart className="h-3.5 w-3.5 text-rose-500" fill="currentColor" aria-label="amor" /> no Brasil
          </span>
        </div>

        <div className="mt-6 space-y-2 text-xs leading-relaxed text-gray-500">
          <p className="text-sm text-gray-600">© {year} EternalPage. Todos os direitos reservados.</p>
          {companyLine && <p>{companyLine}</p>}
          <p>
            A marca, os modelos, as ilustrações, os textos e o código do EternalPage são protegidos pela Lei de
            Direitos Autorais (Lei 9.610/98) e não podem ser copiados ou reproduzidos sem autorização. As fotos,
            textos e áudios de cada homenagem pertencem a quem os enviou.
          </p>
          <p>Fotos de exemplo de bancos de imagens livres (StockSnap, rawpixel e Unsplash). Nenhuma mostra um cliente.</p>
        </div>
      </div>
    </footer>
  );
}

function FooterColumn({
  title,
  links,
}: {
  title: string;
  links: Array<{ href: string; label: string }>;
}) {
  return (
    <nav aria-label={title}>
      <h2 className="text-xs font-semibold uppercase tracking-[0.18em] text-rose-500">{title}</h2>
      <ul className="mt-4 space-y-3 text-sm text-gray-600">
        {links.map((link) => (
          <li key={link.href}>
            <a href={link.href} className="hover:text-rose-500">
              {link.label}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}

// lucide has no TikTok mark.
function TikTokIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M16.6 5.82A4.28 4.28 0 0 1 15.54 3h-3.09v12.4a2.59 2.59 0 0 1-2.59 2.5c-1.42 0-2.6-1.16-2.6-2.6 0-1.72 1.66-3.01 3.37-2.48V9.66c-3.45-.46-6.47 2.22-6.47 5.64 0 3.33 2.76 5.7 5.69 5.7 3.14 0 5.69-2.55 5.69-5.7V9.01a7.35 7.35 0 0 0 4.3 1.38V7.3s-1.88.09-3.24-1.48Z" />
    </svg>
  );
}
