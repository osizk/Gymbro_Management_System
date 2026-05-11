import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getClassById } from '../../api/simpleFormsApi';

const fmt = (n) => Number(n || 0).toLocaleString('th-TH', { minimumFractionDigits: 2 });

export default function ClassView() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData]       = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);

  useEffect(() => {
    getClassById(id).then((r) => setData(r.data.data)).catch(() => setError('Failed to load class.')).finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="state-box">Loading...</div>;
  if (error)   return <div className="state-box" style={{ color: 'var(--danger)' }}>{error}</div>;
  if (!data)   return null;

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Class</h1>
          <p className="page-subtitle">#{data.id} — {data.class_name}</p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button className="btn btn-secondary" onClick={() => navigate('/classes')}>← Back</button>
          <button className="btn btn-secondary" onClick={() => navigate(`/classes/${id}/edit`)}>Edit</button>
        </div>
      </div>

      <div className="card card-body">
        <p className="form-section-title">Class Details</p>
        <div className="form-grid-2">
          <div><label className="form-label">ID</label><input className="form-input readonly" readOnly value={data.id} /></div>
          <div><label className="form-label">Class Name</label><input className="form-input readonly" readOnly value={data.class_name || '—'} /></div>
          <div><label className="form-label">Schedule Day</label><input className="form-input readonly" readOnly value={data.schedule_day || '—'} /></div>
          <div><label className="form-label">Time</label><input className="form-input readonly" readOnly value={`${data.start_time || '—'} – ${data.end_time || '—'}`} /></div>
          <div><label className="form-label">Max Capacity</label><input className="form-input readonly" readOnly value={data.max_capacity ?? '—'} /></div>
          <div><label className="form-label">Class Price (฿)</label><input className="form-input readonly" readOnly value={fmt(data.class_price)} /></div>
        </div>
      </div>
    </div>
  );
}
