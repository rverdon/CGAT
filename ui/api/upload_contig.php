<?php
   session_start();

   require_once '../db.php';

   if (!isset($_POST['name']) || !isset($_POST['source']) ||
       !isset($_POST['difficulty']) || !isset($_POST['species']) ||
       !isset($_POST['sequence'])) {
      die('group name and desc must be present');
      return;
   }

   // Require that someone is logged in first.
   if (!isset($_SESSION['userId'])) {
      die('Not logged in');
      return;
   }

   insertContig(mongoIdSanitize($_SESSION['userId']),
                mongoUserSanitize($_SESSION['userName']),
                mongoNameSanitize($_POST['name']),
                mongoNameSanitize($_POST['source']),
                mongoNameSanitize($_POST['species']),
                mongoNumberSanitize($_POST['difficulty']),
                mongoSequenceSanitize($_POST['sequence']));
?>
