<?php
   // There may be a bug in IE(... lol) that would require the next two lines.
   //header('Cache-Control: no-cache, must-revalidate');
   //header('Expires: Mon, 26 Jul 1997 05:00:00 GMT');

   // JSON plz.
   header('Content-type: application/json');

   //error_reporting(E_ALL);
   //ini_set('display_errors', '1');

   require_once('../db.php');

   $rtn = array();

   if (isset($_GET['id'])) {
      $rtn['annotation'] = getAnnotation(mongoIdSanitize($_GET['id']));
      $rtn['contig'] = getContig($rtn['annotation']['contig_id']);
      $rtn['valid'] = $rtn['annotation'] && $rtn['contig'];
   } else {
      $rtn['valid'] = false;
   }

   echo json_encode($rtn);
?>
