<?php
   header('Content-type: application/json');

   require_once '../db.php';
   require_once '../functions.php';

   $user = array();

   if (!isset($_GET['user'])) {
      $user['valid'] = false;
   } else {
      $user = getExpandedProfile($_GET['user']);

      if ($user) {
         // TODO(eriq): This sucks. When we host somewhere on a default port, we can use our own image.
         $user['profilePic'] = getGravatar($user['meta']['email'], 200, 'http://i47.tinypic.com/wo26c.png');
         $user['valid'] = true;
      } else {
         $user['valid'] = false;
      }
   }

   echo json_encode($user);
?>
