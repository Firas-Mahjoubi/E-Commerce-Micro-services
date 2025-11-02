const db = require('../models');
const logger = require('../utils/logger');

// Get user profile
exports.getProfile = async (req, res, next) => {
  try {
    const keycloakId = req.user.id;

    const user = await db.User.findOne({
      where: { keycloak_id: keycloakId },
      include: [
        { 
          model: db.UserProfile, 
          as: 'profile' 
        }
      ]
    });

    if (!user) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'User profile not found'
      });
    }

    res.json({
      profile: user.profile || {}
    });
  } catch (error) {
    next(error);
  }
};

// Update user profile
exports.updateProfile = async (req, res, next) => {
  try {
    const keycloakId = req.user.id;
    const { 
      avatarUrl, 
      dateOfBirth, 
      gender, 
      bio, 
      preferences,
      newsletterSubscribed 
    } = req.body;

    const user = await db.User.findOne({
      where: { keycloak_id: keycloakId },
      include: [{ model: db.UserProfile, as: 'profile' }]
    });

    if (!user) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'User not found'
      });
    }

    let profile = user.profile;

    if (profile) {
      // Update existing profile
      await profile.update({
        avatar_url: avatarUrl !== undefined ? avatarUrl : profile.avatar_url,
        date_of_birth: dateOfBirth !== undefined ? dateOfBirth : profile.date_of_birth,
        gender: gender !== undefined ? gender : profile.gender,
        bio: bio !== undefined ? bio : profile.bio,
        preferences: preferences !== undefined ? preferences : profile.preferences,
        newsletter_subscribed: newsletterSubscribed !== undefined ? newsletterSubscribed : profile.newsletter_subscribed
      });
    } else {
      // Create new profile
      profile = await db.UserProfile.create({
        user_id: user.id,
        avatar_url: avatarUrl,
        date_of_birth: dateOfBirth,
        gender,
        bio,
        preferences: preferences || {},
        newsletter_subscribed: newsletterSubscribed || false
      });
    }

    res.json({
      message: 'Profile updated successfully',
      profile: profile.toJSON()
    });
  } catch (error) {
    next(error);
  }
};

// Get user addresses
exports.getAddresses = async (req, res, next) => {
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

    const addresses = await db.UserAddress.findAll({
      where: { user_id: user.id },
      order: [['is_default', 'DESC'], ['created_at', 'DESC']]
    });

    res.json({ addresses });
  } catch (error) {
    next(error);
  }
};

// Create new address
exports.createAddress = async (req, res, next) => {
  try {
    const keycloakId = req.user.id;
    const addressData = req.body;

    const user = await db.User.findOne({
      where: { keycloak_id: keycloakId }
    });

    if (!user) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'User not found'
      });
    }

    // If this is set as default, unset all other defaults
    if (addressData.isDefault) {
      await db.UserAddress.update(
        { is_default: false },
        { where: { user_id: user.id } }
      );
    }

    const address = await db.UserAddress.create({
      user_id: user.id,
      address_type: addressData.addressType || 'shipping',
      is_default: addressData.isDefault || false,
      full_name: addressData.fullName,
      phone: addressData.phone,
      address_line1: addressData.addressLine1,
      address_line2: addressData.addressLine2,
      city: addressData.city,
      state: addressData.state,
      postal_code: addressData.postalCode,
      country: addressData.country
    });

    res.status(201).json({
      message: 'Address created successfully',
      address: address.toJSON()
    });
  } catch (error) {
    next(error);
  }
};

// Update address
exports.updateAddress = async (req, res, next) => {
  try {
    const keycloakId = req.user.id;
    const { id } = req.params;
    const updates = req.body;

    const user = await db.User.findOne({
      where: { keycloak_id: keycloakId }
    });

    if (!user) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'User not found'
      });
    }

    const address = await db.UserAddress.findOne({
      where: { 
        id,
        user_id: user.id 
      }
    });

    if (!address) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'Address not found'
      });
    }

    // If setting as default, unset all other defaults
    if (updates.isDefault && !address.is_default) {
      await db.UserAddress.update(
        { is_default: false },
        { where: { user_id: user.id } }
      );
    }

    await address.update({
      address_type: updates.addressType || address.address_type,
      is_default: updates.isDefault !== undefined ? updates.isDefault : address.is_default,
      full_name: updates.fullName || address.full_name,
      phone: updates.phone || address.phone,
      address_line1: updates.addressLine1 || address.address_line1,
      address_line2: updates.addressLine2 !== undefined ? updates.addressLine2 : address.address_line2,
      city: updates.city || address.city,
      state: updates.state !== undefined ? updates.state : address.state,
      postal_code: updates.postalCode || address.postal_code,
      country: updates.country || address.country
    });

    res.json({
      message: 'Address updated successfully',
      address: address.toJSON()
    });
  } catch (error) {
    next(error);
  }
};

// Delete address
exports.deleteAddress = async (req, res, next) => {
  try {
    const keycloakId = req.user.id;
    const { id } = req.params;

    const user = await db.User.findOne({
      where: { keycloak_id: keycloakId }
    });

    if (!user) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'User not found'
      });
    }

    const address = await db.UserAddress.findOne({
      where: { 
        id,
        user_id: user.id 
      }
    });

    if (!address) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'Address not found'
      });
    }

    await address.destroy();

    res.json({ message: 'Address deleted successfully' });
  } catch (error) {
    next(error);
  }
};

// Set default address
exports.setDefaultAddress = async (req, res, next) => {
  try {
    const keycloakId = req.user.id;
    const { id } = req.params;

    const user = await db.User.findOne({
      where: { keycloak_id: keycloakId }
    });

    if (!user) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'User not found'
      });
    }

    const address = await db.UserAddress.findOne({
      where: { 
        id,
        user_id: user.id 
      }
    });

    if (!address) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'Address not found'
      });
    }

    // Unset all other defaults
    await db.UserAddress.update(
      { is_default: false },
      { where: { user_id: user.id } }
    );

    // Set this as default
    await address.update({ is_default: true });

    res.json({
      message: 'Default address updated successfully',
      address: address.toJSON()
    });
  } catch (error) {
    next(error);
  }
};
