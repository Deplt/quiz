const { MockExamConfig } = require('../../models');

async function list() {
  return MockExamConfig.findAll({ order: [['id', 'DESC']] });
}

async function create(data) {
  return MockExamConfig.create(data);
}

async function update(id, data) {
  const c = await MockExamConfig.findByPk(id);
  if (!c) { const err = new Error('Not found'); err.statusCode = 404; throw err; }
  await c.update(data);
  return c;
}

async function remove(id) {
  const c = await MockExamConfig.findByPk(id);
  if (!c) { const err = new Error('Not found'); err.statusCode = 404; throw err; }
  await c.destroy();
}

module.exports = { list, create, update, remove };
