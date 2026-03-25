import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, test, vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { AuthProvider } from '../auth/AuthContext';
import { AppRouter } from '../router';
import { login as loginRequest } from '../api/auth.js';

vi.mock('../api/auth.js', () => ({
  login: vi.fn(),
}));

function renderLoginRoute() {
  return render(
    <AuthProvider>
      <MemoryRouter initialEntries={['/login']}>
        <AppRouter />
      </MemoryRouter>
    </AuthProvider>
  );
}

function fillCredentials({ username = 'root', password = 'secret' } = {}) {
  fireEvent.change(screen.getByLabelText('Username'), {
    target: { value: username },
  });
  fireEvent.change(screen.getByLabelText('Password'), {
    target: { value: password },
  });
}

describe('LoginPage', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  test('redirects authenticated users away from /login', async () => {
    localStorage.setItem('admin_token', 'stored-token');

    renderLoginRoute();

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'Categories' })).toBeInTheDocument();
    });

    expect(screen.queryByRole('heading', { name: 'Login' })).not.toBeInTheDocument();
  });

  test('stores auth state and navigates to /categories after a successful login', async () => {
    vi.mocked(loginRequest).mockResolvedValue({
      token: 'token-123',
      admin: { username: 'root' },
    });

    renderLoginRoute();
    fillCredentials();

    fireEvent.click(screen.getByRole('button', { name: 'Login' }));

    expect(loginRequest).toHaveBeenCalledWith({
      username: 'root',
      password: 'secret',
    });

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'Categories' })).toBeInTheDocument();
    });

    expect(localStorage.getItem('admin_token')).toBe('token-123');
    expect(screen.queryByRole('heading', { name: 'Login' })).not.toBeInTheDocument();
  });

  test('shows a loading state while submitting and displays API errors', async () => {
    let rejectLogin;
    vi.mocked(loginRequest).mockImplementationOnce(() => new Promise((_, reject) => {
      rejectLogin = reject;
    }));

    renderLoginRoute();
    fillCredentials({ username: 'admin', password: 'bad-password' });

    fireEvent.click(screen.getByRole('button', { name: 'Login' }));

    expect(screen.getByRole('button', { name: 'Logging in...' })).toBeDisabled();

    rejectLogin(new Error('Invalid credentials'));

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent('Invalid credentials');
    });

    expect(screen.getByRole('button', { name: 'Login' })).not.toBeDisabled();
    expect(screen.queryByRole('heading', { name: 'Categories' })).not.toBeInTheDocument();
    expect(localStorage.getItem('admin_token')).toBeNull();
  });
});
