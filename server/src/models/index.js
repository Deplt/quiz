const User = require('./User');
const ExamCategory = require('./ExamCategory');
const Chapter = require('./Chapter');
const Question = require('./Question');
const PracticeRecord = require('./PracticeRecord');
const AnswerRecord = require('./AnswerRecord');
const WrongQuestion = require('./WrongQuestion');
const MockExamConfig = require('./MockExamConfig');
const Admin = require('./Admin');

// Associations
ExamCategory.hasMany(Chapter, { foreignKey: 'exam_category_id' });
Chapter.belongsTo(ExamCategory, { foreignKey: 'exam_category_id' });

ExamCategory.hasMany(Question, { foreignKey: 'exam_category_id' });
Question.belongsTo(ExamCategory, { foreignKey: 'exam_category_id' });

Chapter.hasMany(Question, { foreignKey: 'chapter_id' });
Question.belongsTo(Chapter, { foreignKey: 'chapter_id' });

User.hasMany(PracticeRecord, { foreignKey: 'user_id' });
PracticeRecord.belongsTo(User, { foreignKey: 'user_id' });

PracticeRecord.hasMany(AnswerRecord, { foreignKey: 'practice_record_id' });
AnswerRecord.belongsTo(PracticeRecord, { foreignKey: 'practice_record_id' });

User.hasMany(AnswerRecord, { foreignKey: 'user_id' });
AnswerRecord.belongsTo(User, { foreignKey: 'user_id' });

Question.hasMany(AnswerRecord, { foreignKey: 'question_id' });
AnswerRecord.belongsTo(Question, { foreignKey: 'question_id' });

User.hasMany(WrongQuestion, { foreignKey: 'user_id' });
WrongQuestion.belongsTo(User, { foreignKey: 'user_id' });

Question.hasMany(WrongQuestion, { foreignKey: 'question_id' });
WrongQuestion.belongsTo(Question, { foreignKey: 'question_id' });

ExamCategory.hasMany(MockExamConfig, { foreignKey: 'exam_category_id' });
MockExamConfig.belongsTo(ExamCategory, { foreignKey: 'exam_category_id' });

module.exports = {
  User,
  ExamCategory,
  Chapter,
  Question,
  PracticeRecord,
  AnswerRecord,
  WrongQuestion,
  MockExamConfig,
  Admin,
};
