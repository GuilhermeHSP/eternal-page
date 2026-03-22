import { db } from '../src/lib/db';
import { templates } from '../src/lib/templates';

async function main() {
  console.log('Seeding templates...');

  for (const template of Object.values(templates)) {
    await db.template.upsert({
      where: { name: template.name },
      update: {
        displayName: template.displayName,
        description: template.description,
        category: template.category,
        styleConfig: JSON.stringify(template),
        isPremium: template.name === 'memorial' || template.name === 'anniversary',
      },
      create: {
        name: template.name,
        displayName: template.displayName,
        description: template.description,
        category: template.category,
        styleConfig: JSON.stringify(template),
        isPremium: template.name === 'memorial' || template.name === 'anniversary',
      },
    });
    console.log(`Created template: ${template.displayName}`);
  }

  console.log('Seeding completed!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
