import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { isAdmin } from '@/lib/admin';
import { backupConfigured, listBackups, runBackup } from '@/lib/backup';

// Admin only (x-admin-key: ADMIN_PASSWORD). GET lists the database backups in R2; POST takes one
// now, e.g. right before a risky change. The daily backup runs on its own (lib/backup.ts).

export async function GET(request: NextRequest) {
  if (!isAdmin(request)) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
  if (!backupConfigured()) return NextResponse.json({ error: 'R2 não configurado' }, { status: 503 });
  const backups = await listBackups();
  return NextResponse.json({ backups });
}

export async function POST(request: NextRequest) {
  if (!isAdmin(request)) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
  if (!backupConfigured()) return NextResponse.json({ error: 'R2 não configurado' }, { status: 503 });
  try {
    const backup = await runBackup(db);
    console.log(`Database backup saved: ${backup.key} (${Math.round(backup.size / 1024)} KB)`);
    return NextResponse.json(backup);
  } catch (e) {
    console.error('Database backup failed:', e);
    return NextResponse.json({ error: 'Falha no backup' }, { status: 500 });
  }
}
