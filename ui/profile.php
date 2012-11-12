<html>
   <head>
      <link rel='stylesheet' type='text/css' media='screen' href='style/style.css' />
      <link rel='stylesheet' type='text/css' media='screen' href='style/profile.css' />
      <script src='js/jquery-1.8.2.js'></script>
      <script src='js/script.js' type='text/javascript'></script>
      <script src='js/profile.js' type='text/javascript'></script>
      <title>Profile Home</title>
      <script>
         // TODO(eriq): Should this be here, or in js
         window.params = {};
         window.params.user = '<?php echo $_GET['user']; ?>';
      </script>
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
               <div id='profile-user-pic-area'>
                  <img id='profile-user-pic' src='images/defaultProfile.png'></img>
               </div>
               <div id='profile-user-stats'>
                  <h2 id='stats-level'></h2>
                  <h2 id='stats-exp'></h2>
               </div>
               <div id='profile-user-info-area'>
                  <h2 id='profile-user-full-name'></h2>
                  <h2 id='profile-user-name'></h2>
                  <h2 id='profile-user-email'></h2>
                  <h2 id='profile-user-last-login'></h2>
               </div>
            </div>

            <div id='notifications' class='second-level-area'>
               <h2 onclick='toggleCollapse("notifications-collapse-button", "notifications-area");'>
                  <div class='collapse-button' id='notifications-collapse-button'></div>
                  Notifications
               </h2>
               <div id='notifications-area' class='collapsing-area'></div>
            </div>

            <div id='partials' class='second-level-area'>
               <h2 onclick='toggleCollapse("partials-collapse-button", "partials-area");'>
                  <div class='collapse-button' id='partials-collapse-button'></div>
                  Working Annotations
                  </h2>
               <div id='partials-area' class='collapsing-area'></div>
            </div>

            <div id='groups' class='second-level-area'>
               <h2 onclick='toggleCollapse("groups-collapse-button", "groups-area");'>
                  <div class='collapse-button' id='groups-collapse-button'></div>
                  Groups
                  </h2>
               <div id='groups-area' class='collapsing-area'>
                  <div id='groups-inset' class='second-level-inset'></div>
               </div>
            </div>

            <div id='recents' class='second-level-area'>
               <h2 onclick='toggleCollapse("recents-collapse-button", "recents-area");'>
                  <div class='collapse-button' id='recents-collapse-button'></div>
                  History
               </h2>
               <div id='recents-area' class='collapsing-area'></div>
            </div>
         </div>

         <?php
            require('footer.php');
         ?>
      </div>
   </body>
</html>
