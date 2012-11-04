<html>
   <head>
      <link rel='stylesheet' type='text/css' media='screen' href='style/style.css' />
      <link rel='stylesheet' href='style/jquery-ui.css' />

      <script src='js/jquery-1.8.2.js'></script>
      <script src='js/jquery-ui.js'></script>

      <script src='js/sample_dna.js' type='text/javascript'></script>
      <script src='js/script.js' type='text/javascript'></script>
   </head>
   <body>
      <div id='page'>
         <div class='dna-viewer'>
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
            <div class='dna-closeups'>
               <div class='closeup-dna'>
                  <h2 onclick='toggleCollapse("standard-collapse-button", "standard-sequence");'>Sequence <div class='collapse-button' id='standard-collapse-button'></div></h2>
                  <div id='standard-sequence' class='sequence-closeup'>
                  </div>
                  <h2 onclick='toggleCollapse("rc-collapse-button", "rc-sequence");'>Reverse Compliment <div class='collapse-button collapse-on' id='rc-collapse-button'></div></h2>
                  <div id='rc-sequence' class='sequence-closeup collapse'>
                  </div>
               </div>
            </div>
         </div><!-- dna-viewer -->
         <div id='add-exon-area'>
            <h2 onclick='toggleCollapse("add-exon-collapse-button", "add-exon-collapse-area");'>Add Exon <div class='collapse-button' id='add-exon-collapse-button'></div></h2>
            <div id='add-exon-collapse-area'>
               <span>Start: </span>
               <input type='number' id='add-exon-start' value=0 />
               <span>End: </span>
               <input type='number' id='add-exon-end' value=0 />
               <span>Reverse Compliment: </span>
               <input type='checkbox' id='add-exon-rc' \>
               <button onclick='addExonFromButton();'>Add Exon</button>
            </div>
         </div>
         <div id='exon-area'>
            <h2 onclick='toggleCollapse("exons-collapse-button", "exons");'>Exons <div class='collapse-button' id='exons-collapse-button'></div></h2>
            <div id='exons'>
            </div>
         </div>
      </div>
   </body>
</html>
