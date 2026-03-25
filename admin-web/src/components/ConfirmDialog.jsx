function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  isSubmitting = false,
  error = '',
  onConfirm,
  onClose,
}) {
  if (!open) {
    return null;
  }

  return (
    <div className="modal-backdrop" role="presentation">
      <div className="modal stack gap-md" role="dialog" aria-modal="true" aria-labelledby="confirm-dialog-title">
        <div className="modal__header">
          <div>
            <h2 className="modal__title" id="confirm-dialog-title">{title}</h2>
            <p className="text-muted">{message}</p>
          </div>
        </div>

        {error ? <p className="error-banner" role="alert">{error}</p> : null}

        <div className="modal-actions">
          <button
            className="button button-secondary"
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
          >
            {cancelLabel}
          </button>
          <button
            className="button button-danger"
            type="button"
            onClick={onConfirm}
            disabled={isSubmitting}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ConfirmDialog;
