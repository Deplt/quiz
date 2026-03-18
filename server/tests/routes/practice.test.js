const request = require('supertest');
const app = require('../../src/app');

describe('Practice API', () => {
  test('POST /api/v1/practice/start returns 401 without token', async () => {
    const res = await request(app).post('/api/v1/practice/start');
    expect(res.status).toBe(401);
  });
});
