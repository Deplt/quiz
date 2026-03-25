import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, test } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { AuthProvider, useAuth } from './AuthContext';
import { AppRouter } from '../router';

function LoginProbe({ tokenToLogin, adminToLogin }) {
  const { admin, login, token } = useAuth();

  return (
    <div>
      <button type="button" onClick={() => login(tokenToLogin, adminToLogin)}>
        Login probe
      </button>
      <div>token:{token ?? 'null'}</div>
      <div>admin:{admin?.username ?? 'null'}</div>
    </div>
  );
}

describe('ProtectedRoute', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  test('redirects unauthenticated users to /login', () => {
    render(
      <AuthProvider>
        <MemoryRouter initialEntries={['/categories']}>
          <AppRouter />
        </MemoryRouter>
      </AuthProvider>
    );

    expect(screen.getByRole('heading', { name: 'Login' })).toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: 'Categories' })).not.toBeInTheDocument();
  });

  test('renders the admin layout and navigation for authenticated users', async () => {
    localStorage.setItem('admin_token', 'stored-token');

    render(
      <AuthProvider>
        <MemoryRouter initialEntries={['/categories']}>
          <AppRouter />
        </MemoryRouter>
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByRole('navigation', { name: 'Admin navigation' })).toBeInTheDocument();
    });

    expect(screen.getByRole('link', { name: 'Categories' })).toHaveAttribute('href', '/categories');
    expect(screen.getByRole('link', { name: 'Questions' })).toHaveAttribute('href', '/questions');
    expect(screen.getByRole('button', { name: 'Logout' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Categories' })).toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: 'Login' })).not.toBeInTheDocument();
  });

  test('logs out from the admin layout and redirects to /login', async () => {
    localStorage.setItem('admin_token', 'stored-token');

    render(
      <AuthProvider>
        <MemoryRouter initialEntries={['/categories']}>
          <AppRouter />
        </MemoryRouter>
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Logout' })).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('button', { name: 'Logout' }));

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'Login' })).toBeInTheDocument();
    });

    expect(localStorage.getItem('admin_token')).toBeNull();
    expect(screen.queryByRole('navigation', { name: 'Admin navigation' })).not.toBeInTheDocument();
  });

  test('redirects authenticated users to /login when auth expires', async () => {
    localStorage.setItem('admin_token', 'stored-token');

    render(
      <AuthProvider>
        <MemoryRouter initialEntries={['/categories']}>
          <AppRouter />
        </MemoryRouter>
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Logout' })).toBeInTheDocument();
    });

    act(() => {
      window.dispatchEvent(new CustomEvent('admin-auth-expired'));
    });

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'Login' })).toBeInTheDocument();
    });

    expect(localStorage.getItem('admin_token')).toBeNull();
    expect(screen.queryByRole('navigation', { name: 'Admin navigation' })).not.toBeInTheDocument();
  });

  test('normalizes falsy login tokens to a cleared auth state', () => {
    render(
      <AuthProvider>
        <LoginProbe tokenToLogin="" adminToLogin={{ username: 'root' }} />
      </AuthProvider>
    );

    fireEvent.click(screen.getByRole('button', { name: 'Login probe' }));

    expect(screen.getByText('token:null')).toBeInTheDocument();
    expect(screen.getByText('admin:null')).toBeInTheDocument();
    expect(localStorage.getItem('admin_token')).toBeNull();
  });
});
