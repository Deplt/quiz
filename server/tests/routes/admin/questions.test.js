const request = require('supertest');
const app = require('../../../src/app');

describe('Admin Questions', () => {
  test('GET /admin/v1/questions returns 401 without token', async () => {
    const res = await request(app).get('/admin/v1/questions');
    expect(res.status).toBe(401);
  });
});
