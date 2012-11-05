<?php

function getGravatar($email, $size, $defaultImage) {
   $rtn = 'http://www.gravatar.com/avatar/' .
          md5(strtolower(trim($email))) .
          "?s=$size" .
          "&d=" . urlencode($defaultImage) .
          "&r=pg";
   error_log($rtn);
   return $rtn;
}

?>
