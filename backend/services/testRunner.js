const { spawn } = require('child_process');
const path = require('path');
const TestRun = require('../models/TestRun');

const TESTING_ENGINE_PATH = path.resolve(__dirname, '../../testing-engine');

/**
 * Trigger tests and return the initial run record immediately.
 * The actual execution happens in the background to prevent HTTP timeouts.
 */
const runTests = async (triggeredBy = 'manual', commitHash = '', targetUrl = '') => {
  // Create a test run record immediately
  const testRun = new TestRun({
    triggeredBy,
    status: 'running',
    startTime: new Date(),
    commitHash
  });
  await testRun.save();

  // Run the tests in the background (fire and forget)
  executeTestsInBackground(testRun._id, targetUrl).catch(console.error);

  // Return the record immediately so the UI doesn't timeout
  return testRun;
};

const executeTestsInBackground = async (testRunId, targetUrl) => {
  try {
    const testRun = await TestRun.findById(testRunId);
    if (!testRun) return;

    const envVars = { ...process.env, PYTHONIOENCODING: 'utf-8' };
    if (targetUrl) {
      envVars.TARGET_URL = targetUrl;
    }

    const pythonCommand = process.platform === 'win32' ? 'python' : 'python3';
    const pythonProcess = spawn(pythonCommand, ['runner.py'], {
      cwd: TESTING_ENGINE_PATH,
      env: envVars,
      shell: true
    });

    let stdout = '';
    let stderr = '';

    pythonProcess.stdout.on('data', (data) => {
      stdout += data.toString();
    });

    pythonProcess.stderr.on('data', (data) => {
      stderr += data.toString();
    });

    pythonProcess.on('close', async (code) => {
      try {
        let results = [];
        let totalTests = 0, passed = 0, failed = 0, skipped = 0;

        try {
          const jsonOutput = JSON.parse(stdout.trim());
          results = jsonOutput.results || [];
          totalTests = jsonOutput.total || results.length;
          passed = jsonOutput.passed || results.filter(r => r.status === 'passed').length;
          failed = jsonOutput.failed || results.filter(r => r.status === 'failed').length;
          skipped = jsonOutput.skipped || 0;
        } catch (parseError) {
          results = [{
            testName: 'Test Suite',
            status: code === 0 ? 'passed' : 'failed',
            duration: 0,
            errorMessage: stderr || stdout || 'Unknown error'
          }];
          totalTests = 1;
          failed = code === 0 ? 0 : 1;
          passed = code === 0 ? 1 : 0;
        }

        testRun.status = failed > 0 ? 'failed' : 'completed';
        testRun.endTime = new Date();
        testRun.totalTests = totalTests;
        testRun.passed = passed;
        testRun.failed = failed;
        testRun.skipped = skipped;
        testRun.results = results;
        testRun.logs = stderr || stdout;
        await testRun.save();

      } catch (err) {
        testRun.status = 'failed';
        testRun.endTime = new Date();
        testRun.logs = `Error processing results: ${err.message}\nStdout: ${stdout}\nStderr: ${stderr}`;
        await testRun.save();
      }
    });

    pythonProcess.on('error', async (err) => {
      testRun.status = 'failed';
      testRun.endTime = new Date();
      testRun.logs = `Process error: ${err.message}`;
      await testRun.save();
    });

  } catch (err) {
    console.error('Background test execution failed:', err);
  }
};

module.exports = { runTests };
