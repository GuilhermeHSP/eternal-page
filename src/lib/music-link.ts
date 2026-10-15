// Music links people paste in the creator. Two kinds play on the tribute page:
// - YouTube (youtube.com, youtu.be, music.youtube.com, Shorts): played through YouTube's player;
// - a direct link to an audio file (https://.../song.mp3): played by the page itself.
// Spotify, Deezer and similar only let logged-in users play full songs, so they are refused
// with a message suggesting YouTube instead.

export type MusicLink =
  | { kind: 'youtube'; videoId: string; url: string }
  | { kind: 'audio'; url: string };

const YT_ID = /^[A-Za-z0-9_-]{11}$/;

export function youTubeId(raw: string): string | null {
  let u: URL;
  try {
    u = new URL(raw.trim());
  } catch {
    return null;
  }
  const host = u.hostname.toLowerCase().replace(/^www\.|^m\./, '');
  let id: string | null = null;
  if (host === 'youtu.be') {
    id = u.pathname.split('/')[1] || null;
  } else if (host === 'youtube.com' || host === 'music.youtube.com' || host === 'youtube-nocookie.com') {
    if (u.pathname === '/watch') id = u.searchParams.get('v');
    else {
      const m = /^\/(?:shorts|embed|live|v)\/([^/?#]+)/.exec(u.pathname);
      if (m) id = m[1];
    }
  }
  return id && YT_ID.test(id) ? id : null;
}

export function isYouTubeUrl(url: string | null | undefined): boolean {
  return !!url && youTubeId(url) !== null;
}

const STREAMING_HOSTS = /(^|\.)(spotify\.com|spotify\.link|deezer\.com|deezer\.page\.link|music\.apple\.com|soundcloud\.com|tidal\.com|amazon\.com)$/i;

// Reads a pasted link. Returns the link to keep, or an error message for the person.
export function parseMusicLink(raw: string): { ok: true; link: MusicLink } | { ok: false; error: string } {
  const text = raw.trim();
  const id = youTubeId(text);
  if (id) return { ok: true, link: { kind: 'youtube', videoId: id, url: `https://www.youtube.com/watch?v=${id}` } };

  let u: URL;
  try {
    u = new URL(text);
  } catch {
    return { ok: false, error: 'Esse link não parece válido. Cole o link do YouTube da música.' };
  }
  if (u.protocol !== 'https:') {
    return { ok: false, error: 'Use um link que comece com https://' };
  }
  if (STREAMING_HOSTS.test(u.hostname)) {
    return {
      ok: false,
      error: 'Links do Spotify, Deezer e afins só tocam para quem tem conta lá. Cole o link da música no YouTube ou envie o arquivo MP3.',
    };
  }
  if (/\.(mp3|m4a|aac|wav|ogg|oga|webm)$/i.test(u.pathname)) {
    return { ok: true, link: { kind: 'audio', url: u.toString() } };
  }
  return { ok: false, error: 'Não conseguimos tocar esse link. Cole o link da música no YouTube ou envie o arquivo MP3.' };
}
