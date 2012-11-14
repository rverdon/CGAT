<?php
   require_once('header.php');
   makeHeader('CGAT', 'Administration',
              array(),
              array('administration.js'));
?>

<div id='content' class='top-level-area'>

   <div id='join-group' class='second-level-area'>
      <h2 onclick='toggleCollapse("join-group-collapse-button", "join-group-area");'>
         <div class='collapse-button' id='join-group-collapse-button'></div>
         Join A Group
      </h2>
      <div id='join-group-area' class='collapsing-area'>
         <a name='join-group'></a>
         <select id='join-group-select'>
            <option value=''>Existing Groups</option>
         </select>
         <button id='join-group-button' onclick='joinGroup();'>Join Group</button>
      </div>
   </div>

   <div id='create-group' class='second-level-area'>
      <h2 onclick='toggleCollapse("create-group-collapse-button", "create-group-area");'>
         <div class='collapse-button' id='create-group-collapse-button'></div>
         Create A Group
      </h2>
      <div id='create-group-area' class='collapsing-area'>
         <a name='create-group'></a>
      </div>
   </div>

   <div id='assign-task' class='second-level-area'>
      <h2 onclick='toggleCollapse("assign-task-collapse-button", "assign-task-area");'>
         <div class='collapse-button' id='assign-task-collapse-button'></div>
         Assign A Task
      </h2>
      <div id='assign-task-area' class='collapsing-area'>
         <a name='assign-task'></a>
      </div>
   </div>

   <div id='upload-contig' class='second-level-area'>
      <h2 onclick='toggleCollapse("upload-contig-collapse-button", "upload-contig-area");'>
         <div class='collapse-button' id='upload-contig-collapse-button'></div>
         Upload A Contig
      </h2>
      <div id='upload-contig-area' class='collapsing-area'>
         <a name='upload-contig'></a>
      </div>
   </div>


</div>

<?php
   require('footer.php');
?>
