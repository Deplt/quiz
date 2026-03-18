const { Sequelize, Op } = require('sequelize');
const { Question, PracticeRecord, AnswerRecord, WrongQuestion } = require('../models');

async function upsertWrongQuestion(userId, questionId) {
  const existing = await WrongQuestion.findOne({ where: { user_id: userId, question_id: questionId } });
  if (existing) {
    await existing.update({
      wrong_count: existing.wrong_count + 1,
      last_wrong_at: new Date(),
      is_removed: false,
    });
  } else {
    await WrongQuestion.create({
      user_id: userId,
      question_id: questionId,
      wrong_count: 1,
      last_wrong_at: new Date(),
    });
  }
}

async function startPractice(userId, { mode, chapter_id, exam_category_id, count = 20 }) {
  const where = { status: 'active' };

  if (mode === 'chapter') {
    where.chapter_id = chapter_id;
  } else if (mode === 'random') {
    where.exam_category_id = exam_category_id;
  }

  let questions;
  if (mode === 'random') {
    const answeredIds = await AnswerRecord.findAll({
      where: { user_id: userId },
      include: [{ model: Question, where: { exam_category_id }, attributes: [] }],
      attributes: ['question_id'],
      group: ['question_id'],
      raw: true,
    });
    const answeredSet = answeredIds.map(r => r.question_id);

    const unanswered = await Question.findAll({
      where: { ...where, ...(answeredSet.length > 0 ? { id: { [Op.notIn]: answeredSet } } : {}) },
      attributes: ['id', 'type', 'content', 'options_json', 'difficulty'],
      order: Sequelize.literal('RAND()'),
      limit: count,
    });

    if (unanswered.length < count) {
      const remaining = count - unanswered.length;
      const supplement = await Question.findAll({
        where: { ...where, ...(unanswered.length > 0 ? { id: { [Op.notIn]: unanswered.map(q => q.id) } } : {}) },
        attributes: ['id', 'type', 'content', 'options_json', 'difficulty'],
        order: Sequelize.literal('RAND()'),
        limit: remaining,
      });
      questions = [...unanswered, ...supplement];
    } else {
      questions = unanswered;
    }
  } else {
    questions = await Question.findAll({
      where,
      attributes: ['id', 'type', 'content', 'options_json', 'difficulty'],
      order: [['id', 'ASC']],
    });
  }

  const record = await PracticeRecord.create({
    user_id: userId,
    exam_category_id,
    chapter_id: mode === 'chapter' ? chapter_id : null,
    mode,
    total: questions.length,
    correct: 0,
    duration_seconds: 0,
  });

  return { practice_record_id: record.id, questions };
}

function checkAnswer(question, userAnswer) {
  const { type, answer } = question;
  switch (type) {
    case 'single_choice':
    case 'true_false':
      return userAnswer.trim().toLowerCase() === answer.trim().toLowerCase();
    case 'multi_choice': {
      const correct = answer.split(',').map(s => s.trim().toUpperCase()).sort().join(',');
      const given = userAnswer.split(',').map(s => s.trim().toUpperCase()).sort().join(',');
      return correct === given;
    }
    case 'fill_blank': {
      const normalize = (s) => s.trim().replace(/[\uff01-\uff5e]/g, (ch) =>
        String.fromCharCode(ch.charCodeAt(0) - 0xfee0)
      ).toLowerCase();
      return normalize(userAnswer) === normalize(answer);
    }
    default:
      return false;
  }
}

async function submitAnswer(userId, { practice_record_id, question_id, user_answer }) {
  const question = await Question.findByPk(question_id);
  const is_correct = checkAnswer(question, user_answer);

  await AnswerRecord.create({
    user_id: userId,
    question_id,
    practice_record_id,
    user_answer,
    is_correct,
  });

  if (!is_correct) {
    await upsertWrongQuestion(userId, question_id);
  }

  return {
    is_correct,
    correct_answer: question.answer,
    explanation: question.explanation,
  };
}

async function finishPractice(userId, practiceRecordId, durationSeconds = 0) {
  const answers = await AnswerRecord.findAll({
    where: { practice_record_id: practiceRecordId, user_id: userId },
  });

  const total = answers.length;
  const correct = answers.filter(a => a.is_correct).length;

  const record = await PracticeRecord.findByPk(practiceRecordId);
  await record.update({ total, correct, duration_seconds: durationSeconds });

  return { total, correct, accuracy: total > 0 ? Math.round((correct / total) * 100) : 0 };
}

module.exports = { startPractice, submitAnswer, finishPractice, checkAnswer, upsertWrongQuestion };
