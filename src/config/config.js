require('dotenv').config();

module.exports = {
  port: process.env.PORT || 3000,
  env: process.env.NODE_ENV || 'development',
  db: {
    host: process.env.DB_HOST || '127.0.0.1',
    port: parseInt(process.env.DB_PORT || '3306', 10),
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'kodomo_weekend_navi',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    enableKeepAlive: true,
    keepAliveInitialDelay: 0,
    timezone: '+09:00'
  },
  jwt: {
    secret: process.env.JWT_SECRET || 'your_jwt_secret_key_here',
    expiresIn: process.env.JWT_EXPIRES_IN || '7d'
  },
  upload: {
    maxFileSize: parseInt(process.env.MAX_FILE_SIZE || '5242880', 10),
    uploadPath: process.env.UPLOAD_PATH || './uploads',
    allowedImageTypes: ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
  },
  apiKeys: {
    weather: process.env.WEATHER_API_KEY || '',
    googleMaps: process.env.GOOGLE_MAPS_API_KEY || ''
  },
  cors: {
    origin: process.env.CORS_ORIGIN || '*',
    credentials: true
  },
  pagination: {
    defaultPage: 1,
    defaultLimit: 20,
    maxLimit: 100
  }
};
