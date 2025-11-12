const mysql = require('mysql2/promise');
const fs = require('fs').promises;
const path = require('path');
const config = require('../config/config');

async function seed() {
  let connection;
  
  try {
    console.log('🌱 Starting database seeding...\n');
    
    // Kết nối MySQL
    connection = await mysql.createConnection({
      host: config.db.host,
      port: config.db.port,
      user: config.db.user,
      password: config.db.password,
      database: config.db.database,
      multipleStatements: true
    });
    
    console.log('✅ Connected to database:', config.db.database);
    
    // Đọc file seed
    const seedPath = path.join(__dirname, '../../database/seed.sql');
    const seedSQL = await fs.readFile(seedPath, 'utf8');
    
    console.log('📄 Reading seed file...');
    
    // Thực thi seed
    console.log('⚙️  Inserting sample data...\n');
    await connection.query(seedSQL);
    
    // Hiển thị thống kê
    const [users] = await connection.query('SELECT COUNT(*) as count FROM users');
    const [children] = await connection.query('SELECT COUNT(*) as count FROM children');
    const [spots] = await connection.query('SELECT COUNT(*) as count FROM spots');
    const [reviews] = await connection.query('SELECT COUNT(*) as count FROM reviews');
    const [favorites] = await connection.query('SELECT COUNT(*) as count FROM favorites');
    const [schedules] = await connection.query('SELECT COUNT(*) as count FROM schedules');
    
    console.log('\n✅ Seed data inserted successfully!');
    console.log('\n📊 Data Summary:');
    console.log('   👤 Users:', users[0].count);
    console.log('   👶 Children:', children[0].count);
    console.log('   📍 Spots:', spots[0].count);
    console.log('   ⭐ Reviews:', reviews[0].count);
    console.log('   ❤️  Favorites:', favorites[0].count);
    console.log('   📅 Schedules:', schedules[0].count);
    
    console.log('\n🔑 Test Accounts:');
    console.log('   📧 Email: admin@kodomo.com');
    console.log('   🔑 Password: password123');
    console.log('   👤 Role: ADMIN');
    console.log('\n   📧 Email: buibaomoyu@gmail.com');
    console.log('   🔑 Password: B@o140804');
    console.log('   👤 Role: USER');
    console.log('   👶 Children: Minh (5y), An (3y)');
    
  } catch (error) {
    console.error('\n❌ Seed failed:', error.message);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

// Run seed nếu được gọi trực tiếp
if (require.main === module) {
  seed();
}

module.exports = seed;
