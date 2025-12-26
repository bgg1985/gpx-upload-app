cat > public/js/app.js << 'EOF'
const AppState = {
  currentRouteData: null,
  foundEstablishments: [],
  
  setRouteData(data) {
    this.currentRouteData = data;
  },
  
  setEstablishments(establishments) {
    this.foundEstablishments = establishments;
  },
  
  getRouteData() {
    return this.currentRouteData;
  },
  
  getEstablishments() {
    return this.foundEstablishments;
  },
  
  reset() {
    this.currentRouteData = null;
    this.foundEstablishments = [];
  }
};

document.addEventListener('DOMContentLoaded', () => {
  console.log('GPX Route Pub Finder initialized');
  FileUploadManager.init();
  SearchManager.init();
});
EOF