mainTileSource = '';
articles = [];

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
    // console.log(json)
    // console.log("Name click " + name)
    _this = this;

    var urlParts = json.target.id.split("/");
    // console.log(urlParts)
    
    pidHash = urlParts[6]
    pidHashParts = pidHash.split("#")
    pid = pidHashParts[0];
    position = pidHashParts[1];
    

    mainTileSource = 'https://newspapers.library.wales/iiif/2.0/image/'+pid+'/info.json';
    console.log(mainTileSource)

    $('#uv').hide();
    $('#osd').show();

    osd.open(mainTileSource)
    // osd.addTiledImage({
    //   tileSource: mainTileSource
    // });

    var boundaries = 'https://newspapers.library.wales/json/viewarticledata/llgc-id%3A' + pid;

    setTimeout(function(){
      _this.loadAnnotation(osd, json, boundaries, name, pid);
      _this.panToArticle(manifest);
    },1000)
  },

  panToArticle: function(manifest) {
    // console.log(manifest)
    var manifestUrlparts = manifest.split('/');
    var articleParts = manifestUrlparts[8].split('-');
    var pid = articleParts[2];
    var art = parseInt(articleParts[1].replace('modsarticle',''))
    // art = art + 1;
    art = 'ART'+ art
    
    var url = 'https://newspapers.library.wales/json/viewarticledata/llgc-id%3A' + pid;

    json = this.manifestRequest(url)

    var blocks = [];

    $.each(json, function(k, v){
      var id = v['id'];

      if(id == art) {
        // console.log(v)
        blocks.push(v['textBlocks'])
      }
    });

    this.snapToArticle(blocks)
  },

  snapToArticle: function (blocks) {
    blocks = blocks[0]

    var chunks = [];
    $.each(blocks, function(k,v){
      chunks.push({
        'x': v['x'],
        'y': v['y'],
        'h': v['h'],
        'w': v['w']
      });
    });
    // console.log(chunks)
    var startX = 99;
    var startY = 99;
    var finalX = 0;
    var finalY = 0;

    for (i = 0; i < chunks.length; i++) {
        if (chunks[i].x < startX) {
            startX = chunks[i].x;
        }
        if (chunks[i].y < startY) {
            startY = chunks[i].y;
        }

        if (chunks[i].w > finalX) {
            finalX = chunks[i].w;
        }
        if (chunks[i].h > finalY) {
            finalY = chunks[i].h;
        }
    }

    // console.log('LOOOK')
    // console.log(startX + ' ' + startY + ' ' + finalX + ' ' +  finalY)
    // Add some padding the the article area
    region = new OpenSeadragon.Rect(startX - 0.01, startY - 0.01, finalX + 0.02, finalY + 0.02);
    osd.viewport.fitBounds(region);
  },

  loadAnnotation: function(osd, json, boundaries, name, pid){
    // console.log('load annot')
    // var target = json.target.id;
    // var coords = target.substring(target.indexOf("xywh=") + 5);
    // var elements = coords.split(",");
    // var bounds = osd.viewport.imageToViewportRectangle(parseInt(elements[0]), parseInt(elements[1]), parseInt(elements[2]), parseInt(elements[3]));

    // console.log(bounds)
    // osd.viewport.fitBounds(bounds, true);

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

    // clear any existing overlays
    $('.highlight-segment').each(function(){
      var id = this.id
      osd.removeOverlay(id)
    });

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
          articles[article.id] = article;

          // Load the word highlighting for each article in sequence.
          if (words.length > 0) {
              $.getJSON(highlightedwords + '/' + article.id + '/' + words, function(data) {
                  $.each(data, function(index, region) {
                      var element = document.createElement('div');
                      element.className = 'highlight-segment';
                      element.id = 'highlight-segment-'+index;
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
      },
      error: function(e) {
        console.log('couldnt load')
        console.log(e)
      }
    });

    return res;
  }
}