$(document).ready(function(){
  
  url = manifest_loc;

  // nel.init();
  // nel.manifestRequest(url)
  viewer.init();
  manifest.loadMainManifest(url);
});