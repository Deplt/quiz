const jwt = require('jsonwebtoken');
const { fail } = require('../utils/response');

function adminAuth(req, res, next) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    return fail(res, 'Unauthorized', 401);
  }
  try {
    const token = header.slice(7);
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    if (payload.role !== 'admin') {
      return fail(res, 'Forbidden', 403);
    }
    req.adminId = payload.adminId;
    next();
  } catch {
    return fail(res, 'Invalid token', 401);
  }
}

module.exports = adminAuth;
