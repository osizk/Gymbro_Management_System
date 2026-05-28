import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getTrainingTypeById } from '../../api/simpleFormsApi';

const fmt = (n) => Number(n || 0).toLocaleString('th-TH', { minimumFractionDigits: 2 });

export default function TrainingTypeView() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData]       = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);

  useEffect(() => {
    getTrainingTypeById(id).then((r) => setData(r.data.data)).catch(() => setError('Failed to load training type.')).finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="state-box">Loading...</div>;
  if (error)   return <div className="state-box" style={{ color: 'var(--danger)' }}>{error}</div>;
  if (!data)   return null;

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Training Type</h1>
          <p className="page-subtitle">#{data.id} — {data.type_name}</p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button className="btn btn-secondary" onClick={() => navigate('/training-types')}>← Back</button>
          <button className="btn btn-secondary" onClick={() => navigate(`/training-types/${id}/edit`)}>Edit</button>
        </div>
      </div>

      <div className="card card-body">
        <p className="form-section-title">Training Type Details</p>
        <div className="form-grid-2">
          <div><label className="form-label">ID</label><input className="form-input readonly" readOnly value={data.id} /></div>
          <div><label className="form-label">Type Name</label><input className="form-input readonly" readOnly value={data.type_name || '—'} /></div>
          <div><label className="form-label">Default Hourly Rate (฿)</label><input className="form-input readonly" readOnly value={fmt(data.default_hourly_rate)} /></div>
        </div>
      </div>
    </div>
  );
}
