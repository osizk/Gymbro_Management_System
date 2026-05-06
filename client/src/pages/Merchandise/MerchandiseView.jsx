import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getInvoiceById } from '../../api/merchandiseInvoiceApi';

const fmt     = (n) => Number(n || 0).toLocaleString('th-TH', { minimumFractionDigits: 2 });
const fmtDate = (d) => d
  ? new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' })
  : '—';

export default function MerchandiseView() {
  const { id }   = useParams();
  const navigate = useNavigate();

  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);

  useEffect(() => {
    setLoading(true);
    getInvoiceById(id)
      .then((res) => setInvoice(res.data))
      .catch(() => setError('Failed to load invoice.'))
      .finally(() => setLoading(false));
  }, [id]);

  const handlePrint = () => window.print();

  if (loading) return <div className="state-box">Loading...</div>;
  if (error)   return <div className="state-box" style={{ color: 'var(--danger)' }}>{error}</div>;
  if (!invoice) return null;

  return (
    <div>
      {/* ── Top bar (hidden on print) ── */}
      <div className="view-header-bar">
        <div>
          <h1 className="page-title">Invoice</h1>
          <p className="page-subtitle">Merchandise Sales</p>
        </div>
        <div className="view-actions">
          <button className="btn btn-secondary" onClick={() => navigate('/merchandise')}>
            ← Back
          </button>
          <button
            className="btn btn-secondary"
            onClick={() => navigate(`/merchandise/${id}/edit`)}
          >
            Edit
          </button>
          <button className="btn btn-primary" onClick={handlePrint}>
            🖨 Print / Save PDF
          </button>
        </div>
      </div>

      {/* ── Invoice paper ── */}
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
              Invoice
            </div>
            <div className="invoice-id">{invoice.id}</div>
            <div className="invoice-date-label" style={{ marginTop: 10 }}>Invoice Date</div>
            <div className="invoice-date-value">{fmtDate(invoice.invoice_date)}</div>
            <div className="invoice-date-label" style={{ marginTop: 8 }}>Created At</div>
            <div className="invoice-date-value" style={{ fontSize: 12 }}>
              {new Date(invoice.created_at).toLocaleString('en-GB')}
            </div>
          </div>
        </div>

        <hr className="invoice-divider" />

        {/* Bill To */}
        <div className="invoice-parties">
          <div>
            <div className="invoice-party-label">Bill From</div>
            <div className="invoice-party-name">GymBro Management System</div>
            <div className="invoice-party-sub">Bangkok, Thailand</div>
          </div>
          <div>
            <div className="invoice-party-label">Bill To</div>
            {invoice.member_name ? (
              <>
                <div className="invoice-party-name">{invoice.member_name}</div>
                <div className="invoice-party-sub">Member #{invoice.member_id}</div>
              </>
            ) : (
              <div className="invoice-party-name" style={{ color: 'var(--gray-400)', fontStyle: 'italic' }}>
                Walk-in Customer
              </div>
            )}
          </div>
        </div>

        <hr className="invoice-divider" />

        {/* Line items table */}
        <div className="invoice-table-wrap">
          <table className="invoice-table">
            <thead>
              <tr>
                <th style={{ width: 40 }}>#</th>
                <th>Product</th>
                <th>Qty</th>
                <th>Unit Price (฿)</th>
                <th>Discount (%)</th>
                <th>Extended (฿)</th>
              </tr>
            </thead>
            <tbody>
              {invoice.line_items.map((line) => (
                <tr key={line.id}>
                  <td style={{ color: 'var(--gray-400)' }}>{line.line_no}</td>
                  <td>
                    <div style={{ fontWeight: 500, color: 'var(--gray-900)' }}>{line.product_name}</div>
                    <div style={{ fontSize: 11.5, color: 'var(--gray-400)' }}>ID: {line.product_id}</div>
                  </td>
                  <td>{parseFloat(line.quantity)}</td>
                  <td>{fmt(line.unit_price)}</td>
                  <td>{parseFloat(line.discount_pct) > 0 ? `${parseFloat(line.discount_pct)}%` : '—'}</td>
                  <td style={{ fontWeight: 600 }}>{fmt(line.extended_price)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Total */}
        <div className="invoice-total-row">
          <div className="invoice-total-box">
            <span className="invoice-total-label">Total Amount</span>
            <span className="invoice-total-amount">฿ {fmt(invoice.total_amount)}</span>
          </div>
        </div>

        {/* Footer */}
        <div className="invoice-footer">
          <p>Thank you for your purchase at GymBro Management System.</p>
          <p style={{ marginTop: 4 }}>
            This invoice was generated on {new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' })}.
          </p>
        </div>
      </div>
    </div>
  );
}