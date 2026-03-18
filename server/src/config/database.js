const { Sequelize } = require('sequelize');

let sequelize;

function getSequelize() {
  if (!sequelize) {
    sequelize = new Sequelize(
      process.env.DB_NAME || 'quiz_app',
      process.env.DB_USER || 'root',
      process.env.DB_PASSWORD || '',
      {
        host: process.env.DB_HOST || 'localhost',
        port: process.env.DB_PORT || 3306,
        dialect: 'mysql',
        logging: process.env.NODE_ENV === 'development' ? console.log : false,
      }
    );
  }
  return sequelize;
}

function resetSequelize() {
  sequelize = null;
}

module.exports = { getSequelize, resetSequelize };
