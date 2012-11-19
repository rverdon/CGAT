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
         Group Info
      </h2>
      <div id='group-info-area' class='collapsing-area'>
         <span>Group Name: </span><span id='group-name'></span></br>
         <span>Number of Members: </span><span id='group-num-members'></span></br> 
         <span>Group Description: </span><span id='group-desc'></span></br> 
         <span>Created On: </span><span id='group-created'></span>
      </div>
   </div>

   <div id='group-members' class='second-level-area'>
      <h2 onclick='toggleCollapse("group-members-collapse-button", "group-members-area");'>
         <div class='collapse-button' id='group-members-collapse-button'></div>
         Members
      </h2>
      <div id='group-members-area' class='collapsing-area'></div>
   </div>

</div>

<?php
   require('footer.php');
?>
