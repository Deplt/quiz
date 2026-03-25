const api = require('./api');

function login() {
  return new Promise((resolve, reject) => {
    wx.login({
      success(res) {
        if (!res.code) {
          reject(new Error('微信登录失败'));
          return;
        }
        api.wxLogin(res.code).then((data) => {
          const token = data.token;
          wx.setStorageSync('token', token);
          if (data.user) {
            getApp().globalData.userInfo = data.user;
          }
          resolve(token);
        }).catch(reject);
      },
      fail() {
        reject(new Error('微信登录失败'));
      },
    });
  });
}

function ensureLogin() {
  return getApp().ensureLogin();
}

function logout() {
  wx.removeStorageSync('token');
  const app = getApp();
  app.globalData.token = null;
  app.globalData.userInfo = null;
}

module.exports = { login, ensureLogin, logout };
