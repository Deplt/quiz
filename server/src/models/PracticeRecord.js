const { DataTypes } = require('sequelize');
const { getSequelize } = require('../config/database');

const PracticeRecord = getSequelize().define('PracticeRecord', {
  user_id: { type: DataTypes.INTEGER, allowNull: false },
  exam_category_id: { type: DataTypes.INTEGER, allowNull: false },
  chapter_id: { type: DataTypes.INTEGER, allowNull: true },
  mock_exam_config_id: { type: DataTypes.INTEGER, allowNull: true },
  mode: {
    type: DataTypes.ENUM('chapter', 'random', 'mock_exam'),
    allowNull: false,
  },
  total: { type: DataTypes.INTEGER, defaultValue: 0 },
  correct: { type: DataTypes.INTEGER, defaultValue: 0 },
  duration_seconds: { type: DataTypes.INTEGER, defaultValue: 0 },
}, {
  tableName: 'practice_record',
  underscored: true,
});

module.exports = PracticeRecord;
