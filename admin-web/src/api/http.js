import { clearToken, getToken } from '../auth/token';

function isFormData(value) {
  return typeof FormData !== 'undefined' && value instanceof FormData;
}

export async function request(path, options = {}) {
  const { authenticated = false, body, headers = {}, ...rest } = options;
  const nextHeaders = { ...headers };
  const hasJsonBody = body !== undefined && body !== null && typeof body !== 'string' && !isFormData(body);

  if (authenticated) {
    const token = getToken();

    if (token) {
      nextHeaders.Authorization = `Bearer ${token}`;
    }
  }

  if (hasJsonBody && !nextHeaders['Content-Type']) {
    nextHeaders['Content-Type'] = 'application/json';
  }

  const response = await fetch(path, {
    ...rest,
    ...(Object.keys(nextHeaders).length ? { headers: nextHeaders } : {}),
    ...(body === undefined ? {} : { body: hasJsonBody ? JSON.stringify(body) : body }),
  });
  const payload = await response.json();

  if (response.status === 401 && authenticated) {
    clearToken();

    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('admin-auth-expired'));
    }
  }

  if (payload.code !== 0) {
    throw new Error(payload.message);
  }

  return payload.data;
}
