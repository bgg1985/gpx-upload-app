const fs = require('fs');
const xml2js = require('xml2js');

function parseGPXFile(filePath) {
  return new Promise((resolve, reject) => {
    fs.readFile(filePath, 'utf-8', (err, data) => {
      if (err) {
        reject(err);
        return;
      }

      xml2js.parseString(data, { explicitArray: false }, (err, result) => {
        if (err) {
          reject(err);
          return;
        }

        try {
          const gpxData = {
            metadata: {},
            waypoints: [],
            track: []
          };

          if (result.gpx && result.gpx.metadata) {
            gpxData.metadata = {
              name: result.gpx.metadata.name || 'Unnamed Route',
              time: result.gpx.metadata.time || null
            };
          }

          if (result.gpx && result.gpx.wpt) {
            const waypoints = Array.isArray(result.gpx.wpt) 
              ? result.gpx.wpt 
              : [result.gpx.wpt];

            gpxData.waypoints = waypoints.map(wpt => ({
              lat: parseFloat(wpt.$.lat),
              lon: parseFloat(wpt.$.lon),
              name: wpt.name || 'Unnamed',
              desc: wpt.desc || '',
              ele: wpt.ele ? parseFloat(wpt.ele) : null,
              type: wpt.type || 'generic',
              sym: wpt.sym || 'Dot'
            }));
          }

          if (result.gpx && result.gpx.trk && result.gpx.trk.trkseg) {
            const segments = Array.isArray(result.gpx.trk.trkseg) 
              ? result.gpx.trk.trkseg 
              : [result.gpx.trk.trkseg];

            segments.forEach(segment => {
              const points = Array.isArray(segment.trkpt) 
                ? segment.trkpt 
                : [segment.trkpt];

              points.forEach(pt => {
                gpxData.track.push({
                  lat: parseFloat(pt.$.lat),
                  lon: parseFloat(pt.$.lon),
                  ele: pt.ele ? parseFloat(pt.ele) : null,
                  time: pt.time || null
                });
              });
            });
          }

          resolve(gpxData);
        } catch (parseError) {
          reject(parseError);
        }
      });
    });
  });
}

module.exports = { parseGPXFile };
