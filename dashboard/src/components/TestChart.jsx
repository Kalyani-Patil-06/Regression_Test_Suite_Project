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
        backgroundColor: 'rgba(5, 196, 107, 0.25)',
        borderColor: '#05c46b',
        borderWidth: 1.5,
        borderRadius: 6,
      },
      {
        label: 'Failed',
        data: data.map(r => r.failed),
        backgroundColor: 'rgba(255, 94, 87, 0.25)',
        borderColor: '#ff5e57',
        borderWidth: 1.5,
        borderRadius: 6,
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
          color: '#a5a5cc',
          font: { family: 'Plus Jakarta Sans', size: 12, weight: '600' },
          boxWidth: 10,
          boxHeight: 10,
          padding: 20
        }
      },
      tooltip: {
        backgroundColor: '#0b0b14',
        titleColor: '#f3f3f7',
        bodyColor: '#a5a5cc',
        borderColor: 'rgba(125, 95, 255, 0.15)',
        borderWidth: 1,
        cornerRadius: 10,
        padding: 12,
        titleFont: { family: 'Plus Jakarta Sans', weight: '700' },
        bodyFont: { family: 'Plus Jakarta Sans' }
      }
    },
    scales: {
      x: {
        grid: { color: 'rgba(125, 95, 255, 0.05)' },
        ticks: { color: '#64648c', font: { family: 'Plus Jakarta Sans', size: 11, weight: '500' } }
      },
      y: {
        grid: { color: 'rgba(125, 95, 255, 0.05)' },
        ticks: { color: '#64648c', font: { family: 'Plus Jakarta Sans', size: 11, weight: '500' }, stepSize: 1 },
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
