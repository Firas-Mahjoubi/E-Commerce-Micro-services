const axios = require('axios');
const { validationResult } = require('express-validator');
const db = require('../models');
const logger = require('../utils/logger');

const keycloakAdminClient = axios.create({
  baseURL: `${process.env.KEYCLOAK_URL}/admin/realms/${process.env.KEYCLOAK_REALM}`,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Get admin access token
const getAdminToken = async () => {
  try {
    const response = await axios.post(
      `${process.env.KEYCLOAK_URL}/realms/master/protocol/openid-connect/token`,
      new URLSearchParams({
        username: process.env.KEYCLOAK_ADMIN_USERNAME,
        password: process.env.KEYCLOAK_ADMIN_PASSWORD,
        grant_type: 'password',
        client_id: 'admin-cli'
      }),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      }
    );
    return response.data.access_token;
  } catch (error) {
    logger.error('Failed to get admin token:', error.response?.data || error.message);
    throw new Error('Failed to authenticate with Keycloak');
  }
};

// Register new user
exports.register = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { username, email, password, firstName, lastName, phone, role = 'customer' } = req.body;

    // Validate role
    const validRoles = ['customer', 'seller', 'admin'];
    const userRole = validRoles.includes(role) ? role : 'customer';

    // Get admin token
    const adminToken = await getAdminToken();
    keycloakAdminClient.defaults.headers.common['Authorization'] = `Bearer ${adminToken}`;

    // Create user in Keycloak
    const keycloakUser = {
      username,
      email,
      firstName,
      lastName,
      enabled: true,
      emailVerified: false,
      credentials: [{
        type: 'password',
        value: password,
        temporary: false
      }],
      realmRoles: [userRole] // Use the role from request
    };

    const createResponse = await keycloakAdminClient.post('/users', keycloakUser);
    
    // Extract user ID from location header
    const locationHeader = createResponse.headers.location;
    const keycloakId = locationHeader.substring(locationHeader.lastIndexOf('/') + 1);

    // Assign the specified role
    try {
      const rolesResponse = await keycloakAdminClient.get(`/roles/${userRole}`);
      const roleData = rolesResponse.data;
      
      await keycloakAdminClient.post(
        `/users/${keycloakId}/role-mappings/realm`,
        [roleData]
      );
      logger.info(`Assigned ${userRole} role to user ${username}`);
    } catch (roleError) {
      logger.warn(`Failed to assign ${userRole} role:`, roleError.message);
    }

    // Create user in local database
    const user = await db.User.create({
      keycloak_id: keycloakId,
      username,
      email,
      email_verified: false,
      first_name: firstName,
      last_name: lastName,
      phone,
      is_active: true
    });

    // Create default user profile
    await db.UserProfile.create({
      user_id: user.id,
      preferences: {}
    });

    logger.info(`User registered successfully: ${username}`);

    res.status(201).json({
      message: 'User registered successfully',
      user: {
        id: user.id,
        username: user.username,
        email: user.email
      }
    });
  } catch (error) {
    logger.error('Registration error:', error.response?.data || error.message);
    
    if (error.response?.status === 409) {
      return res.status(409).json({
        error: 'Conflict',
        message: 'User already exists'
      });
    }
    
    next(error);
  }
};

// Login user
exports.login = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { username, password } = req.body;

    // Get token from Keycloak
    const response = await axios.post(
      `${process.env.KEYCLOAK_URL}/realms/${process.env.KEYCLOAK_REALM}/protocol/openid-connect/token`,
      new URLSearchParams({
        username,
        password,
        grant_type: 'password',
        client_id: process.env.KEYCLOAK_CLIENT_ID,
        client_secret: process.env.KEYCLOAK_CLIENT_SECRET
      }),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      }
    );

    const { access_token, refresh_token, expires_in, token_type } = response.data;

    // Decode token to get user info
    const tokenPayload = JSON.parse(Buffer.from(access_token.split('.')[1], 'base64').toString());

    // Update last login in database
    await db.User.update(
      { last_login: new Date() },
      { where: { keycloak_id: tokenPayload.sub } }
    );

    logger.info(`User logged in: ${username}`);

    res.json({
      message: 'Login successful',
      token_type,
      access_token,
      refresh_token,
      expires_in,
      user: {
        id: tokenPayload.sub,
        username: tokenPayload.preferred_username,
        email: tokenPayload.email,
        roles: tokenPayload.realm_access?.roles || []
      }
    });
  } catch (error) {
    logger.error('Login error:', error.response?.data || error.message);
    
    if (error.response?.status === 401) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Invalid username or password'
      });
    }
    
    next(error);
  }
};

// Refresh token
exports.refreshToken = async (req, res, next) => {
  try {
    const { refresh_token } = req.body;

    if (!refresh_token) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'Refresh token is required'
      });
    }

    const response = await axios.post(
      `${process.env.KEYCLOAK_URL}/realms/${process.env.KEYCLOAK_REALM}/protocol/openid-connect/token`,
      new URLSearchParams({
        grant_type: 'refresh_token',
        refresh_token,
        client_id: process.env.KEYCLOAK_CLIENT_ID,
        client_secret: process.env.KEYCLOAK_CLIENT_SECRET
      }),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      }
    );

    res.json({
      message: 'Token refreshed successfully',
      ...response.data
    });
  } catch (error) {
    logger.error('Refresh token error:', error.response?.data || error.message);
    
    if (error.response?.status === 400) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Invalid or expired refresh token'
      });
    }
    
    next(error);
  }
};

// Logout user
exports.logout = async (req, res, next) => {
  try {
    const { refresh_token } = req.body;

    if (refresh_token) {
      await axios.post(
        `${process.env.KEYCLOAK_URL}/realms/${process.env.KEYCLOAK_REALM}/protocol/openid-connect/logout`,
        new URLSearchParams({
          refresh_token,
          client_id: process.env.KEYCLOAK_CLIENT_ID,
          client_secret: process.env.KEYCLOAK_CLIENT_SECRET
        }),
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
          }
        }
      );
    }

    res.json({ message: 'Logout successful' });
  } catch (error) {
    logger.error('Logout error:', error.response?.data || error.message);
    // Don't fail logout even if Keycloak call fails
    res.json({ message: 'Logout successful' });
  }
};

// Verify email
exports.verifyEmail = async (req, res, next) => {
  try {
    // This would be called from email verification link
    res.json({ message: 'Email verification not yet implemented' });
  } catch (error) {
    next(error);
  }
};

// Forgot password
exports.forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    
    // Keycloak handles password reset via email
    // You would need to configure SMTP in Keycloak
    
    res.json({ 
      message: 'If the email exists, a password reset link has been sent' 
    });
  } catch (error) {
    next(error);
  }
};

// Reset password
exports.resetPassword = async (req, res, next) => {
  try {
    // This would be handled by Keycloak's password reset flow
    res.json({ message: 'Password reset not yet implemented' });
  } catch (error) {
    next(error);
  }
};
