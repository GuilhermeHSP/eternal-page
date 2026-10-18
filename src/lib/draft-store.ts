// The tribute being written is kept in this browser (IndexedDB, which holds the photos too), so
// a reload, the phone's back button or closing the tab doesn't lose it. Nothing here leaves the
// device; the server only gets the page on "Gerar prévia".

export interface CreatorSnapshot {
  v: 1;
  savedAt: number;
  step: number;
  draftId: string | null;
  // The preview was generated: the home offers to go back to it.
  previewed: boolean;
  packageType: string | null;
  values: Record<string, string | undefined>;
  customColor: string | null;
  reasons: string[];
  voiceMessage: string | null;
  guestbook: boolean;
  envelope: boolean;
  musicTitle: string;
  musicInputType: 'upload' | 'url';
  music: { url: string; name: string } | null;
  photos: { id: string; url: string; caption: string }[];
  timeline: { id: string; title: string; description: string; year: string; imageUrl: string }[];
}

const DB_NAME = 'eternalpage';
const STORE = 'creator';
const KEY = 'current';
// An unfinished tribute older than this isn't offered anymore.
const MAX_AGE_MS = 30 * 24 * 60 * 60 * 1000;

function open(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, 1);
    req.onupgradeneeded = () => req.result.createObjectStore(STORE);
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function run<T>(mode: IDBTransactionMode, fn: (store: IDBObjectStore) => IDBRequest<T>): Promise<T> {
  const db = await open();
  try {
    return await new Promise<T>((resolve, reject) => {
      const req = fn(db.transaction(STORE, mode).objectStore(STORE));
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
  } finally {
    db.close();
  }
}

// Private windows and blocked storage just mean nothing is kept.
export async function loadSnapshot(): Promise<CreatorSnapshot | null> {
  try {
    const snap = await run<CreatorSnapshot | undefined>('readonly', (s) => s.get(KEY));
    if (!snap || snap.v !== 1 || Date.now() - snap.savedAt > MAX_AGE_MS) return null;
    return snap;
  } catch {
    return null;
  }
}

export async function saveSnapshot(snap: Omit<CreatorSnapshot, 'v' | 'savedAt'>): Promise<void> {
  try {
    await run('readwrite', (s) => s.put({ ...snap, v: 1, savedAt: Date.now() }, KEY));
  } catch {
    // nothing to do: the tribute just isn't kept on this device
  }
}

export async function clearSnapshot(): Promise<void> {
  try {
    await run('readwrite', (s) => s.delete(KEY));
  } catch {
    // ignore
  }
}
