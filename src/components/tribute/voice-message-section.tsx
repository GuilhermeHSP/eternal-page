'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, useInView } from 'framer-motion';
import { Mic, Pause, Play } from 'lucide-react';

interface VoiceMessageSectionProps {
  url: string;
  accentColor: string;
  authorName?: string;
}

const BARS = [18, 30, 22, 40, 26, 46, 32, 20, 38, 28, 44, 24, 34, 16, 30, 42, 22, 36, 26, 18, 32, 40, 24, 30];

// A recorded message from the giver, with one big play button and a simple waveform that fills
// as it plays. The background music drops to a whisper while the voice plays.
export function VoiceMessageSection({ url, accentColor, authorName }: VoiceMessageSectionProps) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-80px' });
  const audioRef = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    const onTime = () => setProgress(audio.duration ? audio.currentTime / audio.duration : 0);
    const onEnd = () => {
      setPlaying(false);
      setProgress(0);
    };
    // Tell the music player, which lowers itself while the voice plays.
    const announce = (on: boolean) => () => window.dispatchEvent(new CustomEvent('eternalpage:voice', { detail: on }));
    const onPlay = announce(true);
    const onStop = announce(false);
    audio.addEventListener('timeupdate', onTime);
    audio.addEventListener('ended', onEnd);
    audio.addEventListener('play', onPlay);
    audio.addEventListener('pause', onStop);
    audio.addEventListener('ended', onStop);
    return () => {
      audio.removeEventListener('timeupdate', onTime);
      audio.removeEventListener('ended', onEnd);
      audio.removeEventListener('play', onPlay);
      audio.removeEventListener('pause', onStop);
      audio.removeEventListener('ended', onStop);
      onStop();
    };
  }, []);

  const toggle = async () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (playing) {
      audio.pause();
      setPlaying(false);
      return;
    }
    try {
      await audio.play();
      setPlaying(true);
    } catch {
      // playback refused
    }
  };

  return (
    <section ref={ref} className="py-20 px-4">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={isInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.8 }}
        className="max-w-xl mx-auto text-center"
      >
        <div className="inline-flex items-center gap-2 text-gray-500 mb-3">
          <Mic className="h-5 w-5" style={{ color: accentColor }} />
          <span className="font-title text-sm tracking-[0.18em] uppercase">Ouça com carinho</span>
        </div>
        <h2 className="font-script text-5xl md:text-6xl leading-tight text-gray-800">Uma mensagem para você</h2>

        <div
          className="mt-10 flex items-center gap-5 rounded-full bg-white/85 p-3 pr-6"
          style={{ boxShadow: '0 1px 2px rgba(60,40,30,0.05), 0 16px 36px -18px rgba(60,40,30,0.3)' }}
        >
          <button
            type="button"
            onClick={toggle}
            aria-label={playing ? 'Pausar mensagem de voz' : 'Ouvir mensagem de voz'}
            className="shrink-0 w-14 h-14 rounded-full text-white flex items-center justify-center transition-transform active:scale-95"
            style={{ backgroundColor: accentColor }}
          >
            {playing ? <Pause className="h-6 w-6" fill="currentColor" /> : <Play className="h-6 w-6 ml-0.5" fill="currentColor" />}
          </button>
          <div className="flex-1 flex items-center justify-between gap-[3px] h-12" aria-hidden="true">
            {BARS.map((h, i) => (
              <span
                key={i}
                className="flex-1 rounded-full transition-colors duration-200"
                style={{
                  height: `${h}px`,
                  maxHeight: '100%',
                  backgroundColor: i / BARS.length < progress ? accentColor : `${accentColor}33`,
                }}
              />
            ))}
          </div>
        </div>
        {authorName && (
          <p className="mt-6 font-title text-sm uppercase tracking-[0.2em] text-gray-500">
            {/^com /i.test(authorName) ? authorName : `De ${authorName}`}
          </p>
        )}
        <audio ref={audioRef} src={url} preload="metadata" />
      </motion.div>
    </section>
  );
}
