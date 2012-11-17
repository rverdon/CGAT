<?php
   require_once('header.php');
   makeHeader('CGAT', 'Search');
?>

<div id='content' class='top-level-area'>

   <div id='contig' class='second-level-area'>
      <h2 onclick='toggleCollapse("contig-collapse-button", "contig-area");'>
         <div class='collapse-button collapse-on' id='contig-collapse-button'></div>
         Search For Contig
      </h2>
      <div id='contig-area' class='collapsing-area collapse'>
         TODO
      </div>
   </div>

   <div id='gene' class='second-level-area'>
      <h2 onclick='toggleCollapse("gene-collapse-button", "gene-area");'>
         <div class='collapse-button collapse-on' id='gene-collapse-button'></div>
         Search For Gene
      </h2>
      <div id='gene-area' class='collapsing-area collapse'>
         TODO
      </div>
   </div>

   <div id='user' class='second-level-area'>
      <h2 onclick='toggleCollapse("user-collapse-button", "user-area");'>
         <div class='collapse-button collapse-on' id='user-collapse-button'></div>
         Search For User
      </h2>
      <div id='user-area' class='collapsing-area collapse'>
         TODO
      </div>
   </div>

   <div id='group' class='second-level-area'>
      <h2 onclick='toggleCollapse("group-collapse-button", "group-area");'>
         <div class='collapse-button collapse-on' id='group-collapse-button'></div>
         Search For User
      </h2>
      <div id='group-area' class='collapsing-area collapse'>
         TODO
      </div>
   </div>

   <div id='annotation' class='second-level-area'>
      <h2 onclick='toggleCollapse("annotation-collapse-button", "annotation-area");'>
         <div class='collapse-button collapse-on' id='annotation-collapse-button'></div>
         Search For Annotation
      </h2>
      <div id='annotation-area' class='collapsing-area collapse'>
         TODO
      </div>
   </div>

</div>

<?php
   require('footer.php');
?>
