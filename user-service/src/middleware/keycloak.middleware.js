const Keycloak = require('keycloak-connect');
const session = require('express-session');
const keycloakConfig = require('../config/keycloak.config');
const logger = require('../utils/logger');

let keycloak;

const initKeycloak = (app) => {
  if (keycloak) {
    logger.warn('Keycloak already initialized');
    return keycloak;
  }

  const memoryStore = new session.MemoryStore();
  
  keycloak = new Keycloak({ store: memoryStore }, keycloakConfig);

  // Keycloak middleware
  app.use(keycloak.middleware({
    logout: '/logout',
    admin: '/'
  }));

  logger.info('✅ Keycloak middleware initialized');
  
  return keycloak;
};

const getKeycloak = () => {
  if (!keycloak) {
    throw new Error('Keycloak has not been initialized. Call initKeycloak first.');
  }
  return keycloak;
};

// Custom middleware to check roles
const checkRole = (role) => {
  return (req, res, next) => {
    if (!req.kauth || !req.kauth.grant) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const token = req.kauth.grant.access_token;
    const roles = token.content.realm_access?.roles || [];

    if (!roles.includes(role)) {
      return res.status(403).json({ 
        error: 'Forbidden', 
        message: `Required role: ${role}` 
      });
    }

    next();
  };
};

// Middleware to extract user info from token
const extractUserInfo = (req, res, next) => {
  if (req.kauth && req.kauth.grant) {
    const token = req.kauth.grant.access_token.content;
    req.user = {
      id: token.sub,
      username: token.preferred_username,
      email: token.email,
      firstName: token.given_name,
      lastName: token.family_name,
      roles: token.realm_access?.roles || [],
      emailVerified: token.email_verified
    };
  }
  next();
};

module.exports = {
  initKeycloak,
  getKeycloak,
  checkRole,
  extractUserInfo
};
