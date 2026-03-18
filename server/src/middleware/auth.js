const jwt = require('jsonwebtoken');
const { fail } = require('../utils/response');

function auth(req, res, next) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    return fail(res, 'Unauthorized', 401);
  }
  try {
    const token = header.slice(7);
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = payload.userId;
    next();
  } catch {
    return fail(res, 'Invalid token', 401);
  }
}

module.exports = auth;
