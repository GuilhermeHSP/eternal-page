'use client';

import { motion } from 'framer-motion';
import { Check, X, Heart, Sparkles, Crown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PACKAGES, formatPrice, COMPARISON_FEATURES, PackageType } from '@/lib/packages';

interface PricingSectionProps {
  onSelectPackage: (packageType: PackageType) => void;
}

export function PricingSection({ onSelectPackage }: PricingSectionProps) {
  return (
    <section className="py-20 px-4 bg-white">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-rose-50 text-rose-600 text-sm font-medium mb-4">
            <Sparkles className="h-4 w-4" />
            Escolha seu pacote
          </span>
          <h2 className="text-3xl md:text-4xl font-serif font-medium text-gray-900 mb-4">
            Crie sua Eternal Page
          </h2>
          <p className="text-gray-500 max-w-xl mx-auto">
            Escolha o pacote perfeito para sua homenagem. Cada página é única e permanente.
          </p>
        </motion.div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-16">
          {Object.values(PACKAGES).map((pkg, index) => (
            <motion.div
              key={pkg.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className={`relative rounded-2xl p-6 ${
                pkg.highlighted
                  ? 'bg-gradient-to-b from-rose-50 to-white border-2 border-rose-200 shadow-xl scale-105'
                  : 'bg-white border border-gray-200 shadow-lg'
              }`}
            >
              {/* Popular badge */}
              {pkg.highlighted && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-rose-500 text-white text-xs font-semibold">
                    <Crown className="h-3 w-3" />
                    Mais Popular
                  </span>
                </div>
              )}

              {/* Package name */}
              <div className="text-center mb-4">
                <h3 className="text-xl font-semibold text-gray-800 mb-1">
                  {pkg.name}
                </h3>
                <p className="text-sm text-gray-500">
                  {pkg.description}
                </p>
              </div>

              {/* Price */}
              <div className="text-center mb-6">
                <span className="text-4xl font-bold text-gray-900">
                  {formatPrice(pkg.price, pkg.currency)}
                </span>
                <span className="text-gray-500 text-sm ml-1">/ único</span>
              </div>

              {/* Features list */}
              <ul className="space-y-3 mb-6">
                {pkg.features.map((feature, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
                    <Check className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                    {feature}
                  </li>
                ))}
              </ul>

              {/* CTA Button */}
              <Button
                className={`w-full gap-2 ${
                  pkg.highlighted
                    ? 'bg-rose-500 hover:bg-rose-600 text-white'
                    : 'bg-gray-900 hover:bg-gray-800 text-white'
                }`}
                onClick={() => onSelectPackage(pkg.id)}
              >
                <Heart className="h-4 w-4" />
                Criar minha Eternal Page
              </Button>
            </motion.div>
          ))}
        </div>

        {/* Comparison Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="bg-gray-50 rounded-2xl p-6 md:p-8"
        >
          <h3 className="text-xl font-semibold text-gray-800 text-center mb-8">
            Compare os pacotes
          </h3>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">
                    Recursos
                  </th>
                  {Object.values(PACKAGES).map((pkg) => (
                    <th key={pkg.id} className="text-center py-3 px-4 text-sm font-semibold text-gray-800">
                      {pkg.displayName}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {COMPARISON_FEATURES.map((feature, index) => (
                  <tr
                    key={index}
                    className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}
                  >
                    <td className="py-3 px-4 text-sm text-gray-600 font-medium">
                      {feature.name}
                    </td>
                    {(['basic', 'plus', 'premium'] as PackageType[]).map((pkgId) => (
                      <td key={pkgId} className="text-center py-3 px-4">
                        {typeof feature[pkgId] === 'boolean' ? (
                          feature[pkgId] ? (
                            <Check className="h-5 w-5 text-green-500 mx-auto" />
                          ) : (
                            <X className="h-5 w-5 text-gray-300 mx-auto" />
                          )
                        ) : (
                          <span className="text-sm text-gray-700">{feature[pkgId]}</span>
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
                {/* Price row */}
                <tr className="bg-white border-t border-gray-200">
                  <td className="py-4 px-4 text-sm text-gray-600 font-semibold">
                    Preço
                  </td>
                  {Object.values(PACKAGES).map((pkg) => (
                    <td key={pkg.id} className="text-center py-4 px-4">
                      <span className="text-lg font-bold text-gray-900">
                        {formatPrice(pkg.price, pkg.currency)}
                      </span>
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
