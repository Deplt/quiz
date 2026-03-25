jest.mock('../src/models', () => ({
  Question: {
    findAndCountAll: jest.fn(),
  },
}));

const { Question } = require('../src/models');
const { listQuestions } = require('../src/services/admin/questionService');

describe('admin questionService.listQuestions', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('filters archived questions out before pagination and counting', async () => {
    const rows = [{ id: 101, status: 'active' }];
    Question.findAndCountAll.mockResolvedValueOnce({ count: 1, rows });

    const result = await listQuestions(
      { exam_category_id: 1, chapter_id: 11, type: 'single_choice' },
      { offset: 20, limit: 10 },
    );

    expect(Question.findAndCountAll).toHaveBeenCalledWith({
      where: {
        status: 'active',
        exam_category_id: 1,
        chapter_id: 11,
        type: 'single_choice',
      },
      offset: 20,
      limit: 10,
      order: [['id', 'DESC']],
    });
    expect(result).toEqual({ total: 1, list: rows });
  });
});
