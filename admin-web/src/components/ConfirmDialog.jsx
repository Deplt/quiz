function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = '确认',
  cancelLabel = '取消',
  isSubmitting = false,
  error = '',
  onConfirm,
  onClose,
}) {
  if (!open) return null;

  return (
    <div className="modal-backdrop" role="presentation">
      <div className="modal stack gap-md" role="dialog" aria-modal="true">
        <div className="modal__header">
          <h2 className="modal__title">{title}</h2>
        </div>
        <p className="text-muted" style={{ margin: 0 }}>{message}</p>

        {error ? <p className="error-banner" role="alert">{error}</p> : null}

        <div className="modal-actions">
          <button className="btn btn-secondary" type="button" onClick={onClose} disabled={isSubmitting}>{cancelLabel}</button>
          <button className="btn btn-danger" type="button" onClick={onConfirm} disabled={isSubmitting}>{confirmLabel}</button>
        </div>
      </div>
    </div>
  );
}

export default ConfirmDialog;
