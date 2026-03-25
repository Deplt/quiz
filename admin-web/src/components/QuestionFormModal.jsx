import { useEffect, useState } from 'react';
import { getCategoryChapters } from '../api/categories.js';

const QUESTION_TYPE_OPTIONS = [
  { value: 'single_choice', label: '单选题' },
  { value: 'multi_choice', label: '多选题' },
  { value: 'true_false', label: '判断题' },
  { value: 'fill_blank', label: '填空题' },
];

const DIFFICULTY_OPTIONS = [
  { value: 'easy', label: '简单' },
  { value: 'medium', label: '中等' },
  { value: 'hard', label: '困难' },
];

const INITIAL_FORM = {
  exam_category_id: '', chapter_id: '', type: 'single_choice',
  content: '', answer: '', explanation: '', difficulty: 'medium', options_json: '',
};

function getOptionsJsonValue(v) {
  if (v === null || v === undefined || v === '') return '';
  return JSON.stringify(v);
}

function getFormValues(v) {
  return {
    exam_category_id: v?.exam_category_id ? String(v.exam_category_id) : '',
    chapter_id: v?.chapter_id ? String(v.chapter_id) : '',
    type: v?.type ?? 'single_choice',
    content: v?.content ?? '',
    answer: v?.answer ?? '',
    explanation: v?.explanation ?? '',
    difficulty: v?.difficulty ?? 'medium',
    options_json: getOptionsJsonValue(v?.options_json),
  };
}

function QuestionFormModal({
  open, onClose, onSubmit, categories = [], initialValues = null,
  title = '新增题目', subtitle = '', submitLabel = '创建', submittingLabel = '创建中...',
  isSubmitting = false, error = '',
}) {
  const [form, setForm] = useState(INITIAL_FORM);
  const [chapters, setChapters] = useState([]);
  const [validationError, setValidationError] = useState('');

  useEffect(() => {
    if (open) { setForm(getFormValues(initialValues)); setValidationError(''); }
  }, [open, initialValues]);

  useEffect(() => {
    let m = true;
    if (!open || !form.exam_category_id) { setChapters([]); return; }
    getCategoryChapters(form.exam_category_id)
      .then((d) => { if (m) setChapters(Array.isArray(d) ? d : []); })
      .catch(() => { if (m) setChapters([]); });
    return () => { m = false; };
  }, [form.exam_category_id, open]);

  if (!open) return null;

  function handleChange(e) {
    const { name, value } = e.target;
    setValidationError('');
    if (name === 'exam_category_id') setChapters([]);
    setForm((c) => name === 'exam_category_id' ? { ...c, exam_category_id: value, chapter_id: '' } : { ...c, [name]: value });
  }

  function handleSubmit(e) {
    e.preventDefault();
    const content = form.content.trim();
    const answer = form.answer.trim();
    if (!content || !answer) { setValidationError('题目内容和答案不能为空'); return; }
    let parsedOptions = null;
    if (form.options_json.trim()) {
      try { parsedOptions = JSON.parse(form.options_json); }
      catch { setValidationError('选项 JSON 格式不正确'); return; }
    }
    onSubmit({
      exam_category_id: Number(form.exam_category_id),
      chapter_id: Number(form.chapter_id),
      type: form.type, content, options_json: parsedOptions,
      answer, explanation: form.explanation.trim(), difficulty: form.difficulty,
    });
  }

  return (
    <div className="modal-backdrop" role="presentation">
      <div className="modal stack gap-md" role="dialog" aria-modal="true">
        <div className="modal__header">
          <h2 className="modal__title">{title}</h2>
          {subtitle && <p className="text-muted" style={{ margin: '4px 0 0' }}>{subtitle}</p>}
        </div>
        <form className="modal__body" onSubmit={handleSubmit}>
          <div className="form-grid">
            <div className="field">
              <label htmlFor="q-cat">考试分类</label>
              <select id="q-cat" name="exam_category_id" value={form.exam_category_id} onChange={handleChange} disabled={isSubmitting} required>
                <option value="">请选择分类</option>
                {categories.map((c) => <option key={c.id} value={String(c.id)}>{c.name}</option>)}
              </select>
            </div>
            <div className="field">
              <label htmlFor="q-ch">章节</label>
              <select id="q-ch" name="chapter_id" value={form.chapter_id} onChange={handleChange} disabled={isSubmitting || !form.exam_category_id} required>
                <option value="">请选择章节</option>
                {chapters.map((c) => <option key={c.id} value={String(c.id)}>{c.name}</option>)}
              </select>
            </div>
          </div>
          <div className="form-grid">
            <div className="field">
              <label htmlFor="q-type">题型</label>
              <select id="q-type" name="type" value={form.type} onChange={handleChange} disabled={isSubmitting} required>
                {QUESTION_TYPE_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>
            <div className="field">
              <label htmlFor="q-diff">难度</label>
              <select id="q-diff" name="difficulty" value={form.difficulty} onChange={handleChange} disabled={isSubmitting} required>
                {DIFFICULTY_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>
          </div>
          <div className="field">
            <label htmlFor="q-content">题目内容</label>
            <textarea id="q-content" name="content" value={form.content} onChange={handleChange} disabled={isSubmitting} rows="3" required placeholder="请输入题目内容" />
          </div>
          <div className="field">
            <label htmlFor="q-answer">答案</label>
            <input id="q-answer" name="answer" type="text" value={form.answer} onChange={handleChange} disabled={isSubmitting} required placeholder="单选填字母如 A，多选填 A,C" />
          </div>
          <div className="field">
            <label htmlFor="q-explanation">解析</label>
            <textarea id="q-explanation" name="explanation" value={form.explanation} onChange={handleChange} disabled={isSubmitting} rows="2" placeholder="可选" />
          </div>
          <div className="field">
            <label htmlFor="q-options">选项 JSON</label>
            <textarea id="q-options" name="options_json" value={form.options_json} onChange={handleChange} disabled={isSubmitting} rows="3" placeholder='[{"label":"A","text":"选项一"},{"label":"B","text":"选项二"}]' />
          </div>

          {validationError && <p className="error-banner" role="alert">{validationError}</p>}
          {error && <p className="error-banner" role="alert">{error}</p>}

          <div className="modal-actions">
            <button className="btn btn-secondary" type="button" onClick={onClose} disabled={isSubmitting}>取消</button>
            <button className="btn btn-primary" type="submit" disabled={isSubmitting}>{isSubmitting ? submittingLabel : submitLabel}</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default QuestionFormModal;
