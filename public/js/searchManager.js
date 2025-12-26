const SearchManager = {
  elements: {},
  
  init: function() {
    this.cacheElements();
    this.attachEventListeners();
  },
  
  cacheElements: function() {
    this.elements = {
      searchDistance: document.getElementById('searchDistance'),
      distanceValue: document.getElementById('distanceValue'),
      searchBtn: document.getElementById('searchBtn'),
      searchLoading: document.getElementById('searchLoading'),
      downloadBtn: document.getElementById('downloadBtn')
    };
  },
  
  attachEventListeners: function() {
    const self = this;
    
    this.elements.searchDistance.addEventListener('input', function(e) {
      self.elements.distanceValue.textContent = e.target.value + 'm';
    });
    
    this.elements.searchBtn.addEventListener('click', function() {
      self.searchEstablishments();
    });
    
    this.elements.downloadBtn.addEventListener('click', function() {
      self.downloadGPX();
    });
  },
  
  searchEstablishments: function() {
    const self = this;
    const routeData = AppState.getRouteData();
    
    if (!routeData || !routeData.track) {
      alert('Please upload a route file first');
      return;
    }

    const distance = parseInt(this.elements.searchDistance.value);
    
    this.elements.searchLoading.classList.remove('hidden');
    UIManager.hideSearchResults();
    this.elements.searchBtn.disabled = true;

    fetch('/api/search-establishments', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        track: routeData.track,
        distance: distance
      })
    })
    .then(function(response) {
      return response.json();
    })
    .then(function(result) {
      if (result.success) {
        AppState.setEstablishments(result.establishments);
        UIManager.displayEstablishments(result.establishments);
        MapManager.updateMapWithEstablishments(result.establishments);
      } else {
        alert('Error: ' + (result.error || 'Unknown error'));
      }
    })
    .catch(function(error) {
      console.error('Search error:', error);
      alert('Failed to search establishments: ' + error.message);
    })
    .finally(function() {
      self.elements.searchLoading.classList.add('hidden');
      self.elements.searchBtn.disabled = false;
    });
  },
  
  downloadGPX: function() {
    const routeData = AppState.getRouteData();
    const establishments = AppState.getEstablishments();
    
    if (!routeData) {
      alert('No route data available');
      return;
    }

    fetch('/api/generate-gpx', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        data: routeData,
        establishments: establishments
      })
    })
    .then(function(response) {
      if (response.ok) {
        return response.blob();
      } else {
        throw new Error('Failed to generate GPX file');
      }
    })
    .then(function(blob) {
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'route-with-pubs.gpx';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    })
    .catch(function(error) {
      console.error('Download error:', error);
      alert('Failed to download GPX file: ' + error.message);
    });
  }
};