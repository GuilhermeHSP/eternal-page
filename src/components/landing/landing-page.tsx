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
  Mic,
} from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { PACKAGE_LIST, LOWEST_PRICE, formatPrice, type PackageType } from '@/lib/packages';
import { PlanCard } from '@/components/pricing/plan-card';
import { getTemplate } from '@/lib/templates';
import type { TributeConfig } from '@/types/tribute';
import { RevealObserver } from '@/components/reveal-observer';
import { SiteHeader } from '@/components/site-header';
import { SiteFooter } from '@/components/site-footer';
import { PhoneFrame } from '@/components/tribute/live-preview';
import { OCCASIONS, GALLERY, FAQ, DEMO_CONFIG } from './landing-data';
import { DEMO_SLUG } from '@/lib/demo-slug';

export interface StartOptions {
  recipient?: string;
  templateId?: string;
  packageType?: PackageType;
}

interface LandingPageProps {
  onStart: (options: StartOptions) => void;
}

const DEMO_HREF = `/${DEMO_SLUG}`;
const delay = (i: number) => ({ '--i': i }) as CSSProperties;

export function LandingPage({ onStart }: LandingPageProps) {
  const [occasionIndex, setOccasionIndex] = useState(0);
  const occasion = OCCASIONS[occasionIndex];

  const start = (extra: Partial<StartOptions> = {}) =>
    onStart({ templateId: occasion.templateId, ...extra });

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-white via-rose-50/30 to-white text-gray-800">
      <Header onStart={() => start()} />
      <main className="flex-1 pt-16">
        <Hero
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
        <FinalCta onStart={() => start()} />
      </main>
      <SiteFooter className="pb-28 sm:pb-8" />
      <MobileCta onStart={() => start()} />
      <RevealObserver />
    </div>
  );
}

/* ------------------------------------------------------------------ */

function Header({ onStart }: { onStart: () => void }) {
  const hidden = useCtaOnScreen();
  return (
    <SiteHeader
      nav={[
        { href: '#como-funciona', label: 'Como funciona' },
        { href: '#exemplo', label: 'Exemplo' },
        { href: '#modelos', label: 'Modelos' },
        { href: '#precos', label: 'Preços' },
      ]}
      action={
        <button
          type="button"
          onClick={onStart}
          tabIndex={hidden ? -1 : 0}
          aria-hidden={hidden}
          className={'press hidden sm:inline-flex items-center gap-1.5 h-10 px-5 rounded-full bg-rose-500 hover:bg-rose-600 text-white text-sm font-semibold transition-opacity duration-300 ' + (hidden ? 'opacity-0 pointer-events-none' : 'opacity-100')}
        >
          Criar homenagem
        </button>
      }
    />
  );
}

/* ------------------------------------------------------------------ */
/* Hero: who it's for, the occasion, and the real page beside it       */
/* ------------------------------------------------------------------ */

interface HeroProps {
  occasionIndex: number;
  onOccasionChange: (index: number) => void;
  onStart: () => void;
}

function Hero({ occasionIndex, onOccasionChange, onStart }: HeroProps) {
  const occasion = OCCASIONS[occasionIndex];

  // The phone shows the real tribute page, built from what the visitor typed and picked.
  const config = useMemo<TributeConfig>(
    () => ({
      title: occasion.phrase,
      recipient: occasion.recipient,
      template: occasion.templateId,
      hero: { image: occasion.photo, overlay: true },
    }),
    [occasion]
  );

  const submit = (e: FormEvent) => {
    e.preventDefault();
    onStart();
  };

  return (
    <section className="relative overflow-hidden">
      <div className="max-w-6xl mx-auto px-4 pt-10 md:pt-16 pb-16 grid lg:grid-cols-[1fr_auto] gap-12 lg:gap-20 items-center">
        <div>
          <h1 className="font-title text-[2.6rem] md:text-6xl font-semibold leading-[1.08] tracking-tight text-gray-900" data-reveal>
            Uma{' '}
            <span className="relative inline-block whitespace-nowrap text-rose-500">
              <span className="relative z-10">página eterna</span>
              {/* brush stroke under the brand words */}
              <svg
                aria-hidden="true"
                viewBox="0 0 300 24"
                preserveAspectRatio="none"
                className="absolute left-0 -bottom-1 md:-bottom-2 w-full h-3 md:h-4 text-rose-200"
              >
                <path d="M4 16 C 60 6, 140 4, 296 12" stroke="currentColor" strokeWidth="10" strokeLinecap="round" fill="none" />
              </svg>
            </span>{' '}
            <br className="hidden md:block" />
            para quem você ama
          </h1>
          <p className="mt-6 text-lg md:text-xl text-gray-600 max-w-xl leading-relaxed" data-reveal style={delay(1)}>
            Para o seu amor: a história de vocês em fotos, carta, linha do tempo e música, numa página que você
            monta em minutos e envia de presente. Também para a mãe, o pai, os amigos ou quem deixou saudade.
          </p>

          <form data-cta-anchor onSubmit={submit} className="mt-8 max-w-lg rounded-2xl bg-white p-5 shadow-xl shadow-rose-100/60 ring-1 ring-rose-100" data-reveal style={delay(2)}>
            <p className="text-sm font-semibold text-gray-700">Qual é a ocasião?</p>
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
              <span className="inline-flex items-center gap-1"><Check className="h-3.5 w-3.5 text-rose-500" />Pagamento único</span>
              <span className="inline-flex items-center gap-1"><Check className="h-3.5 w-3.5 text-rose-500" />Pronta em minutos</span>
            </p>
          </form>
        </div>

        <div className="flex flex-col items-center" data-reveal style={delay(1)}>
          <PhoneFrame config={config} focus="hero" width={280} />
          <p className="mt-4 text-sm text-gray-500 text-center max-w-[260px]">
            Assim abre a página que a pessoa vai receber. Troque a ocasião para ver.
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
    { key: 'voice', icon: Mic, title: 'Mensagem de voz', text: 'Sua voz gravada, para ela ouvir quantas vezes quiser.' },
    { key: 'reasons', icon: Gift, title: 'Motivos para te amar', text: 'Cartões que viram ao toque, cada um com um motivo.' },
    { key: 'gallery', icon: ImageIcon, title: 'Polaroides', text: 'As fotos de vocês com legendas escritas à mão.' },
    { key: 'timeline', icon: CalendarHeart, title: 'Linha do tempo', text: 'Os momentos importantes, ano a ano.' },
    { key: 'guestbook', icon: MessageCircleHeart, title: 'Mural de recados', text: 'Família e amigos deixam mensagens na mesma página.' },
    { key: 'music', icon: Music, title: 'Música de fundo', text: 'A música de vocês tocando enquanto ela rola a página.' },
    { key: 'closing', icon: Heart, title: 'Despedida', text: 'Uma frase final sobre a foto, para fechar com emoção.' },
    // The phone shows the example page, so list only the sections it has.
  ].filter((p) => p.key !== 'voice' || (DEMO_CONFIG as TributeConfig).voiceMessage);
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
          title="Feita só para quem vai receber"
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
        <p className="mt-6 text-center text-xs text-gray-400">Música e mensagem de voz no pacote Completo.</p>
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
        <SectionTitle kicker="Preços" title="Um pagamento, uma lembrança eterna" text="Sem assinatura. Você só paga depois de ver a prévia pronta." />
        <div className="grid md:grid-cols-2 gap-6 items-stretch max-w-3xl mx-auto pt-3">
          {PACKAGE_LIST.map((pkg, i) => (
            <div key={pkg.id} className="flex" data-reveal style={delay(i)}>
              <PlanCard pkg={pkg} onSelect={() => onPick(pkg.id)} ctaLabel={'Escolher ' + pkg.displayName} />
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

function FinalCta({ onStart }: { onStart: () => void }) {
  return (
    <section className="px-4 py-20">
      <div className="max-w-4xl mx-auto rounded-[2rem] bg-rose-500 px-6 py-14 md:px-14 text-center text-white relative overflow-hidden">
        <Heart className="absolute -right-10 -bottom-10 h-56 w-56 text-white/10" fill="currentColor" aria-hidden="true" />
        <h2 className="font-script text-5xl md:text-6xl leading-tight">Faça alguém se emocionar hoje</h2>
        <p className="mt-4 text-white/90 max-w-xl mx-auto">Comece agora. Você só paga quando a página estiver do jeito que você quer.</p>
        <button
          data-cta-anchor
          type="button"
          onClick={onStart}
          className="press relative mt-8 inline-flex items-center gap-2 h-14 px-10 rounded-full bg-white text-rose-600 text-lg font-semibold hover:bg-rose-50"
        >
          <Heart className="h-5 w-5" fill="currentColor" />
          Criar minha homenagem
        </button>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */

// True while one of the page's own "create" forms or buttons ([data-cta-anchor]) is on screen.
// The header and the phone bar hide their button then, so the same action never shows twice.
function useCtaOnScreen() {
  const [onScreen, setOnScreen] = useState(true);
  useEffect(() => {
    const anchors = document.querySelectorAll('[data-cta-anchor]');
    if (!anchors.length || !('IntersectionObserver' in window)) {
      setOnScreen(false);
      return;
    }
    const visible = new Set<Element>();
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => (e.isIntersecting ? visible.add(e.target) : visible.delete(e.target)));
      setOnScreen(visible.size > 0);
    });
    anchors.forEach((a) => io.observe(a));
    return () => io.disconnect();
  }, []);
  return onScreen;
}

// On phones the main action is always one tap away.
function MobileCta({ onStart }: { onStart: () => void }) {
  // Only appears while no other "create" form is on screen, so the action is never shown twice.
  const show = !useCtaOnScreen();

  return (
    <div
      className={'sm:hidden fixed bottom-0 inset-x-0 z-40 p-3 bg-white/95 border-t border-gray-100 transition-transform duration-300 ' + (show ? 'translate-y-0' : 'translate-y-full')}
      aria-hidden={!show}
    >
      <button type="button" tabIndex={show ? 0 : -1} onClick={onStart} className="press w-full h-12 rounded-full bg-rose-500 text-white font-semibold inline-flex items-center justify-center gap-2">
        <Heart className="h-4 w-4" fill="currentColor" />
        Criar minha homenagem
      </button>
    </div>
  );
}
