import { useEffect, useState } from 'react';
import { getCategoryChapters } from '../api/categories.js';

const QUESTION_TYPE_OPTIONS = [
  { value: 'single_choice', label: 'Single choice' },
  { value: 'multi_choice', label: 'Multi choice' },
  { value: 'true_false', label: 'True/false' },
  { value: 'fill_blank', label: 'Fill blank' },
];

const DIFFICULTY_OPTIONS = [
  { value: 'easy', label: 'Easy' },
  { value: 'medium', label: 'Medium' },
  { value: 'hard', label: 'Hard' },
];

const INITIAL_FORM = {
  exam_category_id: '',
  chapter_id: '',
  type: 'single_choice',
  content: '',
  answer: '',
  explanation: '',
  difficulty: 'medium',
  options_json: '',
};

function getOptionsJsonValue(value) {
  if (value === null || value === undefined || value === '') {
    return '';
  }

  return JSON.stringify(value);
}

function getFormValues(initialValues) {
  return {
    exam_category_id: initialValues?.exam_category_id ? String(initialValues.exam_category_id) : INITIAL_FORM.exam_category_id,
    chapter_id: initialValues?.chapter_id ? String(initialValues.chapter_id) : INITIAL_FORM.chapter_id,
    type: initialValues?.type ?? INITIAL_FORM.type,
    content: initialValues?.content ?? INITIAL_FORM.content,
    answer: initialValues?.answer ?? INITIAL_FORM.answer,
    explanation: initialValues?.explanation ?? INITIAL_FORM.explanation,
    difficulty: initialValues?.difficulty ?? INITIAL_FORM.difficulty,
    options_json: getOptionsJsonValue(initialValues?.options_json),
  };
}

function QuestionFormModal({
  open,
  onClose,
  onSubmit,
  categories = [],
  initialValues = null,
  title = 'Add question',
  subtitle = 'Create a new question.',
  submitLabel = 'Create question',
  submittingLabel = 'Creating question...',
  isSubmitting = false,
  error = '',
}) {
  const [formValues, setFormValues] = useState(INITIAL_FORM);
  const [chapters, setChapters] = useState([]);
  const [validationError, setValidationError] = useState('');

  useEffect(() => {
    if (open) {
      setFormValues(getFormValues(initialValues));
      setValidationError('');
    }
  }, [open, initialValues]);

  useEffect(() => {
    let isMounted = true;

    async function loadChapters() {
      if (!open || !formValues.exam_category_id) {
        setChapters([]);
        return;
      }

      try {
        const data = await getCategoryChapters(formValues.exam_category_id);

        if (isMounted) {
          setChapters(Array.isArray(data) ? data : []);
        }
      } catch {
        if (isMounted) {
          setChapters([]);
        }
      }
    }

    loadChapters();

    return () => {
      isMounted = false;
    };
  }, [formValues.exam_category_id, open]);

  if (!open) {
    return null;
  }

  function handleChange(event) {
    const { name, value } = event.target;

    setValidationError('');

    if (name === 'exam_category_id') {
      setChapters([]);
    }

    setFormValues((current) => {
      if (name === 'exam_category_id') {
        return {
          ...current,
          exam_category_id: value,
          chapter_id: '',
        };
      }

      return {
        ...current,
        [name]: value,
      };
    });
  }

  function handleSubmit(event) {
    event.preventDefault();

    const trimmedContent = formValues.content.trim();
    const trimmedAnswer = formValues.answer.trim();
    const trimmedExplanation = formValues.explanation.trim();
    const trimmedOptionsJson = formValues.options_json.trim();
    let parsedOptionsJson = null;

    if (!trimmedContent || !trimmedAnswer) {
      setValidationError('Content and answer are required');
      return;
    }

    if (trimmedOptionsJson) {
      try {
        parsedOptionsJson = JSON.parse(trimmedOptionsJson);
      } catch {
        setValidationError('Options JSON must be valid JSON');
        return;
      }
    }

    onSubmit({
      exam_category_id: Number(formValues.exam_category_id),
      chapter_id: Number(formValues.chapter_id),
      type: formValues.type,
      content: trimmedContent,
      options_json: parsedOptionsJson,
      answer: trimmedAnswer,
      explanation: trimmedExplanation,
      difficulty: formValues.difficulty,
    });
  }

  return (
    <div className="modal-backdrop" role="presentation">
      <div className="modal stack gap-md" role="dialog" aria-modal="true" aria-labelledby="question-form-title">
        <div className="modal__header">
          <div>
            <h2 className="modal__title" id="question-form-title">{title}</h2>
            <p className="text-muted">{subtitle}</p>
          </div>
        </div>

        <form className="modal__body" onSubmit={handleSubmit}>
          <div className="field">
            <label htmlFor="question-category-id">Category</label>
            <select
              id="question-category-id"
              name="exam_category_id"
              value={formValues.exam_category_id}
              onChange={handleChange}
              disabled={isSubmitting}
              required
            >
              <option value="">Select category</option>
              {categories.map((category) => (
                <option key={category.id} value={String(category.id)}>{category.name}</option>
              ))}
            </select>
          </div>

          <div className="field">
            <label htmlFor="question-chapter-id">Chapter</label>
            <select
              id="question-chapter-id"
              name="chapter_id"
              value={formValues.chapter_id}
              onChange={handleChange}
              disabled={isSubmitting || !formValues.exam_category_id}
              required
            >
              <option value="">Select chapter</option>
              {chapters.map((chapter) => (
                <option key={chapter.id} value={String(chapter.id)}>{chapter.name}</option>
              ))}
            </select>
          </div>

          <div className="field">
            <label htmlFor="question-type">Type</label>
            <select
              id="question-type"
              name="type"
              value={formValues.type}
              onChange={handleChange}
              disabled={isSubmitting}
              required
            >
              {QUESTION_TYPE_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
          </div>

          <div className="field">
            <label htmlFor="question-content">Content</label>
            <textarea
              id="question-content"
              name="content"
              value={formValues.content}
              onChange={handleChange}
              disabled={isSubmitting}
              rows="4"
              required
            />
          </div>

          <div className="field">
            <label htmlFor="question-answer">Answer</label>
            <input
              id="question-answer"
              name="answer"
              type="text"
              value={formValues.answer}
              onChange={handleChange}
              disabled={isSubmitting}
              required
            />
          </div>

          <div className="field">
            <label htmlFor="question-explanation">Explanation</label>
            <textarea
              id="question-explanation"
              name="explanation"
              value={formValues.explanation}
              onChange={handleChange}
              disabled={isSubmitting}
              rows="3"
            />
          </div>

          <div className="field">
            <label htmlFor="question-difficulty">Difficulty</label>
            <select
              id="question-difficulty"
              name="difficulty"
              value={formValues.difficulty}
              onChange={handleChange}
              disabled={isSubmitting}
              required
            >
              {DIFFICULTY_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
          </div>

          <div className="field">
            <label htmlFor="question-options-json">Options JSON</label>
            <textarea
              id="question-options-json"
              name="options_json"
              value={formValues.options_json}
              onChange={handleChange}
              disabled={isSubmitting}
              rows="4"
            />
          </div>

          {validationError ? <p className="error-banner" role="alert">{validationError}</p> : null}
          {error ? <p className="error-banner" role="alert">{error}</p> : null}

          <div className="modal-actions">
            <button className="button button-secondary" type="button" onClick={onClose} disabled={isSubmitting}>
              Cancel
            </button>
            <button type="submit" disabled={isSubmitting}>
              {isSubmitting ? submittingLabel : submitLabel}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default QuestionFormModal;
