import type { Metadata } from 'next';
import { HomeClient } from '@/components/home/home-client';
import { FAQ } from '@/components/landing/landing-data';
import { PACKAGE_LIST, LOWEST_PRICE } from '@/lib/packages';
import { COMPANY } from '@/lib/legal';
import { siteUrl } from '@/lib/site';

const TITLE = 'Presente para o seu amor: uma página com a história de vocês';
const DESCRIPTION =
  'Monte em minutos uma página de homenagem para o seu amor, com fotos, carta, linha do tempo e música, e envie o link de presente. Prévia grátis, pagamento único. Também para Dia das Mães, Dia dos Pais, aniversários e bodas.';

export const metadata: Metadata = {
  title: { absolute: `${TITLE} | EternalPage` },
  description: DESCRIPTION,
  alternates: { canonical: '/' },
  openGraph: { title: TITLE, description: DESCRIPTION, url: '/' },
  twitter: { card: 'summary_large_image', title: TITLE, description: DESCRIPTION },
};

// What search engines read about the brand, the product with its prices and the FAQ.
function structuredData() {
  const url = siteUrl();
  const organization = {
    '@type': 'Organization',
    '@id': `${url}/#organization`,
    name: COMPANY.brand,
    ...(COMPANY.legalName && { legalName: COMPANY.legalName }),
    url,
    logo: `${url}/brand/eternalpage-logo-fundo-branco.png`,
    email: COMPANY.email,
    sameAs: [COMPANY.instagram, COMPANY.tiktok].filter(Boolean),
  };
  return {
    '@context': 'https://schema.org',
    '@graph': [
      organization,
      {
        '@type': 'WebSite',
        '@id': `${url}/#website`,
        url,
        name: COMPANY.brand,
        inLanguage: 'pt-BR',
        publisher: { '@id': `${url}/#organization` },
      },
      {
        '@type': 'Product',
        name: 'Página de homenagem EternalPage',
        description: DESCRIPTION,
        image: `${url}/demo/casal-praia.jpg`,
        brand: { '@id': `${url}/#organization` },
        offers: {
          '@type': 'AggregateOffer',
          priceCurrency: 'BRL',
          lowPrice: LOWEST_PRICE.toFixed(2),
          highPrice: Math.max(...PACKAGE_LIST.map((p) => p.price)).toFixed(2),
          offerCount: PACKAGE_LIST.length,
          offers: PACKAGE_LIST.map((pkg) => ({
            '@type': 'Offer',
            name: pkg.displayName,
            description: pkg.description,
            price: pkg.price.toFixed(2),
            priceCurrency: 'BRL',
            availability: 'https://schema.org/InStock',
            url: `${url}/#precos`,
          })),
        },
      },
      {
        '@type': 'FAQPage',
        mainEntity: FAQ.map((item) => ({
          '@type': 'Question',
          name: item.q,
          acceptedAnswer: { '@type': 'Answer', text: item.a },
        })),
      },
    ],
  };
}

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ edit?: string | string[]; etapa?: string | string[] }>;
}) {
  const { edit, etapa } = await searchParams;
  const editDraftId = typeof edit === 'string' && edit ? edit : null;
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData()).replace(/</g, '\\u003c') }}
      />
      <HomeClient editDraftId={editDraftId} reopening={!!editDraftId || etapa !== undefined} />
    </>
  );
}
