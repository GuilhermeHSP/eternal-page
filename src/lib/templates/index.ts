import { TemplateStyleConfig } from '@/types/tribute';

// Every template is a two-colour print job: one ground and one ink, set in Switzer.
// The archival photograph next to each one is only an example for the landing page.
const base = {
  textColor: '#1d1b1a',
  secondaryTextColor: '#55504c',
  headingFont: 'Switzer, system-ui, sans-serif',
  bodyFont: 'Switzer, system-ui, sans-serif',
  maxWidth: '800px',
  borderRadius: '0px',
  backgroundAnimation: { type: 'none' as const },
  parallaxEnabled: false,
  fadeAnimations: true,
};

export const templates: Record<string, TemplateStyleConfig> = {
  romantic: {
    ...base,
    name: 'romantic',
    displayName: 'Amor',
    category: 'romantic',
    description: 'Para quem divide a vida com você',
    accentColor: '#7d0c14',
    backgroundColor: '#e2e2e2',
    layoutVariant: 'storybook',
  },

  mothersDay: {
    ...base,
    name: 'mothersDay',
    displayName: 'Dia das Mães',
    category: 'family',
    description: 'Para a mãe, a avó ou quem cuidou de você',
    accentColor: '#8c1d4f',
    backgroundColor: '#ebe3e6',
    layoutVariant: 'classic',
  },

  fathersDay: {
    ...base,
    name: 'fathersDay',
    displayName: 'Dia dos Pais',
    category: 'family',
    description: 'Para o pai, o avô ou quem te ensinou o caminho',
    accentColor: '#1d3f63',
    backgroundColor: '#e3e6ea',
    layoutVariant: 'classic',
  },

  birthday: {
    ...base,
    name: 'birthday',
    displayName: 'Aniversário',
    category: 'birthday',
    description: 'Para comemorar mais um ano de alguém',
    accentColor: '#0f5e5a',
    backgroundColor: '#e3eae8',
    layoutVariant: 'modern',
  },

  memorial: {
    ...base,
    name: 'memorial',
    displayName: 'Memória',
    category: 'memorial',
    description: 'Para lembrar de quem partiu, com calma',
    accentColor: '#33363b',
    backgroundColor: '#e5e4e1',
    layoutVariant: 'minimal',
  },

  friendship: {
    ...base,
    name: 'friendship',
    displayName: 'Amizade',
    category: 'friendship',
    description: 'Para a amiga ou o amigo de sempre',
    accentColor: '#2f5a1f',
    backgroundColor: '#e4e8df',
    layoutVariant: 'modern',
  },

  valentine: {
    ...base,
    name: 'valentine',
    displayName: 'Namorados',
    category: 'romantic',
    description: 'Para o 12 de junho',
    accentColor: '#a3121f',
    backgroundColor: '#eee2e2',
    layoutVariant: 'storybook',
  },

  anniversary: {
    ...base,
    name: 'anniversary',
    displayName: 'Bodas',
    category: 'romantic',
    description: 'Para os anos de casamento, de papel a ouro',
    accentColor: '#6b5414',
    backgroundColor: '#e3e2de',
    layoutVariant: 'classic',
  },
};

export const templateList = Object.values(templates);

export function getTemplate(name: string): TemplateStyleConfig | undefined {
  return templates[name];
}

export function getTemplatesByCategory(category: string): TemplateStyleConfig[] {
  return templateList.filter(t => t.category === category);
}

export const categories = [
  { id: 'romantic', label: 'Amor' },
  { id: 'family', label: 'Família' },
  { id: 'birthday', label: 'Aniversário' },
  { id: 'memorial', label: 'Memória' },
  { id: 'friendship', label: 'Amizade' },
  { id: 'achievement', label: 'Conquista' },
];
