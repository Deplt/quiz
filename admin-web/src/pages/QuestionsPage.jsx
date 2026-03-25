import { useEffect, useMemo, useState } from 'react';
import { getCategories, getCategoryChapters } from '../api/categories.js';
import {
  archiveQuestion,
  batchArchiveQuestions,
  createQuestion,
  getQuestions,
  updateQuestion,
} from '../api/questions.js';
import ConfirmDialog from '../components/ConfirmDialog.jsx';
import PageHeader from '../components/PageHeader.jsx';
import QuestionFormModal from '../components/QuestionFormModal.jsx';

const DEFAULT_FILTERS = {
  exam_category_id: '',
  chapter_id: '',
  type: '',
};

const DEFAULT_PAGINATION = {
  page: 1,
  pageSize: 20,
};

const QUESTION_TYPE_OPTIONS = [
  { value: '', label: 'All types' },
  { value: 'single_choice', label: 'Single choice' },
  { value: 'multi_choice', label: 'Multi choice' },
  { value: 'true_false', label: 'True/false' },
  { value: 'fill_blank', label: 'Fill blank' },
];

function formatQuestionType(type) {
  const matchedOption = QUESTION_TYPE_OPTIONS.find((option) => option.value === type);
  return matchedOption?.label ?? '—';
}

function isArchivedQuestion(question) {
  return question?.status === 'archived' || Boolean(question?.archived_at);
}

function normalizeLoadedQuestions(items) {
  return items.filter((question) => !isArchivedQuestion(question));
}

function QuestionsPage() {
  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [categories, setCategories] = useState([]);
  const [chapters, setChapters] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [pagination, setPagination] = useState(DEFAULT_PAGINATION);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [reloadCount, setReloadCount] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState(null);
  const [formError, setFormError] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [selectedQuestionIds, setSelectedQuestionIds] = useState([]);
  const [archiveTarget, setArchiveTarget] = useState(null);
  const [archiveError, setArchiveError] = useState('');
  const [isArchiving, setIsArchiving] = useState(false);

  useEffect(() => {
    let isMounted = true;

    async function loadCategories() {
      try {
        const data = await getCategories();

        if (isMounted) {
          setCategories(Array.isArray(data) ? data : []);
        }
      } catch {
        if (isMounted) {
          setCategories([]);
        }
      }
    }

    loadCategories();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    let isMounted = true;

    async function loadQuestions() {
      setLoadError('');
      setIsLoading(true);

      try {
        const data = await getQuestions({
          ...filters,
          page: pagination.page,
          pageSize: pagination.pageSize,
        });

        if (!isMounted) {
          return;
        }

        setQuestions(normalizeLoadedQuestions(Array.isArray(data?.list) ? data.list : []));
        setTotal(Number(data?.total) || 0);
        setSelectedQuestionIds([]);
        setPagination({
          page: Number(data?.page) || DEFAULT_PAGINATION.page,
          pageSize: Number(data?.pageSize) || DEFAULT_PAGINATION.pageSize,
        });
      } catch (error) {
        if (!isMounted) {
          return;
        }

        setQuestions([]);
        setTotal(0);
        setLoadError(error instanceof Error ? error.message : 'Failed to load questions');
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadQuestions();

    return () => {
      isMounted = false;
    };
  }, [filters, pagination.page, pagination.pageSize, reloadCount]);

  useEffect(() => {
    let isMounted = true;

    async function loadChapters() {
      if (!filters.exam_category_id) {
        setChapters([]);
        return;
      }

      try {
        const data = await getCategoryChapters(filters.exam_category_id);

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
  }, [filters.exam_category_id]);

  const totalPages = Math.max(1, Math.ceil(total / pagination.pageSize));
  const summaryText = useMemo(() => `Showing ${questions.length} of ${total} questions`, [questions.length, total]);
  const isEditing = Boolean(editingQuestion);
  const hasSelectedQuestions = selectedQuestionIds.length > 0;

  function handleCategoryChange(event) {
    const nextCategoryId = event.target.value;
    const shouldClearChapters = Boolean(filters.exam_category_id) && Boolean(nextCategoryId)
      && filters.exam_category_id !== nextCategoryId;

    if (shouldClearChapters) {
      setChapters([]);
    }

    setFilters((current) => ({
      ...current,
      exam_category_id: nextCategoryId,
      chapter_id: '',
    }));
    setPagination((current) => ({
      ...current,
      page: 1,
    }));
  }

  function handleChapterChange(event) {
    const nextChapterId = event.target.value;

    setFilters((current) => ({
      ...current,
      chapter_id: nextChapterId,
    }));
    setPagination((current) => ({
      ...current,
      page: 1,
    }));
  }

  function handleTypeChange(event) {
    const nextType = event.target.value;

    setFilters((current) => ({
      ...current,
      type: nextType,
    }));
    setPagination((current) => ({
      ...current,
      page: 1,
    }));
  }

  function handleOpenCreateModal() {
    setEditingQuestion(null);
    setFormError('');
    setIsModalOpen(true);
  }

  function handleOpenEditModal(question) {
    setEditingQuestion(question);
    setFormError('');
    setIsModalOpen(true);
  }

  function handleCloseModal() {
    if (isSaving) {
      return;
    }

    setFormError('');
    setEditingQuestion(null);
    setIsModalOpen(false);
  }

  function handleToggleQuestionSelection(questionId) {
    setSelectedQuestionIds((current) => (
      current.includes(questionId)
        ? current.filter((id) => id !== questionId)
        : [...current, questionId]
    ));
  }

  function handleOpenArchiveDialog(target) {
    setArchiveError('');
    setArchiveTarget(target);
  }

  function handleCloseArchiveDialog() {
    if (isArchiving) {
      return;
    }

    setArchiveError('');
    setArchiveTarget(null);
  }

  async function handleConfirmArchive() {
    if (!archiveTarget) {
      return;
    }

    setArchiveError('');
    setIsArchiving(true);

    try {
      if (archiveTarget.type === 'single') {
        await archiveQuestion(archiveTarget.question.id);
      } else {
        await batchArchiveQuestions(archiveTarget.ids);
        setSelectedQuestionIds([]);
      }

      setArchiveTarget(null);
      setReloadCount((current) => current + 1);
    } catch (error) {
      setArchiveError(error instanceof Error ? error.message : 'Failed to archive questions');
    } finally {
      setIsArchiving(false);
    }
  }

  async function handleSubmitQuestion(payload) {
    setFormError('');
    setIsSaving(true);

    try {
      if (editingQuestion) {
        await updateQuestion(editingQuestion.id, payload);
      } else {
        await createQuestion(payload);
      }

      setEditingQuestion(null);
      setIsModalOpen(false);
      setReloadCount((current) => current + 1);
    } catch (error) {
      setFormError(error instanceof Error ? error.message : 'Failed to save question');
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <section className="stack gap-md">
      <PageHeader
        title="Questions"
        subtitle="Manage quiz questions."
        action={{
          label: 'Add question',
          onClick: handleOpenCreateModal,
          disabled: isSaving,
        }}
      />

      <div className="table-card stack gap-md">
        <div className="filter-grid">
          <div className="field">
            <label htmlFor="question-filter-category">Category</label>
            <select
              id="question-filter-category"
              value={filters.exam_category_id}
              onChange={handleCategoryChange}
            >
              <option value="">All categories</option>
              {categories.map((category) => (
                <option key={category.id} value={String(category.id)}>{category.name}</option>
              ))}
            </select>
          </div>

          <div className="field">
            <label htmlFor="question-filter-chapter">Chapter</label>
            <select
              id="question-filter-chapter"
              value={filters.chapter_id}
              onChange={handleChapterChange}
              disabled={!filters.exam_category_id}
            >
              <option value="">All chapters</option>
              {chapters.map((chapter) => (
                <option key={chapter.id} value={String(chapter.id)}>{chapter.name}</option>
              ))}
            </select>
          </div>

          <div className="field">
            <label htmlFor="question-filter-type">Type</label>
            <select
              id="question-filter-type"
              value={filters.type}
              onChange={handleTypeChange}
            >
              {QUESTION_TYPE_OPTIONS.map((option) => (
                <option key={option.value || 'all'} value={option.value}>{option.label}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="modal-actions">
          <p>{summaryText}</p>
          <button
            className="button button-danger"
            type="button"
            onClick={() => handleOpenArchiveDialog({ type: 'batch', ids: selectedQuestionIds })}
            disabled={!hasSelectedQuestions || isSaving || isArchiving}
          >
            Archive selected
          </button>
        </div>
      </div>

      {loadError ? <p className="error-banner" role="alert">{loadError}</p> : null}

      <div className="table-card table-scroll">
        {isLoading ? (
          <p>Loading questions...</p>
        ) : questions.length === 0 ? (
          <div className="empty-state">No questions yet.</div>
        ) : (
          <table>
            <thead>
              <tr>
                <th scope="col">Select</th>
                <th scope="col">ID</th>
                <th scope="col">Content</th>
                <th scope="col">Type</th>
                <th scope="col">Category</th>
                <th scope="col">Chapter</th>
                <th scope="col">Status</th>
                <th scope="col">Actions</th>
              </tr>
            </thead>
            <tbody>
              {questions.map((question) => {
                const isSelected = selectedQuestionIds.includes(question.id);

                return (
                  <tr key={question.id}>
                    <td>
                      <input
                        type="checkbox"
                        aria-label={`Select ${question.content}`}
                        checked={isSelected}
                        onChange={() => handleToggleQuestionSelection(question.id)}
                        disabled={isSaving || isArchiving}
                      />
                    </td>
                    <td>{question.id}</td>
                    <td>{question.content}</td>
                    <td>{formatQuestionType(question.type)}</td>
                    <td>{question.exam_category_id ?? '—'}</td>
                    <td>{question.chapter_id ?? '—'}</td>
                    <td>{question.status ?? '—'}</td>
                    <td>
                      <div className="table-actions">
                        <button
                          className="button button-secondary"
                          type="button"
                          aria-label={`Edit ${question.content}`}
                          onClick={() => handleOpenEditModal(question)}
                          disabled={isSaving || isArchiving}
                        >
                          Edit
                        </button>
                        <button
                          className="button button-danger"
                          type="button"
                          aria-label={`Archive ${question.content}`}
                          onClick={() => handleOpenArchiveDialog({ type: 'single', question })}
                          disabled={isSaving || isArchiving}
                        >
                          Archive
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {totalPages > 1 && (
        <div className="pagination">
          <button
            className="button button-secondary"
            type="button"
            disabled={pagination.page <= 1 || isLoading}
            onClick={() => setPagination((c) => ({ ...c, page: c.page - 1 }))}
          >
            Previous
          </button>
          <span>Page {pagination.page} / {totalPages}</span>
          <button
            className="button button-secondary"
            type="button"
            disabled={pagination.page >= totalPages || isLoading}
            onClick={() => setPagination((c) => ({ ...c, page: c.page + 1 }))}
          >
            Next
          </button>
        </div>
      )}

      <QuestionFormModal
        open={isModalOpen}
        onClose={handleCloseModal}
        onSubmit={handleSubmitQuestion}
        categories={categories}
        initialValues={editingQuestion}
        title={isEditing ? 'Edit question' : 'Add question'}
        subtitle={isEditing ? 'Update the selected question.' : 'Create a new quiz question.'}
        submitLabel={isEditing ? 'Save changes' : 'Create question'}
        submittingLabel={isEditing ? 'Saving changes...' : 'Creating question...'}
        isSubmitting={isSaving}
        error={formError}
      />

      <ConfirmDialog
        open={Boolean(archiveTarget)}
        title={archiveTarget?.type === 'batch' ? 'Archive selected questions' : 'Archive question'}
        message={archiveTarget?.type === 'batch'
          ? `Archive ${archiveTarget.ids.length} selected questions? This removes them from the active question list.`
          : archiveTarget?.question
            ? `Archive ${archiveTarget.question.content}? This removes it from the active question list.`
            : ''}
        confirmLabel={isArchiving
          ? archiveTarget?.type === 'batch'
            ? 'Archiving selected questions...'
            : 'Archiving question...'
          : archiveTarget?.type === 'batch'
            ? 'Archive selected questions'
            : 'Archive question'}
        isSubmitting={isArchiving}
        error={archiveError}
        onConfirm={handleConfirmArchive}
        onClose={handleCloseArchiveDialog}
      />
    </section>
  );
}

export default QuestionsPage;
