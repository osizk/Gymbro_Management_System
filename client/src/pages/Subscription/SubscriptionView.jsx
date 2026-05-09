import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getSubscriptionById } from '../../api/subscriptionApi';

const fmt     = (n) => Number(n || 0).toLocaleString('th-TH', { minimumFractionDigits: 2 });
const fmtDate = (d) => d ? new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' }) : '—';

const STATUS_COLORS = {
  ACTIVE:    { bg: 'var(--green-100)',    color: 'var(--green-600)' },
  EXPIRED:   { bg: 'var(--gray-100)',     color: 'var(--gray-500)' },
  CANCELLED: { bg: 'var(--danger-light)', color: 'var(--danger)' },
};

export default function SubscriptionView() {
  const { id }   = useParams();
  const navigate = useNavigate();
  const [sub, setSub]       = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);

  useEffect(() => {
    setLoading(true);
    getSubscriptionById(id)
      .then((res) => setSub(res.data))
      .catch(() => setError('Failed to load subscription.'))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="state-box">Loading...</div>;
  if (error)   return <div className="state-box" style={{ color: 'var(--danger)' }}>{error}</div>;
  if (!sub)    return null;

  const sc = STATUS_COLORS[sub.status] || STATUS_COLORS.EXPIRED;

  return (
    <div>
      {/* Top bar */}
      <div className="view-header-bar">
        <div>
          <h1 className="page-title">Subscription</h1>
          <p className="page-subtitle">Membership Subscription</p>
        </div>
        <div className="view-actions">
          <button className="btn btn-secondary" onClick={() => navigate('/subscriptions')}>← Back</button>
          <button className="btn btn-secondary" onClick={() => navigate(`/subscriptions/${id}/edit`)}>Edit</button>
          <button className="btn btn-primary" onClick={() => window.print()}>🖨 Print / Save PDF</button>
        </div>
      </div>

      {/* Paper */}
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
            <div style={{ fontSize: 11, color: 'var(--gray-400)', textTransform: 'uppercase', letterSpacing: '0.6px', marginBottom: 4 }}>Subscription</div>
            <div className="invoice-id">{sub.id}</div>
            <div style={{ marginTop: 10, display: 'flex', gap: 8, justifyContent: 'flex-end', alignItems: 'center' }}>
              <span className="badge" style={{ background: sc.bg, color: sc.color }}>{sub.status}</span>
            </div>
            <div className="invoice-date-label" style={{ marginTop: 10 }}>Subscription Date</div>
            <div className="invoice-date-value">{fmtDate(sub.subscription_date)}</div>
          </div>
        </div>

        <hr className="invoice-divider" />

        <div className="invoice-parties">
          <div>
            <div className="invoice-party-label">From</div>
            <div className="invoice-party-name">GymBro Management System</div>
            <div className="invoice-party-sub">Bangkok, Thailand</div>
          </div>
          <div>
            <div className="invoice-party-label">Member</div>
            <div className="invoice-party-name">{sub.member_name}</div>
            <div className="invoice-party-sub">Member #{sub.member_id}</div>
          </div>
        </div>

        <hr className="invoice-divider" />

        {/* Line items */}
        <div className="invoice-table-wrap">
          <table className="invoice-table">
            <thead>
              <tr>
                <th style={{ width: 40 }}>#</th>
                <th>Package</th>
                <th>Duration</th>
                <th>Start Date</th>
                <th>End Date</th>
                <th>Base Price (฿)</th>
                <th>Discount (%)</th>
                <th>Extended (฿)</th>
              </tr>
            </thead>
            <tbody>
              {sub.line_items.map((line) => (
                <tr key={line.id}>
                  <td style={{ color: 'var(--gray-400)' }}>{line.line_no}</td>
                  <td>
                    <div style={{ fontWeight: 500, color: 'var(--gray-900)' }}>{line.package_name}</div>
                    <div style={{ fontSize: 11.5, color: 'var(--gray-400)' }}>ID: {line.package_id}</div>
                  </td>
                  <td>{line.duration_months} mo.</td>
                  <td>{fmtDate(line.start_date)}</td>
                  <td>{fmtDate(line.end_date)}</td>
                  <td>{fmt(line.base_price)}</td>
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
            <span className="invoice-total-amount">฿ {fmt(sub.total_amount)}</span>
          </div>
        </div>

        <div className="invoice-footer">
          <p>Thank you for subscribing to GymBro Management System.</p>
          <p style={{ marginTop: 4 }}>Generated on {new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' })}.</p>
        </div>
      </div>
    </div>
  );
}