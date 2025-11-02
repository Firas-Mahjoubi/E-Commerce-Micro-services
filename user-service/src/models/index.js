const sequelize = require('../config/database.config');
const { DataTypes } = require('sequelize');

// Import models
const User = require('./user.model')(sequelize, DataTypes);
const UserProfile = require('./user-profile.model')(sequelize, DataTypes);
const UserAddress = require('./user-address.model')(sequelize, DataTypes);

// Define associations
User.hasOne(UserProfile, {
  foreignKey: 'user_id',
  as: 'profile',
  onDelete: 'CASCADE'
});

UserProfile.belongsTo(User, {
  foreignKey: 'user_id',
  as: 'user'
});

User.hasMany(UserAddress, {
  foreignKey: 'user_id',
  as: 'addresses',
  onDelete: 'CASCADE'
});

UserAddress.belongsTo(User, {
  foreignKey: 'user_id',
  as: 'user'
});

const db = {
  sequelize,
  Sequelize: require('sequelize'),
  User,
  UserProfile,
  UserAddress
};

module.exports = db;
