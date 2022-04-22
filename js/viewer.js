viewer = {

  /**
   * init
   */
  init : function(){
    _this.loadOSD();
    _this.loadUV();
  },

  /**
   * 
   */
  loadOSD : function(){
  },

  /**
   * 
   */
  loadUV : function(){
  },

  updateOSD : function(){
    
    $('#uv').hide();
    $('#osd').show();

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
  }
}