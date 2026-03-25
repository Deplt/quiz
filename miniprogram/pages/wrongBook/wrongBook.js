const api = require('../../utils/api');
const auth = require('../../utils/auth');
const app = getApp();

const TYPE_MAP = {
  single_choice: '单选',
  multi_choice: '多选',
  true_false: '判断',
  fill_blank: '填空',
};

Page({
  data: {
    categories: [],
    categoryIndex: 0,
    selectedCategoryId: null,
    wrongList: [],
    page: 1,
    pageSize: 20,
    hasMore: true,
    loading: false,
    loadingMore: false,
    isEmpty: false,
  },

  onShow() {
    auth.ensureLogin().then(() => {
      this.loadCategories();
    });
  },

  loadCategories() {
    api.getCategories().then((data) => {
      const list = data || [];
      const allOption = { id: null, name: '全部分类' };
      const categories = [allOption].concat(list);

      let categoryIndex = 0;
      if (app.globalData.currentCategoryId) {
        const idx = categories.findIndex(
          (c) => c.id === app.globalData.currentCategoryId
        );
        if (idx > 0) categoryIndex = idx;
      }

      this.setData({
        categories,
        categoryIndex,
        selectedCategoryId: categories[categoryIndex].id,
      });
      this.resetAndLoad();
    }).catch((err) => {
      console.error('获取分类失败', err);
      this.resetAndLoad();
    });
  },

  onCategoryChange(e) {
    const index = Number(e.detail.value);
    const category = this.data.categories[index];
    this.setData({
      categoryIndex: index,
      selectedCategoryId: category ? category.id : null,
    });
    this.resetAndLoad();
  },

  resetAndLoad() {
    this.setData({
      wrongList: [],
      page: 1,
      hasMore: true,
      isEmpty: false,
    });
    this.loadWrongList();
  },

  loadWrongList() {
    if (this.data.loading || this.data.loadingMore) return;

    const isFirstPage = this.data.page === 1;
    this.setData({
      loading: isFirstPage,
      loadingMore: !isFirstPage,
    });

    const params = {
      page: this.data.page,
      pageSize: this.data.pageSize,
    };
    if (this.data.selectedCategoryId) {
      params.exam_category_id = this.data.selectedCategoryId;
    }

    api.getWrongList(params).then((data) => {
      const list = (data.list || data.rows || data || []).map((item) => {
        return Object.assign({}, item, {
          typeLabel: TYPE_MAP[item.question_type] || '未知',
          summary: item.content
            ? item.content.length > 50
              ? item.content.substring(0, 50) + '...'
              : item.content
            : '',
          showAnalysis: false,
        });
      });

      const newList = this.data.wrongList.concat(list);
      this.setData({
        wrongList: newList,
        hasMore: list.length >= this.data.pageSize,
        loading: false,
        loadingMore: false,
        isEmpty: newList.length === 0,
      });
    }).catch((err) => {
      console.error('获取错题列表失败', err);
      this.setData({
        loading: false,
        loadingMore: false,
        isEmpty: this.data.wrongList.length === 0,
      });
      wx.showToast({ title: '加载失败', icon: 'none' });
    });
  },

  onReachBottom() {
    if (!this.data.hasMore || this.data.loadingMore) return;
    this.setData({ page: this.data.page + 1 });
    this.loadWrongList();
  },

  toggleAnalysis(e) {
    const index = e.currentTarget.dataset.index;
    const key = 'wrongList[' + index + '].showAnalysis';
    this.setData({
      [key]: !this.data.wrongList[index].showAnalysis,
    });
  },

  markMastered(e) {
    const index = e.currentTarget.dataset.index;
    const item = this.data.wrongList[index];
    const questionId = item.question_id || item.id;

    wx.showModal({
      title: '提示',
      content: '确认将此题标记为已掌握？',
      success: (res) => {
        if (!res.confirm) return;
        api.removeWrong({ question_id: questionId }).then(() => {
          const newList = this.data.wrongList.filter((_, i) => i !== index);
          this.setData({
            wrongList: newList,
            isEmpty: newList.length === 0,
          });
          wx.showToast({ title: '已标记掌握', icon: 'success' });
        }).catch((err) => {
          console.error('标记失败', err);
          wx.showToast({ title: '操作失败', icon: 'none' });
        });
      },
    });
  },

  startWrongPractice() {
    if (this.data.wrongList.length === 0) {
      wx.showToast({ title: '暂无错题可练习', icon: 'none' });
      return;
    }

    const categoryId = this.data.selectedCategoryId || app.globalData.currentCategoryId;
    if (!categoryId) {
      wx.showToast({ title: '请先选择分类', icon: 'none' });
      return;
    }

    wx.showLoading({ title: '加载中...' });
    api.practiceWrong({ exam_category_id: categoryId }).then((data) => {
      wx.hideLoading();
      app.globalData.quizQuestions = data.questions || [];
      app.globalData.practiceRecord = data.practiceRecord || data.practice_record || null;
      wx.navigateTo({ url: '/pages/quiz/quiz' });
    }).catch((err) => {
      wx.hideLoading();
      console.error('开始错题重练失败', err);
      wx.showToast({ title: '加载失败', icon: 'none' });
    });
  },
});
