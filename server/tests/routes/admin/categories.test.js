const request = require('supertest');
const app = require('../../../src/app');

describe('Admin Categories', () => {
  test('GET /admin/v1/categories returns 401 without token', async () => {
    const res = await request(app).get('/admin/v1/categories');
    expect(res.status).toBe(401);
  });
});
