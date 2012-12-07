<?php
   session_start();

   header('Content-type: application/json');

   require_once '../db.php';

   if (!isset($_POST['pageTitle']) || !isset($_POST['pageName']) ||
       !isset($_POST['pageHTML'])) {
      die('not all paramaters provided');
      return;
   }

   if (!isset($_SESSION['userId'])) {
      die('Not logged in');
      return;
   }

   $retStatus = setHelpPage(mongoIdSanitize($_SESSION['userId']),
                            mongoNameSanitize($_POST['pageName']),
                            mongoNameSanitize($_POST['pageTitle']),
                            mongoHtmlSanitize($_POST['pageHTML']));

   if (!$retStatus) {
      echo json_encode(array('valid' => false));
   } else {
      echo json_encode(array('valid' => true));
   }

?>
