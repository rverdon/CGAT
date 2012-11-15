<?php
   // You get automatic membership in created group.

   session_start();

   require_once '../db.php';

   if (!isset($_POST['groupName']) || !isset($_POST['groupDescription'])) {
      die('group name and desc must be present');
      return;
   }

   // Require that someone is logged in first.
   if (!isset($_SESSION['userId'])) {
      die('Not logged in');
      return;
   }

   createGroup(mongoIdSanitize($_SESSION['userId']),
               mongoUserSanitize($_SESSION['userName']),
               mongoGroupSanitize($_POST['groupName']),
               mongoTextSanitize($_POST['groupDescription']));
?>
