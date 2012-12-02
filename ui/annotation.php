<?php
   require_once('header.php');
   makeHeader('Annotate', '',
              array('annotation.css', 'jquery-ui.css', 'simple-box.css'),
              array('jquery-ui.js', 'annotation.js', 'simple-box.js', 'bio.js'));
?>

<div id='content' class='top-level-area'>
   <div class='second-level-area'>
      <div class='dna-ruler'>
      </div>
      <div id='top-dna'>
         <div id='top-dna-overlay'></div>
         <div id='dna-selection-draggable' class='draggable ui-widget-content'>
         </div>
      </div>
      <div id='debug-selection-coordinates' class='debug'>
         <span>X: </span><span id='debug-selection-x'>0</span>
         <span>%: </span><span id='debug-selection-percent'>0</span>
      </div>
   </div>

   <div id='annotation-data' class='second-level-area'>
      <h2 onclick='toggleCollapse("annotation-collapse-button", "annotation-data-area");'>
         <div class='collapse-button' id='annotation-collapse-button'></div>
         Annotation Data
      </h2>
      <div id='annotation-data-area' class='collapsing-area'>
         <div id='gene-name-area' class='annotation-data annotation-data-left'>
            <span>Gene Name: </span>
            <select id='annotation-name'>
            </select>
         </div>
         <div class='annotation-data annotation-data-right'>
            <span>Reverse Complement: </span>
            <input type='checkbox' id='annotation-rc' />
         </div>
         <div id='annotation-start-area' class='annotation-data annotation-data-left'>
            <span>Gene Start: </span>
            <input type='number' id='annotation-start' value=0 />
         </div>
         <div id='annotation-end-area' class='annotation-data annotation-data-right'>
            <span>Gene End: </span>
            <input type='number' id='annotation-end' value=0 />
         </div>
         <div class='annotation-data annotation-data-left'>
            <span id='nucleotides-per-window-span'>Nucleotides Per Window: </span>
            <input type='number' id='nucleotides-per-window' />
         </div>
         <div class='annotation-data annotation-data-right'>
         </div>
         <div class='annotation-data annotation-data-left annotation-data-button-area'>
            <button onclick='saveAnnotation();'>Save</button>
         </div>
         <div class='annotation-data annotation-data-right annotation-data-button-area'>
            <button onclick='submitAnnotation();'>Submit</button>
         </div>
      </div>
   </div>

   <div class='gene-diagram-area second-level-area'>
      <h2 onclick='toggleCollapse("gene-diagram-collapse-button", "gene-diagram");'>
         <div class='collapse-button' id='gene-diagram-collapse-button'></div>
         Gene Exon View
      </h2>
      <div id='gene-diagram' class='collapsing-area'></div>
   </div>

   <div class='dna-closeup second-level-area'>
      <h2 onclick='toggleCollapse("standard-collapse-button", "standard-sequence");'>
         <div class='collapse-button collapse-on' id='standard-collapse-button'></div>
         Sequence And Translation
      </h2>
      <div id='standard-sequence' class='sequence-closeup collapsing-area collapse'></div>
   </div>

   <div id='add-exon-area' class='second-level-area'>
      <h2 onclick='toggleCollapse("add-exon-collapse-button", "add-exon-collapse-area");'>
         <div class='collapse-button' id='add-exon-collapse-button'></div>
         Add Exon
      </h2>
      <div id='add-exon-collapse-area' class='collapsing-area'>
         <span id='add-exon-start-span'>Begin: </span>
         <input type='number' id='add-exon-start' value=0 />
         <span>End: </span>
         <input type='number' id='add-exon-end' value=0 />
         <button onclick='addExonFromButton();'>Add Exon</button>
      </div>
   </div>

   <div id='exon-area' class='second-level-area'>
      <h2 onclick='toggleCollapse("exons-collapse-button", "exons");'>
         <div class='collapse-button' id='exons-collapse-button'></div>
         Exons
      </h2>
      <div id='exons' class='collapsing-area'>
      </div>
   </div>
</div>

<?php
   require('footer.php');
?>
