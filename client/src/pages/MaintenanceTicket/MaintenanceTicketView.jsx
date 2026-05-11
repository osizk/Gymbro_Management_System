import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getTicketById } from '../../api/simpleFormsApi';

const fmtDate = (d) => d ? new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' }) : '—';
const fmt = (n) => n != null ? Number(n).toLocaleString('th-TH', { minimumFractionDigits: 2 }) : '—';
const STATUS_COLORS = {
  OPEN:        { bg: '#fef3c7',         color: '#d97706' },
  IN_PROGRESS: { bg: '#e0f2fe',         color: '#0284c7' },
  CLOSED:      { bg: 'var(--gray-100)', color: 'var(--gray-500)' },
};

export default function MaintenanceTicketView() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData]       = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);

  useEffect(() => {
    getTicketById(id).then((r) => setData(r.data.data)).catch(() => setError('Failed to load ticket.')).finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="state-box">Loading...</div>;
  if (error)   return <div className="state-box" style={{ color: 'var(--danger)' }}>{error}</div>;
  if (!data)   return null;

  const sc = STATUS_COLORS[data.status] || STATUS_COLORS.OPEN;

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Maintenance Ticket</h1>
          <p className="page-subtitle">{data.id}</p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button className="btn btn-secondary" onClick={() => navigate('/maintenance-tickets')}>← Back</button>
          <button className="btn btn-secondary" onClick={() => navigate(`/maintenance-tickets/${id}/edit`)}>Edit</button>
        </div>
      </div>

      <div className="card card-body">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          <p className="form-section-title" style={{ margin: 0 }}>Ticket Details</p>
          <span className="badge" style={{ background: sc.bg, color: sc.color, fontSize: 13 }}>{data.status?.replace('_', ' ')}</span>
        </div>
        <div className="form-grid-2">
          <div><label className="form-label">Ticket ID</label><input className="form-input readonly" readOnly value={data.id} /></div>
          <div><label className="form-label">Report Date</label><input className="form-input readonly" readOnly value={fmtDate(data.report_date)} /></div>
          <div><label className="form-label">Equipment</label><input className="form-input readonly" readOnly value={`#${data.equipment_id} ${data.equipment_name || ''}`} /></div>
          <div><label className="form-label">Technician</label><input className="form-input readonly" readOnly value={`#${data.technician_id} ${data.staff_name || ''}`} /></div>
          <div><label className="form-label">Status</label><input className="form-input readonly" readOnly value={data.status?.replace('_', ' ') || '—'} /></div>
          <div><label className="form-label">Repair Cost (฿)</label><input className="form-input readonly" readOnly value={fmt(data.repair_cost)} /></div>
          <div style={{ gridColumn: '1 / -1' }}><label className="form-label">Issue Description</label><textarea className="form-input readonly" readOnly rows={3} value={data.issue_description || '—'} style={{ resize: 'none' }} /></div>
        </div>
      </div>
    </div>
  );
}
