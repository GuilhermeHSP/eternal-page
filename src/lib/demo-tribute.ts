import type { PrismaClient } from '@prisma/client';
import type { TributeConfig } from '@/types/tribute';
import demo from '../../prisma/demo-tribute.json';
import { DEMO_SLUG } from './demo-slug';

export { DEMO_SLUG };

// The example tribute linked from the home page ("Ver exemplo"): Ana's page, on the Amor model.
// Its content lives in prisma/demo-tribute.json and only uses files shipped in public/, so it can
// be rebuilt on any database.

// The message wall is seeded from guestMessages; the rest of the file is the page's config.
const { guestMessages = [], ...demoConfig } = demo as typeof demo & { guestMessages?: { name: string; message: string }[] };

// True when the stored demo was built from an older version of demo-tribute.json.
function isStale(storedConfig: string): boolean {
  try {
    const { createdAt: _createdAt, ...stored } = JSON.parse(storedConfig);
    return JSON.stringify(stored) !== JSON.stringify(demoConfig);
  } catch {
    return true;
  }
}

// Creates the demo tribute. An existing one is rebuilt (with its guestbook messages) when replace
// is set or when demo-tribute.json changed since it was built; otherwise it is left as it is.
export async function seedDemoTribute(db: PrismaClient, { replace = false } = {}): Promise<'created' | 'kept'> {
  const existing = await db.tribute.findUnique({ where: { slug: DEMO_SLUG } });
  if (existing) {
    if (!replace && !isStale(existing.config)) return 'kept';
    await db.tribute.delete({ where: { id: existing.id } });
  }

  const config: TributeConfig = { ...(demoConfig as TributeConfig), createdAt: new Date().toISOString() };
  // The first message in the file is the newest, so it opens the wall.
  const now = Date.now();

  await db.tribute.create({
    data: {
      slug: DEMO_SLUG,
      title: config.title,
      recipient: config.recipient,
      config: JSON.stringify(config),
      templateId: config.template,
      heroImage: config.hero?.image,
      musicUrl: config.music?.url,
      closingMessage: config.closingMessage,
      packageType: 'premium',
      isPremium: true,
      isPublished: true,
      photos: {
        create: config.gallery?.map((p, i) => ({ url: p.url, caption: p.caption, order: i })),
      },
      timeline: {
        create: config.timeline?.map((t, i) => ({
          title: t.title,
          description: t.description,
          year: t.year,
          imageUrl: t.imageUrl,
          order: i,
        })),
      },
      guestMessages: {
        create: guestMessages.map((m, i) => ({ name: m.name, message: m.message, createdAt: new Date(now - i * 3_600_000) })),
      },
    },
  });
  return 'created';
}
