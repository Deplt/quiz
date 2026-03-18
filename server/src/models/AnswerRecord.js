const { DataTypes } = require('sequelize');
const { getSequelize } = require('../config/database');

const AnswerRecord = getSequelize().define('AnswerRecord', {
  user_id: { type: DataTypes.INTEGER, allowNull: false },
  question_id: { type: DataTypes.INTEGER, allowNull: false },
  practice_record_id: { type: DataTypes.INTEGER, allowNull: false },
  user_answer: { type: DataTypes.TEXT, allowNull: false },
  is_correct: { type: DataTypes.BOOLEAN, allowNull: false },
}, {
  tableName: 'answer_record',
  underscored: true,
});

module.exports = AnswerRecord;
