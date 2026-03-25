function PageHeader({ title, subtitle = '', action = null }) {
  return (
    <header className="page-header">
      <div>
        <h2 className="page-title">{title}</h2>
        {subtitle ? <p className="page-header__subtitle">{subtitle}</p> : null}
      </div>

      {action ? (
        <button type="button" className="btn btn-primary" onClick={action.onClick} disabled={action.disabled}>
          {action.label}
        </button>
      ) : null}
    </header>
  );
}

export default PageHeader;
