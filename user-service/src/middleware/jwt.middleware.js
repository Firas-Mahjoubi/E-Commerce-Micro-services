const jwt = require('jsonwebtoken');
const jwksClient = require('jwks-rsa');
const logger = require('../utils/logger');

// Check if Keycloak is enabled
const KEYCLOAK_ENABLED = process.env.KEYCLOAK_ENABLED !== 'false';
const DEV_MODE = process.env.NODE_ENV !== 'production';

// Create JWKS client to fetch public keys from Keycloak (only if enabled)
const client = KEYCLOAK_ENABLED ? jwksClient({
  jwksUri: `${process.env.KEYCLOAK_URL}/realms/${process.env.KEYCLOAK_REALM}/protocol/openid-connect/certs`,
  cache: true,
  cacheMaxAge: 600000 // 10 minutes
}) : null;

// Function to get signing key
function getKey(header, callback) {
  if (!client) {
    return callback(new Error('Keycloak is disabled'));
  }
  client.getSigningKey(header.kid, (err, key) => {
    if (err) {
      logger.error('Error getting signing key:', err);
      return callback(err);
    }
    const signingKey = key.getPublicKey();
    callback(null, signingKey);
  });
}

// Simple JWT verification for development (without Keycloak)
const verifySimpleToken = (token) => {
  try {
    // In dev mode, decode without verification (ONLY FOR DEVELOPMENT!)
    const decoded = jwt.decode(token);
    if (!decoded) {
      throw new Error('Invalid token format');
    }
    return decoded;
  } catch (error) {
    throw error;
  }
};

// Middleware to verify JWT token
const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    logger.warn('No authorization header provided');
    return res.status(401).json({ 
      error: 'Unauthorized', 
      message: 'No token provided' 
    });
  }

  const token = authHeader.substring(7); // Remove 'Bearer ' prefix

  // If Keycloak is disabled and in dev mode, use simple verification
  if (!KEYCLOAK_ENABLED && DEV_MODE) {
    logger.info('Using dev mode authentication (Keycloak disabled)');
    try {
      const decoded = verifySimpleToken(token);
      
      // Extract user info from decoded token
      req.user = {
        id: decoded.sub || decoded.id || decoded.userId,
        username: decoded.preferred_username || decoded.username,
        email: decoded.email,
        firstName: decoded.given_name || decoded.firstName,
        lastName: decoded.family_name || decoded.lastName,
        roles: decoded.realm_access?.roles || decoded.roles || ['customer'],
        emailVerified: decoded.email_verified || decoded.emailVerified || false
      };

      logger.info(`Dev mode: User authenticated: ${req.user.username} with roles: ${req.user.roles.join(', ')}`);
      return next();
    } catch (error) {
      logger.error('Dev mode token verification failed:', error.message);
      return res.status(401).json({ 
        error: 'Unauthorized', 
        message: 'Invalid token format' 
      });
    }
  }

  // Production mode: verify with Keycloak
  const validIssuers = [
    `${process.env.KEYCLOAK_URL}/realms/${process.env.KEYCLOAK_REALM}`,
    `http://localhost:8080/realms/${process.env.KEYCLOAK_REALM}`
  ];

  jwt.verify(token, getKey, {
    audience: 'account',
    issuer: validIssuers,
    algorithms: ['RS256']
  }, (err, decoded) => {
    if (err) {
      logger.error('Token verification failed:', err.message);
      return res.status(401).json({ 
        error: 'Unauthorized', 
        message: 'Invalid or expired token' 
      });
    }

    // Extract user info from decoded token
    req.user = {
      id: decoded.sub,
      username: decoded.preferred_username,
      email: decoded.email,
      firstName: decoded.given_name,
      lastName: decoded.family_name,
      roles: decoded.realm_access?.roles || [],
      emailVerified: decoded.email_verified
    };

    logger.info(`User authenticated: ${req.user.username} (${req.user.id})`);
    next();
  });
};

// Middleware to check if user has required role
const requireRole = (role) => {
  return (req, res, next) => {
    if (!req.user) {
      logger.warn('Role check failed: User not authenticated');
      return res.status(401).json({ 
        error: 'Unauthorized', 
        message: 'User not authenticated' 
      });
    }

    if (!req.user.roles.includes(role)) {
      logger.warn(`Role check failed: User ${req.user.username} does not have role ${role}. Has roles: ${req.user.roles.join(', ')}`);
      return res.status(403).json({ 
        error: 'Forbidden', 
        message: `Required role: ${role}` 
      });
    }

    logger.info(`Role check passed: User ${req.user.username} has role ${role}`);
    next();
  };
};

module.exports = {
  verifyToken,
  requireRole
};
