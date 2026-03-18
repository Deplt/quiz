const { DataTypes } = require('sequelize');
const { getSequelize } = require('../config/database');

const WrongQuestion = getSequelize().define('WrongQuestion', {
  user_id: { type: DataTypes.INTEGER, allowNull: false },
  question_id: { type: DataTypes.INTEGER, allowNull: false },
  wrong_count: { type: DataTypes.INTEGER, defaultValue: 1 },
  last_wrong_at: { type: DataTypes.DATE, allowNull: false },
  is_removed: { type: DataTypes.BOOLEAN, defaultValue: false },
}, {
  tableName: 'wrong_question',
  underscored: true,
  indexes: [{ unique: true, fields: ['user_id', 'question_id'] }],
});

module.exports = WrongQuestion;
