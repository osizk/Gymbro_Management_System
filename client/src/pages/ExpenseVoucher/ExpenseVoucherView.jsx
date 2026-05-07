import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getVoucherById } from '../../api/expenseVoucherApi';

const fmt     = (n) => Number(n || 0).toLocaleString('th-TH', { minimumFractionDigits: 2 });
const fmtDate = (d) => d
  ? new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' })
  : '—';

export default function ExpenseVoucherView() {
  const { id }   = useParams();
  const navigate = useNavigate();

  const [voucher, setVoucher] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);

  useEffect(() => {
    setLoading(true);
    getVoucherById(id)
      .then((res) => setVoucher(res.data))
      .catch(() => setError('Failed to load voucher.'))
      .finally(() => setLoading(false));
  }, [id]);

  const handlePrint = () => window.print();

  if (loading) return <div className="state-box">Loading...</div>;
  if (error)   return <div className="state-box" style={{ color: 'var(--danger)' }}>{error}</div>;
  if (!voucher) return null;

  return (
    <div>
      {/* ── Top bar (hidden on print) ── */}
      <div className="view-header-bar">
        <div>
          <h1 className="page-title">Expense Voucher</h1>
          <p className="page-subtitle">Operational Expense</p>
        </div>
        <div className="view-actions">
          <button className="btn btn-secondary" onClick={() => navigate('/expenses')}>
            ← Back
          </button>
          <button className="btn btn-secondary" onClick={() => navigate(`/expenses/${id}/edit`)}>
            Edit
          </button>
          <button className="btn btn-primary" onClick={handlePrint}>
            🖨 Print / Save PDF
          </button>
        </div>
      </div>

      {/* ── Voucher paper ── */}
      <div className="invoice-paper">

        {/* Brand + Meta */}
        <div className="invoice-top">
          <div className="invoice-brand">
            <img src="/logo.png" alt="GymBro" className="invoice-brand-logo" />
            <div>
              <div className="invoice-brand-name">GymBro</div>
              <div className="invoice-brand-sub">Management System</div>
              <div style={{ fontSize: 12, color: 'var(--gray-400)', marginTop: 6 }}>
                Bangkok, Thailand
              </div>
            </div>
          </div>

          <div className="invoice-meta">
            <div style={{ fontSize: 11, color: 'var(--gray-400)', textTransform: 'uppercase', letterSpacing: '0.6px', marginBottom: 4 }}>
              Expense Voucher
            </div>
            <div className="invoice-id">{voucher.id}</div>
            <div className="invoice-date-label" style={{ marginTop: 10 }}>Voucher Date</div>
            <div className="invoice-date-value">{fmtDate(voucher.voucher_date)}</div>
            <div className="invoice-date-label" style={{ marginTop: 8 }}>Created At</div>
            <div className="invoice-date-value" style={{ fontSize: 12 }}>
              {new Date(voucher.created_at).toLocaleString('en-GB')}
            </div>
          </div>
        </div>

        <hr className="invoice-divider" />

        {/* Voucher parties / info */}
        <div className="invoice-parties">
          <div>
            <div className="invoice-party-label">Vendor</div>
            <div className="invoice-party-name">{voucher.vendor_name}</div>
          </div>
          <div>
            <div className="invoice-party-label">Paid By</div>
            <div className="invoice-party-name">{voucher.staff_name}</div>
            <div className="invoice-party-sub">via {voucher.method_name}</div>
          </div>
        </div>

        <hr className="invoice-divider" />

        {/* Line items table */}
        <div className="invoice-table-wrap">
          <table className="invoice-table">
            <thead>
              <tr>
                <th style={{ width: 40 }}>#</th>
                <th>Expense Category</th>
                <th style={{ textAlign: 'right' }}>Amount (฿)</th>
                <th>Description</th>
              </tr>
            </thead>
            <tbody>
              {voucher.line_items.map((line) => (
                <tr key={line.id}>
                  <td style={{ color: 'var(--gray-400)' }}>{line.line_no}</td>
                  <td>
                    <div style={{ fontWeight: 500, color: 'var(--gray-900)' }}>{line.category_name}</div>
                  </td>
                  <td style={{ textAlign: 'right', fontWeight: 600 }}>{fmt(line.amount)}</td>
                  <td style={{ color: 'var(--gray-600)' }}>{line.description}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Total */}
        <div className="invoice-total-row">
          <div className="invoice-total-box">
            <span className="invoice-total-label">Total Expense</span>
            <span className="invoice-total-amount">฿ {fmt(voucher.total_expense)}</span>
          </div>
        </div>

        {/* Footer */}
        <div className="invoice-footer">
          <p>This expense voucher was recorded by GymBro Management System.</p>
          <p style={{ marginTop: 4 }}>
            Generated on {new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' })}.
          </p>
        </div>
      </div>
    </div>
  );
}
