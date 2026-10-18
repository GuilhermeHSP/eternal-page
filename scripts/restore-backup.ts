// Database backups in R2 (made by src/lib/backup.ts). Needs the R2_* variables, as on Railway.
//
//   npx tsx scripts/restore-backup.ts list
//   npx tsx scripts/restore-backup.ts download <key|latest> <file.db>   copy to a file, checked
//   npx tsx scripts/restore-backup.ts restore <key|latest>              replace the live database
//
// "restore" writes the backup over the file in DATABASE_URL and keeps the current one next to it
// as <name>.before-restore-<time>. Restart the service right after, so the site opens the
// restored file (anything saved between the restore and the restart is lost).
import { copyFile, rename, rm, writeFile } from 'fs/promises';
import path from 'path';
import { gunzipSync } from 'zlib';
import { backupBucket, listBackups } from '../src/lib/backup';
import { r2Request } from '../src/lib/storage';

async function fetchBackup(which: string): Promise<{ key: string; bytes: Buffer }> {
  const key = which === 'latest' ? (await listBackups())[0]?.key : which;
  if (!key) throw new Error('No backups found.');
  const res = await r2Request({ method: 'GET', bucket: backupBucket(), key });
  if (!res.ok) throw new Error(`Download of ${key} failed (${res.status})`);
  return { key, bytes: gunzipSync(Buffer.from(await res.arrayBuffer())) };
}

// Fails unless the file is a sound SQLite database with the site's tables.
async function check(file: string): Promise<void> {
  const { DatabaseSync } = await import('node:sqlite');
  const conn = new DatabaseSync(file, { readOnly: true });
  try {
    const result = conn.prepare('PRAGMA integrity_check').get() as Record<string, string>;
    if (Object.values(result)[0] !== 'ok') throw new Error(`Integrity check failed: ${JSON.stringify(result)}`);
    const { n } = conn.prepare('SELECT COUNT(*) AS n FROM Tribute').get() as { n: number };
    console.log(`Backup is sound: ${n} tributes.`);
  } finally {
    conn.close();
  }
}

function databaseFile(): string {
  const url = process.env.DATABASE_URL || '';
  if (!url.startsWith('file:')) throw new Error('DATABASE_URL must be a file: address.');
  // Prisma reads relative addresses from the prisma/ folder.
  return path.resolve('prisma', url.slice('file:'.length));
}

async function main() {
  const [command, which, out] = process.argv.slice(2);
  if (command === 'list') {
    for (const b of await listBackups()) console.log(`${b.takenAt.toISOString()}  ${Math.round(b.size / 1024)} KB  ${b.key}`);
  } else if (command === 'download' && which && out) {
    const { key, bytes } = await fetchBackup(which);
    await writeFile(out, bytes);
    await check(out);
    console.log(`Saved ${key} to ${out}`);
  } else if (command === 'restore' && which) {
    const target = databaseFile();
    const { key, bytes } = await fetchBackup(which);
    const incoming = `${target}.restoring`;
    await writeFile(incoming, bytes);
    try {
      await check(incoming);
    } catch (e) {
      await rm(incoming, { force: true });
      throw e;
    }
    const kept = `${target}.before-restore-${new Date().toISOString().replace(/[:.]/g, '-')}`;
    await copyFile(target, kept).catch(() => {});
    await rename(incoming, target);
    console.log(`Restored ${key} into ${target}. Previous database kept at ${kept}.`);
    console.log('Restart the service now.');
  } else {
    console.log('Usage: list | download <key|latest> <file.db> | restore <key|latest>');
    process.exit(1);
  }
}

main().catch((e) => {
  console.error(e instanceof Error ? e.message : e);
  process.exit(1);
});
