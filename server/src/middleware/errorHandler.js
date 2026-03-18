const { fail } = require('../utils/response');

function errorHandler(err, req, res, next) {
  console.error(err.stack);
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';
  return fail(res, message, statusCode);
}

module.exports = errorHandler;
