import { Navigate, Route, Routes } from 'react-router-dom';
import ProtectedRoute from '../auth/ProtectedRoute';
import AdminLayout from '../layouts/AdminLayout.jsx';
import CategoriesPage from '../pages/CategoriesPage.jsx';
import ChaptersPage from '../pages/ChaptersPage.jsx';
import DashboardPage from '../pages/DashboardPage.jsx';
import LoginPage from '../pages/LoginPage.jsx';
import MockConfigsPage from '../pages/MockConfigsPage.jsx';
import QuestionsPage from '../pages/QuestionsPage.jsx';
import SettingsPage from '../pages/SettingsPage.jsx';
import UserDetailPage from '../pages/UserDetailPage.jsx';
import UsersPage from '../pages/UsersPage.jsx';

export function AppRouter() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="/login" element={<LoginPage />} />
      <Route
        element={(
          <ProtectedRoute>
            <AdminLayout />
          </ProtectedRoute>
        )}
      >
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/categories" element={<CategoriesPage />} />
        <Route path="/categories/:categoryId/chapters" element={<ChaptersPage />} />
        <Route path="/chapters-manage" element={<CategoriesPage />} />
        <Route path="/questions" element={<QuestionsPage />} />
        <Route path="/mock-configs" element={<MockConfigsPage />} />
        <Route path="/users" element={<UsersPage />} />
        <Route path="/users/:userId" element={<UserDetailPage />} />
        <Route path="/settings" element={<SettingsPage />} />
      </Route>
    </Routes>
  );
}

export default AppRouter;
