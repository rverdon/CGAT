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
      </div>
   </div>

   <div id='exons' class='second-level-area'>
      <h2 onclick='toggleCollapse("exons-collapse-button", "exons-area");'>
         <div class='collapse-button' id='exons-collapse-button'></div>
         Exons
      </h2>
      <div id='exons-area' class='collapsing-area'>
         <div id='exons-inset' class='second-level-inset'></div>
      </div>
   </div>

   <div id='contig-info' class='second-level-area'>
      <h2 onclick='toggleCollapse("contig-info-collapse-button", "contig-info-area");'>
         <div class='collapse-button' id='contig-info-collapse-button'></div>
         Contig Info
      </h2>
      <div id='contig-info-area' class='collapsing-area'>
      </div>
   </div>

</div>

<?php
   require('footer.php');
?>
