<?php
   session_start();

   header('Content-type: application/json');

   require_once '../db.php';

   $response = array('valid' => false);

   if (!isset($_POST['user']) ||
       !isset($_POST['hash']) ||
       !isset($_POST['firstName']) ||
       !isset($_POST['lastName']) ||
       !isset($_POST['email'])) {
      $response['error'] = 'params';
   } elseif (isset($_SESSION['userId'])) {
      // If already loged in, throw an error.
      $response['error'] = 'relog';
   } else {
      $error = '';
      if (attemptRegistration(mongoUserSanitize($_POST['user']),
                              mongoHexSanitize($_POST['hash']),
                              mongoUserSanitize($_POST['firstName']),
                              mongoUserSanitize($_POST['lastName']),
                              mongoEmailSanitize($_POST['email']),
                              $error)) {
         $response['valid'] = true;
      } else {
         $response['error'] = $error;
      }
   }

   echo(json_encode($response));
?>
