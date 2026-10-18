import { randomBytes } from 'crypto';
import { readFile, rm } from 'fs/promises';
import os from 'os';
import path from 'path';
import { gzipSync } from 'zlib';
import type { PrismaClient } from '@prisma/client';
import { r2Request } from './storage';

// Daily backup of the SQLite database to Cloudflare R2.
//
// The server checks every hour whether the newest backup is older than a day and, if so, takes a
// consistent snapshot with VACUUM INTO (safe while the site is writing, unlike copying the file),
// gzips it and uploads it under backups/. Backups older than 30 days are then deleted, always
// keeping the newest 7. Restoring: see scripts/restore-backup.ts and the README.
//
// Backups go to R2_BACKUP_BUCKET when set, otherwise to R2_BUCKET next to the photos. The
// random part of each name keeps a backup from being guessed through the bucket's public address.

export const BACKUP_PREFIX = 'backups/';
const BACKUP_EVERY_MS = 24 * 60 * 60 * 1000;
const CHECK_EVERY_MS = 60 * 60 * 1000;
const FIRST_CHECK_AFTER_MS = 2 * 60 * 1000;
const KEEP_DAYS = 30;
const KEEP_AT_LEAST = 7;

export function backupConfigured(): boolean {
  return !!(
    process.env.R2_ACCOUNT_ID &&
    process.env.R2_ACCESS_KEY_ID &&
    process.env.R2_SECRET_ACCESS_KEY &&
    (process.env.R2_BACKUP_BUCKET || process.env.R2_BUCKET)
  );
}

export function backupBucket(): string {
  return process.env.R2_BACKUP_BUCKET || process.env.R2_BUCKET!;
}

export interface BackupObject {
  key: string;
  size: number;
  takenAt: Date;
}

// backups/2026-10-18T19-40-05Z-<random>.db.gz -> 2026-10-18T19:40:05Z
function takenAtFromKey(key: string): Date | null {
  const m = /^backups\/(\d{4}-\d{2}-\d{2})T(\d{2})-(\d{2})-(\d{2})Z-/.exec(key);
  return m ? new Date(`${m[1]}T${m[2]}:${m[3]}:${m[4]}Z`) : null;
}

// All backups in the bucket, newest first.
export async function listBackups(): Promise<BackupObject[]> {
  const found: BackupObject[] = [];
  let token: string | undefined;
  do {
    const query: Record<string, string> = { 'list-type': '2', prefix: BACKUP_PREFIX };
    if (token) query['continuation-token'] = token;
    const res = await r2Request({ method: 'GET', bucket: backupBucket(), query });
    const xml = await res.text();
    if (!res.ok) throw new Error(`Listing backups failed (${res.status}): ${xml.slice(0, 300)}`);
    for (const [, body] of xml.matchAll(/<Contents>([\s\S]*?)<\/Contents>/g)) {
      const key = decodeXml(/<Key>([\s\S]*?)<\/Key>/.exec(body)?.[1] || '');
      const takenAt = takenAtFromKey(key);
      if (!takenAt) continue;
      found.push({ key, size: Number(/<Size>(\d+)<\/Size>/.exec(body)?.[1] || 0), takenAt });
    }
    token = /<IsTruncated>true<\/IsTruncated>/.test(xml)
      ? decodeXml(/<NextContinuationToken>([\s\S]*?)<\/NextContinuationToken>/.exec(xml)?.[1] || '') || undefined
      : undefined;
  } while (token);
  return found.sort((a, b) => b.takenAt.getTime() - a.takenAt.getTime());
}

function decodeXml(s: string): string {
  return s
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&amp;/g, '&');
}

// Takes a snapshot now and uploads it. Returns the backup's key and compressed size.
export async function runBackup(db: PrismaClient): Promise<{ key: string; size: number }> {
  const takenAt = new Date();
  const tmp = path.join(os.tmpdir(), `eternal-backup-${takenAt.getTime()}-${randomBytes(4).toString('hex')}.db`);
  try {
    await db.$executeRawUnsafe(`VACUUM INTO '${tmp.replace(/'/g, "''")}'`);
    const gz = gzipSync(await readFile(tmp), { level: 9 });
    const stamp = takenAt.toISOString().replace(/\.\d{3}Z$/, 'Z').replace(/:/g, '-');
    const key = `${BACKUP_PREFIX}${stamp}-${randomBytes(16).toString('hex')}.db.gz`;
    const res = await r2Request({
      method: 'PUT',
      bucket: backupBucket(),
      key,
      body: gz,
      headers: { 'content-type': 'application/gzip', 'cache-control': 'private, no-store' },
    });
    if (!res.ok) {
      const text = await res.text().catch(() => '');
      throw new Error(`Backup upload failed (${res.status}): ${text.slice(0, 300)}`);
    }
    return { key, size: gz.length };
  } finally {
    await rm(tmp, { force: true }).catch(() => {});
  }
}

// Deletes backups older than KEEP_DAYS, always keeping the newest KEEP_AT_LEAST.
export async function pruneBackups(now = new Date()): Promise<string[]> {
  const cutoff = now.getTime() - KEEP_DAYS * 24 * 60 * 60 * 1000;
  const old = (await listBackups()).slice(KEEP_AT_LEAST).filter((b) => b.takenAt.getTime() < cutoff);
  for (const b of old) {
    const res = await r2Request({ method: 'DELETE', bucket: backupBucket(), key: b.key });
    if (!res.ok && res.status !== 404) throw new Error(`Deleting ${b.key} failed (${res.status})`);
  }
  return old.map((b) => b.key);
}

let running = false;

// Backs up when the newest backup is more than a day old (or there is none), then prunes.
export async function backupIfDue(db: PrismaClient): Promise<void> {
  if (running) return;
  running = true;
  try {
    const newest = (await listBackups())[0];
    if (newest && Date.now() - newest.takenAt.getTime() < BACKUP_EVERY_MS) return;
    const { key, size } = await runBackup(db);
    console.log(`Database backup saved: ${key} (${Math.round(size / 1024)} KB)`);
    const removed = await pruneBackups();
    if (removed.length) console.log(`Old database backups removed: ${removed.length}`);
  } catch (e) {
    console.error('Database backup failed:', e);
  } finally {
    running = false;
  }
}

// Only in production, so a developer's machine with R2 keys does not back up its own database.
export function startBackupSchedule(db: PrismaClient): void {
  if (process.env.NODE_ENV !== 'production') return;
  if (!backupConfigured()) {
    console.log('Database backups are off: R2 is not configured.');
    return;
  }
  setTimeout(() => void backupIfDue(db), FIRST_CHECK_AFTER_MS).unref();
  setInterval(() => void backupIfDue(db), CHECK_EVERY_MS).unref();
}
