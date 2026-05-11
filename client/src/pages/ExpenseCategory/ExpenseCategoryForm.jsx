import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getExpenseCategoryById, createExpenseCategory, updateExpenseCategory } from '../../api/simpleFormsApi';

export default function ExpenseCategoryForm() {
  const { id }   = useParams();
  const isEdit   = Boolean(id);
  const navigate = useNavigate();

  const [categoryName, setCategoryName] = useState('');
  const [loadingPage, setLoadingPage]   = useState(isEdit);
  const [saving, setSaving]             = useState(false);
  const [error, setError]               = useState('');

  useEffect(() => {
    if (!isEdit) return;
    setLoadingPage(true);
    getExpenseCategoryById(id)
      .then((res) => setCategoryName(res.data.data.category_name || ''))
      .catch(() => alert('Failed to load expense category'))
      .finally(() => setLoadingPage(false));
  }, [id, isEdit]);

  const handleSubmit = async () => {
    if (!categoryName.trim()) { setError('Category name is required'); return; }
    setError('');
    setSaving(true);
    try {
      if (isEdit) { await updateExpenseCategory(id, { category_name: categoryName }); navigate(`/expense-categories/${id}`); }
      else { const res = await createExpenseCategory({ category_name: categoryName }); navigate(`/expense-categories/${res.data.data.id}`); }
    } catch (err) { alert(err.response?.data?.message || 'Failed to save'); }
    finally { setSaving(false); }
  };

  if (loadingPage) return <div className="state-box">Loading...</div>;

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">{isEdit ? 'Edit Expense Category' : 'New Expense Category'}</h1>
          <p className="page-subtitle">Expense Category</p>
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
          <button type="button" className="btn btn-secondary" onClick={() => navigate('/expense-categories')}>Cancel</button>
          <button type="button" className="btn btn-primary" onClick={handleSubmit} disabled={saving}>
            {saving ? 'Saving...' : 'Save Category'}
          </button>
        </div>
      </div>
    </div>
  );
}
