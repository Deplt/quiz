import { useEffect, useRef, useState } from 'react';

const INITIAL_FORM = { exam_category_id: '', name: '', sort_order: 1 };

function getFormValues(v) {
  return {
    exam_category_id: v?.exam_category_id ?? '',
    name: v?.name ?? '',
    sort_order: v?.sort_order ?? 1,
  };
}

function ChapterFormModal({
  open, onClose, onSubmit, initialValues,
  title = '新增章节', subtitle = '', submitLabel = '创建', submittingLabel = '创建中...',
  isSubmitting = false, error = '',
}) {
  const [form, setForm] = useState(INITIAL_FORM);
  const hasEditedSortRef = useRef(false);

  useEffect(() => {
    if (open) { setForm(getFormValues(initialValues)); hasEditedSortRef.current = false; }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const next = getFormValues(initialValues);
    setForm((c) => {
      if (c.exam_category_id !== next.exam_category_id) { hasEditedSortRef.current = false; return next; }
      if (hasEditedSortRef.current || c.sort_order === next.sort_order) return c;
      return { ...c, sort_order: next.sort_order };
    });
  }, [initialValues?.exam_category_id, initialValues?.sort_order, open]);

  if (!open) return null;

  function handleChange(e) {
    const { name, value } = e.target;
    if (name === 'sort_order') hasEditedSortRef.current = true;
    setForm((c) => ({ ...c, [name]: value }));
  }

  function handleSubmit(e) {
    e.preventDefault();
    onSubmit({ exam_category_id: Number(form.exam_category_id), name: form.name.trim(), sort_order: Number(form.sort_order) });
  }

  return (
    <div className="modal-backdrop" role="presentation">
      <div className="modal stack gap-md" role="dialog" aria-modal="true">
        <div className="modal__header">
          <h2 className="modal__title">{title}</h2>
          {subtitle && <p className="text-muted" style={{ margin: '4px 0 0' }}>{subtitle}</p>}
        </div>
        <form className="modal__body" onSubmit={handleSubmit}>
          <div className="field">
            <label htmlFor="ch-cat-id">分类 ID</label>
            <input id="ch-cat-id" name="exam_category_id" type="number" value={form.exam_category_id} onChange={handleChange} disabled readOnly />
          </div>
          <div className="field">
            <label htmlFor="ch-name">名称</label>
            <input id="ch-name" name="name" type="text" value={form.name} onChange={handleChange} disabled={isSubmitting} required placeholder="请输入章节名称" />
          </div>
          <div className="field">
            <label htmlFor="ch-sort">排序</label>
            <input id="ch-sort" name="sort_order" type="number" min="1" step="1" value={form.sort_order} onChange={handleChange} disabled={isSubmitting} required />
          </div>

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

export default ChapterFormModal;
