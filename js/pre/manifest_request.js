// Viewer nav
var viewerNav = [];
var manifests = [];
var peopleArr = {};

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
    $.each(data , function(k, v){
      // console.log(v)
      _this.loadPersonManifest(v);
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

    var person = data.person;
    var personSummary = data.personDescription
    var personImage = data.personImage
    
    var arr = [];
    // loop through items in person manifest
    $.each(data.data, function(k, v){
      var type = v.collection_type;

      // console.log(v)

      if(type == 'journals') {
        res = _this.loadManifest(v.data);
        arr.push({
          'type' : 'collection',
          'collection_type' : 'journals',
          'data' : res
        });
      }
      if(type == 'newspaper') {
        res = _this.loadManifest(v.data);
        arr.push({
          'type' : 'collection',
          'collection_type' : 'newspaper',
          'data' : res
        });
      }
      if(type == 'works') {
        res = _this.loadManifest(v.data);
        arr.push({
          'type' : 'collection',
          'collection_type' : 'works',
          'data' : res
        });
      } 
    });

    viewerNav.push({
      'type' : 'collection',
      'person' : person,
      'summary' : personSummary,
      'image' : personImage,
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
    // console.log(data)
    // var response = this.manifestRequest(data.id);

    var arr = [];

    // loop items
    $.each(data, function(k, v){
      // console.log(v)
      arr.push({
        'label': v.label,
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
    _this = this;

    // loop each person

    $.each(viewerNav , function(k, v){
      
      var personId = v.id;

      $('#nav_level_1').append('<li class="person" id="' + personId + '">' + v.person + '</li>')
      
      // loop each data
      _this.navigationListPersonCollections(personId, v);

      peopleArr[personId] = v;      
    });

    this.setNavigationListPeopleEvents();
  },

  setNavigationListPeopleEvents: function(){
    for(key in peopleArr) {
      this.bindperson(key,peopleArr[key])
    }
  },

  bindperson: function(person,v){

    $('#'+person).bind("click", function(){
      $('#collections_'+person).slideToggle(function(){
        if ($('#collections_'+person).is(':visible'))
        {
          var name = v.person.replace('Collections for ','');

          $('#person_name').html(name);
          $('#person_details').html(v.summary);
      
          if(v.image.length > 0 || v.image != '') {
            $('#person_image').html('<img src="'+v.image+'" />')
          }else{
            $('#person_image').html('')
          }
        }
      });

    });
  },

  navigationListPersonCollections : function(personId, data){

    _this = this;

    var name = data.person.replace('Collections for ','');

    $('#' + personId).append('<ul class="person_collections" id="collections_'+personId+'"></ul>');

    $.each(data.data, function(k, v){

      var id = v.collection_type+'_'+personId;

      $('#collections_'+personId).append('<li class="person_collections_list" id="'+ id +'">'+v.collection_type+'</li>');
      _this.navigationListPersonCollectionsManifests(v.data, v.collection_type, personId, name);

      $('#'+id).bind("click", function(e){
        return false;
      });
    });
  },

  navigationListPersonCollectionsManifests : function(data, collection_type, personId, name){

    $('#'+collection_type + '_' + personId).append('<ul id="manifest_'+collection_type+'_'+personId+'"></ul>');

    $.each(data, function(k, v){

      id = v.id.replace(/[^a-z0-9]|\s+|\r?\n|\r/gmi, "");
      id = "manifest_" + id + "_" + personId;
      str = '<li id="'+id+'" class="manifests" data-person="'+name+'" data-type="'+collection_type+'" data-id="'+v.id+'">'+v.label+'</li>';
      
      $('#'+'manifest_'+collection_type+'_'+personId).append(str);

      $('#'+id).bind("click", function(e){

        var type = $(this).data('type');
        var id = $(this).data('id');
        if(type == 'journals') viewer.updateUV(id);
        if(type == 'newspaper') viewer.updateOSD(id, name);
        if(type == 'works') viewer.updateUV(id);

        e.preventDefault();
        return false;
      })

    });

  }
}
