const MapManager = {
  map: null,
  trackLayer: null,
  markersLayer: null,
  establishmentsLayer: null,
  currentRouteData: null,
  currentEstablishments: [],
  displayMode: 'all',
  
  init: function() {
    this.attachRadioListeners();
  },
  
  attachRadioListeners: function() {
    const self = this;
    const radioButtons = document.querySelectorAll('input[name="mapDisplay"]');
    
    radioButtons.forEach(function(radio) {
      radio.addEventListener('change', function(e) {
        self.displayMode = e.target.value;
        self.updateMapDisplay();
      });
    });
  },
  
  displayMap: function(data) {
    this.currentRouteData = data;
    
    if (!this.map) {
      this.map = L.map('map').setView([0, 0], 13);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
      }).addTo(this.map);
    }

    this.updateMapDisplay();
  },
  
  updateMapWithEstablishments: function(establishments) {
    this.currentEstablishments = establishments;
    this.updateMapDisplay();
  },
  
  updateMapDisplay: function() {
    if (!this.map || !this.currentRouteData) return;
    
    this.clearLayers();
    
    const data = this.currentRouteData;
    const establishments = this.currentEstablishments;
    
    // Always draw the track
    if (data.track.length > 0) {
      const trackCoords = data.track.map(function(pt) { return [pt.lat, pt.lon]; });
      this.trackLayer = L.polyline(trackCoords, { color: '#667eea', weight: 4 }).addTo(this.map);
      this.map.fitBounds(this.trackLayer.getBounds());
    }
    
    // Display waypoints based on mode
    if (this.displayMode === 'all') {
      this.displayAllWaypoints(data.waypoints, establishments);
    } else if (this.displayMode === 'pubs') {
      this.displayOnlyPubs(establishments);
    } else if (this.displayMode === 'both') {
      this.displayBothSeparate(data.waypoints, establishments);
    }
  },
  
  displayAllWaypoints: function(originalWaypoints, establishments) {
    const allWaypoints = originalWaypoints.concat(establishments);
    
    if (allWaypoints.length > 0) {
      this.markersLayer = L.layerGroup();
      const self = this;
      
      allWaypoints.forEach(function(wpt) {
        const isDrinking = self.isDrinkingEstablishment(wpt.type);
        
        const marker = L.marker([wpt.lat, wpt.lon], {
          icon: L.divIcon({
            className: 'custom-marker',
            html: isDrinking ? '🍺' : '📍',
            iconSize: [30, 30]
          })
        });
        
        let popup = '<strong>' + wpt.name + '</strong><br>';
        if (wpt.desc) popup += wpt.desc + '<br>';
        if (wpt.type) popup += 'Type: ' + wpt.type + '<br>';
        if (wpt.ele) popup += 'Elevation: ' + wpt.ele.toFixed(1) + 'm';
        
        marker.bindPopup(popup);
        marker.addTo(self.markersLayer);
      });
      
      this.markersLayer.addTo(this.map);
    }
  },
  
  displayOnlyPubs: function(establishments) {
    if (establishments.length > 0) {
      this.establishmentsLayer = L.layerGroup();
      const self = this;
      
      establishments.forEach(function(est) {
        const marker = L.marker([est.lat, est.lon], {
          icon: L.divIcon({
            className: 'establishment-marker',
            html: '🍺',
            iconSize: [30, 30]
          })
        });
        
        let popup = '<strong>🍺 ' + est.name + '</strong><br>';
        popup += '<em>' + est.type + '</em><br>';
        if (est.desc) popup += est.desc + '<br>';
        popup += '<small>Lat: ' + est.lat.toFixed(6) + ', Lon: ' + est.lon.toFixed(6) + '</small>';
        
        marker.bindPopup(popup);
        marker.addTo(self.establishmentsLayer);
      });
      
      this.establishmentsLayer.addTo(this.map);
    }
  },
  
  displayBothSeparate: function(originalWaypoints, establishments) {
    const self = this;
    
    // Display original waypoints
    if (originalWaypoints.length > 0) {
      this.markersLayer = L.layerGroup();
      
      originalWaypoints.forEach(function(wpt) {
        const marker = L.marker([wpt.lat, wpt.lon], {
          icon: L.divIcon({
            className: 'custom-marker',
            html: '📍',
            iconSize: [30, 30]
          })
        });
        
        let popup = '<strong>' + wpt.name + '</strong><br>';
        if (wpt.desc) popup += wpt.desc + '<br>';
        if (wpt.type) popup += 'Type: ' + wpt.type + '<br>';
        if (wpt.ele) popup += 'Elevation: ' + wpt.ele.toFixed(1) + 'm';
        
        marker.bindPopup(popup);
        marker.addTo(self.markersLayer);
      });
      
      this.markersLayer.addTo(this.map);
    }
    
    // Display establishments
    if (establishments.length > 0) {
      this.establishmentsLayer = L.layerGroup();
      
      establishments.forEach(function(est) {
        const marker = L.marker([est.lat, est.lon], {
          icon: L.divIcon({
            className: 'establishment-marker',
            html: '🍺',
            iconSize: [30, 30]
          })
        });
        
        let popup = '<strong>🍺 ' + est.name + '</strong><br>';
        popup += '<em>' + est.type + '</em><br>';
        if (est.desc) popup += est.desc + '<br>';
        popup += '<small>Lat: ' + est.lat.toFixed(6) + ', Lon: ' + est.lon.toFixed(6) + '</small>';
        
        marker.bindPopup(popup);
        marker.addTo(self.establishmentsLayer);
      });
      
      this.establishmentsLayer.addTo(this.map);
    }
  },
  
  isDrinkingEstablishment: function(type) {
    const drinkingTypes = ['pub', 'bar', 'biergarten', 'nightclub'];
    return drinkingTypes.indexOf(type) !== -1;
  },
  
  clearLayers: function() {
    if (this.trackLayer) this.map.removeLayer(this.trackLayer);
    if (this.markersLayer) this.map.removeLayer(this.markersLayer);
    if (this.establishmentsLayer) this.map.removeLayer(this.establishmentsLayer);
  },
  
  zoomToLocation: function(lat, lon) {
    if (this.map) {
      this.map.setView([lat, lon], 16);
    }
  }
};