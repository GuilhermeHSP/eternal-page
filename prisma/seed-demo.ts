import { db } from '../src/lib/db';
import { DEMO_SLUG, seedDemoTribute } from '../src/lib/demo-tribute';

// Rebuilds the example tribute from demo-tribute.json, replacing the one in the database.
// The server also creates it on start when it is missing (src/instrumentation.ts).
async function main() {
  await seedDemoTribute(db, { replace: true });
  console.log(`Demo tribute created: /${DEMO_SLUG}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
