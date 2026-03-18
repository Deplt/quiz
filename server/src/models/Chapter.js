const { DataTypes } = require('sequelize');
const { getSequelize } = require('../config/database');

const Chapter = getSequelize().define('Chapter', {
  exam_category_id: { type: DataTypes.INTEGER, allowNull: false },
  name: { type: DataTypes.STRING(100), allowNull: false },
  sort_order: { type: DataTypes.INTEGER, defaultValue: 0 },
  status: { type: DataTypes.ENUM('active', 'archived'), defaultValue: 'active' },
}, {
  tableName: 'chapter',
  underscored: true,
});

module.exports = Chapter;
