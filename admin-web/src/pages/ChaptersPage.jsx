import { useCallback, useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { archiveChapter, createChapter, updateChapter } from '../api/chapters.js';
import { getCategoryChapters } from '../api/categories.js';
import ChapterFormModal from '../components/ChapterFormModal.jsx';
import ConfirmDialog from '../components/ConfirmDialog.jsx';
import PageHeader from '../components/PageHeader.jsx';

function sortChapters(items) {
  return [...items].sort((left, right) => left.sort_order - right.sort_order);
}

function isArchivedChapter(chapter) {
  return chapter?.status === 'archived' || Boolean(chapter?.archived_at);
}

function normalizeLoadedChapters(items) {
  return sortChapters(items.filter((chapter) => !isArchivedChapter(chapter)));
}

function ChaptersPage() {
  const { categoryId = '' } = useParams();
  const numericCategoryId = Number(categoryId);
  const [chapters, setChapters] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingChapter, setEditingChapter] = useState(null);
  const [formError, setFormError] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [archivingChapter, setArchivingChapter] = useState(null);
  const [archiveError, setArchiveError] = useState('');
  const [isArchiving, setIsArchiving] = useState(false);

  const loadChapters = useCallback(async () => {
    setLoadError('');
    setIsLoading(true);

    try {
      const data = await getCategoryChapters(categoryId);
      setChapters(normalizeLoadedChapters(Array.isArray(data) ? data : []));
    } catch (error) {
      setLoadError(error instanceof Error ? error.message : 'Failed to load chapters');
    } finally {
      setIsLoading(false);
    }
  }, [categoryId]);

  useEffect(() => {
    loadChapters();
  }, [loadChapters]);

  function handleOpenCreateModal() {
    setEditingChapter(null);
    setFormError('');
    setIsModalOpen(true);
  }

  function handleOpenEditModal(chapter) {
    setEditingChapter(chapter);
    setFormError('');
    setIsModalOpen(true);
  }

  function handleCloseModal() {
    if (isSaving) {
      return;
    }

    setFormError('');
    setEditingChapter(null);
    setIsModalOpen(false);
  }

  async function handleSubmitChapter(payload) {
    setFormError('');
    setIsSaving(true);

    try {
      if (editingChapter) {
        await updateChapter(editingChapter.id, payload);
        setEditingChapter(null);
        setIsModalOpen(false);
        await loadChapters();
      } else {
        const createdChapter = await createChapter(payload);
        setChapters((current) => sortChapters([...current, createdChapter]));
        setIsModalOpen(false);
      }
    } catch (error) {
      setFormError(error instanceof Error ? error.message : 'Failed to save chapter');
    } finally {
      setIsSaving(false);
    }
  }

  function handleOpenArchiveDialog(chapter) {
    setArchiveError('');
    setArchivingChapter(chapter);
  }

  function handleCloseArchiveDialog() {
    if (isArchiving) {
      return;
    }

    setArchiveError('');
    setArchivingChapter(null);
  }

  async function handleConfirmArchive() {
    if (!archivingChapter) {
      return;
    }

    setArchiveError('');
    setIsArchiving(true);

    try {
      await archiveChapter(archivingChapter.id);
      setArchivingChapter(null);
      await loadChapters();
    } catch (error) {
      setArchiveError(error instanceof Error ? error.message : 'Failed to archive chapter');
    } finally {
      setIsArchiving(false);
    }
  }

  const isEditing = Boolean(editingChapter);

  return (
    <section className="stack gap-md">
      <div className="stack gap-sm">
        <Link className="button button-secondary" to="/categories">Back to categories</Link>
        <span className="pill">Category {categoryId}</span>
      </div>

      <PageHeader
        title="Chapters"
        subtitle="Manage chapters for the selected category."
        action={{
          label: 'Add chapter',
          onClick: handleOpenCreateModal,
        }}
      />

      {loadError ? <p className="error-banner" role="alert">{loadError}</p> : null}

      <div className="table-card table-scroll">
        {isLoading ? (
          <p>Loading chapters...</p>
        ) : chapters.length === 0 ? (
          <div className="empty-state">No chapters yet.</div>
        ) : (
          <table>
            <thead>
              <tr>
                <th scope="col">Name</th>
                <th scope="col">Sort order</th>
                <th scope="col">Actions</th>
              </tr>
            </thead>
            <tbody>
              {chapters.map((chapter) => (
                <tr key={chapter.id}>
                  <td>{chapter.name}</td>
                  <td>{chapter.sort_order}</td>
                  <td>
                    <div className="table-actions">
                      <button
                        className="button button-secondary"
                        type="button"
                        aria-label={`Edit ${chapter.name}`}
                        onClick={() => handleOpenEditModal(chapter)}
                        disabled={isSaving || isArchiving}
                      >
                        Edit
                      </button>
                      <button
                        className="button button-danger"
                        type="button"
                        aria-label={`Archive ${chapter.name}`}
                        onClick={() => handleOpenArchiveDialog(chapter)}
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

      <ChapterFormModal
        open={isModalOpen}
        onClose={handleCloseModal}
        onSubmit={handleSubmitChapter}
        initialValues={editingChapter ?? { exam_category_id: numericCategoryId, sort_order: chapters.length + 1 }}
        title={isEditing ? 'Edit chapter' : 'Add chapter'}
        subtitle={isEditing ? 'Update the selected chapter.' : 'Create a new chapter for the selected category.'}
        submitLabel={isEditing ? 'Save changes' : 'Create chapter'}
        submittingLabel={isEditing ? 'Saving changes...' : 'Creating chapter...'}
        isSubmitting={isSaving}
        error={formError}
      />

      <ConfirmDialog
        open={Boolean(archivingChapter)}
        title="Archive chapter"
        message={archivingChapter ? `Archive ${archivingChapter.name}? This removes it from the active chapter list.` : ''}
        confirmLabel={isArchiving ? 'Archiving chapter...' : 'Archive chapter'}
        isSubmitting={isArchiving}
        error={archiveError}
        onConfirm={handleConfirmArchive}
        onClose={handleCloseArchiveDialog}
      />
    </section>
  );
}

export default ChaptersPage;
