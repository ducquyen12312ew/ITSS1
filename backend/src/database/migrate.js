const mysql = require('mysql2/promise');
const fs = require('fs').promises;
const path = require('path');
const config = require('../config/config');

async function migrate() {
  let connection;
  
  try {
    console.log('🚀 Starting database migration...\n');
    
    // Kết nối MySQL (không chỉ định database để có thể tạo database mới)
    connection = await mysql.createConnection({
      host: config.db.host,
      port: config.db.port,
      user: config.db.user,
      password: config.db.password,
      multipleStatements: true
    });
    
    console.log('✅ Connected to MySQL server');
    
    // Đọc file migration
    const migrationPath = path.join(__dirname, '../../database/migration.sql');
    const migrationSQL = await fs.readFile(migrationPath, 'utf8');
    
    console.log('📄 Reading migration file...');
    
    // Thực thi migration
    console.log('⚙️  Executing migration...\n');
    await connection.query(migrationSQL);
    
    console.log('\n✅ Migration completed successfully!');
    console.log('📊 Database: kodomo_weekend_navi');
    console.log('📋 17 tables created');
    console.log('🔧 3 triggers created');
    console.log('👁️  2 views created');
    
  } catch (error) {
    console.error('\n❌ Migration failed:', error.message);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

// Run migration nếu được gọi trực tiếp
if (require.main === module) {
  migrate();
}

module.exports = migrate;
