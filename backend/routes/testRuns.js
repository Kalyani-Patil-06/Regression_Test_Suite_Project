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

// GET /api/test-runs/:id/download — download CSV report
router.get('/:id/download', async (req, res) => {
  try {
    const run = await TestRun.findById(req.params.id);
    if (!run) return res.status(404).json({ error: 'Test run not found' });

    const date = new Date(run.createdAt).toLocaleString('en-IN');
    const duration = run.startTime && run.endTime
      ? ((new Date(run.endTime) - new Date(run.startTime)) / 1000).toFixed(1) + 's'
      : 'N/A';

    let csv = '';
    csv += 'REGRESSION TEST REPORT\r\n';
    csv += '========================\r\n\r\n';
    csv += `Run ID,${run._id}\r\n`;
    csv += `Date,${date}\r\n`;
    csv += `Triggered By,${run.triggeredBy}\r\n`;
    csv += `Status,${run.status}\r\n`;
    csv += `Duration,${duration}\r\n\r\n`;
    csv += `SUMMARY\r\n`;
    csv += `Total Tests,${run.totalTests}\r\n`;
    csv += `Passed,${run.passed}\r\n`;
    csv += `Failed,${run.failed}\r\n`;
    csv += `Skipped,${run.skipped}\r\n`;
    csv += `Pass Rate,${run.totalTests > 0 ? Math.round((run.passed / run.totalTests) * 100) : 0}%\r\n\r\n`;
    csv += 'INDIVIDUAL TEST RESULTS\r\n';
    csv += 'Test Name,Status,Duration,Error Message\r\n';

    if (run.results && run.results.length > 0) {
      run.results.forEach(r => {
        const errMsg = (r.errorMessage || '').replace(/"/g, '""');
        csv += `"${r.testName}",${r.status},${r.duration || 0}s,"${errMsg}"\r\n`;
      });
    }

    const filename = `test_report_${run._id.toString().slice(-8)}_${Date.now()}.csv`;
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(csv);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
