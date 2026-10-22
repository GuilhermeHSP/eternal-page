// Photos, music and voice are kept in the creator as data URLs (so they survive a reload, see
// lib/draft-store). Before the draft is saved, each one is sent on its own to /api/media and
// replaced by its stored address, so "Gerar prévia" never sends one huge request.

export class UploadError extends Error {
  constructor(message: string, readonly network = false) {
    super(message);
  }
}

// The same file is sent once per visit, even if "Gerar prévia" is pressed again.
const uploaded = new Map<string, string>();

function dataUrlToBlob(dataUrl: string): Blob {
  const comma = dataUrl.indexOf(',');
  const header = dataUrl.slice(5, comma); // after "data:"
  const type = header.split(';base64')[0] || 'application/octet-stream';
  const binary = atob(dataUrl.slice(comma + 1));
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return new Blob([bytes], { type });
}

async function send(blob: Blob, kind: 'image' | 'audio'): Promise<string> {
  let res: Response;
  try {
    res = await fetch(`/api/media?kind=${kind}`, {
      method: 'POST',
      headers: { 'Content-Type': blob.type },
      body: blob,
    });
  } catch {
    throw new UploadError(
      'A conexão caiu enquanto enviávamos seus arquivos. Verifique a internet e toque em "Gerar prévia" de novo. Nada do que você fez foi perdido.',
      true,
    );
  }
  const data = await res.json().catch(() => null);
  if (!res.ok || typeof data?.url !== 'string') {
    throw new UploadError(
      (typeof data?.error === 'string' && data.error) ||
        'Não conseguimos enviar um dos arquivos. Toque em "Gerar prévia" de novo.',
    );
  }
  return data.url;
}

// Returns the value to save: the stored address for a data URL, anything else unchanged.
export async function uploadIfDataUrl<T>(value: T, kind: 'image' | 'audio'): Promise<T | string> {
  if (typeof value !== 'string' || !value.startsWith('data:')) return value;
  const known = uploaded.get(value);
  if (known) return known;
  const blob = dataUrlToBlob(value);
  let url: string;
  try {
    url = await send(blob, kind);
  } catch (e) {
    // One more try: a phone switching between Wi-Fi and mobile data drops a request now and then.
    if (!(e instanceof UploadError) || !e.network) throw e;
    url = await send(blob, kind);
  }
  uploaded.set(value, url);
  return url;
}
