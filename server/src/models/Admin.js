const { DataTypes } = require('sequelize');
const { getSequelize } = require('../config/database');
const bcrypt = require('bcryptjs');

const Admin = getSequelize().define('Admin', {
  username: { type: DataTypes.STRING(64), unique: true, allowNull: false },
  password_hash: { type: DataTypes.STRING(255), allowNull: false },
}, {
  tableName: 'admin',
  underscored: true,
});

Admin.prototype.verifyPassword = function (password) {
  return bcrypt.compareSync(password, this.password_hash);
};

Admin.hashPassword = function (password) {
  return bcrypt.hashSync(password, 10);
};

module.exports = Admin;
