<html>
   <head>
      <link rel='stylesheet' type='text/css' media='screen' href='style/style.css' />
      <script src='js/jquery-1.8.2.js'></script>
      <script src='js/script.js' type='text/javascript'></script>
      <title>CGAT Home</title>
   </head>
   <body>
      <div id='page'>
         <?php
            $title = 'CGAT Home';
            require('header.php');
         ?>

         <div id='content' class='top-level-area'>
            <a href='annotation.php'>Sample Annotation</a>
            <br />
            <a href='home.php'>Sample Profile Home</a>
         </div>

         <?php
            require('footer.php');
         ?>
      </div>
   </body>
</html>
