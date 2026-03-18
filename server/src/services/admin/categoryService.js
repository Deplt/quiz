const { ExamCategory, Chapter } = require('../../models');

async function listCategories() {
  return ExamCategory.findAll({ order: [['sort_order', 'ASC']] });
}

async function createCategory(data) {
  return ExamCategory.create(data);
}

async function updateCategory(id, data) {
  const cat = await ExamCategory.findByPk(id);
  if (!cat) { const err = new Error('Not found'); err.statusCode = 404; throw err; }
  await cat.update(data);
  return cat;
}

async function archiveCategory(id) {
  return updateCategory(id, { status: 'archived' });
}

async function listChapters(categoryId) {
  return Chapter.findAll({
    where: { exam_category_id: categoryId },
    order: [['sort_order', 'ASC']],
  });
}

async function createChapter(data) {
  return Chapter.create(data);
}

async function updateChapter(id, data) {
  const ch = await Chapter.findByPk(id);
  if (!ch) { const err = new Error('Not found'); err.statusCode = 404; throw err; }
  await ch.update(data);
  return ch;
}

async function archiveChapter(id) {
  return updateChapter(id, { status: 'archived' });
}

module.exports = {
  listCategories, createCategory, updateCategory, archiveCategory,
  listChapters, createChapter, updateChapter, archiveChapter,
};
