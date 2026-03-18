const jwt = require('jsonwebtoken');
const { User, ExamCategory, Chapter, Question, Admin } = require('../src/models');

function generateUserToken(userId) {
  return jwt.sign({ userId }, process.env.JWT_SECRET || 'test-secret', { expiresIn: '7d' });
}

function generateAdminToken(adminId) {
  return jwt.sign({ adminId, role: 'admin' }, process.env.JWT_SECRET || 'test-secret', { expiresIn: '24h' });
}

async function createTestUser(overrides = {}) {
  return User.create({
    openid: `test_openid_${Date.now()}_${Math.random()}`,
    nickname: 'Test User',
    ...overrides,
  });
}

async function createTestCategory(overrides = {}) {
  return ExamCategory.create({
    name: 'Test Category',
    sort_order: 1,
    ...overrides,
  });
}

async function createTestChapter(categoryId, overrides = {}) {
  return Chapter.create({
    exam_category_id: categoryId,
    name: 'Test Chapter',
    sort_order: 1,
    ...overrides,
  });
}

async function createTestQuestion(categoryId, chapterId, overrides = {}) {
  return Question.create({
    exam_category_id: categoryId,
    chapter_id: chapterId,
    type: 'single_choice',
    content: 'What is 1+1?',
    options_json: [
      { label: 'A', text: '1' },
      { label: 'B', text: '2' },
      { label: 'C', text: '3' },
    ],
    answer: 'B',
    difficulty: 'easy',
    ...overrides,
  });
}

async function createTestAdmin() {
  return Admin.create({
    username: `admin_${Date.now()}`,
    password_hash: Admin.hashPassword('password123'),
  });
}

module.exports = {
  generateUserToken,
  generateAdminToken,
  createTestUser,
  createTestCategory,
  createTestChapter,
  createTestQuestion,
  createTestAdmin,
};
