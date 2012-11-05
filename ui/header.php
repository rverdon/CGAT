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
         <li><a href='login.php'>Login</a> / <a href='register.php'>Register</a></li>
         <li><a href='#'>Something</a></li>
         <li><a href='#'>Something Else</a></li>
         <li><a href='#'>Another Thing</a></li>
      </ul>
   </div>
</div>
