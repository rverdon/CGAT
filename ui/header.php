<?php
   /**
    * require this at he beginning of you file and call makeHeader() to
    * gen a proper header.
    * This will take care of the <head> and the top bar.
    * This will also session_start().
    *
    * The complement for this for the footer is just doing require_once('footer.php');
    * The footer is more simple because it does not need to do any extra css/js includes.
    *
    * To get extra js/css included, use the two optional parameters to makeHeader().
    *
    * makeHeader() will also take all of the GET paraeters and store them inside window.params.
    *
    * makeHeader() will also put session information (userName and userId) into window.cgatSession.
    *
    * makeHeader() will leave <html>, <body>, and <#page> open.
    */

/**
 * All js is relative to the /js dir and css is relative to the /style dir.
 */
session_start();

function makeHeader($title = 'CGAT', $subtitle = '', $extraCSS = array(), $extraJS = array()) {
   $allJS = array_merge(array('jquery-1.8.2.js', 'script.js'), $extraJS);
   $allCSS = array_merge(array('style.css'), $extraCSS);

   $fullTitle = $title;
   if ($subtitle != '') {
      $fullTitle .= ' | ' . $subtitle;
   }

   echo "<html><head>";

   foreach ($allCSS as $key => $file) {
      echo "<link rel='stylesheet' type='text/css' media='screen' href='/style/" . $file . "' />";
   }

   foreach ($allJS as $key => $file) {
      echo "<script src='/js/" . $file . "'></script>";
   }

   echo "<title>" . $fullTitle . "</title>";

   // Load all the params.
   echo "<script> window.params = JSON.parse('" . json_encode($_GET) . "'); </script>";

   echo "<script>
         window.cgatTitle = {};
         window.cgatTitle.title = '" . $title . "';
         window.cgatTitle.subtitle = '" . $subtitle . "';";

   // Store session info.
   if (isset($_SESSION['userId'])) {
      echo "window.cgatSession = {};
            window.cgatSession.userName = '" . $_SESSION['userName'] . "';
            window.cgatSession.userId = '" . $_SESSION['userId'] . "';
            </script>";
   } else {
      echo "</script>";
   }

   echo "</head><body>";
   echo "<div id='header' class='top-level-area'>
            <a class='logo-link' href='/'>
               <img src='/images/logo.png' alt='GCAT'></img>
            </a>
            <div id='top-title'>";

   echo "<h1 id='top-title-text'>" . $title . "</h1>";
   echo "<h3 id='top-subtitle-text'>" . $subtitle . "</h3>";

   echo "</div>
         <div id='top-nav' class='nav'>
            <ul>";
   if (isset($_SESSION['userId'])) {
      echo("<li><a href='/profile'>" . $_SESSION['userName'] . "'s Profile</a></li>
            <li><a href='/search'>Search</a></li>
            <li><a href='/administration'>Administration</a></li>
            <li><a class='logout-link' onclick='logout();'>Logout</a></li>
            ");
   } else {
      echo("<li><a href='/login'>Login / Register</a></li>
            <li><a href='/search'>Search</a></li>
            ");
   }

   echo "      </ul>
            </div>
         </div>";
}
?>
