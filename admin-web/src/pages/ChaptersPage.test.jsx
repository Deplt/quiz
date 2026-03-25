import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, test, vi } from 'vitest';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import ChaptersPage from './ChaptersPage.jsx';
import { getCategoryChapters } from '../api/categories.js';
import { archiveChapter, createChapter, updateChapter } from '../api/chapters.js';

vi.mock('../api/categories.js', () => ({
  getCategoryChapters: vi.fn(),
}));

vi.mock('../api/chapters.js', () => ({
  createChapter: vi.fn(),
  updateChapter: vi.fn(),
  archiveChapter: vi.fn(),
}));

function renderChaptersPage(categoryId = '7') {
  return render(
    <MemoryRouter initialEntries={[`/categories/${categoryId}/chapters`]}>
      <Routes>
        <Route path="/categories" element={<div>Categories page</div>} />
        <Route path="/categories/:categoryId/chapters" element={<ChaptersPage />} />
      </Routes>
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

describe('ChaptersPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('loads chapters for the route category and creates a chapter bound to it', async () => {
    vi.mocked(getCategoryChapters).mockResolvedValueOnce([
      { id: 11, exam_category_id: 7, name: 'Foundations', sort_order: 1 },
      { id: 12, exam_category_id: 7, name: 'Mock drills', sort_order: 2 },
    ]);
    vi.mocked(createChapter).mockResolvedValue({
      id: 13,
      exam_category_id: 7,
      name: 'Final review',
      sort_order: 3,
    });

    renderChaptersPage();

    expect(screen.getByRole('link', { name: 'Back to categories' })).toHaveAttribute('href', '/categories');
    expect(await screen.findByText('Foundations')).toBeInTheDocument();
    expect(screen.getByText('Mock drills')).toBeInTheDocument();
    expect(screen.getByText('Category 7')).toBeInTheDocument();
    expect(getCategoryChapters).toHaveBeenCalledWith('7');

    fireEvent.click(screen.getByRole('button', { name: 'Add chapter' }));

    expect(screen.getByLabelText('Category ID')).toHaveValue(7);

    fireEvent.change(screen.getByLabelText('Name'), {
      target: { value: 'Final review' },
    });
    fireEvent.change(screen.getByLabelText('Sort order'), {
      target: { value: '3' },
    });

    fireEvent.click(screen.getByRole('button', { name: 'Create chapter' }));

    await waitFor(() => {
      expect(createChapter).toHaveBeenCalledWith({
        exam_category_id: 7,
        name: 'Final review',
        sort_order: 3,
      });
    });

    expect(await screen.findByText('Final review')).toBeInTheDocument();
  });

  test('preserves a typed name and refreshes the default sort order when chapters finish loading', async () => {
    const deferredChapters = createDeferred();
    vi.mocked(getCategoryChapters).mockReturnValueOnce(deferredChapters.promise);

    renderChaptersPage();

    expect(screen.getByText('Loading chapters...')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Add chapter' }));

    const nameInput = screen.getByLabelText('Name');
    expect(screen.getByLabelText('Category ID')).toHaveValue(7);
    expect(screen.getByLabelText('Sort order')).toHaveValue(1);

    fireEvent.change(nameInput, {
      target: { value: 'Draft chapter name' },
    });

    deferredChapters.resolve([
      { id: 11, exam_category_id: 7, name: 'Foundations', sort_order: 1 },
    ]);

    expect(await screen.findByText('Foundations')).toBeInTheDocument();
    expect(screen.getByLabelText('Name')).toHaveValue('Draft chapter name');
    await waitFor(() => {
      expect(screen.getByLabelText('Sort order')).toHaveValue(2);
    });
  });

  test('does not overwrite a manually edited sort order when chapters finish loading', async () => {
    const deferredChapters = createDeferred();
    vi.mocked(getCategoryChapters).mockReturnValueOnce(deferredChapters.promise);

    renderChaptersPage();

    fireEvent.click(screen.getByRole('button', { name: 'Add chapter' }));

    fireEvent.change(screen.getByLabelText('Name'), {
      target: { value: 'Draft chapter name' },
    });
    fireEvent.change(screen.getByLabelText('Sort order'), {
      target: { value: '7' },
    });

    deferredChapters.resolve([
      { id: 11, exam_category_id: 7, name: 'Foundations', sort_order: 1 },
    ]);

    expect(await screen.findByText('Foundations')).toBeInTheDocument();
    expect(screen.getByLabelText('Name')).toHaveValue('Draft chapter name');
    expect(screen.getByLabelText('Sort order')).toHaveValue(7);
  });

  test('edits a chapter and refreshes the chapter list after saving changes', async () => {
    vi.mocked(getCategoryChapters)
      .mockResolvedValueOnce([
        { id: 11, exam_category_id: 7, name: 'Foundations', sort_order: 1 },
        { id: 12, exam_category_id: 7, name: 'Mock drills', sort_order: 2 },
      ])
      .mockResolvedValueOnce([
        { id: 11, exam_category_id: 7, name: 'Core foundations', sort_order: 1 },
        { id: 12, exam_category_id: 7, name: 'Mock drills', sort_order: 2 },
      ]);
    vi.mocked(updateChapter).mockResolvedValue({
      id: 11,
      exam_category_id: 7,
      name: 'Core foundations',
      sort_order: 1,
    });

    renderChaptersPage();

    expect(await screen.findByText('Foundations')).toBeInTheDocument();
    expect(screen.getByText('Mock drills')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Edit Foundations' }));

    expect(screen.getByRole('dialog', { name: 'Edit chapter' })).toBeInTheDocument();
    expect(screen.getByLabelText('Category ID')).toHaveValue(7);
    expect(screen.getByLabelText('Name')).toHaveValue('Foundations');
    expect(screen.getByLabelText('Sort order')).toHaveValue(1);

    fireEvent.change(screen.getByLabelText('Name'), {
      target: { value: 'Core foundations' },
    });

    fireEvent.click(screen.getByRole('button', { name: 'Save changes' }));

    await waitFor(() => {
      expect(updateChapter).toHaveBeenCalledWith(11, {
        exam_category_id: 7,
        name: 'Core foundations',
        sort_order: 1,
      });
    });
    await waitFor(() => {
      expect(getCategoryChapters).toHaveBeenCalledTimes(2);
    });

    expect(await screen.findByText('Core foundations')).toBeInTheDocument();
    expect(screen.queryByText('Foundations')).not.toBeInTheDocument();
  });

  test('requires confirmation before archiving a chapter and refreshes the list', async () => {
    vi.mocked(getCategoryChapters)
      .mockResolvedValueOnce([
        { id: 11, exam_category_id: 7, name: 'Foundations', sort_order: 1 },
        { id: 12, exam_category_id: 7, name: 'Mock drills', sort_order: 2 },
      ])
      .mockResolvedValueOnce([
        {
          id: 11,
          exam_category_id: 7,
          name: 'Foundations',
          sort_order: 1,
          status: 'archived',
          archived_at: '2026-03-24T10:00:00Z',
        },
        { id: 12, exam_category_id: 7, name: 'Mock drills', sort_order: 2 },
      ]);
    vi.mocked(archiveChapter).mockResolvedValue({
      id: 11,
      exam_category_id: 7,
      name: 'Foundations',
      sort_order: 1,
      archived_at: '2026-03-24T10:00:00Z',
    });

    renderChaptersPage();

    expect(await screen.findByText('Foundations')).toBeInTheDocument();
    expect(screen.getByText('Mock drills')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Archive Foundations' }));

    expect(screen.getByRole('dialog', { name: 'Archive chapter' })).toBeInTheDocument();
    expect(archiveChapter).not.toHaveBeenCalled();
    expect(getCategoryChapters).toHaveBeenCalledTimes(1);

    fireEvent.click(screen.getByRole('button', { name: 'Archive chapter' }));

    await waitFor(() => {
      expect(archiveChapter).toHaveBeenCalledWith(11);
    });
    await waitFor(() => {
      expect(getCategoryChapters).toHaveBeenCalledTimes(2);
    });

    expect(await screen.findByText('Mock drills')).toBeInTheDocument();
    expect(screen.queryByText('Foundations')).not.toBeInTheDocument();
  });
});
