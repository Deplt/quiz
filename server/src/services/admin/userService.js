const { User, AnswerRecord } = require('../../models');
const { Op } = require('sequelize');

async function listUsers(search, { offset, limit }) {
  const where = {};
  if (search) {
    where[Op.or] = [
      { nickname: { [Op.like]: `%${search}%` } },
      { phone: { [Op.like]: `%${search}%` } },
    ];
  }
  const { count, rows } = await User.findAndCountAll({
    where, offset, limit, order: [['id', 'DESC']],
    attributes: ['id', 'nickname', 'avatar', 'phone', 'created_at'],
  });
  return { total: count, list: rows };
}

async function getUserDetail(userId) {
  const user = await User.findByPk(userId, {
    attributes: ['id', 'nickname', 'avatar', 'phone', 'created_at'],
  });
  if (!user) { const err = new Error('Not found'); err.statusCode = 404; throw err; }
  const total_answered = await AnswerRecord.count({ where: { user_id: userId } });
  const total_correct = await AnswerRecord.count({ where: { user_id: userId, is_correct: true } });
  return { ...user.toJSON(), total_answered, total_correct };
}

module.exports = { listUsers, getUserDetail };
