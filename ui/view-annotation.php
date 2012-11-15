<?php
   require_once('header.php');
   makeHeader('CGAT Annotation', '',
              array(),
              array('view-annotation.js'));
?>

<div id='content' class='top-level-area'>

   <div id='annotation-info' class='second-level-area'>
      <h2 onclick='toggleCollapse("annotation-info-collapse-button", "annotation-info-area");'>
         <div class='collapse-button' id='annotation-info-collapse-button'></div>
         Annotation Info
      </h2>
      <div id='annotation-info-area' class='collapsing-area'>
         TODO
      </div>
   </div>

   <div id='exons' class='second-level-area'>
      <h2 onclick='toggleCollapse("exons-collapse-button", "exons-area");'>
         <div class='collapse-button collapse-on' id='exons-collapse-button'></div>
         Exons
      </h2>
      <div id='exons-area' class='collapsing-area collapse'>
         TODO
      </div>
   </div>

   <div id='contig-info' class='second-level-area'>
      <h2 onclick='toggleCollapse("contig-info-collapse-button", "contig-info-area");'>
         <div class='collapse-button collapse-on' id='contig-info-collapse-button'></div>
         Contig Info
      </h2>
      <div id='contig-info-area' class='collapsing-area collapse'>
         TODO
      </div>
   </div>

</div>

<?php
   require('footer.php');
?>
