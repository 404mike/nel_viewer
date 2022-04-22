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

  updateOSD : function(manifest){
    
    // osd.destroy()
    json = this.manifestRequest(manifest)
    console.log(json)
    _this = this;

    var urlParts = json.target.id.split("/");
    
    pidHash = urlParts[6]
    pidHashParts = pidHash.split("#")
    pid = pidHashParts[0];
    position = pidHashParts[1];
    console.log(pid)

    mainTileSource = 'https://newspapers.library.wales/iiif/2.0/image/'+pid+'/info.json';

    $('#uv').hide();
    $('#osd').show();

    osd.addTiledImage({
      tileSource: mainTileSource,
      // success: function(){
      //   viewer.world.removeItem(mainTileSource)
      // }
    });

    
    this.loadAnnotation(osd, json);

  },

  loadAnnotation: function(osd, json){
    console.log('load annot')
    var target = json.target.id;
    var coords = target.substring(target.indexOf("xywh=") + 5);
    var elements = coords.split(",");
    var bounds = osd.viewport.imageToViewportRectangle(parseInt(elements[0]), parseInt(elements[1]), parseInt(elements[2]), parseInt(elements[3]));

    console.log(bounds)
    osd.viewport.fitBounds(bounds, true);
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