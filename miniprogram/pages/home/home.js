const api = require('../../utils/api');
const { ensureLogin } = require('../../utils/auth');
const app = getApp();

Page({
  data: {
    // Category picker
    categoryName: '',
    categoryId: null,
    categories: [],
    showCategoryPicker: false,

    // Today stats
    todayCount: 0,
    todayAccuracy: 0,

    // Category progress
    totalQuestions: 0,
    answeredQuestions: 0,
    progressPercent: 0,

    // Loading
    loading: true,
  },

  onShow() {
    ensureLogin()
      .then(() => {
        const categoryId = app.globalData.currentCategoryId;
        const categoryName = app.globalData.currentCategoryName;
        this.setData({
          categoryId: categoryId,
          categoryName: categoryName || '请选择考试分类',
        });
        this.loadCategories();
        this.loadStats();
        if (categoryId) {
          this.loadCategoryProgress(categoryId);
        }
      })
      .catch(() => {
        wx.showToast({ title: '登录失败，请重试', icon: 'none' });
      });
  },

  // Load all categories for picker
  loadCategories() {
    api.getCategories()
      .then((data) => {
        const list = data.list || data || [];
        this.setData({ categories: list });
      })
      .catch(() => {
        // silent
      });
  },

  // Load today overview stats
  loadStats() {
    api.getStatsOverview()
      .then((data) => {
        this.setData({
          todayCount: data.todayCount || 0,
          todayAccuracy: data.todayAccuracy || 0,
          loading: false,
        });
      })
      .catch(() => {
        this.setData({ loading: false });
      });
  },

  // Load progress for selected category
  loadCategoryProgress(categoryId) {
    if (!categoryId) return;
    api.getCategoryStats(categoryId)
      .then((data) => {
        const total = data.totalQuestions || 0;
        const answered = data.answeredQuestions || 0;
        const percent = total > 0 ? Math.round((answered / total) * 100) : 0;
        this.setData({
          totalQuestions: total,
          answeredQuestions: answered,
          progressPercent: percent,
        });
      })
      .catch(() => {
        // silent
      });
  },

  // Toggle category picker overlay
  toggleCategoryPicker() {
    this.setData({ showCategoryPicker: !this.data.showCategoryPicker });
  },

  // Close picker when tapping mask
  closeCategoryPicker() {
    this.setData({ showCategoryPicker: false });
  },

  // Prevent event bubbling on picker content
  stopPropagation() {
    // noop, just stop bubbling
  },

  // Select a category
  onSelectCategory(e) {
    const { id, name } = e.currentTarget.dataset;
    app.setCategory(id, name);
    this.setData({
      categoryId: id,
      categoryName: name,
      showCategoryPicker: false,
    });
    this.loadCategoryProgress(id);
  },

  // Navigate to question bank (chapter practice)
  goToChapterPractice() {
    wx.switchTab({
      url: '/pages/questionBank/questionBank',
    });
  },

  // Start random practice
  goToRandomPractice() {
    const categoryId = this.data.categoryId;
    if (!categoryId) {
      wx.showToast({ title: '请先选择考试分类', icon: 'none' });
      return;
    }
    wx.showLoading({ title: '正在生成题目...' });
    api.startPractice({
      mode: 'random',
      exam_category_id: categoryId,
      count: 20,
    })
      .then((data) => {
        wx.hideLoading();
        const recordId = data.practiceRecord && data.practiceRecord.id;
        if (recordId) {
          wx.navigateTo({
            url: '/pages/quiz/quiz?practiceRecordId=' + recordId + '&mode=random',
          });
        }
      })
      .catch((err) => {
        wx.hideLoading();
        wx.showToast({ title: err.message || '生成失败', icon: 'none' });
      });
  },

  // Start mock exam
  goToMockExam() {
    const categoryId = this.data.categoryId;
    if (!categoryId) {
      wx.showToast({ title: '请先选择考试分类', icon: 'none' });
      return;
    }
    wx.showLoading({ title: '正在生成试卷...' });
    api.startMockExam({
      exam_category_id: categoryId,
    })
      .then((data) => {
        wx.hideLoading();
        const recordId = data.practiceRecord && data.practiceRecord.id;
        if (recordId) {
          wx.navigateTo({
            url: '/pages/quiz/quiz?practiceRecordId=' + recordId + '&mode=mock_exam',
          });
        }
      })
      .catch((err) => {
        wx.hideLoading();
        wx.showToast({ title: err.message || '生成失败', icon: 'none' });
      });
  },

  // Switch to wrong book tab
  goToWrongBook() {
    wx.switchTab({
      url: '/pages/wrongBook/wrongBook',
    });
  },
});
