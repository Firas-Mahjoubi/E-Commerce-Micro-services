const session = require('express-session');

const keycloakConfig = {
  realm: process.env.KEYCLOAK_REALM || 'Ecommerce',
  'auth-server-url': process.env.KEYCLOAK_URL || 'http://localhost:8080',
  'ssl-required': 'external',
  resource: process.env.KEYCLOAK_CLIENT_ID || 'ecommerce-user-service',
  credentials: {
    secret: process.env.KEYCLOAK_CLIENT_SECRET || ''
  },
  'confidential-port': 0,
  'bearer-only': false,
  'public-client': false,
  'use-resource-role-mappings': true,
  'verify-token-audience': true
};

module.exports = keycloakConfig;
