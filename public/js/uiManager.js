cat > public/js/uiManager.js << 'EOF'
const UIManager = {
  showLoading() {
    document.getElementById('loadingIndicator').classList.remove('hidden');
  },
  
  hideLoading() {
    document.getElementById('loadingIndicator').classList.add('hidden');
  },
  
  showResults() {
    document.getElementById('results').classList.remove('hidden');
  },
  
  hideResults() {
    document.getElementById('results').classList.add('hidden');
  },
  
  showSearchResults() {
    document.getElementById('searchResults').classList.remove('hidden');
  },
  
  hideSearchResults() {
    document.getElementById('searchResults').classList.add('hidden');
  },
  
  scrollToResults() {
    document.getElementById('results').scrollIntoView({ behavior: 'smooth' });
  },
  
  displayRouteInfo(data) {
    const routeInfo = document.getElementById('routeInfo');
    routeInfo.innerHTML = 
      '<div class="info-item">' +
        '<strong>Route Name</strong>' +
        '<span>' + (data.metadata.name || 'Unnamed') + '</span>' +
      '</div>' +
      '<div class="info-item">' +
        '<strong>Waypoints</strong>' +
        '<span>' + data.waypoints.length + '</span>' +
      '</div>' +
      '<div class="info-item">' +
        '<strong>Track Points</strong>' +
        '<span>' + data.track.length + '</span>' +
      '</div>' +
      (data.metadata.time ? 
        '<div class="info-item">' +
          '<strong>Created</strong>' +
          '<span>' + new Date(data.metadata.time).toLocaleString() + '</span>' +
        '</div>' 
      : '');
  },
  
  displayWaypoints(waypoints) {
    const waypointsList = document.getElementById('waypointsList');
    const waypointCount = document.getElementById('waypointCount');
    
    waypointCount.textContent = waypoints.length;

    if (waypoints.length === 0) {
      waypointsList.innerHTML = '<div class="no-data">No waypoints found in this file</div>';
      return;
    }

    waypointsList.innerHTML = waypoints.map(wpt => 
      '<div class="waypoint-card">' +
        '<h3>' + wpt.name + '</h3>' +
        (wpt.desc ? '<p><strong>Description:</strong> ' + wpt.desc + '</p>' : '') +
        '<p><strong>Coordinates:</strong> ' + wpt.lat.toFixed(6) + ', ' + wpt.lon.toFixed(6) + '</p>' +
        (wpt.ele ? '<p><strong>Elevation:</strong> ' + wpt.ele.toFixed(1) + 'm</p>' : '') +
        (wpt.type ? '<p><strong>Type:</strong> ' + wpt.type + '</p>' : '') +
      '</div>'
    ).join('');
  },
  
  displayEstablishments(establishments) {
    this.showSearchResults();
    
    const establishmentCount = document.getElementById('establishmentCount');
    const establishmentsList = document.getElementById('establishmentsList');
    
    establishmentCount.textContent = establishments.length;

    if (establishments.length === 0) {
      establishmentsList.innerHTML = '<div class="no-data">No drinking establishments found within the selected distance</div>';
      return;
    }

    establishmentsList.innerHTML = establishments.map((est, index) =>
      '<div class="establishment-card" data-index="' + index + '" data-lat="' + est.lat + '" data-lon="' + est.lon + '">' +
        '<h3>' +
          '🍺 ' + est.name +
          '<span class="type-badge">' + est.type + '</span>' +
        '</h3>' +
        (est.desc ? '<p><strong>Description:</strong> ' + est.desc + '</p>' : '') +
        '<p><strong>Coordinates:</strong> ' + est.lat.toFixed(6) + ', ' + est.lon.toFixed(6) + '</p>' +
      '</div>'
    ).join('');

    document.querySelectorAll('.establishment-card').forEach(card => {
      card.addEventListener('click', () => {
        const lat = parseFloat(card.dataset.lat);
        const lon = parseFloat(card.dataset.lon);
        MapManager.zoomToLocation(lat, lon);
      });
    });
  },
  
  displayTrackStats(track) {
    const trackStats = document.getElementById('trackStats');
    const trackCount = document.getElementById('trackCount');
    
    trackCount.textContent = track.length;

    if (track.length === 0) {
      trackStats.innerHTML = '<div class="no-data">No track data found in this file</div>';
      return;
    }

    const elevations = track.filter(pt => pt.ele !== null).map(pt => pt.ele);
    const minEle = elevations.length > 0 ? Math.min.apply(null, elevations) : 0;
    const maxEle = elevations.length > 0 ? Math.max.apply(null, elevations) : 0;
    const avgEle = elevations.length > 0 ? elevations.reduce((a, b) => a + b, 0) / elevations.length : 0;

    let totalDistance = 0;
    for (let i = 1; i < track.length; i++) {
      totalDistance += this.calculateDistance(
        track[i-1].lat, track[i-1].lon,
        track[i].lat, track[i].lon
      );
    }

    trackStats.innerHTML = 
      '<div class="stat-card">' +
        '<span class="value">' + track.length + '</span>' +
        '<span class="label">Total Points</span>' +
      '</div>' +
      '<div class="stat-card">' +
        '<span class="value">' + (totalDistance / 1000).toFixed(2) + '</span>' +
        '<span class="label">Distance (km)</span>' +
      '</div>' +
      (elevations.length > 0 ? 
        '<div class="stat-card">' +
          '<span class="value">' + minEle.toFixed(1) + '</span>' +
          '<span class="label">Min Elevation (m)</span>' +
        '</div>' +
        '<div class="stat-card">' +
          '<span class="value">' + maxEle.toFixed(1) + '</span>' +
          '<span class="label">Max Elevation (m)</span>' +
        '</div>' +
        '<div class="stat-card">' +
          '<span class="value">' + avgEle.toFixed(1) + '</span>' +
          '<span class="label">Avg Elevation (m)</span>' +
        '</div>' 
      : '');
  },
  
  calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371000;
    const phi1 = lat1 * Math.PI / 180;
    const phi2 = lat2 * Math.PI / 180;
    const deltaPhi = (lat2 - lat1) * Math.PI / 180;
    const deltaLambda = (lon2 - lon1) * Math.PI / 180;

    const a = Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
              Math.cos(phi1) * Math.cos(phi2) *
              Math.sin(deltaLambda / 2) * Math.sin(deltaLambda / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c;
  }
};
EOF