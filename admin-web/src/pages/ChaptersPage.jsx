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
      setLoadError(error instanceof Error ? error.message : '加载章节失败');
    } finally {
      setIsLoading(false);
    }
  }, [categoryId]);

  useEffect(() => { loadChapters(); }, [loadChapters]);

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
    if (isSaving) return;
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
      setFormError(error instanceof Error ? error.message : '保存失败');
    } finally {
      setIsSaving(false);
    }
  }

  function handleOpenArchiveDialog(chapter) {
    setArchiveError('');
    setArchivingChapter(chapter);
  }

  function handleCloseArchiveDialog() {
    if (isArchiving) return;
    setArchiveError('');
    setArchivingChapter(null);
  }

  async function handleConfirmArchive() {
    if (!archivingChapter) return;
    setArchiveError('');
    setIsArchiving(true);
    try {
      await archiveChapter(archivingChapter.id);
      setArchivingChapter(null);
      await loadChapters();
    } catch (error) {
      setArchiveError(error instanceof Error ? error.message : '归档失败');
    } finally {
      setIsArchiving(false);
    }
  }

  const isEditing = Boolean(editingChapter);

  return (
    <section className="stack gap-md">
      <div className="inline-stack gap-sm">
        <Link className="btn btn-text" to="/categories">← 返回分类列表</Link>
        <span className="pill">分类 ID: {categoryId}</span>
      </div>

      <PageHeader
        title="章节管理"
        subtitle="管理当前分类下的章节"
        action={{ label: '新增章节', onClick: handleOpenCreateModal }}
      />

      {loadError ? <p className="error-banner" role="alert">{loadError}</p> : null}

      <div className="table-card table-scroll">
        {isLoading ? (
          <p className="page-loading">加载中...</p>
        ) : chapters.length === 0 ? (
          <div className="empty-state">暂无章节</div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>名称</th>
                <th>排序</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              {chapters.map((chapter) => (
                <tr key={chapter.id}>
                  <td>{chapter.name}</td>
                  <td>{chapter.sort_order}</td>
                  <td>
                    <div className="table-actions">
                      <button className="btn btn-text" type="button" onClick={() => handleOpenEditModal(chapter)} disabled={isSaving || isArchiving}>编辑</button>
                      <button className="btn btn-text btn-text--danger" type="button" onClick={() => handleOpenArchiveDialog(chapter)} disabled={isSaving || isArchiving}>归档</button>
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
        title={isEditing ? '编辑章节' : '新增章节'}
        subtitle={isEditing ? '修改章节信息' : '为当前分类创建新章节'}
        submitLabel={isEditing ? '保存' : '创建'}
        submittingLabel={isEditing ? '保存中...' : '创建中...'}
        isSubmitting={isSaving}
        error={formError}
      />

      <ConfirmDialog
        open={Boolean(archivingChapter)}
        title="归档章节"
        message={archivingChapter ? `确定归档「${archivingChapter.name}」？归档后将不再显示在列表中。` : ''}
        confirmLabel={isArchiving ? '归档中...' : '确认归档'}
        isSubmitting={isArchiving}
        error={archiveError}
        onConfirm={handleConfirmArchive}
        onClose={handleCloseArchiveDialog}
      />
    </section>
  );
}

export default ChaptersPage;
