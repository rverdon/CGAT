<?php
   header('Content-type: application/json');

   require_once '../db.php';

   if (!isset($_POST['user']) || !isset($_POST['contig'])) {
      die('user and contig must be present');
   }
   $annotationId = createAnnotation(mongoIdSanitize($_POST['user']),
                                    mongoIdSanitize($_POST['contig']));

   if (!$annotationId) {
      echo json_encode(array('valid' => false));
   } else {
      echo json_encode(array('valid' => true, 'annotationId' => $annotationId));
   }
?>
