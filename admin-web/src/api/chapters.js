import { request } from './http';

export function createChapter(payload) {
  return request('/admin/v1/chapters', {
    method: 'POST',
    authenticated: true,
    body: payload,
  });
}

export function updateChapter(id, payload) {
  return request(`/admin/v1/chapters/${id}`, {
    method: 'PUT',
    authenticated: true,
    body: payload,
  });
}

export function archiveChapter(id) {
  return request(`/admin/v1/chapters/${id}/archive`, {
    method: 'PUT',
    authenticated: true,
  });
}
