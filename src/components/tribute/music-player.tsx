'use client';

import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Music, Pause, Play, Volume2, VolumeX } from 'lucide-react';
import { MusicConfig } from '@/types/tribute';

interface MusicPlayerProps {
  config: MusicConfig;
  accentColor: string;
}

// The page's song, as a slim bar along the bottom: play, what's playing, mute, and a thin
// progress line you can tap to jump.
export function MusicPlayer({ config, accentColor }: MusicPlayerProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.volume = 0.5;
    const onTime = () => setProgress(audio.currentTime);
    const onMeta = () => setDuration(audio.duration);
    const onPlay = () => setIsPlaying(true);
    const onPause = () => setIsPlaying(false);
    audio.addEventListener('timeupdate', onTime);
    audio.addEventListener('loadedmetadata', onMeta);
    audio.addEventListener('play', onPlay);
    audio.addEventListener('pause', onPause);
    return () => {
      audio.removeEventListener('timeupdate', onTime);
      audio.removeEventListener('loadedmetadata', onMeta);
      audio.removeEventListener('play', onPlay);
      audio.removeEventListener('pause', onPause);
    };
  }, []);

  // Opening the envelope is a tap, so the browser allows the music to start right then.
  useEffect(() => {
    const onOpen = () => {
      const audio = audioRef.current;
      if (!audio || !audio.paused) return;
      audio.play().catch(() => {});
    };
    window.addEventListener('eternalpage:open', onOpen);
    return () => window.removeEventListener('eternalpage:open', onOpen);
  }, []);

  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (audio.paused) audio.play().catch(() => {});
    else audio.pause();
  };

  const toggleMute = () => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  const seek = (e: React.MouseEvent<HTMLDivElement>) => {
    const audio = audioRef.current;
    if (!audio || !duration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    audio.currentTime = ((e.clientX - rect.left) / rect.width) * duration;
  };

  const formatTime = (time: number) => {
    if (!Number.isFinite(time)) return '0:00';
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const percent = duration ? (progress / duration) * 100 : 0;

  return (
    <>
      <audio ref={audioRef} src={config.url} preload="metadata" loop />

      <motion.div
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="fixed bottom-0 inset-x-0 z-50 bg-white/95 backdrop-blur-md shadow-[0_-4px_20px_rgba(0,0,0,0.06)]"
        role="region"
        aria-label="Música da homenagem"
      >
        {/* Progress: a thin line along the top edge, tap to jump */}
        <div className="relative h-1.5 -mt-0.5 cursor-pointer group" onClick={seek}>
          <div className="absolute inset-x-0 top-0.5 h-1 bg-gray-100" />
          <div
            className="absolute left-0 top-0.5 h-1 transition-[width] duration-200"
            style={{ width: `${percent}%`, backgroundColor: accentColor }}
          />
        </div>

        <div className="max-w-2xl mx-auto flex items-center gap-3 px-4 py-2.5">
          <button
            type="button"
            onClick={togglePlay}
            aria-label={isPlaying ? 'Pausar música' : 'Tocar música'}
            className="press shrink-0 h-11 w-11 rounded-full flex items-center justify-center text-white shadow-md"
            style={{ backgroundColor: accentColor }}
          >
            {isPlaying ? <Pause className="h-5 w-5" fill="currentColor" /> : <Play className="h-5 w-5 ml-0.5" fill="currentColor" />}
          </button>

          <div className="min-w-0 flex-1">
            <p className="flex items-center gap-1.5 text-[11px] font-title uppercase tracking-[0.18em]" style={{ color: accentColor }}>
              {isPlaying ? (
                <span className="flex items-end gap-0.5 h-3" aria-hidden="true">
                  {[0, 1, 2, 3].map((i) => (
                    <motion.span
                      key={i}
                      className="w-0.5 rounded-full"
                      style={{ backgroundColor: accentColor }}
                      animate={{ height: ['100%', '35%', '100%'] }}
                      transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.12, ease: 'easeInOut' }}
                    />
                  ))}
                </span>
              ) : (
                <Music className="h-3 w-3" />
              )}
              {isPlaying ? 'Tocando agora' : 'Nossa música'}
            </p>
            <p className="truncate text-sm text-gray-800">
              <span className="font-semibold">{config.title || 'Toque para ouvir'}</span>
              {config.artist && <span className="text-gray-500"> · {config.artist}</span>}
            </p>
          </div>

          <span className="hidden sm:block shrink-0 text-xs text-gray-400 tabular-nums">
            {formatTime(progress)} / {formatTime(duration)}
          </span>

          <button
            type="button"
            onClick={toggleMute}
            aria-label={isMuted ? 'Ativar som' : 'Silenciar'}
            className="shrink-0 h-9 w-9 rounded-full flex items-center justify-center text-gray-500 hover:bg-gray-100"
          >
            {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
          </button>
        </div>
      </motion.div>
    </>
  );
}
