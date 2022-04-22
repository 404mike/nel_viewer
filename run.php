<?php

class ParseManifest {

  private $url = "https://404mike.github.io/nel_results/data/manifests/62599b02598a4/full-index.json";

  private $arr = [];

  public function __construct()
  {
    $this->loadMainManifest();
  }

  private function loadMainManifest()
  {
    $data = $this->getManifest($this->url);

    $this->parseCollection($data['items']);

    print_r($this->arr);
  }

  private function parseCollection($data)
  {
    foreach($data as $k => $v) {
      $this->parsePerson($v);
    }
  }

  private function parsePerson($person)
  {
    $data = $this->getManifest($person['id']);

    $this->loadPersonManifest($data);
  }

  private function loadPersonManifest($data)
  {
    $person = $data['label']['en'][0];

    // print_r($data);
    $arr = [];
    foreach($data['items'] as $k => $v) {
      $type = $v['label']['en'][0];
      // echo "$type\n";

      
      if($type == 'Journal articles') {
        $res = $this->loadManifest($v);
        $arr[] = [
          'type' => 'collection', 
          'collection_type' => 'journals',
          'data' => $res
        ];
      }
      if($type == 'Newspaper articles') {
        $res = $this->loadManifest($v);
        $arr[] = [
          'type' => 'collection', 
          'collection_type' => 'newspaper',
          'data' => $res
        ];
      }
      if($type == 'Works') {
        $res = $this->loadWorksManifest($v);
        $arr[] = [
          'type' => 'collection', 
          'collection_type' => 'works',
          'data' => $res
        ];
      }
    }

    $this->arr[] = ['type' => 'collection', 'person' => $person, 'data' => $arr];
  }

  private function loadManifest($newspapers)
  {
    $data = $this->getManifest($newspapers['id']);
    
    $arr = [];

    foreach($data['items'] as $k => $v) {
      $arr[] = ['label' => $v['label']['en'][0], 'id' => $v['id']];
    }

    return $arr;
  }

  private function loadWorksManifest($data)
  {

  }

  private function getManifest($url)
  {
    $json = file_get_contents($url);
    return json_decode($json,true);
  }
}

(new ParseManifest());