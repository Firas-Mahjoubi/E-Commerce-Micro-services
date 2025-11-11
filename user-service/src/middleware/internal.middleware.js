const logger = require('../utils/logger');

// Internal API key for service-to-service communication
const INTERNAL_API_KEY = process.env.INTERNAL_API_KEY || 'internal-service-secret-key-2024';

/**
 * Middleware to verify internal service requests
 * Checks for X-Internal-API-Key header
 */
const verifyInternalRequest = (req, res, next) => {
  const apiKey = req.headers['x-internal-api-key'];

  if (!apiKey) {
    logger.warn('Internal API request missing X-Internal-API-Key header');
    return res.status(401).json({ 
      error: 'Unauthorized', 
      message: 'Internal API key required' 
    });
  }

  if (apiKey !== INTERNAL_API_KEY) {
    logger.warn('Internal API request with invalid API key');
    return res.status(403).json({ 
      error: 'Forbidden', 
      message: 'Invalid internal API key' 
    });
  }

  logger.info('Internal API request authenticated successfully');
  next();
};

module.exports = {
  verifyInternalRequest
};
