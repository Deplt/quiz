const { ExamCategory, Chapter, Question } = require('../models');

async function getCategories() {
  return ExamCategory.findAll({
    where: { status: 'active' },
    order: [['sort_order', 'ASC']],
    attributes: ['id', 'name', 'icon', 'sort_order'],
  });
}

async function getChaptersByCategory(categoryId) {
  return Chapter.findAll({
    where: { exam_category_id: categoryId, status: 'active' },
    order: [['sort_order', 'ASC']],
    attributes: ['id', 'name', 'sort_order'],
  });
}

async function getQuestionsByChapter(chapterId, { offset, limit }) {
  const { count, rows } = await Question.findAndCountAll({
    where: { chapter_id: chapterId, status: 'active' },
    offset,
    limit,
    attributes: ['id', 'type', 'content', 'options_json', 'difficulty'],
    order: [['id', 'ASC']],
  });
  return { total: count, list: rows };
}

module.exports = { getCategories, getChaptersByCategory, getQuestionsByChapter };
