mainTileSource = '';

viewer = {

  /**
   * init
   */
  init : function(){
    this.loadOSD();
    this.loadUV();
  },

  /**
   * 
   */
  loadOSD : function(){
    osd = OpenSeadragon({
      id:                 "osd",
      prefixUrl:          "js/openseadragon/images/",
      preserveViewport:   true,
      visibilityRatio:    1,
      sequenceMode:       true,
    });
  },

  /**
   * 
   */
  loadUV : function(){
  },

  updateOSD : function(manifest, name){
    
    // osd.destroy()
    json = this.manifestRequest(manifest)
    console.log(json)
    console.log("Name click " + name)
    _this = this;

    var urlParts = json.target.id.split("/");
    console.log(urlParts)
    
    pidHash = urlParts[6]
    pidHashParts = pidHash.split("#")
    pid = pidHashParts[0];
    position = pidHashParts[1];
    

    mainTileSource = 'https://newspapers.library.wales/iiif/2.0/image/'+pid+'/info.json';

    $('#uv').hide();
    $('#osd').show();

    osd.addTiledImage({
      tileSource: mainTileSource
    });

    var boundaries = 'https://newspapers.library.wales/json/viewarticledata/llgc-id%3A' + pid;

    this.loadAnnotation(osd, json, boundaries, name, pid);

  },

  loadAnnotation: function(osd, json, boundaries, name, pid){
    console.log('load annot')
    var target = json.target.id;
    var coords = target.substring(target.indexOf("xywh=") + 5);
    var elements = coords.split(",");
    var bounds = osd.viewport.imageToViewportRectangle(parseInt(elements[0]), parseInt(elements[1]), parseInt(elements[2]), parseInt(elements[3]));

    console.log(bounds)
    osd.viewport.fitBounds(bounds, true);

    this.osdHighlights(boundaries, name, pid)
  },

  /**
   * Update Journal
   */
  updateUV : function(manifest){

    $('#osd').hide();
    $('#uv').show();

    const data = {
      manifest: manifest,
    };
  
    uv = UV.init("uv", data);
  },


  osdHighlights: function(boundaries, words, pid){

    var highlightedwords = 'https://newspapers.library.wales/json/viewarticlewords/llgc-id:' + pid;

    $.getJSON(boundaries, function(data) {

      // This variable will contain all the article areas
      $.each(data, function(index, value) {
          // Setup the basic article container
          article = {
              id: value.id,
              blocks: []
          };

          // Populate the article instance with region boundaries
          $.each(value.textBlocks, function(index, region) {
              article.blocks.push(region);

              // This element will highlight a single block of an article.
              var element = $('<div>');
              element.addClass('article-segment');
              element.attr('article-part', article.id);

              // Attach a hover effect script
              element.hover(function() {
                  $('[article-part="' + $(this).attr('article-part') + '"]').addClass('hover');
              }, function() {
                  $('[article-part="' + $(this).attr('article-part') + '"]').removeClass('hover');
              });

              element.mouseup(function(event) {
                  $('[data-actuator*="' + $(this).attr('article-part') + '"]').click();
              });

              // Add the overview to OSD using the above region coordinates and dimensions.
              osd.addOverlay(element[0], new OpenSeadragon.Rect(region.x, region.y, region.w, region.h));
          });
          // articles[article.id] = article;

          // Load the word highlighting for each article in sequence.
          if (words.length > 0) {
              $.getJSON(highlightedwords + '/' + article.id + '/' + words, function(data) {
                  $.each(data, function(index, region) {
                      var element = document.createElement('div');
                      element.className = 'highlight-segment';
                      osd.addOverlay(element, new OpenSeadragon.Rect(region.x, region.y, region.w, region.h));
                  });
              });
          }
      });

      // OSD doesn't seem to register the overviews quickly enough, give it some time.
      // setTimeout(scanForArticles, 100);
    });
  },

  manifestRequest : function(url) {

    var res = [];

    $.ajax({
      url: url,
      async: false,
      dataType: 'json',
      success: function (json) {
        res = json;
      }
    });

    return res;
  }
}