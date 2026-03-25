const { Question } = require('../../models');

async function listQuestions(filters, { offset, limit }) {
  const where = { status: 'active' };
  if (filters.exam_category_id) where.exam_category_id = filters.exam_category_id;
  if (filters.chapter_id) where.chapter_id = filters.chapter_id;
  if (filters.type) where.type = filters.type;

  const { count, rows } = await Question.findAndCountAll({
    where,
    offset,
    limit,
    order: [['id', 'DESC']],
  });
  return { total: count, list: rows };
}

async function createQuestion(data) {
  return Question.create(data);
}

async function updateQuestion(id, data) {
  const q = await Question.findByPk(id);
  if (!q) { const err = new Error('Not found'); err.statusCode = 404; throw err; }
  await q.update(data);
  return q;
}

async function archiveQuestion(id) {
  return updateQuestion(id, { status: 'archived' });
}

async function batchArchive(ids) {
  await Question.update({ status: 'archived' }, { where: { id: ids } });
}

module.exports = { listQuestions, createQuestion, updateQuestion, archiveQuestion, batchArchive };
