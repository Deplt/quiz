const api = require('../../utils/api');
const app = getApp();

Page({
  data: {
    total: 0,
    correct: 0,
    wrong: 0,
    accuracy: 0,
    durationText: '',
    durationSeconds: 0,
    wrongQuestions: [],
    scoreAngle: 0, // for ring animation
  },

  onLoad() {
    const result = app.globalData.quizResult;
    if (!result) {
      wx.showToast({ title: '无结果数据', icon: 'none' });
      setTimeout(() => {
        wx.switchTab({ url: '/pages/home/home' });
      }, 1500);
      return;
    }

    const total = result.total || 0;
    const correct = result.correct || 0;
    const wrong = total - correct;
    const accuracy = total > 0 ? Math.round((correct / total) * 100) : 0;
    const duration = result.duration_seconds || 0;
    const mm = String(Math.floor(duration / 60)).padStart(2, '0');
    const ss = String(duration % 60).padStart(2, '0');

    this.setData({
      total: total,
      correct: correct,
      wrong: wrong,
      accuracy: accuracy,
      durationSeconds: duration,
      durationText: mm + ':' + ss,
      wrongQuestions: result.wrongQuestions || [],
      scoreAngle: accuracy * 3.6, // 360 deg for ring
    });
  },

  onUnload() {
    app.globalData.quizResult = null;
  },

  onRetryWrong() {
    const wrongQuestions = this.data.wrongQuestions;
    if (!wrongQuestions || !wrongQuestions.length) {
      wx.showToast({ title: '没有错题', icon: 'none' });
      return;
    }

    wx.showLoading({ title: '加载中...' });

    // Build question list from wrong questions for practice
    const questionIds = wrongQuestions.map(function(q) { return q.id || q.question_id; });

    api.practiceWrong({ question_ids: questionIds }).then(function(res) {
      wx.hideLoading();
      // Store questions into globalData and navigate to quiz
      app.globalData.quizQuestions = res.questions || wrongQuestions;
      wx.redirectTo({
        url: '/pages/quiz/quiz?practiceRecordId=' + (res.practice_record_id || '') + '&mode=chapter',
      });
    }).catch(function(err) {
      wx.hideLoading();
      wx.showToast({ title: err.message || '加载失败', icon: 'none' });
    });
  },

  onGoHome() {
    wx.switchTab({ url: '/pages/home/home' });
  },
});
