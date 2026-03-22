import { TemplateStyleConfig } from '@/types/tribute';

export const templates: Record<string, TemplateStyleConfig> = {
  romantic: {
    name: 'romantic',
    displayName: 'Romantic Love',
    category: 'romantic',
    description: 'A warm, intimate template for expressing love and affection',
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
    displayName: "Mother's Day",
    category: 'family',
    description: 'A tender template to honor mothers and mother figures',
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
    displayName: "Father's Day",
    category: 'family',
    description: 'A strong, heartfelt template to celebrate fathers',
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
    displayName: 'Birthday Celebration',
    category: 'birthday',
    description: 'A festive, joyful template for birthday tributes',
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
    displayName: 'Memorial',
    category: 'memorial',
    description: 'A dignified, peaceful template for honoring loved ones',
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
    displayName: 'Best Friends',
    category: 'friendship',
    description: 'A cheerful template celebrating friendship bonds',
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
    displayName: "Valentine's Day",
    category: 'romantic',
    description: 'A passionate, romantic template for Valentine celebrations',
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
    displayName: 'Anniversary',
    category: 'romantic',
    description: 'An elegant template for celebrating milestones together',
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
  { id: 'romantic', label: 'Romantic', icon: '❤️' },
  { id: 'family', label: 'Family', icon: '👨‍👩‍👧‍👦' },
  { id: 'birthday', label: 'Birthday', icon: '🎂' },
  { id: 'memorial', label: 'Memorial', icon: '🕯️' },
  { id: 'friendship', label: 'Friendship', icon: '🤝' },
  { id: 'achievement', label: 'Achievement', icon: '🏆' }
];
