import { beforeEach, describe, expect, test, vi } from 'vitest';
import { clearToken, setToken } from '../auth/token';
import { request } from './http';

describe('request', () => {
  beforeEach(() => {
    clearToken();
    vi.unstubAllGlobals();
  });

  test('throws backend message when code is not 0', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ code: -1, message: 'Unauthorized' }),
    }));

    await expect(request('/admin/v1/categories')).rejects.toThrow('Unauthorized');
  });

  test('clears the stored token and notifies auth expiry on 401 responses', async () => {
    const handleAuthExpired = vi.fn();

    setToken('token-123');
    window.addEventListener('admin-auth-expired', handleAuthExpired);
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      status: 401,
      json: async () => ({ code: -1, message: 'Unauthorized' }),
    }));

    await expect(request('/admin/v1/categories', { authenticated: true })).rejects.toThrow('Unauthorized');

    expect(localStorage.getItem('admin_token')).toBeNull();
    expect(handleAuthExpired).toHaveBeenCalledTimes(1);

    window.removeEventListener('admin-auth-expired', handleAuthExpired);
  });

  test('returns backend data and builds authenticated json requests', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ code: 0, data: { id: 3 } }),
    });

    setToken('token-123');
    vi.stubGlobal('fetch', fetchMock);

    await expect(
      request('/admin/v1/categories', {
        method: 'POST',
        authenticated: true,
        body: { name: 'History', icon: 'book', sort_order: 3 },
      })
    ).resolves.toEqual({ id: 3 });

    expect(fetchMock).toHaveBeenCalledWith('/admin/v1/categories', {
      method: 'POST',
      headers: {
        Authorization: 'Bearer token-123',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name: 'History', icon: 'book', sort_order: 3 }),
    });
  });
});
