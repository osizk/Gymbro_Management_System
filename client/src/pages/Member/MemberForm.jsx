import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useToast } from '../../hooks/useToast';
import { getMemberById, createMember, updateMember } from '../../api/simpleFormsApi';

const GENDER_OPTIONS = ['MALE', 'FEMALE', 'OTHER'];
const STATUS_OPTIONS = ['ACTIVE', 'EXPIRED', 'CANCELLED'];

const empty = { member_name: '', gender: 'MALE', date_of_birth: '', phone: '', email: '', address: '', join_date: new Date().toISOString().split('T')[0], status: 'ACTIVE' };

export default function MemberForm() {
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
    getMemberById(id)
      .then((res) => {
        const d = res.data.data;
        setForm({
          member_name: d.member_name || '',
          gender:      d.gender || 'MALE',
          date_of_birth: d.date_of_birth?.split('T')[0] || '',
          phone:       d.phone || '',
          email:       d.email || '',
          address:     d.address || '',
          join_date:   d.join_date?.split('T')[0] || '',
          status:      d.status || 'ACTIVE',
        });
      })
      .catch(() => showToast('Failed to load member', 'error'))
      .finally(() => setLoadingPage(false));
  }, [id, isEdit]);

  const set = (field) => (e) => setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const validate = () => {
    const errs = {};
    if (!form.member_name.trim()) errs.member_name = 'Name is required';
    if (!form.gender)             errs.gender      = 'Gender is required';
    if (!form.phone.trim())       errs.phone       = 'Phone is required';
    if (!form.join_date)          errs.join_date   = 'Join date is required';
    if (!form.status)             errs.status      = 'Status is required';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setSaving(true);
    try {
      const payload = {
        member_name:    form.member_name,
        gender:         form.gender,
        date_of_birth:  form.date_of_birth || null,
        phone:          form.phone,
        email:          form.email || null,
        address:        form.address || null,
        join_date:      form.join_date,
        status:         form.status,
      };
      if (isEdit) {
        await updateMember(id, payload);
        showToast('Member updated successfully', 'success');
        setTimeout(() => navigate(`/members/${id}`), 1500);
      } else {
        const res = await createMember(payload);
        showToast('Member created successfully', 'success');
        setTimeout(() => navigate(`/members/${res.data.id}`), 1500);
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to save member', 'error');
    } finally {
      setSaving(false);
    }
  };

  if (loadingPage) return <div className="state-box">Loading...</div>;

  const f = (field) => errors[field] ? ' error' : '';

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">{isEdit ? 'Edit Member' : 'New Member'}</h1>
          <p className="page-subtitle">Member Profile</p>
        </div>
      </div>

      <div className="card card-body">
        <p className="form-section-title">Member Details</p>
        <div className="form-grid-2">

          <div>
            <label className="form-label">ID</label>
            <input className="form-input readonly" readOnly value={isEdit ? id : 'Auto-generated'} />
          </div>

          <div>
            <label className="form-label">Member Name <span style={{ color: 'var(--danger)' }}>*</span></label>
            <input className={`form-input${f('member_name')}`} value={form.member_name} onChange={set('member_name')} placeholder="Full name" />
            {errors.member_name && <p className="form-error">{errors.member_name}</p>}
          </div>

          <div>
            <label className="form-label">Gender <span style={{ color: 'var(--danger)' }}>*</span></label>
            <select className={`form-input${f('gender')}`} value={form.gender} onChange={set('gender')}>
              {GENDER_OPTIONS.map((g) => <option key={g} value={g}>{g === 'MALE' ? 'Male' : g === 'FEMALE' ? 'Female' : 'Other'}</option>)}
            </select>
            {errors.gender && <p className="form-error">{errors.gender}</p>}
          </div>

          <div>
            <label className="form-label">Date of Birth</label>
            <input type="date" className="form-input" value={form.date_of_birth} onChange={set('date_of_birth')} />
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

          <div style={{ gridColumn: '1 / -1' }}>
            <label className="form-label">Address</label>
            <textarea className="form-input" rows={2} value={form.address} onChange={set('address')} placeholder="Address" style={{ resize: 'vertical' }} />
          </div>

          <div>
            <label className="form-label">Join Date <span style={{ color: 'var(--danger)' }}>*</span></label>
            <input type="date" className={`form-input${f('join_date')}`} value={form.join_date} onChange={set('join_date')} />
            {errors.join_date && <p className="form-error">{errors.join_date}</p>}
          </div>

          <div>
            <label className="form-label">Status <span style={{ color: 'var(--danger)' }}>*</span></label>
            <select className={`form-input${f('status')}`} value={form.status} onChange={set('status')}>
              {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
            {errors.status && <p className="form-error">{errors.status}</p>}
          </div>

        </div>

        <hr className="divider" />
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
          <button type="button" className="btn btn-secondary" onClick={() => navigate('/members')}>Cancel</button>
          <button type="button" className="btn btn-primary" onClick={handleSubmit} disabled={saving}>
            {saving ? 'Saving...' : 'Save Member'}
          </button>
        </div>
      </div>
    </div>
  );
}
