const jwt = require('jsonwebtoken');
const { User } = require('../models');
const { code2session } = require('../utils/wechat');

async function loginByWechat(code) {
  const session = await code2session(code);
  const { openid } = session;

  let user = await User.findOne({ where: { openid } });
  if (!user) {
    user = await User.create({ openid });
  }

  const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });

  return { token, user };
}

async function getProfile(userId) {
  const user = await User.findByPk(userId, {
    attributes: ['id', 'nickname', 'avatar', 'phone', 'created_at'],
  });
  return user;
}

async function bindPhone(userId, phone) {
  await User.update({ phone }, { where: { id: userId } });
  return getProfile(userId);
}

module.exports = { loginByWechat, getProfile, bindPhone };
