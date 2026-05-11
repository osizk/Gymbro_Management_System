import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getTrainerById, createTrainer, updateTrainer } from '../../api/simpleFormsApi';

const empty = { trainer_name: '', specialization: '', phone: '', email: '', commission_rate: '' };

export default function TrainerForm() {
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
    getTrainerById(id)
      .then((res) => {
        const d = res.data.data;
        setForm({ trainer_name: d.trainer_name || '', specialization: d.specialization || '', phone: d.phone || '', email: d.email || '', commission_rate: String(d.commission_rate ?? '') });
      })
      .catch(() => alert('Failed to load trainer'))
      .finally(() => setLoadingPage(false));
  }, [id, isEdit]);

  const set = (field) => (e) => setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const validate = () => {
    const errs = {};
    if (!form.trainer_name.trim()) errs.trainer_name   = 'Name is required';
    if (!form.phone.trim())        errs.phone          = 'Phone is required';
    const rate = parseFloat(form.commission_rate);
    if (form.commission_rate === '' || isNaN(rate)) errs.commission_rate = 'Commission rate is required';
    else if (rate < 0 || rate > 100) errs.commission_rate = '0–100';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setSaving(true);
    try {
      const payload = { trainer_name: form.trainer_name, specialization: form.specialization || null, phone: form.phone, email: form.email || null, commission_rate: parseFloat(form.commission_rate) };
      if (isEdit) { await updateTrainer(id, payload); navigate(`/trainers/${id}`); }
      else { const res = await createTrainer(payload); navigate(`/trainers/${res.data.data.id}`); }
    } catch (err) { alert(err.response?.data?.message || 'Failed to save trainer'); }
    finally { setSaving(false); }
  };

  if (loadingPage) return <div className="state-box">Loading...</div>;
  const f = (field) => errors[field] ? ' error' : '';

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">{isEdit ? 'Edit Trainer' : 'New Trainer'}</h1>
          <p className="page-subtitle">Trainer Profile</p>
        </div>
      </div>

      <div className="card card-body">
        <p className="form-section-title">Trainer Details</p>
        <div className="form-grid-2">

          <div>
            <label className="form-label">ID</label>
            <input className="form-input readonly" readOnly value={isEdit ? id : 'Auto-generated'} />
          </div>

          <div>
            <label className="form-label">Trainer Name <span style={{ color: 'var(--danger)' }}>*</span></label>
            <input className={`form-input${f('trainer_name')}`} value={form.trainer_name} onChange={set('trainer_name')} placeholder="Full name" />
            {errors.trainer_name && <p className="form-error">{errors.trainer_name}</p>}
          </div>

          <div>
            <label className="form-label">Specialization</label>
            <input className="form-input" value={form.specialization} onChange={set('specialization')} placeholder="e.g. Yoga, Strength Training" />
          </div>

          <div>
            <label className="form-label">Phone <span style={{ color: 'var(--danger)' }}>*</span></label>
            <input className={`form-input${f('phone')}`} value={form.phone} onChange={set('phone')} placeholder="Phone number" />
            {errors.phone && <p className="form-error">{errors.phone}</p>}
          </div>

          <div>
            <label className="form-label">Email</label>
            <input type="email" className="form-input" value={form.email} onChange={set('email')} placeholder="Email address" />
          </div>

          <div>
            <label className="form-label">Commission Rate (%) <span style={{ color: 'var(--danger)' }}>*</span></label>
            <input type="number" min="0" max="100" step="0.01" className={`form-input${f('commission_rate')}`} value={form.commission_rate} onChange={set('commission_rate')} placeholder="0–100" />
            {errors.commission_rate && <p className="form-error">{errors.commission_rate}</p>}
          </div>

        </div>

        <hr className="divider" />
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
          <button type="button" className="btn btn-secondary" onClick={() => navigate('/trainers')}>Cancel</button>
          <button type="button" className="btn btn-primary" onClick={handleSubmit} disabled={saving}>
            {saving ? 'Saving...' : 'Save Trainer'}
          </button>
        </div>
      </div>
    </div>
  );
}
