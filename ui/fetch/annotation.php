<?php
   // There may be a bug in IE(... lol) that would require the next two lines.
   //header('Cache-Control: no-cache, must-revalidate');
   //header('Expires: Mon, 26 Jul 1997 05:00:00 GMT');

   // JSON plz.
   header('Content-type: application/json');

   //error_reporting(E_ALL);
   //ini_set('display_errors', '1');

   // Send a test annotation.
   $nucleotides = ['A', 'C', 'G', 'T'];
   $dna = [];
   for ($i = 0; $i <= 10000; $i++) {
      $dna[] = $nucleotides[rand(0, 3)];
   }

   $rtn = array('sequence' => join('', $dna));
   echo json_encode($rtn);
?>
