const request = require('supertest');
const app = require('../../src/app');
const { getSequelize } = require('../../src/config/database');
const { User } = require('../../src/models');
const { generateUserToken, createTestUser } = require('../helpers');

describe('GET /api/v1/user/profile', () => {
  test('returns 401 without token', async () => {
    const res = await request(app).get('/api/v1/user/profile');
    expect(res.status).toBe(401);
  });
});
