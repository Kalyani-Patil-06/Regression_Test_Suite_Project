import { NavLink } from 'react-router-dom';

export default function Sidebar() {
  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <h1>RegTest Pro</h1>
        <span>Automated Testing System</span>
      </div>
      <nav className="sidebar-nav">
        <NavLink to="/" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`} end>
          <span className="sidebar-icon">📊</span>
          <span>Dashboard</span>
        </NavLink>
        <NavLink to="/runs" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
          <span className="sidebar-icon">🧪</span>
          <span>Test Runs</span>
        </NavLink>
        <NavLink to="/trigger" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
          <span className="sidebar-icon">🚀</span>
          <span>Run Tests</span>
        </NavLink>
      </nav>
      <div style={{ padding: '16px 24px', borderTop: '1px solid var(--border)' }}>
        <div style={{ fontSize: '11px', color: 'var(--text-muted)', lineHeight: 1.5 }}>
          Regression Testing<br/>System v1.0
        </div>
      </div>
    </aside>
  );
}
