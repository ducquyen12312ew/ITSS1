const migrate = require('./migrate');
const seed = require('./seed');

async function reset() {
  console.log('Resetting database...');
  console.log('This will DELETE all existing data.');

  try {
    await migrate();
    console.log('Waiting 2 seconds before seeding...');
    await new Promise(resolve => setTimeout(resolve, 2000));
    await seed();
    console.log('Database reset completed successfully');
  } catch (error) {
    console.error('Database reset failed:', error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  reset();
}

module.exports = reset;