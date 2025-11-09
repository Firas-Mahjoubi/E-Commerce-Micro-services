const express = require('express');
const session = require('express-session');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
require('dotenv').config();

const keycloakConfig = require('./config/keycloak.config');
const keycloakMiddleware = require('./middleware/keycloak.middleware');
const errorHandler = require('./middleware/error.middleware');
const logger = require('./utils/logger');
const { initEureka, setupGracefulShutdown } = require('./config/eureka.config');

// Import routes
const authRoutes = require('./routes/auth.routes');
const userRoutes = require('./routes/user.routes');
const profileRoutes = require('./routes/profile.routes');
const healthRoutes = require('./routes/health.routes');

// Database
const db = require('./models');

const app = express();

// Trust proxy for secure cookies behind reverse proxy
app.set('trust proxy', 1);

// Middleware
app.use(helmet()); // Security headers
app.use(cors({
  origin: process.env.CORS_ORIGIN?.split(',') || '*',
  credentials: true
}));
app.use(morgan('combined', { stream: logger.stream }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Session configuration for Keycloak
app.use(session({
  secret: process.env.SESSION_SECRET || 'change-this-secret',
  resave: false,
  saveUninitialized: true,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));

// Initialize Keycloak
const keycloak = keycloakMiddleware.initKeycloak(app);

// Health check (no auth required)
app.use('/api/health', healthRoutes);

// Public routes (no auth required)
app.use('/api/auth', authRoutes);

// Protected routes (require authentication)
app.use('/api/users', keycloak.protect(), userRoutes);
app.use('/api/profile', keycloak.protect(), profileRoutes);

// Admin routes (require admin role)
app.get('/api/admin/users', 
  keycloak.protect('admin'),
  (req, res) => {
    res.json({ message: 'Admin access granted', user: req.kauth.grant.access_token.content });
  }
);

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    service: 'User Service',
    version: '1.0.0',
    status: 'running',
    keycloak: {
      url: process.env.KEYCLOAK_URL,
      realm: process.env.KEYCLOAK_REALM
    }
  });
});

// Error handling middleware (must be last)
app.use(errorHandler);

// Database synchronization and server start
const PORT = process.env.PORT || 3000;

const startServer = async () => {
  try {
    // Test database connection
    await db.sequelize.authenticate();
    logger.info('✅ Database connection established successfully');

    // Sync database models
    await db.sequelize.sync({ force: false });
    logger.info('✅ Database models synchronized');

    // Start server
    app.listen(PORT, async () => {
      logger.info(`🚀 User Service started on port ${PORT}`);
      logger.info(`📍 Environment: ${process.env.NODE_ENV || 'development'}`);
      logger.info(`🔐 Keycloak: ${process.env.KEYCLOAK_URL}/realms/${process.env.KEYCLOAK_REALM}`);
      logger.info(`🗄️  Database: ${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}`);

      // Register with Eureka if enabled
      if (process.env.EUREKA_ENABLED === 'true') {
        try {
          await initEureka();
          logger.info('✅ Registered with Eureka Discovery Server');
          setupGracefulShutdown();
        } catch (error) {
          logger.error(`❌ Failed to register with Eureka: ${error.message}`);
          logger.warn('⚠️ Service will continue without Eureka registration');
        }
      } else {
        logger.info('ℹ️  Eureka registration is disabled');
      }

      logger.info('✅ User Service is ready to accept requests');
    });
  } catch (error) {
    logger.error(`❌ Failed to start server: ${error.message}`);
    process.exit(1);
  }
};

// Start the server
startServer();

module.exports = app;

