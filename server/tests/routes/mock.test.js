const request = require('supertest');
const app = require('../../src/app');

describe('Mock API', () => {
  test('POST /api/v1/mock/start returns 401 without token', async () => {
    const res = await request(app).post('/api/v1/mock/start');
    expect(res.status).toBe(401);
  });
});
