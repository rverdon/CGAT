<?php session_start() ?>

<html>
   <head>
      <link rel='stylesheet' type='text/css' media='screen' href='style/style.css' />
      <script src='js/jquery-1.8.2.js'></script>
      <script src='js/script.js' type='text/javascript'></script>
      <title>CGAT View Annotation</title>
   </head>
   <body>
      <div id='page'>
         <?php
            $title = 'View Annotation';
            require('header.php');
         ?>

         <div id='content' class='top-level-area'>
            <h1>View Annotation</h1>
            <p>This page will be for viewing a specific annotation</p>
         </div>

         <?php
            require('footer.php');
         ?>
      </div>
   </body>
</html>
