const mysql = require('mysql2/promise');
const config = require('../config/config');

const pool = mysql.createPool({
  host: config.db.host,
  port: config.db.port,
  user: config.db.user,
  password: config.db.password,
  database: config.db.database,
  waitForConnections: config.db.waitForConnections,
  connectionLimit: config.db.connectionLimit,
  queueLimit: config.db.queueLimit,
  enableKeepAlive: config.db.enableKeepAlive,
  keepAliveInitialDelay: config.db.keepAliveInitialDelay,
  timezone: config.db.timezone
});

const testConnection = async () => {
  try {
    const conn = await pool.getConnection();
    console.log('Database connected successfully');
    conn.release();
    return true;
  } catch (error) {
    console.error('Database connection failed:', error.message);
    return false;
  }
};

const query = async (sql, params = []) => {
  try {
    const [rows] = await pool.execute(sql, params);
    return rows;
  } catch (error) {
    console.error('Database query error:', error.message);
    throw error;
  }
};

const transaction = async (callback) => {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    const result = await callback(conn);
    await conn.commit();
    return result;
  } catch (error) {
    await conn.rollback();
    throw error;
  } finally {
    conn.release();
  }
};

const queryOne = async (sql, params = []) => {
  const rows = await query(sql, params);
  return rows[0] || null;
};

const insert = async (table, data) => {
  const keys = Object.keys(data);
  const values = Object.values(data);
  const placeholders = keys.map(() => '?').join(', ');
  const sql = `INSERT INTO ${table} (${keys.join(', ')}) VALUES (${placeholders})`;
  const result = await query(sql, values);
  return result.insertId;
};

const update = async (table, data, whereClause, whereParams = []) => {
  const keys = Object.keys(data);
  const values = Object.values(data);
  const setClause = keys.map((k) => `${k} = ?`).join(', ');
  const sql = `UPDATE ${table} SET ${setClause} WHERE ${whereClause}`;
  const result = await query(sql, [...values, ...whereParams]);
  return result.affectedRows;
};

const deleteFrom = async (table, whereClause, whereParams = []) => {
  const sql = `DELETE FROM ${table} WHERE ${whereClause}`;
  const result = await query(sql, whereParams);
  return result.affectedRows;
};

const paginate = async (baseQuery, params = [], page = 1, limit = 20) => {
  const offset = (page - 1) * limit;
  const countQuery = `SELECT COUNT(*) AS total FROM (${baseQuery}) AS _t`;
  const [{ total }] = await query(countQuery, params);
  const dataQuery = `${baseQuery} LIMIT ? OFFSET ?`;
  const data = await query(dataQuery, [...params, limit, offset]);
  return {
    data,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit)
    }
  };
};

module.exports = {
  pool,
  query,
  queryOne,
  transaction,
  insert,
  update,
  deleteFrom,
  paginate,
  testConnection
};
