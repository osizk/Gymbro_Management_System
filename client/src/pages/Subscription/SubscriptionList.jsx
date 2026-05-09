import { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAllSubscriptions, deleteSubscription } from '../../api/subscriptionApi';

const PAGE_SIZE_OPTIONS = [10, 25, 50];
const fmt     = (n) => Number(n || 0).toLocaleString('th-TH', { minimumFractionDigits: 2 });
const fmtDate = (d) => d ? new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';

const STATUS_COLORS = {
  ACTIVE:    { bg: 'var(--green-100)',   color: 'var(--green-600)' },
  EXPIRED:   { bg: 'var(--gray-100)',    color: 'var(--gray-500)' },
  CANCELLED: { bg: 'var(--danger-light)', color: 'var(--danger)' },
};

export default function SubscriptionList() {
  const navigate = useNavigate();

  const [subs, setSubs]         = useState([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState(null);
  const [search, setSearch]     = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo]     = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [sortKey, setSortKey]   = useState('created_at');
  const [sortDir, setSortDir]   = useState('desc');
  const [pageSize, setPageSize] = useState(10);
  const [page, setPage]         = useState(1);

  const fetchData = async () => {
    setLoading(true); setError(null);
    try {
      const res = await getAllSubscriptions();
      setSubs(res.data);
    } catch { setError('Failed to load subscriptions.'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  const handleDelete = async (id) => {
    if (!window.confirm(`Delete subscription ${id}?`)) return;
    try {
      await deleteSubscription(id);
      setSubs((prev) => prev.filter((s) => s.id !== id));
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
    let rows = [...subs];
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      rows = rows.filter((r) =>
        r.id.toLowerCase().includes(q) ||
        (r.member_name || '').toLowerCase().includes(q)
      );
    }
    if (dateFrom) rows = rows.filter((r) => r.subscription_date >= dateFrom);
    if (dateTo)   rows = rows.filter((r) => r.subscription_date <= dateTo);
    if (statusFilter) rows = rows.filter((r) => r.status === statusFilter);
    rows.sort((a, b) => {
      let va = a[sortKey] ?? '';
      let vb = b[sortKey] ?? '';
      if (sortKey === 'total_amount') { va = parseFloat(va); vb = parseFloat(vb); }
      if (va < vb) return sortDir === 'asc' ? -1 : 1;
      if (va > vb) return sortDir === 'asc' ? 1 : -1;
      return 0;
    });
    return rows;
  }, [subs, search, dateFrom, dateTo, statusFilter, sortKey, sortDir]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const paginated  = filtered.slice((page - 1) * pageSize, page * pageSize);
  useEffect(() => { setPage(1); }, [search, dateFrom, dateTo, statusFilter, pageSize]);

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Subscriptions</h1>
          <p className="page-subtitle">{filtered.length} record{filtered.length !== 1 ? 's' : ''} found</p>
        </div>
        <button className="btn btn-primary" onClick={() => navigate('/subscriptions/new')}>
          + New Subscription
        </button>
      </div>

      <div className="card">
        <div className="card-body" style={{ paddingBottom: 0 }}>
          <div className="filter-bar">
            <input
              className="form-input"
              style={{ minWidth: 220 }}
              placeholder="Search subscription no. or member..."
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
            <select
              className="form-input"
              style={{ width: 'auto' }}
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="">All Status</option>
              <option value="ACTIVE">Active</option>
              <option value="EXPIRED">Expired</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
            {(search || dateFrom || dateTo || statusFilter) && (
              <button className="btn btn-secondary" onClick={() => { setSearch(''); setDateFrom(''); setDateTo(''); setStatusFilter(''); }}>
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
                    <th className="sortable" onClick={() => handleSort('id')}>Subscription No {sortIcon('id')}</th>
                    <th className="sortable" onClick={() => handleSort('subscription_date')}>Date {sortIcon('subscription_date')}</th>
                    <th className="sortable" onClick={() => handleSort('member_name')}>Member {sortIcon('member_name')}</th>
                    <th className="sortable" onClick={() => handleSort('status')}>Status {sortIcon('status')}</th>
                    <th className="sortable" style={{ textAlign: 'right' }} onClick={() => handleSort('total_amount')}>Total (฿) {sortIcon('total_amount')}</th>
                    <th className="sortable" onClick={() => handleSort('created_at')}>Created At {sortIcon('created_at')}</th>
                    <th style={{ textAlign: 'center' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paginated.length === 0 ? (
                    <tr><td colSpan={7}><div className="state-box">No subscriptions found.</div></td></tr>
                  ) : (
                    paginated.map((s) => {
                      const sc = STATUS_COLORS[s.status] || STATUS_COLORS.EXPIRED;
                      return (
                        <tr key={s.id}>
                          <td>
                            <span
                              className="badge badge-green"
                              style={{ cursor: 'pointer', textDecoration: 'underline', textUnderlineOffset: 3 }}
                              onClick={() => navigate(`/subscriptions/${s.id}`)}
                              title="View subscription"
                            >
                              {s.id}
                            </span>
                          </td>
                          <td>{fmtDate(s.subscription_date)}</td>
                          <td>
                            <span style={{ color: 'var(--gray-400)', fontSize: 12, marginRight: 4 }}>#{s.member_id}</span>
                            {s.member_name}
                          </td>
                          <td>
                            <span className="badge" style={{ background: sc.bg, color: sc.color }}>
                              {s.status}
                            </span>
                          </td>
                          <td style={{ textAlign: 'right', fontWeight: 600, color: 'var(--gray-900)' }}>{fmt(s.total_amount)}</td>
                          <td style={{ color: 'var(--gray-400)', fontSize: 13 }}>{new Date(s.created_at).toLocaleString('en-GB')}</td>
                          <td style={{ textAlign: 'center' }}>
                            <button className="action-btn edit" onClick={() => navigate(`/subscriptions/${s.id}/edit`)}>Edit</button>
                            <button className="action-btn delete" onClick={() => handleDelete(s.id)}>Delete</button>
                          </td>
                        </tr>
                      );
                    })
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