const axios = require('axios');
const { calculateBoundingBox, isPointNearRoute } = require('../utils/geoUtils');

async function searchDrinkingEstablishments(track, maxDistance) {
  try {
    const bbox = calculateBoundingBox(track, maxDistance);
    const bboxString = bbox.minLat + ',' + bbox.minLon + ',' + bbox.maxLat + ',' + bbox.maxLon;

    const query = '[out:json][timeout:25];(' +
      'node["amenity"="pub"](' + bboxString + ');' +
      'node["amenity"="bar"](' + bboxString + ');' +
      'node["amenity"="biergarten"](' + bboxString + ');' +
      'node["amenity"="nightclub"](' + bboxString + ');' +
      'way["amenity"="pub"](' + bboxString + ');' +
      'way["amenity"="bar"](' + bboxString + ');' +
      'way["amenity"="biergarten"](' + bboxString + ');' +
      'way["amenity"="nightclub"](' + bboxString + ');' +
      ');out center;';

    const response = await axios.post(
      'https://overpass-api.de/api/interpreter',
      query,
      {
        headers: { 'Content-Type': 'text/plain' },
        timeout: 30000
      }
    );

    const elements = response.data.elements;
    const establishments = [];

    for (let element of elements) {
      let lat, lon;

      if (element.type === 'node') {
        lat = element.lat;
        lon = element.lon;
      } else if (element.type === 'way' && element.center) {
        lat = element.center.lat;
        lon = element.center.lon;
      } else {
        continue;
      }

      if (isPointNearRoute(lat, lon, track, maxDistance)) {
        establishments.push({
          lat: lat,
          lon: lon,
          name: element.tags.name || 'Unnamed Establishment',
          type: element.tags.amenity || 'bar',
          desc: buildDescription(element.tags),
          osmId: element.id
        });
      }
    }

    return removeDuplicates(establishments);

  } catch (error) {
    console.error('Error searching establishments:', error.message);
    throw error;
  }
}

function buildDescription(tags) {
  const parts = [tags.amenity || 'establishment'];
  
  if (tags['addr:street']) {
    parts.push(tags['addr:street']);
  }
  if (tags['addr:housenumber']) {
    parts.push(tags['addr:housenumber']);
  }
  
  return parts.join(' - ');
}

function removeDuplicates(establishments) {
  return establishments.filter((est, index, self) =>
    index === self.findIndex((e) => (
      e.name === est.name && 
      Math.abs(e.lat - est.lat) < 0.0001 && 
      Math.abs(e.lon - est.lon) < 0.0001
    ))
  );
}

module.exports = { searchDrinkingEstablishments };