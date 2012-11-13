<?php
   session_start();

   header('Content-type: application/json');

   require_once '../db.php';

   $response = array('valid' => false);

   if (!isset($_POST['user']) || !isset($_POST['hash'])) {
      $response['error'] = 'params';
   } elseif (isset($_SESSION['userId'])) {
      // If already loged in, throw an error.
      $response['error'] = 'relog';
   } else {
      $error = '';
      if (attemptLogin(mongoUserSanitize($_POST['user']),
                       mongoHexSanitize($_POST['hash']), $error)) {
         $response['valid'] = true;
      } else {
         // Return the same error for bad pass as no user
         //$response['error'] = $error;
         $response['error'] = 'badcombo';
      }
   }

   echo(json_encode($response));
?>
