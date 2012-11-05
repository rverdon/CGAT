<html>
   <head>
      <link rel='stylesheet' type='text/css' media='screen' href='style/style.css' />
      <link rel='stylesheet' type='text/css' media='screen' href='style/annotation.css' />
      <link rel='stylesheet' href='style/jquery-ui.css' />
      <script src='js/jquery-1.8.2.js'></script>
      <script src='js/jquery-ui.js'></script>
      <script src='js/script.js' type='text/javascript'></script>
      <script src='js/annotation.js' type='text/javascript'></script>
      <title>Annotate</title>
   </head>
   <body>

      <div id='page'>
         <?php
            $title = 'Annotate';
            require('header.php');
         ?>

         <div id='content' class='top-level-area'>
            <div class='second-level-area'>
               <div class='dna-ruler'>
               </div>
               <div class='top-dna'>
                  <div id='dna-selection-draggable' class='draggable ui-widget-content'>
                  </div>
               </div>
               <div id='debug-selection-coordinates' class='debug'>
                  <span>X: </span><span id='debug-selection-x'>0</span>
                  <span>%: </span><span id='debug-selection-percent'>0</span>
               </div>
            </div>

            <div id='annotation-data' class='second-level-area'>
               <h2 onclick='toggleCollapse("annotation-collapse-button", "annotation-data-area");'>Annotation Data <div class='collapse-button' id='annotation-collapse-button'></div></h2>
               <div id='annotation-data-area'>
                  <div class='annotation-data annotation-data-left'>
                     <span>Gene Name: </span>
                     <input type='text' id='annotation-name' />
                  </div>
                  <div class='annotation-data annotation-data-right'>
                     <span>Reverse Complement: </span>
                     <input type='checkbox' id='annotation-rc' />
                  </div>
                  <div class='annotation-data annotation-data-left'>
                     <span>Start: </span>
                     <input type='number' id='annotation-start' value=0 />
                  </div>
                  <div class='annotation-data annotation-data-right'>
                     <span>End: </span>
                     <input type='number' id='annotation-end' value=0 />
                  </div>
                  <div class='annotation-data annotation-data-left'>
                     <span>Nucleotides Per Window: </span>
                     <input type='number' id='nucleotides-per-window' />
                  </div>
               </div>
            </div>

            <div class='dna-closeup second-level-area'>
               <h2 onclick='toggleCollapse("standard-collapse-button", "standard-sequence");'>Sequence <div class='collapse-button' id='standard-collapse-button'></div></h2>
               <div id='standard-sequence' class='sequence-closeup'></div>
            </div>

            <div id='add-exon-area' class='second-level-area'>
               <h2 onclick='toggleCollapse("add-exon-collapse-button", "add-exon-collapse-area");'>Add Exon <div class='collapse-button' id='add-exon-collapse-button'></div></h2>
               <div id='add-exon-collapse-area'>
                  <span>Start: </span>
                  <input type='number' id='add-exon-start' value=0 />
                  <span>End: </span>
                  <input type='number' id='add-exon-end' value=0 />
                  <button onclick='addExonFromButton();'>Add Exon</button>
               </div>
            </div>

            <div id='exon-area' class='second-level-area'>
               <h2 onclick='toggleCollapse("exons-collapse-button", "exons");'>Exons <div class='collapse-button' id='exons-collapse-button'></div></h2>
               <div id='exons'>
               </div>
            </div>
         </div>

         <?php
            require('footer.php');
         ?>
      </div>
   </body>
</html>
