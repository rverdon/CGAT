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

function getContig($id, $fields = array()) {
   $db = getDB();
   $contigs = $db->contigs;

   $query = array("_id" => new MongoId($id));
   return $contigs->findOne($query, $fields);
}

function getContigMeta($id) {
   return getContig($id, array('meta' => 1));
}

function getProfile($userName) {
   $db = getDB();
   $users = $db->users;

   $query = array("meta.user_name" => $userName);
   $fields = array('meta.email' => 1, 'meta.first_name' => 1, 'meta.last_name' => 1,
                   'meta.joined' => 1, 'meta.last_login' => 1, 'meta.level' => 1,
                   'groups' => 1, 'history' => 1, 'tasks' => 1, 'incomplete_annotations' => 1);
   return $users->findOne($query, $fields);
}

function getExpandedProfile($userName) {
   $profile = getProfile($userName);

   if (!$profile) {
      return null;
   }

   // Expand all the tasks
   foreach ($profile['tasks'] as $key => $task) {
      $profile['tasks'][$key]['contig_meta'] = getContigMeta($task['contig_id']);
   }

   // Expand all the history
   foreach ($profile['history'] as $key => $annotation) {
      $profile['history'][$key]['annotation_info'] = getAnnotation($annotation['anno_id']);
   }

   // Expand all the partials
   foreach ($profile['incomplete_annotations'] as $key => $annotationId) {
      $profile['incomplete_annotations'][$key]['annotation_info'] = getAnnotation($annotationId);
   }

   return $profile;
}

?>
