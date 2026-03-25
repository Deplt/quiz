import { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';

const MENU_ITEMS = [
  { label: '仪表盘', icon: '📊', to: '/dashboard' },
  {
    label: '考试管理',
    icon: '📋',
    children: [
      { label: '考试分类', to: '/categories' },
      { label: '章节管理', to: '/chapters-manage' },
    ],
  },
  { label: '题目管理', icon: '📝', to: '/questions' },
  { label: '模考管理', icon: '📄', to: '/mock-configs' },
  { label: '用户管理', icon: '👤', to: '/users' },
  { label: '系统设置', icon: '⚙', to: '/settings' },
];

function SidebarMenu() {
  const [openMenus, setOpenMenus] = useState({ '考试管理': true });

  function toggleMenu(label) {
    setOpenMenus((prev) => ({ ...prev, [label]: !prev[label] }));
  }

  return (
    <nav className="sidebar-nav">
      <ul className="sidebar-menu">
        {MENU_ITEMS.map((item) => {
          if (item.children) {
            const isOpen = openMenus[item.label];
            return (
              <li key={item.label} className="sidebar-menu__group">
                <button
                  type="button"
                  className="sidebar-menu__group-btn"
                  onClick={() => toggleMenu(item.label)}
                >
                  <span className="sidebar-menu__icon">{item.icon}</span>
                  <span className="sidebar-menu__text">{item.label}</span>
                  <span className={`sidebar-menu__arrow ${isOpen ? 'sidebar-menu__arrow--open' : ''}`}>›</span>
                </button>
                {isOpen && (
                  <ul className="sidebar-submenu">
                    {item.children.map((child) => (
                      <li key={child.to}>
                        <NavLink to={child.to} className={({ isActive }) => `sidebar-submenu__link ${isActive ? 'sidebar-submenu__link--active' : ''}`}>
                          {child.label}
                        </NavLink>
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            );
          }

          return (
            <li key={item.to}>
              <NavLink to={item.to} className={({ isActive }) => `sidebar-menu__link ${isActive ? 'sidebar-menu__link--active' : ''}`}>
                <span className="sidebar-menu__icon">{item.icon}</span>
                <span className="sidebar-menu__text">{item.label}</span>
              </NavLink>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

function AdminLayout() {
  const navigate = useNavigate();
  const { admin, logout } = useAuth();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  function handleLogout() {
    logout();
    navigate('/login', { replace: true });
  }

  return (
    <div className={`admin-layout ${sidebarCollapsed ? 'admin-layout--collapsed' : ''}`}>
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar__header">
          <span className="sidebar__logo">刷题管理后台</span>
        </div>
        <SidebarMenu />
      </aside>

      {/* Main area */}
      <div className="admin-main">
        {/* Top header */}
        <header className="topbar">
          <button
            type="button"
            className="topbar__toggle"
            onClick={() => setSidebarCollapsed((v) => !v)}
            aria-label="切换菜单"
          >
            ☰
          </button>
          <div className="topbar__spacer" />
          <div className="topbar__user">
            <span className="topbar__avatar">👤</span>
            <span className="topbar__username">{admin?.username ?? '管理员'}</span>
            <button type="button" className="btn btn-text" onClick={handleLogout}>退出</button>
          </div>
        </header>

        {/* Content */}
        <main className="admin-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default AdminLayout;
