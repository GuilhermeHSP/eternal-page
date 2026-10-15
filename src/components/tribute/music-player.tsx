'use client';

import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Music, Pause, Play, Volume2, VolumeX } from 'lucide-react';
import { MusicConfig } from '@/types/tribute';
import { youTubeId } from '@/lib/music-link';

const MUSIC_VOLUME = 0.5;
const MUSIC_UNDER_VOICE = 0.08;

interface MusicPlayerProps {
  config: MusicConfig;
  accentColor: string;
}

// Something that plays the song: the page's own <audio> for files, or YouTube's player for
// YouTube links. The bar below talks to either one the same way.
interface Track {
  play(): void;
  pause(): void;
  paused(): boolean;
  volume(): number; // 0..1
  setVolume(v: number): void;
  canSetVolume(): boolean;
  setMuted(m: boolean): void;
  seek(seconds: number): void;
  destroy(): void;
}

interface TrackEvents {
  onTime(t: number): void;
  onDuration(d: number): void;
  onPlaying(p: boolean): void;
}

function audioTrack(audio: HTMLAudioElement, ev: TrackEvents): Track {
  audio.volume = MUSIC_VOLUME;
  const onTime = () => ev.onTime(audio.currentTime);
  const onMeta = () => ev.onDuration(audio.duration);
  const onPlay = () => ev.onPlaying(true);
  const onPause = () => ev.onPlaying(false);
  audio.addEventListener('timeupdate', onTime);
  audio.addEventListener('loadedmetadata', onMeta);
  audio.addEventListener('play', onPlay);
  audio.addEventListener('pause', onPause);
  return {
    play: () => void audio.play().catch(() => {}),
    pause: () => audio.pause(),
    paused: () => audio.paused,
    volume: () => audio.volume,
    setVolume: (v) => {
      audio.volume = v;
    },
    // iPhones don't let a page change the volume of an <audio>.
    canSetVolume: () => {
      const before = audio.volume;
      audio.volume = before > 0.25 ? before - 0.01 : before + 0.01;
      const ok = audio.volume !== before;
      audio.volume = before;
      return ok;
    },
    setMuted: (m) => {
      audio.muted = m;
    },
    seek: (t) => {
      audio.currentTime = t;
    },
    destroy: () => {
      audio.removeEventListener('timeupdate', onTime);
      audio.removeEventListener('loadedmetadata', onMeta);
      audio.removeEventListener('play', onPlay);
      audio.removeEventListener('pause', onPause);
    },
  };
}

/* eslint-disable @typescript-eslint/no-explicit-any */
let ytApi: Promise<any> | null = null;
function loadYouTubeApi(): Promise<any> {
  const w = window as any;
  if (w.YT?.Player) return Promise.resolve(w.YT);
  if (!ytApi) {
    ytApi = new Promise((resolve) => {
      const previous = w.onYouTubeIframeAPIReady;
      w.onYouTubeIframeAPIReady = () => {
        previous?.();
        resolve(w.YT);
      };
      const script = document.createElement('script');
      script.src = 'https://www.youtube.com/iframe_api';
      script.async = true;
      document.head.appendChild(script);
    });
  }
  return ytApi;
}

function youTubeTrack(host: HTMLElement, videoId: string, ev: TrackEvents): Track {
  let player: any = null;
  let ready = false;
  let wantPlay = false;
  let isPaused = true;
  let vol = MUSIC_VOLUME;
  let timer = 0;
  let destroyed = false;

  const target = document.createElement('div');
  host.appendChild(target);

  loadYouTubeApi().then((YT) => {
    if (destroyed) return;
    player = new YT.Player(target, {
      videoId,
      width: 200,
      height: 200,
      playerVars: { autoplay: 0, controls: 0, loop: 1, playlist: videoId, playsinline: 1, rel: 0, disablekb: 1 },
      events: {
        onReady: () => {
          ready = true;
          player.setVolume(Math.round(vol * 100));
          ev.onDuration(player.getDuration() || 0);
          if (wantPlay) player.playVideo();
        },
        onStateChange: (e: { data: number }) => {
          // 1 playing, 2 paused, 0 ended, 3 buffering
          if (e.data === 1) {
            isPaused = false;
            ev.onPlaying(true);
            ev.onDuration(player.getDuration() || 0);
            clearInterval(timer);
            timer = window.setInterval(() => ev.onTime(player.getCurrentTime() || 0), 500);
          } else if (e.data === 2 || e.data === 0) {
            isPaused = true;
            ev.onPlaying(false);
            clearInterval(timer);
          }
        },
      },
    });
  });

  return {
    play: () => {
      wantPlay = true;
      if (ready) player.playVideo();
    },
    pause: () => {
      wantPlay = false;
      if (ready) player.pauseVideo();
    },
    paused: () => isPaused,
    volume: () => vol,
    setVolume: (v) => {
      vol = v;
      if (ready) player.setVolume(Math.round(v * 100));
    },
    canSetVolume: () => true,
    setMuted: (m) => {
      if (!ready) return;
      if (m) player.mute();
      else player.unMute();
    },
    seek: (t) => {
      if (ready) player.seekTo(t, true);
    },
    destroy: () => {
      destroyed = true;
      clearInterval(timer);
      try {
        player?.destroy();
      } catch {}
      host.innerHTML = '';
    },
  };
}
/* eslint-enable @typescript-eslint/no-explicit-any */

// The page's song, as a slim bar along the bottom: play, what's playing, mute, and a thin
// progress line you can tap to jump.
export function MusicPlayer({ config, accentColor }: MusicPlayerProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const ytHostRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<Track | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const videoId = youTubeId(config.url);

  useEffect(() => {
    const events: TrackEvents = { onTime: setProgress, onDuration: setDuration, onPlaying: setIsPlaying };
    let track: Track | null = null;
    if (videoId && ytHostRef.current) track = youTubeTrack(ytHostRef.current, videoId, events);
    else if (audioRef.current) track = audioTrack(audioRef.current, events);
    trackRef.current = track;
    return () => {
      track?.destroy();
      trackRef.current = null;
    };
  }, [videoId, config.url]);

  // While the voice message plays the song fades down to a whisper, then back up after.
  useEffect(() => {
    let frame = 0;
    const fadeTo = (target: number) => {
      cancelAnimationFrame(frame);
      const step = () => {
        const track = trackRef.current;
        if (!track) return;
        const diff = target - track.volume();
        if (Math.abs(diff) < 0.02) {
          track.setVolume(target);
          return;
        }
        track.setVolume(Math.min(1, Math.max(0, track.volume() + Math.sign(diff) * 0.02)));
        frame = requestAnimationFrame(step);
      };
      step();
    };
    // Where the volume can't be changed (iPhones), the song pauses and resumes instead.
    let pausedForVoice = false;
    const onVoice = (e: Event) => {
      const track = trackRef.current;
      if (!track) return;
      const voiceOn = (e as CustomEvent<boolean>).detail;
      if (track.canSetVolume()) {
        fadeTo(voiceOn ? MUSIC_UNDER_VOICE : MUSIC_VOLUME);
      } else if (voiceOn && !track.paused()) {
        pausedForVoice = true;
        track.pause();
      } else if (!voiceOn && pausedForVoice) {
        pausedForVoice = false;
        track.play();
      }
    };
    window.addEventListener('eternalpage:voice', onVoice);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('eternalpage:voice', onVoice);
    };
  }, []);

  // Opening the envelope is a tap, so the browser allows the music to start right then.
  useEffect(() => {
    const onOpen = () => {
      const track = trackRef.current;
      if (track && track.paused()) track.play();
    };
    window.addEventListener('eternalpage:open', onOpen);
    return () => window.removeEventListener('eternalpage:open', onOpen);
  }, []);

  const togglePlay = () => {
    const track = trackRef.current;
    if (!track) return;
    if (track.paused()) track.play();
    else track.pause();
  };

  const toggleMute = () => {
    trackRef.current?.setMuted(!isMuted);
    setIsMuted(!isMuted);
  };

  const seek = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!trackRef.current || !duration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    trackRef.current.seek(((e.clientX - rect.left) / rect.width) * duration);
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
      {videoId ? (
        // YouTube's player, kept out of sight; the bar below is its remote control.
        <div
          ref={ytHostRef}
          aria-hidden="true"
          className="fixed -left-[9999px] top-0 w-[200px] h-[200px] overflow-hidden pointer-events-none"
        />
      ) : (
        <audio ref={audioRef} src={config.url} preload="metadata" loop />
      )}

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
              {isPlaying ? 'Tocando agora' : 'Toque para ouvir'}
            </p>
            <p className="truncate text-sm text-gray-800">
              <span className="font-semibold">{config.title || 'Nossa música'}</span>
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
