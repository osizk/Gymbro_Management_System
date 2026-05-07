import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getReceiptById } from '../../api/paymentReceiptApi';

const fmt     = (n) => Number(n || 0).toLocaleString('th-TH', { minimumFractionDigits: 2 });
const fmtDate = (d) => d
  ? new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' })
  : '—';

export default function PaymentReceiptView() {
  const { id }   = useParams();
  const navigate = useNavigate();

  const [receipt, setReceipt] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);

  useEffect(() => {
    setLoading(true);
    getReceiptById(id)
      .then((res) => setReceipt(res.data.data))
      .catch(() => setError('Failed to load receipt.'))
      .finally(() => setLoading(false));
  }, [id]);

  const handlePrint = () => window.print();

  if (loading) return <div className="state-box">Loading...</div>;
  if (error)   return <div className="state-box" style={{ color: 'var(--danger)' }}>{error}</div>;
  if (!receipt) return null;

  return (
    <div>
      <div className="view-header-bar">
        <div>
          <h1 className="page-title">Payment Receipt</h1>
          <p className="page-subtitle">Payment Record</p>
        </div>
        <div className="view-actions">
          <button className="btn btn-secondary" onClick={() => navigate('/payment-receipts')}>
            ← Back
          </button>
          <button className="btn btn-secondary" onClick={() => navigate(`/payment-receipts/${id}/edit`)}>
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
              Payment Receipt
            </div>
            <div className="invoice-id">{receipt.id}</div>
            <div className="invoice-date-label" style={{ marginTop: 10 }}>Receipt Date</div>
            <div className="invoice-date-value">{fmtDate(receipt.receipt_date)}</div>
            <div className="invoice-date-label" style={{ marginTop: 8 }}>Created At</div>
            <div className="invoice-date-value" style={{ fontSize: 12 }}>
              {new Date(receipt.created_at).toLocaleString('en-GB')}
            </div>
          </div>
        </div>

        <hr className="invoice-divider" />

        <div className="invoice-parties">
          <div>
            <div className="invoice-party-label">Member</div>
            <div className="invoice-party-name">
              <span style={{ fontSize: 13, color: 'var(--gray-400)', marginRight: 6 }}>#{receipt.member_id}</span>
              {receipt.member_name}
            </div>
          </div>
          <div>
            <div className="invoice-party-label">Payment Method</div>
            <div className="invoice-party-name">{receipt.method_name}</div>
            {receipt.payment_reference_no && (
              <div className="invoice-party-sub">Ref: {receipt.payment_reference_no}</div>
            )}
          </div>
        </div>

        <hr className="invoice-divider" />

        <div className="invoice-table-wrap">
          <table className="invoice-table">
            <thead>
              <tr>
                <th style={{ width: 40 }}>#</th>
                <th style={{ width: 160 }}>Reference Type</th>
                <th>Reference No</th>
                <th style={{ textAlign: 'right' }}>Amount Paid (฿)</th>
                <th style={{ textAlign: 'right' }}>Remaining (฿)</th>
                <th>Notes</th>
              </tr>
            </thead>
            <tbody>
              {receipt.line_items.map((line) => (
                <tr key={line.id}>
                  <td style={{ color: 'var(--gray-400)' }}>{line.line_no}</td>
                  <td>
                    <span className="badge badge-gray" style={{ fontSize: 11 }}>{line.reference_type}</span>
                  </td>
                  <td style={{ fontWeight: 500, color: 'var(--gray-900)' }}>{line.reference_no}</td>
                  <td style={{ textAlign: 'right', fontWeight: 600 }}>{fmt(line.amount_paid)}</td>
                  <td style={{ textAlign: 'right', color: 'var(--gray-500)' }}>
                    {line.remaining_balance != null ? fmt(line.remaining_balance) : '—'}
                  </td>
                  <td style={{ color: 'var(--gray-500)', fontSize: 12 }}>{line.notes || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="invoice-total-row">
          <div className="invoice-total-box">
            <span className="invoice-total-label">Total Paid</span>
            <span className="invoice-total-amount">฿ {fmt(receipt.total_paid)}</span>
          </div>
        </div>

        <div className="invoice-footer">
          <p>This payment receipt was recorded by GymBro Management System.</p>
          <p style={{ marginTop: 4 }}>
            Generated on {new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' })}.
          </p>
        </div>
      </div>
    </div>
  );
}
