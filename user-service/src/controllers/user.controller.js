const axios = require('axios');
const db = require('../models');
const logger = require('../utils/logger');

// Keycloak admin client
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

// Get current user
exports.getCurrentUser = async (req, res, next) => {
  try {
    const keycloakId = req.user.id;

    const user = await db.User.findOne({
      where: { keycloak_id: keycloakId },
      include: [
        { model: db.UserProfile, as: 'profile' },
        { model: db.UserAddress, as: 'addresses' }
      ]
    });

    if (!user) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'User not found'
      });
    }

    res.json({
      user: {
        ...user.toJSON(),
        roles: req.user.roles
      }
    });
  } catch (error) {
    next(error);
  }
};

// Update current user
exports.updateCurrentUser = async (req, res, next) => {
  try {
    const keycloakId = req.user.id;
    const { firstName, lastName, phone, email } = req.body;

    const user = await db.User.findOne({
      where: { keycloak_id: keycloakId }
    });

    if (!user) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'User not found'
      });
    }

    // Update in local database
    await user.update({
      first_name: firstName || user.first_name,
      last_name: lastName || user.last_name,
      phone: phone || user.phone,
      email: email || user.email
    });

    // Update in Keycloak
    try {
      const adminToken = await getAdminToken();
      keycloakAdminClient.defaults.headers.common['Authorization'] = `Bearer ${adminToken}`;

      await keycloakAdminClient.put(`/users/${keycloakId}`, {
        firstName: firstName || user.first_name,
        lastName: lastName || user.last_name,
        email: email || user.email
      });
    } catch (keycloakError) {
      logger.warn('Failed to update user in Keycloak:', keycloakError.message);
    }

    res.json({
      message: 'User updated successfully',
      user: user.toJSON()
    });
  } catch (error) {
    next(error);
  }
};

// Delete current user
exports.deleteCurrentUser = async (req, res, next) => {
  try {
    const keycloakId = req.user.id;

    const user = await db.User.findOne({
      where: { keycloak_id: keycloakId }
    });

    if (!user) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'User not found'
      });
    }

    // Delete from local database
    await user.destroy();

    // Delete from Keycloak
    try {
      const adminToken = await getAdminToken();
      keycloakAdminClient.defaults.headers.common['Authorization'] = `Bearer ${adminToken}`;
      await keycloakAdminClient.delete(`/users/${keycloakId}`);
    } catch (keycloakError) {
      logger.warn('Failed to delete user from Keycloak:', keycloakError.message);
    }

    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    next(error);
  }
};

// Get user basic info for notifications (authenticated users can access)
exports.getUserBasicInfo = async (req, res, next) => {
  try {
    const userId = req.params.userId;

    const user = await db.User.findOne({
      where: { keycloak_id: userId },
      attributes: ['keycloak_id', 'username', 'email', 'first_name', 'last_name']
    });

    if (!user) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'User not found'
      });
    }

    res.json({
      id: user.keycloak_id,
      username: user.username,
      email: user.email,
      firstName: user.first_name,
      lastName: user.last_name
    });
  } catch (error) {
    next(error);
  }
};

// Get all users (admin only)
exports.getAllUsers = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, search = '' } = req.query;
    const offset = (page - 1) * limit;

    const where = search ? {
      [db.Sequelize.Op.or]: [
        { username: { [db.Sequelize.Op.iLike]: `%${search}%` } },
        { email: { [db.Sequelize.Op.iLike]: `%${search}%` } },
        { first_name: { [db.Sequelize.Op.iLike]: `%${search}%` } },
        { last_name: { [db.Sequelize.Op.iLike]: `%${search}%` } }
      ]
    } : {};

    const { count, rows: users } = await db.User.findAndCountAll({
      where,
      include: [{ model: db.UserProfile, as: 'profile' }],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['created_at', 'DESC']]
    });

    // Get admin token to fetch roles from Keycloak
    const adminToken = await getAdminToken();
    keycloakAdminClient.defaults.headers.common['Authorization'] = `Bearer ${adminToken}`;

    // Transform users and fetch their roles from Keycloak
    const transformedUsersPromises = users.map(async (user) => {
      let roles = [];
      
      try {
        // Fetch user's roles from Keycloak
        const rolesResponse = await keycloakAdminClient.get(`/users/${user.keycloak_id}/role-mappings/realm`);
        roles = rolesResponse.data.map(role => role.name);
        logger.info(`Fetched roles for ${user.username}: ${JSON.stringify(roles)}`);
      } catch (error) {
        logger.error(`Failed to fetch roles for user ${user.username}:`, error.response?.data || error.message);
        // Default to empty roles if fetch fails
        roles = [];
      }

      return {
        id: user.id,
        keycloak_id: user.keycloak_id,
        username: user.username,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        phone: user.phone,
        address: user.profile?.address,
        roles: roles,
        emailVerified: user.email_verified,
        enabled: user.is_active,
        createdAt: user.created_at,
        updatedAt: user.updated_at,
        lastLogin: user.last_login
      };
    });

    const transformedUsers = await Promise.all(transformedUsersPromises);

    res.json({
      users: transformedUsers,
      pagination: {
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(count / limit)
      }
    });
  } catch (error) {
    next(error);
  }
};

// Get user by ID (admin only)
exports.getUserById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const user = await db.User.findByPk(id, {
      include: [
        { model: db.UserProfile, as: 'profile' },
        { model: db.UserAddress, as: 'addresses' }
      ]
    });

    if (!user) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'User not found'
      });
    }

    // Get admin token to fetch roles from Keycloak
    const adminToken = await getAdminToken();
    keycloakAdminClient.defaults.headers.common['Authorization'] = `Bearer ${adminToken}`;

    // Fetch user's roles from Keycloak
    let roles = [];
    try {
      const rolesResponse = await keycloakAdminClient.get(`/users/${user.keycloak_id}/role-mappings/realm`);
      roles = rolesResponse.data.map(role => role.name);
      logger.info(`Fetched roles for ${user.username}: ${JSON.stringify(roles)}`);
    } catch (error) {
      logger.error(`Failed to fetch roles for user ${user.username}:`, error.response?.data || error.message);
      roles = [];
    }

    // Return user data in the format frontend expects
    res.json({
      id: user.id,
      keycloak_id: user.keycloak_id,
      username: user.username,
      email: user.email,
      firstName: user.first_name,
      lastName: user.last_name,
      phone: user.phone,
      address: user.profile?.address,
      roles: roles,
      emailVerified: user.email_verified,
      enabled: user.is_active,
      createdAt: user.created_at,
      updatedAt: user.updated_at,
      lastLogin: user.last_login
    });
  } catch (error) {
    next(error);
  }
};

// Update user (admin only)
exports.updateUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { username, email, firstName, lastName, phone, role, enabled } = req.body;

    const user = await db.User.findByPk(id, {
      include: [{ model: db.UserProfile, as: 'profile' }]
    });

    if (!user) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'User not found'
      });
    }

    // Get admin token for Keycloak operations
    const adminToken = await getAdminToken();
    keycloakAdminClient.defaults.headers.common['Authorization'] = `Bearer ${adminToken}`;

    // Update user in Keycloak
    try {
      await keycloakAdminClient.put(`/users/${user.keycloak_id}`, {
        username: username || user.username,
        email: email || user.email,
        firstName: firstName || user.first_name,
        lastName: lastName || user.last_name,
        enabled: enabled !== undefined ? enabled : user.is_active
      });
      logger.info(`Updated user in Keycloak: ${username || user.username}`);
    } catch (keycloakError) {
      logger.error('Failed to update user in Keycloak:', keycloakError.response?.data || keycloakError.message);
      return res.status(500).json({
        error: 'Keycloak Update Failed',
        message: 'Failed to update user in Keycloak'
      });
    }

    // Handle role change if provided
    if (role && ['customer', 'seller', 'admin'].includes(role)) {
      try {
        // Get current roles
        const currentRolesResponse = await keycloakAdminClient.get(`/users/${user.keycloak_id}/role-mappings/realm`);
        const currentRoles = currentRolesResponse.data;

        // Remove old roles (only customer, seller, admin)
        const rolesToRemove = currentRoles.filter(r => ['customer', 'seller', 'admin'].includes(r.name));
        if (rolesToRemove.length > 0) {
          await keycloakAdminClient.delete(`/users/${user.keycloak_id}/role-mappings/realm`, {
            data: rolesToRemove
          });
          logger.info(`Removed roles from user: ${rolesToRemove.map(r => r.name).join(', ')}`);
        }

        // Assign new role
        const newRoleResponse = await keycloakAdminClient.get(`/roles/${role}`);
        await keycloakAdminClient.post(`/users/${user.keycloak_id}/role-mappings/realm`, [newRoleResponse.data]);
        logger.info(`Assigned ${role} role to user ${username || user.username}`);
      } catch (roleError) {
        logger.error('Failed to update user role:', roleError.response?.data || roleError.message);
        return res.status(500).json({
          error: 'Role Update Failed',
          message: 'Failed to update user role in Keycloak'
        });
      }
    }

    // Update user in database
    await user.update({
      username: username || user.username,
      email: email || user.email,
      first_name: firstName || user.first_name,
      last_name: lastName || user.last_name,
      phone: phone || user.phone,
      is_active: enabled !== undefined ? enabled : user.is_active
    });

    // Update profile if it exists
    if (user.profile) {
      await user.profile.update({
        first_name: firstName || user.profile.first_name,
        last_name: lastName || user.profile.last_name,
        phone: phone || user.profile.phone
      });
    }

    // Fetch updated roles
    const rolesResponse = await keycloakAdminClient.get(`/users/${user.keycloak_id}/role-mappings/realm`);
    const roles = rolesResponse.data.map(role => role.name);

    res.json({
      message: 'User updated successfully',
      user: {
        id: user.id,
        keycloak_id: user.keycloak_id,
        username: user.username,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        phone: user.phone,
        roles: roles,
        enabled: user.is_active,
        createdAt: user.created_at,
        updatedAt: user.updated_at
      }
    });
  } catch (error) {
    next(error);
  }
};

// Delete user (admin only)
exports.deleteUser = async (req, res, next) => {
  try {
    const { id } = req.params;

    const user = await db.User.findByPk(id);

    if (!user) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'User not found'
      });
    }

    // Delete from Keycloak
    try {
      const adminToken = await getAdminToken();
      keycloakAdminClient.defaults.headers.common['Authorization'] = `Bearer ${adminToken}`;
      await keycloakAdminClient.delete(`/users/${user.keycloak_id}`);
    } catch (keycloakError) {
      logger.warn('Failed to delete user from Keycloak:', keycloakError.message);
    }

    // Delete from local database
    await user.destroy();

    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    next(error);
  }
};

// Assign role to user (admin only)
exports.assignRole = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    const user = await db.User.findByPk(id);

    if (!user) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'User not found'
      });
    }

    const adminToken = await getAdminToken();
    keycloakAdminClient.defaults.headers.common['Authorization'] = `Bearer ${adminToken}`;

    // Get role definition
    const rolesResponse = await keycloakAdminClient.get(`/roles/${role}`);
    const roleData = rolesResponse.data;

    // Assign role to user
    await keycloakAdminClient.post(
      `/users/${user.keycloak_id}/role-mappings/realm`,
      [roleData]
    );

    res.json({
      message: `Role ${role} assigned successfully`,
      user: user.toJSON()
    });
  } catch (error) {
    logger.error('Assign role error:', error.response?.data || error.message);
    next(error);
  }
};

// Remove role from user (admin only)
exports.removeRole = async (req, res, next) => {
  try {
    const { id, role } = req.params;

    const user = await db.User.findByPk(id);

    if (!user) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'User not found'
      });
    }

    const adminToken = await getAdminToken();
    keycloakAdminClient.defaults.headers.common['Authorization'] = `Bearer ${adminToken}`;

    // Get role definition
    const rolesResponse = await keycloakAdminClient.get(`/roles/${role}`);
    const roleData = rolesResponse.data;

    // Remove role from user
    await keycloakAdminClient.delete(
      `/users/${user.keycloak_id}/role-mappings/realm`,
      {
        data: [roleData]
      }
    );

    res.json({
      message: `Role ${role} removed successfully`,
      user: user.toJSON()
    });
  } catch (error) {
    logger.error('Remove role error:', error.response?.data || error.message);
    next(error);
  }
};
