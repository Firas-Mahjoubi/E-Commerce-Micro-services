const axios = require('axios');
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

    res.json({
      users,
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

    res.json({ user });
  } catch (error) {
    next(error);
  }
};

// Update user (admin only)
exports.updateUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const user = await db.User.findByPk(id);

    if (!user) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'User not found'
      });
    }

    await user.update(updates);

    res.json({
      message: 'User updated successfully',
      user: user.toJSON()
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
