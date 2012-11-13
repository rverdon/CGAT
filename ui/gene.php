<?php session_start() ?>

<html>
   <head>
      <link rel='stylesheet' type='text/css' media='screen' href='style/style.css' />
      <script src='js/jquery-1.8.2.js'></script>
      <script src='js/script.js' type='text/javascript'></script>
      <title>CGAT Gene</title>
   </head>
   <body>
      <div id='page'>
         <?php
            $title = 'Search';
            require('header.php');
         ?>

         <div id='content' class='top-level-area'>
            <h1>Gene</h1>
            <p>Get details on a specific gene: colabs, groups working on it, annotation</p>
            <p>Might need a possible rename to 'Isoform'</p>
         </div>

         <?php
            require('footer.php');
         ?>
      </div>
   </body>
</html>
