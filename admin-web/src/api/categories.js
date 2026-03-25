import { request } from './http';

export function getCategories() {
  return request('/admin/v1/categories', {
    authenticated: true,
  });
}

export function createCategory(payload) {
  return request('/admin/v1/categories', {
    method: 'POST',
    authenticated: true,
    body: payload,
  });
}

export function updateCategory(id, payload) {
  return request(`/admin/v1/categories/${id}`, {
    method: 'PUT',
    authenticated: true,
    body: payload,
  });
}

export function archiveCategory(id) {
  return request(`/admin/v1/categories/${id}/archive`, {
    method: 'PUT',
    authenticated: true,
  });
}

export function getCategoryChapters(id) {
  return request(`/admin/v1/categories/${id}/chapters`, {
    authenticated: true,
  });
}
