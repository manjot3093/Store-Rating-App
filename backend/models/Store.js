const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Store = sequelize.define(
  'Store',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    name: {
      type: DataTypes.STRING(60),
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: true,
      validate: {
        isEmail: { msg: 'A valid email address is required' },
      },
    },
    address: {
      type: DataTypes.STRING(400),
      allowNull: false,
    },
    // A store may optionally be linked to a store_owner user account.
    ownerId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'users',
        key: 'id',
      },
      field: 'owner_id',
    },
  },
  {
    tableName: 'stores',
    timestamps: true,
    indexes: [{ fields: ['name'] }, { fields: ['email'] }, { fields: ['owner_id'] }],
  }
);

module.exports = Store;
