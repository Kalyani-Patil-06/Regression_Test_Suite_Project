import { useState, useEffect } from 'react';
import StatsCard from '../components/StatsCard';
import TestChart from '../components/TestChart';
import { getStats, getChartData, getTestRuns } from '../services/api';

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [chartData, setChartData] = useState([]);
  const [recentRuns, setRecentRuns] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [statsRes, chartRes, runsRes] = await Promise.all([
        getStats().catch(() => ({ data: null })),
        getChartData().catch(() => ({ data: [] })),
        getTestRuns().catch(() => ({ data: [] }))
      ]);
      setStats(statsRes.data);
      setChartData(chartRes.data);
      setRecentRuns(runsRes.data?.slice(0, 5) || []);
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="loading-spinner">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="page-header">
        <h2>Dashboard</h2>
        <p>Overview of your automated regression testing system</p>
      </div>

      <div className="stats-grid">
        <StatsCard
          icon="🧪"
          value={stats?.totalTests || 0}
          label="Total Tests Executed"
          color="purple"
        />
        <StatsCard
          icon="✅"
          value={stats?.totalPassed || 0}
          label="Tests Passed"
          color="green"
        />
        <StatsCard
          icon="❌"
          value={stats?.totalFailed || 0}
          label="Tests Failed"
          color="red"
        />
        <StatsCard
          icon="📈"
          value={`${stats?.passRate || 0}%`}
          label="Pass Rate"
          color="blue"
        />
      </div>

      <TestChart data={chartData} />

      <div className="card" style={{ marginTop: '24px' }}>
        <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '16px', padding: '0 8px' }}>
          Recent Test Runs
        </h3>
        {recentRuns.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">🚀</div>
            <h3>No test runs yet</h3>
            <p>Go to "Run Tests" to trigger your first test run</p>
          </div>
        ) : (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Run ID</th>
                  <th>Trigger</th>
                  <th>Status</th>
                  <th>Tests</th>
                  <th>Passed</th>
                  <th>Failed</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {recentRuns.map(run => (
                  <tr key={run._id}>
                    <td style={{ fontFamily: 'monospace', fontSize: '12px' }}>
                      {run._id?.slice(-8)}
                    </td>
                    <td><span className={`badge ${run.triggeredBy}`}>{run.triggeredBy}</span></td>
                    <td><span className={`badge ${run.status}`}>{run.status}</span></td>
                    <td>{run.totalTests}</td>
                    <td style={{ color: 'var(--success)' }}>{run.passed}</td>
                    <td style={{ color: run.failed > 0 ? 'var(--danger)' : 'inherit' }}>{run.failed}</td>
                    <td>{new Date(run.createdAt).toLocaleString('en-IN')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
