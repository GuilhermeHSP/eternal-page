'use client';

import { useState, useRef, useEffect } from 'react';
import { isYouTubeUrl, parseMusicLink } from '@/lib/music-link';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  ChevronLeft,
  ChevronRight,
  ImagePlus,
  Music,
  Calendar,
  Heart,
  Sparkles,
  Upload,
  X,
  Plus,
  Trash2,
  Loader2,
  FileAudio,
  Play,
  Pause,
  Link as LinkIcon,
  Check,
  Package,
  Star,
  Flower2,
  CircleDot,
  Mic,
  Mail,
  PenLine,
  ChevronDown,
  Eye,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { templateList, categories } from '@/lib/templates';
import { TemplateStyleConfig } from '@/types/tribute';
import type { PackageType } from '@/lib/packages';
import { PACKAGES, PACKAGE_LIST, formatPrice, getPackage } from '@/lib/packages';
import { LivePreview, type PreviewSection } from './live-preview';
import { PlanCard } from '@/components/pricing/plan-card';
import { VoiceRecorder } from './voice-recorder';
import { CoachMarks } from './coach-marks';
import { fileToResizedDataUrl } from '@/lib/image';
import { TRIBUTE_COLORS, isValidHex, styleForColor } from '@/lib/colors';
import type { TributeConfig } from '@/types/tribute';

const tributeSchema = z.object({
  title: z.string().min(1, 'O título é obrigatório').max(100),
  recipient: z.string().min(1, 'O nome do homenageado é obrigatório').max(50),
  templateId: z.string().min(1, 'Por favor, selecione um template'),
  message: z.string().max(2000).optional(),
  heroImage: z.string().optional(),
  musicUrl: z.string().optional(),
  closingMessage: z.string().max(500).optional(),
  counterDate: z.string().optional(),
  counterLabel: z.string().max(40).optional(),
  authorName: z.string().max(50).optional(),
});

type FormData = z.infer<typeof tributeSchema>;

interface PhotoItem {
  id: string;
  url: string;
  caption: string;
  file?: File;
}

interface TimelineItem {
  id: string;
  title: string;
  description: string;
  year: string;
  imageUrl: string;
}

interface MusicFile {
  id: string;
  url: string;
  name: string;
  file?: File;
}

// Steps including plan selection as first step
const REASON_PLACEHOLDERS = [
  'Seu sorriso que ilumina o dia',
  'O jeito como você cuida de todos',
  'Seu abraço que resolve tudo',
  'Sua risada no meio do almoço',
];

const steps = [
  { id: 0, title: 'Plano', icon: Package },
  { id: 1, title: 'Template', icon: Sparkles },
  { id: 2, title: 'Para quem', icon: Heart },
  { id: 3, title: 'Detalhes', icon: PenLine },
  { id: 4, title: 'Fotos', icon: ImagePlus },
  { id: 5, title: 'Timeline', icon: Calendar },
  { id: 6, title: 'Voz', icon: Mic },
  { id: 7, title: 'Música', icon: Music },
];

interface TributeCreatorProps {
  editDraftId?: string | null;
  initialRecipient?: string;
  initialTemplateId?: string;
  initialPackage?: PackageType;
}

export function TributeCreator({ editDraftId, initialRecipient, initialTemplateId, initialPackage }: TributeCreatorProps) {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  // A colour picked by the person; null keeps the template's own colour.
  const [customColor, setCustomColor] = useState<string | null>(null);
  const [reasons, setReasons] = useState<string[]>([]);
  const [voiceMessage, setVoiceMessage] = useState<string | null>(null);
  const [guestbook, setGuestbook] = useState(true);
  // Completo pages open with the envelope unless the giver turns it off.
  const [envelope, setEnvelope] = useState(true);
  const [musicTitle, setMusicTitle] = useState('');
  const [selectedPackage, setSelectedPackage] = useState<PackageType | null>(initialPackage ?? null);
  const [photos, setPhotos] = useState<PhotoItem[]>([]);
  const [timelineItems, setTimelineItems] = useState<TimelineItem[]>([]);
  const [musicFile, setMusicFile] = useState<MusicFile | null>(null);
  const [musicInputType, setMusicInputType] = useState<'upload' | 'url'>('upload');
  const [isPlaying, setIsPlaying] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploadingMusic, setIsUploadingMusic] = useState(false);
  const [draftId, setDraftId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const timelineImageInputRef = useRef<HTMLInputElement>(null);
  const [activeTimelineItemId, setActiveTimelineItemId] = useState<string | null>(null);
  const musicInputRef = useRef<HTMLInputElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    trigger,
    setFocus,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(tributeSchema),
    mode: 'onTouched',
    defaultValues: {
      templateId: initialTemplateId || 'romantic',
      recipient: initialRecipient || '',
    },
  });

  // Load existing draft when editing
  useEffect(() => {
    if (editDraftId) {
      setIsLoading(true);
      setDraftId(editDraftId);
      
      fetch(`/api/draft?id=${editDraftId}`)
        .then(res => res.json())
        .then(data => {
          // Set form values
          setValue('title', data.title || '');
          setValue('recipient', data.recipient || '');
          setValue('templateId', data.templateId || 'romantic');
          setValue('message', data.message || '');
          setValue('heroImage', data.heroImage || '');
          setValue('musicUrl', data.musicUrl || '');
          setValue('closingMessage', data.closingMessage || '');
          if (Array.isArray(data.config?.reasons)) setReasons(data.config.reasons);
          if (typeof data.config?.voiceMessage === 'string') setVoiceMessage(data.config.voiceMessage);
          setGuestbook(data.config?.guestbook === true);
          setEnvelope(data.config?.envelope !== false);
          if (typeof data.config?.musicTitle === 'string') setMusicTitle(data.config.musicTitle);
          if (data.config?.authorName) setValue('authorName', data.config.authorName);
          if (data.config?.counter?.date) {
            setValue('counterDate', data.config.counter.date);
            setValue('counterLabel', data.config.counter.label || '');
          }
          if (isValidHex(data.config?.style?.accentColor)) setCustomColor(data.config.style.accentColor);
          
          // Set package
          if (data.packageType) {
            setSelectedPackage(data.packageType as PackageType);
          }
          
          // Set photos
          if (data.photos && data.photos.length > 0) {
            setPhotos(data.photos.map((p: { id: string; url: string; caption: string }) => ({
              id: p.id,
              url: p.url,
              caption: p.caption || '',
            })));
          }
          
          // Set timeline items
          if (data.timeline && data.timeline.length > 0) {
            setTimelineItems(data.timeline.map((t: { id: string; title: string; description: string; year: string; imageUrl: string }) => ({
              id: t.id,
              title: t.title || '',
              description: t.description || '',
              year: t.year || '',
              imageUrl: t.imageUrl || '',
            })));
          }
          
          // Set music
          if (data.musicUrl && isYouTubeUrl(data.musicUrl)) {
            // A YouTube link: show it in the "link" tab (the field already holds it).
            setMusicInputType('url');
          } else if (data.musicUrl) {
            setMusicFile({
              id: 'existing-music',
              url: data.musicUrl,
              name: 'Arquivo de música',
            });
          }
          
          // Go directly to "Dados" step (step 2) when editing
          setCurrentStep(2);
        })
        .catch(err => {
          console.error('Error loading draft:', err);
          setError('Erro ao carregar rascunho');
        })
        .finally(() => setIsLoading(false));
    }
  }, [editDraftId, setValue]);

  const selectedTemplateId = watch('templateId');
  const selectedTemplate = templateList.find((t) => t.name === selectedTemplateId);
  const musicUrlValue = watch('musicUrl');
  const heroImageValue = watch('heroImage');
  const heroInputRef = useRef<HTMLInputElement>(null);
  const [isUploadingHero, setIsUploadingHero] = useState(false);

  // The main photo is uploaded, resized in the browser and kept as a data URL like the other images.
  const handleHeroUpload = async (files: FileList | null) => {
    const file = files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setError('Envie uma imagem (JPG, PNG etc.).');
      return;
    }
    if (file.size > 15 * 1024 * 1024) {
      setError('A foto deve ter menos de 15 MB.');
      return;
    }
    setError(null);
    setIsUploadingHero(true);
    try {
      setValue('heroImage', await fileToResizedDataUrl(file, 1800));
    } catch {
      setError('Não foi possível ler a foto. Tente outra.');
    } finally {
      setIsUploadingHero(false);
    }
  };

  // Get package limits
  const packageLimits = selectedPackage ? getPackage(selectedPackage).limits : null;

  const handlePhotoUpload = async (files: FileList | null) => {
    if (!files || !packageLimits) return;

    const maxPhotos = packageLimits.momentsPhotos;
    const newPhotos: PhotoItem[] = [];
    for (let i = 0; i < Math.min(files.length, maxPhotos - photos.length); i++) {
      const file = files[i];
      // A blob: URL only works in this tab; a resized data URL is saved with the tribute.
      let url: string;
      try {
        url = await fileToResizedDataUrl(file, 1400);
      } catch {
        continue;
      }
      newPhotos.push({
        id: `photo-${Date.now()}-${i}`,
        url,
        caption: '',
        file,
      });
    }

    setPhotos((prev) => [...prev, ...newPhotos]);
  };

  const updatePhotoCaption = (id: string, caption: string) => {
    setPhotos((prev) =>
      prev.map((p) => (p.id === id ? { ...p, caption } : p))
    );
  };

  const removePhoto = (id: string) => {
    setPhotos((prev) => prev.filter((p) => p.id !== id));
  };

  const addTimelineItem = () => {
    if (!packageLimits || timelineItems.length >= packageLimits.timelineMoments) return;
    setTimelineItems((prev) => [
      ...prev,
      {
        id: `timeline-${Date.now()}`,
        title: '',
        description: '',
        year: '',
        imageUrl: '',
      },
    ]);
  };

  // The timeline step opens with one empty moment already showing, so it's clear what to fill in.
  // Empty moments are dropped when the page is saved.
  useEffect(() => {
    if (currentStep !== 5) return;
    setTimelineItems((prev) =>
      prev.length ? prev : [{ id: `timeline-${Date.now()}`, title: '', description: '', year: '', imageUrl: '' }]
    );
  }, [currentStep]);

  const updateTimelineItem = (id: string, field: keyof TimelineItem, value: string) => {
    setTimelineItems((prev) =>
      prev.map((t) => (t.id === id ? { ...t, [field]: value } : t))
    );
  };

  const removeTimelineItem = (id: string) => {
    setTimelineItems((prev) => prev.filter((t) => t.id !== id));
  };

  const handleTimelineImageUpload = (itemId: string) => {
    setActiveTimelineItemId(itemId);
    timelineImageInputRef.current?.click();
  };

  const processTimelineImage = (files: FileList | null) => {
    if (!files || files.length === 0 || !activeTimelineItemId) return;

    const file = files[0];

    // Check if it's an image file
    if (!file.type.startsWith('image/')) {
      setError('Por favor, envie uma imagem (JPG, PNG, etc.)');
      return;
    }

    // Check file size (max 5MB for base64 encoding)
    if (file.size > 5 * 1024 * 1024) {
      setError('A imagem deve ter menos de 5MB');
      return;
    }

    setError(null);

    // Convert to base64 for persistence
    const reader = new FileReader();
    reader.onload = () => {
      const base64Url = reader.result as string;
      updateTimelineItem(activeTimelineItemId, 'imageUrl', base64Url);
      setActiveTimelineItemId(null);
    };
    reader.onerror = () => {
      setError('Falha ao ler a imagem. Por favor, tente novamente.');
      setActiveTimelineItemId(null);
    };
    reader.readAsDataURL(file);
  };

  const removeTimelineImage = (itemId: string) => {
    updateTimelineItem(itemId, 'imageUrl', '');
  };

  const handleMusicUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    const file = files[0];

    // Check if it's an audio file
    if (!file.type.startsWith('audio/')) {
      setError('Por favor, envie um arquivo de áudio (MP3, WAV, etc.)');
      return;
    }

    // Check file size (max 10MB for base64 encoding)
    if (file.size > 10 * 1024 * 1024) {
      setError('O arquivo de áudio deve ter menos de 10MB');
      return;
    }

    setIsUploadingMusic(true);
    setError(null);

    try {
      // Convert to base64 for persistence
      const reader = new FileReader();
      reader.onload = () => {
        const base64Url = reader.result as string;
        setMusicFile({
          id: `music-${Date.now()}`,
          url: base64Url,
          name: file.name,
          file,
        });
        setValue('musicUrl', base64Url);
        setIsUploadingMusic(false);
      };
      reader.onerror = () => {
        setError('Falha ao ler o arquivo de áudio. Por favor, tente novamente.');
        setIsUploadingMusic(false);
      };
      reader.readAsDataURL(file);
    } catch (err) {
      setError('Falha ao processar o arquivo de áudio. Por favor, tente novamente.');
      setIsUploadingMusic(false);
      console.error('Music upload error:', err);
    }
  };

  const removeMusic = () => {
    if (musicFile?.url && musicFile.file) {
      // Only revoke if it's a blob URL, not base64
      if (musicFile.url.startsWith('blob:')) {
        URL.revokeObjectURL(musicFile.url);
      }
    }
    setMusicFile(null);
    setValue('musicUrl', '');
    setIsPlaying(false);
  };

  const togglePlayMusic = () => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const onSubmit = async (data: FormData) => {
    if (!selectedPackage) {
      setError('Por favor, selecione um plano antes de continuar.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      // Use music URL from either uploaded file or direct URL
      const finalMusicUrl = musicFile?.url || data.musicUrl || '';

      // Prepare payload for draft
      const payload = {
        draftId,
        title: data.title,
        recipient: data.recipient,
        templateId: data.templateId,
        message: data.message || '',
        heroImage: data.heroImage || '',
        musicUrl: finalMusicUrl,
        musicTitle: finalMusicUrl ? musicTitle.trim() || undefined : undefined,
        envelope: packageLimits?.envelope ? envelope : undefined,
        closingMessage: data.closingMessage || '',
        counterDate: data.counterDate || undefined,
        counterLabel: data.counterLabel || undefined,
        reasons: reasons.map((r) => r.trim()).filter(Boolean),
        voiceMessage: packageLimits?.music ? voiceMessage || undefined : undefined,
        guestbook,
        authorName: data.authorName?.trim() || undefined,
        accentColor: customColor || undefined,
        packageType: selectedPackage,
        photos: photos.map((p, i) => ({
          url: p.url,
          caption: p.caption,
          order: i,
        })),
        timeline: timelineItems
          .filter((t) => t.title)
          .map((t, i) => ({
            ...t,
            order: i,
          })),
      };

      // Save draft to API
      const response = await fetch('/api/draft', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error('Failed to save draft');
      }

      const result = await response.json();

      // Navigate to preview page
      router.push(`/preview?id=${result.id}`);
    } catch (err) {
      setError('Falha ao gerar preview. Por favor, tente novamente.');
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const nextStep = () => setCurrentStep((prev) => Math.min(prev + 1, steps.length - 1));

  // Required fields per step: the person can only move on once they are filled.
  const goNext = async () => {
    if (currentStep === 0 && !selectedPackage) {
      setError('Escolha um plano para continuar.');
      return;
    }
    if (currentStep === 1 && !selectedTemplateId) {
      setError('Escolha um modelo para continuar.');
      return;
    }
    if (currentStep === 2) {
      const ok = await trigger(['title', 'recipient']);
      if (!ok) {
        setError('Preencha o título e o nome do homenageado para continuar.');
        setFocus(errors.title || !watch('title') ? 'title' : 'recipient');
        return;
      }
    }
    setError(null);
    nextStep();
  };
  const prevStep = () => setCurrentStep((prev) => Math.max(prev - 1, 0));

  // Until the step's Voltar/Próximo row is on screen, a "Continuar" button takes the person
  // down to the next field, so nobody moves on without seeing everything the step asks.
  const formRef = useRef<HTMLFormElement>(null);
  // The row only exists once a loaded draft has rendered, so it's tracked through a callback ref.
  const [navEl, setNavEl] = useState<HTMLDivElement | null>(null);
  const [navOnScreen, setNavOnScreen] = useState(true);
  const [previewOpen, setPreviewOpen] = useState(false);

  // First time a phone visitor reaches the occasion step, a short tour points at the preview
  // button and at Continuar/Próximo. Shown once per browser.
  const [showTour, setShowTour] = useState(false);
  useEffect(() => {
    if (currentStep !== 1 || window.innerWidth >= 1024) return;
    try {
      if (localStorage.getItem('eternalpage-tour-done')) return;
    } catch {
      return;
    }
    const t = window.setTimeout(() => setShowTour(true), 700);
    return () => window.clearTimeout(t);
  }, [currentStep]);
  const endTour = () => {
    setShowTour(false);
    try {
      localStorage.setItem('eternalpage-tour-done', '1');
    } catch {
      // private mode: the tour may show again next time
    }
  };
  useEffect(() => {
    if (!navEl || !('IntersectionObserver' in window)) return;
    const io = new IntersectionObserver(([entry]) => setNavOnScreen(entry.isIntersecting));
    io.observe(navEl);
    return () => io.disconnect();
  }, [navEl]);
  const continueDown = () => {
    const fields = Array.from(formRef.current?.querySelectorAll<HTMLElement>('label, h3') ?? []);
    const next = fields.find((el) => el.getBoundingClientRect().top > window.innerHeight * 0.7);
    const target = next ?? navEl;
    if (!target) return;
    window.scrollTo({ top: window.scrollY + target.getBoundingClientRect().top - 96, behavior: 'smooth' });
  };

  // Scroll to top when step changes (for mobile UX)
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentStep]);

  // Live preview: the page as it stands, with placeholders where nothing is written yet.
  const [previewFocus, setPreviewFocus] = useState<PreviewSection>('hero');
  useEffect(() => {
    const byStep: Record<number, PreviewSection> = { 1: 'hero', 2: 'hero', 3: 'message', 4: 'gallery', 5: 'timeline', 6: 'voice', 7: 'hero' };
    setPreviewFocus(byStep[currentStep] ?? 'hero');
  }, [currentStep]);
  const values = watch();
  const previewConfig: TributeConfig = {
    title: values.title || 'O título aparece aqui',
    recipient: values.recipient || 'Nome',
    template: values.templateId || 'romantic',
    hero: values.heroImage ? { image: values.heroImage, overlay: true } : undefined,
    message: {
      text: values.message || 'Sua mensagem aparece aqui, em forma de carta. Escreva com carinho: ela é o coração da homenagem.',
      typingAnimation: false,
    },
    gallery: photos.map((p, i) => ({ id: p.id, url: p.url, caption: p.caption, order: i })),
    timeline: timelineItems
      .filter((t) => t.title || t.year)
      .map((t, i) => ({ id: t.id, title: t.title || 'Momento', description: t.description, year: t.year, imageUrl: t.imageUrl, order: i })),
    closingMessage: values.closingMessage || (previewFocus === 'closing' ? 'Sua mensagem de encerramento aparece aqui.' : undefined),
    style: customColor ? (styleForColor(customColor) as TributeConfig['style']) : undefined,
    voiceMessage: voiceMessage || undefined,
    guestbook,
    authorName: values.authorName?.trim() || undefined,
    reasons: reasons.some((r) => r.trim())
      ? reasons.map((r) => r.trim()).filter(Boolean)
      : previewFocus === 'reasons'
        ? ['Seu sorriso que ilumina o dia', 'O jeito como você cuida de todos', 'Seu abraço que resolve tudo']
        : undefined,
    counter: values.counterDate
      ? { date: values.counterDate, label: values.counterLabel }
      : previewFocus === 'counter'
        ? { date: '2000-01-01', label: values.counterLabel || 'Juntos há' }
        : undefined,
  };
  const focusOn = (section: PreviewSection) => () => setPreviewFocus(section);

  // Clear the "fill in the required fields" warning as soon as they are filled.
  useEffect(() => {
    if (currentStep === 2 && values.title && values.recipient) setError(null);
    if (currentStep === 0 && selectedPackage) setError(null);
  }, [currentStep, values.title, values.recipient, selectedPackage]);

  // Get accent color based on current context
  const accentColor = selectedTemplate?.accentColor || '#ec4899';

  // Loading state for edit mode
  if (isLoading) {
    return (
      <div className="max-w-3xl mx-auto py-20 pb-24 md:pb-20 flex flex-col items-center justify-center">
        <div className="w-12 h-12 border-4 border-rose-500 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-gray-500">Carregando rascunho...</p>
      </div>
    );
  }

  return (
    <div className={currentStep >= 1 ? 'max-w-6xl mx-auto lg:grid lg:grid-cols-[minmax(0,1fr)_320px] lg:gap-12 xl:gap-16 items-start' : ''}>
    <div className="max-w-3xl w-full mx-auto pb-24 md:pb-0">
      {/* Progress Steps */}
      <div className="mb-8">
        <div className="flex items-center justify-between relative">
          <div className="absolute top-4 sm:top-5 left-0 right-0 h-0.5 bg-gray-100">
            <motion.div
              className="h-full bg-rose-500"
              initial={{ width: '0%' }}
              animate={{ width: `${(currentStep / (steps.length - 1)) * 100}%` }}
            />
          </div>
          {steps.map((step) => (
            <button
              key={step.id}
              type="button"
              onClick={() => {
                // Can only go back or to completed steps
                if (step.id <= currentStep) {
                  setCurrentStep(step.id);
                }
              }}
              className="relative z-10 flex flex-col items-center"
            >
              <div
                className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center transition-all ${
                  currentStep >= step.id
                    ? 'bg-rose-500 text-white'
                    : 'bg-gray-100 text-gray-400'
                }`}
              >
                <step.icon className="h-4 w-4 sm:h-5 sm:w-5" />
              </div>
              <span
                className={`text-[10px] sm:text-xs mt-1.5 sm:mt-2 font-medium leading-tight text-center max-w-[3.25rem] sm:max-w-none ${
                  currentStep >= step.id ? 'text-gray-700' : 'text-gray-400'
                }`}
              >
                {step.title}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Form */}
      <form
        ref={formRef}
        onSubmit={(e) => {
          // Prevent any automatic form submission
          e.preventDefault();
        }}
        onKeyDown={(e) => {
          // Prevent Enter key from submitting the form on inputs and textareas
          if (e.key === 'Enter' && (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement)) {
            e.preventDefault();
          }
        }}
      >
        <AnimatePresence mode="wait">
          {/* Step 0: Package Selection */}
          {currentStep === 0 && (
            <motion.div
              key="step0"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div className="text-center mb-8">
                <h2 className="text-2xl font-title font-semibold text-gray-800">
                  Escolha seu pacote
                </h2>
                <p className="text-gray-500 text-sm mt-1">
                  Pagamento único. Você só paga depois de ver a prévia pronta.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto pt-3">
                {PACKAGE_LIST.map((pkg) => (
                  <PlanCard
                    key={pkg.id}
                    pkg={pkg}
                    selected={selectedPackage === pkg.id}
                    anySelected={!!selectedPackage}
                    onSelect={() => setSelectedPackage(pkg.id)}
                    ctaLabel={selectedPackage === pkg.id ? 'Selecionado' : 'Escolher ' + pkg.displayName}
                  />
                ))}
              </div>

              {error && (
                <p className="text-sm text-red-500 text-center">{error}</p>
              )}
            </motion.div>
          )}

          {/* Step 1: Template Selection */}
          {currentStep === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div className="text-center mb-8">
                <h2 className="text-2xl font-title font-semibold text-gray-800">
                  Escolha a ocasião
                </h2>
                <p className="text-gray-500 text-sm mt-1">
                  Cada uma tem seu efeito especial. A cor você escolhe logo abaixo.
                </p>
              </div>

              <TemplateGrid
                templates={templateList}
                selectedId={selectedTemplateId}
                onSelect={(id) => setValue('templateId', id)}
              />

              {errors.templateId && (
                <p className="text-sm text-red-500">{errors.templateId.message}</p>
              )}

              {/* Colour: each person has their own taste, whatever the occasion */}
              <div className="mt-10 rounded-2xl border border-gray-100 bg-white p-5">
                <div className="flex items-baseline justify-between gap-4">
                  <h3 className="font-medium text-gray-800">Cor da homenagem</h3>
                  {customColor && (
                    <button type="button" onClick={() => setCustomColor(null)} className="text-sm text-gray-500 hover:text-rose-600">
                      Usar a cor do modelo
                    </button>
                  )}
                </div>
                <p className="text-sm text-gray-500 mt-1">Escolha a cor que combina com quem vai receber. Ela muda os detalhes, o fundo e os efeitos da página.</p>
                <div role="radiogroup" aria-label="Cor da homenagem" className="mt-4 flex flex-wrap items-center gap-3">
                  <button
                    type="button"
                    role="radio"
                    aria-checked={!customColor}
                    onClick={() => setCustomColor(null)}
                    title="Cor do modelo"
                    className={`h-10 px-3 rounded-full text-xs font-medium border transition-colors ${!customColor ? 'border-gray-900 text-gray-900' : 'border-gray-200 text-gray-500 hover:border-gray-400'}`}
                  >
                    <span className="inline-block w-3 h-3 rounded-full mr-1.5 align-middle" style={{ backgroundColor: selectedTemplate?.accentColor }} />
                    Do modelo
                  </button>
                  {TRIBUTE_COLORS.map((c) => (
                    <button
                      key={c.hex}
                      type="button"
                      role="radio"
                      aria-checked={customColor === c.hex}
                      aria-label={c.name}
                      title={c.name}
                      onClick={() => setCustomColor(c.hex)}
                      className={`w-10 h-10 rounded-full transition-transform hover:scale-110 ${customColor === c.hex ? 'ring-2 ring-offset-2 ring-gray-900' : ''}`}
                      style={{ backgroundColor: c.hex }}
                    />
                  ))}
                  <label
                    title="Outra cor"
                    className={`relative w-10 h-10 rounded-full cursor-pointer overflow-hidden border-2 border-dashed border-gray-300 hover:border-gray-500 flex items-center justify-center ${customColor && !TRIBUTE_COLORS.some((c) => c.hex === customColor) ? 'ring-2 ring-offset-2 ring-gray-900' : ''}`}
                    style={customColor && !TRIBUTE_COLORS.some((c) => c.hex === customColor) ? { backgroundColor: customColor, borderStyle: 'solid' } : undefined}
                  >
                    <Plus className="h-4 w-4 text-gray-500" />
                    <span className="sr-only">Outra cor</span>
                    <input
                      type="color"
                      value={customColor || selectedTemplate?.accentColor || '#e11d48'}
                      onChange={(e) => setCustomColor(e.target.value)}
                      className="absolute inset-0 opacity-0 cursor-pointer"
                    />
                  </label>
                </div>
              </div>

              <div className="pt-6 border-t border-gray-100">
                <p className="text-sm font-medium text-gray-700 mb-3">Como a página abre</p>
                <div className="grid sm:grid-cols-2 gap-3">
                  {[
                    { value: true, title: 'Com envelope surpresa', text: 'A pessoa toca no envelope para abrir a homenagem.', icon: Mail },
                    { value: false, title: 'Direto na homenagem', text: 'A página já abre na foto e no nome.', icon: Heart },
                  ].map((opt) => {
                    const locked = opt.value && packageLimits && !packageLimits.envelope;
                    const active = !locked && (packageLimits?.envelope ? envelope === opt.value : !opt.value);
                    return (
                      <button
                        key={opt.title}
                        type="button"
                        disabled={!!locked}
                        onClick={() => setEnvelope(opt.value)}
                        aria-pressed={active}
                        className={`flex items-start gap-3 rounded-xl border p-4 text-left transition-colors ${
                          active ? 'border-rose-500 bg-rose-50/60 ring-1 ring-rose-500' : 'border-gray-200 hover:border-rose-200'
                        } ${locked ? 'opacity-60 cursor-not-allowed hover:border-gray-200' : ''}`}
                      >
                        <span className={`shrink-0 w-9 h-9 rounded-full flex items-center justify-center ${active ? 'bg-rose-500 text-white' : 'bg-rose-50 text-rose-500'}`}>
                          <opt.icon className="h-4 w-4" />
                        </span>
                        <span>
                          <span className="block text-sm font-semibold text-gray-800">{opt.title}</span>
                          <span className="block text-xs text-gray-500 mt-0.5">
                            {locked ? 'Disponível no pacote Completo.' : opt.text}
                          </span>
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          )}

          {/* Step 2: Who it is for */}
          {currentStep === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div className="text-center mb-8">
                <h2 className="text-2xl font-title font-semibold text-gray-800">
                  Para quem é a homenagem
                </h2>
                <p className="text-gray-500 text-sm mt-1">
                  O nome, o título e a foto que abrem a página
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="recipient">Nome do Homenageado *</Label>
                  <Input
                    id="recipient"
                    placeholder="Maria"
                    {...register('recipient')}
                    onFocus={focusOn('hero')}
                    aria-invalid={!!errors.recipient}
                    className="mt-1.5"
                  />
                  {errors.recipient && (
                    <p role="alert" className="text-sm text-red-500 mt-1">{errors.recipient.message}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="title">Título *</Label>
                  <Input
                    id="title"
                    placeholder="A melhor mãe do mundo!"
                    {...register('title')}
                    onFocus={focusOn('hero')}
                    aria-invalid={!!errors.title}
                    className="mt-1.5"
                  />
                  {errors.title && (
                    <p role="alert" className="text-sm text-red-500 mt-1">{errors.title.message}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="authorName">Seu nome (opcional)</Label>
                  <Input
                    id="authorName"
                    placeholder="Ex.: Raquel, ou Seus filhos"
                    maxLength={50}
                    {...register('authorName')}
                    onFocus={focusOn('message')}
                    className="mt-1.5"
                  />
                  <p className="text-xs text-gray-400 mt-1">Assina a carta e a despedida: "Com amor, Raquel".</p>
                </div>

                <div>
                  <Label htmlFor="heroImage">Foto principal (opcional)</Label>
                  <p className="text-xs text-gray-400 mt-0.5">Aparece grande na abertura da página.</p>
                  <input
                    ref={heroInputRef}
                    id="heroImage"
                    type="file"
                    accept="image/*"
                    className="sr-only"
                    onFocus={focusOn('hero')}
                    onChange={(e) => {
                      handleHeroUpload(e.target.files);
                      e.target.value = '';
                    }}
                  />
                  {heroImageValue ? (
                    <div className="mt-2 flex items-center gap-4 p-3 rounded-lg border border-gray-200 bg-white">
                      <img src={heroImageValue} alt="Foto principal" className="h-20 w-20 rounded-md object-cover" />
                      <div className="flex flex-col gap-2">
                        <Button type="button" variant="outline" size="sm" className="gap-2" onClick={() => { focusOn('hero')(); heroInputRef.current?.click(); }}>
                          <Upload className="h-4 w-4" />
                          Trocar foto
                        </Button>
                        <Button type="button" variant="ghost" size="sm" className="gap-2 text-gray-500" onClick={() => setValue('heroImage', '')}>
                          <X className="h-4 w-4" />
                          Remover
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => { focusOn('hero')(); heroInputRef.current?.click(); }}
                      className="mt-2 w-full flex flex-col items-center justify-center gap-2 h-32 rounded-lg border-2 border-dashed border-gray-200 hover:border-rose-300 hover:bg-rose-50/40 transition-colors text-gray-500"
                    >
                      {isUploadingHero ? (
                        <Loader2 className="h-6 w-6 animate-spin text-rose-500" />
                      ) : (
                        <ImagePlus className="h-6 w-6 text-rose-500" />
                      )}
                      <span className="text-sm font-medium text-gray-700">
                        {isUploadingHero ? 'Preparando a foto...' : 'Clique para enviar a foto principal'}
                      </span>
                      <span className="text-xs">JPG ou PNG, até 15 MB</span>
                    </button>
                  )}
                </div>

              </div>
            </motion.div>
          )}

          {/* Step 3: The letter and the details */}
          {currentStep === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div className="text-center mb-8">
                <h2 className="text-2xl font-title font-semibold text-gray-800">
                  Conte sua história
                </h2>
                <p className="text-gray-500 text-sm mt-1">
                  A carta e os detalhes que deixam a página única
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="message">Sua Mensagem</Label>
                  <Textarea
                    id="message"
                    placeholder="Escreva sua mensagem de carinho aqui..."
                    rows={6}
                    {...register('message')}
                    onFocus={focusOn('message')}
                    className="mt-1.5 resize-none"
                  />
                  <p className="text-xs text-gray-400 mt-1">
                    Dica: Use **texto** para destacar frases importantes
                  </p>
                </div>


                {/* Time-together counter */}
                <div className="rounded-xl border border-gray-100 bg-white p-4">
                  <Label htmlFor="counterDate">Contador de tempo (opcional)</Label>
                  <p className="text-xs text-gray-400 mt-0.5">
                    Uma data especial: o dia em que se conheceram, o casamento, o nascimento. A página mostra o tempo
                    passando ao vivo. Se a data for no futuro, vira uma contagem regressiva.
                  </p>
                  <div className="mt-3 grid sm:grid-cols-[180px_1fr] gap-3">
                    <Input
                      id="counterDate"
                      type="date"
                      {...register('counterDate')}
                      onFocus={focusOn('counter')}
                    />
                    <Input
                      id="counterLabel"
                      placeholder="Juntos há"
                      maxLength={40}
                      list="counter-labels"
                      aria-label="Frase do contador"
                      {...register('counterLabel')}
                      onFocus={focusOn('counter')}
                    />
                    <datalist id="counter-labels">
                      <option value="Juntos há" />
                      <option value="Sendo a melhor mãe do mundo há" />
                      <option value="Sendo o melhor pai do mundo há" />
                      <option value="Casados há" />
                      <option value="Te amo há" />
                      <option value="Você chegou há" />
                      <option value="Amigos há" />
                      <option value="Saudade há" />
                    </datalist>
                  </div>
                </div>

                {/* Reasons to love */}
                <div className="rounded-xl border border-gray-100 bg-white p-4">
                  <Label>Motivos para te amar (opcional)</Label>
                  <p className="text-xs text-gray-400 mt-0.5">
                    Cada motivo vira um cartão que a pessoa toca para descobrir. Até 12.
                  </p>
                  <div className="mt-3 space-y-2">
                    {reasons.map((reason, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <span className="shrink-0 w-7 h-7 rounded-full bg-rose-50 text-rose-600 text-xs font-semibold flex items-center justify-center">
                          {i + 1}
                        </span>
                        <Input
                          value={reason}
                          maxLength={160}
                          placeholder={REASON_PLACEHOLDERS[i % REASON_PLACEHOLDERS.length]}
                          aria-label={`Motivo ${i + 1}`}
                          onFocus={focusOn('reasons')}
                          onChange={(e) => setReasons((prev) => prev.map((r, j) => (j === i ? e.target.value : r)))}
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          aria-label={`Remover motivo ${i + 1}`}
                          onClick={() => setReasons((prev) => prev.filter((_, j) => j !== i))}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                  {reasons.length < 12 && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="mt-3 gap-2"
                      onClick={() => {
                        setReasons((prev) => [...prev, '']);
                        setPreviewFocus('reasons');
                      }}
                    >
                      <Plus className="h-4 w-4" />
                      Adicionar motivo
                    </Button>
                  )}
                </div>

                {/* Message wall */}
                <label className="flex items-start gap-3 rounded-xl border border-gray-100 bg-white p-4 cursor-pointer" onFocus={focusOn('guestbook')}>
                  <input
                    type="checkbox"
                    checked={guestbook}
                    onChange={(e) => {
                      setGuestbook(e.target.checked);
                      setPreviewFocus('guestbook');
                    }}
                    className="mt-1 h-4 w-4 accent-rose-500"
                  />
                  <span>
                    <span className="block font-medium text-gray-800">Mural de recados</span>
                    <span className="block text-xs text-gray-400 mt-0.5">
                      Família e amigos podem deixar mensagens na página depois que ela for publicada.
                    </span>
                  </span>
                </label>

                <div>
                  <Label htmlFor="closingMessage">Mensagem de Encerramento (opcional)</Label>
                  <Textarea
                    id="closingMessage"
                    placeholder="Para sempre no meu coração..."
                    rows={2}
                    {...register('closingMessage')}
                    onFocus={focusOn('closing')}
                    className="mt-1.5 resize-none"
                  />
                </div>
              </div>
            </motion.div>
          )}

          {/* Step 4: Photos */}
          {currentStep === 4 && (
            <motion.div
              key="step4"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div className="text-center mb-8">
                <h2 className="text-2xl font-title font-semibold text-gray-800">
                  Adicionar Fotos
                </h2>
                <p className="text-gray-500 text-sm mt-1">
                  {packageLimits && (
                    <>
                      Envie até {packageLimits.momentsPhotos === 999 ? 'ilimitadas' : packageLimits.momentsPhotos} fotos
                      {packageLimits.momentsPhotos !== 999 && ` (${photos.length}/${packageLimits.momentsPhotos} enviadas)`}
                    </>
                  )}
                </p>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={(e) => handlePhotoUpload(e.target.files)}
                disabled={!packageLimits || photos.length >= packageLimits.momentsPhotos}
              />

              {/* Upload area */}
              {packageLimits && photos.length < packageLimits.momentsPhotos && (
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-gray-200 rounded-xl p-8 text-center cursor-pointer hover:border-gray-300 transition-colors"
                >
                  <Upload className="h-10 w-10 mx-auto text-gray-300 mb-3" />
                  <p className="text-gray-600 font-medium">
                    Clique para enviar ou arraste e solte
                  </p>
                  <p className="text-gray-400 text-sm mt-1">
                    PNG, JPG até 10MB cada
                  </p>
                </div>
              )}

              {/* Photo limit reached message */}
              {packageLimits && photos.length >= packageLimits.momentsPhotos && packageLimits.momentsPhotos !== 999 && (
                <div className="bg-rose-50 border border-rose-100 rounded-xl p-4 text-center">
                  <p className="text-rose-700 text-sm">
                    Você atingiu o limite de {packageLimits.momentsPhotos} fotos do plano {getPackage(selectedPackage!).displayName}.
                  </p>
                </div>
              )}

              {/* Photo list */}
              {photos.length > 0 && (
                <div className="space-y-3">
                  {photos.map((photo, index) => (
                    <Card key={photo.id} className="overflow-hidden">
                      <CardContent className="p-3">
                        <div className="flex gap-3">
                          <div className="w-20 h-20 rounded-lg overflow-hidden bg-gray-100 shrink-0">
                            <img
                              src={photo.url}
                              alt=""
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <Input
                              placeholder="Adicione uma legenda..."
                              value={photo.caption}
                              onChange={(e) => updatePhotoCaption(photo.id, e.target.value)}
                              className="mb-2"
                            />
                            <p className="text-xs text-gray-400">Foto {index + 1}</p>
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => removePhoto(photo.id)}
                            className="text-gray-400 hover:text-red-500"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}

              <p className="text-center text-gray-400 text-sm">
                Você pode pular esta etapa se não quiser adicionar fotos
              </p>
            </motion.div>
          )}

          {/* Step 5: Timeline */}
          {currentStep === 5 && (
            <motion.div
              key="step5"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              {/* Hidden file input for timeline images */}
              <input
                ref={timelineImageInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => processTimelineImage(e.target.files)}
              />

              <div className="text-center mb-8">
                <h2 className="text-2xl font-title font-semibold text-gray-800">
                  Criar Timeline
                </h2>
                <p className="text-gray-500 text-sm mt-1">
                  {packageLimits && (
                    <>
                      {packageLimits.timelineMoments === 999 ? 'Adicione quantos momentos especiais quiser' : `Adicione até ${packageLimits.timelineMoments} momentos especiais`}
                      {packageLimits.timelineMoments !== 999 && ` (${timelineItems.length}/${packageLimits.timelineMoments} adicionados)`}
                    </>
                  )}
                </p>
              </div>

              {/* Timeline items */}
              {timelineItems.length > 0 && (
                <div className="space-y-4">
                  {timelineItems.map((item, index) => (
                    <Card key={item.id} className="overflow-hidden">
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                          <div
                            className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-semibold shrink-0"
                            style={{ backgroundColor: accentColor }}
                          >
                            {index + 1}
                          </div>
                          <div className="flex-1 space-y-3">
                            <div className="grid grid-cols-2 gap-3">
                              <div>
                                <Label className="text-xs">Ano/Data</Label>
                                <Input
                                  placeholder="2024"
                                  value={item.year}
                                  onChange={(e) => updateTimelineItem(item.id, 'year', e.target.value)}
                                  className="mt-1"
                                />
                              </div>
                              <div>
                                <Label className="text-xs">Título</Label>
                                <Input
                                  placeholder="Primeiro encontro"
                                  value={item.title}
                                  onChange={(e) => updateTimelineItem(item.id, 'title', e.target.value)}
                                  className="mt-1"
                                />
                              </div>
                            </div>
                            <div>
                              <Label className="text-xs">Descrição</Label>
                              <Textarea
                                placeholder="Uma breve descrição..."
                                value={item.description}
                                onChange={(e) => updateTimelineItem(item.id, 'description', e.target.value)}
                                className="mt-1 resize-none"
                                rows={2}
                              />
                            </div>
                            {/* Image upload for timeline */}
                            {packageLimits?.timelineImages && (
                              <div>
                                <Label className="text-xs">Imagem (opcional)</Label>
                                {item.imageUrl ? (
                                  <div className="mt-2 relative inline-block">
                                    <img
                                      src={item.imageUrl}
                                      alt="Preview"
                                      className="w-24 h-24 object-cover rounded-lg"
                                    />
                                    <Button
                                      type="button"
                                      variant="destructive"
                                      size="icon"
                                      className="absolute -top-2 -right-2 h-6 w-6"
                                      onClick={() => removeTimelineImage(item.id)}
                                    >
                                      <X className="h-3 w-3" />
                                    </Button>
                                  </div>
                                ) : (
                                  <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    className="mt-2 gap-2"
                                    onClick={() => handleTimelineImageUpload(item.id)}
                                  >
                                    <Upload className="h-4 w-4" />
                                    Enviar Imagem
                                  </Button>
                                )}
                              </div>
                            )}
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => removeTimelineItem(item.id)}
                            className="text-gray-400 hover:text-red-500"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}

              {/* Add button */}
              {packageLimits && timelineItems.length < packageLimits.timelineMoments && (
                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  onClick={addTimelineItem}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Adicionar Momento
                </Button>
              )}

              {/* Limit reached message */}
              {packageLimits && timelineItems.length >= packageLimits.timelineMoments && packageLimits.timelineMoments !== 999 && (
                <div className="bg-rose-50 border border-rose-100 rounded-xl p-4 text-center">
                  <p className="text-rose-700 text-sm">
                    Você atingiu o limite de {packageLimits.timelineMoments} momentos do plano {getPackage(selectedPackage!).displayName}.
                  </p>
                </div>
              )}

              {/* Show upgrade hint if package doesn't allow timeline images */}
              {packageLimits && !packageLimits.timelineImages && (
                <div className="bg-rose-50 border border-rose-100 rounded-xl p-4 text-center">
                  <p className="text-rose-700 text-sm">
                    💡 Escolha o pacote Completo para adicionar imagens aos momentos da timeline.
                  </p>
                </div>
              )}

              <p className="text-center text-gray-400 text-sm">
                Você pode pular esta etapa se não quiser uma timeline
              </p>
            </motion.div>
          )}

          {/* Step 6: Voice message */}
          {currentStep === 6 && (
            <motion.div
              key="step6"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div className="text-center mb-8">
                <h2 className="text-2xl font-title font-semibold text-gray-800">
                  Mensagem de voz
                </h2>
                <p className="text-gray-500 text-sm mt-1">
                  Grave até 2 minutos com a sua voz. Quem recebe ouve na própria página (opcional)
                </p>
              </div>

              {packageLimits && !packageLimits.music ? (
                <div className="bg-rose-50 border border-rose-100 rounded-xl p-6 text-center">
                  <Mic className="h-12 w-12 mx-auto text-rose-300 mb-4" />
                  <h3 className="text-lg font-medium text-rose-700 mb-2">
                    Mensagem de voz não disponível no plano {getPackage(selectedPackage!).displayName}
                  </h3>
                  <p className="text-rose-700 text-sm mb-4">
                    Escolha o pacote Completo para gravar uma mensagem com a sua voz.
                  </p>
                  <Button
                    type="button"
                    variant="outline"
                    className="border-rose-500 text-rose-500 hover:bg-rose-100"
                    onClick={() => setCurrentStep(0)}
                  >
                    Ver Planos
                  </Button>
                </div>
              ) : (
                <>
                  <VoiceRecorder value={voiceMessage} onChange={setVoiceMessage} onFocus={focusOn('voice')} />
                  <p className="text-center text-gray-400 text-sm">
                    Quando a pessoa der play na sua voz, a música de fundo abaixa sozinha.
                  </p>
                  <p className="text-center text-gray-400 text-sm">
                    Você pode pular esta etapa se não quiser gravar
                  </p>
                </>
              )}
            </motion.div>
          )}

          {/* Step 7: Music */}
          {currentStep === 7 && (
            <motion.div
              key="step7"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div className="text-center mb-8">
                <h2 className="text-2xl font-title font-semibold text-gray-800">
                  Adicionar Música
                </h2>
                <p className="text-gray-500 text-sm mt-1">
                  Defina o clima com música de fundo (opcional)
                </p>
              </div>

              {/* Check if music is allowed */}
              {packageLimits && !packageLimits.music ? (
                <div className="bg-rose-50 border border-rose-100 rounded-xl p-6 text-center">
                  <Music className="h-12 w-12 mx-auto text-rose-300 mb-4" />
                  <h3 className="text-lg font-medium text-rose-700 mb-2">
                    Música não disponível no plano {getPackage(selectedPackage!).displayName}
                  </h3>
                  <p className="text-rose-700 text-sm mb-4">
                    Escolha o pacote Completo para adicionar música de fundo à sua homenagem.
                  </p>
                  <Button
                    type="button"
                    variant="outline"
                    className="border-rose-500 text-rose-500 hover:bg-rose-100"
                    onClick={() => setCurrentStep(0)}
                  >
                    Ver Planos
                  </Button>
                </div>
              ) : (
                <>
                  {/* Hidden audio element for preview */}
                  <audio
                    ref={audioRef}
                    src={(musicFile?.url || (musicUrlValue && !isYouTubeUrl(musicUrlValue) ? musicUrlValue : '')) || undefined}
                    onEnded={() => setIsPlaying(false)}
                  />

                  {/* Input type toggle */}
                  <Tabs
                    value={musicInputType}
                    onValueChange={(v) => setMusicInputType(v as 'upload' | 'url')}
                    className="w-full"
                  >
                    <TabsList className="w-full grid grid-cols-2 mb-4">
                      <TabsTrigger value="upload" className="gap-2">
                        <Upload className="h-4 w-4" />
                        Enviar Arquivo
                      </TabsTrigger>
                      <TabsTrigger value="url" className="gap-2">
                        <LinkIcon className="h-4 w-4" />
                        Link URL
                      </TabsTrigger>
                    </TabsList>

                    <TabsContent value="upload" className="mt-0">
                      {/* Hidden file input */}
                      <input
                        ref={musicInputRef}
                        type="file"
                        accept="audio/*"
                        className="hidden"
                        onChange={(e) => handleMusicUpload(e.target.files)}
                        disabled={isUploadingMusic}
                      />

                      {isUploadingMusic ? (
                        /* Loading state */
                        <div className="border-2 border-dashed border-gray-200 rounded-xl p-8 text-center">
                          <Loader2 className="h-12 w-12 mx-auto text-gray-300 mb-3 animate-spin" />
                          <p className="text-gray-600 font-medium mb-1">
                            Processando arquivo de áudio...
                          </p>
                          <p className="text-gray-400 text-sm">
                            Por favor, aguarde enquanto preparamos sua música
                          </p>
                        </div>
                      ) : !musicFile ? (
                        /* Upload area */
                        <div
                          onClick={() => musicInputRef.current?.click()}
                          className="border-2 border-dashed border-gray-200 rounded-xl p-8 text-center cursor-pointer hover:border-gray-300 transition-colors"
                        >
                          <FileAudio className="h-12 w-12 mx-auto text-gray-300 mb-3" />
                          <p className="text-gray-600 font-medium mb-1">
                            Clique para enviar música
                          </p>
                          <p className="text-gray-400 text-sm">
                            MP3, WAV até 10MB
                          </p>
                        </div>
                      ) : (
                        /* Uploaded music preview */
                        <Card className="overflow-hidden">
                          <CardContent className="p-4">
                            <div className="flex items-center gap-4">
                              <Button
                                type="button"
                                size="icon"
                                onClick={togglePlayMusic}
                                className="shrink-0 bg-rose-500 hover:bg-rose-600"
                              >
                                {isPlaying ? (
                                  <Pause className="h-5 w-5 text-white" />
                                ) : (
                                  <Play className="h-5 w-5 text-white ml-0.5" />
                                )}
                              </Button>
                              <div className="flex-1 min-w-0">
                                <p className="font-medium text-gray-800 truncate">
                                  {musicFile.name}
                                </p>
                                <p className="text-xs text-gray-400">
                                  Arquivo de música enviado
                                </p>
                              </div>
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                onClick={removeMusic}
                                className="text-gray-400 hover:text-red-500"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      )}
                    </TabsContent>

                    <TabsContent value="url" className="mt-0">
                      <div className="space-y-3">
                        <div>
                          <Label htmlFor="musicUrl">Link da música</Label>
                          <Input
                            id="musicUrl"
                            placeholder="https://www.youtube.com/watch?v=..."
                            inputMode="url"
                            autoComplete="off"
                            {...register('musicUrl')}
                            className="mt-1.5"
                          />
                          <p className="text-xs text-gray-400 mt-1">
                            Cole o link da música no YouTube (no app: Compartilhar → Copiar link)
                          </p>
                        </div>

                        {musicUrlValue && musicUrlValue.trim() && !musicUrlValue.startsWith('data:') && (() => {
                          const parsed = parseMusicLink(musicUrlValue);
                          if (!parsed.ok) {
                            return (
                              <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
                                {parsed.error}
                              </p>
                            );
                          }
                          const link = parsed.link;
                          return (
                            <Card className="overflow-hidden">
                              <CardContent className="p-4">
                                <div className="flex items-center gap-4">
                                  {link.kind === 'youtube' ? (
                                    <img
                                      src={`https://i.ytimg.com/vi/${link.videoId}/mqdefault.jpg`}
                                      alt=""
                                      className="shrink-0 w-20 h-12 rounded-md object-cover bg-gray-100"
                                    />
                                  ) : (
                                    <Button
                                      type="button"
                                      size="icon"
                                      onClick={togglePlayMusic}
                                      className="shrink-0 bg-rose-500 hover:bg-rose-600"
                                    >
                                      {isPlaying ? (
                                        <Pause className="h-5 w-5 text-white" />
                                      ) : (
                                        <Play className="h-5 w-5 text-white ml-0.5" />
                                      )}
                                    </Button>
                                  )}
                                  <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-gray-800 truncate">
                                      {link.kind === 'youtube' ? 'Música do YouTube' : 'Arquivo de áudio'}
                                    </p>
                                    <p className="text-xs text-green-600 truncate">
                                      Vai tocar na homenagem · confira na pré-visualização
                                    </p>
                                  </div>
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => setValue('musicUrl', '')}
                                    className="text-gray-400 hover:text-red-500"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              </CardContent>
                            </Card>
                          );
                        })()}
                      </div>
                    </TabsContent>
                  </Tabs>

                  <div>
                    <Label htmlFor="musicTitle">Nome da música (opcional)</Label>
                    <Input
                      id="musicTitle"
                      placeholder="Ex.: Como é grande o meu amor por você"
                      maxLength={80}
                      value={musicTitle}
                      onChange={(e) => setMusicTitle(e.target.value)}
                      className="mt-1.5"
                    />
                    <p className="text-xs text-gray-400 mt-1">
                      Aparece na faixa da música, embaixo da página. Se deixar em branco, fica "Nossa música".
                    </p>
                  </div>

                  {/* Tips */}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-sm text-gray-600 mb-2">
                      🎵 Dicas para música:
                    </p>
                    <ul className="text-xs text-gray-500 space-y-1">
                      <li>• Envie um arquivo MP3 ou cole o link da música no YouTube</li>
                      <li>• Considere direitos autorais ao escolher a música</li>
                      <li>• Alguns navegadores podem bloquear reprodução automática</li>
                      <li>• Mantenha o arquivo abaixo de 10MB para melhor performance</li>
                    </ul>
                  </div>

                  <p className="text-center text-gray-400 text-sm">
                    Você pode pular esta etapa se não quiser música
                  </p>
                </>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Error message */}
        {error && currentStep !== 0 && (
          <div className="mt-4 p-4 bg-red-50 rounded-lg text-red-600 text-sm">
            {error}
          </div>
        )}

        {/* Navigation sits at the end of each step, on phones too, so moving on means having
            scrolled past everything the step asks for. */}
        <div ref={setNavEl} className="flex items-center justify-between gap-2 mt-8 pt-6 border-t">
          <Button
            type="button"
            variant="ghost"
            onClick={prevStep}
            disabled={currentStep === 0}
            className="gap-2"
          >
            <ChevronLeft className="h-4 w-4" />
            Voltar
          </Button>

          {/* On phones the preview button joins this row instead of floating over it */}
          {currentStep >= 1 && (
            <Button
              type="button"
              variant="outline"
              onClick={() => setPreviewOpen(true)}
              data-tour="preview"
              className="lg:hidden gap-1.5 text-rose-600 border-rose-200"
            >
              <Eye className="h-4 w-4" />
              Prévia
            </Button>
          )}

          {currentStep < steps.length - 1 ? (
            <Button
              type="button"
              data-tour="continue"
              onClick={goNext}
              className="bg-rose-500 hover:bg-rose-600 gap-2"
            >
              Próximo
              <ChevronRight className="h-4 w-4" />
            </Button>
          ) : (
            <Button
              type="button"
              onClick={() => handleSubmit(onSubmit)()}
              disabled={isSubmitting}
              className="bg-rose-500 hover:bg-rose-600 gap-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Criando...
                </>
              ) : (
                <>
                  <Heart className="h-4 w-4" />
                  Gerar prévia
                </>
              )}
            </Button>
          )}
        </div>
      </form>
    </div>

    {!navOnScreen && (
      <button
        type="button"
        data-tour="continue"
        onClick={continueDown}
        className="fixed bottom-6 left-4 lg:left-[calc(50%-10rem)] lg:-translate-x-1/2 z-40 inline-flex items-center gap-2 h-11 pl-5 pr-4 rounded-full bg-white text-rose-600 text-sm font-semibold shadow-lg ring-1 ring-rose-200 hover:bg-rose-50"
      >
        Continuar
        <ChevronDown className="h-4 w-4 animate-bounce" />
      </button>
    )}

    {showTour && (
      <CoachMarks
        onDone={endTour}
        marks={[
          {
            target: 'preview',
            title: 'Veja como está ficando',
            text: 'Toque em "Ver prévia" depois de cada escolha para ver a página exatamente como a pessoa vai receber.',
          },
          {
            target: 'continue',
            title: 'Siga pela etapa',
            text: 'O "Continuar" desce até o próximo campo. No fim da etapa aparece o "Próximo" para seguir.',
          },
        ]}
      />
    )}

    {currentStep >= 1 && <LivePreview config={previewConfig} focus={previewFocus} accentColor={accentColor} open={previewOpen} onOpenChange={setPreviewOpen} hideButton={navOnScreen} />}
    </div>
  );
}

// Template grid component
interface TemplateGridProps {
  templates: TemplateStyleConfig[];
  selectedId: string;
  onSelect: (id: string) => void;
}

const EFFECTS: Record<string, { label: string; icon: typeof Heart }> = {
  hearts: { label: 'Corações flutuando', icon: Heart },
  petals: { label: 'Pétalas caindo', icon: Flower2 },
  sparkles: { label: 'Brilhos', icon: Sparkles },
  stars: { label: 'Estrelas', icon: Star },
  particles: { label: 'Luzes suaves', icon: CircleDot },
};

// The occasions as a plain list of clickable rectangles; colour is chosen separately.
function TemplateGrid({ templates, selectedId, onSelect }: TemplateGridProps) {
  return (
    <div role="radiogroup" aria-label="Ocasião" className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      {templates.map((template) => {
        const selected = selectedId === template.name;
        const effect = EFFECTS[template.backgroundAnimation.type] ?? EFFECTS.hearts;
        return (
          <button
            key={template.name}
            type="button"
            role="radio"
            aria-checked={selected}
            onClick={() => onSelect(template.name)}
            className={`group relative flex items-start gap-4 rounded-xl border-2 bg-white p-4 text-left transition-colors ${
              selected ? 'border-rose-500 bg-rose-50/40' : 'border-gray-100 hover:border-rose-200'
            }`}
          >
            <span
              className={`shrink-0 w-11 h-11 rounded-full flex items-center justify-center transition-colors ${
                selected ? 'bg-rose-500 text-white' : 'bg-rose-50 text-rose-500 group-hover:bg-rose-100'
              }`}
            >
              <effect.icon className="h-5 w-5" />
            </span>
            <span className="flex-1 min-w-0">
              <span className="block font-semibold text-gray-800">{template.displayName}</span>
              <span className="block text-sm text-gray-500 mt-0.5">{(template as TemplateStyleConfig & { description?: string }).description}</span>
              <span className="block text-xs text-rose-600 mt-1.5">{effect.label}</span>
            </span>
            <span
              className={`shrink-0 mt-1 w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                selected ? 'border-rose-500 bg-rose-500' : 'border-gray-300'
              }`}
              aria-hidden="true"
            >
              {selected && <Check className="h-3 w-3 text-white" />}
            </span>
          </button>
        );
      })}
    </div>
  );
}
