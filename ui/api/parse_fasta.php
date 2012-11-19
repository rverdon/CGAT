<?php
   // TODO(eriq): Enforce size restrictions.

   // This will be interpreted in an iframe, so mark full HTML.
   session_start();

   require_once '../db.php';

   $response = array();
   $response['valid'] = false;

   if ($_FILES["file"]["error"] > 0) {
      $response['error'] = $_FILES["file"]["error"];
   } else {
      /*
      $response['name'] = $_FILES["file"]["name"];
      $response['type'] = $_FILES["file"]["type"];
      $response['size'] = $_FILES["file"]["size"];
      $response['tempName'] = $_FILES["file"]["tmp_name"];
      */

      $content = file($_FILES["file"]["tmp_name"], FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
      if ($content) {
         $response['contigName'] = preg_replace('/^\>/', '', array_shift($content));
         $response['sequence'] = join($content);
         $response['valid'] = true;
      }
   }
?>

<html>
   <head>
      <script>
         window.cgatFasta = JSON.parse('<?php echo json_encode($response); ?>');
      </script>
   </head>
   <body>
   </body>
</html>
