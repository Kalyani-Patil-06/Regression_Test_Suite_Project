const crypto = require('crypto');

const testRuns = [];

class TestRun {
  constructor(data) {
    this._id = data._id || crypto.randomUUID();
    this.triggeredBy = data.triggeredBy || 'manual';
    this.status = data.status || 'running';
    this.startTime = data.startTime || new Date();
    this.endTime = data.endTime || null;
    this.totalTests = data.totalTests || 0;
    this.passed = data.passed || 0;
    this.failed = data.failed || 0;
    this.skipped = data.skipped || 0;
    this.results = data.results || [];
    this.logs = data.logs || '';
    this.commitHash = data.commitHash || '';
    this.createdAt = data.createdAt || new Date();
    this.updatedAt = data.updatedAt || new Date();
  }

  async save() {
    this.updatedAt = new Date();
    const existingIndex = testRuns.findIndex(r => r._id === this._id);
    if (existingIndex !== -1) {
      testRuns[existingIndex] = this;
    } else {
      testRuns.push(this);
    }
    return this;
  }

  toObject() {
    return { ...this };
  }

  static async findById(id) {
    return testRuns.find(r => r._id === id) || null;
  }

  static find(query = {}) {
    let results = testRuns.filter(r => {
      for (const key in query) {
        if (r[key] !== query[key]) return false;
      }
      return true;
    });

    return {
      sort: (sortArgs) => {
        if (sortArgs.createdAt === -1) {
          results.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        }
        return {
          limit: (limitArgs) => {
            results = results.slice(0, limitArgs);
            return {
              select: () => ({ then: (resolve) => resolve(results) }),
              then: (resolve) => resolve(results)
            };
          },
          select: () => ({ then: (resolve) => resolve(results) }),
          then: (resolve) => resolve(results)
        };
      },
      then: (resolve) => resolve(results)
    };
  }

  static async countDocuments() {
    return testRuns.length;
  }

  static findOne() {
    return {
      sort: (sortArgs) => {
        let results = [...testRuns];
        if (sortArgs.createdAt === -1) {
          results.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        }
        return {
          then: (resolve) => resolve(results[0] || null)
        };
      }
    };
  }

  static async aggregate(pipeline) {
    let totalTests = 0, totalPassed = 0, totalFailed = 0;
    for (const r of testRuns) {
      totalTests += r.totalTests || 0;
      totalPassed += r.passed || 0;
      totalFailed += r.failed || 0;
    }
    return [{ totalTests, totalPassed, totalFailed }];
  }
}

module.exports = TestRun;
