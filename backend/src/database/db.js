const mysql = require('mysql2/promise');
const config = require('../config/config');

// Tạo connection pool
const pool = mysql.createPool(config.db);

// Test connection
const testConnection = async () => {
  try {
    const connection = await pool.getConnection();
    console.log('✅ Database connected successfully!');
    connection.release();
    return true;
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    return false;
  }
};

// Query helper với error handling
const query = async (sql, params = []) => {
  try {
    const [rows] = await pool.execute(sql, params);
    return rows;
  } catch (error) {
    console.error('Database query error:', error.message);
    throw error;
  }
};

// Transaction helper
const transaction = async (callback) => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    const result = await callback(connection);
    await connection.commit();
    return result;
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};

// Get single row
const queryOne = async (sql, params = []) => {
  const rows = await query(sql, params);
  return rows[0] || null;
};

// Insert helper
const insert = async (table, data) => {
  const keys = Object.keys(data);
  const values = Object.values(data);
  const placeholders = keys.map(() => '?').join(', ');
  
  const sql = `INSERT INTO ${table} (${keys.join(', ')}) VALUES (${placeholders})`;
  const result = await query(sql, values);
  return result.insertId;
};

// Update helper
const update = async (table, data, whereClause, whereParams = []) => {
  const keys = Object.keys(data);
  const values = Object.values(data);
  const setClause = keys.map(key => `${key} = ?`).join(', ');
  
  const sql = `UPDATE ${table} SET ${setClause} WHERE ${whereClause}`;
  const result = await query(sql, [...values, ...whereParams]);
  return result.affectedRows;
};

// Delete helper
const deleteFrom = async (table, whereClause, whereParams = []) => {
  const sql = `DELETE FROM ${table} WHERE ${whereClause}`;
  const result = await query(sql, whereParams);
  return result.affectedRows;
};

// Paginate helper
const paginate = async (baseQuery, params = [], page = 1, limit = 20) => {
  const offset = (page - 1) * limit;
  
  // Get total count
  const countQuery = baseQuery.replace(/SELECT .+ FROM/, 'SELECT COUNT(*) as total FROM');
  const [{ total }] = await query(countQuery, params);
  
  // Get paginated data
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
