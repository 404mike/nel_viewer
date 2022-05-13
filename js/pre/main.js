$(document).ready(function(){
  
  url = "https://404mike.github.io/nel_results/pre_load/all.json";

  // nel.init();
  // nel.manifestRequest(url)
  viewer.init();
  manifest.loadMainManifest(url);
});