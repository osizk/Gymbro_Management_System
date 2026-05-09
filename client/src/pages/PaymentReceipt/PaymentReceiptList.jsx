import { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAllReceipts, deleteReceipt } from '../../api/paymentReceiptApi';

const PAGE_SIZE_OPTIONS = [10, 25, 50];
const fmt     = (n) => Number(n || 0).toLocaleString('th-TH', { minimumFractionDigits: 2 });
const fmtDate = (d) => d ? new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';

export default function PaymentReceiptList() {
  const navigate = useNavigate();

  const [receipts, setReceipts]   = useState([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState(null);
  const [search, setSearch]       = useState('');
  const [dateFrom, setDateFrom]   = useState('');
  const [dateTo, setDateTo]       = useState('');
  const [sortKey, setSortKey]     = useState('created_at');
  const [sortDir, setSortDir]     = useState('desc');
  const [pageSize, setPageSize]   = useState(10);
  const [page, setPage]           = useState(1);

  const fetchData = async () => {
    setLoading(true); setError(null);
    try {
      const res = await getAllReceipts();
      setReceipts(res.data.data);
    } catch { setError('Failed to load receipts.'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  const handleDelete = async (id) => {
    if (!window.confirm(`Delete receipt ${id}?`)) return;
    try {
      await deleteReceipt(id);
      setReceipts((prev) => prev.filter((r) => r.id !== id));
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
    let rows = [...receipts];
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      rows = rows.filter((r) =>
        r.id.toLowerCase().includes(q) ||
        (r.member_name || '').toLowerCase().includes(q) ||
        (r.payment_reference_no || '').toLowerCase().includes(q)
      );
    }
    if (dateFrom) rows = rows.filter((r) => r.receipt_date >= dateFrom);
    if (dateTo)   rows = rows.filter((r) => r.receipt_date <= dateTo);
    rows.sort((a, b) => {
      let va = a[sortKey] ?? '';
      let vb = b[sortKey] ?? '';
      if (sortKey === 'total_paid') { va = parseFloat(va); vb = parseFloat(vb); }
      if (va < vb) return sortDir === 'asc' ? -1 : 1;
      if (va > vb) return sortDir === 'asc' ? 1 : -1;
      return 0;
    });
    return rows;
  }, [receipts, search, dateFrom, dateTo, sortKey, sortDir]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const paginated  = filtered.slice((page - 1) * pageSize, page * pageSize);
  useEffect(() => { setPage(1); }, [search, dateFrom, dateTo, pageSize]);

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Payment Receipts</h1>
          <p className="page-subtitle">{filtered.length} record{filtered.length !== 1 ? 's' : ''} found</p>
        </div>
        <button className="btn btn-primary" onClick={() => navigate('/payment-receipts/new')}>
          + New Receipt
        </button>
      </div>

      <div className="card">
        <div className="card-body" style={{ paddingBottom: 0 }}>
          <div className="filter-bar">
            <input
              className="form-input"
              style={{ minWidth: 240 }}
              placeholder="Search receipt no., member or reference..."
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
                    <th className="sortable" onClick={() => handleSort('id')}>Receipt No {sortIcon('id')}</th>
                    <th className="sortable" onClick={() => handleSort('receipt_date')}>Date {sortIcon('receipt_date')}</th>
                    <th className="sortable" onClick={() => handleSort('member_name')}>Member {sortIcon('member_name')}</th>
                    <th className="sortable" onClick={() => handleSort('method_name')}>Payment Method {sortIcon('method_name')}</th>
                    <th>Reference No</th>
                    <th className="sortable" style={{ textAlign: 'right' }} onClick={() => handleSort('total_paid')}>Total Paid (฿) {sortIcon('total_paid')}</th>
                    <th style={{ textAlign: 'center' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paginated.length === 0 ? (
                    <tr><td colSpan={7}><div className="state-box">No receipts found.</div></td></tr>
                  ) : (
                    paginated.map((r) => (
                      <tr key={r.id}>
                        <td>
                          <span
                            className="badge badge-green"
                            style={{ cursor: 'pointer', textDecoration: 'underline', textUnderlineOffset: 3 }}
                            onClick={() => navigate(`/payment-receipts/${r.id}`)}
                            title="View receipt"
                          >
                            {r.id}
                          </span>
                        </td>
                        <td>{fmtDate(r.receipt_date)}</td>
                        <td>
                          <span style={{ color: 'var(--gray-400)', fontSize: 12, marginRight: 4 }}>#{r.member_id}</span>
                          {r.member_name}
                        </td>
                        <td>{r.method_name}</td>
                        <td style={{ color: 'var(--gray-500)', fontSize: 13 }}>{r.payment_reference_no || '—'}</td>
                        <td style={{ textAlign: 'right', fontWeight: 600, color: 'var(--gray-900)' }}>{fmt(r.total_paid)}</td>
                        <td style={{ textAlign: 'center' }}>
                          <button className="action-btn edit" onClick={() => navigate(`/payment-receipts/${r.id}/edit`)}>Edit</button>
                          <button className="action-btn delete" onClick={() => handleDelete(r.id)}>Delete</button>
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
