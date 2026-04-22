const express = require('express');
const router = express.Router();
const TestRun = require('../models/TestRun');

// GET /api/test-runs — all test runs (sorted newest first)
router.get('/', async (req, res) => {
  try {
    const runs = await TestRun.find().sort({ createdAt: -1 }).limit(50);
    res.json(runs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/test-runs/:id — single test run details
router.get('/:id', async (req, res) => {
  try {
    const run = await TestRun.findById(req.params.id);
    if (!run) return res.status(404).json({ error: 'Test run not found' });
    res.json(run);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/test-runs/stats/summary — dashboard summary stats
router.get('/stats/summary', async (req, res) => {
  try {
    const totalRuns = await TestRun.countDocuments();
    const lastRun = await TestRun.findOne().sort({ createdAt: -1 });

    const aggregation = await TestRun.aggregate([
      {
        $group: {
          _id: null,
          totalTests: { $sum: '$totalTests' },
          totalPassed: { $sum: '$passed' },
          totalFailed: { $sum: '$failed' }
        }
      }
    ]);

    const stats = aggregation[0] || { totalTests: 0, totalPassed: 0, totalFailed: 0 };

    res.json({
      totalRuns,
      totalTests: stats.totalTests,
      totalPassed: stats.totalPassed,
      totalFailed: stats.totalFailed,
      passRate: stats.totalTests > 0
        ? Math.round((stats.totalPassed / stats.totalTests) * 100)
        : 0,
      lastRun: lastRun || null
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/test-runs/stats/chart — data for chart (last 10 runs)
router.get('/stats/chart', async (req, res) => {
  try {
    const runs = await TestRun.find({ status: 'completed' })
      .sort({ createdAt: -1 })
      .limit(10)
      .select('createdAt totalTests passed failed');

    res.json(runs.reverse());
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
