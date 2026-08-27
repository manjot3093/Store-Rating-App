const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const User = sequelize.define(
  'User',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    name: {
      type: DataTypes.STRING(60),
      allowNull: false,
      validate: {
        len: {
          args: [20, 60],
          msg: 'Name must be between 20 and 60 characters',
        },
      },
    },
    email: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: true,
      validate: {
        isEmail: { msg: 'A valid email address is required' },
      },
    },
    password: {
      // stores the bcrypt hash, not the plaintext password
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    address: {
      type: DataTypes.STRING(400),
      allowNull: false,
      validate: {
        len: {
          args: [1, 400],
          msg: 'Address must not exceed 400 characters',
        },
      },
    },
    role: {
      type: DataTypes.ENUM('admin', 'user', 'store_owner'),
      allowNull: false,
      defaultValue: 'user',
    },
  },
  {
    tableName: 'users',
    timestamps: true,
    indexes: [
      { fields: ['email'] },
      { fields: ['role'] },
      { fields: ['name'] },
    ],
  }
);

module.exports = User;
