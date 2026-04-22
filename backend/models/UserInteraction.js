const mongoose = require('mongoose');

const actionSchema = new mongoose.Schema({
  type: { type: String, enum: ['click', 'input', 'submit', 'navigate', 'scroll'], required: true },
  selector: { type: String, default: '' },
  value: { type: String, default: '' },
  url: { type: String, default: '' },
  timestamp: { type: Date, default: Date.now }
});

const userInteractionSchema = new mongoose.Schema({
  sessionId: { type: String, required: true },
  url: { type: String, required: true },
  actions: [actionSchema],
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('UserInteraction', userInteractionSchema);
