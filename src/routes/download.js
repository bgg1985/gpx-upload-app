const express = require('express');
const router = express.Router();
const { generateGPXFile } = require('../services/gpxGenerator');

router.post('/generate-gpx', async (req, res) => {
  try {
    const { data, establishments } = req.body;

    if (!data || !data.track) {
      return res.status(400).json({ error: 'Invalid data' });
    }

    const gpxContent = generateGPXFile(data, establishments || []);

    res.setHeader('Content-Type', 'application/gpx+xml');
    res.setHeader('Content-Disposition', 'attachment; filename="route-with-pubs.gpx"');
    res.send(gpxContent);

  } catch (error) {
    console.error('Error generating GPX:', error);
    res.status(500).json({ 
      error: 'Error generating GPX file', 
      details: error.message 
    });
  }
});

module.exports = router;
