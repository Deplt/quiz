const { DataTypes } = require('sequelize');
const { getSequelize } = require('../config/database');

const Question = getSequelize().define('Question', {
  exam_category_id: { type: DataTypes.INTEGER, allowNull: false },
  chapter_id: { type: DataTypes.INTEGER, allowNull: false },
  type: {
    type: DataTypes.ENUM('single_choice', 'multi_choice', 'true_false', 'fill_blank'),
    allowNull: false,
  },
  content: { type: DataTypes.TEXT, allowNull: false },
  options_json: { type: DataTypes.JSON, allowNull: true },
  answer: { type: DataTypes.TEXT, allowNull: false },
  explanation: { type: DataTypes.TEXT, defaultValue: '' },
  difficulty: { type: DataTypes.ENUM('easy', 'medium', 'hard'), defaultValue: 'medium' },
  status: { type: DataTypes.ENUM('active', 'archived'), defaultValue: 'active' },
}, {
  tableName: 'question',
  underscored: true,
});

module.exports = Question;
