import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getClassBookingById } from '../../api/simpleFormsApi';

const fmtDate = (d) => d ? new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' }) : '—';
const STATUS_COLORS = {
  CONFIRMED: { bg: 'var(--green-100)',    color: 'var(--green-600)' },
  CANCELLED: { bg: 'var(--danger-light)', color: 'var(--danger)' },
  ATTENDED:  { bg: '#e0f2fe',             color: '#0284c7' },
};

export default function ClassBookingView() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData]       = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);

  useEffect(() => {
    getClassBookingById(id).then((r) => setData(r.data.data)).catch(() => setError('Failed to load booking.')).finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="state-box">Loading...</div>;
  if (error)   return <div className="state-box" style={{ color: 'var(--danger)' }}>{error}</div>;
  if (!data)   return null;

  const sc = STATUS_COLORS[data.status] || STATUS_COLORS.CONFIRMED;

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Class Booking</h1>
          <p className="page-subtitle">#{data.id}</p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button className="btn btn-secondary" onClick={() => navigate('/class-bookings')}>← Back</button>
          <button className="btn btn-secondary" onClick={() => navigate(`/class-bookings/${id}/edit`)}>Edit</button>
        </div>
      </div>

      <div className="card card-body">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          <p className="form-section-title" style={{ margin: 0 }}>Booking Details</p>
          <span className="badge" style={{ background: sc.bg, color: sc.color, fontSize: 13 }}>{data.status}</span>
        </div>
        <div className="form-grid-2">
          <div><label className="form-label">ID</label><input className="form-input readonly" readOnly value={data.id} /></div>
          <div><label className="form-label">Booking Date</label><input className="form-input readonly" readOnly value={fmtDate(data.booking_date)} /></div>
          <div><label className="form-label">Class</label><input className="form-input readonly" readOnly value={`#${data.class_id} ${data.class_name || ''}`} /></div>
          <div><label className="form-label">Member</label><input className="form-input readonly" readOnly value={`#${data.member_id} ${data.member_name || ''}`} /></div>
          <div><label className="form-label">Status</label><input className="form-input readonly" readOnly value={data.status || '—'} /></div>
          <div><label className="form-label">Check-in Time</label><input className="form-input readonly" readOnly value={data.check_in_time || '—'} /></div>
        </div>
      </div>
    </div>
  );
}
