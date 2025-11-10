const jwt = require('jsonwebtoken');
const jwksClient = require('jwks-rsa');
const logger = require('../utils/logger');

// Create JWKS client to fetch public keys from Keycloak
const client = jwksClient({
  jwksUri: `${process.env.KEYCLOAK_URL}/realms/${process.env.KEYCLOAK_REALM}/protocol/openid-connect/certs`,
  cache: true,
  cacheMaxAge: 600000 // 10 minutes
});

// Function to get signing key
function getKey(header, callback) {
  client.getSigningKey(header.kid, (err, key) => {
    if (err) {
      logger.error('Error getting signing key:', err);
      return callback(err);
    }
    const signingKey = key.getPublicKey();
    callback(null, signingKey);
  });
}

// Middleware to verify JWT token
const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ 
      error: 'Unauthorized', 
      message: 'No token provided' 
    });
  }

  const token = authHeader.substring(7); // Remove 'Bearer ' prefix

  // Accept both localhost and keycloak as valid issuers (for browser and container contexts)
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
      return res.status(401).json({ 
        error: 'Unauthorized', 
        message: 'User not authenticated' 
      });
    }

    if (!req.user.roles.includes(role)) {
      return res.status(403).json({ 
        error: 'Forbidden', 
        message: `Required role: ${role}` 
      });
    }

    next();
  };
};

module.exports = {
  verifyToken,
  requireRole
};
