const UIManager = {
  showLoading: function() {
    document.getElementById('loadingIndicator').classList.remove('hidden');
  },
  
  hideLoading: function() {
    document.getElementById('loadingIndicator').classList.add('hidden');
  },
  
  showResults: function() {
    document.getElementById('results').classList.remove('hidden');
  },
  
  hideResults: function() {
    document.getElementById('results').classList.add('hidden');
  },
  
  showSearchResults: function() {
    document.getElementById('searchResults').classList.remove('hidden');
  },
  
  hideSearchResults: function() {
    document.getElementById('searchResults').classList.add('hidden');
  },
  
  scrollToResults: function() {
    document.getElementById('results').scrollIntoView({ behavior: 'smooth' });
  },
  
  displayRouteInfo: function(data) {
    const routeInfo = document.getElementById('routeInfo');
    let html = '<div class="info-item"><strong>Route Name</strong><span>' + (data.metadata.name || 'Unnamed') + '</span></div>';
    html += '<div class="info-item"><strong>Waypoints</strong><span>' + data.waypoints.length + '</span></div>';
    html += '<div class="info-item"><strong>Track Points</strong><span>' + data.track.length + '</span></div>';
    
    if (data.metadata.time) {
      html += '<div class="info-item"><strong>Created</strong><span>' + new Date(data.metadata.time).toLocaleString() + '</span></div>';
    }
    
    routeInfo.innerHTML = html;
  },
  
  displayWaypoints: function(waypoints) {
    const waypointsList = document.getElementById('waypointsList');
    const waypointCount = document.getElementById('waypointCount');
    
    waypointCount.textContent = waypoints.length;

    if (waypoints.length === 0) {
      waypointsList.innerHTML = '<div class="no-data">No waypoints found in this file</div>';
      return;
    }

    let html = '';
    waypoints.forEach(function(wpt) {
      html += '<div class="waypoint-card">';
      html += '<h3>' + wpt.name + '</h3>';
      if (wpt.desc) html += '<p><strong>Description:</strong> ' + wpt.desc + '</p>';
      html += '<p><strong>Coordinates:</strong> ' + wpt.lat.toFixed(6) + ', ' + wpt.lon.toFixed(6) + '</p>';
      if (wpt.ele) html += '<p><strong>Elevation:</strong> ' + wpt.ele.toFixed(1) + 'm</p>';
      if (wpt.type) html += '<p><strong>Type:</strong> ' + wpt.type + '</p>';
      html += '</div>';
    });
    
    waypointsList.innerHTML = html;
  },
  
  displayEstablishments: function(establishments) {
    this.showSearchResults();
    
    const establishmentCount = document.getElementById('establishmentCount');
    const establishmentsList = document.getElementById('establishmentsList');
    
    establishmentCount.textContent = establishments.length;

    if (establishments.length === 0) {
      establishmentsList.innerHTML = '<div class="no-data">No drinking establishments found within the selected distance</div>';
      return;
    }

    let html = '';
    establishments.forEach(function(est, index) {
      html += '<div class="establishment-card" data-index="' + index + '" data-lat="' + est.lat + '" data-lon="' + est.lon + '">';
      html += '<h3>🍺 ' + est.name + '<span class="type-badge">' + est.type + '</span></h3>';
      if (est.desc) html += '<p><strong>Description:</strong> ' + est.desc + '</p>';
      html += '<p><strong>Coordinates:</strong> ' + est.lat.toFixed(6) + ', ' + est.lon.toFixed(6) + '</p>';
      html += '</div>';
    });
    
    establishmentsList.innerHTML = html;

    document.querySelectorAll('.establishment-card').forEach(function(card) {
      card.addEventListener('click', function() {
        const lat = parseFloat(card.dataset.lat);
        const lon = parseFloat(card.dataset.lon);
        MapManager.zoomToLocation(lat, lon);
      });
    });
  },
  
  displayTrackStats: function(track) {
    const trackStats = document.getElementById('trackStats');
    const trackCount = document.getElementById('trackCount');
    
    trackCount.textContent = track.length;

    if (track.length === 0) {
      trackStats.innerHTML = '<div class="no-data">No track data found in this file</div>';
      return;
    }

    const elevations = track.filter(function(pt) { return pt.ele !== null; }).map(function(pt) { return pt.ele; });
    const minEle = elevations.length > 0 ? Math.min.apply(null, elevations) : 0;
    const maxEle = elevations.length > 0 ? Math.max.apply(null, elevations) : 0;
    const avgEle = elevations.length > 0 ? elevations.reduce(function(a, b) { return a + b; }, 0) / elevations.length : 0;

    let totalDistance = 0;
    for (let i = 1; i < track.length; i++) {
      totalDistance += this.calculateDistance(
        track[i-1].lat, track[i-1].lon,
        track[i].lat, track[i].lon
      );
    }

    let html = '<div class="stat-card"><span class="value">' + track.length + '</span><span class="label">Total Points</span></div>';
    html += '<div class="stat-card"><span class="value">' + (totalDistance / 1000).toFixed(2) + '</span><span class="label">Distance (km)</span></div>';
    
    if (elevations.length > 0) {
      html += '<div class="stat-card"><span class="value">' + minEle.toFixed(1) + '</span><span class="label">Min Elevation (m)</span></div>';
      html += '<div class="stat-card"><span class="value">' + maxEle.toFixed(1) + '</span><span class="label">Max Elevation (m)</span></div>';
      html += '<div class="stat-card"><span class="value">' + avgEle.toFixed(1) + '</span><span class="label">Avg Elevation (m)</span></div>';
    }
    
    trackStats.innerHTML = html;
  },
  
  calculateDistance: function(lat1, lon1, lat2, lon2) {
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