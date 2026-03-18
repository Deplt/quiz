const jwt = require('jsonwebtoken');
const { Admin } = require('../../models');

async function login(username, password) {
  const admin = await Admin.findOne({ where: { username } });
  if (!admin || !admin.verifyPassword(password)) {
    const err = new Error('Invalid credentials');
    err.statusCode = 401;
    throw err;
  }
  const token = jwt.sign(
    { adminId: admin.id, role: 'admin' },
    process.env.JWT_SECRET,
    { expiresIn: process.env.ADMIN_JWT_EXPIRES_IN || '24h' }
  );
  return { token, admin: { id: admin.id, username: admin.username } };
}

async function changePassword(adminId, oldPassword, newPassword) {
  const admin = await Admin.findByPk(adminId);
  if (!admin.verifyPassword(oldPassword)) {
    const err = new Error('Old password incorrect');
    err.statusCode = 400;
    throw err;
  }
  await admin.update({ password_hash: Admin.hashPassword(newPassword) });
}

module.exports = { login, changePassword };
