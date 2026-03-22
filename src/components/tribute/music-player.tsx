'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Music, Pause, Play, Volume2, VolumeX } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { MusicConfig } from '@/types/tribute';

interface MusicPlayerProps {
  config: MusicConfig;
  accentColor: string;
}

export function MusicPlayer({ config, accentColor }: MusicPlayerProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(0.5);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleTimeUpdate = () => {
      setProgress(audio.currentTime);
    };

    const handleLoadedMetadata = () => {
      setDuration(audio.duration);
    };

    const handleEnded = () => {
      setIsPlaying(false);
      setProgress(0);
    };

    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('ended', handleEnded);
    };
  }, []);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  const togglePlay = async () => {
    const audio = audioRef.current;
    if (!audio) return;

    try {
      if (isPlaying) {
        audio.pause();
      } else {
        await audio.play();
      }
      setIsPlaying(!isPlaying);
    } catch (error) {
      console.log('Audio playback failed:', error);
    }
  };

  const toggleMute = () => {
    if (audioRef.current) {
      audioRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const handleSeek = (value: number[]) => {
    const audio = audioRef.current;
    if (audio) {
      audio.currentTime = value[0];
      setProgress(value[0]);
    }
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <>
      <audio ref={audioRef} src={config.url} preload="metadata" loop />

      {/* Floating music player */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="fixed bottom-4 right-4 z-50"
      >
        <motion.div
          layout
          className="bg-white/95 backdrop-blur-md rounded-full shadow-lg border border-gray-100 overflow-hidden"
          style={{ borderColor: `${accentColor}20` }}
        >
          <AnimatePresence>
            {isExpanded && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="px-4 pt-3 pb-2"
              >
                {/* Progress bar */}
                <div className="mb-2 w-48">
                  <Slider
                    value={[progress]}
                    max={duration || 100}
                    step={0.1}
                    onValueChange={handleSeek}
                    className="cursor-pointer"
                    style={{
                      // @ts-expect-error custom style
                      '--slider-color': accentColor,
                    }}
                  />
                  <div className="flex justify-between text-xs text-gray-400 mt-1 font-mono">
                    <span>{formatTime(progress)}</span>
                    <span>{formatTime(duration)}</span>
                  </div>
                </div>

                {/* Volume control */}
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={toggleMute}
                  >
                    {isMuted ? (
                      <VolumeX className="h-4 w-4" />
                    ) : (
                      <Volume2 className="h-4 w-4" />
                    )}
                  </Button>
                  <Slider
                    value={[isMuted ? 0 : volume * 100]}
                    max={100}
                    step={1}
                    onValueChange={(v) => {
                      setVolume(v[0] / 100);
                      if (v[0] > 0) setIsMuted(false);
                    }}
                    className="w-20 cursor-pointer"
                  />
                </div>

                {/* Song info */}
                {config.title && (
                  <div className="mt-2 text-xs text-gray-500 text-center">
                    <span className="font-medium" style={{ color: accentColor }}>
                      {config.title}
                    </span>
                    {config.artist && <span> • {config.artist}</span>}
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Main controls */}
          <div className="flex items-center p-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={togglePlay}
              className="h-10 w-10 rounded-full transition-all"
              style={{
                backgroundColor: isPlaying ? `${accentColor}15` : 'transparent',
                color: accentColor,
              }}
            >
              {isPlaying ? (
                <Pause className="h-5 w-5" />
              ) : (
                <Play className="h-5 w-5 ml-0.5" />
              )}
            </Button>

            <motion.div
              className="flex items-center gap-1 cursor-pointer px-2"
              onClick={() => setIsExpanded(!isExpanded)}
              whileHover={{ scale: 1.02 }}
            >
              <Music
                className="h-4 w-4"
                style={{ color: accentColor }}
              />
              <span className="text-xs text-gray-500 font-medium">
                {isPlaying ? 'Playing' : 'Music'}
              </span>
            </motion.div>
          </div>
        </motion.div>
      </motion.div>

      {/* Visual playing indicator */}
      <AnimatePresence>
        {isPlaying && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed bottom-20 right-4 z-40"
          >
            <div className="flex items-end gap-0.5 h-4">
              {[1, 2, 3, 4].map((i) => (
                <motion.div
                  key={i}
                  className="w-1 rounded-full"
                  style={{ backgroundColor: accentColor }}
                  animate={{
                    height: ['100%', '40%', '100%'],
                  }}
                  transition={{
                    duration: 0.5,
                    repeat: Infinity,
                    delay: i * 0.1,
                    ease: 'easeInOut',
                  }}
                />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
