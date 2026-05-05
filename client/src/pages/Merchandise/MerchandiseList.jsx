import { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAllInvoices, deleteInvoice } from '../../api/merchandiseInvoiceApi';

const PAGE_SIZE_OPTIONS = [10, 25, 50];

const fmt = (n) =>
  Number(n || 0).toLocaleString('th-TH', { minimumFractionDigits: 2 });

const fmtDate = (d) =>
  d ? new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';

export default function MerchandiseList() {
  const navigate = useNavigate();

  const [invoices, setInvoices]   = useState([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState(null);
  const [search, setSearch]       = useState('');
  const [dateFrom, setDateFrom]   = useState('');
  const [dateTo, setDateTo]       = useState('');
  const [sortKey, setSortKey]     = useState('created_at');
  const [sortDir, setSortDir]     = useState('desc');
  const [pageSize, setPageSize]   = useState(10);
  const [page, setPage]           = useState(1);

  const fetchInvoices = async () => {
    setLoading(true); setError(null);
    try {
      const res = await getAllInvoices();
      setInvoices(res.data);
    } catch {
      setError('Failed to load invoices.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchInvoices(); }, []);

  const handleDelete = async (id) => {
    if (!window.confirm(`Delete invoice ${id}? This cannot be undone.`)) return;
    try {
      await deleteInvoice(id);
      setInvoices((prev) => prev.filter((i) => i.id !== id));
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete.');
    }
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
    let rows = [...invoices];
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      rows = rows.filter(
        (r) => r.id.toLowerCase().includes(q) || (r.member_name || '').toLowerCase().includes(q)
      );
    }
    if (dateFrom) rows = rows.filter((r) => r.invoice_date >= dateFrom);
    if (dateTo)   rows = rows.filter((r) => r.invoice_date <= dateTo);
    rows.sort((a, b) => {
      let va = a[sortKey] ?? '';
      let vb = b[sortKey] ?? '';
      if (sortKey === 'total_amount') { va = parseFloat(va); vb = parseFloat(vb); }
      if (va < vb) return sortDir === 'asc' ? -1 : 1;
      if (va > vb) return sortDir === 'asc' ? 1 : -1;
      return 0;
    });
    return rows;
  }, [invoices, search, dateFrom, dateTo, sortKey, sortDir]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const paginated  = filtered.slice((page - 1) * pageSize, page * pageSize);

  useEffect(() => { setPage(1); }, [search, dateFrom, dateTo, pageSize]);

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Merchandise Sales</h1>
          <p className="page-subtitle">{filtered.length} invoice{filtered.length !== 1 ? 's' : ''} found</p>
        </div>
        <button className="btn btn-primary" onClick={() => navigate('/merchandise/new')}>
          + New Invoice
        </button>
      </div>

      <div className="card">
        <div className="card-body" style={{ paddingBottom: 0 }}>
          <div className="filter-bar">
            <input
              className="form-input"
              style={{ minWidth: 220 }}
              placeholder="Search invoice no. or member..."
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
                {error} <button className="action-btn edit" onClick={fetchInvoices}>Retry</button>
              </div>
            ) : (
              <table>
                <thead>
                  <tr>
                    <th className="sortable" onClick={() => handleSort('id')}>Invoice No {sortIcon('id')}</th>
                    <th className="sortable" onClick={() => handleSort('invoice_date')}>Date {sortIcon('invoice_date')}</th>
                    <th className="sortable" onClick={() => handleSort('member_name')}>Member {sortIcon('member_name')}</th>
                    <th className="sortable" style={{ textAlign: 'right' }} onClick={() => handleSort('total_amount')}>Total (฿) {sortIcon('total_amount')}</th>
                    <th className="sortable" onClick={() => handleSort('created_at')}>Created At {sortIcon('created_at')}</th>
                    <th style={{ textAlign: 'center' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paginated.length === 0 ? (
                    <tr><td colSpan={6}><div className="state-box">No invoices found.</div></td></tr>
                  ) : (
                    paginated.map((inv) => (
                      <tr key={inv.id}>
                        <td><span className="badge badge-green">{inv.id}</span></td>
                        <td>{fmtDate(inv.invoice_date)}</td>
                        <td>
                          {inv.member_name ? (
                            <span>
                              <span style={{ color: 'var(--gray-400)', fontSize: 12, marginRight: 4 }}>#{inv.member_id}</span>
                              {inv.member_name}
                            </span>
                          ) : (
                            <span className="badge badge-gray">Walk-in</span>
                          )}
                        </td>
                        <td style={{ textAlign: 'right', fontWeight: 600, color: 'var(--gray-900)' }}>{fmt(inv.total_amount)}</td>
                        <td style={{ color: 'var(--gray-400)', fontSize: 13 }}>{new Date(inv.created_at).toLocaleString('en-GB')}</td>
                        <td style={{ textAlign: 'center' }}>
                          <button className="action-btn edit" onClick={() => navigate(`/merchandise/${inv.id}/edit`)}>Edit</button>
                          <button className="action-btn delete" onClick={() => handleDelete(inv.id)}>Delete</button>
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
                  p === '...' ? (
                    <span key={`dot-${i}`} style={{ padding: '0 4px', color: 'var(--gray-400)' }}>…</span>
                  ) : (
                    <button key={p} className={`page-btn${page === p ? ' active' : ''}`} onClick={() => setPage(p)}>{p}</button>
                  )
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