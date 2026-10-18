import type { ReactNode } from 'react';
import { SiteHeader } from '@/components/site-header';
import { SiteFooter } from '@/components/site-footer';
import { LEGAL_LINKS, LEGAL_UPDATED_AT } from '@/lib/legal';

export interface LegalSection {
  id: string;
  title: string;
  content: ReactNode;
}

interface LegalPageProps {
  title: string;
  intro: ReactNode;
  sections: LegalSection[];
  // Shows the "last updated" date; off for pages that are not legal texts (Contato).
  dated?: boolean;
}

// Shared layout of the legal pages: title, date, a table of contents and numbered sections.
export function LegalPage({ title, intro, sections, dated = true }: LegalPageProps) {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-white via-rose-50/30 to-white text-gray-800">
      <SiteHeader
        action={
          <a href="/" className="text-sm text-gray-500 hover:text-rose-500">
            Voltar ao início
          </a>
        }
      />

      <main className="flex-1 pt-16">
        <div className="max-w-6xl mx-auto px-4 py-12 md:py-16">
          <header className="max-w-3xl">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-rose-500">EternalPage</p>
            <h1 className="mt-2 font-title text-4xl md:text-5xl font-semibold tracking-tight text-gray-900">{title}</h1>
            {dated && <p className="mt-3 text-sm text-gray-500">Última atualização: {LEGAL_UPDATED_AT}</p>}
            <div className="mt-6 text-base leading-relaxed text-gray-600 space-y-3">{intro}</div>
          </header>

          <div className="mt-10 grid gap-10 lg:grid-cols-[220px_1fr]">
            <aside className="hidden lg:block">
              <nav className="sticky top-24 text-sm" aria-label="Nesta página">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gray-400">Nesta página</p>
                <ol className="mt-3 space-y-2 text-gray-600">
                  {sections.map((s, i) => (
                    <li key={s.id}>
                      <a href={`#${s.id}`} className="hover:text-rose-500">
                        {i + 1}. {s.title}
                      </a>
                    </li>
                  ))}
                </ol>
                <p className="mt-8 text-xs font-semibold uppercase tracking-[0.18em] text-gray-400">Outros documentos</p>
                <ul className="mt-3 space-y-2 text-gray-600">
                  {LEGAL_LINKS.map((l) => (
                    <li key={l.href}>
                      <a href={l.href} className="hover:text-rose-500">{l.label}</a>
                    </li>
                  ))}
                </ul>
              </nav>
            </aside>

            <article className="max-w-3xl rounded-3xl bg-white ring-1 ring-gray-100 px-6 py-8 md:px-10 md:py-10 space-y-10">
              {sections.map((s, i) => (
                <section key={s.id} id={s.id} className="scroll-mt-24">
                  <h2 className="font-title text-xl md:text-2xl font-semibold text-gray-900">
                    {i + 1}. {s.title}
                  </h2>
                  <div className="mt-3 space-y-3 text-[15px] leading-relaxed text-gray-700 [&_a]:text-rose-600 [&_a]:underline [&_a]:underline-offset-2 [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:space-y-1.5 [&_strong]:text-gray-900">
                    {s.content}
                  </div>
                </section>
              ))}
            </article>
          </div>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
