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

const DEFAULT_FILTERS = { exam_category_id: '', chapter_id: '', type: '' };
const DEFAULT_PAGINATION = { page: 1, pageSize: 20 };

const QUESTION_TYPE_OPTIONS = [
  { value: '', label: '全部题型' },
  { value: 'single_choice', label: '单选题' },
  { value: 'multi_choice', label: '多选题' },
  { value: 'true_false', label: '判断题' },
  { value: 'fill_blank', label: '填空题' },
];

function formatQuestionType(type) {
  return QUESTION_TYPE_OPTIONS.find((o) => o.value === type)?.label ?? '—';
}

function isArchivedQuestion(q) {
  return q?.status === 'archived' || Boolean(q?.archived_at);
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
    let m = true;
    getCategories().then((d) => { if (m) setCategories(Array.isArray(d) ? d : []); }).catch(() => {});
    return () => { m = false; };
  }, []);

  useEffect(() => {
    let m = true;
    async function load() {
      setLoadError('');
      setIsLoading(true);
      try {
        const data = await getQuestions({ ...filters, page: pagination.page, pageSize: pagination.pageSize });
        if (!m) return;
        setQuestions((Array.isArray(data?.list) ? data.list : []).filter((q) => !isArchivedQuestion(q)));
        setTotal(Number(data?.total) || 0);
        setSelectedQuestionIds([]);
        setPagination({ page: Number(data?.page) || 1, pageSize: Number(data?.pageSize) || 20 });
      } catch (err) {
        if (!m) return;
        setQuestions([]);
        setTotal(0);
        setLoadError(err instanceof Error ? err.message : '加载题目失败');
      } finally {
        if (m) setIsLoading(false);
      }
    }
    load();
    return () => { m = false; };
  }, [filters, pagination.page, pagination.pageSize, reloadCount]);

  useEffect(() => {
    let m = true;
    async function load() {
      if (!filters.exam_category_id) { setChapters([]); return; }
      try {
        const data = await getCategoryChapters(filters.exam_category_id);
        if (m) setChapters(Array.isArray(data) ? data : []);
      } catch { if (m) setChapters([]); }
    }
    load();
    return () => { m = false; };
  }, [filters.exam_category_id]);

  const totalPages = Math.max(1, Math.ceil(total / pagination.pageSize));
  const summaryText = useMemo(() => `共 ${total} 条，当前显示 ${questions.length} 条`, [questions.length, total]);
  const isEditing = Boolean(editingQuestion);
  const hasSelected = selectedQuestionIds.length > 0;

  function handleFilterChange(key) {
    return (e) => {
      const val = e.target.value;
      setFilters((c) => {
        const next = { ...c, [key]: val };
        if (key === 'exam_category_id') { next.chapter_id = ''; setChapters([]); }
        return next;
      });
      setPagination((c) => ({ ...c, page: 1 }));
    };
  }

  function handleOpenCreateModal() { setEditingQuestion(null); setFormError(''); setIsModalOpen(true); }
  function handleOpenEditModal(q) { setEditingQuestion(q); setFormError(''); setIsModalOpen(true); }
  function handleCloseModal() { if (isSaving) return; setFormError(''); setEditingQuestion(null); setIsModalOpen(false); }

  function handleToggleSelection(id) {
    setSelectedQuestionIds((c) => c.includes(id) ? c.filter((x) => x !== id) : [...c, id]);
  }

  function handleOpenArchiveDialog(target) { setArchiveError(''); setArchiveTarget(target); }
  function handleCloseArchiveDialog() { if (isArchiving) return; setArchiveError(''); setArchiveTarget(null); }

  async function handleConfirmArchive() {
    if (!archiveTarget) return;
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
      setReloadCount((c) => c + 1);
    } catch (err) {
      setArchiveError(err instanceof Error ? err.message : '归档失败');
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
      setReloadCount((c) => c + 1);
    } catch (err) {
      setFormError(err instanceof Error ? err.message : '保存失败');
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <section className="stack gap-md">
      <PageHeader
        title="题目管理"
        subtitle="管理题库中的题目"
        action={{ label: '新增题目', onClick: handleOpenCreateModal, disabled: isSaving }}
      />

      <div className="table-card stack gap-md">
        <div className="filter-grid">
          <div className="field">
            <label htmlFor="q-filter-cat">考试分类</label>
            <select id="q-filter-cat" value={filters.exam_category_id} onChange={handleFilterChange('exam_category_id')}>
              <option value="">全部分类</option>
              {categories.map((c) => <option key={c.id} value={String(c.id)}>{c.name}</option>)}
            </select>
          </div>
          <div className="field">
            <label htmlFor="q-filter-ch">章节</label>
            <select id="q-filter-ch" value={filters.chapter_id} onChange={handleFilterChange('chapter_id')} disabled={!filters.exam_category_id}>
              <option value="">全部章节</option>
              {chapters.map((c) => <option key={c.id} value={String(c.id)}>{c.name}</option>)}
            </select>
          </div>
          <div className="field">
            <label htmlFor="q-filter-type">题型</label>
            <select id="q-filter-type" value={filters.type} onChange={handleFilterChange('type')}>
              {QUESTION_TYPE_OPTIONS.map((o) => <option key={o.value || 'all'} value={o.value}>{o.label}</option>)}
            </select>
          </div>
        </div>

        <div className="modal-actions">
          <p style={{ margin: 0, flex: 1 }}>{summaryText}</p>
          <button className="btn btn-danger" type="button" onClick={() => handleOpenArchiveDialog({ type: 'batch', ids: selectedQuestionIds })} disabled={!hasSelected || isSaving || isArchiving}>
            批量归档
          </button>
        </div>
      </div>

      {loadError && <p className="error-banner" role="alert">{loadError}</p>}

      <div className="table-card table-scroll">
        {isLoading ? (
          <p className="page-loading">加载中...</p>
        ) : questions.length === 0 ? (
          <div className="empty-state">暂无题目</div>
        ) : (
          <table>
            <thead>
              <tr>
                <th style={{ width: 40 }}>选择</th>
                <th>ID</th>
                <th>题目内容</th>
                <th>题型</th>
                <th>分类</th>
                <th>章节</th>
                <th>状态</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              {questions.map((q) => (
                <tr key={q.id}>
                  <td><input type="checkbox" checked={selectedQuestionIds.includes(q.id)} onChange={() => handleToggleSelection(q.id)} disabled={isSaving || isArchiving} /></td>
                  <td>{q.id}</td>
                  <td style={{ maxWidth: 300, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{q.content}</td>
                  <td>{formatQuestionType(q.type)}</td>
                  <td>{q.exam_category_id ?? '—'}</td>
                  <td>{q.chapter_id ?? '—'}</td>
                  <td>{q.status ?? '—'}</td>
                  <td>
                    <div className="table-actions">
                      <button className="btn btn-text" type="button" onClick={() => handleOpenEditModal(q)} disabled={isSaving || isArchiving}>编辑</button>
                      <button className="btn btn-text btn-text--danger" type="button" onClick={() => handleOpenArchiveDialog({ type: 'single', question: q })} disabled={isSaving || isArchiving}>归档</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {totalPages > 1 && (
        <div className="pagination">
          <button className="btn btn-secondary" type="button" disabled={pagination.page <= 1 || isLoading} onClick={() => setPagination((c) => ({ ...c, page: c.page - 1 }))}>上一页</button>
          <span>第 {pagination.page} / {totalPages} 页</span>
          <button className="btn btn-secondary" type="button" disabled={pagination.page >= totalPages || isLoading} onClick={() => setPagination((c) => ({ ...c, page: c.page + 1 }))}>下一页</button>
        </div>
      )}

      <QuestionFormModal
        open={isModalOpen}
        onClose={handleCloseModal}
        onSubmit={handleSubmitQuestion}
        categories={categories}
        initialValues={editingQuestion}
        title={isEditing ? '编辑题目' : '新增题目'}
        subtitle={isEditing ? '修改题目信息' : '创建新的题目'}
        submitLabel={isEditing ? '保存' : '创建'}
        submittingLabel={isEditing ? '保存中...' : '创建中...'}
        isSubmitting={isSaving}
        error={formError}
      />

      <ConfirmDialog
        open={Boolean(archiveTarget)}
        title={archiveTarget?.type === 'batch' ? '批量归档题目' : '归档题目'}
        message={archiveTarget?.type === 'batch'
          ? `确定归档已选中的 ${archiveTarget.ids.length} 道题目？`
          : archiveTarget?.question ? `确定归档「${archiveTarget.question.content}」？` : ''}
        confirmLabel={isArchiving
          ? '归档中...'
          : archiveTarget?.type === 'batch' ? '确认批量归档' : '确认归档'}
        isSubmitting={isArchiving}
        error={archiveError}
        onConfirm={handleConfirmArchive}
        onClose={handleCloseArchiveDialog}
      />
    </section>
  );
}

export default QuestionsPage;
