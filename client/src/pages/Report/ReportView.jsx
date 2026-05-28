import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getReportById } from '../../api/reportApi';

const fmtDate = (value) => value
  ? new Date(value).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
  : '-';

const fmtMoney = (value) => Number(value || 0).toLocaleString('th-TH', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

function formatCell(value, column) {
  if (column.type === 'date') return fmtDate(value);
  if (column.type === 'money') return fmtMoney(value);
  return value ?? '-';
}

function initialFilterValues(report) {
  const values = {};
  for (const filter of report.filters || []) values[filter.name] = filter.defaultValue || '';
  return values;
}

export default function ReportView() {
  const { reportId } = useParams();
  const navigate = useNavigate();
  const [report, setReport] = useState(null);
  const [filters, setFilters] = useState({});
  const [loading, setLoading] = useState(true);
  const [running, setRunning] = useState(false);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');

  const loadReport = async (params, isFirstLoad = false) => {
    if (isFirstLoad) setLoading(true);
    else setRunning(true);
    setError(null);
    try {
      const res = await getReportById(reportId, params);
      setReport(res.data);
      setFilters(res.data.appliedFilters || initialFilterValues(res.data));
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load report.');
    } finally {
      setLoading(false);
      setRunning(false);
    }
  };

  useEffect(() => {
    setReport(null);
    setFilters({});
    setSearch('');
    loadReport({}, true);
  }, [reportId]);

  const filteredRows = useMemo(() => {
    if (!report?.rows) return [];
    if (!search.trim()) return report.rows;
    const q = search.trim().toLowerCase();
    return report.rows.filter((row) =>
      report.columns.some((column) => String(row[column.key] ?? '').toLowerCase().includes(q))
    );
  }, [report, search]);

  const handleFilterChange = (name, value) => {
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    loadReport(filters);
  };

  if (loading) return <div className="state-box">Loading...</div>;

  if (error && !report) {
    return (
      <div>
        <button className="btn btn-secondary" onClick={() => navigate('/reports')}>Back</button>
        <div className="state-box" style={{ color: 'var(--danger)' }}>{error}</div>
      </div>
    );
  }

  return (
    <div>
      <div className="view-header-bar">
        <div>
          <h1 className="page-title">{report.section} {report.title}</h1>
          <p className="page-subtitle">
            {report.groupName} • Member ID: {report.memberId} • {report.analysis ? 'Analysis report' : 'Normal report'}
          </p>
        </div>
        <div className="view-actions">
          <button className="btn btn-secondary" onClick={() => navigate('/reports')}>Back</button>
          <button className="btn btn-primary" onClick={() => window.print()}>Print</button>
        </div>
      </div>

      <div className="card" style={{ marginBottom: 18 }}>
        <div className="card-body">
          <h2 className="form-section-title">Query Screen</h2>
          <form onSubmit={handleSubmit}>
            <div className="form-grid-2">
              {report.filters.map((filter) => (
                <div key={filter.name}>
                  <label className="form-label">{filter.label}</label>
                  {filter.type === 'select' ? (
                    <select
                      className="form-input"
                      value={filters[filter.name] || ''}
                      onChange={(e) => handleFilterChange(filter.name, e.target.value)}
                    >
                      {filter.options.map((option) => {
                        const value = typeof option === 'object' ? option.value : option;
                        const label = typeof option === 'object' ? option.label : option;
                        return <option key={value} value={value}>{label}</option>;
                      })}
                    </select>
                  ) : (
                    <input
                      className="form-input"
                      type={filter.type}
                      value={filters[filter.name] || ''}
                      onChange={(e) => handleFilterChange(filter.name, e.target.value)}
                    />
                  )}
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 18 }}>
              <button className="btn btn-primary" type="submit" disabled={running}>
                {running ? 'Running...' : 'Query'}
              </button>
            </div>
          </form>
        </div>
      </div>

      <div className="card">
        <div className="card-body" style={{ paddingBottom: 0 }}>
          <div className="page-header" style={{ marginBottom: 14 }}>
            <div>
              <h2 className="form-section-title" style={{ marginBottom: 4 }}>Report Output</h2>
              <p className="page-subtitle">{filteredRows.length} row{filteredRows.length !== 1 ? 's' : ''} found</p>
            </div>
            {report.summary?.totalAmount !== undefined && (
              <div className="total-inner" style={{ minWidth: 220 }}>
                <span className="total-label">Total</span>
                <span className="total-value">{fmtMoney(report.summary.totalAmount)}</span>
              </div>
            )}
          </div>

          {report.detail && (
            <div className="invoice-parties" style={{ marginBottom: 18 }}>
              {Object.entries(report.detail)
                .filter(([key]) => !['line_no', 'notes'].includes(key))
                .slice(0, 8)
                .map(([key, value]) => (
                  <div key={key}>
                    <div className="invoice-party-label">{key.replaceAll('_', ' ')}</div>
                    <div className="invoice-party-name">
                      {key.includes('date') ? fmtDate(value) : String(value ?? '-')}
                    </div>
                  </div>
                ))}
            </div>
          )}

          <div className="filter-bar">
            <input
              className="form-input"
              style={{ minWidth: 260 }}
              placeholder="Search report output..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            {search && <button className="btn btn-secondary" onClick={() => setSearch('')}>Clear</button>}
          </div>
        </div>

        <div style={{ padding: '12px 24px 24px' }}>
          {error && <div className="state-box" style={{ color: 'var(--danger)' }}>{error}</div>}
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  {report.columns.map((column) => (
                    <th key={column.key} style={{ textAlign: column.align || 'left' }}>
                      {column.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredRows.length === 0 ? (
                  <tr>
                    <td colSpan={report.columns.length}>
                      <div className="state-box">No rows found.</div>
                    </td>
                  </tr>
                ) : filteredRows.map((row, index) => (
                  <tr key={`${report.id}-${index}`}>
                    {report.columns.map((column) => (
                      <td key={column.key} style={{ textAlign: column.align || 'left' }}>
                        {formatCell(row[column.key], column)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
