const api = require('../../utils/api');
const app = getApp();

Page({
  data: {
    mode: '',               // chapter / random / mock_exam
    practiceRecordId: '',
    questions: [],
    currentIndex: 0,
    currentQuestion: null,
    userAnswers: {},         // { [questionId]: { answer, isCorrect, submitted } }
    selectedOptions: [],     // multi_choice temp selections
    fillAnswer: '',          // fill_blank temp input
    showExplanation: false,
    // timer
    timerText: '',
    remainingSeconds: 0,
    // swipe
    touchStartX: 0,
    touchStartY: 0,
  },

  onLoad(options) {
    const { practiceRecordId, mode } = options;
    const questions = app.globalData.quizQuestions || [];

    if (!questions.length) {
      wx.showToast({ title: '题目数据为空', icon: 'none' });
      setTimeout(() => wx.navigateBack(), 1500);
      return;
    }

    this.setData({
      mode: mode || 'chapter',
      practiceRecordId: practiceRecordId || '',
      questions: questions,
      currentIndex: 0,
      currentQuestion: questions[0],
    });

    // restore any previous answers already stored
    this._refreshQuestionState();

    // mock exam timer
    if (mode === 'mock_exam') {
      const minutes = app.globalData.quizTimeLimit || 60;
      this.setData({ remainingSeconds: minutes * 60 });
      this._formatTimer();
      this._startTimer();
    }
  },

  onUnload() {
    this._stopTimer();
    // clean up globalData
    app.globalData.quizQuestions = null;
  },

  // ==================== Timer ====================

  _startTimer() {
    this._timerInterval = setInterval(() => {
      let s = this.data.remainingSeconds - 1;
      if (s <= 0) {
        s = 0;
        this._stopTimer();
        wx.showToast({ title: '时间到，自动交卷', icon: 'none' });
        setTimeout(() => this._doSubmit(), 1000);
      }
      this.setData({ remainingSeconds: s });
      this._formatTimer();
    }, 1000);
  },

  _stopTimer() {
    if (this._timerInterval) {
      clearInterval(this._timerInterval);
      this._timerInterval = null;
    }
  },

  _formatTimer() {
    const s = this.data.remainingSeconds;
    const mm = String(Math.floor(s / 60)).padStart(2, '0');
    const ss = String(s % 60).padStart(2, '0');
    this.setData({ timerText: mm + ':' + ss });
  },

  // ==================== Navigation ====================

  onPrev() {
    if (this.data.currentIndex <= 0) return;
    this._goTo(this.data.currentIndex - 1);
  },

  onNext() {
    const { currentIndex, questions } = this.data;
    if (currentIndex >= questions.length - 1) {
      this._confirmSubmit();
      return;
    }
    this._goTo(currentIndex + 1);
  },

  _goTo(index) {
    const q = this.data.questions[index];
    this.setData({
      currentIndex: index,
      currentQuestion: q,
      fillAnswer: '',
      selectedOptions: [],
      showExplanation: false,
    });
    this._refreshQuestionState();
  },

  _refreshQuestionState() {
    const q = this.data.currentQuestion;
    if (!q) return;
    const record = this.data.userAnswers[q.id];
    if (record) {
      if (q.type === 'multi_choice') {
        this.setData({ selectedOptions: record.answer || [] });
      } else if (q.type === 'fill_blank') {
        this.setData({ fillAnswer: record.answer || '' });
      }
      if (record.submitted && this.data.mode !== 'mock_exam') {
        this.setData({ showExplanation: !record.isCorrect });
      }
    }
  },

  // ==================== Swipe ====================

  onTouchStart(e) {
    this.setData({
      touchStartX: e.touches[0].clientX,
      touchStartY: e.touches[0].clientY,
    });
  },

  onTouchEnd(e) {
    const dx = e.changedTouches[0].clientX - this.data.touchStartX;
    const dy = e.changedTouches[0].clientY - this.data.touchStartY;
    if (Math.abs(dx) < 60 || Math.abs(dy) > Math.abs(dx)) return;
    if (dx > 0) {
      this.onPrev();
    } else {
      this.onNext();
    }
  },

  // ==================== Answer Handling ====================

  // single_choice & true_false
  onSelectOption(e) {
    const q = this.data.currentQuestion;
    const record = this.data.userAnswers[q.id];
    if (record && record.submitted && this.data.mode !== 'mock_exam') return;

    const value = e.currentTarget.dataset.value;
    this._recordAnswer(value);
  },

  // multi_choice toggle
  onToggleOption(e) {
    const q = this.data.currentQuestion;
    const record = this.data.userAnswers[q.id];
    if (record && record.submitted && this.data.mode !== 'mock_exam') return;

    const value = e.currentTarget.dataset.value;
    let selected = [].concat(this.data.selectedOptions);
    const idx = selected.indexOf(value);
    if (idx >= 0) {
      selected.splice(idx, 1);
    } else {
      selected.push(value);
    }
    selected.sort();
    this.setData({ selectedOptions: selected });
  },

  onConfirmMulti() {
    const selected = this.data.selectedOptions;
    if (!selected.length) {
      wx.showToast({ title: '请至少选择一个选项', icon: 'none' });
      return;
    }
    this._recordAnswer(selected);
  },

  // fill_blank
  onFillInput(e) {
    this.setData({ fillAnswer: e.detail.value });
  },

  onConfirmFill() {
    const val = this.data.fillAnswer.trim();
    if (!val) {
      wx.showToast({ title: '请输入答案', icon: 'none' });
      return;
    }
    this._recordAnswer(val);
  },

  _recordAnswer(answer) {
    const q = this.data.currentQuestion;
    const mode = this.data.mode;

    // update userAnswers
    const answers = Object.assign({}, this.data.userAnswers);
    answers[q.id] = { answer: answer, isCorrect: null, submitted: false };

    if (mode === 'mock_exam') {
      // mock mode: only record, no submit
      this.setData({ userAnswers: answers });
      return;
    }

    // practice mode: submit immediately
    this.setData({ userAnswers: answers });
    const answerStr = Array.isArray(answer) ? answer.join(',') : String(answer);

    api.submitAnswer({
      practice_record_id: this.data.practiceRecordId,
      question_id: q.id,
      user_answer: answerStr,
    }).then((res) => {
      const isCorrect = res.is_correct;
      const updatedAnswers = Object.assign({}, this.data.userAnswers);
      updatedAnswers[q.id] = {
        answer: answer,
        isCorrect: isCorrect,
        submitted: true,
      };
      this.setData({
        userAnswers: updatedAnswers,
        showExplanation: !isCorrect,
      });
    }).catch((err) => {
      wx.showToast({ title: err.message || '提交失败', icon: 'none' });
    });
  },

  // ==================== Submit / Finish ====================

  _confirmSubmit() {
    const { questions, userAnswers } = this.data;
    const answered = Object.keys(userAnswers).length;
    const total = questions.length;

    if (answered < total) {
      wx.showModal({
        title: '提示',
        content: '还有 ' + (total - answered) + ' 题未作答，确认交卷吗？',
        confirmText: '交卷',
        cancelText: '继续答题',
        success: (res) => {
          if (res.confirm) this._doSubmit();
        },
      });
    } else {
      this._doSubmit();
    }
  },

  _doSubmit() {
    this._stopTimer();
    const { mode, practiceRecordId, userAnswers, questions } = this.data;
    wx.showLoading({ title: '提交中...' });

    let promise;
    if (mode === 'mock_exam') {
      const answers = questions.map((q) => ({
        question_id: q.id,
        user_answer: userAnswers[q.id]
          ? (Array.isArray(userAnswers[q.id].answer)
              ? userAnswers[q.id].answer.join(',')
              : String(userAnswers[q.id].answer))
          : '',
      }));
      promise = api.submitMockExam({
        practice_record_id: practiceRecordId,
        answers: answers,
      });
    } else {
      promise = api.finishPractice({
        practice_record_id: practiceRecordId,
      });
    }

    promise.then((res) => {
      wx.hideLoading();
      app.globalData.quizResult = res;
      wx.redirectTo({ url: '/pages/quizResult/quizResult' });
    }).catch((err) => {
      wx.hideLoading();
      wx.showToast({ title: err.message || '提交失败', icon: 'none' });
    });
  },

  // ==================== Helpers for WXML ====================

  _getOptionClass(optionLabel, question) {
    // used via wxs or computed — handled inline in wxml instead
  },
});
