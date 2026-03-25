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
      setLoadError(error instanceof Error ? error.message : '加载分类失败');
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => { loadCategories(); }, []);

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
    if (isSaving) return;
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
          current.map((c) => (c.id === updatedCategory.id ? updatedCategory : c)),
        ));
      } else {
        const createdCategory = await createCategory(payload);
        setCategories((current) => sortCategories([...current, createdCategory]));
      }
      setEditingCategory(null);
      setIsModalOpen(false);
    } catch (error) {
      setFormError(error instanceof Error ? error.message : '保存失败');
    } finally {
      setIsSaving(false);
    }
  }

  function handleOpenArchiveDialog(category) {
    setArchiveError('');
    setArchivingCategory(category);
  }

  function handleCloseArchiveDialog() {
    if (isArchiving) return;
    setArchiveError('');
    setArchivingCategory(null);
  }

  async function handleConfirmArchive() {
    if (!archivingCategory) return;
    setArchiveError('');
    setIsArchiving(true);
    try {
      await archiveCategory(archivingCategory.id);
      setArchivingCategory(null);
      await loadCategories();
    } catch (error) {
      setArchiveError(error instanceof Error ? error.message : '归档失败');
    } finally {
      setIsArchiving(false);
    }
  }

  const isEditing = Boolean(editingCategory);

  return (
    <section className="stack gap-md">
      <PageHeader
        title="考试分类"
        subtitle="管理考试科目分类"
        action={{ label: '新增分类', onClick: handleOpenCreateModal }}
      />

      {loadError ? <p className="error-banner" role="alert">{loadError}</p> : null}

      <div className="table-card table-scroll">
        {isLoading ? (
          <p className="page-loading">加载中...</p>
        ) : categories.length === 0 ? (
          <div className="empty-state">暂无分类</div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>名称</th>
                <th>图标</th>
                <th>排序</th>
                <th>操作</th>
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
                      <Link className="btn btn-text" to={`/categories/${category.id}/chapters`}>章节</Link>
                      <button className="btn btn-text" type="button" onClick={() => handleOpenEditModal(category)} disabled={isSaving || isArchiving}>编辑</button>
                      <button className="btn btn-text btn-text--danger" type="button" onClick={() => handleOpenArchiveDialog(category)} disabled={isSaving || isArchiving}>归档</button>
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
        title={isEditing ? '编辑分类' : '新增分类'}
        subtitle={isEditing ? '修改考试分类信息' : '创建新的考试分类'}
        submitLabel={isEditing ? '保存' : '创建'}
        submittingLabel={isEditing ? '保存中...' : '创建中...'}
        isSubmitting={isSaving}
        error={formError}
      />

      <ConfirmDialog
        open={Boolean(archivingCategory)}
        title="归档分类"
        message={archivingCategory ? `确定归档「${archivingCategory.name}」？归档后将不再显示在列表中。` : ''}
        confirmLabel={isArchiving ? '归档中...' : '确认归档'}
        isSubmitting={isArchiving}
        error={archiveError}
        onConfirm={handleConfirmArchive}
        onClose={handleCloseArchiveDialog}
      />
    </section>
  );
}

export default CategoriesPage;
