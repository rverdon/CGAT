<?php
   header('Content-type: application/json');

   require_once '../functions.php';

   // TEST user
   $user = array();
   $user['id'] = 1;
   $user['name'] = 'John';
   $user['email'] = 'abc123poiuytrewq@gmail.com';
   # TODO(eriq): This sucks. When we host somewhere on a default port, we can use our own image.
   $user['profilePic'] = getGravatar($user['email'], 200, 'http://i47.tinypic.com/wo26c.png');
   $user['notifications'] = [1, 2];
   $user['recentAnnotations']= [3, 4];
   $user['partialAnnotations'] = [5, 6];

   echo json_encode($user);
?>
