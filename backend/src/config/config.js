require('dotenv').config();

module.exports = {
  // Server config
  port: process.env.PORT || 3000,
  env: process.env.NODE_ENV || 'development',

  // Database config
  db: {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT) || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'kodomo_weekend_navi',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    enableKeepAlive: true,
    keepAliveInitialDelay: 0,
    timezone: '+09:00', // JST (Japan Standard Time)
    charset: 'utf8mb4' // Fix Japanese character encoding
  },

  // JWT config
  jwt: {
    secret: process.env.JWT_SECRET || 'your_jwt_secret_key_here',
    expiresIn: process.env.JWT_EXPIRES_IN || '7d'
  },

  // File upload config
  upload: {
    maxFileSize: parseInt(process.env.MAX_FILE_SIZE) || 5242880, // 5MB
    uploadPath: process.env.UPLOAD_PATH || './uploads',
    allowedImageTypes: ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
  },

  // External API keys
  apiKeys: {
    weather: process.env.WEATHER_API_KEY || '',
    googleMaps: process.env.GOOGLE_MAPS_API_KEY || ''
  },

  // CORS config
  cors: {
    origin: process.env.CORS_ORIGIN || '*',
    credentials: true
  },

  // Pagination default
  pagination: {
    defaultPage: 1,
    defaultLimit: 20,
    maxLimit: 100
  }
};
