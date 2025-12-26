const express = require('express');
const router = express.Router();
const { searchDrinkingEstablishments } = require('../services/osmSearch');

router.post('/search-establishments', async (req, res) => {
  try {
    const { track, distance } = req.body;

    if (!track || !Array.isArray(track) || track.length === 0) {
      return res.status(400).json({ error: 'Invalid track data' });
    }

    const maxDistance = parseInt(distance) || 100;

    const establishments = await searchDrinkingEstablishments(track, maxDistance);

    res.json({
      success: true,
      establishments: establishments,
      count: establishments.length
    });

  } catch (error) {
    console.error('Error searching establishments:', error);
    res.status(500).json({ 
      error: 'Error searching establishments', 
      details: error.message 
    });
  }
});

module.exports = router;
