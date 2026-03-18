const { Op, fn, col } = require('sequelize');
const { AnswerRecord, Question, Chapter } = require('../models');

async function getOverview(userId) {
  const total_answered = await AnswerRecord.count({ where: { user_id: userId } });
  const total_correct = await AnswerRecord.count({ where: { user_id: userId, is_correct: true } });
  const accuracy = total_answered > 0 ? Math.round((total_correct / total_answered) * 100) : 0;

  // Consecutive study days
  const days = await AnswerRecord.findAll({
    where: { user_id: userId },
    attributes: [[fn('DATE', col('created_at')), 'study_date']],
    group: [fn('DATE', col('created_at'))],
    order: [[fn('DATE', col('created_at')), 'DESC']],
    raw: true,
  });

  let consecutive_days = 0;
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  for (let i = 0; i < days.length; i++) {
    const expected = new Date(today);
    expected.setDate(expected.getDate() - i);
    const dayStr = expected.toISOString().slice(0, 10);
    if (days[i].study_date === dayStr) {
      consecutive_days++;
    } else {
      break;
    }
  }

  return { total_answered, total_correct, accuracy, consecutive_days };
}

async function getCategoryProgress(userId, categoryId) {
  const chapters = await Chapter.findAll({
    where: { exam_category_id: categoryId, status: 'active' },
    attributes: ['id', 'name'],
    order: [['sort_order', 'ASC']],
    raw: true,
  });

  const { getSequelize } = require('../config/database');
  const sequelize = getSequelize();
  const result = [];
  for (const ch of chapters) {
    const total = await Question.count({ where: { chapter_id: ch.id, status: 'active' } });
    const [rows] = await sequelize.query(
      'SELECT COUNT(DISTINCT ar.question_id) as cnt FROM answer_record ar INNER JOIN question q ON ar.question_id = q.id WHERE ar.user_id = ? AND q.chapter_id = ?',
      { replacements: [userId, ch.id] }
    );
    const answered = rows[0]?.cnt || 0;
    result.push({ ...ch, total_questions: total, answered_questions: answered });
  }

  return { chapters: result };
}

module.exports = { getOverview, getCategoryProgress };
