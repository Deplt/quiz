import { useEffect, useState } from 'react';

const INITIAL_FORM = {
  name: '',
  icon: '',
  sort_order: 1,
};

function getFormValues(initialValues) {
  return {
    name: initialValues?.name ?? INITIAL_FORM.name,
    icon: initialValues?.icon ?? INITIAL_FORM.icon,
    sort_order: initialValues?.sort_order ?? INITIAL_FORM.sort_order,
  };
}

function CategoryFormModal({
  open,
  onClose,
  onSubmit,
  initialValues = null,
  title = 'Add category',
  subtitle = 'Create a new quiz category.',
  submitLabel = 'Create category',
  submittingLabel = 'Creating category...',
  isSubmitting = false,
  error = '',
}) {
  const [formValues, setFormValues] = useState(INITIAL_FORM);

  useEffect(() => {
    if (open) {
      setFormValues(getFormValues(initialValues));
    }
  }, [open, initialValues]);

  if (!open) {
    return null;
  }

  function handleChange(event) {
    const { name, value } = event.target;

    setFormValues((current) => ({
      ...current,
      [name]: value,
    }));
  }

  function handleSubmit(event) {
    event.preventDefault();

    onSubmit({
      name: formValues.name.trim(),
      icon: formValues.icon.trim(),
      sort_order: Number(formValues.sort_order),
    });
  }

  return (
    <div className="modal-backdrop" role="presentation">
      <div className="modal stack gap-md" role="dialog" aria-modal="true" aria-labelledby="category-form-title">
        <div className="modal__header">
          <div>
            <h2 className="modal__title" id="category-form-title">{title}</h2>
            <p className="text-muted">{subtitle}</p>
          </div>
        </div>

        <form className="modal__body" onSubmit={handleSubmit}>
          <div className="field">
            <label htmlFor="category-name">Name</label>
            <input
              id="category-name"
              name="name"
              type="text"
              value={formValues.name}
              onChange={handleChange}
              disabled={isSubmitting}
              required
            />
          </div>

          <div className="field">
            <label htmlFor="category-icon">Icon</label>
            <input
              id="category-icon"
              name="icon"
              type="text"
              value={formValues.icon}
              onChange={handleChange}
              disabled={isSubmitting}
            />
          </div>

          <div className="field">
            <label htmlFor="category-sort-order">Sort order</label>
            <input
              id="category-sort-order"
              name="sort_order"
              type="number"
              min="1"
              step="1"
              value={formValues.sort_order}
              onChange={handleChange}
              disabled={isSubmitting}
              required
            />
          </div>

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

export default CategoryFormModal;
