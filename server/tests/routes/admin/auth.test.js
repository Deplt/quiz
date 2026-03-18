const request = require('supertest');
const app = require('../../../src/app');

describe('Admin Auth', () => {
  test('POST /admin/v1/auth/login returns 400 without body', async () => {
    const res = await request(app).post('/admin/v1/auth/login').send({});
    expect(res.status).toBe(400);
  });
});
