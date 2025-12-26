cat > public/js/searchManager.js << 'EOF'
const SearchManager = {
  elements: {},
  
  init() {
    this.cacheElements();
    this.attachEventListeners();
  },
  
  cacheElements() {
    this.elements = {
      searchDistance: document.getElementById('searchDistance'),
      distanceValue: document.getElementById('distanceValue'),
      searchBtn: document.getElementById('searchBtn'),
      searchLoading: document.getElementById('searchLoading'),
      downloadBtn: document.getElementById('downloadBtn')
    };
  },
  
  attachEventListeners() {
    const self = this;
    const searchDistance = this.elements.searchDistance;
    const searchBtn = this.elements.searchBtn;
    const downloadBtn = this.elements.downloadBtn;
    
    searchDistance.addEventListener('input', (e) => {
      self.elements.distanceValue.textContent = e.target.value + 'm';
    });
    
    searchBtn.addEventListener('click', () => {
      self.searchEstablishments();
    });
    
    downloadBtn.addEventListener('click', () => {
      self.downloadGPX();
    });
  },
  
  async searchEstablishments() {
    const routeData = AppState.getRouteData();
    
    if (!routeData || !routeData.track) {
      alert('Please upload a route file first');
      return;
    }

    const distance = parseInt(this.elements.searchDistance.value);
    
    this.elements.searchLoading.classList.remove('hidden');
    UIManager.hideSearchResults();
    this.elements.searchBtn.disabled = true;

    try {
      const response = await fetch('/api/search-establishments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          track: routeData.track,
          distance: distance
        })
      });

      const result = await response.json();

      if (result.success) {
        AppState.setEstablishments(result.establishments);
        UIManager.displayEstablishments(result.establishments);
        MapManager.updateMapWithEstablishments(result.establishments);
      } else {
        alert('Error: ' + (result.error || 'Unknown error'));
      }
    } catch (error) {
      console.error('Search error:', error);
      alert('Failed to search establishments: ' + error.message);
    } finally {
      this.elements.searchLoading.classList.add('hidden');
      this.elements.searchBtn.disabled = false;
    }
  },
  
  async downloadGPX() {
    const routeData = AppState.getRouteData();
    const establishments = AppState.getEstablishments();
    
    if (!routeData) {
      alert('No route data available');
      return;
    }

    try {
      const response = await fetch('/api/generate-gpx', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          data: routeData,
          establishments: establishments
        })
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'route-with-pubs.gpx';
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } else {
        alert('Failed to generate GPX file');
      }
    } catch (error) {
      console.error('Download error:', error);
      alert('Failed to download GPX file: ' + error.message);
    }
  }
};
EOF