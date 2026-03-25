import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';

function AdminLayout() {
  const navigate = useNavigate();
  const { logout } = useAuth();

  function handleLogout() {
    logout();
    navigate('/login', { replace: true });
  }

  return (
    <div className="app-shell">
      <aside className="app-shell__sidebar stack gap-lg">
        <div className="stack gap-sm">
          <span className="pill">Quiz Admin</span>
          <strong>Management</strong>
        </div>

        <nav aria-label="Admin navigation">
          <ul className="stack gap-sm">
            <li>
              <NavLink to="/categories">Categories</NavLink>
            </li>
            <li>
              <NavLink to="/questions">Questions</NavLink>
            </li>
          </ul>
        </nav>

        <button className="button button-secondary" type="button" onClick={handleLogout}>
          Logout
        </button>
      </aside>

      <main className="app-shell__content">
        <div className="page-shell">
          <Outlet />
        </div>
      </main>
    </div>
  );
}

export default AdminLayout;
