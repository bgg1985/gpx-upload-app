cat > public/js/fileUpload.js << 'EOF'
const FileUploadManager = {
  elements: {},
  
  init() {
    this.cacheElements();
    this.attachEventListeners();
  },
  
  cacheElements() {
    this.elements = {
      uploadBox: document.getElementById('uploadBox'),
      fileInput: document.getElementById('fileInput'),
      browseBtn: document.getElementById('browseBtn'),
      loadingIndicator: document.getElementById('loadingIndicator'),
      results: document.getElementById('results'),
      searchResults: document.getElementById('searchResults')
    };
  },
  
  attachEventListeners() {
    const self = this;
    const uploadBox = this.elements.uploadBox;
    const fileInput = this.elements.fileInput;
    const browseBtn = this.elements.browseBtn;
    
    uploadBox.addEventListener('click', () => fileInput.click());
    browseBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      fileInput.click();
    });
    
    fileInput.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (file) self.uploadFile(file);
    });
    
    uploadBox.addEventListener('dragover', (e) => {
      e.preventDefault();
      uploadBox.classList.add('dragover');
    });
    
    uploadBox.addEventListener('dragleave', () => {
      uploadBox.classList.remove('dragover');
    });
    
    uploadBox.addEventListener('drop', (e) => {
      e.preventDefault();
      uploadBox.classList.remove('dragover');
      const file = e.dataTransfer.files[0];
      if (file) self.uploadFile(file);
    });
  },
  
  async uploadFile(file) {
    const formData = new FormData();
    formData.append('gpxFile', file);

    UIManager.showLoading();
    UIManager.hideResults();
    UIManager.hideSearchResults();

    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      });

      const result = await response.json();

      if (result.success) {
        AppState.setRouteData(result.data);
        AppState.setEstablishments([]);
        this.displayResults(result.data);
      } else {
        alert('Error: ' + (result.error || 'Unknown error'));
      }
    } catch (error) {
      console.error('Upload error:', error);
      alert('Failed to upload file: ' + error.message);
    } finally {
      UIManager.hideLoading();
      this.elements.fileInput.value = '';
    }
  },
  
  displayResults(data) {
    UIManager.showResults();
    UIManager.displayRouteInfo(data);
    MapManager.displayMap(data);
    UIManager.displayWaypoints(data.waypoints);
    UIManager.displayTrackStats(data.track);
    UIManager.scrollToResults();
  }
};
EOF