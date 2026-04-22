const mongoose = require('mongoose');

const testResultSchema = new mongoose.Schema({
  testName: { type: String, required: true },
  status: { type: String, enum: ['passed', 'failed', 'error', 'skipped'], required: true },
  duration: { type: Number, default: 0 },
  errorMessage: { type: String, default: '' }
});

const testRunSchema = new mongoose.Schema({
  triggeredBy: {
    type: String,
    enum: ['manual', 'git-webhook', 'scheduled'],
    default: 'manual'
  },
  status: {
    type: String,
    enum: ['running', 'completed', 'failed'],
    default: 'running'
  },
  startTime: { type: Date, default: Date.now },
  endTime: { type: Date },
  totalTests: { type: Number, default: 0 },
  passed: { type: Number, default: 0 },
  failed: { type: Number, default: 0 },
  skipped: { type: Number, default: 0 },
  results: [testResultSchema],
  logs: { type: String, default: '' },
  commitHash: { type: String, default: '' }
}, { timestamps: true });

module.exports = mongoose.model('TestRun', testRunSchema);
