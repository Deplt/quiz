import { Navigate, Route, Routes } from 'react-router-dom';
import ProtectedRoute from '../auth/ProtectedRoute';
import AdminLayout from '../layouts/AdminLayout.jsx';
import CategoriesPage from '../pages/CategoriesPage.jsx';
import ChaptersPage from '../pages/ChaptersPage.jsx';
import LoginPage from '../pages/LoginPage.jsx';
import QuestionsPage from '../pages/QuestionsPage.jsx';

export function AppRouter() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/categories" replace />} />
      <Route path="/login" element={<LoginPage />} />
      <Route
        element={(
          <ProtectedRoute>
            <AdminLayout />
          </ProtectedRoute>
        )}
      >
        <Route path="/categories" element={<CategoriesPage />} />
        <Route path="/categories/:categoryId/chapters" element={<ChaptersPage />} />
        <Route path="/questions" element={<QuestionsPage />} />
      </Route>
    </Routes>
  );
}

export default AppRouter;
