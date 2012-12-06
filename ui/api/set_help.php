<?php
   session_start();

   header('Content-type: application/json');

   require_once '../db.php';

   /*if (!isset($_POST['pageName'])) {
      die('user and page must be present');
      return;
   }

   if (!isset($_SESSION['userId'])) {
      die('Not logged in');
      return;
   }*/
   
   //$retStatus = createHelp('', '', '', '');
/*mongoIdSanitize($_SESSION['userId'])*/
//mongoIdSanitize($_POST['pageName'])
//mongoIdSanitize($_POST['pageTitle'])
//mongoIdSanitize($_POST['pageHTML'])
   $retStatus = setHelpPage('', $_POST['pageName'], $_POST['pageTitle'], $_POST['pageHTML']);

   if (!$retStatus) {
      echo json_encode(array('valid' => false));
   } else {
      echo json_encode(array('valid' => true));
   }
   
?>
