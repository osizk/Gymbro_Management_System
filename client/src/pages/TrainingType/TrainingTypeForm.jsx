import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getTrainingTypeById, createTrainingType, updateTrainingType } from '../../api/simpleFormsApi';

const empty = { type_name: '', default_hourly_rate: '' };

export default function TrainingTypeForm() {
  const { id }   = useParams();
  const isEdit   = Boolean(id);
  const navigate = useNavigate();

  const [form, setForm]         = useState(empty);
  const [loadingPage, setLoadingPage] = useState(isEdit);
  const [saving, setSaving]     = useState(false);
  const [errors, setErrors]     = useState({});

  useEffect(() => {
    if (!isEdit) return;
    setLoadingPage(true);
    getTrainingTypeById(id)
      .then((res) => { const d = res.data.data; setForm({ type_name: d.type_name || '', default_hourly_rate: String(d.default_hourly_rate ?? '') }); })
      .catch(() => alert('Failed to load training type'))
      .finally(() => setLoadingPage(false));
  }, [id, isEdit]);

  const set = (field) => (e) => setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const validate = () => {
    const errs = {};
    if (!form.type_name.trim()) errs.type_name = 'Type name is required';
    const rate = parseFloat(form.default_hourly_rate);
    if (form.default_hourly_rate === '' || isNaN(rate) || rate < 0) errs.default_hourly_rate = 'Valid hourly rate is required';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setSaving(true);
    try {
      const payload = { type_name: form.type_name, default_hourly_rate: parseFloat(form.default_hourly_rate) };
      if (isEdit) { await updateTrainingType(id, payload); navigate(`/training-types/${id}`); }
      else { const res = await createTrainingType(payload); navigate(`/training-types/${res.data.data.id}`); }
    } catch (err) { alert(err.response?.data?.message || 'Failed to save training type'); }
    finally { setSaving(false); }
  };

  if (loadingPage) return <div className="state-box">Loading...</div>;
  const f = (field) => errors[field] ? ' error' : '';

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">{isEdit ? 'Edit Training Type' : 'New Training Type'}</h1>
          <p className="page-subtitle">Training Type</p>
        </div>
      </div>

      <div className="card card-body">
        <p className="form-section-title">Training Type Details</p>
        <div className="form-grid-2">

          <div>
            <label className="form-label">ID</label>
            <input className="form-input readonly" readOnly value={isEdit ? id : 'Auto-generated'} />
          </div>

          <div>
            <label className="form-label">Type Name <span style={{ color: 'var(--danger)' }}>*</span></label>
            <input className={`form-input${f('type_name')}`} value={form.type_name} onChange={set('type_name')} placeholder="e.g. Personal Training, Group Yoga" />
            {errors.type_name && <p className="form-error">{errors.type_name}</p>}
          </div>

          <div>
            <label className="form-label">Default Hourly Rate (฿) <span style={{ color: 'var(--danger)' }}>*</span></label>
            <input type="number" min="0" step="0.01" className={`form-input${f('default_hourly_rate')}`} value={form.default_hourly_rate} onChange={set('default_hourly_rate')} placeholder="0.00" />
            {errors.default_hourly_rate && <p className="form-error">{errors.default_hourly_rate}</p>}
          </div>

        </div>

        <hr className="divider" />
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
          <button type="button" className="btn btn-secondary" onClick={() => navigate('/training-types')}>Cancel</button>
          <button type="button" className="btn btn-primary" onClick={handleSubmit} disabled={saving}>
            {saving ? 'Saving...' : 'Save Training Type'}
          </button>
        </div>
      </div>
    </div>
  );
}
