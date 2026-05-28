import { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { compareSortValues } from '../../utils/sortUtils';
import { getAllBookings, deleteBooking } from '../../api/trainingBookingApi';

const PAGE_SIZE_OPTIONS = [10, 25, 50];
const fmt     = (n) => Number(n || 0).toLocaleString('th-TH', { minimumFractionDigits: 2 });
const fmtDate = (d) => d ? new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';

export default function TrainingBookingList() {
  const navigate = useNavigate();

  const [bookings, setBookings]   = useState([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState(null);
  const [search, setSearch]       = useState('');
  const [dateFrom, setDateFrom]   = useState('');
  const [dateTo, setDateTo]       = useState('');
  const [sortKey, setSortKey]     = useState('id');
  const [sortDir, setSortDir]     = useState('asc');
  const [pageSize, setPageSize]   = useState(10);
  const [page, setPage]           = useState(1);

  const fetchData = async () => {
    setLoading(true); setError(null);
    try {
      const res = await getAllBookings();
      setBookings(res.data.data);
    } catch { setError('Failed to load bookings.'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  const handleDelete = async (id) => {
    if (!window.confirm(`Delete booking ${id}?`)) return;
    try {
      await deleteBooking(id);
      setBookings((prev) => prev.filter((b) => b.id !== id));
    } catch (err) { alert(err.response?.data?.message || 'Failed to delete.'); }
  };

  const handleSort = (key) => {
    if (sortKey === key) setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    else { setSortKey(key); setSortDir('asc'); }
    setPage(1);
  };

  const sortIcon = (key) => {
    if (sortKey !== key) return <span className="sort-icon">↕</span>;
    return <span className="sort-icon">{sortDir === 'asc' ? '↑' : '↓'}</span>;
  };

  const filtered = useMemo(() => {
    let rows = [...bookings];
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      rows = rows.filter((r) =>
        r.id.toLowerCase().includes(q) ||
        (r.member_name || '').toLowerCase().includes(q) ||
        (r.trainer_name || '').toLowerCase().includes(q)
      );
    }
    if (dateFrom) rows = rows.filter((r) => r.booking_date >= dateFrom);
    if (dateTo)   rows = rows.filter((r) => r.booking_date <= dateTo);
    rows.sort((a, b) => compareSortValues(a[sortKey], b[sortKey], sortDir));
    return rows;
  }, [bookings, search, dateFrom, dateTo, sortKey, sortDir]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const paginated  = filtered.slice((page - 1) * pageSize, page * pageSize);
  useEffect(() => { setPage(1); }, [search, dateFrom, dateTo, pageSize]);

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Training Bookings</h1>
          <p className="page-subtitle">{filtered.length} record{filtered.length !== 1 ? 's' : ''} found</p>
        </div>
        <button className="btn btn-primary" onClick={() => navigate('/training-bookings/new')}>
          + New Booking
        </button>
      </div>

      <div className="card">
        <div className="card-body" style={{ paddingBottom: 0 }}>
          <div className="filter-bar">
            <input
              className="form-input"
              style={{ minWidth: 240 }}
              placeholder="Search booking no., member or trainer..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <label className="form-label" style={{ margin: 0, whiteSpace: 'nowrap' }}>From</label>
              <input type="date" className="form-input" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <label className="form-label" style={{ margin: 0, whiteSpace: 'nowrap' }}>To</label>
              <input type="date" className="form-input" value={dateTo} onChange={(e) => setDateTo(e.target.value)} />
            </div>
            {(search || dateFrom || dateTo) && (
              <button className="btn btn-secondary" onClick={() => { setSearch(''); setDateFrom(''); setDateTo(''); }}>
                Clear
              </button>
            )}
            <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 8 }}>
              <label className="form-label" style={{ margin: 0, whiteSpace: 'nowrap' }}>Show</label>
              <select className="form-input" style={{ width: 'auto' }} value={pageSize} onChange={(e) => setPageSize(Number(e.target.value))}>
                {PAGE_SIZE_OPTIONS.map((n) => <option key={n} value={n}>{n} rows</option>)}
              </select>
            </div>
          </div>
        </div>

        <div style={{ padding: '12px 24px 0' }}>
          <div className="table-wrapper">
            {loading ? (
              <div className="state-box">Loading...</div>
            ) : error ? (
              <div className="state-box" style={{ color: 'var(--danger)' }}>
                {error} <button className="action-btn edit" onClick={fetchData}>Retry</button>
              </div>
            ) : (
              <table>
                <thead>
                  <tr>
                    <th className="sortable" onClick={() => handleSort('id')}>Booking No {sortIcon('id')}</th>
                    <th className="sortable" onClick={() => handleSort('booking_date')}>Date {sortIcon('booking_date')}</th>
                    <th className="sortable" onClick={() => handleSort('member_name')}>Member {sortIcon('member_name')}</th>
                    <th className="sortable" onClick={() => handleSort('trainer_name')}>Trainer {sortIcon('trainer_name')}</th>
                    <th className="sortable" style={{ textAlign: 'right' }} onClick={() => handleSort('total_session_cost')}>Total Cost (฿) {sortIcon('total_session_cost')}</th>
                    <th style={{ textAlign: 'center' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paginated.length === 0 ? (
                    <tr><td colSpan={6}><div className="state-box">No bookings found.</div></td></tr>
                  ) : (
                    paginated.map((b) => (
                      <tr key={b.id}>
                        <td>
                          <span
                            className="badge badge-green"
                            style={{ cursor: 'pointer', textDecoration: 'underline', textUnderlineOffset: 3 }}
                            onClick={() => navigate(`/training-bookings/${b.id}`)}
                            title="View booking"
                          >
                            {b.id}
                          </span>
                        </td>
                        <td>{fmtDate(b.booking_date)}</td>
                        <td>
                          <span style={{ color: 'var(--gray-400)', fontSize: 12, marginRight: 4 }}>#{b.member_id}</span>
                          {b.member_name}
                        </td>
                        <td>{b.trainer_name}</td>
                        <td style={{ textAlign: 'right', fontWeight: 600, color: 'var(--gray-900)' }}>{fmt(b.total_session_cost)}</td>
                        <td style={{ textAlign: 'center' }}>
                          <button className="action-btn edit" onClick={() => navigate(`/training-bookings/${b.id}/edit`)}>Edit</button>
                          <button className="action-btn delete" onClick={() => handleDelete(b.id)}>Delete</button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {!loading && !error && filtered.length > 0 && (
          <div className="pagination">
            <span>Showing {Math.min((page - 1) * pageSize + 1, filtered.length)}–{Math.min(page * pageSize, filtered.length)} of {filtered.length}</span>
            <div className="pagination-pages">
              <button className="page-btn" onClick={() => setPage(1)} disabled={page === 1}>«</button>
              <button className="page-btn" onClick={() => setPage((p) => p - 1)} disabled={page === 1}>‹</button>
              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter((p) => p === 1 || p === totalPages || Math.abs(p - page) <= 1)
                .reduce((acc, p, i, arr) => { if (i > 0 && p - arr[i - 1] > 1) acc.push('...'); acc.push(p); return acc; }, [])
                .map((p, i) =>
                  p === '...' ? <span key={`d${i}`} style={{ padding: '0 4px', color: 'var(--gray-400)' }}>…</span>
                  : <button key={p} className={`page-btn${page === p ? ' active' : ''}`} onClick={() => setPage(p)}>{p}</button>
                )}
              <button className="page-btn" onClick={() => setPage((p) => p + 1)} disabled={page === totalPages}>›</button>
              <button className="page-btn" onClick={() => setPage(totalPages)} disabled={page === totalPages}>»</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
