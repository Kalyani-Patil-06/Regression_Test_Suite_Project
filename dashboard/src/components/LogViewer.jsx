export default function LogViewer({ logs }) {
  if (!logs) return null;

  return (
    <div className="log-viewer">
      {logs}
    </div>
  );
}
