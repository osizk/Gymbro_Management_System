import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useToast } from '../../hooks/useToast';
import { getClassById, createClass, updateClass } from '../../api/simpleFormsApi';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const empty = { class_name: '', schedule_day: 'Monday', start_time: '', end_time: '', max_capacity: '', class_price: '' };

export default function ClassForm() {
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
    getClassById(id)
      .then((res) => {
        const d = res.data.data;
        setForm({ class_name: d.class_name || '', schedule_day: d.schedule_day || 'Monday', start_time: d.start_time || '', end_time: d.end_time || '', max_capacity: String(d.max_capacity ?? ''), class_price: String(d.class_price ?? '') });
      })
      .catch(() => showToast('Failed to load class', 'error'))
      .finally(() => setLoadingPage(false));
  }, [id, isEdit]);

  const set = (field) => (e) => setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const validate = () => {
    const errs = {};
    if (!form.class_name.trim()) errs.class_name = 'Class name is required';
    if (!form.schedule_day)      errs.schedule_day = 'Day is required';
    if (!form.start_time)        errs.start_time  = 'Start time is required';
    if (!form.end_time)          errs.end_time    = 'End time is required';
    const cap = parseInt(form.max_capacity, 10);
    if (!form.max_capacity || isNaN(cap) || cap < 1) errs.max_capacity = 'Valid capacity is required';
    const price = parseFloat(form.class_price);
    if (form.class_price === '' || isNaN(price) || price < 0) errs.class_price = 'Valid price is required';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setSaving(true);
    try {
      const payload = { class_name: form.class_name, schedule_day: form.schedule_day, start_time: form.start_time, end_time: form.end_time, max_capacity: parseInt(form.max_capacity, 10), class_price: parseFloat(form.class_price) };
      if (isEdit) { await updateClass(id, payload); showToast('Class updated successfully', 'success'); setTimeout(() => navigate(`/classes/${id}`), 1500); }
      else { const res = await createClass(payload); showToast('Class created successfully', 'success'); setTimeout(() => navigate(`/classes/${res.data.data.id}`), 1500); }
    } catch (err) { showToast(err.response?.data?.message || 'Failed to save class', 'error'); }
    finally { setSaving(false); }
  };

  if (loadingPage) return <div className="state-box">Loading...</div>;
  const f = (field) => errors[field] ? ' error' : '';

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">{isEdit ? 'Edit Class' : 'New Class'}</h1>
          <p className="page-subtitle">Fitness Class</p>
        </div>
      </div>

      <div className="card card-body">
        <p className="form-section-title">Class Details</p>
        <div className="form-grid-2">

          <div>
            <label className="form-label">ID</label>
            <input className="form-input readonly" readOnly value={isEdit ? id : 'Auto-generated'} />
          </div>

          <div>
            <label className="form-label">Class Name <span style={{ color: 'var(--danger)' }}>*</span></label>
            <input className={`form-input${f('class_name')}`} value={form.class_name} onChange={set('class_name')} placeholder="e.g. Morning Yoga" />
            {errors.class_name && <p className="form-error">{errors.class_name}</p>}
          </div>

          <div>
            <label className="form-label">Schedule Day <span style={{ color: 'var(--danger)' }}>*</span></label>
            <select className={`form-input${f('schedule_day')}`} value={form.schedule_day} onChange={set('schedule_day')}>
              {DAYS.map((d) => <option key={d} value={d}>{d}</option>)}
            </select>
            {errors.schedule_day && <p className="form-error">{errors.schedule_day}</p>}
          </div>

          <div>
            <label className="form-label">Start Time <span style={{ color: 'var(--danger)' }}>*</span></label>
            <input type="time" className={`form-input${f('start_time')}`} value={form.start_time} onChange={set('start_time')} />
            {errors.start_time && <p className="form-error">{errors.start_time}</p>}
          </div>

          <div>
            <label className="form-label">End Time <span style={{ color: 'var(--danger)' }}>*</span></label>
            <input type="time" className={`form-input${f('end_time')}`} value={form.end_time} onChange={set('end_time')} />
            {errors.end_time && <p className="form-error">{errors.end_time}</p>}
          </div>

          <div>
            <label className="form-label">Max Capacity <span style={{ color: 'var(--danger)' }}>*</span></label>
            <input type="number" min="1" step="1" className={`form-input${f('max_capacity')}`} value={form.max_capacity} onChange={set('max_capacity')} placeholder="e.g. 20" />
            {errors.max_capacity && <p className="form-error">{errors.max_capacity}</p>}
          </div>

          <div>
            <label className="form-label">Class Price (฿) <span style={{ color: 'var(--danger)' }}>*</span></label>
            <input type="number" min="0" step="0.01" className={`form-input${f('class_price')}`} value={form.class_price} onChange={set('class_price')} placeholder="0.00" />
            {errors.class_price && <p className="form-error">{errors.class_price}</p>}
          </div>

        </div>

        <hr className="divider" />
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
          <button type="button" className="btn btn-secondary" onClick={() => navigate('/classes')}>Cancel</button>
          <button type="button" className="btn btn-primary" onClick={handleSubmit} disabled={saving}>
            {saving ? 'Saving...' : 'Save Class'}
          </button>
        </div>
      </div>
    </div>
  );
}
