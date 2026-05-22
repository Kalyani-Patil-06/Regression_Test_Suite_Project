import { useState, useEffect } from 'react';
import { getTestRuns, downloadReport } from '../services/api';
import LogViewer from '../components/LogViewer';

export default function TestRuns() {
  const [runs, setRuns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState(null);

  useEffect(() => {
    loadRuns();
  }, []);

  const loadRuns = async () => {
    try {
      const res = await getTestRuns();
      setRuns(res.data);
    } catch (err) {
      console.error('Failed to load test runs:', err);
    } finally {
      setLoading(false);
    }
  };

  const toggleExpand = (id) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const formatDuration = (start, end) => {
    if (!start || !end) return '—';
    const ms = new Date(end) - new Date(start);
    if (ms < 1000) return `${ms}ms`;
    return `${(ms / 1000).toFixed(1)}s`;
  };

  if (loading) {
    return <div className="loading-spinner"><div className="spinner"></div></div>;
  }

  return (
    <div>
      <div className="page-header">
        <h2>Test Runs</h2>
        <p>History of all regression test executions</p>
      </div>

      {runs.length === 0 ? (
        <div className="card">
          <div className="empty-state">
            <div className="empty-icon">--</div>
            <h3>No test runs recorded</h3>
            <p>Trigger a test run to see results here</p>
          </div>
        </div>
      ) : (
        <div className="card">
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th></th>
                  <th>Run ID</th>
                  <th>Trigger</th>
                  <th>Status</th>
                  <th>Total</th>
                  <th>Passed</th>
                  <th>Failed</th>
                  <th>Duration</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {runs.map(run => (
                  <>
                    <tr
                      key={run._id}
                      className="expandable-row"
                      onClick={() => toggleExpand(run._id)}
                      style={{ cursor: 'pointer' }}
                    >
                      <td style={{ width: '30px', textAlign: 'center' }}>
                        {expandedId === run._id ? '▼' : '▶'}
                      </td>
                      <td style={{ fontFamily: 'monospace', fontSize: '12px' }}>
                        {run._id?.slice(-8)}
                      </td>
                      <td><span className={`badge ${run.triggeredBy}`}>{run.triggeredBy}</span></td>
                      <td><span className={`badge ${run.status}`}>{run.status}</span></td>
                      <td>{run.totalTests}</td>
                      <td style={{ color: 'var(--success)' }}>{run.passed}</td>
                      <td style={{ color: run.failed > 0 ? 'var(--danger)' : 'inherit' }}>{run.failed}</td>
                      <td>{formatDuration(run.startTime, run.endTime)}</td>
                      <td>{new Date(run.createdAt).toLocaleString('en-IN')}</td>
                    </tr>
                    {expandedId === run._id && (
                      <tr key={`${run._id}-expand`}>
                        <td colSpan="9" style={{ padding: 0 }}>
                          <div className="expand-content">
                            <h4 style={{ fontSize: '14px', fontWeight: 600, marginBottom: '12px' }}>
                              Individual Test Results
                            </h4>
                            {run.results && run.results.length > 0 ? (
                              <div>
                                {run.results.map((result, idx) => (
                                  <div key={idx} className="result-item">
                                    <span className="test-name">{result.testName}</span>
                                    <span className="test-duration">
                                      {result.duration ? `${result.duration}s` : ''}
                                    </span>
                                    <span className={`badge ${result.status}`}>{result.status}</span>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <p style={{ color: 'var(--text-muted)', fontSize: '13px' }}>
                                No individual results available
                              </p>
                            )}

                            {run.logs && (
                              <div style={{ marginTop: '16px' }}>
                                <h4 style={{ fontSize: '14px', fontWeight: 600, marginBottom: '8px' }}>
                                  Execution Logs
                                </h4>
                                <LogViewer logs={run.logs} />
                              </div>
                            )}

                            <div style={{ marginTop: '16px', display: 'flex', justifyContent: 'flex-end' }}>
                              <button
                                className="btn btn-primary"
                                onClick={(e) => { e.stopPropagation(); downloadReport(run._id); }}
                                style={{ fontSize: '13px', padding: '8px 20px' }}
                              >
                                ⬇ Download Report (CSV)
                              </button>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
