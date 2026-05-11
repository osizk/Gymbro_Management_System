import { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAllEquipmentCategories_s, deleteEquipmentCategory } from '../../api/simpleFormsApi';

const PAGE_SIZE_OPTIONS = [10, 25, 50];

export default function EquipmentCategoryList() {
  const navigate = useNavigate();
  const [rows, setRows]       = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);
  const [search, setSearch]   = useState('');
  const [sortKey, setSortKey] = useState('id');
  const [sortDir, setSortDir] = useState('desc');
  const [pageSize, setPageSize] = useState(10);
  const [page, setPage]       = useState(1);

  const fetchData = async () => {
    setLoading(true); setError(null);
    try { const res = await getAllEquipmentCategories_s(); setRows(res.data.data || []); }
    catch { setError('Failed to load equipment categories.'); }
    finally { setLoading(false); }
  };
  useEffect(() => { fetchData(); }, []);

  const handleDelete = async (id) => {
    if (!window.confirm(`Delete equipment category #${id}?`)) return;
    try { await deleteEquipmentCategory(id); setRows((prev) => prev.filter((r) => r.id !== id)); }
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
      data = data.filter((r) => String(r.id).includes(q) || (r.category_name || '').toLowerCase().includes(q));
    }
    data.sort((a, b) => {
      let va = a[sortKey] ?? ''; let vb = b[sortKey] ?? '';
      if (va < vb) return sortDir === 'asc' ? -1 : 1;
      if (va > vb) return sortDir === 'asc' ? 1 : -1;
      return 0;
    });
    return data;
  }, [rows, search, sortKey, sortDir]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const paginated  = filtered.slice((page - 1) * pageSize, page * pageSize);
  useEffect(() => { setPage(1); }, [search, pageSize]);

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Equipment Categories</h1>
          <p className="page-subtitle">{filtered.length} record{filtered.length !== 1 ? 's' : ''} found</p>
        </div>
        <button className="btn btn-primary" onClick={() => navigate('/equipment-categories/new')}>+ New Category</button>
      </div>

      <div className="card">
        <div className="card-body" style={{ paddingBottom: 0 }}>
          <div className="filter-bar">
            <input className="form-input" style={{ minWidth: 220 }} placeholder="Search ID or category name..." value={search} onChange={(e) => setSearch(e.target.value)} />
            {search && <button className="btn btn-secondary" onClick={() => setSearch('')}>Clear</button>}
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
                    <th className="sortable" onClick={() => handleSort('id')}>ID {sortIcon('id')}</th>
                    <th className="sortable" onClick={() => handleSort('category_name')}>Category Name {sortIcon('category_name')}</th>
                    <th style={{ textAlign: 'center' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paginated.length === 0
                    ? <tr><td colSpan={3}><div className="state-box">No equipment categories found.</div></td></tr>
                    : paginated.map((r) => (
                        <tr key={r.id}>
                          <td>
                            <span className="badge badge-green" style={{ cursor: 'pointer', textDecoration: 'underline', textUnderlineOffset: 3 }} onClick={() => navigate(`/equipment-categories/${r.id}`)}>
                              {r.id}
                            </span>
                          </td>
                          <td style={{ fontWeight: 500 }}>{r.category_name}</td>
                          <td style={{ textAlign: 'center' }}>
                            <button className="action-btn edit" onClick={() => navigate(`/equipment-categories/${r.id}/edit`)}>Edit</button>
                            <button className="action-btn delete" onClick={() => handleDelete(r.id)}>Delete</button>
                          </td>
                        </tr>
                      ))
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
