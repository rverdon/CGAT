<html>
   <head>
      <link rel='stylesheet' type='text/css' media='screen' href='style/style.css' />
      <script src='js/jquery-1.8.2.js'></script>
      <script src='js/script.js' type='text/javascript'></script>
      <title>Profile Home</title>
   </head>
   <body>
      <div id='page'>
         <?php
            // TODO(eriq): Set with user's name.
            $title = 'Profile Home';
            require('header.php');
         ?>

         <div id='content' class='top-level-area'>
            <div id='bio-info'>
            </div>

            <div id='notifications' class='second-level-area'>
               <h2 onclick='toggleCollapse("notifications-collapse-button", "notifications-area");'>Notifications <div class='collapse-button' id='notifications-collapse-button'></div></h2>
               <div id='notifications-area'>
                  TEST
               </div>
            </div>

            <div id='partials' class='second-level-area'>
               <h2 onclick='toggleCollapse("partials-collapse-button", "partials-area");'>Working Annotations <div class='collapse-button' id='partials-collapse-button'></div></h2>
               <div id='partials-area'>
                  TEST
               </div>
            </div>

            <div id='recents' class='second-level-area'>
               <h2 onclick='toggleCollapse("recents-collapse-button", "recents-area");'>Recent Submissions <div class='collapse-button' id='recents-collapse-button'></div></h2>
               <div id='recents-area'>
                  TEST
               </div>
            </div>
         </div>

         <?php
            require('footer.php');
         ?>
      </div>
   </body>
</html>
