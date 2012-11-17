<?php
   session_start();

   header('Content-type: application/json');

   require_once '../db.php';

   if (!isset($_POST['contig'])) {
      die('user and contig must be present');
      return;
   }

   if (!isset($_SESSION['userId'])) {
      die('Not logged in');
      return;
   }

   $annotationId = createAnnotation(mongoIdSanitize($_SESSION['userId']),
                                    mongoIdSanitize($_POST['contig']));

   if (!$annotationId) {
      echo json_encode(array('valid' => false));
   } else {
      echo json_encode(array('valid' => true, 'annotationId' => $annotationId));
   }
?>
