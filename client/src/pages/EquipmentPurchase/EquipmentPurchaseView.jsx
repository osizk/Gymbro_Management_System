import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getPurchaseById } from '../../api/equipmentPurchaseApi';

const fmt     = (n) => Number(n || 0).toLocaleString('th-TH', { minimumFractionDigits: 2 });
const fmtDate = (d) => d
  ? new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' })
  : '—';

export default function EquipmentPurchaseView() {
  const { id }   = useParams();
  const navigate = useNavigate();

  const [purchase, setPurchase] = useState(null);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState(null);

  useEffect(() => {
    setLoading(true);
    getPurchaseById(id)
      .then((res) => setPurchase(res.data.data))
      .catch(() => setError('Failed to load purchase.'))
      .finally(() => setLoading(false));
  }, [id]);

  const handlePrint = () => window.print();

  if (loading) return <div className="state-box">Loading...</div>;
  if (error)   return <div className="state-box" style={{ color: 'var(--danger)' }}>{error}</div>;
  if (!purchase) return null;

  return (
    <div>
      <div className="view-header-bar">
        <div>
          <h1 className="page-title">Equipment Purchase</h1>
          <p className="page-subtitle">Purchase Order</p>
        </div>
        <div className="view-actions">
          <button className="btn btn-secondary" onClick={() => navigate('/equipment')}>
            ← Back
          </button>
          <button className="btn btn-secondary" onClick={() => navigate(`/equipment/${id}/edit`)}>
            Edit
          </button>
          <button className="btn btn-primary" onClick={handlePrint}>
            🖨 Print / Save PDF
          </button>
        </div>
      </div>

      <div className="invoice-paper">

        <div className="invoice-top">
          <div className="invoice-brand">
            <img src="/logo.png" alt="GymBro" className="invoice-brand-logo" />
            <div>
              <div className="invoice-brand-name">GymBro</div>
              <div className="invoice-brand-sub">Management System</div>
              <div style={{ fontSize: 12, color: 'var(--gray-400)', marginTop: 6 }}>Bangkok, Thailand</div>
            </div>
          </div>

          <div className="invoice-meta">
            <div style={{ fontSize: 11, color: 'var(--gray-400)', textTransform: 'uppercase', letterSpacing: '0.6px', marginBottom: 4 }}>
              Equipment Purchase Order
            </div>
            <div className="invoice-id">{purchase.id}</div>
            <div className="invoice-date-label" style={{ marginTop: 10 }}>Purchase Date</div>
            <div className="invoice-date-value">{fmtDate(purchase.purchase_date)}</div>
            <div className="invoice-date-label" style={{ marginTop: 8 }}>Created At</div>
            <div className="invoice-date-value" style={{ fontSize: 12 }}>
              {new Date(purchase.created_at).toLocaleString('en-GB')}
            </div>
          </div>
        </div>

        <hr className="invoice-divider" />

        <div className="invoice-parties">
          <div>
            <div className="invoice-party-label">Supplier</div>
            <div className="invoice-party-name">{purchase.supplier_name}</div>
          </div>
          <div>
            <div className="invoice-party-label">Received By</div>
            <div className="invoice-party-name">{purchase.staff_name}</div>
            <div className="invoice-party-sub">via {purchase.method_name}</div>
          </div>
        </div>

        <hr className="invoice-divider" />

        <div className="invoice-table-wrap">
          <table className="invoice-table">
            <thead>
              <tr>
                <th style={{ width: 40 }}>#</th>
                <th>Equipment Name</th>
                <th>Category</th>
                <th style={{ textAlign: 'right' }}>Qty</th>
                <th style={{ textAlign: 'right' }}>Unit Cost (฿)</th>
                <th style={{ textAlign: 'right' }}>Warranty (mo.)</th>
                <th style={{ textAlign: 'right' }}>Extended Cost (฿)</th>
              </tr>
            </thead>
            <tbody>
              {purchase.line_items.map((line) => (
                <tr key={line.id}>
                  <td style={{ color: 'var(--gray-400)' }}>{line.line_no}</td>
                  <td style={{ fontWeight: 500, color: 'var(--gray-900)' }}>{line.equipment_name}</td>
                  <td>{line.category_name}</td>
                  <td style={{ textAlign: 'right' }}>{line.quantity}</td>
                  <td style={{ textAlign: 'right' }}>{fmt(line.unit_cost)}</td>
                  <td style={{ textAlign: 'right', color: 'var(--gray-500)' }}>
                    {line.warranty_months > 0 ? line.warranty_months : '—'}
                  </td>
                  <td style={{ textAlign: 'right', fontWeight: 600 }}>{fmt(line.extended_cost)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="invoice-total-row">
          <div className="invoice-total-box">
            <span className="invoice-total-label">Total Purchase Cost</span>
            <span className="invoice-total-amount">฿ {fmt(purchase.total_purchase_cost)}</span>
          </div>
        </div>

        <div className="invoice-footer">
          <p>This equipment purchase order was recorded by GymBro Management System.</p>
          <p style={{ marginTop: 4 }}>
            Generated on {new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' })}.
          </p>
        </div>
      </div>
    </div>
  );
}
