const { DataTypes } = require('sequelize');
const { getSequelize } = require('../config/database');

const MockExamConfig = getSequelize().define('MockExamConfig', {
  exam_category_id: { type: DataTypes.INTEGER, allowNull: false },
  name: { type: DataTypes.STRING(100), allowNull: false },
  question_count: { type: DataTypes.INTEGER, allowNull: false },
  time_limit_minutes: { type: DataTypes.INTEGER, allowNull: false },
  selection_rule: { type: DataTypes.ENUM('random', 'by_chapter'), defaultValue: 'random' },
  rule_config_json: { type: DataTypes.JSON, allowNull: true },
}, {
  tableName: 'mock_exam_config',
  underscored: true,
});

module.exports = MockExamConfig;
