const request = require('supertest');
const app = require('../../src/app');

describe('Exam API', () => {
  test('GET /api/v1/exam/categories returns 401 without token', async () => {
    const res = await request(app).get('/api/v1/exam/categories');
    expect(res.status).toBe(401);
  });
});
