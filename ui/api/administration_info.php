<?php
   session_start();

   // Get things like all the not-joined groups, joined groups,
   // and contigs.

   header('Content-type: application/json');

   require_once '../db.php';

   $response = array();
   $response['valid'] = false;

   if (!isset($_SESSION['userId'])) {
      $response['error'] = 'nouser';
   } else {
      $info = getAdministrationInfo(mongoIdSanitize($_SESSION['userId']));
      if ($info) {
         $response['info'] = $info;
         $response['valid'] = true;
      }
   }

   echo json_encode($response);
?>
