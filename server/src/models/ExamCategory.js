const { DataTypes } = require('sequelize');
const { getSequelize } = require('../config/database');

const ExamCategory = getSequelize().define('ExamCategory', {
  name: { type: DataTypes.STRING(100), allowNull: false },
  icon: { type: DataTypes.STRING(512), defaultValue: '' },
  sort_order: { type: DataTypes.INTEGER, defaultValue: 0 },
  status: { type: DataTypes.ENUM('active', 'archived'), defaultValue: 'active' },
}, {
  tableName: 'exam_category',
  underscored: true,
});

module.exports = ExamCategory;
