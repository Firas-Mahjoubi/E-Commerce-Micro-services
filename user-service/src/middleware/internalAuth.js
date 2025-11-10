/**
 * Middleware to authenticate internal service-to-service calls
 * Checks for X-Internal-API-Key header
 */
const internalAuth = (req, res, next) => {
  const internalApiKey = req.headers['x-internal-api-key'];
  const expectedApiKey = process.env.INTERNAL_API_KEY;

  if (!expectedApiKey) {
    console.error('[InternalAuth] INTERNAL_API_KEY not configured in environment');
    return res.status(500).json({
      error: 'Internal Server Error',
      message: 'Internal authentication not configured'
    });
  }

  if (!internalApiKey) {
    console.log('[InternalAuth] Missing X-Internal-API-Key header');
    return next(); // Let normal auth handle it
  }

  if (internalApiKey !== expectedApiKey) {
    console.log('[InternalAuth] Invalid internal API key');
    return res.status(403).json({
      error: 'Forbidden',
      message: 'Invalid internal API key'
    });
  }

  console.log('[InternalAuth] Internal service authenticated successfully');
  req.isInternalService = true;
  next();
};

module.exports = internalAuth;
