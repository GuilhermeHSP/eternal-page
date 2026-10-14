'use client';

import { useEffect, useRef, useState, type FormEvent } from 'react';
import { PACKAGE_LIST, formatPrice } from '@/lib/packages';
import { getTemplate } from '@/lib/templates';
import { RevealObserver } from '@/components/reveal-observer';
import {
  OCCASIONS,
  SHOWCASE,
  GALLERY,
  STEPS,
  FAQ,
  CREDITS,
} from './landing-data';

export interface StartOptions {
  recipient?: string;
  templateId?: string;
}

interface LandingPageProps {
  onStart: (options: StartOptions) => void;
}

const DEMO_HREF = '/para-melhor-mae-demo';
const SECTION_Y = 'py-[clamp(88px,11vw,176px)]';
const GUTTER = 'px-4 md:px-8';

export function LandingPage({ onStart }: LandingPageProps) {
  const [name, setName] = useState('');
  const [occasionIndex, setOccasionIndex] = useState(0);
  const occasion = OCCASIONS[occasionIndex];

  const start = (templateId?: string) =>
    onStart({ recipient: name.trim() || undefined, templateId: templateId ?? occasion.templateId });

  return (
    <div className="bg-paper text-ink">
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
      <Footer onStart={() => start()} />
      <RevealObserver />
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Hero: the gift card on the left, the page it opens on the right     */
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

  // Signature move: the example page changes occasion on its own, like light shifting
  // in a room, until the visitor picks one.
  useEffect(() => {
    if (touched) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const timer = window.setInterval(tick, 5600);
    function tick() {
      if (document.hidden) return;
      onOccasionChange((occasionIndex + 1) % OCCASIONS.length);
    }
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
    <section className="bg-ink p-3">
      <div className="grid gap-3 md:grid-cols-2 md:min-h-[calc(100svh-24px)]">
        {/* The page being given: shown first on a phone */}
        <div className="md:order-2 min-w-0 h-[38svh] md:h-auto">
          <TributeFragment name={name} occasionIndex={occasionIndex} />
        </div>

        {/* The card */}
        <div className="md:order-1 min-w-0 relative z-10 -mt-6 md:mt-0 bg-paper flex flex-col">
          <Stripe className="h-10 md:h-14" />
          <div className="flex-1 flex flex-col items-center text-center px-5 md:px-12 pt-5 md:pt-12 pb-7">
            <p className="text-step-lead font-semibold tracking-[-0.04em]">EternalPage</p>

            <h1
              className="mt-4 md:mt-10 max-w-[13ch] text-[clamp(2.25rem,4.4vw,4.5rem)]"
              data-reveal
            >
              Um presente feito de lembranças
            </h1>

            <p className="mt-4 md:mt-6 max-w-[38ch] text-step-body" data-reveal style={{ '--i': 1 } as React.CSSProperties}>
              Junte fotos, uma mensagem e a história de vocês numa página só. Você monta de graça e paga
              uma vez, a partir de {formatPrice(29.9)}, para enviar o link.
            </p>

            <form onSubmit={submit} className="mt-6 md:mt-8 w-full max-w-[26rem]" data-reveal style={{ '--i': 2 } as React.CSSProperties}>
              <label htmlFor="hero-name" className="block text-step-small text-soft text-left mb-2">
                Para quem é?
              </label>
              <input
                id="hero-name"
                value={name}
                onChange={(e) => onNameChange(e.target.value)}
                placeholder="Nome de quem vai receber"
                maxLength={50}
                autoComplete="off"
                className="w-full h-14 px-4 bg-tone text-ink text-step-body placeholder:text-soft outline-none focus-visible:outline-2 focus-visible:outline-ink"
              />
              <div role="group" aria-label="Ocasião" className="mt-3 flex flex-wrap gap-2 justify-start">
                {OCCASIONS.map((o, i) => (
                  <button
                    key={o.templateId}
                    type="button"
                    onClick={() => pick(i)}
                    aria-pressed={i === occasionIndex}
                    className={`press h-10 px-3 text-step-small font-medium ${
                      i === occasionIndex ? 'bg-ink text-paper' : 'bg-tone text-ink hover:bg-[#cbc6c6]'
                    }`}
                  >
                    {o.label}
                  </button>
                ))}
              </div>
              <button
                type="submit"
                className="press mt-5 w-full h-14 bg-ink text-paper text-step-body font-medium hover:bg-deep"
              >
                Começar a homenagem
              </button>
            </form>

            <nav aria-label="Nesta página" className="mt-auto pt-8 flex flex-wrap justify-center gap-x-7 gap-y-2 text-step-small">
              <a href={DEMO_HREF} className="underline-offset-4 hover:underline">Ver um exemplo</a>
              <a href="#precos" className="underline-offset-4 hover:underline">Preços</a>
              <a href="#duvidas" className="underline-offset-4 hover:underline">Dúvidas</a>
            </nav>
          </div>
        </div>
      </div>
    </section>
  );
}

function Stripe({ className = '' }: { className?: string }) {
  return (
    <div className={`flex w-full min-w-0 overflow-hidden ${className}`} aria-hidden="true">
      {Array.from({ length: 80 }).map((_, i) => (
        <span key={i} className={`shrink-0 w-7 ${i % 2 === 0 ? 'bg-ink' : 'bg-paper'}`} />
      ))}
    </div>
  );
}

function TributeFragment({ name, occasionIndex }: { name: string; occasionIndex: number }) {
  const occasion = OCCASIONS[occasionIndex];
  const style = getTemplate(occasion.templateId);
  const display = name.trim() || 'Maria';
  const accent = style?.accentColor ?? '#7d0c14';
  const ground = style?.backgroundColor ?? '#e2e2e2';

  return (
    <div
      data-ui
      className="relative h-full overflow-hidden"
      style={{ backgroundColor: ground }}
      aria-label={`Exemplo de página: ${occasion.title(display)}`}
    >
      {OCCASIONS.map((o, i) => (
        <img
          key={o.photo}
          src={o.photo}
          alt={i === occasionIndex ? o.alt : ''}
          aria-hidden={i !== occasionIndex}
          className="absolute inset-0 w-full h-full object-cover grayscale transition-opacity duration-[1600ms] ease-in-out"
          style={{ opacity: i === occasionIndex ? 1 : 0 }}
          fetchPriority={i === 0 ? 'high' : undefined}
        />
      ))}

      <div
        className="absolute top-0 left-0 max-w-full px-4 h-11 flex items-center text-step-small font-medium tabular-nums truncate transition-colors duration-700"
        style={{ backgroundColor: ground, color: accent }}
      >
        eternalpage.com.br/k7Qm2xP9aR
      </div>

      <div
        className="absolute left-0 right-0 bottom-0 md:right-auto md:max-w-[min(32rem,90%)] px-5 md:px-8 pt-5 pb-10 md:py-7 transition-colors duration-700"
        style={{ backgroundColor: ground }}
      >
        <div className="text-step-small" style={{ color: '#55504c' }}>{occasion.when}</div>
        <div
          className="mt-2 text-step-lead font-semibold leading-[1.02] tracking-[-0.035em] [text-wrap:balance] transition-colors duration-700"
          style={{ color: accent }}
        >
          {occasion.title(display)}
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Showcase: one example page, square plate and spare text             */
/* ------------------------------------------------------------------ */

function Showcase({ onStart }: { onStart: (templateId?: string) => void }) {
  const [tab, setTab] = useState(0);
  const item = SHOWCASE[tab];
  const templateFor = ['anniversary', 'mothersDay', 'fathersDay'];

  return (
    <section id="exemplo" className="bg-tone md:min-h-[88svh] grid md:grid-cols-2">
      <div className="flex items-center justify-center p-4 md:p-10">
        <div className="relative w-full aspect-square overflow-hidden bg-paper" data-reveal>
          {SHOWCASE.map((s, i) => (
            <img
              key={s.photo}
              src={s.photo}
              alt={i === tab ? s.alt : ''}
              aria-hidden={i !== tab}
              loading="lazy"
              className="absolute inset-0 w-full h-full object-cover grayscale transition-opacity duration-700"
              style={{ opacity: i === tab ? 1 : 0 }}
            />
          ))}
        </div>
      </div>

      <div className={`flex flex-col justify-between gap-10 ${GUTTER} md:pl-6 md:pr-10 py-8 md:py-10`}>
        <div role="tablist" aria-label="Exemplos" className="flex flex-wrap gap-x-7 gap-y-2 text-step-body">
          {SHOWCASE.map((s, i) => (
            <button
              key={s.label}
              role="tab"
              aria-selected={i === tab}
              onClick={() => setTab(i)}
              className={`press py-1 ${i === tab ? 'text-ink font-medium underline underline-offset-8 decoration-2' : 'text-soft hover:text-ink'}`}
            >
              {s.label}
            </button>
          ))}
        </div>

        <div>
          <h2 className="text-step-head" data-reveal>{item.title}</h2>
          <p className="mt-12 max-w-[34ch] text-step-body" data-reveal style={{ '--i': 1 } as React.CSSProperties}>
            {item.description}
          </p>
          <p className="mt-4 text-step-small text-soft">Exemplo com foto de acervo público.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-1">
          <a
            href={DEMO_HREF}
            className="press h-[60px] md:h-[72px] flex items-center px-5 bg-ink text-paper text-step-body font-medium hover:bg-deep"
          >
            Ver a página de exemplo
          </a>
          <button
            type="button"
            onClick={() => onStart(templateFor[tab])}
            className="press h-[60px] md:h-[72px] flex items-center px-5 bg-paper text-ink text-step-body font-medium text-left hover:bg-[#ececec]"
          >
            Criar uma assim
          </button>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* How it works: the steps printed on a slip                           */
/* ------------------------------------------------------------------ */

function HowItWorks() {
  return (
    <section id="como-funciona" className={`bg-ink text-paper ${SECTION_Y} ${GUTTER}`}>
      <div className="mx-auto max-w-[1376px] grid md:grid-cols-12 gap-10 md:gap-6 items-start">
        <div className="md:col-span-5">
          <h2 className="text-step-head" data-reveal>Do rascunho ao link</h2>
          <p className="mt-6 max-w-[30ch] text-step-body" data-reveal style={{ '--i': 1 } as React.CSSProperties}>
            Tudo acontece no navegador, em uns dez minutos. Você só paga no fim, depois de ver a página pronta.
          </p>
        </div>

        <div
          className="md:col-start-7 md:col-span-5 w-full max-w-[480px] bg-paper text-ink edge-zigzag px-6 md:px-8 pt-2 pb-12"
          data-reveal
          style={{ '--i': 2 } as React.CSSProperties}
        >
          {STEPS.map((group) => (
            <div key={group.group} className="pt-7">
              <p className="font-semibold text-step-body">{group.group}</p>
              <ul className="mt-2 space-y-2 text-step-body tabular-nums">
                {group.rows.map((row) => (
                  <li key={row.what} className="flex items-baseline">
                    <span>{row.what}</span>
                    <span className="dot-leader" aria-hidden="true" />
                    <span className="whitespace-nowrap">{row.value}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
          <div className="mt-8 -mx-6 md:-mx-8 min-h-11 py-2.5 px-6 md:px-8 bg-ink text-paper flex items-center justify-between text-step-body tabular-nums">
            <span>Uma página pronta para presentear</span>
            <span className="whitespace-nowrap pl-3">10 min</span>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Gallery: one tile per template, each with its label strip           */
/* ------------------------------------------------------------------ */

const STRIPS = [
  { bg: '#7d0c14', fg: '#e2e2e2' },
  { bg: '#d6d6d6', fg: '#7d0c14' },
  { bg: '#5a070d', fg: '#e2e2e2' },
  { bg: '#7a4a4e', fg: '#e2e2e2' },
];

function Gallery({ onPick }: { onPick: (templateId: string) => void }) {
  return (
    <section id="modelos" className={`${SECTION_Y} ${GUTTER}`}>
      <div className="mx-auto max-w-[1376px]">
        <h2 className="text-step-head" data-reveal>Um modelo para cada data</h2>
        <p className="mt-4 max-w-[46ch] text-step-body" data-reveal style={{ '--i': 1 } as React.CSSProperties}>
          Cada modelo tem a sua cor e o seu jeito de mostrar as fotos. Escolha um para começar; dá para trocar depois.
        </p>
        <ul className="mt-10 grid grid-cols-2 md:grid-cols-4 gap-x-2 md:gap-x-3 gap-y-5 md:gap-y-7">
          {GALLERY.map((tile, i) => {
            const strip = STRIPS[(i + Math.floor(i / 4)) % STRIPS.length];
            return (
              <li key={tile.templateId} data-reveal style={{ '--i': i % 4 } as React.CSSProperties}>
                <button
                  type="button"
                  onClick={() => onPick(tile.templateId)}
                  className="group block w-full text-left"
                  aria-label={`Começar com o modelo ${tile.name}`}
                >
                  <div className="aspect-[4/5] overflow-hidden bg-tone">
                    <img
                      src={tile.photo}
                      alt={tile.alt}
                      loading="lazy"
                      className="w-full h-full object-cover grayscale transition-transform duration-700 ease-out group-hover:scale-[1.04]"
                    />
                  </div>
                  <div
                    className="min-h-[84px] md:min-h-[92px] p-3 flex flex-col justify-between gap-2 text-step-small tabular-nums"
                    style={{ backgroundColor: strip.bg, color: strip.fg }}
                  >
                    <div className="flex justify-between gap-2 font-semibold text-step-small">
                      <span>{tile.name}</span>
                      <span className="hidden sm:inline font-normal">{tile.when}</span>
                    </div>
                    <div className="flex justify-between gap-2">
                      <span>{tile.detail}</span>
                      <span className="underline-offset-4 group-hover:underline">Usar</span>
                    </div>
                  </div>
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
/* Pricing: set like a menu                                            */
/* ------------------------------------------------------------------ */

function Pricing({ onStart }: { onStart: () => void }) {
  const included = [
    { name: 'Prévia completa antes de pagar', note: 'Com marca d’água, para você conferir tudo.', price: 'grátis' },
    { name: 'Editar antes de publicar', note: 'Volte ao editor quantas vezes quiser.', price: 'incluso' },
    { name: 'Link único para enviar', note: 'Um endereço só seu, difícil de adivinhar.', price: 'incluso' },
    { name: 'Celular e computador', note: 'A página se ajusta a qualquer tela.', price: 'incluso' },
  ];

  return (
    <section id="precos" className={`bg-tone ${SECTION_Y} ${GUTTER}`}>
      <div className="mx-auto max-w-[1376px] grid md:grid-cols-12 gap-10 md:gap-6">
        <div className="md:col-span-3">
          <h2 className="text-step-head" data-reveal>Preços</h2>
          <p className="mt-4 text-step-body max-w-[24ch]" data-reveal style={{ '--i': 1 } as React.CSSProperties}>
            Pagamento único por página. Sem assinatura.
          </p>
          <div className="mt-8 w-3/5 md:w-full aspect-[4/5] overflow-hidden" data-reveal style={{ '--i': 2 } as React.CSSProperties}>
            <img
              src="/acervo/familia-1942.jpg"
              alt="Família reunida sentada na grama em frente a uma escada, 1942"
              loading="lazy"
              className="w-full h-full object-cover grayscale"
            />
          </div>
        </div>

        <div className="md:col-start-5 md:col-span-8 grid lg:grid-cols-2 gap-x-16 gap-y-12">
          <div data-reveal>
            <p className="text-step-lead font-medium">Pacotes, em R$</p>
            <ul className="mt-6 space-y-[22px]">
              {PACKAGE_LIST.map((pkg) => (
                <li key={pkg.id}>
                  <div className="flex justify-between gap-4 text-step-body font-medium tabular-nums">
                    <span>{pkg.displayName}</span>
                    <span>{formatPrice(pkg.price).replace('R$', '').trim()}</span>
                  </div>
                  <p className="mt-1 max-w-[36ch] text-step-body text-soft">{packageLine(pkg.id)}</p>
                </li>
              ))}
            </ul>
            <button
              type="button"
              onClick={onStart}
              className="press mt-10 h-14 px-6 bg-ink text-paper text-step-body font-medium hover:bg-deep"
            >
              Começar de graça
            </button>
          </div>

          <div data-reveal style={{ '--i': 1 } as React.CSSProperties}>
            <p className="text-step-lead font-medium">Em todos os pacotes</p>
            <ul className="mt-6 space-y-[22px]">
              {included.map((item) => (
                <li key={item.name}>
                  <div className="flex justify-between gap-4 text-step-body font-medium">
                    <span>{item.name}</span>
                    <span>{item.price}</span>
                  </div>
                  <p className="mt-1 max-w-[36ch] text-step-body text-soft">{item.note}</p>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}

function packageLine(id: string): string {
  switch (id) {
    case 'basic':
      return 'Até 3 fotos e 5 momentos na linha do tempo. No ar por 30 dias.';
    case 'plus':
      return 'Até 10 fotos, 10 momentos com imagem e música de fundo. No ar por 1 ano.';
    default:
      return 'Fotos e momentos sem limite, música e suporte prioritário. No ar para sempre.';
  }
}

/* ------------------------------------------------------------------ */
/* FAQ: answers as reading text                                        */
/* ------------------------------------------------------------------ */

function Faq() {
  return (
    <section id="duvidas" className={`${SECTION_Y} ${GUTTER}`}>
      <div className="mx-auto max-w-[1376px] grid md:grid-cols-12 gap-8 md:gap-6">
        <h2 className="md:col-span-3 text-step-head" data-reveal>Dúvidas</h2>
        <div className="md:col-start-5 md:col-span-8 md:columns-2 md:gap-14 text-step-body leading-[1.55]">
          {FAQ.map((item, i) => (
            <p key={item.q} className="mb-5 break-inside-avoid max-w-[40ch]" data-reveal style={{ '--i': i % 4 } as React.CSSProperties}>
              <span className="font-medium">{item.q}</span> {item.a}
            </p>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Closing: a sentence with a blank                                    */
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
    <section className={`bg-tone ${SECTION_Y} ${GUTTER}`}>
      <form onSubmit={submit} className="mx-auto max-w-[1376px]">
        <h2 className="text-[clamp(2.25rem,4.4vw,4.5rem)] leading-[1.05]" data-reveal>
          <label htmlFor="closing-name">Comece a página de </label>
          <input
            ref={inputRef}
            id="closing-name"
            value={name}
            onChange={(e) => onNameChange(e.target.value)}
            placeholder="quem você ama"
            maxLength={50}
            autoComplete="off"
            className="inline-block align-baseline w-full sm:w-[7.5em] h-[1.05em] px-[0.2em] bg-paper text-ink placeholder:text-soft font-semibold tracking-[-0.04em] outline-none focus-visible:outline-2 focus-visible:outline-ink"
          />{' '}
          <button type="submit" className="press inline-block align-baseline h-[1.05em] px-[0.25em] bg-ink text-paper font-semibold tracking-[-0.04em] hover:bg-deep">
            agora
          </button>
        </h2>
        <p className="mt-8 text-step-body text-soft max-w-[52ch]" data-reveal style={{ '--i': 1 } as React.CSSProperties}>
          Abre o editor com esse nome já preenchido. Nada é cobrado até você publicar.
        </p>
      </form>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Footer: the back of the card, the name built large                  */
/* ------------------------------------------------------------------ */

const BLOCK_COLOURS = ['#e2e2e2', '#d6d6d6', '#7a4a4e', '#c4bcbc'];
const BLOCK_HEIGHTS = [100, 78, 92, 64, 86, 70, 96, 60, 82, 74, 90];

function BlockWord({ rows, className, size }: { rows: string[]; className: string; size: string }) {
  let n = 0;
  return (
    <div className="flex flex-col gap-1" aria-hidden="true">
      {rows.map((row) => (
        <div key={row} className={`items-end gap-1 ${className}`}>
          {row.split('').map((letter) => {
            const i = n++;
            return (
              <div
                key={i}
                className="flex-1 flex items-end justify-center overflow-hidden"
                style={{ backgroundColor: BLOCK_COLOURS[i % BLOCK_COLOURS.length], height: `${BLOCK_HEIGHTS[i]}%` }}
                data-reveal
              >
                <span className={`text-ink font-semibold leading-[0.8] tracking-[-0.06em] translate-y-[0.06em] ${size}`}>{letter}</span>
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}

function Footer({ onStart }: { onStart: () => void }) {
  return (
    <footer className="bg-ink text-paper">
      <Stripe className="h-2" />
      <div className={`${GUTTER} pt-12 md:pt-16 pb-10`}>
        <div className="mx-auto max-w-[1376px]">
          <div role="img" aria-label="EternalPage">
            <BlockWord rows={['eternalpage']} className="hidden md:flex h-[34svh] min-h-[200px]" size="text-[clamp(4rem,9vw,9rem)]" />
            <BlockWord rows={['eternal', 'page']} className="flex md:hidden h-[20svh] min-h-[120px]" size="text-[clamp(2.25rem,13vw,4.5rem)]" />
          </div>

          <div className="mt-14 grid grid-cols-2 md:grid-cols-12 gap-x-6 gap-y-10 text-step-small">
            <div className="md:col-span-2">
              <p className="font-medium">Produto</p>
              <ul className="mt-3 space-y-2">
                <li><button type="button" onClick={onStart} className="hover:underline underline-offset-4">Criar homenagem</button></li>
                <li><a href={DEMO_HREF} className="hover:underline underline-offset-4">Ver um exemplo</a></li>
                <li><a href="#modelos" className="hover:underline underline-offset-4">Modelos</a></li>
              </ul>
            </div>
            <div className="md:col-span-2">
              <p className="font-medium">Ajuda</p>
              <ul className="mt-3 space-y-2">
                <li><a href="#como-funciona" className="hover:underline underline-offset-4">Como funciona</a></li>
                <li><a href="#precos" className="hover:underline underline-offset-4">Preços</a></li>
                <li><a href="#duvidas" className="hover:underline underline-offset-4">Dúvidas</a></li>
              </ul>
            </div>
            <div className="col-span-2 md:col-start-6 md:col-span-7">
              <p className="font-medium">Fotos de exemplo</p>
              <p className="mt-3 max-w-[80ch] text-step-small leading-[1.6]">
                As fotografias desta página são de acervos públicos, usadas só como exemplo:{' '}
                {CREDITS.map((c, i) => (
                  <span key={c.file}>
                    <a href={c.href} className="underline underline-offset-2" target="_blank" rel="noreferrer">{c.text}</a>
                    {i < CREDITS.length - 1 ? '; ' : '.'}
                  </span>
                ))}{' '}
                Todas via Wikimedia Commons.
              </p>
            </div>
          </div>

          <div className="mt-12 flex items-center justify-between gap-4 text-step-small">
            <p>© {new Date().getFullYear()} EternalPage</p>
            <button
              type="button"
              onClick={onStart}
              className="press h-11 px-4 bg-paper text-ink font-medium hover:bg-tone"
            >
              Começar
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}
