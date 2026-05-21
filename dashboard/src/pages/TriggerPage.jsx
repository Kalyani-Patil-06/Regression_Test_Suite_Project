import { useState } from 'react';
import { triggerTests } from '../services/api';
import LogViewer from '../components/LogViewer';

export default function TriggerPage() {
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [lastRun, setLastRun] = useState(null);
  const [targetUrl, setTargetUrl] = useState('https://the-internet.herokuapp.com');

  const handleManualTrigger = async () => {
    setRunning(true);
    setError(null);
    setResult(null);

    try {
      const res = await triggerTests({ triggeredBy: 'manual', targetUrl });
      setResult(res.data);
      setLastRun(res.data);
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Test execution failed');
    } finally {
      setRunning(false);
    }
  };

  return (
    <div>
      <div className="page-header">
        <h2>Run Tests</h2>
        <p>Trigger regression tests manually or configure Git webhook</p>
      </div>

      <div className="trigger-section">
        {/* Manual Trigger */}
        <div className="card trigger-card">
          <div className="trigger-icon"></div>
          <h3>Manual Trigger</h3>
          <p>Run the full regression test suite immediately against the specified URL.</p>

          <div style={{ width: '100%', marginBottom: '20px', textAlign: 'left' }}>
            <label style={{ display: 'block', fontSize: '13px', color: 'var(--text-muted)', marginBottom: '8px' }}>Target Website URL</label>
            <input
              type="text"
              value={targetUrl}
              onChange={(e) => setTargetUrl(e.target.value)}
              placeholder="https://example.com"
              style={{
                width: '100%',
                padding: '12px 16px',
                background: 'rgba(10, 10, 18, 0.6)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-sm)',
                color: 'var(--text-primary)',
                fontFamily: 'inherit',
                fontSize: '14px'
              }}
            />
          </div>

          <button
            className="btn btn-primary btn-lg"
            onClick={handleManualTrigger}
            disabled={running || !targetUrl}
          >
            {running ? (
              <>
                <span className="spinner" style={{ width: '18px', height: '18px', borderWidth: '2px' }}></span>
                Running Tests...
              </>
            ) : (
              '▶ Run All Tests'
            )}
          </button>
        </div>

        {/* Webhook Config */}
        <div className="card trigger-card">
          <div className="trigger-icon"></div>
          <h3>Git Webhook</h3>
          <p>Configure your Git repository to automatically trigger tests on every push/commit.</p>
          <div style={{
            background: 'rgba(10, 10, 18, 0.6)',
            borderRadius: 'var(--radius-sm)',
            padding: '12px 16px',
            width: '100%',
            fontFamily: 'monospace',
            fontSize: '12px',
            color: 'var(--text-secondary)',
            wordBreak: 'break-all',
            textAlign: 'left',
            marginBottom: '12px'
          }}>
            POST http://localhost:5000/api/trigger/webhook
          </div>
          <button
            className="btn btn-secondary"
            onClick={() => navigator.clipboard.writeText('http://localhost:5000/api/trigger/webhook')}
          >
            Copy Webhook URL
          </button>
        </div>
      </div>

      {/* Results Panel */}
      {(result || error) && (
        <div className="results-panel">
          {error && (
            <div className="card" style={{ borderColor: 'rgba(255, 107, 107, 0.3)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: 'var(--danger)' }}>
                <span style={{ fontSize: '24px', fontWeight: 700 }}>!</span>
                <div>
                  <h3 style={{ fontSize: '16px', marginBottom: '4px' }}>Test Execution Failed</h3>
                  <p style={{ color: 'var(--text-muted)', fontSize: '13px' }}>{error}</p>
                </div>
              </div>
            </div>
          )}

          {result && (
            <div className="card" style={{ marginTop: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h3 style={{ fontSize: '18px', fontWeight: 600 }}>Test Results</h3>
                <span className={`badge ${result.status}`}>{result.status}</span>
              </div>

              <div className="stats-grid" style={{ marginBottom: '20px' }}>
                <div style={{
                  padding: '16px',
                  background: 'rgba(108, 92, 231, 0.08)',
                  borderRadius: 'var(--radius-sm)',
                  textAlign: 'center'
                }}>
                  <div style={{ fontSize: '24px', fontWeight: 700 }}>{result.totalTests}</div>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Total</div>
                </div>
                <div style={{
                  padding: '16px',
                  background: 'var(--success-bg)',
                  borderRadius: 'var(--radius-sm)',
                  textAlign: 'center'
                }}>
                  <div style={{ fontSize: '24px', fontWeight: 700, color: 'var(--success)' }}>{result.passed}</div>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Passed</div>
                </div>
                <div style={{
                  padding: '16px',
                  background: 'var(--danger-bg)',
                  borderRadius: 'var(--radius-sm)',
                  textAlign: 'center'
                }}>
                  <div style={{ fontSize: '24px', fontWeight: 700, color: 'var(--danger)' }}>{result.failed}</div>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Failed</div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* System Info */}
      <div className="card" style={{ marginTop: '24px' }}>
        <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '16px' }}>System Information</h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          <div style={{ fontSize: '13px' }}>
            <span style={{ color: 'var(--text-muted)' }}>Testing Engine:</span>{' '}
            <span>Python + Selenium + Pytest</span>
          </div>
          <div style={{ fontSize: '13px' }}>
            <span style={{ color: 'var(--text-muted)' }}>Test Target:</span>{' '}
            <span>the-internet.herokuapp.com</span>
          </div>
          <div style={{ fontSize: '13px' }}>
            <span style={{ color: 'var(--text-muted)' }}>Browser:</span>{' '}
            <span>Chrome (Headless)</span>
          </div>
          <div style={{ fontSize: '13px' }}>
            <span style={{ color: 'var(--text-muted)' }}>Dynamic Tests:</span>{' '}
            <span>Ephemeral (run &amp; discard)</span>
          </div>
        </div>
      </div>
    </div>
  );
}
