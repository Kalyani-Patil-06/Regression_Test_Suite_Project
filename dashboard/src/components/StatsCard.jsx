export default function StatsCard({ icon, value, label, color = 'purple' }) {
  return (
    <div className={`card stat-card ${color}`}>
      <div className="stat-icon">{icon}</div>
      <div className="stat-value">{value}</div>
      <div className="stat-label">{label}</div>
    </div>
  );
}
