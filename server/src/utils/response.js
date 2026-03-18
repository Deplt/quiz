function success(res, data = null, statusCode = 200) {
  return res.status(statusCode).json({ code: 0, data });
}

function fail(res, message, statusCode = 400, code = -1) {
  return res.status(statusCode).json({ code, message });
}

module.exports = { success, fail };
