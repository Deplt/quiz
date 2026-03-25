import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  archiveCategory,
  createCategory,
  getCategories,
  updateCategory,
} from '../api/categories.js';
import CategoryFormModal from '../components/CategoryFormModal.jsx';
import ConfirmDialog from '../components/ConfirmDialog.jsx';
import PageHeader from '../components/PageHeader.jsx';

function sortCategories(items) {
  return [...items].sort((left, right) => left.sort_order - right.sort_order);
}

function isArchivedCategory(category) {
  return category?.status === 'archived' || Boolean(category?.archived_at);
}

function normalizeLoadedCategories(items) {
  return sortCategories(items.filter((category) => !isArchivedCategory(category)));
}

function CategoriesPage() {
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [formError, setFormError] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [archivingCategory, setArchivingCategory] = useState(null);
  const [archiveError, setArchiveError] = useState('');
  const [isArchiving, setIsArchiving] = useState(false);

  async function loadCategories() {
    setLoadError('');
    setIsLoading(true);

    try {
      const data = await getCategories();
      setCategories(normalizeLoadedCategories(Array.isArray(data) ? data : []));
    } catch (error) {
      setLoadError(error instanceof Error ? error.message : 'Failed to load categories');
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadCategories();
  }, []);

  function handleOpenCreateModal() {
    setEditingCategory(null);
    setFormError('');
    setIsModalOpen(true);
  }

  function handleOpenEditModal(category) {
    setEditingCategory(category);
    setFormError('');
    setIsModalOpen(true);
  }

  function handleCloseModal() {
    if (isSaving) {
      return;
    }

    setFormError('');
    setEditingCategory(null);
    setIsModalOpen(false);
  }

  async function handleSubmitCategory(payload) {
    setFormError('');
    setIsSaving(true);

    try {
      if (editingCategory) {
        const updatedCategory = await updateCategory(editingCategory.id, payload);
        setCategories((current) => sortCategories(
          current.map((category) => (category.id === updatedCategory.id ? updatedCategory : category)),
        ));
      } else {
        const createdCategory = await createCategory(payload);
        setCategories((current) => sortCategories([...current, createdCategory]));
      }

      setEditingCategory(null);
      setIsModalOpen(false);
    } catch (error) {
      setFormError(error instanceof Error ? error.message : 'Failed to save category');
    } finally {
      setIsSaving(false);
    }
  }

  function handleOpenArchiveDialog(category) {
    setArchiveError('');
    setArchivingCategory(category);
  }

  function handleCloseArchiveDialog() {
    if (isArchiving) {
      return;
    }

    setArchiveError('');
    setArchivingCategory(null);
  }

  async function handleConfirmArchive() {
    if (!archivingCategory) {
      return;
    }

    setArchiveError('');
    setIsArchiving(true);

    try {
      await archiveCategory(archivingCategory.id);
      setArchivingCategory(null);
      await loadCategories();
    } catch (error) {
      setArchiveError(error instanceof Error ? error.message : 'Failed to archive category');
    } finally {
      setIsArchiving(false);
    }
  }

  const isEditing = Boolean(editingCategory);

  return (
    <section className="stack gap-md">
      <PageHeader
        title="Categories"
        subtitle="Manage quiz categories."
        action={{
          label: 'Add category',
          onClick: handleOpenCreateModal,
        }}
      />

      {loadError ? <p className="error-banner" role="alert">{loadError}</p> : null}

      <div className="table-card table-scroll">
        {isLoading ? (
          <p>Loading categories...</p>
        ) : categories.length === 0 ? (
          <div className="empty-state">No categories yet.</div>
        ) : (
          <table>
            <thead>
              <tr>
                <th scope="col">Name</th>
                <th scope="col">Icon</th>
                <th scope="col">Sort order</th>
                <th scope="col">Actions</th>
              </tr>
            </thead>
            <tbody>
              {categories.map((category) => (
                <tr key={category.id}>
                  <td>{category.name}</td>
                  <td>{category.icon || '—'}</td>
                  <td>{category.sort_order}</td>
                  <td>
                    <div className="table-actions">
                      <Link
                        className="button button-secondary"
                        aria-label={`View chapters for ${category.name}`}
                        to={`/categories/${category.id}/chapters`}
                      >
                        Chapters
                      </Link>
                      <button
                        className="button button-secondary"
                        type="button"
                        aria-label={`Edit ${category.name}`}
                        onClick={() => handleOpenEditModal(category)}
                        disabled={isSaving || isArchiving}
                      >
                        Edit
                      </button>
                      <button
                        className="button button-danger"
                        type="button"
                        aria-label={`Archive ${category.name}`}
                        onClick={() => handleOpenArchiveDialog(category)}
                        disabled={isSaving || isArchiving}
                      >
                        Archive
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <CategoryFormModal
        open={isModalOpen}
        onClose={handleCloseModal}
        onSubmit={handleSubmitCategory}
        initialValues={editingCategory}
        title={isEditing ? 'Edit category' : 'Add category'}
        subtitle={isEditing ? 'Update the selected quiz category.' : 'Create a new quiz category.'}
        submitLabel={isEditing ? 'Save changes' : 'Create category'}
        submittingLabel={isEditing ? 'Saving changes...' : 'Creating category...'}
        isSubmitting={isSaving}
        error={formError}
      />

      <ConfirmDialog
        open={Boolean(archivingCategory)}
        title="Archive category"
        message={archivingCategory ? `Archive ${archivingCategory.name}? This removes it from the active category list.` : ''}
        confirmLabel={isArchiving ? 'Archiving category...' : 'Archive category'}
        isSubmitting={isArchiving}
        error={archiveError}
        onConfirm={handleConfirmArchive}
        onClose={handleCloseArchiveDialog}
      />
    </section>
  );
}

export default CategoriesPage;
