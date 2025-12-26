cat > public/js/mapManager.js << 'EOF'
const MapManager = {
  map: null,
  trackLayer: null,
  markersLayer: null,
  establishmentsLayer: null,
  
  displayMap(data) {
    if (!this.map) {
      this.map = L.map('map').setView([0, 0], 13);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
      }).addTo(this.map);
    }

    this.clearLayers();

    if (data.track.length > 0) {
      const trackCoords = data.track.map(pt => [pt.lat, pt.lon]);
      this.trackLayer = L.polyline(trackCoords, { color: '#667eea', weight: 4 }).addTo(this.map);
      this.map.fitBounds(this.trackLayer.getBounds());
    }

    if (data.waypoints.length > 0) {
      this.markersLayer = L.layerGroup();
      
      data.waypoints.forEach(wpt => {
        const marker = L.marker([wpt.lat, wpt.lon], {
          icon: L.divIcon({
            className: 'custom-marker',
            html: '📍',
            iconSize: [30, 30]
          })
        });
        
        marker.bindPopup(
          '<strong>' + wpt.name + '</strong><br>' +
          (wpt.desc ? wpt.desc + '<br>' : '') +
          (wpt.type ? 'Type: ' + wpt.type + '<br>' : '') +
          (wpt.ele ? 'Elevation: ' + wpt.ele.toFixed(1) + 'm' : '')
        );
        
        marker.addTo(this.markersLayer);
      });
      
      this.markersLayer.addTo(this.map);
    }
  },
  
  updateMapWithEstablishments(establishments) {
    if (!this.map) return;

    if (this.establishmentsLayer) {
      this.map.removeLayer(this.establishmentsLayer);
    }

    if (establishments.length > 0) {
      this.establishmentsLayer = L.layerGroup();
      
      establishments.forEach(est => {
        const marker = L.marker([est.lat, est.lon], {
          icon: L.divIcon({
            className: 'establishment-marker',
            html: '🍺',
            iconSize: [30, 30]
          })
        });
        
        marker.bindPopup(
          '<strong>🍺 ' + est.name + '</strong><br>' +
          '<em>' + est.type + '</em><br>' +
          (est.desc ? est.desc + '<br>' : '') +
          '<small>Lat: ' + est.lat.toFixed(6) + ', Lon: ' + est.lon.toFixed(6) + '</small>'
        );
        
        marker.addTo(this.establishmentsLayer);
      });
      
      this.establishmentsLayer.addTo(this.map);
    }
  },
  
  clearLayers() {
    if (this.trackLayer) this.map.removeLayer(this.trackLayer);
    if (this.markersLayer) this.map.removeLayer(this.markersLayer);
    if (this.establishmentsLayer) this.map.removeLayer(this.establishmentsLayer);
  },
  
  zoomToLocation(lat, lon) {
    if (this.map) {
      this.map.setView([lat, lon], 16);
    }
  }
};
EOF