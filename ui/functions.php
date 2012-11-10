<?php

function getGravatar($email, $size, $defaultImage) {
   $rtn = 'http://www.gravatar.com/avatar/' .
          md5(strtolower(trim($email))) .
          "?s=$size" .
          "&d=" . urlencode($defaultImage) .
          "&r=pg";
   return $rtn;
}

function randString($length) {
   $chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
   $size = strlen($chars);
   $str = '';
   for($i = 0; $i < $length; $i++) {
      $str .= $chars[rand(0, $size - 1)];
   }

   return $str;
}

?>
