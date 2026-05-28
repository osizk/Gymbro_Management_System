import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getPackageById } from '../../api/simpleFormsApi';

const fmt = (n) => Number(n || 0).toLocaleString('th-TH', { minimumFractionDigits: 2 });

export default function PackageView() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData]       = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);

  useEffect(() => {
    getPackageById(id).then((r) => setData(r.data.data)).catch(() => setError('Failed to load package.')).finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="state-box">Loading...</div>;
  if (error)   return <div className="state-box" style={{ color: 'var(--danger)' }}>{error}</div>;
  if (!data)   return null;

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Package</h1>
          <p className="page-subtitle">#{data.id} — {data.package_name}</p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button className="btn btn-secondary" onClick={() => navigate('/packages')}>← Back</button>
          <button className="btn btn-secondary" onClick={() => navigate(`/packages/${id}/edit`)}>Edit</button>
        </div>
      </div>

      <div className="card card-body">
        <p className="form-section-title">Package Details</p>
        <div className="form-grid-2">
          <div><label className="form-label">ID</label><input className="form-input readonly" readOnly value={data.id} /></div>
          <div><label className="form-label">Package Name</label><input className="form-input readonly" readOnly value={data.package_name || '—'} /></div>
          <div><label className="form-label">Duration (months)</label><input className="form-input readonly" readOnly value={data.duration_months ? `${data.duration_months} mo.` : '—'} /></div>
          <div><label className="form-label">Base Price (฿)</label><input className="form-input readonly" readOnly value={fmt(data.base_price)} /></div>
          <div style={{ gridColumn: '1 / -1' }}><label className="form-label">Description</label><textarea className="form-input readonly" readOnly rows={2} value={data.description || '—'} style={{ resize: 'none' }} /></div>
        </div>
      </div>
    </div>
  );
}
