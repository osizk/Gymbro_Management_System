import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useToast } from '../../hooks/useToast';
import { getStaffById, createStaff, updateStaff } from '../../api/simpleFormsApi';

const empty = { staff_name: '', position: '', phone: '' };

export default function StaffForm() {
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
    getStaffById(id)
      .then((res) => { const d = res.data.data; setForm({ staff_name: d.staff_name || '', position: d.position || '', phone: d.phone || '' }); })
      .catch(() => showToast('Failed to load staff', 'error'))
      .finally(() => setLoadingPage(false));
  }, [id, isEdit]);

  const set = (field) => (e) => setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const validate = () => {
    const errs = {};
    if (!form.staff_name.trim()) errs.staff_name = 'Name is required';
    if (!form.phone.trim())      errs.phone      = 'Phone is required';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setSaving(true);
    try {
      const payload = { staff_name: form.staff_name, position: form.position || null, phone: form.phone };
      if (isEdit) { await updateStaff(id, payload); showToast('Staff updated successfully', 'success'); setTimeout(() => navigate(`/staff/${id}`), 1500); }
      else { const res = await createStaff(payload); showToast('Staff created successfully', 'success'); setTimeout(() => navigate(`/staff/${res.data.data.id}`), 1500); }
    } catch (err) { showToast(err.response?.data?.message || 'Failed to save staff', 'error'); }
    finally { setSaving(false); }
  };

  if (loadingPage) return <div className="state-box">Loading...</div>;
  const f = (field) => errors[field] ? ' error' : '';

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">{isEdit ? 'Edit Staff' : 'New Staff'}</h1>
          <p className="page-subtitle">Staff Member</p>
        </div>
      </div>

      <div className="card card-body">
        <p className="form-section-title">Staff Details</p>
        <div className="form-grid-2">

          <div>
            <label className="form-label">ID</label>
            <input className="form-input readonly" readOnly value={isEdit ? id : 'Auto-generated'} />
          </div>

          <div>
            <label className="form-label">Staff Name <span style={{ color: 'var(--danger)' }}>*</span></label>
            <input className={`form-input${f('staff_name')}`} value={form.staff_name} onChange={set('staff_name')} placeholder="Full name" />
            {errors.staff_name && <p className="form-error">{errors.staff_name}</p>}
          </div>

          <div>
            <label className="form-label">Position</label>
            <input className="form-input" value={form.position} onChange={set('position')} placeholder="e.g. Receptionist, Cleaner" />
          </div>

          <div>
            <label className="form-label">Phone <span style={{ color: 'var(--danger)' }}>*</span></label>
            <input className={`form-input${f('phone')}`} value={form.phone} onChange={set('phone')} placeholder="Phone number" />
            {errors.phone && <p className="form-error">{errors.phone}</p>}
          </div>

        </div>

        <hr className="divider" />
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
          <button type="button" className="btn btn-secondary" onClick={() => navigate('/staff')}>Cancel</button>
          <button type="button" className="btn btn-primary" onClick={handleSubmit} disabled={saving}>
            {saving ? 'Saving...' : 'Save Staff'}
          </button>
        </div>
      </div>
    </div>
  );
}
