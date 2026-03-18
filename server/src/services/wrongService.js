const { WrongQuestion, Question, PracticeRecord } = require('../models');

async function getWrongList(userId, examCategoryId, { offset, limit }) {
  const { count, rows } = await WrongQuestion.findAndCountAll({
    where: { user_id: userId, is_removed: false },
    include: [{
      model: Question,
      where: { exam_category_id: examCategoryId, status: 'active' },
      attributes: ['id', 'type', 'content', 'options_json', 'difficulty'],
    }],
    offset,
    limit,
    order: [['last_wrong_at', 'DESC']],
  });
  return { total: count, list: rows };
}

async function removeWrong(userId, questionId) {
  await WrongQuestion.update(
    { is_removed: true },
    { where: { user_id: userId, question_id: questionId } }
  );
}

async function practiceWrong(userId, examCategoryId) {
  const wrongs = await WrongQuestion.findAll({
    where: { user_id: userId, is_removed: false },
    include: [{
      model: Question,
      where: { exam_category_id: examCategoryId, status: 'active' },
      attributes: ['id', 'type', 'content', 'options_json', 'difficulty'],
    }],
    order: [['wrong_count', 'DESC']],
  });

  const questions = wrongs.map(w => w.Question);

  const record = await PracticeRecord.create({
    user_id: userId,
    exam_category_id: examCategoryId,
    mode: 'chapter',
    total: questions.length,
    correct: 0,
    duration_seconds: 0,
  });

  return { practice_record_id: record.id, questions };
}

module.exports = { getWrongList, removeWrong, practiceWrong };
