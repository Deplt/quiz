const request = require('supertest');
const app = require('../../src/app');

describe('Wrong Question API', () => {
  test('GET /api/v1/wrong/list returns 401 without token', async () => {
    const res = await request(app).get('/api/v1/wrong/list');
    expect(res.status).toBe(401);
  });
});
