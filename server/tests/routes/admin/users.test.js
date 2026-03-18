const request = require('supertest');
const app = require('../../../src/app');

describe('Admin Users', () => {
  test('GET /admin/v1/users returns 401', async () => {
    const res = await request(app).get('/admin/v1/users');
    expect(res.status).toBe(401);
  });
});
