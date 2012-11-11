<html>
   <head>
      <link rel='stylesheet' type='text/css' media='screen' href='style/style.css' />
      <script src='js/jquery-1.8.2.js'></script>
      <script src='js/script.js' type='text/javascript'></script>
      <title>CGAT Search</title>
   </head>
   <body>
      <div id='page'>
         <?php
            $title = 'Search';
            require('header.php');
         ?>

         <div id='content' class='top-level-area'>
            <h1>Search</h1>
            <p>Search contigs, groups, annotations, users?</p>
            <p>Gotta have some mad table sorting and filters</p>
         </div>

         <?php
            require('footer.php');
         ?>
      </div>
   </body>
</html>
