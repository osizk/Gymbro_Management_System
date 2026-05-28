import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getReportGroups } from '../../api/reportApi';

export default function ReportList() {
  const navigate = useNavigate();
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchReports = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getReportGroups();
      setGroups(res.data || []);
    } catch {
      setError('Failed to load reports.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchReports(); }, []);

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Reports</h1>
          <p className="page-subtitle">PDF section 7 report modules, 3 reports each</p>
        </div>
      </div>

      {loading ? (
        <div className="card"><div className="state-box">Loading...</div></div>
      ) : error ? (
        <div className="card">
          <div className="state-box" style={{ color: 'var(--danger)' }}>
            {error} <button className="action-btn edit" onClick={fetchReports}>Retry</button>
          </div>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: 18 }}>
          {groups.map((group) => (
            <div className="card" key={group.id}>
              <div className="card-body">
                <div style={{ marginBottom: 16 }}>
                  <h2 className="form-section-title" style={{ marginBottom: 4 }}>{group.groupName}</h2>
                  <p className="page-subtitle">{group.reports.length} report{group.reports.length !== 1 ? 's' : ''}</p>
                </div>

                <div className="table-wrapper">
                  <table>
                    <thead>
                      <tr>
                        <th>Report Name</th>
                        <th>Description</th>
                        <th>Status</th>
                        <th style={{ textAlign: 'center' }}>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {group.reports.map((report) => (
                        <tr key={report.id}>
                          <td style={{ fontWeight: 600 }}>{report.title}</td>
                          <td>{report.description}</td>
                          <td>
                            <span className={`badge ${report.analysis ? 'badge-gray' : 'badge-green'}`}>
                              {report.analysis ? 'Analysis' : 'Normal'}
                            </span>
                          </td>
                          <td style={{ textAlign: 'center' }}>
                            <button
                              className="action-btn edit"
                              onClick={() => navigate(`/reports/${report.id}`)}
                            >
                              Open
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
