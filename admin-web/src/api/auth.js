import { request } from './http';

export function login(payload) {
  return request('/admin/v1/auth/login', {
    method: 'POST',
    body: payload,
  });
}
