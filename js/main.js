$(document).ready(function(){
  
  url = "https://404mike.github.io/nel_results/data/manifests/62599b02598a4/index.json";

  // nel.init();
  // nel.manifestRequest(url)
  viewer.init();
  manifest.loadMainManifest(url);
});