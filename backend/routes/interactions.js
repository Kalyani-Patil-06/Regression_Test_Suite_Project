const express = require('express');
const router = express.Router();
const UserInteraction = require('../models/UserInteraction');

// POST /api/interactions — capture user interactions
router.post('/', async (req, res) => {
  try {
    const { sessionId, url, actions } = req.body;

    if (!sessionId || !url || !actions || !actions.length) {
      return res.status(400).json({ error: 'sessionId, url, and actions are required' });
    }

    const interaction = new UserInteraction({ sessionId, url, actions });
    await interaction.save();

    res.status(201).json({ message: 'Interactions captured', id: interaction._id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/interactions — get recent interactions
router.get('/', async (req, res) => {
  try {
    const interactions = await UserInteraction.find()
      .sort({ createdAt: -1 })
      .limit(20);
    res.json(interactions);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
