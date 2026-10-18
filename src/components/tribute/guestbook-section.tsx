'use client';

import { useEffect, useRef, useState, type FormEvent } from 'react';
import { motion, useInView } from 'framer-motion';
import { MessageCircleHeart, Send, Loader2 } from 'lucide-react';

interface GuestMessage {
  id: string;
  name: string;
  message: string;
  createdAt: string;
}

interface GuestbookSectionProps {
  slug: string;
  accentColor: string;
  recipient: string;
  // On previews nothing is saved; the wall starts empty and the form is disabled.
  live: boolean;
}

const ROTATE = [-1.5, 1, -0.5, 1.5, -1, 0.5];

// Family and friends leave short notes on the page, shown like cards pinned to a board.
export function GuestbookSection({ slug, accentColor, recipient, live }: GuestbookSectionProps) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-80px' });
  const [messages, setMessages] = useState<GuestMessage[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [name, setName] = useState('');
  const [message, setMessage] = useState('');
  const [website, setWebsite] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  useEffect(() => {
    if (!live) return;
    fetch(`/api/tributes/${encodeURIComponent(slug)}/messages`)
      .then((r) => (r.ok ? r.json() : { messages: [] }))
      .then((d) => setMessages(d.messages ?? []))
      .catch(() => {})
      .finally(() => setLoaded(true));
  }, [slug, live]);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (!live) return;
    setError(null);
    setSending(true);
    try {
      const res = await fetch(`/api/tributes/${encodeURIComponent(slug)}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, message, website }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error || 'Não foi possível enviar. Tente de novo.');
        return;
      }
      if (data.message) setMessages((prev) => [data.message, ...prev]);
      setMessage('');
      setSent(true);
    } catch {
      setError('Não foi possível enviar. Tente de novo.');
    } finally {
      setSending(false);
    }
  };

  return (
    <section ref={ref} className="py-20 px-4">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={isInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.8 }}
        className="max-w-4xl mx-auto"
      >
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 text-gray-500 mb-3">
            <MessageCircleHeart className="h-5 w-5" style={{ color: accentColor }} />
            <span className="font-title text-sm tracking-[0.18em] uppercase">Mural de recados</span>
          </div>
          <h2 className="font-script text-5xl md:text-6xl leading-tight text-gray-800">Deixe seu carinho</h2>
          <p className="mt-3 font-title text-sm text-gray-500">Escreva uma mensagem para {recipient}</p>
        </div>

        <form
          onSubmit={submit}
          className="max-w-xl mx-auto rounded-2xl bg-white/85 p-5 md:p-6"
          style={{ boxShadow: '0 1px 2px rgba(60,40,30,0.05), 0 16px 36px -18px rgba(60,40,30,0.3)' }}
        >
          <div className="grid gap-3">
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Seu nome"
              maxLength={40}
              required
              disabled={!live}
              aria-label="Seu nome"
              className="h-11 px-4 rounded-xl border border-gray-200 bg-white outline-none focus-visible:ring-4 disabled:bg-gray-50"
              style={{ ['--tw-ring-color' as string]: `${accentColor}33` }}
            />
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Sua mensagem"
              maxLength={400}
              rows={3}
              required
              disabled={!live}
              aria-label="Sua mensagem"
              className="px-4 py-3 rounded-xl border border-gray-200 bg-white outline-none resize-none focus-visible:ring-4 disabled:bg-gray-50"
              style={{ ['--tw-ring-color' as string]: `${accentColor}33` }}
            />
            {/* honeypot, hidden from people */}
            <input
              value={website}
              onChange={(e) => setWebsite(e.target.value)}
              tabIndex={-1}
              autoComplete="off"
              aria-hidden="true"
              className="absolute -left-[9999px] h-0 w-0 opacity-0"
              name="website"
            />
            <button
              type="submit"
              disabled={!live || sending}
              className="h-11 rounded-xl text-white font-medium inline-flex items-center justify-center gap-2 disabled:opacity-60"
              style={{ backgroundColor: accentColor }}
            >
              {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              {sent ? 'Enviar outra mensagem' : 'Deixar mensagem'}
            </button>
            {!live && <p className="text-center text-xs text-gray-400">O mural fica aberto para recados depois que a página é publicada.</p>}
            {error && <p className="text-center text-sm text-red-500">{error}</p>}
            {sent && !error && <p className="text-center text-sm" style={{ color: accentColor }}>Recado enviado com carinho!</p>}
          </div>
        </form>

        {messages.length === 0 && live && loaded && (
          <p className="mt-10 text-center font-title text-sm text-gray-400">Seja o primeiro a deixar um recado.</p>
        )}

        {messages.length > 0 && (
          <ul className="mt-10 columns-1 sm:columns-2 md:columns-3 gap-4">
            {messages.map((m, i) => (
              <li
                key={m.id}
                className="mb-4 break-inside-avoid rounded-xl bg-[#fffdf8] p-5"
                style={{
                  transform: `rotate(${ROTATE[i % ROTATE.length]}deg)`,
                  boxShadow: '0 1px 2px rgba(60,40,30,0.06), 0 10px 24px -14px rgba(60,40,30,0.3)',
                  borderTop: `3px solid ${accentColor}`,
                }}
              >
                <p className="font-title font-light text-gray-700 leading-relaxed whitespace-pre-line">{m.message}</p>
                <p className="mt-3 font-script text-2xl" style={{ color: accentColor }}>
                  {m.name}
                </p>
              </li>
            ))}
          </ul>
        )}
      </motion.div>
    </section>
  );
}
