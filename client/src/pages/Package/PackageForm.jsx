import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useToast } from '../../hooks/useToast';
import { getPackageById, createPackage, updatePackage } from '../../api/simpleFormsApi';

const empty = { package_name: '', duration_months: '', base_price: '', description: '' };

export default function PackageForm() {
  const { id }   = useParams();
  const isEdit   = Boolean(id);
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [form, setForm]         = useState(empty);
  const [loadingPage, setLoadingPage] = useState(isEdit);
  const [saving, setSaving]     = useState(false);
  const [errors, setErrors]     = useState({});

  useEffect(() => {
    if (!isEdit) return;
    setLoadingPage(true);
    getPackageById(id)
      .then((res) => {
        const d = res.data.data;
        setForm({ package_name: d.package_name || '', duration_months: String(d.duration_months ?? ''), base_price: String(d.base_price ?? ''), description: d.description || '' });
      })
      .catch(() => showToast('Failed to load package', 'error'))
      .finally(() => setLoadingPage(false));
  }, [id, isEdit]);

  const set = (field) => (e) => setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const validate = () => {
    const errs = {};
    if (!form.package_name.trim()) errs.package_name = 'Package name is required';
    const dur = parseInt(form.duration_months, 10);
    if (!form.duration_months || isNaN(dur) || dur < 1) errs.duration_months = 'Duration must be at least 1 month';
    const price = parseFloat(form.base_price);
    if (form.base_price === '' || isNaN(price) || price < 0) errs.base_price = 'Valid price is required';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setSaving(true);
    try {
      const payload = { package_name: form.package_name, duration_months: parseInt(form.duration_months, 10), base_price: parseFloat(form.base_price), description: form.description || null };
      if (isEdit) { await updatePackage(id, payload); showToast('Package updated successfully', 'success'); setTimeout(() => navigate(`/packages/${id}`), 1500); }
      else { const res = await createPackage(payload); showToast('Package created successfully', 'success'); setTimeout(() => navigate(`/packages/${res.data.data.id}`), 1500); }
    } catch (err) { showToast(err.response?.data?.message || 'Failed to save package', 'error'); }
    finally { setSaving(false); }
  };

  if (loadingPage) return <div className="state-box">Loading...</div>;
  const f = (field) => errors[field] ? ' error' : '';

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">{isEdit ? 'Edit Package' : 'New Package'}</h1>
          <p className="page-subtitle">Membership Package</p>
        </div>
      </div>

      <div className="card card-body">
        <p className="form-section-title">Package Details</p>
        <div className="form-grid-2">

          <div>
            <label className="form-label">ID</label>
            <input className="form-input readonly" readOnly value={isEdit ? id : 'Auto-generated'} />
          </div>

          <div>
            <label className="form-label">Package Name <span style={{ color: 'var(--danger)' }}>*</span></label>
            <input className={`form-input${f('package_name')}`} value={form.package_name} onChange={set('package_name')} placeholder="Package name" />
            {errors.package_name && <p className="form-error">{errors.package_name}</p>}
          </div>

          <div>
            <label className="form-label">Duration (months) <span style={{ color: 'var(--danger)' }}>*</span></label>
            <input type="number" min="1" step="1" className={`form-input${f('duration_months')}`} value={form.duration_months} onChange={set('duration_months')} placeholder="e.g. 1, 3, 12" />
            {errors.duration_months && <p className="form-error">{errors.duration_months}</p>}
          </div>

          <div>
            <label className="form-label">Base Price (฿) <span style={{ color: 'var(--danger)' }}>*</span></label>
            <input type="number" min="0" step="0.01" className={`form-input${f('base_price')}`} value={form.base_price} onChange={set('base_price')} placeholder="0.00" />
            {errors.base_price && <p className="form-error">{errors.base_price}</p>}
          </div>

          <div style={{ gridColumn: '1 / -1' }}>
            <label className="form-label">Description</label>
            <textarea className="form-input" rows={2} value={form.description} onChange={set('description')} placeholder="Optional description" style={{ resize: 'vertical' }} />
          </div>

        </div>

        <hr className="divider" />
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
          <button type="button" className="btn btn-secondary" onClick={() => navigate('/packages')}>Cancel</button>
          <button type="button" className="btn btn-primary" onClick={handleSubmit} disabled={saving}>
            {saving ? 'Saving...' : 'Save Package'}
          </button>
        </div>
      </div>
    </div>
  );
}
