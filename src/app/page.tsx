'use client';

import { useState, Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSearchParams } from 'next/navigation';
import { 
  Heart, 
  Sparkles, 
  ImagePlus, 
  Music, 
  Share2, 
  ChevronRight,
  Star,
  Users,
  Clock
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { TributeCreator } from '@/components/tribute/tribute-creator';
import { templateList } from '@/lib/templates';

function HomePageContent() {
  const searchParams = useSearchParams();
  
  // Check for edit mode - derive from searchParams directly
  const editDraftId = searchParams.get('edit');
  const isEditMode = !!editDraftId;
  
  // Show creator automatically if in edit mode
  const [showCreator, setShowCreator] = useState(isEditMode);

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-white via-rose-50/30 to-white">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Heart className="h-6 w-6 text-rose-500" />
            <span className="font-serif text-xl font-semibold text-gray-800">
              EternalPage
            </span>
          </div>
          {/* Botão ocultado por enquanto - será usado futuramente */}
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 pt-16">
        <AnimatePresence mode="wait">
          {showCreator ? (
            <motion.div
              key="creator"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="py-12 px-4"
            >
              <TributeCreator editDraftId={editDraftId} />
            </motion.div>
          ) : (
            <motion.div
              key="landing"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              {/* Hero Section */}
              <section className="relative overflow-hidden">
                {/* Background decorations */}
                <div className="absolute inset-0 pointer-events-none">
                  <motion.div
                    animate={{
                      scale: [1, 1.1, 1],
                      opacity: [0.3, 0.4, 0.3],
                    }}
                    transition={{ duration: 6, repeat: Infinity }}
                    className="absolute -top-20 -right-20 w-96 h-96 bg-rose-200/30 rounded-full blur-3xl"
                  />
                  <motion.div
                    animate={{
                      scale: [1.1, 1, 1.1],
                      opacity: [0.2, 0.3, 0.2],
                    }}
                    transition={{ duration: 8, repeat: Infinity }}
                    className="absolute -bottom-32 -left-32 w-[500px] h-[500px] bg-purple-200/20 rounded-full blur-3xl"
                  />
                </div>

                <div className="max-w-4xl mx-auto px-4 pt-20 pb-16 relative">
                  {/* Badge */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="flex justify-center mb-6"
                  >
                    <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-rose-50 text-rose-600 text-sm font-medium">
                      <Sparkles className="h-4 w-4" />
                      Crie páginas de homenagem incríveis
                    </span>
                  </motion.div>

                  {/* Main headline */}
                  <motion.h1
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.1 }}
                    className="text-4xl md:text-6xl lg:text-7xl font-serif font-medium text-center text-gray-900 leading-tight mb-6"
                  >
                    Crie páginas de{' '}
                    <span className="text-rose-500">homenagem emocionantes</span>
                    <br />
                    em minutos
                  </motion.h1>

                  <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                    className="text-lg md:text-xl text-gray-500 text-center max-w-2xl mx-auto mb-10"
                  >
                    Crie páginas de homenagem personalizadas para quem você ama.
                    Adicione fotos, músicas, mensagens e compartilhe com um link único.
                  </motion.p>

                  {/* CTA buttons */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.3 }}
                    className="flex flex-col sm:flex-row items-center justify-center gap-4"
                  >
                    <Button
                      size="lg"
                      onClick={() => setShowCreator(true)}
                      className="gap-2 bg-rose-500 hover:bg-rose-600 text-white px-8 h-12"
                    >
                      <Heart className="h-5 w-5" />
                      Criar Sua Homenagem
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                    <Button
                      size="lg"
                      variant="outline"
                      className="gap-2 px-8 h-12"
                      asChild
                    >
                      <a href="/para-melhor-mae-demo" target="blank">
                        Ver Exemplo
                      </a>
                    </Button>
                  </motion.div>

                  {/* Stats */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.4 }}
                    className="flex items-center justify-center gap-8 mt-12 pt-8 border-t border-gray-100"
                  >
                    <div className="text-center">
                      <p className="text-2xl font-semibold text-gray-800 tabular-nums">1000+</p>
                      <p className="text-sm text-gray-500">Homenagens Criadas</p>
                    </div>
                    <div className="w-px h-10 bg-gray-200" />
                    <div className="text-center">
                      <p className="text-2xl font-semibold text-gray-800 tabular-nums">8</p>
                      <p className="text-sm text-gray-500">Templates</p>
                    </div>
                    <div className="w-px h-10 bg-gray-200" />
                    <div className="text-center">
                      <p className="text-2xl font-semibold text-gray-800 tabular-nums">Grátis</p>
                      <p className="text-sm text-gray-500">Para Começar</p>
                    </div>
                  </motion.div>
                </div>
              </section>

              {/* Features Section */}
              <section className="py-20 px-4 bg-white">
                <div className="max-w-5xl mx-auto">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="text-center mb-16"
                  >
                    <h2 className="text-3xl md:text-4xl font-serif font-medium text-gray-900 mb-4">
                      Tudo que você precisa
                    </h2>
                    <p className="text-gray-500 max-w-xl mx-auto">
                      Crie páginas de homenagem incríveis com todos os recursos necessários para expressar seu amor e gratidão.
                    </p>
                  </motion.div>

                  <div className="grid md:grid-cols-3 gap-8">
                    {[
                      {
                        icon: ImagePlus,
                        title: 'Galeria de Fotos',
                        description: 'Galerias de fotos estilo polaroid com legendas e efeitos de hover.',
                        color: 'bg-rose-50 text-rose-500',
                      },
                      {
                        icon: Music,
                        title: 'Música de Fundo',
                        description: 'Adicione suas músicas favoritas para criar o clima perfeito.',
                        color: 'bg-purple-50 text-purple-500',
                      },
                      {
                        icon: Clock,
                        title: 'Linha do Tempo',
                        description: 'Crie uma linha do tempo visual de momentos especiais e memórias juntos.',
                        color: 'bg-blue-50 text-blue-500',
                      },
                      {
                        icon: Heart,
                        title: 'Mensagens de Carinho',
                        description: 'Escreva mensagens bonitas com animações de digitação e frases destacadas.',
                        color: 'bg-pink-50 text-pink-500',
                      },
                      {
                        icon: Share2,
                        title: 'Fácil Compartilhamento',
                        description: 'Receba um link único para compartilhar via WhatsApp, redes sociais ou email.',
                        color: 'bg-green-50 text-green-500',
                      },
                      {
                        icon: Sparkles,
                        title: 'Efeitos Animados',
                        description: 'Corações flutuantes, brilhos e outras decorações lindas.',
                        color: 'bg-amber-50 text-amber-500',
                      },
                    ].map((feature, index) => (
                      <motion.div
                        key={feature.title}
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: index * 0.1 }}
                        className="group p-6 rounded-2xl border border-gray-100 hover:border-gray-200 hover:shadow-lg transition-all"
                      >
                        <div className={`w-12 h-12 rounded-xl ${feature.color} flex items-center justify-center mb-4`}>
                          <feature.icon className="h-6 w-6" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-800 mb-2">
                          {feature.title}
                        </h3>
                        <p className="text-gray-500 text-sm leading-relaxed">
                          {feature.description}
                        </p>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </section>

              {/* Templates Section */}
              <section className="py-20 px-4">
                <div className="max-w-5xl mx-auto">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="text-center mb-16"
                  >
                    <h2 className="text-3xl md:text-4xl font-serif font-medium text-gray-900 mb-4">
                      Templates lindos
                    </h2>
                    <p className="text-gray-500 max-w-xl mx-auto">
                      Escolha entre nossa coleção de templates profissionalmente desenhados para cada ocasião.
                    </p>
                  </motion.div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {templateList.slice(0, 8).map((template, index) => (
                      <motion.div
                        key={template.name}
                        initial={{ opacity: 0, scale: 0.9 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ delay: index * 0.05 }}
                        className="group cursor-pointer"
                        onClick={() => setShowCreator(true)}
                      >
                        <div
                          className="aspect-[3/4] rounded-xl overflow-hidden relative"
                          style={{ backgroundColor: template.backgroundColor }}
                        >
                          {/* Template preview */}
                          <div
                            className="absolute inset-0 opacity-40"
                            style={{
                              background: `linear-gradient(135deg, ${template.accentColor}40 0%, transparent 100%)`,
                            }}
                          />
                          
                          {/* Preview content */}
                          <div className="absolute inset-0 flex flex-col items-center justify-center p-4">
                            <div
                              className="w-12 h-12 rounded-full mb-3"
                              style={{ backgroundColor: `${template.accentColor}30` }}
                            />
                            <div
                              className="h-2 w-20 rounded mb-2"
                              style={{ backgroundColor: template.accentColor }}
                            />
                            <div className="h-1.5 w-14 rounded bg-gray-300/50" />
                          </div>

                          {/* Hover overlay */}
                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                            <span className="opacity-0 group-hover:opacity-100 text-white text-sm font-medium transition-opacity">
                              Usar Template
                            </span>
                          </div>
                        </div>
                        <p className="text-center text-sm font-medium text-gray-700 mt-3">
                          {template.displayName}
                        </p>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </section>

              {/* CTA Section */}
              <section className="py-20 px-4 bg-gradient-to-b from-white to-rose-50/50">
                <div className="max-w-2xl mx-auto text-center">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                  >
                    <Heart className="h-12 w-12 text-rose-500 mx-auto mb-6" />
                    <h2 className="text-3xl md:text-4xl font-serif font-medium text-gray-900 mb-4">
                      Pronto para criar algo lindo?
                    </h2>
                    <p className="text-gray-500 mb-8">
                      Crie uma página de homenagem incrível em poucos minutos. 
                      Não é necessário conhecimento técnico.
                    </p>
                    <Button
                      size="lg"
                      onClick={() => setShowCreator(true)}
                      className="gap-2 bg-rose-500 hover:bg-rose-600 text-white px-10 h-14 text-lg"
                    >
                      <Heart className="h-5 w-5" />
                      Começar a Criar — É Grátis
                    </Button>
                  </motion.div>
                </div>
              </section>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-100 py-8 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Heart className="h-5 w-5 text-rose-500" />
              <span className="font-serif font-medium text-gray-800">EternalPage</span>
            </div>
            <p className="text-sm text-gray-500">
              Crie páginas de homenagem lindas para quem você ama
            </p>
            <div className="flex items-center gap-6 text-sm text-gray-400">
              <span>Privacidade</span>
              <span>Termos</span>
              <span>Contato</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default function HomePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-white via-rose-50/30 to-white">
        <div className="w-12 h-12 border-4 border-rose-500 border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <HomePageContent />
    </Suspense>
  );
}
