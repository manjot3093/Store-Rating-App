const { Sequelize } = require('sequelize');
require('dotenv').config();

// RDS/Aurora typically enforces SSL on connections. Set DB_SSL=true in your
// environment (e.g. Elastic Beanstalk env vars) when connecting to RDS/Aurora.
// Leave it unset for local development against a local Postgres instance.
const useSSL = String(process.env.DB_SSL || '').trim().toLowerCase() === 'true';

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT || 5432,
    dialect: 'postgres',
    logging: process.env.NODE_ENV === 'development' ? false : false,
    define: {
      underscored: true, // snake_case columns in Postgres, camelCase in JS
    },
    dialectOptions: useSSL
      ? {
          ssl: {
            require: true,
            rejectUnauthorized: false, // RDS/Aurora uses AWS-managed certs
          },
        }
      : {},
    pool: {
      max: 10,
      min: 0,
      acquire: 30000,
      idle: 10000,
    },
  }
);

module.exports = sequelize;