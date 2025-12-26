const fs = require('fs');
const xml2js = require('xml2js');

function parseTCXFile(filePath) {
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
          const tcxData = {
            metadata: {},
            waypoints: [],
            track: []
          };

          const course = result.TrainingCenterDatabase?.Courses?.Course;
          
          if (course) {
            tcxData.metadata.name = course.Name || 'Unnamed Route';

            if (course.Track && course.Track.Trackpoint) {
              const points = Array.isArray(course.Track.Trackpoint) 
                ? course.Track.Trackpoint 
                : [course.Track.Trackpoint];

              points.forEach(pt => {
                if (pt.Position) {
                  tcxData.track.push({
                    lat: parseFloat(pt.Position.LatitudeDegrees),
                    lon: parseFloat(pt.Position.LongitudeDegrees),
                    ele: pt.AltitudeMeters ? parseFloat(pt.AltitudeMeters) : null,
                    time: pt.Time || null
                  });
                }
              });
            }

            if (course.CoursePoint) {
              const coursePoints = Array.isArray(course.CoursePoint) 
                ? course.CoursePoint 
                : [course.CoursePoint];

              coursePoints.forEach(cp => {
                if (cp.PointType === 'Generic' && cp.Position) {
                  tcxData.waypoints.push({
                    lat: parseFloat(cp.Position.LatitudeDegrees),
                    lon: parseFloat(cp.Position.LongitudeDegrees),
                    name: cp.Name || 'Unnamed',
                    desc: cp.Notes || '',
                    type: 'generic'
                  });
                }
              });
            }
          }

          resolve(tcxData);
        } catch (parseError) {
          reject(parseError);
        }
      });
    });
  });
}

module.exports = { parseTCXFile };
