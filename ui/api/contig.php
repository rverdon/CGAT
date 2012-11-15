<?php
   header('Content-type: application/json');

   require_once '../db.php';

   $response = array();
   $response['valid'] = false;

   if (isset($_GET['id'])) {
      $response['info'] = getFullContigInfo(mongoIdSanitize($_GET['id']));

      if ($response['info']) {
         $response['valid'] = true;
      }
   }

   echo json_encode($response);
?>
