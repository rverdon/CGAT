<?php
   require_once('header.php');
   makeHeader('CGAT Contig', '',
              array(),
              array('contig.js'));
?>

<div id='content' class='top-level-area'>

   <div id='contig-info' class='second-level-area'>
      <h2 onclick='toggleCollapse("contig-info-collapse-button", "contig-info-area");'>
         <div class='collapse-button' id='contig-info-collapse-button'></div>
         Contig Info
      </h2>
      <div id='contig-info-area' class='collapsing-area'>
         TODO
      </div>
   </div>

   <div id='expert-annotations' class='second-level-area'>
      <h2 onclick='toggleCollapse("expert-annotations-collapse-button", "expert-annotations-area");'>
         <div class='collapse-button collapse-on' id='expert-annotations-collapse-button'></div>
         Expert Annotations
      </h2>
      <div id='expert-annotations-area' class='collapsing-area collapse'>
         TODO
      </div>
   </div>

   <div id='annotations' class='second-level-area'>
      <h2 onclick='toggleCollapse("annotations-collapse-button", "annotations-area");'>
         <div class='collapse-button collapse-on' id='annotations-collapse-button'></div>
         All Annotations
      </h2>
      <div id='annotations-area' class='collapsing-area collapse'>
         TODO
      </div>
   </div>

   <div id='genes' class='second-level-area'>
      <h2 onclick='toggleCollapse("genes-collapse-button", "genes-area");'>
         <div class='collapse-button collapse-on' id='genes-collapse-button'></div>
         Associated Genes
      </h2>
      <div id='genes-area' class='collapsing-area collapse'>
         TODO
      </div>
   </div>

</div>

<?php
   require('footer.php');
?>
