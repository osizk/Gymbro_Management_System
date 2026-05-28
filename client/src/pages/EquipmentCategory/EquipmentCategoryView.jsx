import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getEquipmentCategoryById } from '../../api/simpleFormsApi';

export default function EquipmentCategoryView() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData]       = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);

  useEffect(() => {
    getEquipmentCategoryById(id).then((r) => setData(r.data.data)).catch(() => setError('Failed to load.')).finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="state-box">Loading...</div>;
  if (error)   return <div className="state-box" style={{ color: 'var(--danger)' }}>{error}</div>;
  if (!data)   return null;

  return (
    <div>
      <div className="page-header">
        <div><h1 className="page-title">Equipment Category</h1><p className="page-subtitle">#{data.id}</p></div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button className="btn btn-secondary" onClick={() => navigate('/equipment-categories')}>← Back</button>
          <button className="btn btn-secondary" onClick={() => navigate(`/equipment-categories/${id}/edit`)}>Edit</button>
        </div>
      </div>
      <div className="card card-body">
        <p className="form-section-title">Category Details</p>
        <div className="form-grid-2">
          <div><label className="form-label">ID</label><input className="form-input readonly" readOnly value={data.id} /></div>
          <div><label className="form-label">Category Name</label><input className="form-input readonly" readOnly value={data.category_name || '—'} /></div>
        </div>
      </div>
    </div>
  );
}
