const crypto = require('crypto');

const interactions = [];

class UserInteraction {
  constructor(data) {
    this._id = data._id || crypto.randomUUID();
    this.sessionId = data.sessionId || '';
    this.url = data.url || '';
    this.actions = data.actions || [];
    this.createdAt = data.createdAt || new Date();
  }

  async save() {
    interactions.push(this);
    return this;
  }

  static find(query = {}) {
    let results = interactions.filter(r => {
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
              then: (resolve) => resolve(results)
            };
          },
          then: (resolve) => resolve(results)
        };
      },
      then: (resolve) => resolve(results)
    };
  }
}

module.exports = UserInteraction;
