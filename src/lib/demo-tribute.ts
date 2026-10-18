import type { PrismaClient } from '@prisma/client';
import type { TributeConfig } from '@/types/tribute';
import demo from '../../prisma/demo-tribute.json';
import { DEMO_SLUG } from './demo-slug';

export { DEMO_SLUG };

// The example tribute linked from the home page ("Ver exemplo"): Ana's page, on the Amor model.
// Its content lives in prisma/demo-tribute.json and only uses files shipped in public/, so it can
// be rebuilt on any database.

// Creates the demo tribute. With replace, an existing one is deleted first (and its guestbook
// messages with it); without, an existing demo is left as it is.
export async function seedDemoTribute(db: PrismaClient, { replace = false } = {}): Promise<'created' | 'kept'> {
  const existing = await db.tribute.findUnique({ where: { slug: DEMO_SLUG } });
  if (existing) {
    if (!replace) return 'kept';
    await db.tribute.delete({ where: { id: existing.id } });
  }

  const config: TributeConfig = { ...(demo as TributeConfig), createdAt: new Date().toISOString() };

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
    },
  });
  return 'created';
}
