const express = require('express');
const cors = require('cors');
const config = require('./config/config');
const db = require('./database/db');

const app = express();

// Middleware
app.use(cors(config.cors));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Logging middleware
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: config.env
  });
});

// Import routes
const authRoutes = require('./routes/authRoutes');
const spotsRoutes = require('./routes/spotsRoutes');
const childrenRoutes = require('./routes/childrenRoutes');
const favoritesRoutes = require('./routes/favoritesRoutes');
const kidsSwipeRoutes = require('./routes/kidsSwipeRoutes');

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/spots', spotsRoutes);
app.use('/api/children', childrenRoutes);
app.use('/api/favorites', favoritesRoutes);
app.use('/api/kids-swipe', kidsSwipeRoutes);

app.get('/api', (req, res) => {
  res.json({
    message: 'Kodomo Weekend Navi API',
    version: '1.0.0',
    endpoints: {
      health: 'GET /health',
      auth: {
        register: 'POST /api/auth/register',
        login: 'POST /api/auth/login',
        logout: 'POST /api/auth/logout',
        profile: 'GET /api/auth/profile'
      },
      spots: {
        search: 'GET /api/spots/search?keyword=&category=&sort=',
        suggestions: 'GET /api/spots/suggestions?keyword=',
        detail: 'GET /api/spots/:id',
        reviews: 'GET /api/spots/:id/reviews'
      },
      children: {
        list: 'GET /api/children',
        detail: 'GET /api/children/:id',
        create: 'POST /api/children',
        update: 'PUT /api/children/:id',
        delete: 'DELETE /api/children/:id'
      },
      favorites: {
        list: 'GET /api/favorites',
        check: 'GET /api/favorites/check/:spotId',
        collections: 'GET /api/favorites/collections',
        add: 'POST /api/favorites',
        update: 'PUT /api/favorites/:id',
        deleteById: 'DELETE /api/favorites/:id',
        deleteBySpot: 'DELETE /api/favorites/spot/:spotId'
      },
      kidsSwipe: {
        swipe: 'POST /api/kids-swipe/:childId/swipe',
        preferences: 'GET /api/kids-swipe/:childId/preferences',
        recommendations: 'GET /api/kids-swipe/:childId/recommendations'
      }
    }
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Not Found',
    message: `Cannot ${req.method} ${req.path}`
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal Server Error',
    ...(config.env === 'development' && { stack: err.stack })
  });
});

// Start server
const startServer = async () => {
  try {
    // Test database connection
    const isConnected = await db.testConnection();
    
    if (!isConnected) {
      console.error('❌ Cannot start server without database connection');
      process.exit(1);
    }
    
    app.listen(config.port, () => {
      console.log('\n🚀 Server started successfully!');
      console.log(`📍 Environment: ${config.env}`);
      console.log(`🌐 Server running at: http://localhost:${config.port}`);
      console.log(`🏥 Health check: http://localhost:${config.port}/health`);
      console.log(`📖 API docs: http://localhost:${config.port}/api`);
      console.log('\n✨ Ready to accept requests!\n');
    });
    
  } catch (error) {
    console.error('❌ Failed to start server:', error.message);
    process.exit(1);
  }
};

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n⏳ Shutting down gracefully...');
  await db.pool.end();
  console.log('✅ Database connections closed');
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('\n⏳ Shutting down gracefully...');
  await db.pool.end();
  console.log('✅ Database connections closed');
  process.exit(0);
});

// Start the server
startServer();

module.exports = app;
