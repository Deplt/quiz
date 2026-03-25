const api = require('../../utils/api');
const auth = require('../../utils/auth');
const app = getApp();

Page({
  data: {
    userInfo: null,
    phoneBound: false,
    maskedPhone: '',
    stats: {
      totalQuestions: 0,
      accuracy: '0%',
      continuousDays: 0,
    },
    currentCategoryName: '',
    categories: [],
    categoryIndex: 0,
    version: 'v1.0.0',
  },

  onShow() {
    auth.ensureLogin().then(() => {
      this.loadUserProfile();
      this.loadStats();
      this.loadCategories();
      this.setData({
        currentCategoryName: app.globalData.currentCategoryName || '未选择',
      });
    });
  },

  loadUserProfile() {
    api.getUserProfile().then((data) => {
      const user = data || {};
      app.globalData.userInfo = user;

      const phone = user.phone || user.phoneNumber || '';
      const phoneBound = !!phone;
      let maskedPhone = '';
      if (phoneBound && phone.length >= 11) {
        maskedPhone = phone.substring(0, 3) + '****' + phone.substring(7);
      } else if (phoneBound) {
        maskedPhone = phone;
      }

      this.setData({
        userInfo: user,
        phoneBound,
        maskedPhone,
      });
    }).catch((err) => {
      console.error('获取用户信息失败', err);
    });
  },

  loadStats() {
    api.getStatsOverview().then((data) => {
      const d = data || {};
      const total = d.total_questions || d.totalQuestions || 0;
      const correct = d.correct_count || d.correctCount || 0;
      const rate = total > 0 ? Math.round((correct / total) * 100) : 0;
      const days = d.continuous_days || d.continuousDays || 0;

      this.setData({
        stats: {
          totalQuestions: total,
          accuracy: rate + '%',
          continuousDays: days,
        },
      });
    }).catch((err) => {
      console.error('获取统计数据失败', err);
    });
  },

  loadCategories() {
    api.getCategories().then((data) => {
      const list = data || [];
      this.setData({ categories: list });

      if (app.globalData.currentCategoryId) {
        const idx = list.findIndex(
          (c) => c.id === app.globalData.currentCategoryId
        );
        if (idx >= 0) {
          this.setData({ categoryIndex: idx });
        }
      }
    }).catch((err) => {
      console.error('获取分类失败', err);
    });
  },

  onCategoryChange(e) {
    const index = Number(e.detail.value);
    const category = this.data.categories[index];
    if (!category) return;

    this.setData({
      categoryIndex: index,
      currentCategoryName: category.name,
    });
    app.setCategory(category.id, category.name);
    this.loadStats();
  },

  getPhoneNumber(e) {
    if (e.detail.errMsg !== 'getPhoneNumber:ok') {
      wx.showToast({ title: '取消绑定', icon: 'none' });
      return;
    }

    const code = e.detail.code;
    if (!code) {
      wx.showToast({ title: '获取手机号失败', icon: 'none' });
      return;
    }

    api.bindPhone({ code }).then((data) => {
      wx.showToast({ title: '绑定成功', icon: 'success' });
      this.loadUserProfile();
    }).catch((err) => {
      console.error('绑定手机号失败', err);
      wx.showToast({ title: '绑定失败', icon: 'none' });
    });
  },

  goToStats() {
    wx.showModal({
      title: '学习统计',
      content:
        '总答题：' + this.data.stats.totalQuestions + '题\n' +
        '正确率：' + this.data.stats.accuracy + '\n' +
        '连续学习：' + this.data.stats.continuousDays + '天',
      showCancel: false,
      confirmText: '知道了',
    });
  },

  showAbout() {
    wx.showModal({
      title: '关于',
      content: '刷题助手 ' + this.data.version + '\n专注备考，高效刷题。',
      showCancel: false,
      confirmText: '确定',
    });
  },
});
