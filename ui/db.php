<?php

// TODO(eriq): There are no specs for gene name, so we cannot sanitize it!
// Sanitize the data that comes in for saving/submitting an annotation.
function annotationDataSanitize($data) {
   $cleanData = array();

   $cleanData['annotationId'] = mongoIdSanitize($data['annotationId']);
   $cleanData['start'] = intval(preg_replace('/\D/', '', $data['start']));
   $cleanData['end'] = intval(preg_replace('/\D/', '', $data['end']));
   $cleanData['reverseComplement'] = $data['reverseComplement'] === 'true';
   // TODO(eriq): Find out the possibilities.
   $cleanData['geneName'] = $data['geneName'];
   $cleanData['contigId'] = mongoIdSanitize($data['contigId']);
   $cleanData['userId'] = mongoIdSanitize($data['userId']);

   $cleanExons = array();
   if (isset($data['exons'])) {
      foreach ($data['exons'] as $key => $exon) {
         $cleanExons[] = array('start' => intval(preg_replace('/\D/', '', $exon['start'])),
                              'end' => intval(preg_replace('/\D/', '', $exon['end'])));
      }
   }
   $cleanData['exons'] = $cleanExons;

   return $cleanData;
}

// Sanitize a value for use as a mongo id.
function mongoIdSanitize($val) {
   $clean = preg_replace('/[^a-fA-F0-9]/', '', $val);
   return substr($clean, 0, 24);
}

// Sanitize a value for use as a user name.
// TODO(eriq): Enforce size restrictions.
function mongoUserSanitize($val) {
   return preg_replace('/\W/', '', $val);
}

function getDB() {
   $username = 'cgat';
   $password = 'ILoveData580';

   //TEST
   //$mongo = new Mongo("mongodb://${username}:${password}@localhost/cgat_test");
   $mongo = new Mongo("mongodb://${username}:${password}@localhost/cgat_test");

   //TEST
   //return $mongo->cgat;
   return $mongo->cgat_test;
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
   $fields = array('meta.user_name' => 1, 'meta.email' => 1, 'meta.first_name' => 1, 'meta.last_name' => 1,
                   'meta.joined' => 1, 'meta.last_login' => 1, 'meta.level' => 1, 'meta.exp' => 1,
                   'groups' => 1, 'history' => 1, 'tasks' => 1, 'incomplete_annotations' => 1);
   return $users->findOne($query, $fields);
}

// Not the users in the group.
function getGroupInfo($groupId) {
   $db = getDB();
   return $db->groups->findOne(array('_id' => new MongoId($groupId)),
                               array('created' => 1, 'description' => 1, 'name' => 1));
}

function getFullGroupInfo($groupId) {
   $db = getDB();
   return $db->groups->findOne(array('_id' => new MongoId($groupId)));
}

function getExpandedProfile($userName) {
   $profile = getProfile($userName);

   if (!$profile) {
      return null;
   }

   // Expand all the groups to just include the names
   foreach ($profile['groups'] as $key => $groupId) {
      $profile['groups'][$key] = array();
      $profile['groups'][$key]['info'] = getGroupInfo($groupId);
   }

   // Expand all the tasks
   foreach ($profile['tasks'] as $key => $task) {
      $profile['tasks'][$key]['contig_meta'] = getContigMeta($task['contig_id']);
   }

   // Expand all the history
   foreach ($profile['history'] as $key => $annotation) {
      $profile['history'][$key]['annotation_info'] = getAnnotation($annotation['anno_id']);
      $profile['history'][$key]['contig_info'] =
         getContigMeta($profile['history'][$key]['annotation_info']['contig_id']);
   }

   // Expand all the partials
   foreach ($profile['incomplete_annotations'] as $key => $annotationId) {
      $profile['incomplete_annotations'][$key] = array();
      $profile['incomplete_annotations'][$key]['annotation_id'] = $annotationId;
      $profile['incomplete_annotations'][$key]['annotation_info'] = getAnnotation($annotationId);
      $profile['incomplete_annotations'][$key]['contig_info'] =
         getContigMeta($profile['incomplete_annotations'][$key]['annotation_info']['contig_id']);
   }

   return $profile;
}

function removeNotification($userId, $taskId) {
   $db = getDB();
   $users = $db->users;

   $query = array('_id' => new MongoId($userId));
   $update = array('$pull' => array('tasks' => array('_id' => new MongoId($taskId))));
   $users->update($query, $update);
}

function createAnnotation($userId, $contigId) {
   $db = getDB();

   if (!$db->users->findOne(array('_id' => new MongoId($userId))) ||
       !$db->contigs->findOne(array('_id' => new MongoId($contigId)))) {
      error_log("Tried to create an annotation for a non-existant user or contig.");
      return null;
   }

   $insertAnnotation = array("contig_id" => new MongoId($contigId), 'expert' => false,
                             'meta' => array('created' => new MongoDate(), 'last_modified' => new MongoDate()),
                             'partial' => true,
                             'reverse_complement' => false,
                             'user_id' => new MongoId($userId));
   $db->annotations->insert($insertAnnotation);
   $annotationId = $insertAnnotation['_id'];

   $userQuery = array('_id' => new MongoId($userId));
   $userUpdate = array('$addToSet' => array('incomplete_annotations' => $annotationId));

   $db ->users->update($userQuery, $userUpdate);

   return $annotationId;
}

function updateAnnotation($data, $partialStatus) {
   $db = getDB();

   $query = array('_id' => new MongoId($data['annotationId']));
   $update = array('$set' => array('start' => $data['start'],
                                   'end' => $data['end'],
                                   'reverse_complement' => $data['reverseComplement'],
                                   'isoform_name' => $data['geneName'],
                                   'exons' => $data['exons'],
                                   'meta.last_modified' => new MongoDate(),
                                   'partial' => $partialStatus));
   // If this is not a partial (finished), update the final time.
   if (!$partialStatus) {
      $update['$set']['meta.finished'] = new MongoDate();
   }

   $db->annotations->update($query, $update);
}

function removeNotificationGivenContig($userId, $contigId) {
   $db = getDB();
   $users = $db->users;

   $query = array('_id' => new MongoId($userId));
   $update = array('$pull' => array('tasks' => array('contig_id' => new MongoId($contigId))));
   $users->update($query, $update);
}

//TODO
function saveAnnotation($data) {
   $db = getDB();

   // TODO(eriq): Multiple notifications from the same contig is broken.
   // Possibly remove from a user's notifications
   removeNotificationGivenContig($data['userId'], $data['contigId']);

   // Place it in the users imcomplete
   $userQuery = array('_id' => new MongoId($data['userId']));
   $userUpdate = array('$addToSet' => array('incomplete_annotations' => new MongoId($data['annotationId'])));
   $db->users->update($userQuery, $userUpdate);

   // Update annotation
   updateAnnotation($data, true);
}

function submitAnnotation($data) {
   $db = getDB();

   // Possibly remove from a user's notifications
   removeNotificationGivenContig($data['userId'], $data['contigId']);

   // Update the contig first
   $contigQuery = array('_id' => new MongoId($data['contigId']));
   $contigUpdate = array('$push' => array("isoform_name." . $data['geneName'] => new MongoId($data['annotationId'])));
   $db->contigs->update($contigQuery, $contigUpdate);

   // Get the difficulty
   $exp = $db->contigs->findOne($contigQuery, array('meta.difficulty' => 1))['meta']['difficulty'];

   // remove is from the users incomplete, and add it to the users history
   // Update users' exp
   $userQuery = array('_id' => new MongoId($data['userId']));
   $userPull = array('$pull' => array('incomplete_annotations' => new MongoId($data['annotationId'])));
   $userInc = array('$inc' => array('meta.exp' => $exp));
   $userPush = array('$push' => array('history' => array('anno_id' => new MongoId($data['annotationId']),
                                                         'meta' => array('date' => new MongoDate(),
                                                                         'experience_gained' => $exp))));
   $db->users->update($userQuery, $userPull);
   $db->users->update($userQuery, $userInc);
   $db->users->update($userQuery, $userPush);

   // Update annotation
   updateAnnotation($data, false);
}

// Remove |oldName| and add |newName| to the contigs isoform list.
function updateContigIsoformList($contigId, $annotationId, $oldName, $newName) {
   $db = getDB();

   $query = array('_id' => new MongoId($contigId));
   $update = array('$pull' => array("isoform_name.${oldName}" => new MongoId($annotationId)),
                   '$push' => array("isoform_name.${newName}" => new MongoId($annotationId)));
   $db->contigs->update($query, $update);
}

function joinGroup($userId, $userName, $groupId) {
   $db = getDB();

   $groupQuery = array('_id' => new MongoId($groupId));
   $groupUpdate = array('$push' => array('users' => array('user_id' => new MongoId($userId),
                                                          'name' => $userName)));
   $db->groups->update($groupQuery, $groupUpdate);

   $userQuery = array('_id' => new MongoId($userId));
   $userUpdate = array('$push' => array('groups' => new MongoId($groupId)));
   $db->users->update($userQuery, $userUpdate);
}

function leaveGroup($userId, $groupId) {
   $db = getDB();

   $groupQuery = array('_id' => new MongoId($groupId));
   $groupUpdate = array('$pull' => array('users' => array('user_id' => new MongoId($userId))));
   $db->groups->update($groupQuery, $groupUpdate);

   $userQuery = array('_id' => new MongoId($userId));
   $userUpdate = array('$pull' => array('groups' => new MongoId($groupId)));
   $db->users->update($userQuery, $userUpdate);
}

?>
