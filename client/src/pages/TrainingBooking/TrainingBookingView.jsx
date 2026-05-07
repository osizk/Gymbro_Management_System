import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getBookingById } from '../../api/trainingBookingApi';

const fmt     = (n) => Number(n || 0).toLocaleString('th-TH', { minimumFractionDigits: 2 });
const fmtDate = (d) => d
  ? new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' })
  : '—';
const fmtTime = (t) => t ? String(t).slice(0, 5) : '—';

export default function TrainingBookingView() {
  const { id }   = useParams();
  const navigate = useNavigate();

  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);

  useEffect(() => {
    setLoading(true);
    getBookingById(id)
      .then((res) => setBooking(res.data.data))
      .catch(() => setError('Failed to load booking.'))
      .finally(() => setLoading(false));
  }, [id]);

  const handlePrint = () => window.print();

  if (loading) return <div className="state-box">Loading...</div>;
  if (error)   return <div className="state-box" style={{ color: 'var(--danger)' }}>{error}</div>;
  if (!booking) return null;

  return (
    <div>
      <div className="view-header-bar">
        <div>
          <h1 className="page-title">Training Booking</h1>
          <p className="page-subtitle">Session Booking Record</p>
        </div>
        <div className="view-actions">
          <button className="btn btn-secondary" onClick={() => navigate('/training-bookings')}>
            ← Back
          </button>
          <button className="btn btn-secondary" onClick={() => navigate(`/training-bookings/${id}/edit`)}>
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
              Training Booking
            </div>
            <div className="invoice-id">{booking.id}</div>
            <div className="invoice-date-label" style={{ marginTop: 10 }}>Booking Date</div>
            <div className="invoice-date-value">{fmtDate(booking.booking_date)}</div>
            <div className="invoice-date-label" style={{ marginTop: 8 }}>Created At</div>
            <div className="invoice-date-value" style={{ fontSize: 12 }}>
              {new Date(booking.created_at).toLocaleString('en-GB')}
            </div>
          </div>
        </div>

        <hr className="invoice-divider" />

        <div className="invoice-parties">
          <div>
            <div className="invoice-party-label">Member</div>
            <div className="invoice-party-name">
              <span style={{ fontSize: 13, color: 'var(--gray-400)', marginRight: 6 }}>#{booking.member_id}</span>
              {booking.member_name}
            </div>
          </div>
          <div>
            <div className="invoice-party-label">Trainer</div>
            <div className="invoice-party-name">{booking.trainer_name}</div>
            <div className="invoice-party-sub">ID: {booking.trainer_id}</div>
          </div>
        </div>

        <hr className="invoice-divider" />

        <div className="invoice-table-wrap">
          <table className="invoice-table">
            <thead>
              <tr>
                <th style={{ width: 40 }}>#</th>
                <th>Training Type</th>
                <th>Date</th>
                <th>Start</th>
                <th>End</th>
                <th style={{ textAlign: 'right' }}>Mins</th>
                <th style={{ textAlign: 'right' }}>Rate/hr (฿)</th>
                <th style={{ textAlign: 'right' }}>Cost (฿)</th>
                <th>Notes</th>
              </tr>
            </thead>
            <tbody>
              {booking.line_items.map((line) => (
                <tr key={line.id}>
                  <td style={{ color: 'var(--gray-400)' }}>{line.line_no}</td>
                  <td style={{ fontWeight: 500, color: 'var(--gray-900)' }}>{line.type_name}</td>
                  <td>{fmtDate(line.session_date)}</td>
                  <td>{fmtTime(line.start_time)}</td>
                  <td>{fmtTime(line.end_time)}</td>
                  <td style={{ textAlign: 'right' }}>{line.duration_minutes}</td>
                  <td style={{ textAlign: 'right' }}>{fmt(line.hourly_rate)}</td>
                  <td style={{ textAlign: 'right', fontWeight: 600 }}>{fmt(line.session_cost)}</td>
                  <td style={{ color: 'var(--gray-500)', fontSize: 12 }}>{line.notes || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="invoice-total-row">
          <div className="invoice-total-box">
            <span className="invoice-total-label">Total Session Cost</span>
            <span className="invoice-total-amount">฿ {fmt(booking.total_session_cost)}</span>
          </div>
        </div>

        <div className="invoice-footer">
          <p>This training booking was recorded by GymBro Management System.</p>
          <p style={{ marginTop: 4 }}>
            Generated on {new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' })}.
          </p>
        </div>
      </div>
    </div>
  );
}
