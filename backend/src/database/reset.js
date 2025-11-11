const migrate = require('./migrate');
const seed = require('./seed');

async function reset() {
  console.log('🔄 Resetting database...\n');
  console.log('⚠️  This will DELETE all existing data!\n');
  
  try {
    // Run migration (sẽ drop và tạo lại database)
    await migrate();
    
    console.log('\n⏳ Waiting 2 seconds before seeding...\n');
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Run seed
    await seed();
    
    console.log('\n✅ Database reset completed successfully!');
    
  } catch (error) {
    console.error('\n❌ Database reset failed:', error.message);
    process.exit(1);
  }
}

// Run reset nếu được gọi trực tiếp
if (require.main === module) {
  reset();
}

module.exports = reset;
