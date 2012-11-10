<?php

function getDB() {
   $username = 'cgat';
   $password = 'ILoveData580';

   $mongo = new Mongo("mongodb://${username}:${password}@localhost/cgat");
   return $mongo->cgat;
}

function getAnnotation($id) {
   $db = getDB();
   $annotations = $db->annotations;

   $query = array("_id" => new MongoId($id));
   return $annotations->findOne($query);
}

function getContig($id) {
   $db = getDB();
   $contigs = $db->contigs;

   $query = array("_id" => new MongoId($id));
   return $contigs->findOne($query);
}

?>
