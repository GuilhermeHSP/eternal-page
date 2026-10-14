import { TemplateStyleConfig } from '@/types/tribute';

export const templates: Record<string, TemplateStyleConfig> = {
  romantic: {
    name: 'romantic',
    displayName: 'Amor',
    category: 'romantic',
    description: 'Para quem divide a vida com você',
    accentColor: '#e11d48',
    backgroundColor: '#fef7f7',
    textColor: '#1f2937',
    secondaryTextColor: '#6b7280',
    headingFont: 'Playfair Display, Georgia, serif',
    bodyFont: 'Plus Jakarta Sans, system-ui, sans-serif',
    maxWidth: '800px',
    borderRadius: '16px',
    backgroundAnimation: {
      type: 'hearts',
      intensity: 'medium',
      color: '#fda4af'
    },
    parallaxEnabled: true,
    fadeAnimations: true,
    decorativeElements: ['hearts', 'ribbons'],
    layoutVariant: 'storybook'
  },
  
  mothersDay: {
    name: 'mothersDay',
    displayName: 'Dia das Mães',
    category: 'family',
    description: 'Para a mãe, a avó ou quem cuidou de você',
    accentColor: '#db2777',
    backgroundColor: '#fdf2f8',
    textColor: '#1f2937',
    secondaryTextColor: '#6b7280',
    headingFont: 'Playfair Display, Georgia, serif',
    bodyFont: 'Plus Jakarta Sans, system-ui, sans-serif',
    maxWidth: '800px',
    borderRadius: '16px',
    backgroundAnimation: {
      type: 'petals',
      intensity: 'low',
      color: '#fbcfe8'
    },
    parallaxEnabled: true,
    fadeAnimations: true,
    decorativeElements: ['flowers', 'ribbons'],
    layoutVariant: 'classic'
  },
  
  fathersDay: {
    name: 'fathersDay',
    displayName: 'Dia dos Pais',
    category: 'family',
    description: 'Para o pai, o avô ou quem te ensinou o caminho',
    accentColor: '#0369a1',
    backgroundColor: '#f0f9ff',
    textColor: '#1f2937',
    secondaryTextColor: '#6b7280',
    headingFont: 'Playfair Display, Georgia, serif',
    bodyFont: 'Plus Jakarta Sans, system-ui, sans-serif',
    maxWidth: '800px',
    borderRadius: '12px',
    backgroundAnimation: {
      type: 'particles',
      intensity: 'low',
      color: '#bae6fd'
    },
    parallaxEnabled: true,
    fadeAnimations: true,
    decorativeElements: ['stars'],
    layoutVariant: 'classic'
  },
  
  birthday: {
    name: 'birthday',
    displayName: 'Aniversário',
    category: 'birthday',
    description: 'Para comemorar mais um ano de alguém',
    accentColor: '#f59e0b',
    backgroundColor: '#fffbeb',
    textColor: '#1f2937',
    secondaryTextColor: '#6b7280',
    headingFont: 'Playfair Display, Georgia, serif',
    bodyFont: 'Plus Jakarta Sans, system-ui, sans-serif',
    maxWidth: '800px',
    borderRadius: '20px',
    backgroundAnimation: {
      type: 'sparkles',
      intensity: 'high',
      color: '#fcd34d'
    },
    parallaxEnabled: true,
    fadeAnimations: true,
    decorativeElements: ['balloons', 'confetti'],
    layoutVariant: 'modern'
  },
  
  memorial: {
    name: 'memorial',
    displayName: 'Memória',
    category: 'memorial',
    description: 'Para lembrar de quem partiu, com calma',
    accentColor: '#6366f1',
    backgroundColor: '#faf5ff',
    textColor: '#1f2937',
    secondaryTextColor: '#6b7280',
    headingFont: 'Playfair Display, Georgia, serif',
    bodyFont: 'Plus Jakarta Sans, system-ui, sans-serif',
    maxWidth: '800px',
    borderRadius: '12px',
    backgroundAnimation: {
      type: 'stars',
      intensity: 'low',
      color: '#c4b5fd'
    },
    parallaxEnabled: false,
    fadeAnimations: true,
    decorativeElements: ['candles'],
    layoutVariant: 'minimal'
  },
  
  friendship: {
    name: 'friendship',
    displayName: 'Amizade',
    category: 'friendship',
    description: 'Para a amiga ou o amigo de sempre',
    accentColor: '#10b981',
    backgroundColor: '#ecfdf5',
    textColor: '#1f2937',
    secondaryTextColor: '#6b7280',
    headingFont: 'Playfair Display, Georgia, serif',
    bodyFont: 'Plus Jakarta Sans, system-ui, sans-serif',
    maxWidth: '800px',
    borderRadius: '16px',
    backgroundAnimation: {
      type: 'particles',
      intensity: 'medium',
      color: '#6ee7b7'
    },
    parallaxEnabled: true,
    fadeAnimations: true,
    decorativeElements: ['ribbons'],
    layoutVariant: 'modern'
  },
  
  valentine: {
    name: 'valentine',
    displayName: 'Namorados',
    category: 'romantic',
    description: 'Para o 12 de junho',
    accentColor: '#be123c',
    backgroundColor: '#fff1f2',
    textColor: '#1f2937',
    secondaryTextColor: '#6b7280',
    headingFont: 'Playfair Display, Georgia, serif',
    bodyFont: 'Plus Jakarta Sans, system-ui, sans-serif',
    maxWidth: '800px',
    borderRadius: '16px',
    backgroundAnimation: {
      type: 'hearts',
      intensity: 'high',
      color: '#fda4af'
    },
    parallaxEnabled: true,
    fadeAnimations: true,
    decorativeElements: ['hearts', 'cupids'],
    layoutVariant: 'storybook'
  },
  
  anniversary: {
    name: 'anniversary',
    displayName: 'Bodas',
    category: 'romantic',
    description: 'Para os anos de casamento, de papel a ouro',
    accentColor: '#a855f7',
    backgroundColor: '#faf5ff',
    textColor: '#1f2937',
    secondaryTextColor: '#6b7280',
    headingFont: 'Playfair Display, Georgia, serif',
    bodyFont: 'Plus Jakarta Sans, system-ui, sans-serif',
    maxWidth: '800px',
    borderRadius: '16px',
    backgroundAnimation: {
      type: 'sparkles',
      intensity: 'medium',
      color: '#e9d5ff'
    },
    parallaxEnabled: true,
    fadeAnimations: true,
    decorativeElements: ['rings', 'ribbons'],
    layoutVariant: 'classic'
  }
};

export const templateList = Object.values(templates);

export function getTemplate(name: string): TemplateStyleConfig | undefined {
  return templates[name];
}

export function getTemplatesByCategory(category: string): TemplateStyleConfig[] {
  return templateList.filter(t => t.category === category);
}

export const categories = [
  { id: 'romantic', label: 'Amor', icon: '❤️' },
  { id: 'family', label: 'Família', icon: '👨‍👩‍👧‍👦' },
  { id: 'birthday', label: 'Aniversário', icon: '🎂' },
  { id: 'memorial', label: 'Memória', icon: '🕯️' },
  { id: 'friendship', label: 'Amizade', icon: '🤝' },
  { id: 'achievement', label: 'Conquista', icon: '🏆' }
];
