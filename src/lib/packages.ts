// Package types and configuration for EternalPage

export type PackageType = 'basic' | 'plus' | 'premium';

export interface PackageConfig {
  id: PackageType;
  name: string;
  displayName: string;
  description: string;
  price: number;
  features: string[];
  limits: PackageLimits;
  popular?: boolean;
}

export interface PackageLimits {
  momentsPhotos: number;      // Max photos in Moments gallery
  timelineMoments: number;    // Max timeline items
  timelineImages: boolean;    // Can add images to timeline items
  music: boolean;             // Can add background music
}

export const PACKAGES: Record<PackageType, PackageConfig> = {
  basic: {
    id: 'basic',
    name: 'Básica',
    displayName: 'Básica',
    description: 'Perfeito para uma homenagem simples e elegante',
    price: 29.90,
    features: [
      'Até 3 fotos na galeria',
      'Até 5 momentos na timeline',
      'Página válida por 30 dias',
      'Link único para compartilhar',
    ],
    limits: {
      momentsPhotos: 3,
      timelineMoments: 5,
      timelineImages: false,
      music: false,
    },
  },
  plus: {
    id: 'plus',
    name: 'Plus',
    displayName: 'Plus',
    description: 'Ideal para homenagens mais completas',
    price: 49.90,
    features: [
      'Até 10 fotos na galeria',
      'Até 10 momentos na timeline',
      'Imagens na timeline',
      'Música de fundo',
      'Página válida por 1 ano',
      'Link único para compartilhar',
    ],
    limits: {
      momentsPhotos: 10,
      timelineMoments: 10,
      timelineImages: true,
      music: true,
    },
    popular: true,
  },
  premium: {
    id: 'premium',
    name: 'Premium',
    displayName: 'Premium',
    description: 'A experiência completa para homenagens especiais',
    price: 79.90,
    features: [
      'Fotos ilimitadas na galeria',
      'Timeline ilimitada',
      'Imagens na timeline',
      'Música de fundo',
      'Página válida para sempre',
      'Link único para compartilhar',
      'Suporte prioritário',
    ],
    limits: {
      momentsPhotos: 999,
      timelineMoments: 999,
      timelineImages: true,
      music: true,
    },
  },
};

export const PACKAGE_LIST = Object.values(PACKAGES);

export function getPackage(type: PackageType): PackageConfig {
  return PACKAGES[type];
}

export function formatPrice(price: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(price);
}
