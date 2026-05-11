import { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAllTickets, deleteTicket } from '../../api/simpleFormsApi';

const PAGE_SIZE_OPTIONS = [10, 25, 50];
const fmtDate = (d) => d ? new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';
const fmt = (n) => n != null ? Number(n).toLocaleString('th-TH', { minimumFractionDigits: 2 }) : '—';

const STATUS_COLORS = {
  OPEN:        { bg: '#fef3c7',             color: '#d97706' },
  IN_PROGRESS: { bg: '#e0f2fe',             color: '#0284c7' },
  CLOSED:      { bg: 'var(--gray-100)',     color: 'var(--gray-500)' },
};

export default function MaintenanceTicketList() {
  const navigate = useNavigate();
  const [rows, setRows]       = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);
  const [search, setSearch]   = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [sortKey, setSortKey] = useState('report_date');
  const [sortDir, setSortDir] = useState('desc');
  const [pageSize, setPageSize] = useState(10);
  const [page, setPage]       = useState(1);

  const fetchData = async () => {
    setLoading(true); setError(null);
    try { const res = await getAllTickets(); setRows(res.data.data || []); }
    catch { setError('Failed to load maintenance tickets.'); }
    finally { setLoading(false); }
  };
  useEffect(() => { fetchData(); }, []);

  const handleDelete = async (id) => {
    if (!window.confirm(`Delete ticket ${id}?`)) return;
    try { await deleteTicket(id); setRows((prev) => prev.filter((r) => r.id !== id)); }
    catch (err) { alert(err.response?.data?.message || 'Failed to delete.'); }
  };

  const handleSort = (key) => {
    if (sortKey === key) setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    else { setSortKey(key); setSortDir('asc'); }
    setPage(1);
  };
  const sortIcon = (key) => sortKey !== key
    ? <span className="sort-icon">↕</span>
    : <span className="sort-icon">{sortDir === 'asc' ? '↑' : '↓'}</span>;

  const filtered = useMemo(() => {
    let data = [...rows];
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      data = data.filter((r) =>
        (r.id || '').toLowerCase().includes(q) ||
        (r.equipment_name || '').toLowerCase().includes(q) ||
        (r.staff_name || '').toLowerCase().includes(q) ||
        (r.issue_description || '').toLowerCase().includes(q)
      );
    }
    if (statusFilter) data = data.filter((r) => r.status === statusFilter);
    data.sort((a, b) => {
      let va = a[sortKey] ?? ''; let vb = b[sortKey] ?? '';
      if (sortKey === 'repair_cost') { va = parseFloat(va) || 0; vb = parseFloat(vb) || 0; }
      if (va < vb) return sortDir === 'asc' ? -1 : 1;
      if (va > vb) return sortDir === 'asc' ? 1 : -1;
      return 0;
    });
    return data;
  }, [rows, search, statusFilter, sortKey, sortDir]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const paginated  = filtered.slice((page - 1) * pageSize, page * pageSize);
  useEffect(() => { setPage(1); }, [search, statusFilter, pageSize]);

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Maintenance Tickets</h1>
          <p className="page-subtitle">{filtered.length} record{filtered.length !== 1 ? 's' : ''} found</p>
        </div>
        <button className="btn btn-primary" onClick={() => navigate('/maintenance-tickets/new')}>+ New Ticket</button>
      </div>

      <div className="card">
        <div className="card-body" style={{ paddingBottom: 0 }}>
          <div className="filter-bar">
            <input className="form-input" style={{ minWidth: 220 }} placeholder="Search ID, equipment, technician..." value={search} onChange={(e) => setSearch(e.target.value)} />
            <select className="form-input" style={{ width: 'auto' }} value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
              <option value="">All Status</option>
              <option value="OPEN">Open</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="CLOSED">Closed</option>
            </select>
            {(search || statusFilter) && (
              <button className="btn btn-secondary" onClick={() => { setSearch(''); setStatusFilter(''); }}>Clear</button>
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
            {loading ? <div className="state-box">Loading...</div>
            : error ? <div className="state-box" style={{ color: 'var(--danger)' }}>{error} <button className="action-btn edit" onClick={fetchData}>Retry</button></div>
            : (
              <table>
                <thead>
                  <tr>
                    <th className="sortable" onClick={() => handleSort('id')}>Ticket ID {sortIcon('id')}</th>
                    <th className="sortable" onClick={() => handleSort('equipment_name')}>Equipment {sortIcon('equipment_name')}</th>
                    <th className="sortable" onClick={() => handleSort('report_date')}>Report Date {sortIcon('report_date')}</th>
                    <th>Issue</th>
                    <th className="sortable" onClick={() => handleSort('staff_name')}>Technician {sortIcon('staff_name')}</th>
                    <th className="sortable" onClick={() => handleSort('status')}>Status {sortIcon('status')}</th>
                    <th className="sortable" style={{ textAlign: 'right' }} onClick={() => handleSort('repair_cost')}>Repair Cost {sortIcon('repair_cost')}</th>
                    <th style={{ textAlign: 'center' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paginated.length === 0
                    ? <tr><td colSpan={8}><div className="state-box">No tickets found.</div></td></tr>
                    : paginated.map((r) => {
                        const sc = STATUS_COLORS[r.status] || STATUS_COLORS.OPEN;
                        return (
                          <tr key={r.id}>
                            <td>
                              <span className="badge badge-green" style={{ cursor: 'pointer', textDecoration: 'underline', textUnderlineOffset: 3 }} onClick={() => navigate(`/maintenance-tickets/${r.id}`)}>
                                {r.id}
                              </span>
                            </td>
                            <td>
                              <span style={{ color: 'var(--gray-400)', fontSize: 12, marginRight: 4 }}>#{r.equipment_id}</span>
                              {r.equipment_name}
                            </td>
                            <td>{fmtDate(r.report_date)}</td>
                            <td style={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: 'var(--gray-600)', fontSize: 13 }}>
                              {r.issue_description || '—'}
                            </td>
                            <td>
                              <span style={{ color: 'var(--gray-400)', fontSize: 12, marginRight: 4 }}>#{r.technician_id}</span>
                              {r.staff_name}
                            </td>
                            <td><span className="badge" style={{ background: sc.bg, color: sc.color }}>{r.status}</span></td>
                            <td style={{ textAlign: 'right', fontWeight: 600 }}>{fmt(r.repair_cost)}</td>
                            <td style={{ textAlign: 'center' }}>
                              <button className="action-btn edit" onClick={() => navigate(`/maintenance-tickets/${r.id}/edit`)}>Edit</button>
                              <button className="action-btn delete" onClick={() => handleDelete(r.id)}>Delete</button>
                            </td>
                          </tr>
                        );
                      })
                  }
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
                .map((p, i) => p === '...'
                  ? <span key={`d${i}`} style={{ padding: '0 4px', color: 'var(--gray-400)' }}>…</span>
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
