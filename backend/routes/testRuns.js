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

// GET /api/test-runs/:id/download — download PDF report
router.get('/:id/download', async (req, res) => {
  try {
    const PDFDocument = require('pdfkit');
    const run = await TestRun.findById(req.params.id);
    if (!run) return res.status(404).json({ error: 'Test run not found' });

    const date = new Date(run.createdAt).toLocaleString('en-IN');
    const duration = run.startTime && run.endTime
      ? ((new Date(run.endTime) - new Date(run.startTime)) / 1000).toFixed(1) + 's'
      : 'N/A';
    const passRate = run.totalTests > 0 ? Math.round((run.passed / run.totalTests) * 100) : 0;

    const doc = new PDFDocument({ size: 'A4', margin: 50 });
    const filename = `test_report_${run._id.toString().slice(-8)}.pdf`;

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    doc.pipe(res);

    // --- Header ---
    doc.rect(0, 0, 595, 100).fill('#1a1a2e');
    doc.fontSize(24).fillColor('#ffffff').text('RegTest Pro', 50, 30, { continued: true });
    doc.fontSize(10).fillColor('#a0a0c0').text('  AUTOMATED TESTING SYSTEM', { baseline: 'bottom' });
    doc.fontSize(12).fillColor('#c0c0e0').text('Regression Test Report', 50, 62);

    // --- Run Info Section ---
    doc.fillColor('#333333');
    let y = 120;
    doc.fontSize(14).fillColor('#1a1a2e').text('Run Details', 50, y);
    y += 25;
    doc.fontSize(10).fillColor('#666666');
    doc.text(`Run ID:`, 50, y); doc.fillColor('#333').text(run._id, 150, y);
    y += 18;
    doc.fillColor('#666').text(`Date:`, 50, y); doc.fillColor('#333').text(date, 150, y);
    y += 18;
    doc.fillColor('#666').text(`Triggered By:`, 50, y); doc.fillColor('#333').text(run.triggeredBy, 150, y);
    y += 18;
    doc.fillColor('#666').text(`Duration:`, 50, y); doc.fillColor('#333').text(duration, 150, y);
    y += 18;
    const statusColor = run.status === 'completed' ? '#27ae60' : '#e74c3c';
    doc.fillColor('#666').text(`Status:`, 50, y); doc.fillColor(statusColor).text(run.status.toUpperCase(), 150, y);

    // --- Summary Boxes ---
    y += 35;
    doc.fontSize(14).fillColor('#1a1a2e').text('Summary', 50, y);
    y += 25;

    const boxW = 120, boxH = 55, gap = 12;
    const boxes = [
      { label: 'Total Tests', value: run.totalTests, color: '#6c5ce7' },
      { label: 'Passed', value: run.passed, color: '#27ae60' },
      { label: 'Failed', value: run.failed, color: '#e74c3c' },
      { label: 'Pass Rate', value: `${passRate}%`, color: '#2980b9' }
    ];

    boxes.forEach((box, i) => {
      const x = 50 + i * (boxW + gap);
      doc.roundedRect(x, y, boxW, boxH, 6).fillAndStroke(box.color, box.color);
      doc.fontSize(20).fillColor('#ffffff').text(String(box.value), x, y + 8, { width: boxW, align: 'center' });
      doc.fontSize(8).fillColor('#e0e0e0').text(box.label, x, y + 35, { width: boxW, align: 'center' });
    });

    // --- Individual Test Results Table ---
    y += boxH + 30;
    doc.fontSize(14).fillColor('#1a1a2e').text('Individual Test Results', 50, y);
    y += 25;

    // Table header
    doc.rect(50, y, 495, 22).fill('#1a1a2e');
    doc.fontSize(9).fillColor('#ffffff');
    doc.text('#', 55, y + 6, { width: 25 });
    doc.text('Test Name', 80, y + 6, { width: 300 });
    doc.text('Status', 390, y + 6, { width: 70 });
    doc.text('Duration', 465, y + 6, { width: 70 });
    y += 22;

    // Table rows
    if (run.results && run.results.length > 0) {
      run.results.forEach((r, idx) => {
        if (y > 750) {
          doc.addPage();
          y = 50;
        }
        const rowBg = idx % 2 === 0 ? '#f8f9fa' : '#ffffff';
        doc.rect(50, y, 495, 20).fill(rowBg);
        doc.fontSize(8).fillColor('#333333');
        doc.text(String(idx + 1), 55, y + 6, { width: 25 });

        // Shorten test name for display
        const shortName = r.testName.split('::').pop() || r.testName;
        doc.text(shortName, 80, y + 6, { width: 300 });

        const sColor = r.status === 'passed' ? '#27ae60' : '#e74c3c';
        doc.fillColor(sColor).text(r.status.toUpperCase(), 390, y + 6, { width: 70 });
        doc.fillColor('#333').text(`${r.duration || 0}s`, 465, y + 6, { width: 70 });
        y += 20;
      });
    } else {
      doc.fontSize(10).fillColor('#999').text('No individual results available.', 50, y + 5);
    }

    // --- Footer ---
    y = 780;
    doc.fontSize(8).fillColor('#aaaaaa').text(
      `Generated by RegTest Pro • ${new Date().toLocaleString('en-IN')}`,
      50, y, { width: 495, align: 'center' }
    );

    doc.end();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
