import { request } from './http';

function buildQuery(params = {}) {
  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null || value === '') {
      return;
    }

    searchParams.set(key, String(value));
  });

  const query = searchParams.toString();
  return query ? `?${query}` : '';
}

export function getQuestions(params = {}) {
  return request(`/admin/v1/questions${buildQuery(params)}`, {
    authenticated: true,
  });
}

export function createQuestion(payload) {
  return request('/admin/v1/questions', {
    method: 'POST',
    authenticated: true,
    body: payload,
  });
}

export function updateQuestion(id, payload) {
  return request(`/admin/v1/questions/${id}`, {
    method: 'PUT',
    authenticated: true,
    body: payload,
  });
}

export function archiveQuestion(id) {
  return request(`/admin/v1/questions/${id}/archive`, {
    method: 'PUT',
    authenticated: true,
  });
}

export function batchArchiveQuestions(ids) {
  return request('/admin/v1/questions/batch', {
    method: 'DELETE',
    authenticated: true,
    body: { ids },
  });
}
