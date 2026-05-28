import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useToast } from '../../hooks/useToast';
import { getEquipmentCategoryById, createEquipmentCategory, updateEquipmentCategory } from '../../api/simpleFormsApi';

export default function EquipmentCategoryForm() {
  const { id }   = useParams();
  const isEdit   = Boolean(id);
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [categoryName, setCategoryName] = useState('');
  const [loadingPage, setLoadingPage]   = useState(isEdit);
  const [saving, setSaving]             = useState(false);
  const [error, setError]               = useState('');

  useEffect(() => {
    if (!isEdit) return;
    setLoadingPage(true);
    getEquipmentCategoryById(id)
      .then((res) => setCategoryName(res.data.data.category_name || ''))
      .catch(() => showToast('Failed to load equipment category', 'error'))
      .finally(() => setLoadingPage(false));
  }, [id, isEdit]);

  const handleSubmit = async () => {
    if (!categoryName.trim()) { setError('Category name is required'); return; }
    setError('');
    setSaving(true);
    try {
      if (isEdit) { 
        await updateEquipmentCategory(id, { category_name: categoryName }); 
        showToast('Equipment category updated successfully', 'success');
        setTimeout(() => navigate(`/equipment-categories/${id}`), 1500);
      }
      else { 
        const res = await createEquipmentCategory({ category_name: categoryName }); 
        showToast('Equipment category created successfully', 'success');
        setTimeout(() => navigate(`/equipment-categories/${res.data.data.id}`), 1500);
      }
    } catch (err) { showToast(err.response?.data?.message || 'Failed to save', 'error'); }
    finally { setSaving(false); }
  };

  if (loadingPage) return <div className="state-box">Loading...</div>;

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">{isEdit ? 'Edit Equipment Category' : 'New Equipment Category'}</h1>
          <p className="page-subtitle">Equipment Category</p>
        </div>
      </div>

      <div className="card card-body">
        <p className="form-section-title">Category Details</p>
        <div className="form-grid-2">

          <div>
            <label className="form-label">ID</label>
            <input className="form-input readonly" readOnly value={isEdit ? id : 'Auto-generated'} />
          </div>

          <div>
            <label className="form-label">Category Name <span style={{ color: 'var(--danger)' }}>*</span></label>
            <input className={`form-input${error ? ' error' : ''}`} value={categoryName} onChange={(e) => setCategoryName(e.target.value)} placeholder="Category name" />
            {error && <p className="form-error">{error}</p>}
          </div>

        </div>

        <hr className="divider" />
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
          <button type="button" className="btn btn-secondary" onClick={() => navigate('/equipment-categories')}>Cancel</button>
          <button type="button" className="btn btn-primary" onClick={handleSubmit} disabled={saving}>
            {saving ? 'Saving...' : 'Save Category'}
          </button>
        </div>
      </div>
    </div>
  );
}
