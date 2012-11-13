<?php
   session_start();
   $_SESSION = array();
   session_destroy();

   header('Content-type: application/json');

   $response = array('valid' => true);

   echo(json_encode($response));
?>
