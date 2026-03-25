const BASE_URL = 'http://localhost:3000';

function getToken() {
  return wx.getStorageSync('token') || '';
}

function request(path, options = {}) {
  const { method = 'GET', data, needAuth = true } = options;
  const header = { 'Content-Type': 'application/json' };

  if (needAuth) {
    const token = getToken();
    if (token) {
      header['Authorization'] = 'Bearer ' + token;
    }
  }

  return new Promise((resolve, reject) => {
    wx.request({
      url: BASE_URL + path,
      method,
      data,
      header,
      success(res) {
        if (res.statusCode === 401) {
          wx.removeStorageSync('token');
          getApp().globalData.token = null;
          reject(new Error('登录已过期，请重新登录'));
          return;
        }
        const body = res.data;
        if (body && body.code === 0) {
          resolve(body.data);
        } else {
          reject(new Error((body && body.message) || '请求失败'));
        }
      },
      fail(err) {
        reject(new Error(err.errMsg || '网络异常'));
      },
    });
  });
}

// ---- User ----
function wxLogin(code) {
  return request('/api/v1/user/login', { method: 'POST', data: { code }, needAuth: false });
}

function getUserProfile() {
  return request('/api/v1/user/profile');
}

function bindPhone(data) {
  return request('/api/v1/user/bindPhone', { method: 'POST', data });
}

// ---- Exam ----
function getCategories() {
  return request('/api/v1/exam/categories');
}

function getCategoryChapters(categoryId) {
  return request('/api/v1/exam/categories/' + categoryId + '/chapters');
}

function getChapterQuestions(chapterId, page, pageSize) {
  return request('/api/v1/exam/chapters/' + chapterId + '/questions?page=' + page + '&pageSize=' + (pageSize || 20));
}

// ---- Practice ----
function startPractice(data) {
  return request('/api/v1/practice/start', { method: 'POST', data });
}

function submitAnswer(data) {
  return request('/api/v1/practice/submit', { method: 'POST', data });
}

function finishPractice(data) {
  return request('/api/v1/practice/finish', { method: 'POST', data });
}

// ---- Mock Exam ----
function startMockExam(data) {
  return request('/api/v1/mock/start', { method: 'POST', data });
}

function submitMockExam(data) {
  return request('/api/v1/mock/submit', { method: 'POST', data });
}

// ---- Wrong Questions ----
function getWrongList(params) {
  let qs = '?page=' + (params.page || 1) + '&pageSize=' + (params.pageSize || 20);
  if (params.exam_category_id) qs += '&exam_category_id=' + params.exam_category_id;
  return request('/api/v1/wrong/list' + qs);
}

function removeWrong(data) {
  return request('/api/v1/wrong/remove', { method: 'POST', data });
}

function practiceWrong(data) {
  return request('/api/v1/wrong/practice', { method: 'POST', data });
}

// ---- Stats ----
function getStatsOverview() {
  return request('/api/v1/stats/overview');
}

function getCategoryStats(categoryId) {
  return request('/api/v1/stats/category/' + categoryId);
}

module.exports = {
  request,
  wxLogin,
  getUserProfile,
  bindPhone,
  getCategories,
  getCategoryChapters,
  getChapterQuestions,
  startPractice,
  submitAnswer,
  finishPractice,
  startMockExam,
  submitMockExam,
  getWrongList,
  removeWrong,
  practiceWrong,
  getStatsOverview,
  getCategoryStats,
};
