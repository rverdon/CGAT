<?php session_start() ?>

<html>
   <head>
      <link rel='stylesheet' type='text/css' media='screen' href='style/style.css' />
      <script src='js/jquery-1.8.2.js'></script>
      <script src='js/script.js' type='text/javascript'></script>
      <title>CGAT Assign A Task</title>
   </head>
   <body>
      <div id='page'>
         <?php
            $title = 'Assign Task';
            require('header.php');
         ?>

         <div id='content' class='top-level-area'>
            <h1>Assign a task</h1>
            <p>Assign a task to a group and/or set of individuals</p>
         </div>

         <?php
            require('footer.php');
         ?>
      </div>
   </body>
</html>
