const request = require('supertest');
const app = require('../../../src/app');

describe('Admin Stats', () => {
  test('GET /admin/v1/stats/dashboard returns 401', async () => {
    const res = await request(app).get('/admin/v1/stats/dashboard');
    expect(res.status).toBe(401);
  });
});
