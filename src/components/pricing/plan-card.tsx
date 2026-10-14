'use client';

import { Check, CheckCircle2, Star, X } from 'lucide-react';
import { type PackageConfig, formatPrice, discountLabel } from '@/lib/packages';

interface PlanCardProps {
  pkg: PackageConfig;
  onSelect: () => void;
  ctaLabel: string;
  selected?: boolean;
  // Kept for callers; only the picked card ever gets the rose outline.
  anySelected?: boolean;
}

// One package: name, regular price struck through, today's price, what's in and what isn't.
// Used on the home page and in the creator's first step so both always show the same thing.
// Only a picked card gets the rose outline and the "Selecionado" mark; "Mais escolhido" is a
// dark tag of its own so it never reads as already chosen.
export function PlanCard({ pkg, onSelect, ctaLabel, selected = false }: PlanCardProps) {
  const discount = discountLabel(pkg);

  return (
    <div
      onClick={onSelect}
      className={`relative flex flex-col rounded-3xl bg-white p-7 cursor-pointer transition-shadow ${
        selected
          ? 'ring-2 ring-rose-500 shadow-2xl shadow-rose-100'
          : 'ring-1 ring-gray-200 shadow-sm hover:ring-rose-200'
      }`}
    >
      {pkg.popular && (
        <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 whitespace-nowrap inline-flex items-center gap-1.5 px-4 py-1 rounded-full bg-gray-900 text-white text-xs font-semibold uppercase tracking-wider">
          <Star className="h-3 w-3 text-amber-300" fill="currentColor" />
          Mais escolhido
        </span>
      )}

      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="font-title text-2xl font-semibold text-gray-900">{pkg.displayName}</h3>
          <p className="mt-1 text-sm text-gray-500">{pkg.description}</p>
        </div>
        {selected ? (
          <span className="shrink-0 inline-flex items-center gap-1 rounded-full bg-rose-500 px-2.5 py-1 text-xs font-semibold text-white">
            <CheckCircle2 className="h-3.5 w-3.5" />
            Selecionado
          </span>
        ) : discount && (
          <span className="shrink-0 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">
            {discount}
          </span>
        )}
      </div>

      <div className="mt-6">
        {pkg.originalPrice && (
          <p className="text-sm text-gray-400">
            de <span className="line-through">{formatPrice(pkg.originalPrice)}</span> por
          </p>
        )}
        <p className="flex items-baseline gap-1.5 tabular-nums">
          <span className="text-4xl font-bold text-gray-900">{formatPrice(pkg.price)}</span>
          <span className="text-sm text-gray-500">pagamento único</span>
        </p>
      </div>

      <ul className="mt-6 space-y-2.5 text-gray-700 flex-1">
        {pkg.features.map((f) => (
          <li key={f} className="flex gap-2.5 text-sm">
            <Check className="h-5 w-5 shrink-0 text-rose-500" />
            {f}
          </li>
        ))}
        {pkg.missing?.map((f) => (
          <li key={f} className="flex gap-2.5 text-sm text-gray-400">
            <X className="h-5 w-5 shrink-0 text-gray-300" />
            <span className="line-through">{f}</span>
          </li>
        ))}
      </ul>

      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onSelect();
        }}
        className={`mt-8 h-12 rounded-full font-semibold transition-colors ${
          selected
            ? 'bg-rose-500 hover:bg-rose-600 text-white'
            : 'bg-white ring-1 ring-rose-300 hover:bg-rose-50 text-rose-600'
        }`}
      >
        {ctaLabel}
      </button>
    </div>
  );
}
