const api = require('../../utils/api');
const { ensureLogin } = require('../../utils/auth');
const app = getApp();

Page({
  data: {
    // Category picker
    categories: [],
    categoryIndex: 0,
    categoryId: null,
    categoryName: '',

    // Chapters
    chapters: [],

    // State
    loading: true,
    isEmpty: false,
  },

  onShow() {
    ensureLogin()
      .then(() => {
        this.loadCategories();
      })
      .catch(() => {
        wx.showToast({ title: '登录失败，请重试', icon: 'none' });
      });
  },

  // Load categories and set current selection
  loadCategories() {
    api.getCategories()
      .then((data) => {
        const list = data.list || data || [];
        if (list.length === 0) {
          this.setData({ categories: [], loading: false, isEmpty: true });
          return;
        }

        const currentId = app.globalData.currentCategoryId;
        let selectedIndex = 0;
        if (currentId) {
          const idx = list.findIndex((c) => c.id === currentId);
          if (idx >= 0) selectedIndex = idx;
        }

        const selected = list[selectedIndex];
        app.setCategory(selected.id, selected.name);

        this.setData({
          categories: list,
          categoryIndex: selectedIndex,
          categoryId: selected.id,
          categoryName: selected.name,
        });

        this.loadChapters(selected.id);
      })
      .catch(() => {
        this.setData({ loading: false });
        wx.showToast({ title: '获取分类失败', icon: 'none' });
      });
  },

  // Picker change handler
  onCategoryChange(e) {
    const index = Number(e.detail.value);
    const selected = this.data.categories[index];
    if (!selected) return;

    app.setCategory(selected.id, selected.name);
    this.setData({
      categoryIndex: index,
      categoryId: selected.id,
      categoryName: selected.name,
      loading: true,
      chapters: [],
    });
    this.loadChapters(selected.id);
  },

  // Load chapters and their progress
  loadChapters(categoryId) {
    if (!categoryId) {
      this.setData({ loading: false, isEmpty: true });
      return;
    }

    this.setData({ loading: true, isEmpty: false });

    const chaptersPromise = api.getCategoryChapters(categoryId);
    const statsPromise = api.getCategoryStats(categoryId);

    Promise.all([chaptersPromise, statsPromise])
      .then(([chaptersData, statsData]) => {
        const chapterList = chaptersData.list || chaptersData || [];
        const chapterStats = statsData.chapters || statsData.chapterStats || {};

        // Merge progress into chapters
        const chapters = chapterList.map((ch) => {
          const stat = chapterStats[ch.id] || {};
          const total = stat.totalQuestions || ch.questionCount || 0;
          const answered = stat.answeredQuestions || 0;
          const percent = total > 0 ? Math.round((answered / total) * 100) : 0;
          return {
            id: ch.id,
            name: ch.name,
            totalQuestions: total,
            answeredQuestions: answered,
            progressPercent: percent,
          };
        });

        this.setData({
          chapters: chapters,
          loading: false,
          isEmpty: chapters.length === 0,
        });
      })
      .catch(() => {
        this.setData({ loading: false, isEmpty: true });
        wx.showToast({ title: '加载章节失败', icon: 'none' });
      });
  },

  // Start chapter practice
  onChapterTap(e) {
    const chapterId = e.currentTarget.dataset.id;
    if (!chapterId) return;

    wx.showLoading({ title: '正在加载题目...' });

    api.startPractice({
      mode: 'chapter',
      chapter_id: chapterId,
    })
      .then((data) => {
        wx.hideLoading();
        const recordId = data.practiceRecord && data.practiceRecord.id;
        if (recordId) {
          wx.navigateTo({
            url: '/pages/quiz/quiz?practiceRecordId=' + recordId + '&mode=chapter',
          });
        }
      })
      .catch((err) => {
        wx.hideLoading();
        wx.showToast({ title: err.message || '加载失败', icon: 'none' });
      });
  },
});
