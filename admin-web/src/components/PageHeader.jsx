function PageHeader({ title, subtitle = '', action = null }) {
  return (
    <header>
      <div>
        <h1>{title}</h1>
        {subtitle ? <p>{subtitle}</p> : null}
      </div>

      {action ? (
        <button type="button" onClick={action.onClick} disabled={action.disabled}>
          {action.label}
        </button>
      ) : null}
    </header>
  );
}

export default PageHeader;
