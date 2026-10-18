import { createHash, createHmac } from 'crypto';
import { mkdir, writeFile } from 'fs/promises';
import path from 'path';

// Where tribute photos, music and voice messages are kept.
//
// - With R2 configured (R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, R2_BUCKET,
//   R2_PUBLIC_URL in .env), files go to Cloudflare R2 through its S3-compatible API.
// - Without it (local development), files are written to public/uploads/ and served by Next.
//
// Files are named by the hash of their content, so the same photo sent twice (e.g. every time a
// draft is saved) is stored once and its address never changes.

const IMAGE_TYPES: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/jpg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/gif': 'gif',
};

const AUDIO_TYPES: Record<string, string> = {
  'audio/mpeg': 'mp3',
  'audio/mp3': 'mp3',
  'audio/mp4': 'm4a',
  'audio/x-m4a': 'm4a',
  'audio/m4a': 'm4a',
  'audio/aac': 'aac',
  'audio/wav': 'wav',
  'audio/x-wav': 'wav',
  'audio/wave': 'wav',
  'audio/webm': 'webm',
  'audio/ogg': 'ogg',
};

// Photos arrive already resized by the creator (well under 1 MB), so 2 MB leaves room.
const MAX_IMAGE_BYTES = 2 * 1024 * 1024;
const MAX_AUDIO_BYTES = 12 * 1024 * 1024;

export type MediaKind = 'image' | 'audio';

export class MediaError extends Error {}

export function r2Configured(): boolean {
  return !!(
    process.env.R2_ACCOUNT_ID &&
    process.env.R2_ACCESS_KEY_ID &&
    process.env.R2_SECRET_ACCESS_KEY &&
    process.env.R2_BUCKET &&
    process.env.R2_PUBLIC_URL
  );
}

export function isDataUrl(value: unknown): value is `data:${string}` {
  return typeof value === 'string' && value.startsWith('data:');
}

interface ParsedDataUrl {
  contentType: string;
  bytes: Buffer;
}

export function parseDataUrl(dataUrl: string): ParsedDataUrl {
  const match = /^data:([^;,]+)((?:;[^;,]*)*?);base64,(.*)$/s.exec(dataUrl);
  if (!match) throw new MediaError('Arquivo em formato inválido.');
  const contentType = match[1].toLowerCase().trim();
  return { contentType, bytes: Buffer.from(match[3], 'base64') };
}

// Stores a data URL (as sent by the creator) and returns the file's public address.
export async function storeDataUrl(dataUrl: string, kind: MediaKind): Promise<string> {
  const { contentType: rawType, bytes } = parseDataUrl(dataUrl);
  // Recorders often say "audio/webm;codecs=opus"; only the main type matters here.
  const contentType = rawType.split(';')[0];
  const types = kind === 'image' ? IMAGE_TYPES : AUDIO_TYPES;
  const ext = types[contentType];
  if (!ext) {
    throw new MediaError(kind === 'image' ? 'Formato de imagem não aceito.' : 'Formato de áudio não aceito.');
  }
  const max = kind === 'image' ? MAX_IMAGE_BYTES : MAX_AUDIO_BYTES;
  if (bytes.length === 0) throw new MediaError('Arquivo vazio.');
  if (bytes.length > max) {
    throw new MediaError(kind === 'image' ? 'A imagem é grande demais.' : 'O áudio é grande demais.');
  }

  const hash = createHash('sha256').update(bytes).digest('hex');
  const key = `${kind === 'image' ? 'img' : 'audio'}/${hash.slice(0, 2)}/${hash}.${ext}`;
  const storedType = contentType === 'image/jpg' ? 'image/jpeg' : contentType;

  if (r2Configured()) {
    await putR2Object(key, bytes, storedType);
    return `${process.env.R2_PUBLIC_URL!.replace(/\/+$/, '')}/${key}`;
  }

  // Local development: public/uploads/... is served at /uploads/...
  const file = path.join(process.cwd(), 'public', 'uploads', ...key.split('/'));
  await mkdir(path.dirname(file), { recursive: true });
  await writeFile(file, bytes);
  return `/uploads/${key}`;
}

// Replaces a value with a stored-file address when it is a data URL; anything else is returned
// unchanged (addresses of files saved earlier, empty values).
export async function storeIfDataUrl<T>(value: T, kind: MediaKind): Promise<T | string> {
  return isDataUrl(value) ? storeDataUrl(value, kind) : value;
}

// Media fields of a tribute as saved: new files (data URLs) are stored and replaced by their
// address; addresses of files already stored here are kept; anything else is dropped.
export async function normaliseMedia(value: unknown, kind: MediaKind): Promise<string | null> {
  if (typeof value !== 'string' || !value) return null;
  if (isDataUrl(value)) return storeDataUrl(value, kind);
  const r2 = process.env.R2_PUBLIC_URL?.replace(/\/+$/, '');
  if (r2 && value.startsWith(r2 + '/')) return value;
  if (/^\/(uploads|demo|landing)\//.test(value)) return value;
  return null;
}

// ---------------------------------------------------------------------------------------------
// Cloudflare R2 via the S3 API, signed with AWS Signature Version 4 (no SDK needed).

function sha256Hex(data: string | Buffer): string {
  return createHash('sha256').update(data).digest('hex');
}

function hmac(key: Buffer | string, data: string): Buffer {
  return createHmac('sha256', key).update(data).digest();
}

function encodePath(p: string): string {
  return p
    .split('/')
    .map((s) => encodeURIComponent(s).replace(/[!'()*]/g, (c) => '%' + c.charCodeAt(0).toString(16).toUpperCase()))
    .join('/');
}

export interface SignInput {
  method: string;
  host: string;
  path: string; // already starting with "/"
  query?: string; // canonical query string, already encoded and sorted
  headers: Record<string, string>; // lower-case names, must include host and x-amz-date
  payloadHash: string;
  accessKeyId: string;
  secretAccessKey: string;
  region: string;
  service: string;
  amzDate: string; // YYYYMMDDTHHMMSSZ
}

// Returns the Authorization header value for a request (SigV4).
export function signV4(input: SignInput): string {
  const dateStamp = input.amzDate.slice(0, 8);
  const names = Object.keys(input.headers).map((h) => h.toLowerCase()).sort();
  const canonicalHeaders = names.map((n) => `${n}:${String(input.headers[n]).trim().replace(/\s+/g, ' ')}\n`).join('');
  const signedHeaders = names.join(';');
  const canonicalRequest = [
    input.method,
    input.path,
    input.query || '',
    canonicalHeaders,
    signedHeaders,
    input.payloadHash,
  ].join('\n');
  const scope = `${dateStamp}/${input.region}/${input.service}/aws4_request`;
  const stringToSign = ['AWS4-HMAC-SHA256', input.amzDate, scope, sha256Hex(canonicalRequest)].join('\n');
  const kDate = hmac(`AWS4${input.secretAccessKey}`, dateStamp);
  const kRegion = hmac(kDate, input.region);
  const kService = hmac(kRegion, input.service);
  const kSigning = hmac(kService, 'aws4_request');
  const signature = createHmac('sha256', kSigning).update(stringToSign).digest('hex');
  return `AWS4-HMAC-SHA256 Credential=${input.accessKeyId}/${scope}, SignedHeaders=${signedHeaders}, Signature=${signature}`;
}

async function putR2Object(key: string, body: Buffer, contentType: string): Promise<void> {
  const host = `${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`;
  const objectPath = encodePath(`/${process.env.R2_BUCKET}/${key}`);
  const amzDate = new Date().toISOString().replace(/[:-]|\.\d{3}/g, '');
  const payloadHash = sha256Hex(body);
  const headers: Record<string, string> = {
    host,
    'content-type': contentType,
    'cache-control': 'public, max-age=31536000, immutable',
    'x-amz-content-sha256': payloadHash,
    'x-amz-date': amzDate,
  };
  const authorization = signV4({
    method: 'PUT',
    host,
    path: objectPath,
    headers,
    payloadHash,
    accessKeyId: process.env.R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
    region: 'auto',
    service: 's3',
    amzDate,
  });

  const { host: _host, ...sendHeaders } = headers;
  void _host;
  const res = await fetch(`https://${host}${objectPath}`, {
    method: 'PUT',
    headers: { ...sendHeaders, Authorization: authorization },
    body: new Uint8Array(body),
  });
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`R2 upload failed (${res.status}): ${text.slice(0, 300)}`);
  }
}
