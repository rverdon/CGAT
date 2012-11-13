<?php session_start() ?>

<html>
   <head>
      <link rel='stylesheet' type='text/css' media='screen' href='style/style.css' />
      <script src='js/jquery-1.8.2.js'></script>
      <script src='js/script.js' type='text/javascript'></script>
      <script src='js/group.js' type='text/javascript'></script>
      <title>Group</title>
   </head>
   <body>
      <div id='page'>
         <?php
            $title = 'Group';
            require('header.php');
         ?>

         <div id='content' class='top-level-area'>

            <button id='join-leave-button' class='second-level-area second-level-button full-second-level-button'>
            </button>

            <div id='group-info' class='second-level-area'>
               <h2 onclick='toggleCollapse("group-info-collapse-button", "group-info-area");'>
                  <div class='collapse-button' id='group-info-collapse-button'></div>
                  Notifications
               </h2>
               <div id='group-info-area' class='collapsing-area'></div>
            </div>

         </div>

         <?php
            require('footer.php');
         ?>
      </div>
   </body>
</html>
