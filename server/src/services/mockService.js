const { Sequelize } = require('sequelize');
const { Question, MockExamConfig, PracticeRecord, AnswerRecord } = require('../models');
const { checkAnswer, upsertWrongQuestion } = require('./practiceService');

async function startMock(userId, mockExamConfigId) {
  const config = await MockExamConfig.findByPk(mockExamConfigId);
  if (!config) throw Object.assign(new Error('Mock exam config not found'), { statusCode: 404 });

  let questions;
  if (config.selection_rule === 'by_chapter' && config.rule_config_json) {
    const rules = config.rule_config_json;
    const allQuestions = [];
    for (const rule of rules) {
      const qs = await Question.findAll({
        where: { chapter_id: rule.chapter_id, status: 'active' },
        order: Sequelize.literal('RAND()'),
        limit: rule.count,
        attributes: ['id', 'type', 'content', 'options_json', 'difficulty'],
      });
      allQuestions.push(...qs);
    }
    questions = allQuestions;
  } else {
    questions = await Question.findAll({
      where: { exam_category_id: config.exam_category_id, status: 'active' },
      order: Sequelize.literal('RAND()'),
      limit: config.question_count,
      attributes: ['id', 'type', 'content', 'options_json', 'difficulty'],
    });
  }

  const record = await PracticeRecord.create({
    user_id: userId,
    exam_category_id: config.exam_category_id,
    mock_exam_config_id: config.id,
    mode: 'mock_exam',
    total: questions.length,
    correct: 0,
    duration_seconds: 0,
  });

  return {
    practice_record_id: record.id,
    questions,
    time_limit_minutes: config.time_limit_minutes,
  };
}

async function submitMock(userId, { practice_record_id, answers }) {
  let correct = 0;

  for (const ans of answers) {
    const question = await Question.findByPk(ans.question_id);
    const is_correct = checkAnswer(question, ans.user_answer);
    if (is_correct) correct++;

    await AnswerRecord.create({
      user_id: userId,
      question_id: ans.question_id,
      practice_record_id,
      user_answer: ans.user_answer,
      is_correct,
    });

    if (!is_correct) {
      await upsertWrongQuestion(userId, ans.question_id);
    }
  }

  const record = await PracticeRecord.findByPk(practice_record_id);
  await record.update({ total: answers.length, correct });

  return {
    total: answers.length,
    correct,
    accuracy: answers.length > 0 ? Math.round((correct / answers.length) * 100) : 0,
  };
}

module.exports = { startMock, submitMock };
