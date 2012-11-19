<?php
   /**
    * This will close <#page>, <body>, and <html>
    */
?>

<div id='footer' class='top-level-area'>
   <div id='bottom-nav' class='nav'>
      <ul>
         <li><a href='/'>Home</a></li>
         <?php
            if (isset($_SESSION['userId'])) {
               echo "<li><a href='/profile'>" . $_SESSION['userName'] . "'s Profile</a></li>
                     <li><a href='/search'>Search</a></li>
                     <li><a href='/administration'>Administration</a></li>
                     <li><a class='logout-link' onclick='logout();'>Logout</a></li>
                     ";
            } else {
               echo "<li><a href='/login'>Login / Register</a></li>
                     <li><a href='/search'>Search</a></li>
                     ";
            }
         ?>
      </ul>
   </div>
   <div id='colophon'>
      <p>Copyright 2012 Cal Poly</p>
   </div>
</div>

</div><!-- #page -->
</body>
</html>
