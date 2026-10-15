import { db } from '../src/lib/db';
import { isDataUrl, storeDataUrl, r2Configured } from '../src/lib/storage';

// Moves photos, music and voice messages saved inside the database (as data URLs, the way the
// site worked before) to the file storage: Cloudflare R2 when configured, public/uploads otherwise.
// Safe to run more than once: only values that are still data URLs are touched.
//
//   npx tsx --env-file=.env prisma/migrate-media.ts

async function main() {
  console.log(`Destino: ${r2Configured() ? 'Cloudflare R2' : 'pasta public/uploads (R2 não configurado)'}`);

  const tributes = await db.tribute.findMany({ select: { id: true, slug: true, heroImage: true, musicUrl: true, config: true } });
  let moved = 0;

  for (const t of tributes) {
    const data: Record<string, string> = {};
    if (isDataUrl(t.heroImage)) data.heroImage = await storeDataUrl(t.heroImage, 'image');
    if (isDataUrl(t.musicUrl)) data.musicUrl = await storeDataUrl(t.musicUrl, 'audio');

    try {
      const config = JSON.parse(t.config) as { voiceMessage?: string };
      if (isDataUrl(config.voiceMessage)) {
        config.voiceMessage = await storeDataUrl(config.voiceMessage, 'audio');
        data.config = JSON.stringify(config);
      }
    } catch {
      // config without JSON: nothing to move
    }

    if (Object.keys(data).length) {
      await db.tribute.update({ where: { id: t.id }, data });
      moved += Object.keys(data).length;
    }

    const photos = await db.photo.findMany({ where: { tributeId: t.id }, select: { id: true, url: true } });
    for (const p of photos) {
      if (isDataUrl(p.url)) {
        await db.photo.update({ where: { id: p.id }, data: { url: await storeDataUrl(p.url, 'image') } });
        moved++;
      }
    }

    const items = await db.timelineItem.findMany({ where: { tributeId: t.id }, select: { id: true, imageUrl: true } });
    for (const it of items) {
      if (isDataUrl(it.imageUrl)) {
        await db.timelineItem.update({ where: { id: it.id }, data: { imageUrl: await storeDataUrl(it.imageUrl, 'image') } });
        moved++;
      }
    }

    process.stdout.write('.');
  }

  console.log(`\nPronto: ${moved} arquivo(s) movido(s) em ${tributes.length} homenagem(ns).`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
