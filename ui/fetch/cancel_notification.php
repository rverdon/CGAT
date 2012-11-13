<?php
   session_start(); 

   require_once('../db.php');

   if (!isset($_POST['id'])) {
      die('Notification ID not specified');
      return;
   }

   if (!isset($_SESSION['userId'])) {
      die('Not logged in');
      return;
   }

   removeNotification(mongoIdSanitize($_SESSION['userId']), mongoIdSanitize($_POST['id']));
?>
