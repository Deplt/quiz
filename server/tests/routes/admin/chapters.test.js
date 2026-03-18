const request = require('supertest');
const app = require('../../../src/app');

describe('Admin Chapters', () => {
  test('POST /admin/v1/chapters returns 401 without token', async () => {
    const res = await request(app).post('/admin/v1/chapters');
    expect(res.status).toBe(401);
  });
});
