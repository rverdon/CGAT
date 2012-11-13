<?php
   header('Content-type: application/json');

   require_once('../db.php');

   // TODO(eriq): Verify correct user.
   saveAnnotation(annotationDataSanitize($_POST));
?>
