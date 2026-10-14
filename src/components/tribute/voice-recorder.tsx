'use client';

import { useEffect, useRef, useState } from 'react';
import { Mic, Square, Trash2, Upload, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface VoiceRecorderProps {
  value: string | null;
  onChange: (dataUrl: string | null) => void;
  onFocus?: () => void;
}

const MAX_SECONDS = 120;
const MAX_UPLOAD_BYTES = 8 * 1024 * 1024;

function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(blob);
  });
}

// Records a short voice message in the browser (or takes an audio file) and hands it back as a
// data URL, saved with the tribute like the other media.
export function VoiceRecorder({ value, onChange, onFocus }: VoiceRecorderProps) {
  const [recording, setRecording] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<number | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => () => {
    if (timerRef.current) window.clearInterval(timerRef.current);
    recorderRef.current?.stream.getTracks().forEach((t) => t.stop());
  }, []);

  const stop = () => {
    recorderRef.current?.stop();
    if (timerRef.current) window.clearInterval(timerRef.current);
    setRecording(false);
  };

  const start = async () => {
    onFocus?.();
    setError(null);
    if (!navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === 'undefined') {
      setError('Este navegador não grava áudio. Envie um arquivo de áudio.');
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      chunksRef.current = [];
      recorder.ondataavailable = (e) => e.data.size && chunksRef.current.push(e.data);
      recorder.onstop = async () => {
        stream.getTracks().forEach((t) => t.stop());
        setBusy(true);
        try {
          const blob = new Blob(chunksRef.current, { type: recorder.mimeType || 'audio/webm' });
          onChange(await blobToDataUrl(blob));
        } finally {
          setBusy(false);
        }
      };
      recorderRef.current = recorder;
      recorder.start();
      setSeconds(0);
      setRecording(true);
      timerRef.current = window.setInterval(() => {
        setSeconds((s) => {
          if (s + 1 >= MAX_SECONDS) stop();
          return s + 1;
        });
      }, 1000);
    } catch {
      setError('Não foi possível usar o microfone. Verifique a permissão ou envie um arquivo.');
    }
  };

  const upload = async (files: FileList | null) => {
    const file = files?.[0];
    if (!file) return;
    if (!file.type.startsWith('audio/')) {
      setError('Envie um arquivo de áudio (MP3, M4A, WAV...).');
      return;
    }
    if (file.size > MAX_UPLOAD_BYTES) {
      setError('O áudio deve ter menos de 8 MB.');
      return;
    }
    setError(null);
    setBusy(true);
    try {
      onChange(await blobToDataUrl(file));
    } finally {
      setBusy(false);
    }
  };

  const mm = String(Math.floor(seconds / 60));
  const ss = String(seconds % 60).padStart(2, '0');

  return (
    <div className="rounded-xl border border-gray-100 bg-white p-4">
      <p className="font-medium text-gray-800">Mensagem de voz (opcional)</p>
      <p className="text-xs text-gray-400 mt-0.5">
        Grave até 2 minutos com a sua voz. A pessoa ouve na página, num player só para isso.
      </p>

      {value ? (
        <div className="mt-3 flex flex-wrap items-center gap-3">
          <audio src={value} controls className="h-10 max-w-full" />
          <Button type="button" variant="ghost" size="sm" className="gap-2 text-gray-500" onClick={() => onChange(null)}>
            <Trash2 className="h-4 w-4" />
            Remover
          </Button>
        </div>
      ) : (
        <div className="mt-3 flex flex-wrap items-center gap-3">
          {recording ? (
            <Button type="button" onClick={stop} className="gap-2 bg-red-500 hover:bg-red-600">
              <Square className="h-4 w-4" fill="currentColor" />
              Parar ({mm}:{ss})
            </Button>
          ) : (
            <Button type="button" onClick={start} disabled={busy} className="gap-2 bg-rose-500 hover:bg-rose-600">
              {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Mic className="h-4 w-4" />}
              Gravar mensagem
            </Button>
          )}
          <Button
            type="button"
            variant="outline"
            disabled={recording || busy}
            className="gap-2"
            onClick={() => {
              onFocus?.();
              fileRef.current?.click();
            }}
          >
            <Upload className="h-4 w-4" />
            Enviar áudio
          </Button>
          <input
            ref={fileRef}
            type="file"
            accept="audio/*"
            className="sr-only"
            onChange={(e) => {
              upload(e.target.files);
              e.target.value = '';
            }}
          />
          {recording && <span className="inline-flex items-center gap-2 text-sm text-red-500"><span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />Gravando</span>}
        </div>
      )}
      {error && <p className="mt-2 text-sm text-red-500">{error}</p>}
    </div>
  );
}
