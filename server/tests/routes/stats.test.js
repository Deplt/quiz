const request = require('supertest');
const app = require('../../src/app');

describe('Stats API', () => {
  test('GET /api/v1/stats/overview returns 401 without token', async () => {
    const res = await request(app).get('/api/v1/stats/overview');
    expect(res.status).toBe(401);
  });
});
