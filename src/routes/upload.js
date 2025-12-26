const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');
const upload = require('../config/multer');
const { parseGPXFile } = require('../services/gpxParser');
const { parseTCXFile } = require('../services/tcxParser');

router.post('/upload', upload.single('gpxFile'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const filePath = path.join(__dirname, '../../', req.file.path);
    const ext = path.extname(req.file.originalname).toLowerCase();
    
    let parsedData;
    
    if (ext === '.gpx') {
      parsedData = await parseGPXFile(filePath);
    } else if (ext === '.tcx') {
      parsedData = await parseTCXFile(filePath);
    } else {
      return res.status(400).json({ error: 'Unsupported file format' });
    }

    fs.unlinkSync(filePath);

    res.json({
      success: true,
      filename: req.file.originalname,
      data: parsedData
    });

  } catch (error) {
    console.error('Error processing file:', error);
    res.status(500).json({ 
      error: 'Error processing file', 
      details: error.message 
    });
  }
});

module.exports = router;
