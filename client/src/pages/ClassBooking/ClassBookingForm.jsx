import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useToast } from '../../hooks/useToast';
import {
  getClassBookingById, createClassBooking, updateClassBooking,
  getClassesForBooking, getMembersForBooking,
} from '../../api/simpleFormsApi';

const STATUS_OPTIONS = ['BOOKED', 'CANCELLED', 'ATTENDED'];
const empty = { class_id: '', member_id: '', booking_date: new Date().toISOString().split('T')[0], status: 'BOOKED', check_in_time: '' };

export default function ClassBookingForm() {
  const { id }   = useParams();
  const isEdit   = Boolean(id);
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [form, setForm]         = useState(empty);
  const [classes, setClasses]   = useState([]);
  const [members, setMembers]   = useState([]);
  const [loadingPage, setLoadingPage] = useState(isEdit);
  const [saving, setSaving]     = useState(false);
  const [errors, setErrors]     = useState({});

  useEffect(() => {
    getClassesForBooking().then((r) => setClasses(r.data.data || [])).catch(() => setClasses([]));
    getMembersForBooking().then((r) => setMembers(r.data.data || [])).catch(() => setMembers([]));
  }, []);

  useEffect(() => {
    if (!isEdit) return;
    setLoadingPage(true);
    getClassBookingById(id)
      .then((res) => {
        const d = res.data.data;
        setForm({ class_id: String(d.class_id), member_id: String(d.member_id), booking_date: d.booking_date?.split('T')[0] || '', status: d.status || 'CONFIRMED', check_in_time: d.check_in_time || '' });
      })
      .catch(() => showToast('Failed to load booking', 'error'))
      .finally(() => setLoadingPage(false));
  }, [id, isEdit]);

  const set = (field) => (e) => setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const validate = () => {
    const errs = {};
    if (!form.class_id)   errs.class_id   = 'Class is required';
    if (!form.member_id)  errs.member_id  = 'Member is required';
    if (!form.booking_date) errs.booking_date = 'Booking date is required';
    if (!form.status)     errs.status     = 'Status is required';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setSaving(true);
    try {
      const payload = { class_id: form.class_id, member_id: Number(form.member_id), booking_date: form.booking_date, status: form.status, check_in_time: form.check_in_time || null };
      if (isEdit) { await updateClassBooking(id, payload); showToast('Class booking updated successfully', 'success'); setTimeout(() => navigate(`/class-bookings/${id}`), 1500); }
      else { const res = await createClassBooking(payload); showToast('Class booking created successfully', 'success'); setTimeout(() => navigate(`/class-bookings/${res.data.data.id}`), 1500); }
    } catch (err) { showToast(err.response?.data?.message || 'Failed to save booking', 'error'); }
    finally { setSaving(false); }
  };

  if (loadingPage) return <div className="state-box">Loading...</div>;
  const f = (field) => errors[field] ? ' error' : '';

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">{isEdit ? 'Edit Class Booking' : 'New Class Booking'}</h1>
          <p className="page-subtitle">Class Booking</p>
        </div>
      </div>

      <div className="card card-body">
        <p className="form-section-title">Booking Details</p>
        <div className="form-grid-2">

          <div>
            <label className="form-label">ID</label>
            <input className="form-input readonly" readOnly value={isEdit ? id : 'Auto-generated'} />
          </div>

          <div>
            <label className="form-label">Booking Date <span style={{ color: 'var(--danger)' }}>*</span></label>
            <input type="date" className={`form-input${f('booking_date')}`} value={form.booking_date} onChange={set('booking_date')} />
            {errors.booking_date && <p className="form-error">{errors.booking_date}</p>}
          </div>

          <div>
            <label className="form-label">Class <span style={{ color: 'var(--danger)' }}>*</span></label>
            <select className={`form-input${f('class_id')}`} value={form.class_id} onChange={set('class_id')}>
              <option value="">— Select Class —</option>
              {classes.map((c) => <option key={c.id} value={String(c.id)}>{c.class_name} ({c.schedule_day})</option>)}
            </select>
            {errors.class_id && <p className="form-error">{errors.class_id}</p>}
          </div>

          <div>
            <label className="form-label">Member <span style={{ color: 'var(--danger)' }}>*</span></label>
            <select className={`form-input${f('member_id')}`} value={form.member_id} onChange={set('member_id')}>
              <option value="">— Select Member —</option>
              {members.map((m) => <option key={m.id} value={String(m.id)}>#{m.id} {m.member_name}</option>)}
            </select>
            {errors.member_id && <p className="form-error">{errors.member_id}</p>}
          </div>

          <div>
            <label className="form-label">Status <span style={{ color: 'var(--danger)' }}>*</span></label>
            <select className={`form-input${f('status')}`} value={form.status} onChange={set('status')}>
              {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
            {errors.status && <p className="form-error">{errors.status}</p>}
          </div>

          <div>
            <label className="form-label">Check-in Time</label>
            <input type="time" className="form-input" value={form.check_in_time} onChange={set('check_in_time')} />
          </div>

        </div>

        <hr className="divider" />
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
          <button type="button" className="btn btn-secondary" onClick={() => navigate('/class-bookings')}>Cancel</button>
          <button type="button" className="btn btn-primary" onClick={handleSubmit} disabled={saving}>
            {saving ? 'Saving...' : 'Save Booking'}
          </button>
        </div>
      </div>
    </div>
  );
}
