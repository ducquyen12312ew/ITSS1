const express = require('express');
const cors = require('cors');
const path = require('path');
const config = require('./config/config');
const db = require('./database/db');

const app = express();

app.use(cors(config.cors));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, '../public')));

app.use((req, _res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  if (email && password) {
    return res.json({ success: true, message: 'ログイン成功', user: { email } });
  }
  return res.status(400).json({ success: false, message: 'メールアドレスまたはパスワードが間違っています' });
});

app.post('/api/auth/signup', (req, res) => {
  const { name, email, password } = req.body;
  if (name && email && password) {
    return res.json({ success: true, message: 'アカウント作成成功', user: { name, email } });
  }
  return res.status(400).json({ success: false, message: '登録情報が不完全です' });
});

app.get('/health', (_req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString(), uptime: process.uptime(), environment: config.env });
});

app.get('/api', (_req, res) => {
  res.json({
    message: 'Kodomo Weekend Navi API',
    version: '1.0.0',
    endpoints: {
      health: '/health',
      api: '/api',
      auth: { login: '/api/auth/login', signup: '/api/auth/signup' },
      users: '/api/users',
      spots: '/api/spots',
      reviews: '/api/reviews',
      favorites: '/api/favorites',
      schedules: '/api/schedules',
      children: '/api/children'
    }
  });
});

app.get('/', (_req, res) => {
  res.sendFile(path.join(__dirname, '../public/login.html'));
});

app.use((req, res) => {
  res.status(404).json({ error: 'Not Found', message: `Cannot ${req.method} ${req.path}` });
});

app.use((err, _req, res, _next) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({ error: err.message || 'Internal Server Error', ...(config.env === 'development' && { stack: err.stack }) });
});

const startServer = async () => {
  try {
    const isConnected = await db.testConnection();
    if (!isConnected) console.warn('Starting server without database connection');
    app.listen(config.port, () => {
      console.log(`Server running on port ${config.port}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error.message);
    process.exit(1);
  }
};

process.on('SIGINT', async () => {
  console.log('Shutting down gracefully');
  try { await db.pool.end(); } catch {}
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('Shutting down gracefully');
  try { await db.pool.end(); } catch {}
  process.exit(0);
});

startServer();
