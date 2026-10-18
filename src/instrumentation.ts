// Runs once when the server starts. Makes sure the example tribute linked from the home page
// exists, so a new or reset database still has it.
export async function register() {
  if (process.env.NEXT_RUNTIME !== 'nodejs') return;
  try {
    const { db } = await import('@/lib/db');
    const { seedDemoTribute, DEMO_SLUG } = await import('@/lib/demo-tribute');
    if ((await seedDemoTribute(db)) === 'created') console.log(`Demo tribute created: /${DEMO_SLUG}`);
  } catch (e) {
    console.error('Could not create the demo tribute:', e);
  }
}
