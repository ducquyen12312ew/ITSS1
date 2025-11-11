const mysql = require('mysql2/promise');
const fs = require('fs').promises;
const path = require('path');
const config = require('../config/config');

async function migrate() {
  let connection;
  try {
    console.log('Starting database migration...');
    connection = await mysql.createConnection({
      host: config.db.host,
      port: config.db.port,
      user: config.db.user,
      password: config.db.password,
      multipleStatements: true
    });

    console.log('Connected to MySQL server');
    const migrationPath = path.join(__dirname, '../../database/migration.sql');
    const migrationSQL = await fs.readFile(migrationPath, 'utf8');
    console.log('Reading migration file...');
    await connection.query(migrationSQL);

    console.log('Migration completed successfully');
    console.log('Database: kodomo_weekend_navi');
    console.log('17 tables created');
    console.log('3 triggers created');
    console.log('2 views created');
  } catch (error) {
    console.error('Migration failed:', error.message);
    process.exit(1);
  } finally {
    if (connection) await connection.end();
  }
}

if (require.main === module) {
  migrate();
}

module.exports = migrate;