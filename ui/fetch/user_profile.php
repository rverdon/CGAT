<?php
   session_start();

   // TODO(eriq): I would prefer if ids were used to fetch profiles, they are easier to sanitize.

   header('Content-type: application/json');

   require_once '../db.php';
   require_once '../functions.php';

   $response = array();

   $userName = null;
   if (isset($_GET['user']) && $_GET['user'] != '') {
      $userName = $_GET['user'];
   } else if (isset($_SESSION['userName'])) {
      $userName = $_SESSION['userName'];
   }

   if (!$userName) {
      $response['valid'] = false;
      $response['error'] = 'nouser';
   } else {
      $response = getExpandedProfile(mongoUserSanitize($userName));

      if ($response) {
         // TODO(eriq): This sucks. When we host somewhere on a default port, we can use our own image.
         $response['profilePic'] = getGravatar($response['meta']['email'], 200, 'http://i47.tinypic.com/wo26c.png');
         $response['valid'] = true;
      } else {
         $response['valid'] = false;
         $response['error'] = 'cantfind';
      }
   }

   echo json_encode($response);
?>
