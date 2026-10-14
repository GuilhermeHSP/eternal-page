'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, useInView } from 'framer-motion';
import { CounterConfig } from '@/types/tribute';

interface CounterSectionProps {
  config: CounterConfig;
  accentColor: string;
}

interface Elapsed {
  years: number;
  months: number;
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

// Calendar difference between two moments (years and months by the calendar, not by 365 days).
function diff(from: Date, to: Date): Elapsed {
  let years = to.getFullYear() - from.getFullYear();
  let months = to.getMonth() - from.getMonth();
  let days = to.getDate() - from.getDate();
  let hours = to.getHours() - from.getHours();
  let minutes = to.getMinutes() - from.getMinutes();
  let seconds = to.getSeconds() - from.getSeconds();

  if (seconds < 0) { seconds += 60; minutes -= 1; }
  if (minutes < 0) { minutes += 60; hours -= 1; }
  if (hours < 0) { hours += 24; days -= 1; }
  if (days < 0) {
    days += new Date(to.getFullYear(), to.getMonth(), 0).getDate();
    months -= 1;
  }
  if (months < 0) { months += 12; years -= 1; }
  return { years, months, days, hours, minutes, seconds };
}

function parseDate(value: string): Date | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(value);
  if (!m) return null;
  const d = new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
  return Number.isNaN(d.getTime()) ? null : d;
}

export function CounterSection({ config, accentColor }: CounterSectionProps) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-80px' });
  const target = parseDate(config.date);
  // Rendered on the client only: the numbers change every second.
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    setNow(new Date());
    const timer = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  if (!target) return null;

  const future = now ? target.getTime() > now.getTime() : false;
  const t = now ? (future ? diff(now, target) : diff(target, now)) : null;
  const label = config.label?.trim() || (future ? 'Faltam' : 'Juntos há');

  const units: Array<[number | undefined, string, string]> = [
    [t?.years, 'ano', 'anos'],
    [t?.months, 'mês', 'meses'],
    [t?.days, 'dia', 'dias'],
    [t?.hours, 'hora', 'horas'],
    [t?.minutes, 'minuto', 'minutos'],
    [t?.seconds, 'segundo', 'segundos'],
  ];
  // Leading zero units (e.g. 0 anos for a recent date) are left out.
  const firstNonZero = units.findIndex(([v]) => (v ?? 0) > 0);
  const shown = t ? units.slice(Math.max(0, Math.min(firstNonZero, 3))) : units;

  const since = target.toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' });

  return (
    <section ref={ref} className="py-20 px-4">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={isInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.8 }}
        className="max-w-3xl mx-auto text-center"
      >
        <h2 className="font-script text-5xl md:text-6xl text-gray-800 leading-tight">{label}</h2>

        <div className="mt-10 flex flex-wrap justify-center gap-3 md:gap-4">
          {shown.map(([value, one, many], i) => (
            <motion.div
              key={many}
              initial={{ opacity: 0, y: 16 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.15 + i * 0.08 }}
              className="w-[88px] md:w-[104px] rounded-2xl bg-white/80 py-4 md:py-5"
              style={{ boxShadow: '0 1px 2px rgba(60,40,30,0.05), 0 12px 28px -14px rgba(60,40,30,0.25)' }}
            >
              <div className="font-title text-4xl md:text-5xl font-semibold tabular-nums leading-none" style={{ color: accentColor }}>
                {value ?? '–'}
              </div>
              <div className="mt-2 font-title text-[11px] md:text-xs uppercase tracking-[0.18em] text-gray-500">
                {value === 1 ? one : many}
              </div>
            </motion.div>
          ))}
        </div>

        <p className="mt-8 font-title text-sm uppercase tracking-[0.2em] text-gray-500">
          {future ? 'Até' : 'Desde'} {since}
        </p>
      </motion.div>
    </section>
  );
}
