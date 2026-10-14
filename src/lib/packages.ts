// Package types and configuration for EternalPage

// 'plus' is kept only so drafts created before the two-package lineup still load; it is not
// offered anymore and behaves like the Completo package.
export type PackageType = 'basic' | 'plus' | 'premium';

export interface PackageConfig {
  id: PackageType;
  name: string;
  displayName: string;
  description: string;
  price: number;
  // Shown struck through next to the price, as the regular price.
  originalPrice?: number;
  features: string[];
  // What the other package has and this one doesn't, shown struck through.
  missing?: string[];
  limits: PackageLimits;
  popular?: boolean;
}

export interface PackageLimits {
  momentsPhotos: number;      // Max photos in Moments gallery
  timelineMoments: number;    // Max timeline items
  timelineImages: boolean;    // Can add images to timeline items
  music: boolean;             // Can add background music (and a voice message)
}

const COMPLETE: PackageConfig = {
  id: 'premium',
  name: 'Completo',
  displayName: 'Completo',
  description: 'Todos os recursos, para guardar para sempre',
  price: 29.9,
  originalPrice: 59.9,
  features: [
    'Fotos ilimitadas na galeria',
    'Linha do tempo ilimitada, com fotos',
    'Música de fundo',
    'Mensagem de voz gravada por você',
    'Carta, contador e motivos para te amar',
    'Mural de recados para família e amigos',
    'Abertura com envelope surpresa',
    'Link e cartão com QR code para imprimir',
    'Página no ar para sempre',
    'Suporte prioritário',
  ],
  limits: {
    momentsPhotos: 999,
    timelineMoments: 999,
    timelineImages: true,
    music: true,
  },
  popular: true,
};

export const PACKAGES: Record<PackageType, PackageConfig> = {
  basic: {
    id: 'basic',
    name: 'Básico',
    displayName: 'Básico',
    description: 'Uma homenagem simples e linda',
    price: 18.9,
    originalPrice: 37.9,
    features: [
      'Até 5 fotos na galeria',
      'Até 5 momentos na linha do tempo',
      'Carta, contador e motivos para te amar',
      'Mural de recados para família e amigos',
      'Abertura com envelope surpresa',
      'Link e cartão com QR code para imprimir',
      'Página no ar por 1 ano',
    ],
    missing: ['Música de fundo', 'Mensagem de voz', 'Fotos na linha do tempo'],
    limits: {
      momentsPhotos: 5,
      timelineMoments: 5,
      timelineImages: false,
      music: false,
    },
  },
  plus: { ...COMPLETE, id: 'plus' },
  premium: COMPLETE,
};

// The packages on offer, in display order.
export const PACKAGE_LIST = [PACKAGES.basic, PACKAGES.premium];

export const LOWEST_PRICE = Math.min(...PACKAGE_LIST.map((p) => p.price));

export function getPackage(type: PackageType): PackageConfig {
  return PACKAGES[type] ?? PACKAGES.premium;
}

export function formatPrice(price: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(price);
}

// "50% off" style label for a package with a struck-through regular price.
export function discountLabel(pkg: PackageConfig): string | null {
  if (!pkg.originalPrice || pkg.originalPrice <= pkg.price) return null;
  return `${Math.round((1 - pkg.price / pkg.originalPrice) * 100)}% off`;
}
