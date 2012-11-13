<?php
   require_once('header.php');
   makeHeader('Group', '', array(), array('group.js'));
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
