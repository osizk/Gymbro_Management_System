import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getEquipmentItemById } from '../../api/simpleFormsApi';

const fmtDate = (d) => d ? new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' }) : '—';
const STATUS_COLORS = {
  ACTIVE:      { bg: 'var(--green-100)',    color: 'var(--green-600)' },
  MAINTENANCE: { bg: '#fef3c7',             color: '#d97706' },
  RETIRED:     { bg: 'var(--gray-100)',     color: 'var(--gray-500)' },
};

export default function EquipmentItemView() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData]       = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);

  useEffect(() => {
    getEquipmentItemById(id).then((r) => setData(r.data.data)).catch(() => setError('Failed to load equipment.')).finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="state-box">Loading...</div>;
  if (error)   return <div className="state-box" style={{ color: 'var(--danger)' }}>{error}</div>;
  if (!data)   return null;

  const sc = STATUS_COLORS[data.status] || STATUS_COLORS.ACTIVE;

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Equipment</h1>
          <p className="page-subtitle">#{data.id} — {data.equipment_name}</p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button className="btn btn-secondary" onClick={() => navigate('/equipment-items')}>← Back</button>
          <button className="btn btn-secondary" onClick={() => navigate(`/equipment-items/${id}/edit`)}>Edit</button>
        </div>
      </div>

      <div className="card card-body">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          <p className="form-section-title" style={{ margin: 0 }}>Equipment Details</p>
          <span className="badge" style={{ background: sc.bg, color: sc.color, fontSize: 13 }}>{data.status}</span>
        </div>
        <div className="form-grid-2">
          <div><label className="form-label">ID</label><input className="form-input readonly" readOnly value={data.id} /></div>
          <div><label className="form-label">Equipment Name</label><input className="form-input readonly" readOnly value={data.equipment_name || '—'} /></div>
          <div><label className="form-label">Category</label><input className="form-input readonly" readOnly value={data.category_name || `#${data.category_id}`} /></div>
          <div><label className="form-label">Purchase Date</label><input className="form-input readonly" readOnly value={fmtDate(data.purchase_date)} /></div>
          <div><label className="form-label">Status</label><input className="form-input readonly" readOnly value={data.status || '—'} /></div>
        </div>
      </div>
    </div>
  );
}
