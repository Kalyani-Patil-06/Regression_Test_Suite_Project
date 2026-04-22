import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

export default function TestChart({ data }) {
  if (!data || data.length === 0) {
    return (
      <div className="card chart-container">
        <h3>Test Results History</h3>
        <div className="empty-state">
          <p>No test data yet. Run some tests to see the chart.</p>
        </div>
      </div>
    );
  }

  const labels = data.map((run, idx) => {
    const date = new Date(run.createdAt);
    return date.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' });
  });

  const chartData = {
    labels,
    datasets: [
      {
        label: 'Passed',
        data: data.map(r => r.passed),
        backgroundColor: 'rgba(0, 210, 160, 0.7)',
        borderColor: '#00d2a0',
        borderWidth: 1,
        borderRadius: 4,
      },
      {
        label: 'Failed',
        data: data.map(r => r.failed),
        backgroundColor: 'rgba(255, 107, 107, 0.7)',
        borderColor: '#ff6b6b',
        borderWidth: 1,
        borderRadius: 4,
      }
    ]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          color: '#a0a0b8',
          font: { family: 'Inter', size: 12 },
          boxWidth: 12,
          padding: 16
        }
      },
      tooltip: {
        backgroundColor: '#1a1a2e',
        titleColor: '#f0f0f5',
        bodyColor: '#a0a0b8',
        borderColor: 'rgba(255,255,255,0.06)',
        borderWidth: 1,
        cornerRadius: 8,
        padding: 12
      }
    },
    scales: {
      x: {
        grid: { color: 'rgba(255,255,255,0.04)' },
        ticks: { color: '#6b6b80', font: { family: 'Inter', size: 11 } }
      },
      y: {
        grid: { color: 'rgba(255,255,255,0.04)' },
        ticks: { color: '#6b6b80', font: { family: 'Inter', size: 11 }, stepSize: 1 },
        beginAtZero: true
      }
    }
  };

  return (
    <div className="card chart-container">
      <h3>Test Results History</h3>
      <div style={{ height: '280px' }}>
        <Bar data={chartData} options={options} />
      </div>
    </div>
  );
}
