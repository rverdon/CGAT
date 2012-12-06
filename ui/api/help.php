<?php
   header('Content-type: application/json');

   require_once '../db.php';

   $response = array();
   $response['valid'] = false;

   if (isset($_GET['page'])) {
      $response['info'] = getFullHelpInfo(mongoNameSanitize($_GET['page']));

      if ($response['info']) {
         $response['valid'] = true;
      }
   }

   echo json_encode($response);
?>
