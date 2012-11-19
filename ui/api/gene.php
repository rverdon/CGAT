<?php
   header('Content-type: application/json');

   require_once '../db.php';

   $response = array();
   $response['valid'] = false;

   if (isset($_GET['name'])) {
      $response['info'] = getFullGeneInfo(mongoUserSanitize($_GET['name']));

      if ($response['info']) {
         $response['valid'] = true;
      }
   }

   echo json_encode($response);
?>
