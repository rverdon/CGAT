<?php
   require_once('../db.php');

   // TODO(eriq): Verify that the is in fact logged in.
   if (!isset($_POST['id']) || !isset($_POST['user'])) {
      die('Notification ID and User ID were not specified');
   }

   removeNotification(mongoIdSanitize($_POST['user']), mongoIdSanitize($_POST['id']));
?>
