import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { beforeEach, describe, expect, test, vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { AuthProvider } from '../auth/AuthContext.jsx';
import { getCategories, getCategoryChapters } from '../api/categories.js';
import {
  archiveQuestion,
  batchArchiveQuestions,
  createQuestion,
  getQuestions,
  updateQuestion,
} from '../api/questions.js';
import QuestionsPage from './QuestionsPage.jsx';
import { AppRouter } from '../router/index.jsx';

vi.mock('../api/categories.js', () => ({
  getCategories: vi.fn(),
  getCategoryChapters: vi.fn(),
}));

vi.mock('../api/questions.js', () => ({
  getQuestions: vi.fn(),
  createQuestion: vi.fn(),
  updateQuestion: vi.fn(),
  archiveQuestion: vi.fn(),
  batchArchiveQuestions: vi.fn(),
}));

function renderQuestionsPage() {
  return render(
    <MemoryRouter>
      <QuestionsPage />
    </MemoryRouter>,
  );
}

function createDeferred() {
  let resolve;
  let reject;

  const promise = new Promise((resolvedValue, rejectedValue) => {
    resolve = resolvedValue;
    reject = rejectedValue;
  });

  return { promise, resolve, reject };
}

describe('QuestionsPage', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    localStorage.clear();
  });

  test('loads categories and questions with default page and filter params and renders filter controls', async () => {
    vi.mocked(getCategories).mockResolvedValueOnce([
      { id: 1, name: 'Science' },
      { id: 2, name: 'Math' },
    ]);
    vi.mocked(getQuestions).mockResolvedValueOnce({
      list: [
        {
          id: 101,
          exam_category_id: 1,
          chapter_id: 11,
          type: 'single_choice',
          content: 'Atoms basics',
          answer: 'A',
          difficulty: 1,
          status: 'active',
        },
        {
          id: 102,
          exam_category_id: 2,
          chapter_id: 21,
          type: 'multi_choice',
          content: 'Balance equations',
          answer: 'A,B',
          difficulty: 2,
          status: 'active',
        },
      ],
      total: 2,
      page: 1,
      pageSize: 20,
    });

    renderQuestionsPage();

    expect(await screen.findByText('Atoms basics')).toBeInTheDocument();
    expect(screen.getByText('Balance equations')).toBeInTheDocument();

    expect(getCategories).toHaveBeenCalledTimes(1);
    expect(getQuestions).toHaveBeenCalledWith({
      exam_category_id: '',
      chapter_id: '',
      type: '',
      page: 1,
      pageSize: 20,
    });

    expect(screen.getByLabelText('Category')).toBeInTheDocument();
    expect(screen.getByLabelText('Chapter')).toBeDisabled();
    expect(screen.getByLabelText('Type')).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'Science' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'Math' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'Single choice' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'Multi choice' })).toBeInTheDocument();
  });

  test('fetches chapter options and refetches questions when the category filter changes', async () => {
    vi.mocked(getCategories).mockResolvedValueOnce([
      { id: 1, name: 'Science' },
      { id: 2, name: 'Math' },
    ]);
    vi.mocked(getQuestions)
      .mockResolvedValueOnce({
        list: [
          {
            id: 101,
            exam_category_id: 1,
            chapter_id: 11,
            type: 'single_choice',
            content: 'Atoms basics',
            answer: 'A',
            difficulty: 1,
            status: 'active',
          },
        ],
        total: 1,
        page: 1,
        pageSize: 20,
      })
      .mockResolvedValueOnce({
        list: [
          {
            id: 201,
            exam_category_id: 2,
            chapter_id: 21,
            type: 'single_choice',
            content: 'Fractions warmup',
            answer: 'B',
            difficulty: 1,
            status: 'active',
          },
        ],
        total: 1,
        page: 1,
        pageSize: 20,
      });
    vi.mocked(getCategoryChapters).mockResolvedValueOnce([
      { id: 21, exam_category_id: 2, name: 'Fractions', sort_order: 1 },
      { id: 22, exam_category_id: 2, name: 'Decimals', sort_order: 2 },
    ]);

    renderQuestionsPage();

    expect(await screen.findByText('Atoms basics')).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText('Category'), {
      target: { value: '2' },
    });

    await waitFor(() => {
      expect(getCategoryChapters).toHaveBeenCalledWith('2');
    });
    await waitFor(() => {
      expect(getQuestions).toHaveBeenLastCalledWith({
        exam_category_id: '2',
        chapter_id: '',
        type: '',
        page: 1,
        pageSize: 20,
      });
    });

    expect(await screen.findByText('Fractions warmup')).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'Fractions' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'Decimals' })).toBeInTheDocument();
    expect(screen.getByLabelText('Chapter')).not.toBeDisabled();
  });

  test('clears stale chapter options immediately when switching categories before the next chapter load resolves', async () => {
    const nextCategoryChapters = createDeferred();

    vi.mocked(getCategories).mockResolvedValueOnce([
      { id: 1, name: 'Science' },
      { id: 2, name: 'Math' },
    ]);
    vi.mocked(getQuestions)
      .mockResolvedValueOnce({
        list: [
          {
            id: 101,
            exam_category_id: 1,
            chapter_id: 11,
            type: 'single_choice',
            content: 'Atoms basics',
            answer: 'A',
            difficulty: 1,
            status: 'active',
          },
        ],
        total: 1,
        page: 1,
        pageSize: 20,
      })
      .mockResolvedValueOnce({
        list: [
          {
            id: 201,
            exam_category_id: 1,
            chapter_id: 11,
            type: 'single_choice',
            content: 'Cell review',
            answer: 'B',
            difficulty: 2,
            status: 'active',
          },
        ],
        total: 1,
        page: 1,
        pageSize: 20,
      })
      .mockResolvedValueOnce({
        list: [
          {
            id: 301,
            exam_category_id: 2,
            chapter_id: 21,
            type: 'multi_choice',
            content: 'Fractions warmup',
            answer: 'A,B',
            difficulty: 3,
            status: 'active',
          },
        ],
        total: 1,
        page: 1,
        pageSize: 20,
      });
    vi.mocked(getCategoryChapters)
      .mockResolvedValueOnce([
        { id: 11, exam_category_id: 1, name: 'Biology', sort_order: 1 },
        { id: 12, exam_category_id: 1, name: 'Chemistry', sort_order: 2 },
      ])
      .mockReturnValueOnce(nextCategoryChapters.promise);

    renderQuestionsPage();

    expect(await screen.findByText('Atoms basics')).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText('Category'), {
      target: { value: '1' },
    });

    expect(await screen.findByRole('option', { name: 'Biology' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'Chemistry' })).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText('Category'), {
      target: { value: '2' },
    });

    await waitFor(() => {
      expect(getCategoryChapters).toHaveBeenLastCalledWith('2');
    });

    expect(screen.queryByRole('option', { name: 'Biology' })).not.toBeInTheDocument();
    expect(screen.queryByRole('option', { name: 'Chemistry' })).not.toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'All chapters' })).toBeInTheDocument();

    nextCategoryChapters.resolve([
      { id: 21, exam_category_id: 2, name: 'Fractions', sort_order: 1 },
    ]);

    expect(await screen.findByRole('option', { name: 'Fractions' })).toBeInTheDocument();
  });

  test('clears stale chapter options in the question modal immediately when switching categories before the next chapter load resolves', async () => {
    const nextCategoryChapters = createDeferred();

    vi.mocked(getCategories).mockResolvedValueOnce([
      { id: 1, name: 'Science' },
      { id: 2, name: 'Math' },
    ]);
    vi.mocked(getQuestions).mockResolvedValueOnce({
      list: [],
      total: 0,
      page: 1,
      pageSize: 20,
    });
    vi.mocked(getCategoryChapters)
      .mockResolvedValueOnce([
        { id: 11, exam_category_id: 1, name: 'Biology', sort_order: 1 },
        { id: 12, exam_category_id: 1, name: 'Chemistry', sort_order: 2 },
      ])
      .mockReturnValueOnce(nextCategoryChapters.promise);

    renderQuestionsPage();

    expect(await screen.findByText('No questions yet.')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Add question' }));

    const dialog = screen.getByRole('dialog', { name: 'Add question' });
    const categorySelect = within(dialog).getByLabelText('Category');
    const chapterSelect = within(dialog).getByLabelText('Chapter');

    fireEvent.change(categorySelect, {
      target: { value: '1' },
    });

    await waitFor(() => {
      expect(getCategoryChapters).toHaveBeenCalledWith('1');
    });

    expect(await within(chapterSelect).findByRole('option', { name: 'Biology' })).toBeInTheDocument();
    expect(within(chapterSelect).getByRole('option', { name: 'Chemistry' })).toBeInTheDocument();

    fireEvent.change(categorySelect, {
      target: { value: '2' },
    });

    await waitFor(() => {
      expect(getCategoryChapters).toHaveBeenLastCalledWith('2');
    });

    expect(within(chapterSelect).queryByRole('option', { name: 'Biology' })).not.toBeInTheDocument();
    expect(within(chapterSelect).queryByRole('option', { name: 'Chemistry' })).not.toBeInTheDocument();
    expect(within(chapterSelect).getAllByRole('option')).toHaveLength(1);
    expect(within(chapterSelect).getByRole('option', { name: 'Select chapter' })).toBeInTheDocument();

    nextCategoryChapters.resolve([
      { id: 21, exam_category_id: 2, name: 'Fractions', sort_order: 1 },
    ]);

    expect(await within(chapterSelect).findByRole('option', { name: 'Fractions' })).toBeInTheDocument();
  });

  test('creates a question with the expected normalized payload', async () => {
    vi.mocked(getCategories).mockResolvedValueOnce([
      { id: 1, name: 'Science' },
      { id: 2, name: 'Math' },
    ]);
    vi.mocked(getQuestions)
      .mockResolvedValueOnce({
        list: [],
        total: 0,
        page: 1,
        pageSize: 20,
      })
      .mockResolvedValueOnce({
        list: [
          {
            id: 301,
            exam_category_id: 1,
            chapter_id: 11,
            type: 'multi_choice',
            content: 'What is 1 + 1?',
            answer: 'B',
            difficulty: 'hard',
            status: 'active',
          },
        ],
        total: 1,
        page: 1,
        pageSize: 20,
      });
    vi.mocked(getCategoryChapters).mockResolvedValueOnce([
      { id: 11, exam_category_id: 1, name: 'Physics', sort_order: 1 },
      { id: 12, exam_category_id: 1, name: 'Chemistry', sort_order: 2 },
    ]);
    vi.mocked(createQuestion).mockResolvedValueOnce({
      id: 301,
      exam_category_id: 1,
      chapter_id: 11,
      type: 'multi_choice',
      content: 'What is 1 + 1?',
      answer: 'B',
      difficulty: 'hard',
      status: 'active',
    });

    renderQuestionsPage();

    expect(await screen.findByText('No questions yet.')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Add question' }));

    const dialog = screen.getByRole('dialog', { name: 'Add question' });

    fireEvent.change(within(dialog).getByLabelText('Category'), {
      target: { value: '1' },
    });

    await waitFor(() => {
      expect(getCategoryChapters).toHaveBeenCalledWith('1');
    });

    fireEvent.change(within(dialog).getByLabelText('Chapter'), {
      target: { value: '11' },
    });
    fireEvent.change(within(dialog).getByLabelText('Type'), {
      target: { value: 'multi_choice' },
    });
    fireEvent.change(within(dialog).getByLabelText('Content'), {
      target: { value: '  What is 1 + 1?  ' },
    });
    fireEvent.change(within(dialog).getByLabelText('Answer'), {
      target: { value: '  B  ' },
    });
    fireEvent.change(within(dialog).getByLabelText('Explanation'), {
      target: { value: '  Because 2 is correct.  ' },
    });
    fireEvent.change(within(dialog).getByLabelText('Difficulty'), {
      target: { value: 'hard' },
    });
    fireEvent.change(within(dialog).getByLabelText('Options JSON'), {
      target: {
        value: '[{"label":"A","text":"1"},{"label":"B","text":"2"}]',
      },
    });

    fireEvent.click(within(dialog).getByRole('button', { name: 'Create question' }));

    await waitFor(() => {
      expect(createQuestion).toHaveBeenCalledWith({
        exam_category_id: 1,
        chapter_id: 11,
        type: 'multi_choice',
        content: 'What is 1 + 1?',
        options_json: [
          { label: 'A', text: '1' },
          { label: 'B', text: '2' },
        ],
        answer: 'B',
        explanation: 'Because 2 is correct.',
        difficulty: 'hard',
      });
    });
    await waitFor(() => {
      expect(getQuestions).toHaveBeenCalledTimes(2);
    });

    expect(await screen.findByText('What is 1 + 1?')).toBeInTheDocument();
  });

  test('updates a question with the expected normalized payload and refreshes the list', async () => {
    vi.mocked(getCategories).mockResolvedValueOnce([
      { id: 1, name: 'Science' },
      { id: 2, name: 'Math' },
    ]);
    vi.mocked(getQuestions)
      .mockResolvedValueOnce({
        list: [
          {
            id: 401,
            exam_category_id: 2,
            chapter_id: 21,
            type: 'single_choice',
            content: 'Original prompt',
            options_json: [
              { label: 'A', text: 'True' },
              { label: 'B', text: 'False' },
            ],
            answer: 'A',
            explanation: 'Original explanation',
            difficulty: 'medium',
            status: 'active',
          },
        ],
        total: 1,
        page: 1,
        pageSize: 20,
      })
      .mockResolvedValueOnce({
        list: [
          {
            id: 401,
            exam_category_id: 2,
            chapter_id: 22,
            type: 'true_false',
            content: 'Updated prompt',
            options_json: null,
            answer: 'True',
            explanation: '',
            difficulty: 'easy',
            status: 'active',
          },
        ],
        total: 1,
        page: 1,
        pageSize: 20,
      });
    vi.mocked(getCategoryChapters).mockResolvedValueOnce([
      { id: 21, exam_category_id: 2, name: 'Algebra', sort_order: 1 },
      { id: 22, exam_category_id: 2, name: 'Geometry', sort_order: 2 },
    ]);
    vi.mocked(updateQuestion).mockResolvedValueOnce({
      id: 401,
      exam_category_id: 2,
      chapter_id: 22,
      type: 'true_false',
      content: 'Updated prompt',
      options_json: null,
      answer: 'True',
      explanation: '',
      difficulty: 'easy',
      status: 'active',
    });

    renderQuestionsPage();

    expect(await screen.findByText('Original prompt')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Edit Original prompt' }));

    const dialog = screen.getByRole('dialog', { name: 'Edit question' });

    await waitFor(() => {
      expect(getCategoryChapters).toHaveBeenCalledWith('2');
    });

    fireEvent.change(within(dialog).getByLabelText('Chapter'), {
      target: { value: '22' },
    });
    fireEvent.change(within(dialog).getByLabelText('Type'), {
      target: { value: 'true_false' },
    });
    fireEvent.change(within(dialog).getByLabelText('Content'), {
      target: { value: '  Updated prompt  ' },
    });
    fireEvent.change(within(dialog).getByLabelText('Answer'), {
      target: { value: '  True  ' },
    });
    fireEvent.change(within(dialog).getByLabelText('Explanation'), {
      target: { value: '   ' },
    });
    fireEvent.change(within(dialog).getByLabelText('Difficulty'), {
      target: { value: 'easy' },
    });
    fireEvent.change(within(dialog).getByLabelText('Options JSON'), {
      target: { value: '   ' },
    });

    fireEvent.click(within(dialog).getByRole('button', { name: 'Save changes' }));

    await waitFor(() => {
      expect(updateQuestion).toHaveBeenCalledWith(401, {
        exam_category_id: 2,
        chapter_id: 22,
        type: 'true_false',
        content: 'Updated prompt',
        options_json: null,
        answer: 'True',
        explanation: '',
        difficulty: 'easy',
      });
    });
    await waitFor(() => {
      expect(getQuestions).toHaveBeenCalledTimes(2);
    });

    expect(await screen.findByText('Updated prompt')).toBeInTheDocument();
    expect(screen.queryByText('Original prompt')).not.toBeInTheDocument();
  });

  test('blocks edit submission when required content or answer is whitespace only after trimming', async () => {
    vi.mocked(getCategories).mockResolvedValueOnce([
      { id: 1, name: 'Science' },
      { id: 2, name: 'Math' },
    ]);
    vi.mocked(getQuestions).mockResolvedValueOnce({
      list: [
        {
          id: 401,
          exam_category_id: 2,
          chapter_id: 21,
          type: 'single_choice',
          content: 'Original prompt',
          options_json: [
            { label: 'A', text: 'True' },
            { label: 'B', text: 'False' },
          ],
          answer: 'A',
          explanation: 'Original explanation',
          difficulty: 'medium',
          status: 'active',
        },
      ],
      total: 1,
      page: 1,
      pageSize: 20,
    });
    vi.mocked(getCategoryChapters).mockResolvedValueOnce([
      { id: 21, exam_category_id: 2, name: 'Algebra', sort_order: 1 },
      { id: 22, exam_category_id: 2, name: 'Geometry', sort_order: 2 },
    ]);

    renderQuestionsPage();

    expect(await screen.findByText('Original prompt')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Edit Original prompt' }));

    const dialog = screen.getByRole('dialog', { name: 'Edit question' });

    await waitFor(() => {
      expect(getCategoryChapters).toHaveBeenCalledWith('2');
    });

    fireEvent.change(within(dialog).getByLabelText('Content'), {
      target: { value: '   ' },
    });
    fireEvent.change(within(dialog).getByLabelText('Answer'), {
      target: { value: '   ' },
    });

    fireEvent.click(within(dialog).getByRole('button', { name: 'Save changes' }));

    expect(updateQuestion).not.toHaveBeenCalled();
    expect(await within(dialog).findByRole('alert')).toHaveTextContent('Content and answer are required');
  });

  test('requires confirmation before archiving a question and refreshes the list', async () => {
    vi.mocked(getCategories).mockResolvedValueOnce([
      { id: 1, name: 'Science' },
      { id: 2, name: 'Math' },
    ]);
    vi.mocked(getQuestions)
      .mockResolvedValueOnce({
        list: [
          {
            id: 401,
            exam_category_id: 2,
            chapter_id: 21,
            type: 'single_choice',
            content: 'Original prompt',
            answer: 'A',
            difficulty: 'medium',
            status: 'active',
          },
          {
            id: 402,
            exam_category_id: 2,
            chapter_id: 22,
            type: 'true_false',
            content: 'Second prompt',
            answer: 'True',
            difficulty: 'easy',
            status: 'active',
          },
        ],
        total: 2,
        page: 1,
        pageSize: 20,
      })
      .mockResolvedValueOnce({
        list: [
          {
            id: 402,
            exam_category_id: 2,
            chapter_id: 22,
            type: 'true_false',
            content: 'Second prompt',
            answer: 'True',
            difficulty: 'easy',
            status: 'active',
          },
        ],
        total: 1,
        page: 1,
        pageSize: 20,
      });

    vi.mocked(archiveQuestion).mockResolvedValueOnce({
      id: 401,
      status: 'archived',
      archived_at: '2026-03-24T10:00:00Z',
    });

    renderQuestionsPage();

    expect(await screen.findByText('Original prompt')).toBeInTheDocument();
    expect(screen.getByText('Second prompt')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Archive Original prompt' }));

    expect(screen.getByRole('dialog', { name: 'Archive question' })).toBeInTheDocument();
    expect(archiveQuestion).not.toHaveBeenCalled();
    expect(getQuestions).toHaveBeenCalledTimes(1);

    fireEvent.click(screen.getByRole('button', { name: 'Archive question' }));

    await waitFor(() => {
      expect(archiveQuestion).toHaveBeenCalledWith(401);
    });
    await waitFor(() => {
      expect(getQuestions).toHaveBeenCalledTimes(2);
    });

    expect(await screen.findByText('Second prompt')).toBeInTheDocument();
    expect(screen.queryByText('Original prompt')).not.toBeInTheDocument();
  });

  test('archives selected questions in batch and clears the selection after refresh', async () => {
    vi.mocked(getCategories).mockResolvedValueOnce([
      { id: 1, name: 'Science' },
      { id: 2, name: 'Math' },
    ]);
    vi.mocked(getQuestions)
      .mockResolvedValueOnce({
        list: [
          {
            id: 401,
            exam_category_id: 2,
            chapter_id: 21,
            type: 'single_choice',
            content: 'Original prompt',
            answer: 'A',
            difficulty: 'medium',
            status: 'active',
          },
          {
            id: 402,
            exam_category_id: 2,
            chapter_id: 22,
            type: 'true_false',
            content: 'Second prompt',
            answer: 'True',
            difficulty: 'easy',
            status: 'active',
          },
          {
            id: 403,
            exam_category_id: 1,
            chapter_id: 11,
            type: 'multi_choice',
            content: 'Third prompt',
            answer: 'A,B',
            difficulty: 'hard',
            status: 'active',
          },
        ],
        total: 3,
        page: 1,
        pageSize: 20,
      })
      .mockResolvedValueOnce({
        list: [
          {
            id: 403,
            exam_category_id: 1,
            chapter_id: 11,
            type: 'multi_choice',
            content: 'Third prompt',
            answer: 'A,B',
            difficulty: 'hard',
            status: 'active',
          },
        ],
        total: 1,
        page: 1,
        pageSize: 20,
      });
    vi.mocked(batchArchiveQuestions).mockResolvedValueOnce({
      success: true,
    });

    renderQuestionsPage();

    expect(await screen.findByText('Original prompt')).toBeInTheDocument();

    const originalCheckbox = screen.getByRole('checkbox', { name: 'Select Original prompt' });
    const secondCheckbox = screen.getByRole('checkbox', { name: 'Select Second prompt' });
    const batchButton = screen.getByRole('button', { name: 'Archive selected' });

    expect(batchArchiveQuestions).not.toHaveBeenCalled();
    expect(batchButton).toBeDisabled();

    fireEvent.click(originalCheckbox);
    fireEvent.click(secondCheckbox);

    expect(batchButton).not.toBeDisabled();

    fireEvent.click(batchButton);

    expect(screen.getByRole('dialog', { name: 'Archive selected questions' })).toBeInTheDocument();
    expect(batchArchiveQuestions).not.toHaveBeenCalled();

    fireEvent.click(screen.getByRole('button', { name: 'Archive selected questions' }));

    await waitFor(() => {
      expect(batchArchiveQuestions).toHaveBeenCalledWith([401, 402]);
    });
    await waitFor(() => {
      expect(getQuestions).toHaveBeenCalledTimes(2);
    });

    expect(await screen.findByText('Third prompt')).toBeInTheDocument();
    expect(screen.queryByText('Original prompt')).not.toBeInTheDocument();
    expect(screen.queryByText('Second prompt')).not.toBeInTheDocument();
    expect(screen.queryByRole('checkbox', { name: 'Select Original prompt' })).not.toBeInTheDocument();
    expect(screen.queryByRole('checkbox', { name: 'Select Second prompt' })).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Archive selected' })).toBeDisabled();
  });

  test('clears batch selection when archive succeeds but the follow-up question reload fails', async () => {
    vi.mocked(getCategories).mockResolvedValueOnce([
      { id: 1, name: 'Science' },
      { id: 2, name: 'Math' },
    ]);
    vi.mocked(getQuestions)
      .mockResolvedValueOnce({
        list: [
          {
            id: 401,
            exam_category_id: 2,
            chapter_id: 21,
            type: 'single_choice',
            content: 'Original prompt',
            answer: 'A',
            difficulty: 'medium',
            status: 'active',
          },
          {
            id: 402,
            exam_category_id: 2,
            chapter_id: 22,
            type: 'true_false',
            content: 'Second prompt',
            answer: 'True',
            difficulty: 'easy',
            status: 'active',
          },
        ],
        total: 2,
        page: 1,
        pageSize: 20,
      })
      .mockRejectedValueOnce(new Error('Failed to reload questions'));
    vi.mocked(batchArchiveQuestions).mockResolvedValueOnce({
      success: true,
    });

    renderQuestionsPage();

    expect(await screen.findByText('Original prompt')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('checkbox', { name: 'Select Original prompt' }));
    fireEvent.click(screen.getByRole('checkbox', { name: 'Select Second prompt' }));
    fireEvent.click(screen.getByRole('button', { name: 'Archive selected' }));
    fireEvent.click(screen.getByRole('button', { name: 'Archive selected questions' }));

    await waitFor(() => {
      expect(batchArchiveQuestions).toHaveBeenCalledWith([401, 402]);
    });

    expect(await screen.findByRole('alert')).toHaveTextContent('Failed to reload questions');
    expect(screen.getByRole('button', { name: 'Archive selected' })).toBeDisabled();
  });

  test('renders the paginated question dataset returned by the API contract', async () => {
    vi.mocked(getCategories).mockResolvedValueOnce([
      { id: 1, name: 'Science' },
    ]);
    vi.mocked(getQuestions).mockResolvedValueOnce({
      list: [
        {
          id: 101,
          exam_category_id: 1,
          chapter_id: 11,
          type: 'single_choice',
          content: 'Atoms basics',
          answer: 'A',
          difficulty: 1,
          status: 'active',
        },
      ],
      total: 1,
      page: 1,
      pageSize: 20,
    });

    renderQuestionsPage();

    expect(await screen.findByText('Atoms basics')).toBeInTheDocument();
    expect(screen.getByText('Showing 1 of 1 questions')).toBeInTheDocument();
  });

  test('app router renders QuestionsPage for /questions instead of the placeholder', async () => {
    localStorage.setItem('admin_token', 'stored-token');
    vi.mocked(getCategories).mockResolvedValueOnce([
      { id: 1, name: 'Science' },
    ]);
    vi.mocked(getQuestions).mockResolvedValueOnce({
      list: [],
      total: 0,
      page: 1,
      pageSize: 20,
    });

    render(
      <AuthProvider>
        <MemoryRouter initialEntries={['/questions']}>
          <AppRouter />
        </MemoryRouter>
      </AuthProvider>,
    );

    expect(await screen.findByRole('heading', { name: 'Questions' })).toBeInTheDocument();
    expect(screen.getByLabelText('Category')).toBeInTheDocument();
    expect(screen.getByText('No questions yet.')).toBeInTheDocument();
  });
});
