import { useEffect, useState } from 'react';

const INITIAL_FORM = { name: '', icon: '', sort_order: 1 };

function getFormValues(v) {
  return {
    name: v?.name ?? '',
    icon: v?.icon ?? '',
    sort_order: v?.sort_order ?? 1,
  };
}

function CategoryFormModal({
  open, onClose, onSubmit, initialValues = null,
  title = '新增分类', subtitle = '', submitLabel = '创建', submittingLabel = '创建中...',
  isSubmitting = false, error = '',
}) {
  const [form, setForm] = useState(INITIAL_FORM);

  useEffect(() => {
    if (open) setForm(getFormValues(initialValues));
  }, [open, initialValues]);

  if (!open) return null;

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((c) => ({ ...c, [name]: value }));
  }

  function handleSubmit(e) {
    e.preventDefault();
    onSubmit({ name: form.name.trim(), icon: form.icon.trim(), sort_order: Number(form.sort_order) });
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
            <label htmlFor="cat-name">名称</label>
            <input id="cat-name" name="name" type="text" value={form.name} onChange={handleChange} disabled={isSubmitting} required placeholder="请输入分类名称" />
          </div>
          <div className="field">
            <label htmlFor="cat-icon">图标</label>
            <input id="cat-icon" name="icon" type="text" value={form.icon} onChange={handleChange} disabled={isSubmitting} placeholder="可选" />
          </div>
          <div className="field">
            <label htmlFor="cat-sort">排序</label>
            <input id="cat-sort" name="sort_order" type="number" min="1" step="1" value={form.sort_order} onChange={handleChange} disabled={isSubmitting} required />
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

export default CategoryFormModal;
