import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getMemberById } from '../../api/simpleFormsApi';

const fmtDate = (d) => d ? new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' }) : '—';
const STATUS_COLORS = {
  ACTIVE:   { bg: 'var(--green-100)', color: 'var(--green-600)' },
  INACTIVE: { bg: 'var(--gray-100)',  color: 'var(--gray-500)' },
};

export default function MemberView() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData]       = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);

  useEffect(() => {
    getMemberById(id).then((r) => setData(r.data.data)).catch(() => setError('Failed to load member.')).finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="state-box">Loading...</div>;
  if (error)   return <div className="state-box" style={{ color: 'var(--danger)' }}>{error}</div>;
  if (!data)   return null;

  const sc = STATUS_COLORS[data.status] || STATUS_COLORS.INACTIVE;

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Member</h1>
          <p className="page-subtitle">#{data.id} — {data.member_name}</p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button className="btn btn-secondary" onClick={() => navigate('/members')}>← Back</button>
          <button className="btn btn-secondary" onClick={() => navigate(`/members/${id}/edit`)}>Edit</button>
        </div>
      </div>

      <div className="card card-body">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          <p className="form-section-title" style={{ margin: 0 }}>Member Details</p>
          <span className="badge" style={{ background: sc.bg, color: sc.color, fontSize: 13 }}>{data.status}</span>
        </div>
        <div className="form-grid-2">
          <div><label className="form-label">ID</label><input className="form-input readonly" readOnly value={data.id} /></div>
          <div><label className="form-label">Member Name</label><input className="form-input readonly" readOnly value={data.member_name || '—'} /></div>
          <div><label className="form-label">Gender</label><input className="form-input readonly" readOnly value={data.gender === 'M' ? 'Male' : data.gender === 'F' ? 'Female' : '—'} /></div>
          <div><label className="form-label">Date of Birth</label><input className="form-input readonly" readOnly value={fmtDate(data.date_of_birth)} /></div>
          <div><label className="form-label">Phone</label><input className="form-input readonly" readOnly value={data.phone || '—'} /></div>
          <div><label className="form-label">Email</label><input className="form-input readonly" readOnly value={data.email || '—'} /></div>
          <div style={{ gridColumn: '1 / -1' }}><label className="form-label">Address</label><textarea className="form-input readonly" readOnly rows={2} value={data.address || '—'} style={{ resize: 'none' }} /></div>
          <div><label className="form-label">Join Date</label><input className="form-input readonly" readOnly value={fmtDate(data.join_date)} /></div>
          <div><label className="form-label">Status</label><input className="form-input readonly" readOnly value={data.status || '—'} /></div>
        </div>
      </div>
    </div>
  );
}
