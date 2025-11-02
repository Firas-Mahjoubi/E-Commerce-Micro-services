const express = require('express');
const router = express.Router();
const db = require('../models');

router.get('/', async (req, res) => {
  try {
    // Check database connection
    await db.sequelize.authenticate();
    
    res.json({
      status: 'healthy',
      service: 'user-service',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      database: 'connected',
      keycloak: {
        url: process.env.KEYCLOAK_URL,
        realm: process.env.KEYCLOAK_REALM
      }
    });
  } catch (error) {
    res.status(503).json({
      status: 'unhealthy',
      service: 'user-service',
      timestamp: new Date().toISOString(),
      error: error.message
    });
  }
});

module.exports = router;
