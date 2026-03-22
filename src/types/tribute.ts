// Tribute Configuration Types - JSON-driven page configuration system

export interface PhotoConfig {
  id: string;
  url: string;
  caption?: string;
  order: number;
}

export interface TimelineItemConfig {
  id: string;
  title: string;
  description?: string;
  year?: string;
  imageUrl?: string;
  order: number;
}

export interface MusicConfig {
  url: string;
  autoplay?: boolean;
  title?: string;
  artist?: string;
}

export interface HeroConfig {
  image?: string;
  gradient?: string;
  overlay?: boolean;
}

export interface MessageConfig {
  text: string;
  typingAnimation?: boolean;
  highlightPhrases?: string[];
}

export interface BackgroundAnimationConfig {
  type: 'hearts' | 'particles' | 'petals' | 'sparkles' | 'stars' | 'none';
  intensity?: 'low' | 'medium' | 'high';
  color?: string;
}

export interface StyleConfig {
  // Colors
  accentColor: string;
  backgroundColor: string;
  textColor: string;
  secondaryTextColor: string;
  
  // Typography
  headingFont: string;
  bodyFont: string;
  
  // Layout
  maxWidth: string;
  borderRadius: string;
  
  // Effects
  backgroundAnimation: BackgroundAnimationConfig;
  parallaxEnabled: boolean;
  fadeAnimations: boolean;
}

export interface TemplateStyleConfig extends StyleConfig {
  name: string;
  displayName: string;
  category: 'romantic' | 'family' | 'memorial' | 'birthday' | 'friendship' | 'achievement';
  decorativeElements?: string[];
  layoutVariant?: 'classic' | 'modern' | 'minimal' | 'storybook';
}

export interface TributeConfig {
  // Core info
  title: string;
  recipient: string;
  
  // Template
  template: string;
  
  // Sections
  hero?: HeroConfig;
  music?: MusicConfig;
  message?: MessageConfig;
  gallery?: PhotoConfig[];
  timeline?: TimelineItemConfig[];
  closingMessage?: string;
  
  // Styling overrides
  style?: Partial<StyleConfig>;
  
  // Metadata
  createdAt?: string;
  authorName?: string;
}

// Form data for creating/updating tributes
export interface TributeFormData {
  title: string;
  recipient: string;
  templateId: string;
  message?: string;
  heroImage?: string;
  musicUrl?: string;
  photos?: {
    url: string;
    caption?: string;
  }[];
  timeline?: {
    title: string;
    description?: string;
    year?: string;
    imageUrl?: string;
  }[];
  closingMessage?: string;
}

// API response types
export interface TributeResponse {
  id: string;
  slug: string;
  title: string;
  recipient: string;
  config: TributeConfig;
  templateId: string;
  isPublished: boolean;
  isPremium: boolean;
  viewCount: number;
  createdAt: string;
}

export interface TemplateResponse {
  id: string;
  name: string;
  displayName: string;
  description?: string;
  category: string;
  styleConfig: TemplateStyleConfig;
  previewUrl?: string;
  isPremium: boolean;
}
