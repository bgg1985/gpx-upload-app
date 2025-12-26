const FileUploadManager = {
  elements: {},
  
  init: function() {
    this.cacheElements();
    this.attachEventListeners();
  },
  
  cacheElements: function() {
    this.elements = {
      uploadBox: document.getElementById('uploadBox'),
      fileInput: document.getElementById('fileInput'),
      browseBtn: document.getElementById('browseBtn'),
      loadingIndicator: document.getElementById('loadingIndicator'),
      results: document.getElementById('results'),
      searchResults: document.getElementById('searchResults')
    };
  },
  
  attachEventListeners: function() {
    const self = this;
    const uploadBox = this.elements.uploadBox;
    const fileInput = this.elements.fileInput;
    const browseBtn = this.elements.browseBtn;
    
    uploadBox.addEventListener('click', function() {
      fileInput.click();
    });
    
    browseBtn.addEventListener('click', function(e) {
      e.stopPropagation();
      fileInput.click();
    });
    
    fileInput.addEventListener('change', function(e) {
      const file = e.target.files[0];
      if (file) {
        self.uploadFile(file);
      }
    });
    
    uploadBox.addEventListener('dragover', function(e) {
      e.preventDefault();
      uploadBox.classList.add('dragover');
    });
    
    uploadBox.addEventListener('dragleave', function() {
      uploadBox.classList.remove('dragover');
    });
    
    uploadBox.addEventListener('drop', function(e) {
      e.preventDefault();
      uploadBox.classList.remove('dragover');
      const file = e.dataTransfer.files[0];
      if (file) {
        self.uploadFile(file);
      }
    });
  },
  
  uploadFile: function(file) {
    const self = this;
    const formData = new FormData();
    formData.append('gpxFile', file);

    UIManager.showLoading();
    UIManager.hideResults();
    UIManager.hideSearchResults();

    fetch('/api/upload', {
      method: 'POST',
      body: formData
    })
    .then(function(response) {
      return response.json();
    })
    .then(function(result) {
      if (result.success) {
        AppState.setRouteData(result.data);
        AppState.setEstablishments([]);
        self.displayResults(result.data);
      } else {
        alert('Error: ' + (result.error || 'Unknown error'));
      }
    })
    .catch(function(error) {
      console.error('Upload error:', error);
      alert('Failed to upload file: ' + error.message);
    })
    .finally(function() {
      UIManager.hideLoading();
      self.elements.fileInput.value = '';
    });
  },
  
  displayResults: function(data) {
    UIManager.showResults();
    UIManager.displayRouteInfo(data);
    MapManager.displayMap(data);
    UIManager.displayWaypoints(data.waypoints);
    UIManager.displayTrackStats(data.track);
    UIManager.scrollToResults();
  }
};