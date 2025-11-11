const mysql = require('mysql2/promise');
const fs = require('fs').promises;
const path = require('path');
const config = require('../config/config');

async function seed() {
  let connection;
  try {
    console.log('Starting database seeding...');
    connection = await mysql.createConnection({
      host: config.db.host,
      port: config.db.port,
      user: config.db.user,
      password: config.db.password,
      database: config.db.database,
      multipleStatements: true
    });

    console.log('Connected to database:', config.db.database);
    const seedPath = path.join(__dirname, '../../database/seed.sql');
    const seedSQL = await fs.readFile(seedPath, 'utf8');
    console.log('Reading seed file...');
    await connection.query(seedSQL);

    const [users] = await connection.query('SELECT COUNT(*) as count FROM users');
    const [children] = await connection.query('SELECT COUNT(*) as count FROM children');
    const [spots] = await connection.query('SELECT COUNT(*) as count FROM spots');
    const [reviews] = await connection.query('SELECT COUNT(*) as count FROM reviews');
    const [favorites] = await connection.query('SELECT COUNT(*) as count FROM favorites');
    const [schedules] = await connection.query('SELECT COUNT(*) as count FROM schedules');

    console.log('Seed data inserted successfully');
    console.log('Data Summary:');
    console.log('Users:', users[0].count);
    console.log('Children:', children[0].count);
    console.log('Spots:', spots[0].count);
    console.log('Reviews:', reviews[0].count);
    console.log('Favorites:', favorites[0].count);
    console.log('Schedules:', schedules[0].count);

    console.log('Test Account:');
    console.log('Email: admin@kodomo.com');
    console.log('Password: password123');
    console.log('Role: ADMIN');
    console.log('Email: tanaka.yuki@example.com');
    console.log('Password: password123');
    console.log('Role: USER');
  } catch (error) {
    console.error('Seed failed:', error.message);
    process.exit(1);
  } finally {
    if (connection) await connection.end();
  }
}

if (require.main === module) {
  seed();
}

module.exports = seed;