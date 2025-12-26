const AppState = {
  currentRouteData: null,
  foundEstablishments: [],
  
  setRouteData: function(data) {
    this.currentRouteData = data;
  },
  
  setEstablishments: function(establishments) {
    this.foundEstablishments = establishments;
  },
  
  getRouteData: function() {
    return this.currentRouteData;
  },
  
  getEstablishments: function() {
    return this.foundEstablishments;
  },
  
  reset: function() {
    this.currentRouteData = null;
    this.foundEstablishments = [];
  }
};

document.addEventListener('DOMContentLoaded', function() {
  console.log('GPX Route Pub Finder initialized');
  MapManager.init();
  FileUploadManager.init();
  SearchManager.init();
});