'use client';

import { useEffect, useRef, useState, type CSSProperties, type FormEvent } from 'react';
import dynamic from 'next/dynamic';
import { Heart, ChevronRight, Camera, Clock, Calendar, Check, Quote } from 'lucide-react';
import { PACKAGE_LIST, formatPrice } from '@/lib/packages';
import { getTemplate } from '@/lib/templates';
import { RevealObserver } from '@/components/reveal-observer';
import { OCCASIONS, SHOWCASE, GALLERY, STEPS, FAQ, CREDITS } from './landing-data';

// The same floating hearts the tribute pages use, client-only like in the viewer.
const BackgroundAnimations = dynamic(
  () => import('@/components/tribute/background-animations').then((mod) => mod.BackgroundAnimations),
  { ssr: false }
);

export interface StartOptions {
  recipient?: string;
  templateId?: string;
}

interface LandingPageProps {
  onStart: (options: StartOptions) => void;
}

const DEMO_HREF = '/para-melhor-mae-demo';
const ROSE = '#f43f5e';
const delay = (i: number) => ({ '--i': i }) as CSSProperties;

export function LandingPage({ onStart }: LandingPageProps) {
  const [name, setName] = useState('');
  const [occasionIndex, setOccasionIndex] = useState(0);
  const occasion = OCCASIONS[occasionIndex];

  const start = (templateId?: string) =>
    onStart({ recipient: name.trim() || undefined, templateId: templateId ?? occasion.templateId });

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-white via-rose-50/30 to-white">
      <Header onStart={() => start()} />
      <main className="flex-1 pt-16">
        <Hero
          name={name}
          onNameChange={setName}
          occasionIndex={occasionIndex}
          onOccasionChange={setOccasionIndex}
          onStart={() => start()}
        />
        <Showcase onStart={(templateId) => start(templateId)} />
        <HowItWorks />
        <Gallery onPick={(templateId) => start(templateId)} />
        <Pricing onStart={() => start()} />
        <Faq />
        <ClosingForm name={name} onNameChange={setName} onStart={() => start()} />
      </main>
      <Footer />
      <RevealObserver />
    </div>
  );
}

/* ------------------------------------------------------------------ */

function Header({ onStart }: { onStart: () => void }) {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        <a href="/" className="flex items-center gap-2">
          <Heart className="h-6 w-6 text-rose-500" />
          <span className="font-serif text-xl font-semibold text-gray-800">EternalPage</span>
        </a>
        <nav className="hidden md:flex items-center gap-7 text-sm text-gray-600">
          <a href="#exemplo" className="hover:text-rose-500">Exemplo</a>
          <a href="#modelos" className="hover:text-rose-500">Modelos</a>
          <a href="#precos" className="hover:text-rose-500">Preços</a>
          <a href="#duvidas" className="hover:text-rose-500">Dúvidas</a>
        </nav>
        <button
          type="button"
          onClick={onStart}
          className="press inline-flex items-center gap-1.5 h-10 px-4 rounded-md bg-rose-500 hover:bg-rose-600 text-white text-sm font-medium"
        >
          <Heart className="h-4 w-4" />
          Criar homenagem
        </button>
      </div>
    </header>
  );
}

/* ------------------------------------------------------------------ */
/* Hero: the form on the left, the opening of a real tribute page on    */
/* the right, which changes as the visitor types and picks an occasion */
/* ------------------------------------------------------------------ */

interface HeroProps {
  name: string;
  onNameChange: (value: string) => void;
  occasionIndex: number;
  onOccasionChange: (index: number) => void;
  onStart: () => void;
}

function Hero({ name, onNameChange, occasionIndex, onOccasionChange, onStart }: HeroProps) {
  const [touched, setTouched] = useState(false);

  // Until the visitor picks an occasion, the example page cycles through them.
  useEffect(() => {
    if (touched) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const timer = window.setInterval(() => {
      if (!document.hidden) onOccasionChange((occasionIndex + 1) % OCCASIONS.length);
    }, 5600);
    return () => window.clearInterval(timer);
  }, [touched, occasionIndex, onOccasionChange]);

  const pick = (index: number) => {
    setTouched(true);
    onOccasionChange(index);
  };

  const submit = (e: FormEvent) => {
    e.preventDefault();
    onStart();
  };

  return (
    <section className="relative overflow-hidden">
      <div className="max-w-6xl mx-auto px-4 pt-12 md:pt-20 pb-16 grid lg:grid-cols-2 gap-10 lg:gap-14 items-center">
        <div>
          <h1 className="text-4xl md:text-6xl font-serif font-medium text-gray-900 leading-tight" data-reveal>
            Uma página de <span className="text-rose-500">homenagem</span> para presentear
          </h1>
          <p className="mt-6 text-lg md:text-xl text-gray-600 max-w-xl" data-reveal style={delay(1)}>
            Fotos, música, mensagem e a história de vocês numa página só. Você monta de graça e paga
            uma vez, a partir de {formatPrice(29.9)}, para enviar o link.
          </p>

          <form onSubmit={submit} className="mt-8 max-w-md" data-reveal style={delay(2)}>
            <label htmlFor="hero-name" className="block text-sm font-medium text-gray-700 mb-2">
              Para quem é a homenagem?
            </label>
            <input
              id="hero-name"
              value={name}
              onChange={(e) => onNameChange(e.target.value)}
              placeholder="Nome de quem vai receber"
              maxLength={50}
              autoComplete="off"
              className="w-full h-12 px-4 rounded-md border border-gray-200 bg-white text-gray-800 placeholder:text-gray-400 outline-none focus-visible:border-rose-400 focus-visible:ring-4 focus-visible:ring-rose-100"
            />
            <div role="group" aria-label="Ocasião" className="mt-3 flex flex-wrap gap-2">
              {OCCASIONS.map((o, i) => (
                <button
                  key={o.templateId}
                  type="button"
                  onClick={() => pick(i)}
                  aria-pressed={i === occasionIndex}
                  className={`press h-9 px-3.5 rounded-full text-sm font-medium ${
                    i === occasionIndex ? 'bg-rose-500 text-white' : 'bg-rose-50 text-rose-600 hover:bg-rose-100'
                  }`}
                >
                  {o.label}
                </button>
              ))}
            </div>
            <div className="mt-6 flex flex-col sm:flex-row gap-3">
              <button
                type="submit"
                className="press inline-flex items-center justify-center gap-2 h-12 px-8 rounded-md bg-rose-500 hover:bg-rose-600 text-white font-medium"
              >
                <Heart className="h-5 w-5" />
                Criar sua homenagem
                <ChevronRight className="h-4 w-4" />
              </button>
              <a
                href={DEMO_HREF}
                target="_blank"
                rel="noreferrer"
                className="press inline-flex items-center justify-center h-12 px-8 rounded-md border border-gray-200 bg-white text-gray-800 font-medium hover:bg-gray-50"
              >
                Ver exemplo
              </a>
            </div>
          </form>
        </div>

        <div data-reveal style={delay(1)}>
          <TributeOpening name={name} occasionIndex={occasionIndex} />
        </div>
      </div>
    </section>
  );
}

// A small copy of the first screen of a tribute page (the viewer's HeroSection).
function TributeOpening({ name, occasionIndex }: { name: string; occasionIndex: number }) {
  const occasion = OCCASIONS[occasionIndex];
  const template = getTemplate(occasion.templateId);
  const accent = template?.accentColor ?? ROSE;
  const display = name.trim() || 'Maria';

  return (
    <div className="relative">
      <div
        data-ui
        className="relative aspect-[4/5] sm:aspect-[5/6] rounded-2xl overflow-hidden shadow-2xl ring-1 ring-black/5"
        aria-label={`Exemplo de página: ${occasion.title(display)}`}
      >
        {OCCASIONS.map((o, i) => (
          <img
            key={o.photo}
            src={o.photo}
            alt={i === occasionIndex ? o.alt : ''}
            aria-hidden={i !== occasionIndex}
            className="absolute inset-0 w-full h-full object-cover transition-opacity duration-[1600ms] ease-in-out"
            style={{ opacity: i === occasionIndex ? 1 : 0 }}
          />
        ))}
        <div
          className="absolute inset-0"
          style={{ background: 'linear-gradient(to bottom, rgba(0,0,0,0.3) 0%, rgba(0,0,0,0.55) 100%)' }}
        />
        <div
          className="absolute inset-0 opacity-30"
          style={{ background: `linear-gradient(135deg, ${accent}40 0%, transparent 50%, ${accent}20 100%)` }}
        />

        {/* Hearts float inside the frame only: the transform contains their fixed layer */}
        <div className="absolute inset-0 overflow-hidden" style={{ transform: 'translateZ(0)' }}>
          <BackgroundAnimations
            config={template?.backgroundAnimation ?? { type: 'hearts', intensity: 'low', color: '#fda4af' }}
          />
        </div>

        <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-6">
          <span className="inline-block px-5 py-2 rounded-full text-xs font-medium tracking-wide uppercase bg-white/20 text-white/90 backdrop-blur-md">
            Uma homenagem para
          </span>
          <p className="mt-4 text-lg md:text-xl font-medium tracking-wide text-white/85">{display}</p>
          <p className="mt-3 text-3xl md:text-4xl font-serif font-medium leading-tight text-white max-w-[16ch]">
            {occasion.title(display)}
          </p>
          <div className="mt-6 h-1 w-24 rounded-full bg-white/60" />
        </div>

        <div className="absolute top-3 left-3 right-3 flex items-center gap-2 px-3 h-8 rounded-full bg-white/85 backdrop-blur-md text-xs text-gray-500">
          <Heart className="h-3.5 w-3.5 shrink-0" style={{ color: accent }} />
          <span className="truncate">eternalpage.com.br/k7Qm2xP9aR</span>
        </div>
      </div>
      <p className="mt-3 text-center text-sm text-gray-500">
        Assim abre a página que a pessoa recebe. Foto de exemplo de acervo público.
      </p>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Showcase: one example as a polaroid, like the tribute gallery       */
/* ------------------------------------------------------------------ */

function Showcase({ onStart }: { onStart: (templateId?: string) => void }) {
  const [tab, setTab] = useState(0);
  const item = SHOWCASE[tab];
  const templateFor = ['anniversary', 'mothersDay', 'fathersDay'];

  return (
    <section id="exemplo" className="py-20 px-4 bg-white">
      <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-12 items-center">
        <div className="flex justify-center py-6" data-reveal>
          <Polaroid src={item.photo} alt={item.alt} caption={item.title} rotation={-3} large />
        </div>

        <div>
          <div role="tablist" aria-label="Exemplos" className="flex flex-wrap gap-2">
            {SHOWCASE.map((s, i) => (
              <button
                key={s.label}
                role="tab"
                aria-selected={i === tab}
                onClick={() => setTab(i)}
                className={`press h-9 px-4 rounded-full text-sm font-medium ${
                  i === tab ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>
          <h2 className="mt-8 text-3xl md:text-4xl font-serif font-medium text-gray-900" data-reveal>
            {item.title}
          </h2>
          <p className="mt-4 text-gray-600 leading-relaxed max-w-md" data-reveal style={delay(1)}>
            {item.description}
          </p>
          <div className="mt-8 flex flex-col sm:flex-row gap-3">
            <a
              href={DEMO_HREF}
              target="_blank"
              rel="noreferrer"
              className="press inline-flex items-center justify-center h-11 px-6 rounded-md bg-rose-500 hover:bg-rose-600 text-white font-medium"
            >
              Ver página de exemplo
            </a>
            <button
              type="button"
              onClick={() => onStart(templateFor[tab])}
              className="press inline-flex items-center justify-center h-11 px-6 rounded-md border border-gray-200 bg-white text-gray-800 font-medium hover:bg-gray-50"
            >
              Criar uma assim
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

const ROTATIONS = [-6, 4, -3, 5, -4, 3, 6, -5, 4, -3];

// The polaroid from the tribute gallery: white frame, tape, handwritten caption.
function Polaroid({
  src,
  alt,
  caption,
  rotation,
  large = false,
  ground,
}: {
  src: string;
  alt: string;
  caption: string;
  rotation: number;
  large?: boolean;
  ground?: string;
}) {
  return (
    <div
      className={`relative group transition-transform duration-300 hover:-translate-y-2 ${large ? 'w-full max-w-sm' : 'w-full'}`}
      style={{ transform: `rotate(${rotation}deg)` }}
    >
      <div
        className="p-3 pb-12 rounded-sm"
        style={{
          backgroundColor: ground ?? '#ffffff',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1), 0 0 0 1px rgba(0, 0, 0, 0.03)',
        }}
      >
        <div className="relative aspect-square overflow-hidden bg-gray-100">
          <img
            src={src}
            alt={alt}
            loading="lazy"
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
        </div>
        <p
          className="absolute bottom-3 left-3 right-3 text-center text-sm text-gray-600 truncate"
          style={{ fontFamily: 'Georgia, serif', fontStyle: 'italic' }}
        >
          {caption}
        </p>
      </div>
      <div
        className="absolute -top-3 left-1/2 w-16 h-6 bg-yellow-100/80 rounded-sm"
        style={{ transform: `translateX(-50%) rotate(${rotation * 0.5}deg)`, boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}
      />
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* How it works: told like the tribute timeline                        */
/* ------------------------------------------------------------------ */

function HowItWorks() {
  const steps = STEPS.flatMap((g) => g.rows.map((r) => ({ ...r, group: g.group })));

  return (
    <section id="como-funciona" className="py-20 px-4">
      <div className="max-w-3xl mx-auto relative">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 text-gray-500 mb-3">
            <Clock className="h-5 w-5 text-rose-500" />
            <span className="text-sm font-medium tracking-wide uppercase">Como funciona</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-serif font-medium text-gray-900" data-reveal>
            Do rascunho ao link
          </h2>
          <p className="mt-4 text-gray-500 max-w-xl mx-auto" data-reveal style={delay(1)}>
            Tudo no navegador, em uns dez minutos. Você só paga no fim, depois de ver a página pronta.
          </p>
        </div>

        <div className="relative">
          <div className="absolute left-8 md:left-1/2 top-0 bottom-0 w-0.5 bg-rose-200" aria-hidden="true" />
          <ol className="space-y-10">
            {steps.map((step, index) => {
              const isLeft = index % 2 === 0;
              return (
                <li
                  key={step.what}
                  className={`relative flex items-center ${isLeft ? 'md:flex-row' : 'md:flex-row-reverse'} flex-row`}
                  data-reveal
                  style={delay(index % 3)}
                >
                  <div className="absolute left-8 md:left-1/2 -translate-x-1/2 w-4 h-4 rounded-full border-4 border-white shadow-md z-10 bg-rose-500" />
                  <div className={`w-full md:w-5/12 pl-20 md:pl-0 ${isLeft ? 'md:pr-12' : 'md:pl-12'}`}>
                    <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-50 transition-transform hover:-translate-y-1">
                      <div className="p-5">
                        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold mb-3 bg-rose-50 text-rose-600">
                          <Calendar className="h-3 w-3" />
                          {step.group} · {step.value}
                        </div>
                        <h3 className="text-lg font-semibold text-gray-800">{step.what}</h3>
                      </div>
                      <div className="h-1 bg-rose-500" />
                    </div>
                  </div>
                </li>
              );
            })}
          </ol>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Gallery: the templates as polaroids in their own colours            */
/* ------------------------------------------------------------------ */

function Gallery({ onPick }: { onPick: (templateId: string) => void }) {
  return (
    <section id="modelos" className="py-20 px-4 bg-white">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 text-gray-500 mb-3">
            <Camera className="h-5 w-5 text-rose-500" />
            <span className="text-sm font-medium tracking-wide uppercase">Modelos</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-serif font-medium text-gray-900" data-reveal>
            Um modelo para cada data
          </h2>
          <p className="mt-4 text-gray-500 max-w-xl mx-auto" data-reveal style={delay(1)}>
            Cada modelo tem suas cores e seus efeitos: corações, pétalas, brilhos ou estrelas. Escolha um para
            começar; dá para trocar depois.
          </p>
        </div>

        <ul className="grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-12">
          {GALLERY.map((tile, i) => {
            const template = getTemplate(tile.templateId);
            return (
              <li key={tile.templateId} data-reveal style={delay(i % 4)}>
                <button
                  type="button"
                  onClick={() => onPick(tile.templateId)}
                  className="block w-full text-left"
                  aria-label={`Começar com o modelo ${tile.name}`}
                >
                  <Polaroid
                    src={tile.photo}
                    alt={tile.alt}
                    caption={tile.name}
                    rotation={ROTATIONS[i % ROTATIONS.length] * 0.6}
                    ground={template?.backgroundColor}
                  />
                  <span className="mt-4 flex items-center justify-center gap-1.5 text-sm text-gray-500">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: template?.accentColor }} />
                    {tile.when}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Pricing: the three packages from the creator's first step           */
/* ------------------------------------------------------------------ */

function Pricing({ onStart }: { onStart: () => void }) {
  return (
    <section id="precos" className="py-20 px-4">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-serif font-medium text-gray-900" data-reveal>
            Preços
          </h2>
          <p className="mt-4 text-gray-500" data-reveal style={delay(1)}>
            Pagamento único por página. A prévia é grátis.
          </p>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {PACKAGE_LIST.map((pkg, i) => (
            <div
              key={pkg.id}
              className={`relative rounded-2xl bg-white p-6 border ${
                pkg.popular ? 'border-rose-500 ring-4 ring-rose-100' : 'border-gray-100'
              }`}
              data-reveal
              style={delay(i)}
            >
              {pkg.popular && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-rose-500 text-white text-xs font-medium">
                  Mais popular
                </span>
              )}
              <h3 className="text-xl font-serif font-medium text-gray-900">{pkg.displayName}</h3>
              <p className="mt-1 text-sm text-gray-500">{pkg.description}</p>
              <p className="mt-5 text-3xl font-semibold text-gray-900 tabular-nums">
                {formatPrice(pkg.price)}
                <span className="text-sm font-normal text-gray-500"> / único</span>
              </p>
              <ul className="mt-5 space-y-2 text-sm text-gray-600">
                {pkg.features.map((f) => (
                  <li key={f} className="flex gap-2">
                    <Check className="h-4 w-4 mt-0.5 shrink-0 text-rose-500" />
                    {f}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-10 text-center">
          <button
            type="button"
            onClick={onStart}
            className="press inline-flex items-center gap-2 h-12 px-8 rounded-md bg-rose-500 hover:bg-rose-600 text-white font-medium"
          >
            <Heart className="h-5 w-5" />
            Começar de graça
          </button>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */

function Faq() {
  return (
    <section id="duvidas" className="py-20 px-4 bg-white">
      <div className="max-w-5xl mx-auto">
        <h2 className="text-3xl md:text-4xl font-serif font-medium text-gray-900 text-center mb-12" data-reveal>
          Dúvidas
        </h2>
        <div className="md:columns-2 md:gap-12">
          {FAQ.map((item, i) => (
            <p key={item.q} className="mb-6 break-inside-avoid text-gray-600 leading-relaxed" data-reveal style={delay(i % 4)}>
              <span className="font-semibold text-gray-800">{item.q}</span> {item.a}
            </p>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Closing: like the tribute's closing message, with the name to fill  */
/* ------------------------------------------------------------------ */

function ClosingForm({ name, onNameChange, onStart }: { name: string; onNameChange: (v: string) => void; onStart: () => void }) {
  const inputRef = useRef<HTMLInputElement>(null);

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      inputRef.current?.focus();
      return;
    }
    onStart();
  };

  return (
    <section className="py-20 px-4 bg-gradient-to-b from-white to-rose-50/50">
      <div className="max-w-2xl mx-auto text-center">
        <Quote className="h-10 w-10 text-rose-500 mx-auto mb-6" />
        <h2 className="text-3xl md:text-4xl font-serif font-medium text-gray-900" data-reveal>
          Pronto para criar algo lindo?
        </h2>
        <p className="mt-4 text-gray-500" data-reveal style={delay(1)}>
          Escreva o nome de quem vai receber e comece agora. Nada é cobrado até você publicar.
        </p>
        <form onSubmit={submit} className="mt-8 flex flex-col sm:flex-row gap-3 max-w-lg mx-auto" data-reveal style={delay(2)}>
          <label htmlFor="closing-name" className="sr-only">
            Nome de quem vai receber
          </label>
          <input
            ref={inputRef}
            id="closing-name"
            value={name}
            onChange={(e) => onNameChange(e.target.value)}
            placeholder="Nome de quem você ama"
            maxLength={50}
            autoComplete="off"
            className="flex-1 h-14 px-4 rounded-md border border-gray-200 bg-white text-gray-800 placeholder:text-gray-400 outline-none focus-visible:border-rose-400 focus-visible:ring-4 focus-visible:ring-rose-100"
          />
          <button
            type="submit"
            className="press inline-flex items-center justify-center gap-2 h-14 px-8 rounded-md bg-rose-500 hover:bg-rose-600 text-white text-lg font-medium"
          >
            <Heart className="h-5 w-5" />
            Começar
          </button>
        </form>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */

function Footer() {
  return (
    <footer className="bg-white border-t border-gray-100 py-10 px-4">
      <div className="max-w-5xl mx-auto">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Heart className="h-5 w-5 text-rose-500" />
            <span className="font-serif font-medium text-gray-800">EternalPage</span>
          </div>
          <p className="text-sm text-gray-500">Crie páginas de homenagem lindas para quem você ama</p>
          <nav className="flex items-center gap-6 text-sm text-gray-500">
            <a href="#precos" className="hover:text-rose-500">Preços</a>
            <a href="#duvidas" className="hover:text-rose-500">Dúvidas</a>
            <a href={DEMO_HREF} className="hover:text-rose-500">Exemplo</a>
          </nav>
        </div>
        <p className="mt-8 text-xs text-gray-500 leading-relaxed text-center max-w-4xl mx-auto">
          As fotos de exemplo são de acervos públicos:{' '}
          {CREDITS.map((c, i) => (
            <span key={c.file}>
              <a href={c.href} className="underline underline-offset-2 hover:text-rose-500" target="_blank" rel="noreferrer">
                {c.text}
              </a>
              {i < CREDITS.length - 1 ? '; ' : '.'}
            </span>
          ))}{' '}
          Todas via Wikimedia Commons.
        </p>
      </div>
    </footer>
  );
}
