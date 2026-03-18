const { Op } = require('sequelize');
const { User, Question, AnswerRecord } = require('../../models');

async function getDashboard() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const total_users = await User.count();
  const today_active = await AnswerRecord.count({
    where: { created_at: { [Op.gte]: today } },
    distinct: true,
    col: 'user_id',
  });
  const total_questions = await Question.count({ where: { status: 'active' } });
  const today_answers = await AnswerRecord.count({
    where: { created_at: { [Op.gte]: today } },
  });

  const trend = [];
  for (let i = 6; i >= 0; i--) {
    const dayStart = new Date(today);
    dayStart.setDate(dayStart.getDate() - i);
    const dayEnd = new Date(dayStart);
    dayEnd.setDate(dayEnd.getDate() + 1);
    const count = await AnswerRecord.count({
      where: { created_at: { [Op.gte]: dayStart, [Op.lt]: dayEnd } },
    });
    trend.push({ date: dayStart.toISOString().slice(0, 10), count });
  }

  return { total_users, today_active, total_questions, today_answers, trend };
}

module.exports = { getDashboard };
