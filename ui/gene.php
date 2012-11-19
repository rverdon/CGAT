<?php
   require_once('header.php');
   makeHeader('CGAT Gene', '',
              array(),
              array('gene.js'));
?>

<div id='content' class='top-level-area'>

   <div id='contigs' class='second-level-area'>
      <h2 onclick='toggleCollapse("contigs-collapse-button", "contigs-area");'>
         <div class='collapse-button' id='contigs-collapse-button'></div>
         Contigs Information
      </h2>
      <div id='contigs-area' class='collapsing-area'>
      </div>
   </div>

   <div id='collab' class='second-level-area'>
      <h2 onclick='toggleCollapse("collab-collapse-button", "collab-area");'>
         <div class='collapse-button collapse-on' id='collab-collapse-button'></div>
         Collaborative Annotaion
      </h2>
      <div id='collab-area' class='collapsing-area collapse'>
         TODO
      </div>
   </div>

   <div id='annotations' class='second-level-area'>
      <h2 onclick='toggleCollapse("annotations-collapse-button", "annotations-area");'>
         <div class='collapse-button collapse-on' id='annotations-collapse-button'></div>
         Completed Annotations
      </h2>
      <div id='annotations-area' class='collapsing-area collapse'>
         <div id='annitations-inset' class='second-level-inset'></div>
      </div>
   </div>

</div>

<?php
   require('footer.php');
?>
