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
               echo("<li><a href='/profile'>" . $_SESSION['userName'] . "'s Profile</a></li>");
            } else {
               echo "<li><a href='/login'>Login / Register</a></li>";
            }
         ?>
         <li><a href='/upload'>Upload A Contig</a></li>
         <li><a href='/assign'>Assign A Task</a></li>
         <li><a href='/search'>Search</a></li>
         <?php
            if (isset($_SESSION['userId'])) {
               echo("<li><a class='logout-link' onclick='logout();'>Logout</a></li>");
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
