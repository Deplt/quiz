const { login } = require('./utils/auth');

App({
  globalData: {
    userInfo: null,
    token: null,
    currentCategoryId: null,
    currentCategoryName: '',
  },

  onLaunch() {
    const token = wx.getStorageSync('token');
    if (token) {
      this.globalData.token = token;
    }
    const categoryId = wx.getStorageSync('currentCategoryId');
    const categoryName = wx.getStorageSync('currentCategoryName');
    if (categoryId) {
      this.globalData.currentCategoryId = categoryId;
      this.globalData.currentCategoryName = categoryName || '';
    }
  },

  ensureLogin() {
    if (this.globalData.token) {
      return Promise.resolve(this.globalData.token);
    }
    return login().then((token) => {
      this.globalData.token = token;
      return token;
    });
  },

  setCategory(id, name) {
    this.globalData.currentCategoryId = id;
    this.globalData.currentCategoryName = name;
    wx.setStorageSync('currentCategoryId', id);
    wx.setStorageSync('currentCategoryName', name);
  },
});
