import { db } from '../src/lib/db';
import { TributeConfig } from '../src/types/tribute';
import demo from './demo-tribute.json';

// The example tribute linked from the home page ("Ver exemplo"). It shows every section the
// product offers; the content lives in demo-tribute.json.
async function main() {
  console.log('Creating demo tribute...');

  const config: TributeConfig = { ...(demo as TributeConfig), createdAt: new Date().toISOString() };

  // Delete existing demo tribute first
  const existingTribute = await db.tribute.findUnique({
    where: { slug: 'para-melhor-mae-demo' },
  });

  if (existingTribute) {
    await db.tribute.delete({ where: { id: existingTribute.id } });
    console.log('Deleted existing demo tribute');
  }

  const tribute = await db.tribute.create({
    data: {
      slug: 'para-melhor-mae-demo',
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
        create: config.gallery?.map((p, i) => ({
          url: p.url,
          caption: p.caption,
          order: i,
        })),
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

  console.log(`Created demo tribute: ${tribute.slug}`);
  console.log('Demo tribute created successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
