function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371000;
  const φ1 = lat1 * Math.PI / 180;
  const φ2 = lat2 * Math.PI / 180;
  const Δφ = (lat2 - lat1) * Math.PI / 180;
  const Δλ = (lon2 - lon1) * Math.PI / 180;

  const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
            Math.cos(φ1) * Math.cos(φ2) *
            Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}

function isPointNearRoute(pointLat, pointLon, track, maxDistance) {
  for (let trackPoint of track) {
    const distance = calculateDistance(pointLat, pointLon, trackPoint.lat, trackPoint.lon);
    if (distance <= maxDistance) {
      return true;
    }
  }
  return false;
}

function calculateBoundingBox(track, bufferMeters) {
  const lats = track.map(pt => pt.lat);
  const lons = track.map(pt => pt.lon);
  
  const minLat = Math.min(...lats);
  const maxLat = Math.max(...lats);
  const minLon = Math.min(...lons);
  const maxLon = Math.max(...lons);

  const buffer = bufferMeters / 111000;
  
  return {
    minLat: minLat - buffer,
    maxLat: maxLat + buffer,
    minLon: minLon - buffer,
    maxLon: maxLon + buffer
  };
}

module.exports = {
  calculateDistance,
  isPointNearRoute,
  calculateBoundingBox
};
