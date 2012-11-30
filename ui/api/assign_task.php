<?php
   session_start();

   require_once '../db.php';

   if (!isset($_POST['groups']) || !isset($_POST['taskDescription']) ||
       !isset($_POST['contig']) || !isset($_POST['endDate'])) {
      die('proper information not specified');
      return;
   }

   // Require that someone is logged in first.
   if (!isset($_SESSION['userId'])) {
      die('Not logged in');
      return;
   }

   $finalGroups = array();
   foreach ($_POST['groups'] as $group) {
      $finalGroups[] = new MongoId(mongoGroupSanitize($group));
   }

   assignTask(mongoIdSanitize($_SESSION['userId']),
              mongoUserSanitize($_SESSION['userName']),
              $finalGroups,
              mongoTextSanitize($_POST['taskDescription']),
              mongoIdSanitize($_POST['contig']),
              mongoNumberSanitize($_POST['endDate']));
?>
