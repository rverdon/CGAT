<?php
   header('Content-type: application/json');

   require_once '../db.php';

   $group = array();
   $group['valid'] = false;

   if (isset($_GET['id'])) {
      $group = getFullGroupInfo(mongoUserSanitize($_GET['id']));

      if ($group) {
         $group['valid'] = true;
      }
   }

   echo json_encode($group);
?>
