const express = require('express');
const router = express.Router();
const { runTests } = require('../services/testRunner');

// POST /api/trigger — trigger a test run
router.post('/', async (req, res) => {
  try {
    const { triggeredBy = 'manual', commitHash = '', targetUrl = '' } = req.body;

    // Start the test run (async)
    const testRun = await runTests(triggeredBy, commitHash, targetUrl);

    res.json({
      message: 'Test run completed',
      runId: testRun._id,
      status: testRun.status,
      totalTests: testRun.totalTests,
      passed: testRun.passed,
      failed: testRun.failed
    });
  } catch (err) {
    res.status(500).json({ error: `Test execution failed: ${err.message}` });
  }
});

// POST /api/trigger/webhook — Git webhook endpoint
router.post('/webhook', async (req, res) => {
  try {
    const commitHash = req.body.head_commit?.id || req.body.after || '';

    // Acknowledge webhook immediately
    res.status(202).json({ message: 'Test run triggered via webhook' });

    // In a real scenario, the target URL might be derived from the repo or a config
    const targetUrl = req.body.repository?.homepage || '';

    // Run tests in background
    runTests('git-webhook', commitHash, targetUrl).catch(console.error);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
