import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getTrainerById } from '../../api/simpleFormsApi';

const fmt = (n) => Number(n || 0).toLocaleString('th-TH', { minimumFractionDigits: 2 });

export default function TrainerView() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData]       = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);

  useEffect(() => {
    getTrainerById(id).then((r) => setData(r.data.data)).catch(() => setError('Failed to load trainer.')).finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="state-box">Loading...</div>;
  if (error)   return <div className="state-box" style={{ color: 'var(--danger)' }}>{error}</div>;
  if (!data)   return null;

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Trainer</h1>
          <p className="page-subtitle">#{data.id} — {data.trainer_name}</p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button className="btn btn-secondary" onClick={() => navigate('/trainers')}>← Back</button>
          <button className="btn btn-secondary" onClick={() => navigate(`/trainers/${id}/edit`)}>Edit</button>
        </div>
      </div>

      <div className="card card-body">
        <p className="form-section-title">Trainer Details</p>
        <div className="form-grid-2">
          <div><label className="form-label">ID</label><input className="form-input readonly" readOnly value={data.id} /></div>
          <div><label className="form-label">Trainer Name</label><input className="form-input readonly" readOnly value={data.trainer_name || '—'} /></div>
          <div><label className="form-label">Specialization</label><input className="form-input readonly" readOnly value={data.specialization || '—'} /></div>
          <div><label className="form-label">Phone</label><input className="form-input readonly" readOnly value={data.phone || '—'} /></div>
          <div><label className="form-label">Email</label><input className="form-input readonly" readOnly value={data.email || '—'} /></div>
          <div><label className="form-label">Commission Rate (%)</label><input className="form-input readonly" readOnly value={`${fmt(data.commission_rate)}%`} /></div>
        </div>
      </div>
    </div>
  );
}
