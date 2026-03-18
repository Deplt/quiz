const request = require('supertest');
const app = require('../../../src/app');

describe('Admin Mock Configs', () => {
  test('GET /admin/v1/mock-configs returns 401', async () => {
    const res = await request(app).get('/admin/v1/mock-configs');
    expect(res.status).toBe(401);
  });
});
