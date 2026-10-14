import { db } from '../src/lib/db';
import { TributeConfig } from '../src/types/tribute';

async function main() {
  console.log('Creating demo tribute...');

  const config: TributeConfig = {
    title: 'A melhor mãe do mundo!',
    recipient: 'Maria',
    template: 'mothersDay',
    hero: {
      image: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=1200&h=800&fit=crop',
    },
    message: {
      text: 'Mãe, você é a luz que ilumina meu caminho. **Obrigado por todo amor**, carinho e dedicação ao longo dos anos. Cada sacrifício que você fez por mim, cada noite sem dormir, cada palavra de incentivo... tudo isso me moldou na pessoa que sou hoje. Você é meu exemplo de força, bondade e amor incondicional. **Te amo mais do que palavras podem expressar**.',
      typingAnimation: true,
      highlightPhrases: ['Obrigado por todo amor', 'Te amo mais do que palavras podem expressar'],
    },
    gallery: [
      {
        id: 'photo-1',
        url: 'https://images.unsplash.com/photo-1493894473891-10fc1e5dbd22?w=600&h=600&fit=crop',
        caption: 'Nossa primeira viagem juntos',
        order: 0,
      },
      {
        id: 'photo-2',
        url: 'https://images.unsplash.com/photo-1511895426328-dc8714191300?w=600&h=600&fit=crop',
        caption: 'Dia das mães 2023',
        order: 1,
      },
      {
        id: 'photo-3',
        url: 'https://images.unsplash.com/photo-1609220136736-443140cffec6?w=600&h=600&fit=crop',
        caption: 'Sempre ao meu lado',
        order: 2,
      },
    ],
    timeline: [
      {
        id: 'timeline-1',
        title: 'Quando eu nasci',
        description: 'O dia mais feliz da sua vida, você sempre diz.',
        year: '1995',
        order: 0,
      },
      {
        id: 'timeline-2',
        title: 'Primeiro dia de escola',
        description: 'Você estava mais nervosa que eu!',
        year: '2001',
        order: 1,
      },
      {
        id: 'timeline-3',
        title: 'Minha formatura',
        description: 'Lágrimas de orgulho nos seus olhos.',
        year: '2017',
        order: 2,
      },
    ],
    closingMessage: 'Você será para sempre meu refúgio seguro. Te amo, mãe!',
    createdAt: new Date().toISOString(),
    authorName: 'Com amor, sua filha',
  };

  // Delete existing demo tribute first
  const existingTribute = await db.tribute.findUnique({
    where: { slug: 'para-melhor-mae-demo' },
  });
  
  if (existingTribute) {
    await db.photo.deleteMany({ where: { tributeId: existingTribute.id } });
    await db.timelineItem.deleteMany({ where: { tributeId: existingTribute.id } });
    await db.tribute.delete({ where: { id: existingTribute.id } });
    console.log('Deleted existing demo tribute');
  }

  const tribute = await db.tribute.create({
    data: {
      slug: 'para-melhor-mae-demo',
      title: config.title,
      recipient: config.recipient,
      config: JSON.stringify(config),
      templateId: 'mothersDay',
      heroImage: config.hero?.image,
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
