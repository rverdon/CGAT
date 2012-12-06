<?php

// Nothing should enter any method in this file unless it has been sanitized.

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
   if (strlen($clean) != 24) {
      die('Id is not 24 bits');
      return null;
   }
   return $clean;
}

// TODO(eriq): implement
function mongoEmailSanitize($val) {
   return $val;
}

// Sanitize a value for use as a user name.
// TODO(eriq): Enforce size restrictions.
function mongoUserSanitize($val) {
   return preg_replace('/\W/', '', $val);
}

// TOOD(eriq): Figure out convention and sanitize
function mongoGroupSanitize($val) {
   return $val;
}

// TOOD(eriq): Figure out convention and sanitize
// A general sanitize for text. Things like desctiptions.
function mongoTextSanitize($val) {
   return $val;
}

function mongoNumberSanitize($val) {
   return intval(preg_replace('/\D/', '', $val));
}

function mongoHexSanitize($val) {
   return preg_replace('/[^a-fA-F0-9]/', '', $val);
}

// Seqeunces are long, but simple.
function mongoSequenceSanitize($val) {
   return preg_replace('/[^ATCG]/', '', strtoupper($val));
}

//TODO(eriq): Mongo probably has an html sanitize
function mongoHtmlSanitize($val) {
   return $val;
}

// A general name. Like a group or contig name. Maybe a username?
// TODO(eriq): We need rules!
function mongoNameSanitize($val) {
   return $val;
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

// TODO(eriq): Abandon old notifications.
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

   $db->users->update(array('_id' => new MongoId($userId)), array('$addToSet' => array('incomplete_annotations' => new MongoId($annotationId))));

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

// TODO(eriq): Expire tasks.
function joinGroup($userId, $userName, $groupId) {
   $db = getDB();

   $groupQuery = array('_id' => new MongoId($groupId));
   $groupUpdate = array('$addToSet' => array('users' => array('user_id' => new MongoId($userId),
                                                              'name' => $userName)));
   $db->groups->update($groupQuery, $groupUpdate);

   $joinedGroup = $db->groups->findOne($groupQuery);

   $newTasks = array();
   if (array_key_exists('tasks', $joinedGroup)) {
      $newTasks = $joinedGroup['tasks'];
   }

   $userQuery = array('_id' => new MongoId($userId));
   $userUpdate = array('$addToSet' => array('groups' => new MongoId($groupId),
                                            'tasks' => array('$each' => $newTasks)));
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

// True on login.
// If false (error), $error will be set.
// If login is successfull, then session information will be set.
function attemptLogin($user, $hash, &$error) {
   $db = getDB();

   $userExists = $db->users->findOne(array('meta.user_name' => $user), array('_id' => 1, 'meta' => 1));
   if (!$userExists) {
      $error = 'nouser';
      return false;
   }

   $salt = $userExists['meta']['salt'];
   $fullHash = $userExists['meta']['pass_hash'];
   if (hash('sha512', $salt . $hash) === $fullHash) {
      $db->users->update(array('meta.user_name' => $user),
                         array('$set' => array('meta.last_login' => new MongoDate())));

      // Set session info
      $_SESSION['userId'] = $userExists['_id']->{'$id'};
      $_SESSION['userName'] = $user;

      return true;
   } else {
      $error = 'badpass';
      return false;
   }
}

// TODO(eriq): LOCK this.
// Same semantics as attemptLogin()
function attemptRegistration($user, $hash, $firstName, $lastName, $email, &$error) {
   $db = getDB();

   $nameCheck = $db->users->findOne(array('meta.user_name' => $user));
   if ($nameCheck) {
      $error = 'namenotavailable';
      return false;
   }

   $emailCheck = $db->users->findOne(array('meta.email' => $email));
   if ($emailCheck) {
      $error = 'emailnotavailable';
      return false;
   }

   $salt = bin2hex(openssl_random_pseudo_bytes(32, $strong));
   $finalHash = hash('sha512', $salt . $hash);

   $insert = array('meta' => array('email' => $email,
                                   'user_name' => $user,
                                   'first_name' => $firstName,
                                   'last_name' => $lastName,
                                   'joined' => new MongoDate(),
                                   'last_login' => new MongoDate(),
                                   'role' => 'User',
                                   'exp' => 0,
                                   'level' => 1,
                                   'salt' => $salt,
                                   'pass_hash' => $finalHash));
   $db->users->insert($insert);

   // Set session data
   $_SESSION['userId'] = $insert['_id']->{'$id'};
   $_SESSION['userName'] = $user;

   return true;
}

function getAdministrationInfo($userId) {
   $db = getDB();

   $rtn = array();
   $rtn['in-groups'] = array();
   $rtn['out-groups'] = array();

   $inGroupIds = $db->users->findOne(array('_id' => new MongoId($userId)), array('groups' => 1))['groups'];
   // Reverse the hash for quick id lookup and when the name is found, hash the name to the id.
   $inGroupNames = array();
   foreach ($inGroupIds as $inGroupId) {
      $inGroupNames[$inGroupId->{'$id'}] = '';
   }

   $cursor = $db->groups->find(array(),
                               array('created' => 1, 'description' => 1, 'name' => 1));
   foreach ($cursor as $group) {
      if (array_key_exists($group['_id']->{'$id'}, $inGroupNames)) {
         $rtn['in-groups'][] = $group;
      } else {
         $rtn['out-groups'][] = $group;
      }
   }

   $rtn['contigs'] = array();
   $cursor = $db->contigs->find(array(), array('meta' => 1));
   foreach ($cursor as $doc) {
      $rtn['contigs'][] = $doc;
   }

   return $rtn;
}

function createGroup($userId, $userName, $groupName, $description) {
   $db = getDB();

   $insert = array('created' => new MongoDate(),
                   'description' => $description,
                   'name' => $groupName);
   $db->groups->insert($insert);
   joinGroup($userId, $userName, $insert['_id']->{'$id'});
}

// Groups should already be an array of MongoIds
function assignTask($userId, $userName, $groups, $description, $contigId, $endDateEpoch) {
   $db = getDB();

   $query = array('groups' => array('$in' => $groups));
   $update = array('$push' => array('tasks' => array('_id' => new MongoId(),
                                                     'desc' => $description,
                                                     'contig_id' => new MongoId($contigId),
                                                     'end_date' => new MongoDate($endDateEpoch))));

   $db->users->update($query, $update, array('multiple' => true));

   // Update the actual group
   $groupQuery = array('_id' => array('$in' => $groups));
   $db->groups->update($query, $update, array('multiple' => true));
}

function setHelpPage($userId, $pageName, $pageTitle, $pageHTML) {
   $db = getDB();
   $query = array('_id' => $pageName);
   $update = array('_id' => $pageName,
                   'html' => $pageHTML,
                   'title' => $pageTitle);

   $db->help_pages->update($query, $update, array('upsert' => true));

   return true;
}

function getFullHelpInfo($helpPageName) {
   $db = getDB();
   return $db->help_pages->findOne(array('_id' => $helpPageName));
}

function getFullContigInfo($contigId) {
   $db = getDB();

   $rtn = array();

   $rtn['contig'] = $db->contigs->findOne(array('_id' => new MongoId($contigId)),
                                          array('sequence' => 0));

   // Expand the annotations of this contig.
   // Note that expert annotations should also be expanded there and they can just be referenced later.
   $expandedAnnotations = array();
   foreach ($rtn['contig']['isoform_names'] as $geneName => $ids) {
      $expandedAnnotations[$geneName] = array();

      foreach ($ids as $id) {
         $expandedAnnotations[$geneName][$id->{'$id'}] = getAnnotation($id->{'$id'});
      }
   }
   $rtn['expandedAnnotations'] = $expandedAnnotations;

   return $rtn;
}

function getFullGeneInfo($geneName) {
   $db = getDB();

   $rtn = array();

   $rtn['annotations'] = array();
   $rtn['expertAannotations'] = array();
   $rtn['contigs'] = array();

   $annotationsToExpand = array();

   $cursor = $db->contigs->find(array(('isoform_names.' . $geneName) => array('$exists' => true)),
                                array('sequence' => 0));

   foreach ($cursor as $contig) {
      $rtn['contigs'][] = $contig;

      foreach ($contig['isoform_names'][$geneName] as $annotationId) {
         $annotationsToExpand[] = $annotationId->{'$id'};
      }
   }

   foreach ($annotationsToExpand as $annotationId) {
      $annotationInfo = getAnnotation($annotationId);

      if (!$annotationInfo['partial']) {
         if ($annotationInfo['expert']) {
            $rtn['expertAnnotations'][] = $annotationInfo;
         } else {
            $rtn['annotations'][] = $annotationInfo;
         }
      }
   }

   return $rtn;
}

function insertContig($userId, $userName, $name, $source, $species, $difficulty, $sequence) {
   $db = getDB();

   $insert = array('expert_annotations' => array(),
                   'isoform_names' => array(),
                   'meta' => array('name' => $name,
                                   'difficulty' => $difficulty,
                                   'source' => $source,
                                   'species' => $species,
                                   'status' => 'active',
                                   'uploader' => new MongoId($userId),
                                   'uploader_name' => $userName,
                                   'upload_date' => new MongoDate()),
                   'sequence' => $sequence);
   $db->contigs->insert($insert);
}

?>
