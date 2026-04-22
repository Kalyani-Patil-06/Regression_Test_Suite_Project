const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { connectDB } = require('./config/db');

// Load env variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Connect to MongoDB
connectDB();

// Routes
app.use('/api/test-runs', require('./routes/testRuns'));
app.use('/api/interactions', require('./routes/interactions'));
app.use('/api/trigger', require('./routes/trigger'));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Start server
app.listen(PORT, () => {
  console.log(`\n🚀 Regression Testing Backend running on http://localhost:${PORT}`);
  console.log(`📊 Dashboard API: http://localhost:${PORT}/api/test-runs/stats/summary`);
  console.log(`🧪 Trigger tests: POST http://localhost:${PORT}/api/trigger\n`);
});
