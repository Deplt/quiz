import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, test, vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import CategoriesPage from './CategoriesPage.jsx';
import {
  archiveCategory,
  createCategory,
  getCategories,
  updateCategory,
} from '../api/categories.js';

vi.mock('../api/categories.js', () => ({
  getCategories: vi.fn(),
  createCategory: vi.fn(),
  updateCategory: vi.fn(),
  archiveCategory: vi.fn(),
}));

describe('CategoriesPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('loads categories and creates a new category', async () => {
    vi.mocked(getCategories).mockResolvedValueOnce([
      { id: 1, name: 'Science', icon: 'flask', sort_order: 1 },
      { id: 2, name: 'Math', icon: 'calculator', sort_order: 2 },
    ]);
    vi.mocked(createCategory).mockResolvedValue({
      id: 3,
      name: 'History',
      icon: 'book',
      sort_order: 3,
    });

    render(
      <MemoryRouter>
        <CategoriesPage />
      </MemoryRouter>,
    );

    expect(await screen.findByText('Science')).toBeInTheDocument();
    expect(screen.getByText('Math')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Add category' }));

    fireEvent.change(screen.getByLabelText('Name'), {
      target: { value: 'History' },
    });
    fireEvent.change(screen.getByLabelText('Icon'), {
      target: { value: 'book' },
    });
    fireEvent.change(screen.getByLabelText('Sort order'), {
      target: { value: '3' },
    });

    fireEvent.click(screen.getByRole('button', { name: 'Create category' }));

    await waitFor(() => {
      expect(createCategory).toHaveBeenCalledWith({
        name: 'History',
        icon: 'book',
        sort_order: 3,
      });
    });

    expect(await screen.findByText('History')).toBeInTheDocument();
    expect(getCategories).toHaveBeenCalledTimes(1);
  });

  test('edits a category and preserves sort order locally', async () => {
    vi.mocked(getCategories).mockResolvedValueOnce([
      { id: 1, name: 'Science', icon: 'flask', sort_order: 2 },
      { id: 2, name: 'Math', icon: 'calculator', sort_order: 3 },
    ]);
    vi.mocked(updateCategory).mockResolvedValue({
      id: 2,
      name: 'Mathematics',
      icon: 'calculator',
      sort_order: 1,
    });

    render(
      <MemoryRouter>
        <CategoriesPage />
      </MemoryRouter>,
    );

    expect(await screen.findByText('Science')).toBeInTheDocument();
    expect(screen.getByText('Math')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Edit Math' }));

    expect(screen.getByLabelText('Name')).toHaveValue('Math');
    expect(screen.getByLabelText('Icon')).toHaveValue('calculator');
    expect(screen.getByLabelText('Sort order')).toHaveValue(3);

    fireEvent.change(screen.getByLabelText('Name'), {
      target: { value: 'Mathematics' },
    });
    fireEvent.change(screen.getByLabelText('Sort order'), {
      target: { value: '1' },
    });

    fireEvent.click(screen.getByRole('button', { name: 'Save changes' }));

    await waitFor(() => {
      expect(updateCategory).toHaveBeenCalledWith(2, {
        name: 'Mathematics',
        icon: 'calculator',
        sort_order: 1,
      });
    });

    expect(await screen.findByText('Mathematics')).toBeInTheDocument();
    expect(getCategories).toHaveBeenCalledTimes(1);

    const rows = screen.getAllByRole('row').slice(1);
    expect(rows[0]).toHaveTextContent('Mathematics');
    expect(rows[1]).toHaveTextContent('Science');
  });

  test('requires confirmation before archiving and hides archived categories after refresh', async () => {
    vi.mocked(getCategories)
      .mockResolvedValueOnce([
        { id: 1, name: 'Science', icon: 'flask', sort_order: 1 },
        { id: 2, name: 'Math', icon: 'calculator', sort_order: 2 },
      ])
      .mockResolvedValueOnce([
        {
          id: 1,
          name: 'Science',
          icon: 'flask',
          sort_order: 1,
          status: 'archived',
          archived_at: '2026-03-24T10:00:00Z',
        },
        { id: 2, name: 'Math', icon: 'calculator', sort_order: 2 },
      ]);
    vi.mocked(archiveCategory).mockResolvedValue({
      id: 1,
      name: 'Science',
      icon: 'flask',
      sort_order: 1,
      archived_at: '2026-03-24T10:00:00Z',
    });

    render(
      <MemoryRouter>
        <CategoriesPage />
      </MemoryRouter>,
    );

    expect(await screen.findByText('Science')).toBeInTheDocument();
    expect(screen.getByText('Math')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Archive Science' }));

    expect(screen.getByRole('dialog', { name: 'Archive category' })).toBeInTheDocument();
    expect(archiveCategory).not.toHaveBeenCalled();
    expect(getCategories).toHaveBeenCalledTimes(1);

    fireEvent.click(screen.getByRole('button', { name: 'Archive category' }));

    await waitFor(() => {
      expect(archiveCategory).toHaveBeenCalledWith(1);
    });
    await waitFor(() => {
      expect(getCategories).toHaveBeenCalledTimes(2);
    });

    expect(await screen.findByText('Math')).toBeInTheDocument();
    expect(screen.queryByText('Science')).not.toBeInTheDocument();
  });

  test('shows a chapters action for each category row', async () => {
    vi.mocked(getCategories).mockResolvedValueOnce([
      { id: 1, name: 'Science', icon: 'flask', sort_order: 1 },
      { id: 2, name: 'Math', icon: 'calculator', sort_order: 2 },
    ]);

    render(
      <MemoryRouter>
        <CategoriesPage />
      </MemoryRouter>,
    );

    expect(await screen.findByText('Science')).toBeInTheDocument();

    expect(screen.getByRole('link', { name: 'View chapters for Science' })).toHaveAttribute('href', '/categories/1/chapters');
    expect(screen.getByRole('link', { name: 'View chapters for Math' })).toHaveAttribute('href', '/categories/2/chapters');
  });
});
