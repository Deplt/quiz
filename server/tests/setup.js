process.env.DB_NAME = 'quiz_app_test';
process.env.JWT_SECRET = 'test-secret';
process.env.NODE_ENV = 'test';

const { getSequelize } = require('../src/config/database');

beforeAll(async () => {
  const sequelize = getSequelize();
  await sequelize.sync({ force: true });
});

afterAll(async () => {
  const sequelize = getSequelize();
  await sequelize.close();
});
