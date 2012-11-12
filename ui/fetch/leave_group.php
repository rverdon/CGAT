<?php
   header('Content-type: application/json');

   require_once '../db.php';

   if (!isset($_POST['user']) || !isset($_POST['group'])) {
      die('user and group must be present');
   }

   leaveGroup(mongoIdSanitize($_POST['user']),
              mongoIdSanitize($_POST['group']));
?>
