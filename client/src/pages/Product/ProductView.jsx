import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getProductById } from '../../api/simpleFormsApi';

const fmt = (n) => Number(n || 0).toLocaleString('th-TH', { minimumFractionDigits: 2 });
const STATUS_COLORS = {
  ACTIVE:   { bg: 'var(--green-100)', color: 'var(--green-600)' },
  INACTIVE: { bg: 'var(--gray-100)',  color: 'var(--gray-500)' },
};

export default function ProductView() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData]       = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);

  useEffect(() => {
    getProductById(id).then((r) => setData(r.data.data)).catch(() => setError('Failed to load product.')).finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="state-box">Loading...</div>;
  if (error)   return <div className="state-box" style={{ color: 'var(--danger)' }}>{error}</div>;
  if (!data)   return null;

  const sc = STATUS_COLORS[data.status] || STATUS_COLORS.INACTIVE;

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Product</h1>
          <p className="page-subtitle">#{data.id} — {data.product_name}</p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button className="btn btn-secondary" onClick={() => navigate('/products')}>← Back</button>
          <button className="btn btn-secondary" onClick={() => navigate(`/products/${id}/edit`)}>Edit</button>
        </div>
      </div>

      <div className="card card-body">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          <p className="form-section-title" style={{ margin: 0 }}>Product Details</p>
          <span className="badge" style={{ background: sc.bg, color: sc.color, fontSize: 13 }}>{data.status}</span>
        </div>
        <div className="form-grid-2">
          <div><label className="form-label">ID</label><input className="form-input readonly" readOnly value={data.id} /></div>
          <div><label className="form-label">Product Name</label><input className="form-input readonly" readOnly value={data.product_name || '—'} /></div>
          <div><label className="form-label">Category</label><input className="form-input readonly" readOnly value={data.category_name || `#${data.category_id}`} /></div>
          <div><label className="form-label">Cost Price (฿)</label><input className="form-input readonly" readOnly value={fmt(data.cost_price)} /></div>
          <div><label className="form-label">Selling Price (฿)</label><input className="form-input readonly" readOnly value={fmt(data.selling_price)} /></div>
          <div><label className="form-label">Stock Quantity</label><input className="form-input readonly" readOnly value={data.stock_quantity ?? '—'} /></div>
          <div><label className="form-label">Status</label><input className="form-input readonly" readOnly value={data.status || '—'} /></div>
        </div>
      </div>
    </div>
  );
}
