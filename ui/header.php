<?php
   /**
    * This is the header for the page (the top area with the logo and nav.
    * If you want a title to be displayed, you will need to sed the $title
    *  varible prior to require'ing this.
    */
?>

<div id='header' class='top-level-area'>
   <a class='logo-link' href='/'>
      <img src='images/logo.png' alt='GCAT'>
      </img>
   </a>
   <div id='top-title'>
      <?php
         if (isset($title)) {
            echo "<h1 id='top-title-text'>" . $title . "</h1>";
         } else {
            echo "<h1 id='top-title-text'>CGAT</h1>";
         }

         if (isset($subTitle)) {
            echo "<h3 id='top-subtitle-text'>" . $subTitle . "</h3>";
         } else {
            echo "<h3 id='top-subtitle-text'>CGAT</h3>";
         }
      ?>
   </div>
   <div id='top-nav' class='nav'>
      <ul>
         <?php
            // TODO(eriq): Reference root in these link will break while on test vhosts.
            if (isset($_SESSION['userId'])) {
               echo("<li><a href='profile'>" . $_SESSION['userName'] . "'s Profile</a></li>");
            } else {
               echo("<li><a href='login'>Login / Register</a></li>");
            }
         ?>
         <li><a href='upload'>Upload A Contig</a></li>
         <li><a href='assign'>Assign A Task</a></li>
         <li><a href='search'>Search</a></li>

         <?php
            if (isset($_SESSION['userId'])) {
               echo("<li><a class='logout-link' onclick='logout();'>Logout</a></li>");
            }
         ?>
      </ul>
   </div>
</div>
