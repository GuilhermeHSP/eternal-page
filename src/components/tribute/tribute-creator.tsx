'use client';

import { useState, useRef, useEffect } from 'react';
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
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { templateList, categories } from '@/lib/templates';
import { TemplateStyleConfig, PackageType } from '@/types/tribute';
import { PACKAGES, PACKAGE_LIST, formatPrice, getPackage } from '@/lib/packages';

const tributeSchema = z.object({
  title: z.string().min(1, 'O título é obrigatório').max(100),
  recipient: z.string().min(1, 'O nome do homenageado é obrigatório').max(50),
  templateId: z.string().min(1, 'Por favor, selecione um template'),
  message: z.string().max(2000).optional(),
  heroImage: z.string().optional(),
  musicUrl: z.string().optional(),
  closingMessage: z.string().max(500).optional(),
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
const steps = [
  { id: 0, title: 'Plano', icon: Package },
  { id: 1, title: 'Template', icon: Sparkles },
  { id: 2, title: 'Dados', icon: Heart },
  { id: 3, title: 'Fotos', icon: ImagePlus },
  { id: 4, title: 'Timeline', icon: Calendar },
  { id: 5, title: 'Música', icon: Music },
];

interface TributeCreatorProps {
  editDraftId?: string | null;
  initialRecipient?: string;
  initialTemplateId?: string;
}

export function TributeCreator({ editDraftId, initialRecipient, initialTemplateId }: TributeCreatorProps) {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState<PackageType | null>(null);
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
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(tributeSchema),
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
          if (data.musicUrl) {
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

  // Get package limits
  const packageLimits = selectedPackage ? getPackage(selectedPackage).limits : null;

  const handlePhotoUpload = async (files: FileList | null) => {
    if (!files || !packageLimits) return;

    const maxPhotos = packageLimits.momentsPhotos;
    const newPhotos: PhotoItem[] = [];
    for (let i = 0; i < Math.min(files.length, maxPhotos - photos.length); i++) {
      const file = files[i];
      const url = URL.createObjectURL(file);
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
      const finalMusicTitle = musicFile?.name || '';

      // Prepare payload for draft
      const payload = {
        draftId,
        title: data.title,
        recipient: data.recipient,
        templateId: data.templateId,
        message: data.message || '',
        heroImage: data.heroImage || '',
        musicUrl: finalMusicUrl,
        musicTitle: finalMusicTitle,
        closingMessage: data.closingMessage || '',
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
  const prevStep = () => setCurrentStep((prev) => Math.max(prev - 1, 0));

  // Scroll to top when step changes (for mobile UX)
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentStep]);

  // Get accent color based on current context
  const accentColor = selectedTemplate?.accentColor || '#ec4899';

  // Loading state for edit mode
  if (isLoading) {
    return (
      <div className="max-w-3xl mx-auto py-20 pb-24 md:pb-20 flex flex-col items-center justify-center">
        <div className="w-12 h-12 border-4 border-pink-500 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-gray-500">Carregando rascunho...</p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto pb-24 md:pb-0">
      {/* Progress Steps */}
      <div className="mb-8">
        <div className="flex items-center justify-between relative">
          <div className="absolute top-5 left-0 right-0 h-0.5 bg-gray-100">
            <motion.div
              className="h-full bg-pink-500"
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
                className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                  currentStep >= step.id
                    ? 'bg-pink-500 text-white'
                    : 'bg-gray-100 text-gray-400'
                }`}
              >
                <step.icon className="h-5 w-5" />
              </div>
              <span
                className={`text-xs mt-2 font-medium ${
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
                <h2 className="text-2xl font-serif font-medium text-gray-800">
                  Escolha seu Plano
                </h2>
                <p className="text-gray-500 text-sm mt-1">
                  Selecione o plano ideal para sua homenagem
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {PACKAGE_LIST.map((pkg) => (
                  <motion.div
                    key={pkg.id}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setSelectedPackage(pkg.id)}
                    className={`relative rounded-2xl overflow-hidden cursor-pointer transition-all ${
                      selectedPackage === pkg.id
                        ? 'ring-2 ring-pink-500 ring-offset-2'
                        : 'ring-1 ring-gray-200 hover:ring-gray-300'
                    } ${pkg.popular ? 'md:-mt-2 md:mb-2' : ''}`}
                  >
                    {/* Popular badge */}
                    {pkg.popular && (
                      <div className="absolute top-0 left-0 right-0 bg-pink-500 text-white text-xs font-medium py-1 text-center">
                        Mais Popular
                      </div>
                    )}

                    <div className={`bg-white p-6 ${pkg.popular ? 'pt-8' : ''}`}>
                      {/* Package name */}
                      <h3 className="text-lg font-semibold text-gray-800 mb-1">
                        {pkg.displayName}
                      </h3>
                      <p className="text-sm text-gray-500 mb-4">
                        {pkg.description}
                      </p>

                      {/* Price */}
                      <div className="mb-4">
                        <span className="text-3xl font-bold text-gray-900">
                          {formatPrice(pkg.price)}
                        </span>
                        <span className="text-gray-500 text-sm"> / único</span>
                      </div>

                      {/* Features */}
                      <ul className="space-y-2 mb-6">
                        {pkg.features.map((feature, idx) => (
                          <li key={idx} className="flex items-start gap-2 text-sm text-gray-600">
                            <Check className="h-4 w-4 text-pink-500 mt-0.5 shrink-0" />
                            {feature}
                          </li>
                        ))}
                      </ul>

                      {/* Select button */}
                      <Button
                        type="button"
                        variant={selectedPackage === pkg.id ? 'default' : 'outline'}
                        className={`w-full ${
                          selectedPackage === pkg.id
                            ? 'bg-pink-500 hover:bg-pink-600 text-white'
                            : 'border-pink-500 text-pink-500 hover:bg-pink-50'
                        }`}
                      >
                        {selectedPackage === pkg.id ? 'Selecionado' : 'Selecionar'}
                      </Button>
                    </div>
                  </motion.div>
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
                <h2 className="text-2xl font-serif font-medium text-gray-800">
                  Escolha um Template
                </h2>
                <p className="text-gray-500 text-sm mt-1">
                  Selecione um estilo para sua homenagem
                </p>
              </div>

              <Tabs defaultValue="all" className="w-full">
                <TabsList className="w-full justify-start flex-wrap h-auto gap-2 bg-transparent p-0 mb-6">
                  <TabsTrigger
                    value="all"
                    className="data-[state=active]:bg-gray-900 data-[state=active]:text-white"
                  >
                    Todos
                  </TabsTrigger>
                  {categories.map((cat) => (
                    <TabsTrigger
                      key={cat.id}
                      value={cat.id}
                      className="data-[state=active]:bg-gray-900 data-[state=active]:text-white"
                    >
                      {cat.icon} {cat.label}
                    </TabsTrigger>
                  ))}
                </TabsList>

                <TabsContent value="all" className="mt-0">
                  <TemplateGrid
                    templates={templateList}
                    selectedId={selectedTemplateId}
                    onSelect={(id) => setValue('templateId', id)}
                  />
                </TabsContent>
                {categories.map((cat) => (
                  <TabsContent key={cat.id} value={cat.id} className="mt-0">
                    <TemplateGrid
                      templates={templateList.filter((t) => t.category === cat.id)}
                      selectedId={selectedTemplateId}
                      onSelect={(id) => setValue('templateId', id)}
                    />
                  </TabsContent>
                ))}
              </Tabs>

              {errors.templateId && (
                <p className="text-sm text-red-500">{errors.templateId.message}</p>
              )}
            </motion.div>
          )}

          {/* Step 2: Basic Details */}
          {currentStep === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div className="text-center mb-8">
                <h2 className="text-2xl font-serif font-medium text-gray-800">
                  Conte sua História
                </h2>
                <p className="text-gray-500 text-sm mt-1">
                  Compartilhe os detalhes da sua homenagem
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="title">Título *</Label>
                  <Input
                    id="title"
                    placeholder="Para a melhor mãe do mundo ❤️"
                    {...register('title')}
                    className="mt-1.5"
                  />
                  {errors.title && (
                    <p className="text-sm text-red-500 mt-1">{errors.title.message}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="recipient">Nome do Homenageado *</Label>
                  <Input
                    id="recipient"
                    placeholder="Maria"
                    {...register('recipient')}
                    className="mt-1.5"
                  />
                  {errors.recipient && (
                    <p className="text-sm text-red-500 mt-1">{errors.recipient.message}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="message">Sua Mensagem</Label>
                  <Textarea
                    id="message"
                    placeholder="Escreva sua mensagem de carinho aqui..."
                    rows={6}
                    {...register('message')}
                    className="mt-1.5 resize-none"
                  />
                  <p className="text-xs text-gray-400 mt-1">
                    Dica: Use **texto** para destacar frases importantes
                  </p>
                </div>

                <div>
                  <Label htmlFor="heroImage">URL da Imagem Principal (opcional)</Label>
                  <Input
                    id="heroImage"
                    placeholder="https://exemplo.com/imagem.jpg"
                    {...register('heroImage')}
                    className="mt-1.5"
                  />
                </div>

                <div>
                  <Label htmlFor="closingMessage">Mensagem de Encerramento (opcional)</Label>
                  <Textarea
                    id="closingMessage"
                    placeholder="Para sempre no meu coração..."
                    rows={2}
                    {...register('closingMessage')}
                    className="mt-1.5 resize-none"
                  />
                </div>
              </div>
            </motion.div>
          )}

          {/* Step 3: Photos */}
          {currentStep === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div className="text-center mb-8">
                <h2 className="text-2xl font-serif font-medium text-gray-800">
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
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-center">
                  <p className="text-amber-700 text-sm">
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

          {/* Step 4: Timeline */}
          {currentStep === 4 && (
            <motion.div
              key="step4"
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
                <h2 className="text-2xl font-serif font-medium text-gray-800">
                  Criar Timeline
                </h2>
                <p className="text-gray-500 text-sm mt-1">
                  {packageLimits && (
                    <>
                      Adicione até {packageLimits.timelineMoments === 999 ? 'ilimitados' : packageLimits.timelineMoments} momentos especiais
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
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-center">
                  <p className="text-amber-700 text-sm">
                    Você atingiu o limite de {packageLimits.timelineMoments} momentos do plano {getPackage(selectedPackage!).displayName}.
                  </p>
                </div>
              )}

              {/* Show upgrade hint if package doesn't allow timeline images */}
              {packageLimits && !packageLimits.timelineImages && (
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-center">
                  <p className="text-blue-700 text-sm">
                    💡 Faça upgrade para o plano Plus ou Premium para adicionar imagens aos momentos da timeline.
                  </p>
                </div>
              )}

              <p className="text-center text-gray-400 text-sm">
                Você pode pular esta etapa se não quiser uma timeline
              </p>
            </motion.div>
          )}

          {/* Step 5: Music */}
          {currentStep === 5 && (
            <motion.div
              key="step5"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div className="text-center mb-8">
                <h2 className="text-2xl font-serif font-medium text-gray-800">
                  Adicionar Música
                </h2>
                <p className="text-gray-500 text-sm mt-1">
                  Defina o clima com música de fundo (opcional)
                </p>
              </div>

              {/* Check if music is allowed */}
              {packageLimits && !packageLimits.music ? (
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 text-center">
                  <Music className="h-12 w-12 mx-auto text-blue-300 mb-4" />
                  <h3 className="text-lg font-medium text-blue-800 mb-2">
                    Música não disponível no plano {getPackage(selectedPackage!).displayName}
                  </h3>
                  <p className="text-blue-600 text-sm mb-4">
                    Faça upgrade para o plano Plus ou Premium para adicionar música de fundo à sua homenagem.
                  </p>
                  <Button
                    type="button"
                    variant="outline"
                    className="border-blue-500 text-blue-500 hover:bg-blue-100"
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
                    src={(musicFile?.url || musicUrlValue) || undefined}
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
                                className="shrink-0 bg-pink-500 hover:bg-pink-600"
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
                          <Label htmlFor="musicUrl">URL da Música</Label>
                          <Input
                            id="musicUrl"
                            placeholder="https://exemplo.com/musica.mp3"
                            {...register('musicUrl')}
                            className="mt-1.5"
                          />
                          <p className="text-xs text-gray-400 mt-1">
                            Link direto para um arquivo MP3
                          </p>
                        </div>

                        {/* Preview for URL */}
                        {musicUrlValue && (
                          <Card className="overflow-hidden">
                            <CardContent className="p-4">
                              <div className="flex items-center gap-4">
                                <Button
                                  type="button"
                                  size="icon"
                                  onClick={togglePlayMusic}
                                  className="shrink-0 bg-pink-500 hover:bg-pink-600"
                                >
                                  {isPlaying ? (
                                    <Pause className="h-5 w-5 text-white" />
                                  ) : (
                                    <Play className="h-5 w-5 text-white ml-0.5" />
                                  )}
                                </Button>
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm text-gray-800 truncate">
                                    Arquivo de áudio
                                  </p>
                                  <p className="text-xs text-gray-400 truncate">
                                    {musicUrlValue}
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
                        )}
                      </div>
                    </TabsContent>
                  </Tabs>

                  {/* Tips */}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-sm text-gray-600 mb-2">
                      🎵 Dicas para música:
                    </p>
                    <ul className="text-xs text-gray-500 space-y-1">
                      <li>• Envie um arquivo MP3 ou cole um link direto</li>
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

        {/* Navigation - Hidden on mobile, shown on desktop */}
        <div className="hidden md:flex justify-between mt-8 pt-6 border-t">
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

          {currentStep < steps.length - 1 ? (
            <Button
              type="button"
              onClick={() => {
                // Validate step 0 before proceeding
                if (currentStep === 0 && !selectedPackage) {
                  setError('Por favor, selecione um plano para continuar.');
                  return;
                }
                setError(null);
                nextStep();
              }}
              className="bg-pink-500 hover:bg-pink-600 gap-2"
            >
              Próximo
              <ChevronRight className="h-4 w-4" />
            </Button>
          ) : (
            <div className="flex gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={prevStep}
                className="gap-2"
              >
                <ChevronLeft className="h-4 w-4" />
                Voltar
              </Button>
              <Button
                type="button"
                onClick={() => handleSubmit(onSubmit)()}
                disabled={isSubmitting}
                className="bg-pink-500 hover:bg-pink-600 gap-2"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Criando...
                  </>
                ) : (
                  <>
                    <Heart className="h-4 w-4" />
                    Gerar Preview
                  </>
                )}
              </Button>
            </div>
          )}
        </div>
      </form>

      {/* Fixed bottom navigation for mobile */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 md:hidden z-50">
        <div className="flex justify-between max-w-3xl mx-auto">
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

          {currentStep < steps.length - 1 ? (
            <Button
              type="button"
              onClick={() => {
                if (currentStep === 0 && !selectedPackage) {
                  setError('Por favor, selecione um plano para continuar.');
                  return;
                }
                setError(null);
                nextStep();
              }}
              className="bg-pink-500 hover:bg-pink-600 gap-2"
            >
              Próximo
              <ChevronRight className="h-4 w-4" />
            </Button>
          ) : (
            <Button
              type="button"
              disabled={isSubmitting}
              onClick={() => handleSubmit(onSubmit)()}
              className="bg-pink-500 hover:bg-pink-600 gap-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Criando...
                </>
              ) : (
                <>
                  <Heart className="h-4 w-4" />
                  Gerar Preview
                </>
              )}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

// Template grid component
interface TemplateGridProps {
  templates: TemplateStyleConfig[];
  selectedId: string;
  onSelect: (id: string) => void;
}

function TemplateGrid({ templates, selectedId, onSelect }: TemplateGridProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
      {templates.map((template) => (
        <motion.button
          key={template.name}
          type="button"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => onSelect(template.name)}
          className={`relative rounded-xl overflow-hidden text-left transition-all ${
            selectedId === template.name
              ? 'ring-2 ring-offset-2 ring-pink-500'
              : 'ring-1 ring-gray-200 hover:ring-gray-300'
          }`}
        >
          {/* Preview */}
          <div
            className="aspect-[4/3] relative"
            style={{ backgroundColor: template.backgroundColor }}
          >
            {/* Gradient preview */}
            <div
              className="absolute inset-0 opacity-50"
              style={{
                background: `linear-gradient(135deg, ${template.accentColor}30 0%, transparent 100%)`,
              }}
            />

            {/* Content preview */}
            <div className="absolute inset-0 flex flex-col items-center justify-center p-4">
              <div
                className="w-10 h-10 rounded-full mb-2"
                style={{ backgroundColor: `${template.accentColor}30` }}
              />
              <div
                className="h-2 w-16 rounded mb-1.5"
                style={{ backgroundColor: template.accentColor }}
              />
              <div className="h-1.5 w-12 rounded bg-gray-300" />
            </div>

            {/* Selected check */}
            {selectedId === template.name && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute top-2 right-2 w-6 h-6 rounded-full flex items-center justify-center bg-pink-500"
              >
                <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </motion.div>
            )}
          </div>

          {/* Info */}
          <div className="p-3 bg-white">
            <p className="font-medium text-sm text-gray-800">{template.displayName}</p>
            <p className="text-xs text-gray-500 mt-0.5">{template.category}</p>
          </div>
        </motion.button>
      ))}
    </div>
  );
}
