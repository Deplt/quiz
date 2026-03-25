import { useEffect, useRef, useState } from 'react';

const INITIAL_FORM = {
  exam_category_id: '',
  name: '',
  sort_order: 1,
};

function getFormValues(initialValues) {
  return {
    exam_category_id: initialValues?.exam_category_id ?? INITIAL_FORM.exam_category_id,
    name: initialValues?.name ?? INITIAL_FORM.name,
    sort_order: initialValues?.sort_order ?? INITIAL_FORM.sort_order,
  };
}

function ChapterFormModal({
  open,
  onClose,
  onSubmit,
  initialValues,
  title = 'Add chapter',
  subtitle = 'Create a new chapter for the selected category.',
  submitLabel = 'Create chapter',
  submittingLabel = 'Creating chapter...',
  isSubmitting = false,
  error = '',
}) {
  const [formValues, setFormValues] = useState(INITIAL_FORM);
  const hasEditedSortOrderRef = useRef(false);

  useEffect(() => {
    if (open) {
      setFormValues(getFormValues(initialValues));
      hasEditedSortOrderRef.current = false;
    }
  }, [open]);

  useEffect(() => {
    if (!open) {
      return;
    }

    const nextInitialValues = getFormValues(initialValues);

    setFormValues((current) => {
      if (current.exam_category_id !== nextInitialValues.exam_category_id) {
        hasEditedSortOrderRef.current = false;
        return nextInitialValues;
      }

      if (hasEditedSortOrderRef.current || current.sort_order === nextInitialValues.sort_order) {
        return current;
      }

      return {
        ...current,
        sort_order: nextInitialValues.sort_order,
      };
    });
  }, [initialValues?.exam_category_id, initialValues?.sort_order, open]);

  if (!open) {
    return null;
  }

  function handleChange(event) {
    const { name, value } = event.target;

    if (name === 'sort_order') {
      hasEditedSortOrderRef.current = true;
    }

    setFormValues((current) => ({
      ...current,
      [name]: value,
    }));
  }

  function handleSubmit(event) {
    event.preventDefault();

    onSubmit({
      exam_category_id: Number(formValues.exam_category_id),
      name: formValues.name.trim(),
      sort_order: Number(formValues.sort_order),
    });
  }

  return (
    <div className="modal-backdrop" role="presentation">
      <div className="modal stack gap-md" role="dialog" aria-modal="true" aria-labelledby="chapter-form-title">
        <div className="modal__header">
          <div>
            <h2 className="modal__title" id="chapter-form-title">{title}</h2>
            <p className="text-muted">{subtitle}</p>
          </div>
        </div>

        <form className="modal__body" onSubmit={handleSubmit}>
          <div className="field">
            <label htmlFor="chapter-category-id">Category ID</label>
            <input
              id="chapter-category-id"
              name="exam_category_id"
              type="number"
              value={formValues.exam_category_id}
              onChange={handleChange}
              disabled
              readOnly
            />
          </div>

          <div className="field">
            <label htmlFor="chapter-name">Name</label>
            <input
              id="chapter-name"
              name="name"
              type="text"
              value={formValues.name}
              onChange={handleChange}
              disabled={isSubmitting}
              required
            />
          </div>

          <div className="field">
            <label htmlFor="chapter-sort-order">Sort order</label>
            <input
              id="chapter-sort-order"
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

export default ChapterFormModal;
