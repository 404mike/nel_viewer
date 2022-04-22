// Viewer nav
var viewerNav = [];
var manifests = [];

manifest = {

  /**
   * init
   */
  init : function(){
  },

  /**
   * Load Top level manifest
   */
  loadMainManifest : function(url){

    // get manifest
    response = this.manifestRequest(url);

    // send data to parseCollection()
    this.parseCollection(response);

    // output data
    this.navigationListPeople();
  },

  /**
   * Loop through all the items in the top level manifest
   */
  parseCollection : function(data){
    var _this = this;

    // loop through each person
    $.each(data.items , function(k, v){
      _this.parsePerson(v.id);
    });
      // parse person data to parsePerson()
  },

  /**
   * Loop through
   */
  parsePerson : function(person){
    // get manifest for this person
    var response = this.manifestRequest(person);

    // parse manifest for this person loadPersonManifest()
    this.loadPersonManifest(response);
  },

  /**
   * Parse collection in person level manifest
   */
  loadPersonManifest : function(data){

    var _this = this;

    var person = data.label.en[0]

    var arr = [];
    // loop through items in person manifest
    $.each(data.items, function(k, v){
      var type = v.label.en[0];
      // console.log('Type ' + type)

      if(type == 'Journal articles') {
        res = _this.loadManifest(v);
        arr.push({
          'type' : 'collection',
          'collection_type' : 'journals',
          'data' : res
        });
      }
      if(type == 'Newspaper articles') {
        res = _this.loadManifest(v);
        arr.push({
          'type' : 'collection',
          'collection_type' : 'newspaper',
          'data' : res
        });
      }
      if(type == 'Works') {}
    });

    viewerNav.push({
      'type' : 'collection',
      'person' : person,
      'id' : _this.create_id_from_name(person),
      'data' : arr
    });

  },

  create_id_from_name : function(name){
    name = name.replace(/\s/g, '_');
    name = name.replace(/[^a-z0-9]|\s+|\r?\n|\r/gmi, "");
    name = name.toLowerCase();
    return name;
  },

  /**
   * Parse Newspaper and Journal type manifests
   */
  loadManifest : function(data){
    // get manifest data
    var response = this.manifestRequest(data.id);

    var arr = [];

    // loop items
    $.each(response.items, function(k, v){
      arr.push({
        'label': v.label.en[0],
        'id' : v.id
      })
    }); 

    return arr;
  },

  /**
   * Parse works by person
   */
  loadWorksManifest : function(){},


  /**
   * Request manifest URL
   * @param {string} url 
   */
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
  },

  navigationListPeople : function(){
    console.log('render')
    _this = this;

    // loop each person

    $.each(viewerNav , function(k, v){
      
      var personId = v.id;

      $('#nav_level_1').append('<li class="person" id="' + personId + '">' + v.person + '</li>')
      
      // loop each data
      _this.navigationListPersonCollections(personId, v);

      $('#'+personId).bind("click", function(){
        console.log('test')
        console.log(this.id)
        $('#collections_'+personId).slideToggle();
      });

      // $('.manifests').bind("click", function(e){
      //   console.log(this.id)
      //   // console.log($(this).data("id"))
      //   e.preventDefault();
      // });



    });
  },

  navigationListPersonCollections : function(personId, data){

    _this = this;

    $('#' + personId).append('<ul class="person_collections" id="collections_'+personId+'"></ul>');

    $.each(data.data, function(k, v){
      $('#collections_'+personId).append('<li class="person_collections_list" id="'+v.collection_type+'_'+personId+'">'+v.collection_type+'</li>');
      _this.navigationListPersonCollectionsManifests(v.data, v.collection_type, personId);
    });
  },

  navigationListPersonCollectionsManifests : function(data, collection_type, personId){

    $('#'+collection_type + '_' + personId).append('<ul id="manifest_'+collection_type+'_'+personId+'"></ul>');

    $.each(data, function(k, v){

      id = v.id.replace(/[^a-z0-9]|\s+|\r?\n|\r/gmi, "");
      id = "manifest_" + id;
      str = '<li id="'+id+'" class="manifests" data-id="'+v.id+'">'+v.label+'</li>';
      
      $('#'+'manifest_'+collection_type+'_'+personId).append(str);

      $('#'+id).bind("click", function(e){
        console.log($(this).data('id'))
        e.preventDefault();
        return false;
      })

    });

  }
}
