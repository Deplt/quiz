const { DataTypes } = require('sequelize');
const { getSequelize } = require('../config/database');

const User = getSequelize().define('User', {
  openid: { type: DataTypes.STRING(128), unique: true, allowNull: false },
  nickname: { type: DataTypes.STRING(64), defaultValue: '' },
  avatar: { type: DataTypes.STRING(512), defaultValue: '' },
  phone: { type: DataTypes.STRING(20), defaultValue: '' },
}, {
  tableName: 'user',
  underscored: true,
});

module.exports = User;
