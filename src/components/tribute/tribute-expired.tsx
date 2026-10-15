import { SiteHeader } from '@/components/site-header';
import { SUPPORT_EMAIL } from '@/lib/site';

// Shown at the address of a Básico tribute after its year online is over.
export function TributeExpired({ recipient }: { recipient: string }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-white via-rose-50/40 to-white px-4 pt-24 pb-12">
      <SiteHeader />
      <div className="max-w-md text-center">
        <p className="text-xs tracking-[0.3em] uppercase text-gray-400">Uma homenagem para</p>
        <h1 className="font-script text-6xl text-rose-500 mt-3 mb-6" style={{ fontFamily: "'Great Vibes', cursive" }}>
          {recipient}
        </h1>
        <p className="text-gray-600 leading-relaxed">
          O período desta homenagem terminou e ela não está mais disponível.
        </p>
        <p className="text-gray-500 text-sm mt-4">
          Quem criou esta página pode reativá-la escrevendo para{' '}
          <a href={`mailto:${SUPPORT_EMAIL}`} className="text-rose-500 underline">
            {SUPPORT_EMAIL}
          </a>
          .
        </p>
        <a
          href="/"
          className="inline-flex mt-8 h-11 px-6 items-center rounded-full bg-rose-500 text-white font-medium hover:bg-rose-600"
        >
          Criar uma nova homenagem
        </a>
      </div>
    </div>
  );
}
