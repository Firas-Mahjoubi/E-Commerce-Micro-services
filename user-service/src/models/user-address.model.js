module.exports = (sequelize, DataTypes) => {
  const UserAddress = sequelize.define('UserAddress', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    user_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    address_type: {
      type: DataTypes.ENUM('billing', 'shipping', 'both'),
      allowNull: false,
      defaultValue: 'shipping'
    },
    is_default: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    full_name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    phone: {
      type: DataTypes.STRING,
      allowNull: false
    },
    address_line1: {
      type: DataTypes.STRING,
      allowNull: false
    },
    address_line2: {
      type: DataTypes.STRING,
      allowNull: true
    },
    city: {
      type: DataTypes.STRING,
      allowNull: false
    },
    state: {
      type: DataTypes.STRING,
      allowNull: true
    },
    postal_code: {
      type: DataTypes.STRING,
      allowNull: false
    },
    country: {
      type: DataTypes.STRING,
      allowNull: false
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    },
    updated_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    }
  }, {
    tableName: 'user_addresses',
    timestamps: true,
    underscored: true
  });

  return UserAddress;
};
