'use client';

import { useEffect, useMemo, useState, type CSSProperties, type FormEvent } from 'react';
import {
  Heart,
  ChevronRight,
  Check,
  Clock,
  Eye,
  Link2,
  Smartphone,
  PenLine,
  Send,
  Mail,
  Image as ImageIcon,
  CalendarHeart,
  Music,
  Sparkles,
  Gift,
  MessageCircleHeart,
} from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { PACKAGE_LIST, formatPrice, type PackageType } from '@/lib/packages';
import { getTemplate } from '@/lib/templates';
import type { TributeConfig } from '@/types/tribute';
import { RevealObserver } from '@/components/reveal-observer';
import { PhoneFrame } from '@/components/tribute/live-preview';
import { OCCASIONS, GALLERY, FAQ, CREDITS, DEMO_CONFIG } from './landing-data';

export interface StartOptions {
  recipient?: string;
  templateId?: string;
  packageType?: PackageType;
}

interface LandingPageProps {
  onStart: (options: StartOptions) => void;
}

const DEMO_HREF = '/para-melhor-mae-demo';
const delay = (i: number) => ({ '--i': i }) as CSSProperties;

export function LandingPage({ onStart }: LandingPageProps) {
  const [name, setName] = useState('');
  const [occasionIndex, setOccasionIndex] = useState(0);
  const occasion = OCCASIONS[occasionIndex];

  const start = (extra: Partial<StartOptions> = {}) =>
    onStart({ recipient: name.trim() || undefined, templateId: occasion.templateId, ...extra });

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-white via-rose-50/30 to-white text-gray-800">
      <Header onStart={() => start()} />
      <main className="flex-1 pt-16">
        <Hero
          name={name}
          onNameChange={setName}
          occasionIndex={occasionIndex}
          onOccasionChange={setOccasionIndex}
          onStart={() => start()}
        />
        <Benefits />
        <HowItWorks onStart={() => start()} />
        <WhatTheyGet onStart={() => start()} />
        <Templates onPick={(templateId) => start({ templateId })} />
        <Pricing onPick={(packageType) => start({ packageType })} />
        <Faq />
        <FinalCta name={name} onNameChange={setName} onStart={() => start()} />
      </main>
      <Footer />
      <MobileCta onStart={() => start()} />
      <RevealObserver />
    </div>
  );
}

/* ------------------------------------------------------------------ */

function Header({ onStart }: { onStart: () => void }) {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/85 backdrop-blur-md border-b border-gray-100">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        <a href="/" className="flex items-center gap-2">
          <Heart className="h-6 w-6 text-rose-500" fill="currentColor" />
          <span className="font-title text-xl font-semibold tracking-wide text-gray-800">EternalPage</span>
        </a>
        <nav className="hidden md:flex items-center gap-8 text-sm text-gray-600">
          <a href="#como-funciona" className="hover:text-rose-500">Como funciona</a>
          <a href="#exemplo" className="hover:text-rose-500">Exemplo</a>
          <a href="#modelos" className="hover:text-rose-500">Modelos</a>
          <a href="#precos" className="hover:text-rose-500">Preços</a>
        </nav>
        <button
          type="button"
          onClick={onStart}
          className="press hidden sm:inline-flex items-center gap-1.5 h-10 px-5 rounded-full bg-rose-500 hover:bg-rose-600 text-white text-sm font-semibold"
        >
          Criar homenagem
        </button>
      </div>
    </header>
  );
}

/* ------------------------------------------------------------------ */
/* Hero: who it's for, the occasion, and the real page beside it       */
/* ------------------------------------------------------------------ */

interface HeroProps {
  name: string;
  onNameChange: (value: string) => void;
  occasionIndex: number;
  onOccasionChange: (index: number) => void;
  onStart: () => void;
}

function Hero({ name, onNameChange, occasionIndex, onOccasionChange, onStart }: HeroProps) {
  const occasion = OCCASIONS[occasionIndex];
  const recipient = name.trim() || 'Maria';

  // The phone shows the real tribute page, built from what the visitor typed and picked.
  const config = useMemo<TributeConfig>(
    () => ({
      title: occasion.phrase,
      recipient,
      template: occasion.templateId,
      hero: { image: occasion.photo, overlay: true },
    }),
    [occasion, recipient]
  );

  const submit = (e: FormEvent) => {
    e.preventDefault();
    onStart();
  };

  return (
    <section className="relative overflow-hidden">
      <div className="max-w-6xl mx-auto px-4 pt-10 md:pt-16 pb-16 grid lg:grid-cols-[1fr_auto] gap-12 lg:gap-20 items-center">
        <div>
          <h1 className="font-title text-4xl md:text-6xl font-semibold leading-[1.08] text-gray-900" data-reveal>
            Uma <span className="font-script font-normal text-rose-500 text-[1.35em] leading-none">homenagem</span>{' '}
            que fica para sempre
          </h1>
          <p className="mt-6 text-lg md:text-xl text-gray-600 max-w-xl leading-relaxed" data-reveal style={delay(1)}>
            Fotos, carta, linha do tempo e música numa página linda para quem você ama. Você monta em minutos,
            vê a prévia de graça e envia o link de presente.
          </p>

          <form onSubmit={submit} className="mt-8 max-w-lg rounded-2xl bg-white p-5 shadow-xl shadow-rose-100/60 ring-1 ring-rose-100" data-reveal style={delay(2)}>
            <label htmlFor="hero-name" className="block text-sm font-semibold text-gray-700">
              Para quem é a homenagem?
            </label>
            <input
              id="hero-name"
              value={name}
              onChange={(e) => onNameChange(e.target.value)}
              placeholder="Digite o nome"
              maxLength={50}
              autoComplete="off"
              className="mt-2 w-full h-12 px-4 rounded-xl border border-gray-200 bg-white text-gray-800 placeholder:text-gray-400 outline-none focus-visible:border-rose-400 focus-visible:ring-4 focus-visible:ring-rose-100"
            />
            <div role="group" aria-label="Ocasião" className="mt-3 flex flex-wrap gap-2">
              {OCCASIONS.map((o, i) => (
                <button
                  key={o.templateId}
                  type="button"
                  onClick={() => onOccasionChange(i)}
                  aria-pressed={i === occasionIndex}
                  className={`press h-9 px-3.5 rounded-full text-sm font-medium ${
                    i === occasionIndex ? 'bg-rose-500 text-white' : 'bg-rose-50 text-rose-600 hover:bg-rose-100'
                  }`}
                >
                  {o.label}
                </button>
              ))}
            </div>
            <button
              type="submit"
              className="press mt-5 w-full inline-flex items-center justify-center gap-2 h-14 rounded-xl bg-rose-500 hover:bg-rose-600 text-white text-lg font-semibold"
            >
              Criar minha homenagem
              <ChevronRight className="h-5 w-5" />
            </button>
            <p className="mt-3 flex flex-wrap justify-center gap-x-4 gap-y-1 text-xs text-gray-500">
              <span className="inline-flex items-center gap-1"><Check className="h-3.5 w-3.5 text-rose-500" />Prévia grátis</span>
              <span className="inline-flex items-center gap-1"><Check className="h-3.5 w-3.5 text-rose-500" />Pagamento único a partir de {formatPrice(29.9)}</span>
              <span className="inline-flex items-center gap-1"><Check className="h-3.5 w-3.5 text-rose-500" />Pronta em minutos</span>
            </p>
          </form>
        </div>

        <div className="flex flex-col items-center" data-reveal style={delay(1)}>
          <PhoneFrame config={config} focus="hero" width={280} />
          <p className="mt-4 text-sm text-gray-500 text-center max-w-[260px]">
            Assim abre a página que {recipient} vai receber. Mude o nome e a ocasião para ver.
          </p>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */

function Benefits() {
  const items = [
    { icon: Clock, title: 'Pronta em minutos', text: 'Sem instalar nada, direto no navegador.' },
    { icon: Eye, title: 'Prévia grátis', text: 'Veja a página inteira antes de pagar.' },
    { icon: Link2, title: 'Link para presentear', text: 'Envie por WhatsApp ou num cartão.' },
    { icon: Smartphone, title: 'Linda no celular', text: 'Feita para abrir e emocionar em qualquer tela.' },
  ];
  return (
    <section className="px-4 pb-16">
      <ul className="max-w-6xl mx-auto grid grid-cols-2 lg:grid-cols-4 gap-4">
        {items.map((it, i) => (
          <li key={it.title} className="flex items-start gap-3 rounded-2xl bg-white/70 p-4 ring-1 ring-gray-100" data-reveal style={delay(i)}>
            <span className="shrink-0 w-10 h-10 rounded-full bg-rose-50 text-rose-500 flex items-center justify-center">
              <it.icon className="h-5 w-5" />
            </span>
            <span>
              <span className="block font-semibold text-gray-800">{it.title}</span>
              <span className="block text-sm text-gray-500 mt-0.5">{it.text}</span>
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}

/* ------------------------------------------------------------------ */

function SectionTitle({ kicker, title, text }: { kicker: string; title: string; text?: string }) {
  return (
    <div className="text-center mb-12">
      <p className="font-title text-xs uppercase tracking-[0.25em] text-rose-500" data-reveal>{kicker}</p>
      <h2 className="mt-3 font-script text-5xl md:text-6xl text-gray-900 leading-tight" data-reveal style={delay(1)}>
        {title}
      </h2>
      {text && (
        <p className="mt-4 text-gray-600 max-w-xl mx-auto" data-reveal style={delay(2)}>
          {text}
        </p>
      )}
    </div>
  );
}

function HowItWorks({ onStart }: { onStart: () => void }) {
  const steps = [
    { icon: PenLine, title: 'Monte a página', text: 'Escolha o modelo, escreva a carta e envie as fotos. A prévia mostra tudo enquanto você digita.' },
    { icon: Eye, title: 'Veja a prévia grátis', text: 'Confira a página completa, do jeito que a pessoa vai ver. Ajuste o que quiser.' },
    { icon: Send, title: 'Publique e envie', text: 'Pague uma vez e receba o link para mandar por WhatsApp, e-mail ou num cartão.' },
  ];
  return (
    <section id="como-funciona" className="py-20 px-4 bg-white">
      <div className="max-w-5xl mx-auto">
        <SectionTitle kicker="Como funciona" title="Três passos, poucos minutos" />
        <ol className="grid md:grid-cols-3 gap-6">
          {steps.map((s, i) => (
            <li key={s.title} className="relative rounded-2xl bg-rose-50/50 p-6 ring-1 ring-rose-100" data-reveal style={delay(i)}>
              <span className="absolute -top-4 left-6 w-8 h-8 rounded-full bg-rose-500 text-white text-sm font-semibold flex items-center justify-center">
                {i + 1}
              </span>
              <s.icon className="h-7 w-7 text-rose-500 mt-2" />
              <h3 className="mt-4 font-title text-xl font-semibold text-gray-900">{s.title}</h3>
              <p className="mt-2 text-gray-600 leading-relaxed">{s.text}</p>
            </li>
          ))}
        </ol>
        <div className="mt-10 text-center">
          <button type="button" onClick={onStart} className="press inline-flex items-center gap-2 h-12 px-8 rounded-full bg-rose-500 hover:bg-rose-600 text-white font-semibold">
            Começar agora, é grátis
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* What they get: a complete example in the phone, section by section  */
/* ------------------------------------------------------------------ */

function WhatTheyGet({ onStart }: { onStart: () => void }) {
  const parts = [
    { key: 'hero', icon: Sparkles, title: 'Abertura com foto', text: 'O nome dela em letra de convite sobre a foto principal.' },
    { key: 'message', icon: Mail, title: 'Uma carta', text: 'Sua mensagem em papel de carta, com selo e assinatura.' },
    { key: 'counter', icon: Clock, title: 'Contador do tempo', text: 'Anos, meses, dias e segundos juntos, contando ao vivo.' },
    { key: 'reasons', icon: Gift, title: 'Motivos para te amar', text: 'Cartões que viram ao toque, cada um com um motivo.' },
    { key: 'gallery', icon: ImageIcon, title: 'Polaroides', text: 'As fotos de vocês com legendas escritas à mão.' },
    { key: 'timeline', icon: CalendarHeart, title: 'Linha do tempo', text: 'Os momentos importantes, ano a ano.' },
    { key: 'guestbook', icon: MessageCircleHeart, title: 'Mural de recados', text: 'Família e amigos deixam mensagens na mesma página.' },
    { key: 'closing', icon: Heart, title: 'Despedida', text: 'Uma frase final sobre a foto, para fechar com emoção.' },
  ];
  const [focus, setFocus] = useState('hero');

  // Walk through the parts on its own until the visitor picks one.
  const [touched, setTouched] = useState(false);
  useEffect(() => {
    if (touched || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const timer = window.setInterval(() => {
      setFocus((f) => parts[(parts.findIndex((p) => p.key === f) + 1) % parts.length].key);
    }, 4000);
    return () => window.clearInterval(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [touched]);

  return (
    <section id="exemplo" className="py-20 px-4">
      <div className="max-w-5xl mx-auto">
        <SectionTitle
          kicker="O que a pessoa recebe"
          title="Uma página feita só para ela"
          text="Este é um exemplo completo. Toque em cada parte para ver na tela."
        />
        <div className="grid md:grid-cols-[1fr_auto] gap-12 items-center">
          <ul className="space-y-3">
            {parts.map((p) => (
              <li key={p.key}>
                <button
                  type="button"
                  onClick={() => {
                    setTouched(true);
                    setFocus(p.key);
                  }}
                  aria-pressed={focus === p.key}
                  className={`w-full text-left flex items-start gap-4 rounded-2xl p-4 transition-colors ${
                    focus === p.key ? 'bg-white shadow-lg shadow-rose-100 ring-1 ring-rose-200' : 'hover:bg-white/70'
                  }`}
                >
                  <span className={`shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${focus === p.key ? 'bg-rose-500 text-white' : 'bg-rose-50 text-rose-500'}`}>
                    <p.icon className="h-5 w-5" />
                  </span>
                  <span>
                    <span className="block font-title text-lg font-semibold text-gray-900">{p.title}</span>
                    <span className="block text-gray-600 mt-0.5">{p.text}</span>
                  </span>
                </button>
              </li>
            ))}
            <li className="pt-2 flex flex-col sm:flex-row gap-3">
              <button type="button" onClick={onStart} className="press inline-flex items-center justify-center gap-2 h-12 px-6 rounded-full bg-rose-500 hover:bg-rose-600 text-white font-semibold">
                Criar uma assim
              </button>
              <a href={DEMO_HREF} target="_blank" rel="noreferrer" className="press inline-flex items-center justify-center h-12 px-6 rounded-full border border-gray-200 bg-white text-gray-800 font-medium hover:bg-gray-50">
                Abrir o exemplo em tela cheia
              </a>
            </li>
          </ul>
          <div className="flex justify-center">
            <PhoneFrame config={DEMO_CONFIG as TributeConfig} focus={focus} width={280} />
          </div>
        </div>
        <p className="mt-6 text-center text-xs text-gray-400">Fotos do exemplo: acervos públicos (créditos no rodapé). Música disponível nos planos Plus e Premium.</p>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Templates as taped polaroids                                        */
/* ------------------------------------------------------------------ */

const ROTATIONS = [-6, 4, -3, 5, -4, 3, 6, -5];

function Templates({ onPick }: { onPick: (templateId: string) => void }) {
  return (
    <section id="modelos" className="py-20 px-4 bg-white">
      <div className="max-w-5xl mx-auto">
        <SectionTitle
          kicker="Modelos"
          title="Um modelo para cada data"
          text="Cada modelo tem suas cores e seu efeito: corações, pétalas, brilhos ou estrelas. Escolha um para começar."
        />
        <ul className="grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-12">
          {GALLERY.map((tile, i) => {
            const template = getTemplate(tile.templateId);
            const rotation = ROTATIONS[i % ROTATIONS.length] * 0.6;
            return (
              <li key={tile.templateId} data-reveal style={delay(i % 4)}>
                <button type="button" onClick={() => onPick(tile.templateId)} className="group block w-full text-left" aria-label={`Começar com o modelo ${tile.name}`}>
                  <div className="relative transition-transform duration-300 group-hover:-translate-y-2" style={{ transform: `rotate(${rotation}deg)` }}>
                    <div
                      className="p-3 pb-12 rounded-sm"
                      style={{ backgroundColor: template?.backgroundColor ?? '#fff', boxShadow: '0 4px 20px rgba(0,0,0,0.1), 0 0 0 1px rgba(0,0,0,0.03)' }}
                    >
                      <div className="aspect-square overflow-hidden bg-gray-100">
                        <img src={tile.photo} alt={tile.alt} loading="lazy" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                      </div>
                      <p className="absolute bottom-3 left-3 right-3 text-center font-script text-2xl text-gray-700 truncate">{tile.name}</p>
                    </div>
                    <div className="absolute -top-3 left-1/2 w-16 h-6 bg-yellow-100/80 rounded-sm" style={{ transform: `translateX(-50%) rotate(${rotation * 0.5}deg)` }} />
                  </div>
                  <span className="mt-4 flex items-center justify-center gap-1.5 text-sm text-gray-500 group-hover:text-rose-500">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: template?.accentColor }} />
                    Usar este modelo
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

function Pricing({ onPick }: { onPick: (packageType: PackageType) => void }) {
  return (
    <section id="precos" className="py-20 px-4">
      <div className="max-w-5xl mx-auto">
        <SectionTitle kicker="Preços" title="Pague uma vez, guarde para sempre" text="Sem assinatura. Você só paga depois de ver a prévia pronta." />
        <div className="grid md:grid-cols-3 gap-6 items-stretch">
          {PACKAGE_LIST.map((pkg, i) => (
            <div
              key={pkg.id}
              className={`relative flex flex-col rounded-3xl bg-white p-7 ${
                pkg.popular ? 'ring-2 ring-rose-500 shadow-2xl shadow-rose-100 md:-my-3' : 'ring-1 ring-gray-100'
              }`}
              data-reveal
              style={delay(i)}
            >
              {pkg.popular && (
                <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-rose-500 text-white text-xs font-semibold uppercase tracking-wider">
                  Mais escolhido
                </span>
              )}
              <h3 className="font-title text-2xl font-semibold text-gray-900">{pkg.displayName}</h3>
              <p className="mt-1 text-sm text-gray-500">{pkg.description}</p>
              <p className="mt-6 flex items-baseline gap-1 tabular-nums">
                <span className="text-4xl font-bold text-gray-900">{formatPrice(pkg.price)}</span>
                <span className="text-sm text-gray-500">pagamento único</span>
              </p>
              <ul className="mt-6 space-y-2.5 text-gray-600 flex-1">
                {pkg.features.map((f) => (
                  <li key={f} className="flex gap-2.5">
                    <Check className="h-5 w-5 shrink-0 text-rose-500" />
                    {f}
                  </li>
                ))}
              </ul>
              <button
                type="button"
                onClick={() => onPick(pkg.id)}
                className={`press mt-8 h-12 rounded-full font-semibold ${
                  pkg.popular ? 'bg-rose-500 hover:bg-rose-600 text-white' : 'bg-rose-50 hover:bg-rose-100 text-rose-600'
                }`}
              >
                Escolher {pkg.displayName}
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */

function Faq() {
  return (
    <section id="duvidas" className="py-20 px-4 bg-white">
      <div className="max-w-3xl mx-auto">
        <SectionTitle kicker="Dúvidas" title="Perguntas frequentes" />
        <Accordion type="single" collapsible className="rounded-2xl ring-1 ring-gray-100 bg-white px-6">
          {FAQ.map((item) => (
            <AccordionItem key={item.q} value={item.q}>
              <AccordionTrigger className="text-left font-title text-lg font-semibold text-gray-800 hover:no-underline">
                {item.q}
              </AccordionTrigger>
              <AccordionContent className="text-gray-600 text-base leading-relaxed">{item.a}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */

function FinalCta({ name, onNameChange, onStart }: { name: string; onNameChange: (v: string) => void; onStart: () => void }) {
  const submit = (e: FormEvent) => {
    e.preventDefault();
    onStart();
  };
  return (
    <section className="px-4 py-20">
      <div className="max-w-4xl mx-auto rounded-[2rem] bg-rose-500 px-6 py-14 md:px-14 text-center text-white relative overflow-hidden">
        <Heart className="absolute -right-10 -bottom-10 h-56 w-56 text-white/10" fill="currentColor" aria-hidden="true" />
        <h2 className="font-script text-5xl md:text-6xl leading-tight">Faça alguém se emocionar hoje</h2>
        <p className="mt-4 text-white/90 max-w-xl mx-auto">Comece agora. Você só paga quando a página estiver do jeito que você quer.</p>
        <form onSubmit={submit} className="mt-8 flex flex-col sm:flex-row gap-3 max-w-lg mx-auto relative">
          <label htmlFor="final-name" className="sr-only">Nome de quem vai receber</label>
          <input
            id="final-name"
            value={name}
            onChange={(e) => onNameChange(e.target.value)}
            placeholder="Nome de quem você ama"
            maxLength={50}
            autoComplete="off"
            className="flex-1 h-14 px-5 rounded-full bg-white text-gray-800 placeholder:text-gray-400 outline-none focus-visible:ring-4 focus-visible:ring-white/40"
          />
          <button type="submit" className="press h-14 px-8 rounded-full bg-gray-900 hover:bg-black text-white font-semibold">
            Criar homenagem
          </button>
        </form>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */

function Footer() {
  return (
    <footer className="border-t border-gray-100 py-10 px-4 pb-28 sm:pb-10">
      <div className="max-w-5xl mx-auto">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Heart className="h-5 w-5 text-rose-500" fill="currentColor" />
            <span className="font-title font-semibold tracking-wide text-gray-800">EternalPage</span>
          </div>
          <nav className="flex items-center gap-6 text-sm text-gray-500">
            <a href="#como-funciona" className="hover:text-rose-500">Como funciona</a>
            <a href="#precos" className="hover:text-rose-500">Preços</a>
            <a href="#duvidas" className="hover:text-rose-500">Dúvidas</a>
          </nav>
        </div>
        <p className="mt-8 text-xs text-gray-400 leading-relaxed text-center max-w-4xl mx-auto">
          Fotos de exemplo de acervos públicos:{' '}
          {CREDITS.map((c, i) => (
            <span key={c.file}>
              <a href={c.href} className="underline underline-offset-2 hover:text-rose-500" target="_blank" rel="noreferrer">{c.text}</a>
              {i < CREDITS.length - 1 ? '; ' : '.'}
            </span>
          ))}{' '}
          Todas via Wikimedia Commons.
        </p>
      </div>
    </footer>
  );
}

// On phones the main action is always one tap away.
function MobileCta({ onStart }: { onStart: () => void }) {
  return (
    <div className="sm:hidden fixed bottom-0 inset-x-0 z-40 p-3 bg-white/95 border-t border-gray-100">
      <button type="button" onClick={onStart} className="press w-full h-12 rounded-full bg-rose-500 text-white font-semibold inline-flex items-center justify-center gap-2">
        <Heart className="h-4 w-4" fill="currentColor" />
        Criar minha homenagem
      </button>
    </div>
  );
}
