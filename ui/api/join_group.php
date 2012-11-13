<?php
   session_start();

   require_once '../db.php';

   if (!isset($_POST['group'])) {
      die('group must be present');
      return;
   }

   if (!isset($_SESSION['userId'])) {
      die('Not logged in');
      return;
   }

   joinGroup(mongoIdSanitize($_SESSION['userId']),
             mongoUserSanitize($_SESSION['userName']),
             mongoIdSanitize($_POST['group']));
?>
